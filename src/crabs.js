'use strict'

class Crab extends Base {
    constructor(x, y) {
        super(x, y)

        this.oft_y = 0
        this.x = x
        this.y = y
        this.speed_x = 0
        this.speed_y = 0
        this.momentum = .9
        this.walk = random(0, 50)
        this.dir = -1
        this.air = false

        this.do_kill = 0
        this.recover = 0

        this.applyToCells()
    }

    recovery() {
        this.recover += dt
        this.display = (this.recover % 8) > 3
        if (this.recover > 70) {
            this.recover = 0
            this.display = true
        }
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
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                    }

                    this.air = false
                }
            }
        }
    }

    control() {
        this.move.timer.curr -= dt
        if (this.move.timer.curr < 0) {
            this.move.last.curr -= dt

            // turn around if wall is in the way
            let change = -.05
            if (this.dir > 0) change = 1.05
            if (mapItemExists(this.x + change, this.y, SOLID))
                this.dir *= -1

            // move crab
            this.speed_x += this.dir * this.speed * dt

            // reset timers
            if (this.move.last.curr < 0) {
                this.dir = -1
                if (random(0, 2)) this.dir = 1

                this.move.last.reset()
                this.move.timer.reset()
            }
        }
    }

    update() {
        if (collide(this, hero.box) && !this.recover) {
            hero.speed_x += this.speed_x * .3 * dt
            if (this.damage) {
                if (hero.offensive)
                    this.recovery()
                else hero.injure(this.damage)
            }
        }

        this.control()
        this.maxSpeed()
        this.walls()

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.speed_x *= Math.pow(this.momentum, dt)
        this.speed_y += GRAVITY * dt

        if (this.recover)
            this.recovery()

        this.collision()
        this.applyToCells()
    }
}

class SeaCrab extends Crab {
    constructor(x, y) {
        super(x, y)

        this.x = x
        this.y = y
        this.w = .7
        this.h = .7

        this.move = {
            timer: {min: 30, max: 100, curr: 0},
            last: {min: 100, max: 500, curr: 0}
        }
        this.speed = .0005

        objSet(this.move.timer, 'min/max')
        objSet(this.move.last, 'min/max')

        this.applyToCells()
    }

    update() {
        super.update()

        this.walk -= 20 * this.speed_x * dt
    }

