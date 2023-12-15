'use strict'

class Door extends Base {
    constructor(x, y, goal, locked, type) {
        super(x, y)

        this.goal = goal
        this.dir = 1
        this.state = 'none'
        this.locked = locked
        this.type = type

        /* a boolean that determines whether the door
        should have an arrow above it even when it's locked */
        this.tryLocked = false

        this.unlockingTimer = 0

        this.time = 0

        // the time period when the door is closed
        this.closed = false

        this.applyToCells()
    }

    spare() {

    }

    update() {
        this.spare()

        if (this.state != 'none') {
            hero.speed_x = 0
            hero.speed_y = 0
            hero.x += ((this.x + this.w / 2) - (hero.x + hero.w / 2)) / 4
            hero.y += ((this.y + this.h) - (hero.y + hero.h)) / 4
            hero.ang = 0
        }

        if (this.state == 'open') {
            if (this.dir > -1) this.dir -= this.speed
            if (this.dir <= -1) {
                this.dir = -1
                hero.alpha -= .1

                if (hero.alpha <= 0) {
                    hero.display = false
                    this.state = 'close'
                }
            }
        }
        else if (this.state == 'close') {
            if (this.dir < 1) this.dir += this.speed
            if (this.dir >= 1) {
                if (!this.closed) {
                    cam.boom(10, .3, .3)
                    pound.play()
                }

                this.closed = true
                this.dir = 1
                game.fade = 'black'

                if (game.black >= 1) {
                    hero.alpha = 1
                    hero.display = true

                    this.teleport()

                    game.fade = 'none'
                    this.state = 'none'
                    this.closed = false
                }
            }
        }

        if (collide(hero, this)) {
            if (this.tryLocked) this.arrow.active = true

            if (!this.locked || (this.type == 'wooden' && hero.key)) {
                this.arrow.active = true

                if (key.down && !hero.in_air && this.state == 'none' && hero.animate.old == 'walk') {
                    if (this.locked) {
                        this.unlockingTimer += dt

                        const PUFF = .2
                        puff(
                            this.x + this.w / 2 - PUFF / 2,
                            this.y + this.h / 2 - PUFF / 2,
                            PUFF, PUFF, 5, .05,
                            [1, 1, 1, .5], .01, .01,
                            [-.1, .1], [-.1, .1], .8, .8)

                        cam.boom(10, .1, .1)
                        hero.key = false
                        this.locked = false
                    }
                    else this.state = 'open'

                    key.down = false
                }
            }
        }
        else this.arrow.active = false

        if (this.unlockingTimer) {
            this.unlockingTimer += dt

            if (this.unlockingTimer > 30) {
                this.state = 'open'
                this.unlockingTimer = 0
            }
        }
    }

    drawWooden() {
        const flip = (x, y, w, h) => fillRect(this.x + (x - this.x) * this.dir, y, w * this.dir, h)
        const PAD = .1
        const HAND_X = .7
        const HAND_Y = .8
        const HAND = .2
        const LOCK = .45
        const LOCK_Y = this.h / 2 - .1
        const A = .17
        const B_W = .07
        const B_H = .1

        ctx.fillStyle = rgb(0, 0, 0)

        // VOID
        fillRect(this.x, this.y, this.w, this.h)
        // BORDER
        flip(this.x, this.y, this.w, this.h)

        // MAIN
        const w = (this.w - PAD * 2) / 2
        ctx.fillStyle = rgb(.2, .1, 0)
        flip(this.x + PAD, this.y + PAD, w, this.h - PAD)
        ctx.fillStyle = rgb(.24, .14, .04)
        flip(this.x + PAD + w, this.y + PAD, w, this.h - PAD)

        if (this.locked) {
            // LOCK
            ctx.fillStyle = rgb(.55, .4, .06)    
            fillRect(this.x + this.w / 2 - LOCK / 2, this.y + this.h / 2 - LOCK / 2, LOCK, LOCK)

            ctx.fillStyle = rgb(.03, .03, .03)
            flip(this.x + this.w / 2 - A / 2, this.y + LOCK_Y, A, A)
            flip(this.x + this.w / 2 - B_W / 2, this.y + LOCK_Y + A, B_W, B_H)
        }

        else {
            // HANDLE
            ctx.fillStyle = rgb(.03, .03, .03)
            flip(this.x + HAND_X, this.y + HAND_Y, HAND, HAND)
        }

        this.arrow.draw()
    }

