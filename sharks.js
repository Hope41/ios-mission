'use strict'

class Shark extends Base {
    constructor(x, y) {
        super(x, y)

        this.speed_x = 0
        this.speed_y = 0
        this.swim = 0

        this.dir = 1
        this.flipSpeed = 0
        this.air = false

        this.do_kill = 0
    }

    kill() {
        if (!this.do_kill) {
            pound.play()
            puff(this.x, this.y, this.w, this.h, 10, 1, [1, 1, 1, .5], .015, .01, [-.1, .1], [-.05, .05])
            cam.boom(20, .3, .3)
        }
        this.do_kill += dt

        this.alpha -= .3 * dt
        if (this.alpha < 0) {
            this.dead = true
            this.applyToCells()
        }
    }

    recovery() {
        if (!this.recover.timer) {
            cam.boom(10, .2, .2)
            pound.play()
        }
        this.recover.timer += dt

        if (this.recover.timer % 5 > 2) this.alpha = 0
        else this.alpha = 1

        if (this.recover.timer > this.recover.last) {
            this.alpha = 1
            this.recover.timer = 0
        }
    }

    flip(speed) {
        this.flipSpeed = speed
        this.dir += speed * dt

        if (this.dir >= 1) {
            this.dir = 1
            this.flipSpeed = 0
        }
        if (this.dir <= -1) {
            this.dir = -1
            this.flipSpeed = 0
        }
    }

    collision() {
        const arr = this.collisionSetUp()

        const speed = {x: this.speed_x, y: this.speed_y}

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                const block = mapItem(obj.x, obj.y)

                if (block[SOLID]) {
                    const overlap = mapMerge(this, obj, speed.x, speed.y)
    
                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0

                        if (!this.angry.state && !this.flipSpeed && !this.angry.fatal)
                            this.flip(FLIP_SPEED * -Math.sign(this.dir))
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                    }
                }
                else if (block[AIR]) {
                    this.speed_y += .01
                    this.air = true
                }
            }
        }
    }

    mines() {
        // kill shark if touching exploded mine
        if (game.activeMine != false) {
            if (collide(this, game.activeMine[0])) {
                this.kill()
                this.recover.timer = 0
            }
        }
    }

    update() {
        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.speed_x *= Math.pow(this.momentum, dt)
        this.speed_y *= Math.pow(this.momentum, dt)
    }
}

class ChestShark extends Shark {
    constructor(x, y, chest) {
        super(x, y)

        this.damage = .12

        this.speed = .001
        this.angrySpeed = random(.0003, .0005, 0)
        this.momentum = random(.97, .995, 0)

        // how loyal can you really be to a treasure chest?
        this.loyalty = .0002

        this.chest = chest

        this.w = SHARK_W + 2
        this.h = SHARK_H + .2
        this.x = x
        this.y = y - this.h

        this.shark = {
            x: this.x + this.w / 2 - SHARK_W / 2,
            y: this.y + this.h / 2 - SHARK_H / 2,
            w: SHARK_W,
            h: SHARK_H
        }
        this.origin = {x: this.shark.x + this.shark.w / 2, y: this.shark.y + this.shark.h / 2}

        this.x_dir = {timer: 0}
        this.y_dir = {amt: 0, timer: 0}

        this.angry = {
            state: false,
            range: 4,
            lim: 8,
            fatal: false
        }
        this.angry.giveUp = () => {
            this.angry.state = false
            this.y_dir.timer = 50
        }

        this.recover = {
            timer: 0,
            last: 40
        }

        this.defineCoins(10, 15)
        this.applyToCells()
    }
    