    draw() {
        const HAPPY_H = 1
        const s = this.h / HAPPY_H

        const EYE_SENSITIVITY = 1

        const BODY_H = .6 * s
        const LEG_W = .14 * s
        const THIGH_H = .25 * s
        const SHIN_H = .3 * s
        const LEG_BEND = .1 * s
        const KNEE_BEND = .4 * s
        const EYE_CENTER = .09 * s
        const EYE_SIZE = .27 * s
        const PUPIL_SIZE = .1 * s
        const EYE_Y = .14 * s
        const ARM_Y = .35 * s
        const ARM_W = .1 * s
        const ARM_H = .34 * s
        const CLAW_W = .1 * s
        const CLAW_H = .23 * s
        const SNAP_W = .11 * s
        const SNAP_H = .25 * s

        const OFT_Y = this.oft_y

        let OLD = 0
        const leg = (oft, dir) => {
            const walk = (this.walk + oft * 20) * dir

            const x_pos = this.x + this.w / 2 - LEG_W / 2 + oft * this.w / 2
            const y_pos = this.y + BODY_H - LEG_W / 2 + OFT_Y

            clear()
            // thigh
            rotate(x_pos + LEG_W / 2, y_pos, dir + Math.sin(walk) * LEG_BEND)
            rotRect(x_pos, y_pos, LEG_W, THIGH_H)
            // shin
            rotate(x_pos + LEG_W / 2, y_pos + THIGH_H, -dir + Math.cos(walk) * KNEE_BEND)
            const pos = rotRect(x_pos, y_pos + THIGH_H, LEG_W, SHIN_H)
            clear()

            const baseOfFoot = pos.y2 - OFT_Y
            const baseOfBody = this.y + this.h
            const NEW = baseOfBody - baseOfFoot

            if (OLD == 0) OLD = NEW
            this.oft_y = NEW
            if (OLD < NEW) this.oft_y = OLD
            else OLD = NEW
        }
        const arm = dir => {
            const arm_x = this.x + this.w / 2 + ((this.w / 2 - ARM_W / 2) * dir) - ARM_W / 2
            const arm_y = this.y + ARM_Y + OFT_Y
            const arm_sway = 1.7 + Math.sin(this.walk + time / 80) * .3
            clear()
            // ARM
            ctx.strokeStyle = rgb(0, 0.4, 0.3, this.alpha)
            rotate(arm_x + ARM_W / 2, arm_y, arm_sway * dir)
            rotRect(arm_x, arm_y, ARM_W, ARM_H)
            // CLAW
            ctx.strokeStyle = rgb(0.73, 0.3, 0.06, this.alpha)
            rotate(arm_x + ARM_W / 2, arm_y + ARM_H, 1.1 * dir)
            rotRect(arm_x + ARM_W / 2 - CLAW_W / 2, arm_y + ARM_H, CLAW_W, CLAW_H)
            rest()
            rotate(arm_x + ARM_W / 2, arm_y + ARM_H, .2 * dir)
            rotRect(arm_x + ARM_W / 2 - SNAP_W / 2, arm_y + ARM_H, SNAP_W, SNAP_H)
            clear()
        }
        const eye = dir => {
            const eye_x = this.x + this.w / 2 + EYE_CENTER * dir
            const eye_y = this.y + this.oft_y + EYE_Y

            ctx.fillStyle = rgb(0.8, 0.8, 0.73, this.alpha)
            fillRect(eye_x, eye_y, EYE_SIZE * dir, EYE_SIZE)

            // PUPILS
            const _EYE_SIZE = (EYE_SIZE - PUPIL_SIZE) / 2
            let dist_x = (hero.box.x + hero.box.w / 2 - eye_x) * EYE_SENSITIVITY
            let dist_y = (hero.box.y - eye_y) * EYE_SENSITIVITY
            if (dist_x > 1) dist_x = 1
            if (dist_x < -1) dist_x = -1
            if (dist_y > 1) dist_y = 1
            if (dist_y < -1) dist_y = -1

            ctx.fillStyle = rgb(0, 0, 0, this.alpha)
            fillRect(
                eye_x + dist_x * _EYE_SIZE + _EYE_SIZE * dir,
                eye_y + dist_y * _EYE_SIZE + _EYE_SIZE,
                PUPIL_SIZE * dir, PUPIL_SIZE)
        }

        // LEGS
        ctx.strokeStyle = rgb(0.06, 0.4, 0.33, this.alpha)
        leg(-.75, -1)
        leg(-.3, -1)
        leg(.3, 1)
        leg(.75, 1)

        // ARMS
        arm(-1)
        arm(1)

        // BODY
        ctx.fillStyle = rgb(0.06, 0.46, 0.4, this.alpha)
        fillRect(this.x, this.y + this.oft_y, this.w, BODY_H)

        // EYES
        eye(-1)
        eye(1)
    }
}

class SandCrab extends Crab {
    constructor(x, y) {
        super(x, y)

        this.x = x
        this.y = y
        this.w = .75
        this.h = .75

        this.move = {
            timer: {min: 100, max: 150, curr: 0},
            last: {min: 200, max: 400, curr: 0}
        }
        this.speed = .0005

        objSet(this.move.timer, 'min/max')
        objSet(this.move.last, 'min/max')

        this.applyToCells()
    }

    update() {
        super.update()

        this.walk -= 10 * this.speed_x * dt
    }