    drawSeal() {
        const flip = (x, y, w, h) => fillRect(this.x + (x - this.x) * this.dir, y, w * this.dir, h)
        const PAD = .1
        const HAND_X = .7
        const HAND_Y = .85
        const HAND = .2
        const LIGHT_Y = .3
        const LIGHT_W = .4
        const LIGHT_H = .15

        ctx.fillStyle = rgb(0, 0, 0)

        // VOID
        fillRect(this.x, this.y, this.w, this.h)
        // BORDER
        flip(this.x, this.y, this.w, this.h)

        // MAIN
        const w = this.w - PAD * 2
        ctx.fillStyle = rgb(.2, .2, .2)
        flip(this.x + PAD, this.y + PAD, w, this.h - PAD)

        // LIGHT
        ctx.fillStyle = rgb(0, .6, 0)
        if (this.locked) ctx.fillStyle = rgb(.6, 0, 0)
        flip(this.x + this.w / 2 - LIGHT_W / 2, this.y + LIGHT_Y, LIGHT_W, LIGHT_H)

        // HANDLE
        ctx.fillStyle = rgb(.05, .05, .05)
        flip(this.x + HAND_X, this.y + HAND_Y, HAND, HAND)

        // SHADOW
        ctx.fillStyle = rgb(0, 0, 0, .2)
        flip(this.x + PAD , this.y + PAD, w / 2, this.h - PAD)

        this.arrow.draw()
    }

    drawMagic() {
        this.time += .15 * dt
        const PAD = .1
        const HAND_X = .85
        const HAND_Y = .45
        const HAND = .2

        const WOBBLE = this.time / 2.5 + Math.sin(this.time)

        if (this.state == 'none') {
            const old = this.dir
            if (!this.locked) this.dir = 6 + Math.cos(this.time / 10) * 10

            if (this.dir < -1) this.dir = -1
            if (this.dir > 1) {
                this.dir = 1

                if (old < 1) cam.boom(20, .2, .2)
            }
        }

        const W = this.w + Math.sin(WOBBLE) * .2
        const H = this.h + Math.sin(WOBBLE + Math.PI) * .2
        const X = this.x - (W - this.w) / 2
        const Y = this.y - (H - this.h)

        const flip = (x, y, w, h) => fillRect(X + (x - X) * this.dir, y, w * this.dir, h)

        // VOID
        ctx.fillStyle = rgb(0, 0, 0)
        fillRect(X, Y, W, H)

        const SPEED = this.time / 2

        const third = whole / 3
        ctx.fillStyle = rgb(
            .5 + Math.sin(SPEED) * .5,
            .5 + Math.sin(third + SPEED) * .5,
            .5 + Math.sin(third * 2 + SPEED) * .5)
        fillRect(X + PAD, Y + PAD, W - PAD * 2, H - PAD * 2)

        ctx.fillStyle = rgb(1, 1, 1, .1)
        fillRect(X - PAD, Y - PAD, W + PAD * 2, H + PAD * 2)

        // BORDER
        ctx.fillStyle = rgb(0, 0, 0)
        flip(X, Y, W, H)

        // MAIN
        const w = W - PAD * 2
        ctx.fillStyle = rgb(
            .5 + Math.sin(SPEED) * .06,
            .5 + Math.sin(third + SPEED) * .06,
            .5 + Math.sin(third * 2 + SPEED) * .06)
        flip(X + PAD, Y + PAD, w, H - PAD)

        // HANDLE
        ctx.fillStyle = rgb(.05, .05, .05)
        flip(X + HAND_X * W, Y + HAND_Y * H, -HAND, HAND)

        // SHADOW
        ctx.fillStyle = rgb(0, 0, 0, .2)
        flip(X + PAD, Y + PAD, w / 2, H - PAD)

        this.arrow.draw()
    }

    draw() {
        if (this.type == 'wooden') this.drawWooden()
        if (this.type == 'seal') this.drawSeal()
        if (this.type == 'magic') this.drawMagic()
    }
}

class NormalDoor extends Door {
    constructor(x, y, goal, locked, type) {
        super(x, y, goal, locked, type)

        this.w = 1.15
        this.h = 1.9
        this.x = x - this.w / 2
        this.y = y - this.h

        this.speed = .15

        this.arrow = new Arrow(this, [.4, .4, .4])
        this.arrow.active = false

        this.applyToCells()
    }

    teleport() {
        hero.x = this.goal.x - hero.w / 2
        hero.y = this.goal.y - this.h
        hero.collisionBox()

        cam.x = hero.box.x + hero.w / 2
        cam.y = hero.box.y + hero.h / 2
    }
}

class TeleportDoor extends Door {
    constructor(x, y, goal, locked, type) {
        super(x, y, goal, locked, type)

        this.w = 1.1
        this.h = 2.05
        this.x = x - this.w / 2
        this.y = y - this.h

        this.dirSpeed = 0
        this.locked = locked
        this.type = type

        this.speed = .1
        this.time = random(0, 50)

        this.arrow = new Arrow(this, [.4, .4, .4])
        this.arrow.active = false

        this.applyToCells()
    }

    teleport() {
        map.setLevel(this.goal.world, this.goal.door)

        cam.x = hero.box.x + hero.w / 2
        cam.y = hero.box.y + hero.h / 2
    }
}