    control() {
        this.flip(this.flipSpeed)

        // ANGRY

        // dist from chest and hero
        const chest_hero_x = (hero.box.x + hero.box.w / 2) - (this.chest.x + this.chest.w / 2)
        const chest_hero_y = (hero.box.y + hero.box.h / 2) - (this.chest.y + this.chest.h / 2)

        // dist from shark and hero
        const shark_hero_x = (hero.box.x + hero.box.w / 2) - (this.x + this.w / 2)
        const shark_hero_y = (hero.box.y + hero.box.h / 2) - (this.y + this.h / 2)

        // dist from shark and origin
        const chest_shark_x = this.origin.x - (this.x + this.w / 2)
        const chest_shark_y = this.origin.y - (this.y + this.h / 2)

        // stay angry if fatal is enabled
        if (this.angry.fatal && hero.swim.enabled)
            this.angry.state = true
        // hang around the chest
        else {
            this.speed_x += this.loyalty * chest_shark_x * dt
            this.speed_y += this.loyalty * chest_shark_y * dt
        }

        // only turn if moving fast enough
        if (Math.abs(this.speed_x) > .05)
            this.flip(FLIP_SPEED * Math.sign(this.speed_x))

        // turn angry if you get too close to the chest
        if (Math.abs(chest_hero_x) < this.angry.range &&
            Math.abs(chest_hero_y) < this.angry.range)
            this.angry.state = true

        // chase the hero
        if (this.angry.state) {
            this.speed_x += this.angrySpeed * shark_hero_x * dt
            this.speed_y += this.angrySpeed * shark_hero_y * dt
            
            // give up sequences
            if (hero.do_kill || !hero.swim.enabled || ((
                Math.abs(chest_hero_x) > this.angry.lim * dt ||
                Math.abs(chest_hero_y) > this.angry.lim * dt) && !this.angry.fatal))
                this.angry.giveUp()
        }

        // PEACEFUL
        else if (!this.air) {
            this.speed_x += this.speed * this.dir * dt
            this.speed_y += this.y_dir.amt * dt

            this.x_dir.timer -= dt
            this.y_dir.timer -= dt

            if (this.x_dir.timer < 0) {
                this.flip(FLIP_SPEED * Math.sign(-this.dir))
                this.x_dir.timer = random(150, 250)
            }
            if (this.y_dir.timer < 0) {
                this.y_dir.amt = random(-.0008, .0008, 0)
                this.y_dir.timer = 100
            }
        }

        if (collide(this, hero.box)) {
            // only turn angry if within range
            if (Math.abs(chest_hero_x) <= this.angry.lim &&
                Math.abs(chest_hero_y) <= this.angry.lim)
                this.angry.state = true

            if (hero.offensive) this.recovery()
            else hero.injure(this.damage)
        }
    }

    update() {
        if (this.do_kill) {
            this.kill()
            return
        }
        if (this.recover.timer > 0) {
            this.recovery()
            this.speed_x = 0
            this.speed_y = 0

            this.angry.state = true
            this.angry.fatal = true
            return
        }

        super.update()

        this.swim += (10 * this.speed_x + this.dir) * dt

        // turn fatal if chest is destroyed
        if (this.chest.alpha < 1) this.angry.fatal = true

        this.control()

        this.air = false
        this.collision()
        this.applyToCells()
    }