    draw() {
        const HAPPY_H = 1
        const s = this.h / HAPPY_H

        const EYE_SENSITIVITY = .8

        const BODY_H = .6 * s
        const LEG_W = .14 * s
        const THIGH_H = .25 * s
        const SHIN_H = .3 * s
        const LEG_BEND = .1 * s
        const KNEE_BEND = .4 * s
        const EYE_CENTER = .09 * s
        const EYE_SIZE = .27 * s
        const PUPIL_SIZE = .1 * s
        const EYE_Y = .14 * s
        const ARM_Y = .35 * s
        const ARM_W = .1 * s
        const ARM_H = .34 * s
        const CLAW_W = .1 * s
        const CLAW_H = .23 * s
        const SNAP_W = .11 * s
        const SNAP_H = .25 * s

        const OFT_Y = this.oft_y

        let OLD = 0
        const leg = (oft, dir) => {
            const walk = (this.walk + oft * 20) * dir

            const x_pos = this.x + this.w / 2 - LEG_W / 2 + oft * this.w / 2
            const y_pos = this.y + BODY_H - LEG_W / 2 + OFT_Y

            clear()
            // thigh
            rotate(x_pos + LEG_W / 2, y_pos, dir + Math.sin(walk) * LEG_BEND)
            rotRect(x_pos, y_pos, LEG_W, THIGH_H)
            // shin
            rotate(x_pos + LEG_W / 2, y_pos + THIGH_H, -dir + Math.cos(walk) * KNEE_BEND)
            const pos = rotRect(x_pos, y_pos + THIGH_H, LEG_W, SHIN_H)
            clear()

            const baseOfFoot = pos.y2 - OFT_Y
            const baseOfBody = this.y + this.h
            const NEW = baseOfBody - baseOfFoot

            if (OLD == 0) OLD = NEW
            this.oft_y = NEW
            if (OLD < NEW) this.oft_y = OLD
            else OLD = NEW
        }
        const arm = dir => {
            const arm_x = this.x + this.w / 2 + ((this.w / 2 - ARM_W / 2) * dir) - ARM_W / 2
            const arm_y = this.y + ARM_Y + OFT_Y
            const arm_sway = 1.7 + Math.sin(this.walk + time / 80) * .3
            clear()
            // ARM
            ctx.strokeStyle = rgb(0.46, 0.33, 0.13, this.alpha)
            rotate(arm_x + ARM_W / 2, arm_y, arm_sway * dir)
            rotRect(arm_x, arm_y, ARM_W, ARM_H)
            // CLAW
            ctx.strokeStyle = rgb(0.6, 0.2, 0, this.alpha)
            rotate(arm_x + ARM_W / 2, arm_y + ARM_H, 1.1 * dir)
            rotRect(arm_x + ARM_W / 2 - CLAW_W / 2, arm_y + ARM_H, CLAW_W, CLAW_H)
            rest()
            rotate(arm_x + ARM_W / 2, arm_y + ARM_H, .2 * dir)
            rotRect(arm_x + ARM_W / 2 - SNAP_W / 2, arm_y + ARM_H, SNAP_W, SNAP_H)
            clear()
        }
        const eye = dir => {
            const eye_x = this.x + this.w / 2 + EYE_CENTER * dir
            const eye_y = this.y + this.oft_y + EYE_Y

            ctx.fillStyle = rgb(0.8, 0.8, 0.73, this.alpha)
            fillRect(eye_x, eye_y, EYE_SIZE * dir, EYE_SIZE)

            // PUPILS
            const _EYE_SIZE = (EYE_SIZE - PUPIL_SIZE) / 2
            let dist_x = (hero.box.x + hero.box.w / 2 - eye_x) * EYE_SENSITIVITY
            let dist_y = (hero.box.y - eye_y) * EYE_SENSITIVITY
            if (dist_x > 1) dist_x = 1
            if (dist_x < -1) dist_x = -1
            if (dist_y > 1) dist_y = 1
            if (dist_y < -1) dist_y = -1

            ctx.fillStyle = rgb(0, 0, 0, this.alpha)
            fillRect(
                eye_x + dist_x * _EYE_SIZE + _EYE_SIZE * dir,
                eye_y + dist_y * _EYE_SIZE + _EYE_SIZE,
                PUPIL_SIZE * dir, PUPIL_SIZE)
        }

        // LEGS
        ctx.strokeStyle = rgb(0.46, 0.33, 0.13, this.alpha)
        leg(-.75, -1)
        leg(-.3, -1)
        leg(.3, 1)
        leg(.75, 1)

        // ARMS
        arm(-1)
        arm(1)

        // BODY
        ctx.fillStyle = rgb(0.53, 0.26, 0.13, this.alpha)
        fillRect(this.x, this.y + this.oft_y, this.w, BODY_H)

        // EYES
        eye(-1)
        eye(1)
    }
}

class BadCrab extends Crab {
    constructor(x, y) {
        super(x, y)

        this.x = x
        this.y = y
        this.w = .9
        this.h = .9

        this.damage = .1

        this.move = {
            timer: {min: 150, max: 250, curr: 0},
            last: {min: 200, max: 400, curr: 0}
        }
        this.speed = .003

        objSet(this.move.timer, 'min/max')
        objSet(this.move.last, 'min/max')

        this.angry = {
            state: false,
            range: 10
        }

        this.applyToCells()
    }

    update() {
        super.update()

        const dis_x = (hero.x + hero.w / 2) - (this.x + this.w / 2)
        const dis_y = (hero.y + hero.h / 2) - (this.y + this.h / 2)
        if (Math.abs(dis_x) < this.angry.range && Math.abs(dis_y) < this.angry.range)
            this.angry.state = true
        
        if (this.angry.state)
            this.dir = Math.sign(dis_x)
            this.move.timer.curr = -1

            if (Math.abs(this.speed_x) < this.speed / 3 && !this.air)
                jump(this, .1)

        this.walk -= 10 * this.speed_x * dt
    }

