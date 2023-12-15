'use strict'

class Croc extends Base {
    constructor(x, y) {
        super(x, y)

        this.w = 4
        this.h = 2.2
        this.y -= .2

        this.damage = .2

        this.walk = 0

        this.speed_x = 0
        this.speed_y = 0

        this.settle = this.y

        this.dir = 1
        this.flipSpeed = 0

        this.ang = 0
        this.angGoal = 0

        this.striking = false
        this.surface = false
        this.snapped = false
        this.calmDown = 100

        this.strikeTimerLen = 10
        this.strikeTimer = this.strikeTimerLen

        this.mouthOpen = 1

        // ranges
        this.move = 16
        this.sink = 7
        this.strike = 2

        this.s = random(-.05, 0, 0)

        this.gravity = .025

        this.applyToCells()
    }

    calmReset() {
        this.striking = false
        this.surface = false
        this.snapped = false
        this.mouthOpen = 1
        this.strikeTimer = this.strikeTimerLen
        this.angGoal = 0
        this.calmDown = random(350, 400, 0)
    }

    collision() {
        const arr = this.collisionSetUp()

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                if (mapItemExists(obj.x, obj.y, SOLID)) {
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)
    
                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0
                        this.calmReset()
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                    }
                }
            }
        }
    }

    attack() {
        this.strikeTimer -= dt
        if (this.strikeTimer > 0) return

        if (!this.surface) {
            this.speed_y = -.5
            this.angGoal = -Math.PI / 2
            this.mouthOpen = 1

            if (this.y < this.settle)
                this.surface = true

            else if (this.y < hero.y) {
                this.surface = true
                this.speed_y = 0
            }
        }
        else {
            this.mouthOpen -= .2 * dt

            if (this.y > this.settle && this.snapped) {
                this.angGoal = 0

                this.calmDown -= dt
                if (this.calmDown < 0)
                    this.calmReset()
            }

            else if (this.mouthOpen <= 0) {
                this.speed_y = .05

                if (!this.snapped) {
                    this.snapped = true

                    const box = {
                        x: this.x + this.w / 2,
                        y: this.y - this.w / 2,
                        w: this.h / 2, h: this.w}
                    box.x -= box.w / 2

                    if (collide(box, hero) || collide(this, hero)) {
                        cam.boom(20, .5, .5)
                        hero.speed_y = -.2
                        hero.injure(this.damage)
                    }

                    else cam.boom(20, .2, .2)
                }
            }
        }
    }

    control() {
        this.flip(this.flipSpeed)

        const dis = hero.x + hero.w / 2 - (this.x + this.w / 2)
        const abs = Math.abs(dis)

        if (abs > 1)
            this.flip(Math.sign(this.speed_x || 1) * -.15)

        if (abs < this.strike) {
            if (this.y > this.settle)
                this.striking = true
        }

        if (abs < this.sink)
            this.speed_y += .006 * dt

        if (abs < this.move)
            this.speed_x += Math.sign(dis) * .004 * dt

        if (this.striking)
            this.attack()
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
        this.control()

        if (this.mouthOpen > 1) this.mouthOpen = 1
        if (this.mouthOpen < 0) this.mouthOpen = 0

        if (this.y < this.settle) this.speed_y += this.gravity * dt
        this.speed_y *= Math.pow(.9, dt)
        this.speed_x *= Math.pow(.9, dt)

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.ang += (this.angGoal - this.ang) / 10

        this.collision()

        this.applyToCells()
    }

    draw() {
        this.walk += .12 * dt
        const s = this.w

        const center = this.x + this.w / 2

        const breathe = Math.cos(this.walk * 2) * .04
        const y = this.y + breathe

        const flip = x => {return x = center + (x - center) * this.dir}
        const rect = (x, y, w, h) => {rotRect(flip(x), y, w * this.dir, h)}

        const col = [.21 + this.s, .42 + this.s, .11 + this.s]

        const BODY_H = .27 * s
        const LEG = this.h - BODY_H

        const LEG_W = .13 * s
        const LEG_H = LEG * .4
        const SHIN = LEG * .6
        const FOOT = LEG_W * 1.4
        const FOOT_H = .1 * s

        const legApart = .28 * s
        const legShift = .08 * s
        const legThresh = .1 * s
        const headSink = .2 * s

        const headW = .45 * s
        const headH = .2 * s
        const headThresh = .1 * s
        const headX = this.x + headSink - headW

        const jawW = .33 * s
        const jawH = .13 * s
        const jawX = this.x + headSink - jawW

        const tailSegs = 6
        const tailW = .12 * s

        const EYE = .11 * s
        const PAD = .03 * s
        const PUP = .036 * s

        const spikes = 5
        const spikeX = .17 * s
        const spikeW = .07 * s
        const spikeH = .03 * s
        const spikeGap = .12 * s

        const teeth = 4
        const teethX = .05 * s
        const teethGap = .07 * s
        const teethW = .04 * s
        const teethH = .02 * s

        clear()
        // body rotation
        rotate(flip(this.x + this.w / 2), this.y + this.h / 2, this.ang * this.dir)

        const leg = (x, oft, shade = 0) => {
            const X = this.x + this.w / 2 + legApart * x - LEG_W / 2 + legShift
            const Y = y + BODY_H

            ctx.strokeStyle = shift(col, .025 - shade)
            rotate(flip(X), Y, (.05 + Math.sin(this.walk + oft) * .4) * this.dir)
            rect(X, Y - legThresh, LEG_W, LEG_H + legThresh)

            rotate(flip(X), Y + LEG_H, (.4 + Math.sin(this.walk + oft - Math.PI / 2) * .3) * this.dir)
            rect(X, Y + LEG_H, LEG_W, SHIN)

            ctx.strokeStyle = shift(col, .035 - shade)
            rect(X + LEG_W / 2 - FOOT / 2, Y + LEG_H + SHIN - FOOT_H, FOOT, FOOT_H)
            rest()
            rest()
        }

        leg(-1, Math.PI, .04)
        leg(1, 0, .04)
        leg(-1, 0)
        leg(1, Math.PI)

        // body
        ctx.strokeStyle = shift(col)
        rect(this.x + headSink, y, this.w - headSink, BODY_H)

        ctx.strokeStyle = shift(col, -.05)
        for (let i = 0; i < spikes; i ++)
            rect(this.x + headSink + spikeX + i * spikeGap, y, spikeW, -spikeH)

        rotate(flip(headX + headW), y + headH / 2, Math.sin(this.walk / 3) * .1)

        // head
        ctx.strokeStyle = shift(col, .01)
        rotate(flip(headX + headW), y, -.1 * this.dir)
        rect(headX, y, headW + headThresh, headH)

        ctx.strokeStyle = rgb(.5, .5, .5)
        for (let i = 0; i < teeth; i ++)
            rect(headX + teethX + i * teethGap, y + headH, teethW, teethH)

        // eyes
        const eyeX = headX + headW - EYE
        const eyeY = y
        const pad = .005 * s

        ctx.strokeStyle = shift(col, -.02)
        rect(eyeX - PAD, eyeY - PAD, EYE + PAD * 2, PAD)

        ctx.strokeStyle = rgb(.7, .7, .72)
        rect(eyeX, eyeY, EYE, EYE)

        // pupils
        ctx.strokeStyle = rgb(0, 0, 0)

        const angle = Math.atan2(
            hero.x + hero.w / 2 - (this.x + this.w / 2 - (this.w / 2) * this.dir),
            hero.box.y - y) * this.dir

        let _x = Math.sin(angle - this.ang) * (EYE - PUP) * .5
        let _y = Math.cos(angle - this.ang) * (EYE - PUP) * .5
        rect(eyeX + EYE / 2 + _x - PUP / 2, eyeY + EYE / 2 + _y - PUP / 2, PUP, PUP)

        // brows
        rotate(flip(eyeX + EYE / 2), eyeY - pad, .2 * this.dir)
        rect(eyeX - pad, eyeY - pad, EYE, EYE * .25)
        rest()

        rest()

        // jaw
        if (!this.striking)
            this.mouthOpen = .2 + Math.sin(this.walk / 4) * .1

        const jawMove = this.mouthOpen * this.dir
        ctx.strokeStyle = shift(col, .01)
        rotate(flip(jawX + jawW), y + BODY_H - jawH, jawMove)
        rect(jawX, y + BODY_H - jawH, jawW + headThresh, jawH)
        rest()

        rest()

        ctx.strokeStyle = shift(col)
        for (let i = 0; i < tailSegs; i ++) {
            const x = this.x + this.w + i * tailW

            const dec = i / (tailSegs + 1)
            const h = BODY_H - dec * BODY_H - 1 / tailSegs
            const ang = Math.sin(this.walk / 5 + Math.cos(this.walk / 2)) * .06 + .01

            rotate(flip(x), y + h / 2, ang * this.dir)
            rect(x, y, tailW, h)
        }

        clear()
    }
}