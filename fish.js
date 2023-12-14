'use strict'
class Fish extends Base {
    constructor(x, y) {
        super(x, y)

        this.x = x
        this.y = y

        this.flipSpeed = 0
        this.dir = 1
        if (random(0, 2)) this.dir = -1

        this.speed_x = 0
        this.speed_y = 0
        this.swim = 0
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

    update() {
        this.maxSpeed()
        this.walls()

        if (collide(this, hero.box)) {
            const s = .5

            hero.speed_x += this.speed_x * s
            hero.speed_y += this.speed_y * s
        }

        this.applyToCells()
    }
}

class BlueFish extends Fish {
    constructor(x, y) {
        super(x, y)

        this.w = .7
        this.h = .7

        // normal
        this.speed = random(.0015, .0025, 0)
        // happy
        this.happySpeed = random(.002, .004, 0)
        this.updown = random(.0005, .002, 0)
        this.happyRecover = 0

        this.happy = {
            state: false,
            range: random(2, 4, 0)
        }

        const dull = () => {return random(.2, .4, 0)}
        const pop = () => {return random(.5, .75, 0)}
        this.color = [dull(), dull(), dull()]

        const color = random(0, 6)
        if (color == 0) this.color[0] = pop()
        else if (color == 1) this.color[1] = pop()
        else if (color >= 2) this.color[2] = pop()

        this.applyToCells()
    }

    collision() {
        const arr = this.collisionSetUp()

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                const block = mapItem(obj.x, obj.y)

                if (block[SOLID]) {
                    this.happy.state = false
                    this.happyRecover = random(100, 300, 0)
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)
    
                    if (overlap.x) {
                        this.x -= overlap.x
    
                        this.flip(FLIP_SPEED * -Math.sign(this.dir))
                        this.speed_x *= -.5
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                    }
                }
                else if (block[AIR]) {
                    this.speed_y += .1
                    this.happy.state = false
                }
            }
        }
    }

    update() {
        super.update()
        this.flip(this.flipSpeed)

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.speed_x *= Math.pow(.95, dt)
        this.speed_y *= Math.pow(.95, dt)

        let dist_x = (hero.box.x + hero.box.w / 2) - (this.x + this.w / 2)
        let dist_y = (hero.box.y + hero.box.h / 2) - (this.y + this.h / 2)

        const m = 2
        if (dist_x > m) dist_x = m
        if (dist_x < -m) dist_x = -m
        if (dist_y > m) dist_y = m
        if (dist_y < -m) dist_y = -m

        if (Math.abs(dist_x) < this.happy.range &&
            Math.abs(dist_y) < this.happy.range)
            this.happy.state = true

        this.happyRecover -= dt
        if (this.happy.state && this.happyRecover < 0) {
            let DIR = Math.sign(dist_x)
            if (DIR == 0) DIR = 1
            this.flip(FLIP_SPEED * DIR)

            this.speed_x += dist_x * this.happySpeed * dt
            this.speed_y += dist_y * this.updown * dt
        }
        else this.speed_x += this.dir * this.speed * dt

        this.swim += 10 * this.speed_x * dt

        this.collision()
    }

    draw() {
        const center = this.x + this.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const EYE = .3
        const EYE_GAP = .18
        const FROM_TOP = .18
        const PUPIL = .1
        const TAIL_W = .24
        const TAIL_H = .17
        const TAIL_CENTER = TAIL_H / 2

        // TAIL
        const TAIL_X = flip(this.x)
        const TAIL_Y = this.y + this.h / 2 - TAIL_H / 2
        const ANG = .25 + Math.sin(this.swim) * .2

        ctx.strokeStyle = rgb(
            this.color[0] - .2,
            this.color[1] - .2,
            this.color[2] - .2, this.alpha)
        clear()
        rotate(TAIL_X, TAIL_Y - TAIL_CENTER + TAIL_H, ANG * -this.dir)
        rotRect(TAIL_X, TAIL_Y - TAIL_CENTER, -TAIL_W * this.dir, TAIL_H)
        clear()
        rotate(TAIL_X, TAIL_Y + TAIL_CENTER, ANG * this.dir)
        rotRect(TAIL_X, TAIL_Y + TAIL_CENTER, -TAIL_W * this.dir, TAIL_H)
        clear()

        // BODY
        ctx.fillStyle = rgb(this.color[0], this.color[1], this.color[2], this.alpha)
        flipRect(this.x, this.y, this.w, this.h)

        // EYES
        const EYE_X = this.x + this.w - EYE - EYE_GAP
        const EYE_Y = this.y + FROM_TOP
        ctx.fillStyle = rgb(1, 1, 1, this.alpha)
        flipRect(EYE_X, EYE_Y, EYE, EYE)

        const W = (EYE - PUPIL) / 2
        let PUPIL_X = ((hero.box.x + hero.box.w / 2) - (EYE_X + EYE / 2)) / 10
        let PUPIL_Y = ((hero.box.y + hero.box.h / 2) - (EYE_Y + EYE / 2)) / 10
        if (PUPIL_X > W) PUPIL_X = W
        if (PUPIL_X < -W) PUPIL_X = -W
        if (PUPIL_Y > W) PUPIL_Y = W
        if (PUPIL_Y < -W) PUPIL_Y = -W

        ctx.fillStyle = rgb(0, 0, 0, this.alpha)
        flipRect(
            EYE_X + EYE / 2 + PUPIL_X * this.dir - PUPIL / 2,
            EYE_Y + EYE / 2 - PUPIL / 2 + PUPIL_Y,
            PUPIL, PUPIL)
    }
}