    draw() {
        this.shark.x = this.x + this.w / 2 - SHARK_W / 2
        this.shark.y = this.y + this.h / 2 - SHARK_H / 2

        const center = this.shark.x + this.shark.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 1.05
        const s = this.shark.h / HAPPY_H

        const SHADE = .07
        const SKIN = rgb(SHADE + .3, SHADE + .3, SHADE + .3, this.alpha)
        const TAIL = rgb(SHADE + .29, SHADE + .295, SHADE + .295, this.alpha)
        const FIN = rgb(SHADE + .26, SHADE + .26, SHADE + .26, this.alpha)
        const WHITE = rgb(.9, .9, .9, this.alpha)
        const BLACK = rgb(0, 0, 0, this.alpha)
        const RED = rgb(.9, .8, .8, this.alpha)

        const JAW_W = .8 * s
        const JAW_H = .35 * s
        const INSET = .3 * s
        const JAW_TOP_W = 1 * s

        const TAIL_TOP_W = .8 * s
        const TAIL_TOP_H = .5 * s
        const TAIL_BOT_W = .4 * s
        const TAIL_BOT_H = .4 * s

        const FIN_X = 1 * s
        const FIN_H = .2 * s
        const FIN_W = .7 * s

        // sharks do NOT have arms. Just thought I'd mention.
        const ARM_X = .558 * s
        const ARM_Y = .722 * s
        const ARM_W = .853 * s
        const ARM_H = .328 * s

        const EYE = .28 * s
        const PUPIL = .1 * s
        const EYE_X = .05 * s
        const EYE_Y = .14 * s
        const EYE_SENSITIVITY = .1

        const TEETH = 2
        const TOOTH_OFT = .1 * s
        const TOOTH_W = .1 * s
        const TOOTH_H = .05 * s
        const TOOTH_GAP = .2 * s

        const LEANNESS = .8 * s

        const BROW_ANG = -.08 * s
        const BROW_W = .3 * s
        const BROW_H = .07 * s
        const BROW_Y = -.05

        const GILL_X = .7 * s
        const GILL_Y = .4 * s
        const GILL_W = .07 * s
        const GILL_H = .3 * s
        const GILL_GAP = .15 * s
        const GILLS = 4 * s

        const BODY_W = this.shark.w * s
        const BODY_H = this.shark.h - JAW_H

        const top_sway = Math.sin(this.swim / 10) * .2
        const bot_sway = Math.sin(this.swim / 6) * .2
        const jaw_sway = .05 + Math.sin(this.swim / 15) * .05
        const head_sway = .08 + Math.sin(this.swim / 20) * .1

        clear()

        // LEANNESS
        ctx.fillStyle = SKIN
        flipRect(this.shark.x, this.shark.y, BODY_W - JAW_W - LEANNESS, BODY_H + JAW_H - LEANNESS / 5)

        // TAIL
        ctx.strokeStyle = TAIL
        rotate(flip(this.shark.x), this.shark.y + TAIL_TOP_H, (-.2 + top_sway) * this.dir)
        rotRect(flip(this.shark.x), this.shark.y, -TAIL_TOP_W * this.dir, TAIL_TOP_H)
        clear()
        rotate(flip(this.shark.x), this.shark.y + TAIL_TOP_H, (.4 - bot_sway) * this.dir)
        rotRect(
            flip(this.shark.x + LEANNESS), this.shark.y + TAIL_TOP_H,
            (-TAIL_BOT_W - LEANNESS) * this.dir, TAIL_BOT_H)
        clear()

        // FIN
        ctx.strokeStyle = FIN
        rotate(flip(this.shark.x + FIN_X), this.shark.y - FIN_H, -.3 * this.dir)
        rotRect(flip(this.shark.x + FIN_X), this.shark.y - FIN_H, FIN_W * this.dir, FIN_H * 2)
        clear()

        // BODY
        flipRect(this.shark.x, this.shark.y, BODY_W - JAW_TOP_W, BODY_H)

        // HEAD
        const head_x = flip(this.shark.x + BODY_W - JAW_TOP_W)
        ctx.strokeStyle = SKIN
        clear()
        rotate(head_x, this.shark.y + BODY_H, (.1 + head_sway) * this.dir)
        rotRect(head_x, this.shark.y, JAW_TOP_W * this.dir, BODY_H)

        // EYE
        const look = (EYE - PUPIL) / 2

        // if (this.angry.state) {
            let dist_x = (hero.box.x + hero.box.w / 2 - head_x + EYE_X) * EYE_SENSITIVITY
            let dist_y = (hero.box.y - this.shark.y + EYE_Y) * EYE_SENSITIVITY

            if (dist_x > look) dist_x = look
            if (dist_x < -look) dist_x = -look
            if (dist_y > look) dist_y = look
            if (dist_y < -look) dist_y = -look
        // }

        ctx.strokeStyle = this.angry.fatal ? RED : WHITE
        rotRect(head_x + EYE_X, this.shark.y + EYE_Y, EYE * this.dir, EYE)

        ctx.strokeStyle = BLACK
        rotRect(
            head_x + EYE_X + dist_x + (look + PUPIL / 2) * this.dir - PUPIL / 2,
            this.shark.y + EYE_Y + dist_y + PUPIL, PUPIL, PUPIL)
        
        // BROW
        rotate(head_x + EYE_X, this.shark.y + EYE_Y + BROW_Y, BROW_ANG * this.dir)
        rotRect(head_x + EYE_X, this.shark.y + EYE_Y + BROW_Y, BROW_W * this.dir, BROW_H)
        clear()

        // JAW
        clear()
        const jaw_x = this.shark.x + BODY_W - JAW_W
        const jaw_y = this.shark.y + BODY_H - JAW_H / 2
        ctx.strokeStyle = SKIN
        rotate(flip(jaw_x - LEANNESS), this.shark.y + BODY_H, (-.25 + jaw_sway) * this.dir)
        rotRect(flip(jaw_x - LEANNESS), jaw_y, (JAW_W - INSET + LEANNESS) * this.dir, JAW_H)

        // TEETH
        ctx.strokeStyle = WHITE
        for (let i = 0; i < TEETH; i ++)
            rotRect(flip(jaw_x + TOOTH_OFT + i * TOOTH_GAP), jaw_y, TOOTH_W * this.dir, -TOOTH_H)
        clear()

        // GILLS
        ctx.fillStyle = FIN
        for (let i = 0; i < GILLS; i ++)
            flipRect(this.shark.x + GILL_X + i * GILL_GAP, this.shark.y + GILL_Y, GILL_W, GILL_H)

        // ARM
        ctx.strokeStyle = FIN
        rotate(flip(this.shark.x + ARM_X + ARM_W), this.shark.y + ARM_Y - ARM_H / 2, (.3 + top_sway) * this.dir)
        rotRect(flip(this.shark.x + ARM_X), this.shark.y + ARM_Y - ARM_H / 2, ARM_W * this.dir, ARM_H)

        clear()
    }
}

