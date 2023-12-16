'use strict'

class Staff extends Base {
    constructor(x, y, grumpy = false) {
        super(x, y)

        this.w = .9
        this.h = 2

        this.y -= this.h

        this.body = {
            walk: 0,
            arm1: -.6,
            arm2: .6,
            oft: 0
        }

        this.eye = 0
        this.eyeTimer = 50

        this.speed_x = 0
        this.speed_y = 0
        this.dir = 0

        this.air = false

        this.grumpy = grumpy

        this.comments = []

        this.sequence = false

        this.arrow = new Arrow(this, [.4, .4, .4])
        this.arrow.active = false

        this.world = map.curr
        this.eyeSize = random(.5, .6, 0)
        this.pupilSize = random(.13, .15, 0)
        this.legHeight = random(.55, .65, 0)

        const arr = rain(SEED)
        this.eyeCol = rgb(arr[0] * .2, arr[1] * .5, arr[2] * .6)

        this.applyToCells()
    }

    control() {

    }
    
    collision() {
        const arr = this.collisionSetUp()

        this.air = true

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

                        if (!this.air) jump(this, .25)
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0

                        this.air = false
                    }
                }
            }
        }
    }
    update() {
        // cancel operation if staff is not meant to be here
        if (!map.lev[map.curr].sqn.staff) return

        this.maxSpeed()
        this.walls()

        // PHYSICS
        this.speed_x += this.dir / 30 * dt
        this.speed_y += GRAVITY * dt

        this.speed_x *= Math.pow(.7, dt)

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.collision()

        this.body.walk += this.speed_x * 3 * dt

        this.applyToCells()
    }

    draw() {
        this.control()

        // ARROW

        // activate and deactivate
        const dontSpeak = chat.active || !this.comments.length
        if (!dontSpeak && collide(hero, this)) this.arrow.active = true
        else this.arrow.active = false
        
        // side comments
        if (this.comments.length && this.arrow.active &&
            key.down && !hero.in_air && hero.animate.old == 'walk') {

                // say comment
                say(this.comments[0], this)

                // remove spoken comment from array
                this.comments.splice(0, 1)

                key.down = false
        }
        this.arrow.setCurr(this)

        this.eyeTimer -= .4 * dt
        if (this.eyeTimer < 0) {
            this.eye = -Math.sin(this.eyeTimer)

            if (this.eyeTimer < -Math.PI) {
                this.eye = 0
                this.eyeTimer = random(20, 100)
            }
        }

        const EYE = this.eyeSize
        const PAD = .06
        const PUPIL = this.pupilSize
        const W = .065
        const LEG_H = this.legHeight
        const LEG_APART = .5
        const ARM_H = .6

        const Y = this.y + this.body.oft

        const posX = this.x + this.w / 2 - W / 2
        const posY = Y + this.h - LEG_H

        // LEGS
        const leg1 = Math.cos(this.body.walk) * LEG_APART
        const leg2 = Math.cos(this.body.walk + Math.PI) * LEG_APART

        ctx.strokeStyle = rgb(0, 0, 0)
        clear()
        rotate(posX + W / 2, posY + W / 2, leg1)
        const pos = rotRect(posX, posY, W, LEG_H)

        rest()

        rotate(posX + W / 2, posY + W / 2, leg2)
        rotRect(posX, posY, W, LEG_H)
        clear()

        this.body.oft = (this.y + this.h) - (pos.y2 - this.body.oft)

        // ARMS
        const arm = ang => {
            const arm_y = Y + EYE

            clear()
            rotate(posX + W / 2, arm_y + W / 2, ang)
            rotRect(posX, arm_y, W, ARM_H)
            clear()
        }
        arm(this.body.arm1)
        arm(this.body.arm2)

        // BODY
        ctx.fillStyle = rgb(0, 0, 0)
        fillRect(posX, Y, W, this.h - LEG_H)

        const eye = dir => {
            const X = this.x + this.w / 2 - EYE / 2 + (EYE / 2 * dir)

            ctx.fillStyle = rgb(0, 0, 0)
            fillRect(X, Y, EYE, EYE)

            ctx.fillStyle = rgb(.9, .9, .9)
            fillRect(X + PAD, Y + PAD, EYE - PAD * 2, EYE - PAD * 2)

            let disX = hero.x - X
            if (this.dir) disX = this.dir * EYE

            const disY = hero.box.y - (Y + EYE)

            let pupilX = disX / 3
            let pupilY = disY / 10

            const mark = EYE / 2 - PUPIL
            if (pupilX > mark) pupilX = mark
            else if (pupilX < -mark) pupilX = -mark
            if (pupilY > mark) pupilY = mark
            else if (pupilY < -mark) pupilY = -mark

            let col = this.eyeCol
            if (this.grumpy) col = rgb(.2, 0, 0)

            ctx.fillStyle = col
            fillRect(X + EYE / 2 - PUPIL / 2 + pupilX, Y + EYE / 2 - PUPIL / 2 + pupilY, PUPIL, PUPIL)

            ctx.fillStyle = rgb(.2, .2, .2)
            fillRect(X + PAD, Y + PAD, EYE - PAD * 2, (EYE - PAD * 2) * this.eye)

            if (this.grumpy) {
                ctx.strokeStyle = rgb(0, 0, 0)

                // frown
                clear()
                rotate(X + EYE / 2, Y, dir / 5)
                rotRect(X, Y, EYE, EYE * .2)
                clear()
            }
        }

        eye(-1)
        eye(1)

        this.arrow.draw()
    }
}