    draw() {
        const HAPPY_H = 1
        const s = this.h / HAPPY_H

        const EYE_SENSITIVITY = .8

        const BODY_H = .6 * s
        const LEG_W = .14 * s
        const THIGH_H = .25 * s
        const SHIN_H = .3 * s
        const LEG_BEND = .1 * s
        const KNEE_BEND = .4 * s
        const EYE_CENTER = .09 * s
        const EYE_SIZE = .27 * s
        const PUPIL_SIZE = .1 * s
        const EYE_Y = .14 * s
        const ARM_Y = .35 * s
        const ARM_W = .1 * s
        const ARM_H = .34 * s
        const CLAW_W = .1 * s
        const CLAW_H = .23 * s
        const SNAP_W = .11 * s
        const SNAP_H = .25 * s

        const OFT_Y = this.oft_y

        let OLD = 0
        const leg = (oft, dir) => {
            const walk = (this.walk + oft * 20) * dir

            const x_pos = this.x + this.w / 2 - LEG_W / 2 + oft * this.w / 2
            const y_pos = this.y + BODY_H - LEG_W / 2 + OFT_Y

            clear()
            // thigh
            rotate(x_pos + LEG_W / 2, y_pos, dir + Math.sin(walk) * LEG_BEND)
            rotRect(x_pos, y_pos, LEG_W, THIGH_H)
            // shin
            rotate(x_pos + LEG_W / 2, y_pos + THIGH_H, -dir + Math.cos(walk) * KNEE_BEND)
            const pos = rotRect(x_pos, y_pos + THIGH_H, LEG_W, SHIN_H)
            clear()

            const baseOfFoot = pos.y2 - OFT_Y
            const baseOfBody = this.y + this.h
            const NEW = baseOfBody - baseOfFoot

            if (OLD == 0) OLD = NEW
            this.oft_y = NEW
            if (OLD < NEW) this.oft_y = OLD
            else OLD = NEW
        }
        const arm = dir => {
            const arm_x = this.x + this.w / 2 + ((this.w / 2 - ARM_W / 2) * dir) - ARM_W / 2
            const arm_y = this.y + ARM_Y + OFT_Y
            const arm_sway = 1.7 + Math.sin(this.walk + time / 80) * .3
            clear()
            // ARM
            ctx.strokeStyle = rgb(0.46, 0.33, 0.13, this.alpha)
            rotate(arm_x + ARM_W / 2, arm_y, arm_sway * dir)
            rotRect(arm_x, arm_y, ARM_W, ARM_H)
            // CLAW
            ctx.strokeStyle = rgb(0.6, 0.2, 0, this.alpha)
            rotate(arm_x + ARM_W / 2, arm_y + ARM_H, 1.1 * dir)
            rotRect(arm_x + ARM_W / 2 - CLAW_W / 2, arm_y + ARM_H, CLAW_W, CLAW_H)
            rest()
            rotate(arm_x + ARM_W / 2, arm_y + ARM_H, .2 * dir)
            rotRect(arm_x + ARM_W / 2 - SNAP_W / 2, arm_y + ARM_H, SNAP_W, SNAP_H)
            clear()
        }
        const eye = dir => {
            const eye_x = this.x + this.w / 2 + EYE_CENTER * dir
            const eye_y = this.y + this.oft_y + EYE_Y

            ctx.fillStyle = rgb(0.8, 0.8, 0.73, this.alpha)
            fillRect(eye_x, eye_y, EYE_SIZE * dir, EYE_SIZE)

            // PUPILS
            const _EYE_SIZE = (EYE_SIZE - PUPIL_SIZE) / 2
            let dist_x = (hero.box.x + hero.box.w / 2 - eye_x) * EYE_SENSITIVITY
            let dist_y = (hero.box.y - eye_y) * EYE_SENSITIVITY
            if (dist_x > 1) dist_x = 1
            if (dist_x < -1) dist_x = -1
            if (dist_y > 1) dist_y = 1
            if (dist_y < -1) dist_y = -1

            ctx.fillStyle = rgb(0, 0, 0, this.alpha)
            fillRect(
                eye_x + dist_x * _EYE_SIZE + _EYE_SIZE * dir,
                eye_y + dist_y * _EYE_SIZE + _EYE_SIZE,
                PUPIL_SIZE * dir, PUPIL_SIZE)

            // BROW
            ctx.strokeStyle = rgb(0, 0, 0, this.alpha)
            clear()
            rotate(eye_x, eye_y, .3 * dir)
            rotRect(eye_x, eye_y, EYE_SIZE * dir, .06)
            clear()
        }

        // LEGS
        ctx.strokeStyle = rgb(.56, .23, .03, this.alpha)
        leg(-.75, -1)
        leg(-.3, -1)
        leg(.3, 1)
        leg(.75, 1)

        // ARMS
        arm(-1)
        arm(1)

        // BODY
        ctx.fillStyle = rgb(.63, .16, .03, this.alpha)
        fillRect(this.x, this.y + this.oft_y, this.w, BODY_H)

        // EYES
        eye(-1)
        eye(1)
    }
}