class BadShark extends Shark {
    constructor(x, y) {
        super(x, y)

        this.damage = .12
        this.speed = .004
        this.angrySpeed = random(.0012, .0013, 0)
        this.momentum = .97

        this.w = SHARK_SMALL_W + 2
        this.h = SHARK_SMALL_H + .2
        this.x = x
        this.y = y - this.h

        this.shark = {
            x: this.x + this.w / 2 - SHARK_W / 2,
            y: this.y + this.h / 2 - SHARK_H / 2,
            w: SHARK_W,
            h: SHARK_H
        }

        this.x_dir = {timer: 0}
        this.y_dir = {amt: 0, timer: 0}

        this.swing = random(5, 15, 0)
        this.shade = random(.05, .12, 0)

        this.angry = {
            state: false,
            range: 5
        }

        this.recover = {
            timer: 0,
            last: 40
        }
        this.applyToCells()
    }
    
    control() {
        this.flip(this.flipSpeed)

        // ANGRY

        // dist from shark and hero
        const dis_x = (hero.box.x + hero.box.w / 2) - (this.x + this.w / 2)
        const dis_y = (hero.box.y + hero.box.h / 2) - (this.y + this.h / 2)

        // only turn if moving fast enough
        if (Math.abs(this.speed_x) > .05)
            this.flip(FLIP_SPEED * Math.sign(this.speed_x))

        // chase the hero
        if (this.angry.state) {
            this.speed_x += this.angrySpeed * dis_x * dt
            this.speed_y += this.angrySpeed * dis_y * dt
        }

        // PEACEFUL
        else if (!this.air) {
            this.speed_x += this.speed * this.dir * dt
            this.x_dir.timer -= dt

            if (this.x_dir.timer < 0) {
                this.flip(FLIP_SPEED * Math.sign(-this.dir))
                this.x_dir.timer = random(150, 250)
            }
        }

        // random y
        this.y_dir.timer -= dt
        if (this.y_dir.timer < 0) {
            this.y_dir.amt = random(-.005, .005, 0)
            this.y_dir.timer = 50
        }
        this.speed_y += this.y_dir.amt * dt

        // body collision
        if (collide(this, hero.box)) {
            if (hero.offensive) hero.attack(this)
            else hero.injure(this.damage)
        }

        // anger
        if (Math.abs(dis_x) <= this.angry.range &&
            Math.abs(dis_y) <= this.angry.range)
            this.angry.state = true
        if (!hero.in_water && !hero.in_air)
            this.angry.state = false
    }