class BadFish extends Fish {
    constructor(x, y) {
        super(x, y)

        this.w = .9
        this.h = .7

        this.air = false

        this.angry = {
            state: false,
            range: 3
        }
        this.speed = random(.00011, .0015, 0)
        this.shade = random(0, .1, 0)

        this.defineCoins(3, 5)
        this.applyToCells()
    }

    collision() {
        const arr = this.collisionSetUp()

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                const block = mapItem(obj.x, obj.y)

                if (block[SOLID]) {
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)
    
                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                    }
                }
                else if (block[AIR]) {
                    this.speed_y += .015
                    this.air = true
                }
            }
        }
    }

    update() {
        // kill fish if touching exploded mine
        if (game.activeMine != false) {
            if (collide(this, game.activeMine[0])) {
                this.dead = true
                puff(this.x, this.y, this.w, this.h, 5, .5, [1, 1, 1, .5], .01, .01)
            }
        }

        super.update()

        this.flip(this.flipSpeed)

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.speed_x *= Math.pow(.99, dt)
        this.speed_y *= Math.pow(.99, dt)

        // ANGRY
        const dist_x = (hero.box.x + hero.box.w / 2) - (this.x + this.w / 2)
        const dist_y = (hero.box.y + hero.box.h / 2) - (this.y + this.h / 2)

        if (Math.abs(dist_x) < this.angry.range &&
            Math.abs(dist_y) < this.angry.range && !hero.do_kill)
            this.angry.state = true

        if (this.angry.state && !this.air) {
            this.speed_y += dist_y * this.speed * dt

            if (Math.abs(dist_x) > 2) {
                this.speed_x += dist_x * this.speed * dt

                let DIR = Math.sign(dist_x)
                if (DIR == 0) DIR = 1
                this.flip(FLIP_SPEED * DIR)
            }
        }

        // PEACEFUL
        else this.speed_y += .0003 * dt

        this.swim += 10 * this.speed_x * dt

        this.air = false
        this.collision()
    }

    draw() {
        const center = this.x + this.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const EYE = .3
        const EYE_GAP = .2
        const FROM_TOP = .2
        const PUPIL = .1
        const TAIL_W = .25
        const TAIL_H = .15
        const TAIL_CENTER = TAIL_H / 2

        // TAIL
        const TAIL_X = flip(this.x)
        const TAIL_Y = this.y + this.h / 2 - TAIL_H / 2
        const ANG = .25 + Math.sin(this.swim) * .2

        ctx.strokeStyle = rgb(.4 + this.shade, .1 + this.shade, .1 + this.shade, this.alpha)
        clear()
        rotate(TAIL_X, TAIL_Y - TAIL_CENTER + TAIL_H, ANG * -this.dir)
        rotRect(TAIL_X, TAIL_Y - TAIL_CENTER, -TAIL_W * this.dir, TAIL_H)
        clear()
        rotate(TAIL_X, TAIL_Y + TAIL_CENTER, ANG * this.dir)
        rotRect(TAIL_X, TAIL_Y + TAIL_CENTER, -TAIL_W * this.dir, TAIL_H)
        clear()

        // BODY
        ctx.fillStyle = rgb(.7 + this.shade, .55 + this.shade, .1 + this.shade, this.alpha)
        flipRect(this.x, this.y, this.w, this.h)

        // EYE
        const EYE_X = this.x + this.w - EYE - EYE_GAP
        const EYE_Y = this.y + FROM_TOP
        ctx.fillStyle = rgb(1, 1, 1, this.alpha)
        flipRect(EYE_X, EYE_Y, EYE, EYE)

        clear()
        ctx.strokeStyle = rgb(0, 0, 0, this.alpha)
        rotate(flip(EYE_X + EYE / 2), EYE_Y, -.15 * this.dir)
        rotRect(flip(EYE_X), EYE_Y - .04, EYE * this.dir, EYE * .3)
        clear()

        const W = (EYE - PUPIL) / 2
        let PUPIL_X = ((hero.box.x + hero.box.w / 2) - (EYE_X + EYE / 2)) / 10
        let PUPIL_Y = ((hero.box.y + hero.box.h / 2) - (EYE_Y + EYE / 2)) / 10
        if (PUPIL_X > W) PUPIL_X = W
        if (PUPIL_X < -W) PUPIL_X = -W
        if (PUPIL_Y > W) PUPIL_Y = W
        if (PUPIL_Y < -W) PUPIL_Y = -W

        ctx.fillStyle = rgb(0, 0, 0, this.alpha)
        flipRect(
            EYE_X + EYE / 2 + PUPIL_X * this.dir - PUPIL / 2,
            EYE_Y + EYE / 2 - PUPIL / 2 + PUPIL_Y,
            PUPIL, PUPIL)
    }
}