    update() {
        super.mines()

        if (this.do_kill) {
            this.kill()
            return
        }
        if (this.recover.timer > 0) {
            this.recovery()
            this.speed_x = 0
            this.speed_y = 0

            this.angry.state = true
            return
        }

        super.update()

        this.swim += (this.swing * this.speed_x + this.dir) * dt

        this.control()

        this.air = false
        this.collision()
        this.applyToCells()
    }

    draw() {
        if (this.alpha <= 0) return

        this.shark.x = this.x + this.w / 2 - SHARK_W / 2
        this.shark.y = this.y + this.h / 2 - SHARK_H / 2

        const center = this.shark.x + this.shark.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 1.05
        const s = this.shark.h / HAPPY_H

        const SHADE = this.shade
        const SKIN = rgb(SHADE + .3, SHADE + .2, SHADE + .2, this.alpha)
        const TAIL = rgb(SHADE + .29, SHADE + .19, SHADE + .19, this.alpha)
        const FIN = rgb(SHADE + .26, SHADE + .16, SHADE + .16, this.alpha)
        const WHITE = rgb(.9, .9, .9, this.alpha)
        const RED = rgb(.9, .8, .8, this.alpha)
        const BLACK = rgb(0, 0, 0, this.alpha)

        const JAW_W = .8 * s
        const JAW_H = .35 * s
        const INSET = .3 * s
        const JAW_TOP_W = 1 * s

        const TAIL_TOP_W = .8 * s
        const TAIL_TOP_H = .5 * s
        const TAIL_BOT_W = .4 * s
        const TAIL_BOT_H = .4 * s

        const FIN_X = 1 * s
        const FIN_H = .2 * s
        const FIN_W = .7 * s

        const ARM_X = .558 * s
        const ARM_Y = .722 * s
        const ARM_W = .853 * s
        const ARM_H = .328 * s

        const EYE = .28 * s
        const PUPIL = .1 * s
        const EYE_X = .05 * s
        const EYE_Y = .14 * s
        const EYE_SENSITIVITY = .1

        const TEETH = 2
        const TOOTH_OFT = .1 * s
        const TOOTH_W = .1 * s
        const TOOTH_H = .05 * s
        const TOOTH_GAP = .2 * s

        const LEANNESS = .8 * s

        const BROW_ANG = -.08 * s
        const BROW_W = .3 * s
        const BROW_H = .07 * s
        const BROW_Y = -.05

        const GILL_X = .7 * s
        const GILL_Y = .4 * s
        const GILL_W = .07 * s
        const GILL_H = .3 * s
        const GILL_GAP = .15 * s
        const GILLS = 4 * s

        const BODY_W = this.shark.w * s
        const BODY_H = this.shark.h - JAW_H

        const top_sway = Math.sin(this.swim / 10) * .2
        const bot_sway = Math.sin(this.swim / 6) * .2
        const jaw_sway = .05 + Math.sin(this.swim / 15) * .05
        const head_sway = .08 + Math.sin(this.swim / 20) * .1

        clear()

        // LEANNESS
        ctx.fillStyle = SKIN
        flipRect(this.shark.x, this.shark.y, BODY_W - JAW_W - LEANNESS, BODY_H + JAW_H - LEANNESS / 5)

        // TAIL
        ctx.strokeStyle = TAIL
        rotate(flip(this.shark.x), this.shark.y + TAIL_TOP_H, (-.2 + top_sway) * this.dir)
        rotRect(flip(this.shark.x), this.shark.y, -TAIL_TOP_W * this.dir, TAIL_TOP_H)
        clear()
        rotate(flip(this.shark.x), this.shark.y + TAIL_TOP_H, (.4 - bot_sway) * this.dir)
        rotRect(
            flip(this.shark.x + LEANNESS), this.shark.y + TAIL_TOP_H,
            (-TAIL_BOT_W - LEANNESS) * this.dir, TAIL_BOT_H)
        clear()

        // FIN
        ctx.strokeStyle = FIN
        rotate(flip(this.shark.x + FIN_X), this.shark.y - FIN_H, -.3 * this.dir)
        rotRect(flip(this.shark.x + FIN_X), this.shark.y - FIN_H, FIN_W * this.dir, FIN_H * 2)
        clear()

        // BODY
        flipRect(this.shark.x, this.shark.y, BODY_W - JAW_TOP_W, BODY_H)

        // HEAD
        const head_x = flip(this.shark.x + BODY_W - JAW_TOP_W)
        ctx.strokeStyle = SKIN
        clear()
        rotate(head_x, this.shark.y + BODY_H, (.1 + head_sway) * this.dir)
        rotRect(head_x, this.shark.y, JAW_TOP_W * this.dir, BODY_H)

        // EYE
        const look = (EYE - PUPIL) / 2

        let dist_x = (hero.box.x + hero.box.w / 2 - head_x + EYE_X) * EYE_SENSITIVITY
        let dist_y = (hero.box.y - this.shark.y + EYE_Y) * EYE_SENSITIVITY

        if (dist_x > look) dist_x = look
        if (dist_x < -look) dist_x = -look
        if (dist_y > look) dist_y = look
        if (dist_y < -look) dist_y = -look

        ctx.strokeStyle = RED
        rotRect(head_x + EYE_X, this.shark.y + EYE_Y, EYE * this.dir, EYE)

        ctx.strokeStyle = BLACK
        rotRect(
            head_x + EYE_X + dist_x + (look + PUPIL / 2) * this.dir - PUPIL / 2,
            this.shark.y + EYE_Y + dist_y + PUPIL, PUPIL, PUPIL)
        
        // BROW
        rotate(head_x + EYE_X, this.shark.y + EYE_Y + BROW_Y, BROW_ANG * this.dir)
        rotRect(head_x + EYE_X, this.shark.y + EYE_Y + BROW_Y, BROW_W * this.dir, BROW_H)
        clear()

        // JAW
        clear()
        const jaw_x = this.shark.x + BODY_W - JAW_W
        const jaw_y = this.shark.y + BODY_H - JAW_H / 2
        ctx.strokeStyle = SKIN
        rotate(flip(jaw_x - LEANNESS), this.shark.y + BODY_H, (-.25 + jaw_sway) * this.dir)
        rotRect(flip(jaw_x - LEANNESS), jaw_y, (JAW_W - INSET + LEANNESS) * this.dir, JAW_H)

        // TEETH
        ctx.strokeStyle = WHITE
        for (let i = 0; i < TEETH; i ++)
            rotRect(flip(jaw_x + TOOTH_OFT + i * TOOTH_GAP), jaw_y, TOOTH_W * this.dir, -TOOTH_H)
        clear()

        // GILLS
        ctx.fillStyle = FIN
        for (let i = 0; i < GILLS; i ++)
            flipRect(this.shark.x + GILL_X + i * GILL_GAP, this.shark.y + GILL_Y, GILL_W, GILL_H)

        // ARM
        ctx.strokeStyle = FIN
        rotate(flip(this.shark.x + ARM_X + ARM_W), this.shark.y + ARM_Y - ARM_H / 2, (.3 + top_sway) * this.dir)
        rotRect(flip(this.shark.x + ARM_X), this.shark.y + ARM_Y - ARM_H / 2, ARM_W * this.dir, ARM_H)

        clear()
    }
}

class MutantShark extends Shark {
    constructor(x, y) {
        super(x, y)

        this.damage = .14
        this.speed = .007
        this.angrySpeed = random(.0062, .0063, 0)
        this.momentum = .92

        this.w = SHARK_SMALL_W + 2
        this.h = SHARK_SMALL_H + .2
        this.x = x
        this.y = y - this.h

        this.shark = {
            x: this.x + this.w / 2 - SHARK_W / 2,
            y: this.y + this.h / 2 - SHARK_H / 2,
            w: SHARK_W,
            h: SHARK_H
        }

        this.x_dir = {timer: 0}
        this.y_dir = {amt: 0, timer: 0}

        this.swing = random(3, 6, 0)
        this.shade = random(.08, .12, 0)

        this.angry = {
            state: false,
            range: 5
        }

        this.recover = {
            timer: 0,
            last: 40
        }
        this.applyToCells()
    }
    
    control() {
        this.flip(this.flipSpeed)

        // ANGRY

        // dist from shark and hero
        const dis_x = (hero.box.x + hero.box.w / 2) - (this.x + this.w / 2)
        const dis_y = (hero.box.y + hero.box.h / 2) - (this.y + this.h / 2)

        // only turn if moving fast enough
        if (Math.abs(this.speed_x) > .02)
            this.flip(FLIP_SPEED * Math.sign(this.speed_x))

        // chase the hero
        if (this.angry.state) {
            this.speed_x += this.angrySpeed * dis_x * dt
            this.speed_y += this.angrySpeed * dis_y * dt

            this.maxSpeed(.2)
        }

        // PEACEFUL
        else if (!this.air) {
            this.speed_x += this.speed * this.dir * dt
            this.x_dir.timer -= dt

            if (this.x_dir.timer < 0) {
                this.flip(FLIP_SPEED * Math.sign(-this.dir))
                this.x_dir.timer = random(150, 250)
            }

            // move slowly and ominously towards hero
            this.speed_x += this.speed * dis_x * .03 * dt
            this.speed_y += this.speed * dis_y * .03 * dt
        }

        // random y
        this.y_dir.timer -= dt
        if (this.y_dir.timer < 0) {
            this.y_dir.amt = random(-.005, .005, 0)
            this.y_dir.timer = 50
        }
        this.speed_y += this.y_dir.amt * dt

        // body collision
        if (collide(this, hero.box)) {
            if (hero.offensive) hero.attack(this)
            else hero.injure(this.damage)
        }

        // anger
        if (Math.abs(dis_x) <= this.angry.range &&
            Math.abs(dis_y) <= this.angry.range)
            this.angry.state = true
        if (!hero.in_water && !hero.in_air)
            this.angry.state = false
    }

    update() {
        super.mines()
        this.maxSpeed()
        this.walls()

        if (this.do_kill) {
            this.kill()
            return
        }
        if (this.recover.timer > 0) {
            this.recovery()
            this.speed_x = 0
            this.speed_y = 0

            this.angry.state = true
            return
        }

        super.update()

        this.swim += (this.swing * this.speed_x + this.dir) * dt

        this.control()

        this.air = false
        this.collision()
        this.applyToCells()
    }

    draw() {
        if (this.alpha <= 0) return

        this.shark.x = this.x + this.w / 2 - SHARK_W / 2
        this.shark.y = this.y + this.h / 2 - SHARK_H / 2

        const center = this.shark.x + this.shark.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 1.05
        const s = this.shark.h / HAPPY_H

        const SHADE = this.shade
        const SKIN = rgb(SHADE + .4, SHADE + .05, SHADE + .05, this.alpha)
        const TAIL = rgb(SHADE + .39, SHADE + .04, SHADE + .04, this.alpha)
        const FIN = rgb(SHADE + .26, SHADE + .06, SHADE + .06, this.alpha)
        const WHITE = rgb(.9, .9, .9, this.alpha)
        const RED = rgb(.9, .8, .8, this.alpha)
        const YELLOW = rgb(.5, .4, 0, this.alpha)

        const JAW_W = .8 * s
        const JAW_H = .35 * s
        const INSET = .3 * s
        const JAW_TOP_W = 1 * s

        const TAIL_TOP_W = .8 * s
        const TAIL_TOP_H = .5 * s
        const TAIL_BOT_W = .4 * s
        const TAIL_BOT_H = .4 * s

        const FIN_X = 1 * s
        const FIN_H = .2 * s
        const FIN_W = .7 * s

        const ARM_X = .558 * s
        const ARM_Y = .722 * s
        const ARM_W = .853 * s
        const ARM_H = .328 * s

        const EYE = .28 * s
        const PUPIL = .07 * s
        const EYE_X = .05 * s
        const EYE_Y = .14 * s

        const TEETH = 2
        const TOOTH_OFT = .1 * s
        const TOOTH_W = .1 * s
        const TOOTH_H = .05 * s
        const TOOTH_GAP = .2 * s

        const LEANNESS = .8 * s

        const GILL_X = .7 * s
        const GILL_Y = .4 * s
        const GILL_W = .07 * s
        const GILL_H = .3 * s
        const GILL_GAP = .17 * s
        const GILLS = 5 * s

        const BODY_W = this.shark.w * s
        const BODY_H = this.shark.h - JAW_H

        const top_sway = Math.sin(this.swim / 10) * .2
        const bot_sway = Math.sin(this.swim / 6) * .2
        const jaw_sway = .05 + Math.sin(this.swim / 15) * .05
        const head_sway = .08 + Math.sin(this.swim / 20) * .1

        clear()

        // LEANNESS
        ctx.fillStyle = SKIN
        flipRect(this.shark.x, this.shark.y, BODY_W - JAW_W - LEANNESS, BODY_H + JAW_H - LEANNESS / 5)

        // TAIL
        ctx.strokeStyle = TAIL
        rotate(flip(this.shark.x), this.shark.y + TAIL_TOP_H, (-.2 + top_sway) * this.dir)
        rotRect(flip(this.shark.x), this.shark.y, -TAIL_TOP_W * this.dir, TAIL_TOP_H)
        clear()
        rotate(flip(this.shark.x), this.shark.y + TAIL_TOP_H, (.4 - bot_sway) * this.dir)
        rotRect(
            flip(this.shark.x + LEANNESS), this.shark.y + TAIL_TOP_H,
            (-TAIL_BOT_W - LEANNESS) * this.dir, TAIL_BOT_H)
        clear()

        // FIN
        ctx.strokeStyle = FIN
        rotate(flip(this.shark.x + FIN_X), this.shark.y - FIN_H, -.3 * this.dir)
        rotRect(flip(this.shark.x + FIN_X), this.shark.y - FIN_H, FIN_W * this.dir, FIN_H * 2)
        clear()

        // BODY
        flipRect(this.shark.x, this.shark.y, BODY_W - JAW_TOP_W, BODY_H)

        // HEAD
        const head_x = flip(this.shark.x + BODY_W - JAW_TOP_W)
        ctx.strokeStyle = SKIN
        clear()
        rotate(head_x, this.shark.y + BODY_H, (.2 + head_sway) * this.dir)
        rotRect(head_x, this.shark.y, JAW_TOP_W * this.dir, BODY_H)

        // EYE
        ctx.strokeStyle = RED
        rotRect(head_x + EYE_X, this.shark.y + EYE_Y, EYE * this.dir, EYE)

        ctx.strokeStyle = YELLOW
        rotRect(
            head_x + EYE_X + (EYE / 2 - PUPIL / 2) * this.dir,
            this.shark.y + EYE_Y + EYE / 2 - PUPIL / 2, PUPIL * this.dir, PUPIL)
        clear()

        // JAW
        clear()
        const jaw_x = this.shark.x + BODY_W - JAW_W
        const jaw_y = this.shark.y + BODY_H - JAW_H / 2
        ctx.strokeStyle = SKIN
        rotate(flip(jaw_x - LEANNESS), this.shark.y + BODY_H, (-.4 + jaw_sway) * this.dir)
        rotRect(flip(jaw_x - LEANNESS), jaw_y, (JAW_W - INSET + LEANNESS) * this.dir, JAW_H)

        // TEETH
        ctx.strokeStyle = WHITE
        for (let i = 0; i < TEETH; i ++)
            rotRect(flip(jaw_x + TOOTH_OFT + i * TOOTH_GAP), jaw_y, TOOTH_W * this.dir, -TOOTH_H)
        clear()

        // GILLS
        ctx.fillStyle = FIN
        for (let i = 0; i < GILLS; i ++)
            flipRect(this.shark.x + GILL_X + i * GILL_GAP, this.shark.y + GILL_Y, GILL_W, GILL_H)

        // ARM
        ctx.strokeStyle = FIN
        rotate(flip(this.shark.x + ARM_X + ARM_W), this.shark.y + ARM_Y - ARM_H / 2, (.3 + top_sway) * this.dir)
        rotRect(flip(this.shark.x + ARM_X), this.shark.y + ARM_Y - ARM_H / 2, ARM_W * this.dir, ARM_H)

        clear()
    }
}