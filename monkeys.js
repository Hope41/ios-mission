'use strict'

class Monkey extends Base {
    constructor(x, y, swamp) {
        super(x, y)

        this.w = 1
        this.h = 2

        this.y -= this.h
        this.yOft = 0
        this.walk = 1.2

        this.air = false
        this.lean = 0

        this.dir = -1
        this.dirOnGround = this.dir
        this.changeDir = random(100, 150)

        this.move = random(100, 150) // when it should move
        this.moveLast = random(100, 150) // how long it should last

        this.speed_x = 0
        this.speed_y = 0

        this.time = random(0, 200, 0)
        this.flipSpeed = 0
        this.swingTail = 0
        this.inSwamp = false

        this.swamp = swamp
        this.banana = 0
        this.bananaThrow = random(30, 60)

        this.arm = 0
        this.angry = false

        this.climbing = 0

        this.applyToCells()
    }

    collision() {
        const arr = this.collisionSetUp()
        this.air = true
        let onGround = false

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                if (mapItemExists(obj.x, obj.y, SOLID)) {
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)
    
                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0
                        onGround = false
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0

                        if (overlap.y > 0) {
                            onGround = true
                            this.air = false
                        }
                    }
                }
            }
        }

        if (onGround) {
            this.dirOnGround = Math.sign(this.dir || this.flipSpeed)
            this.inSwamp = false
        }

        // jump over obstacles
        if (this.move < 0 &&
            mapItemExists((this.x + this.w / 2) + this.dir, this.y + this.h - .5, SOLID)) {
            this.speed_y = -.3
            this.air = true

            this.climbing += dt
        }
        else this.climbing = 0

        if (this.climbing > 5) {
            this.dir *= -1
            this.climbing = 0
            this.move += 20
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

    update() {
        this.walls()

        const dis = (this.x + this.w / 2) - (hero.x + hero.w / 2)

        // swamp
        if (this.y > this.swamp - .4 && !this.inSwamp) {
            this.flip(-.15 * Math.sign(this.dirOnGround))
            this.inSwamp = true
            this.angry = false
        }
        if (this.inSwamp) {
            if (this.y > this.swamp - .4)
                this.speed_y -= (this.y - this.swamp) / 10
        }

        else {
            this.changeDir -= dt
            if (this.changeDir < 0 && !this.air) {
                if (this.angry)
                    this.flip(-.15 * Math.sign(dis || 1))
                else this.flip(-.15 * this.dir)

                this.changeDir = random(200, 250)
            }
        }

        // movement
        this.move -= dt
        if (this.move < 0 || this.inSwamp) {
            this.speed_x += this.dir * .01

            if (!this.air) this.speed_y = -.2

            if (this.move < -this.moveLast) {
                this.move = random(50, 150)
                this.moveLast = random(60, 160)
            }
        }

        // throwing bananas
        else if (Math.abs(dis) < 5) {
            this.move = 100
            this.flip(-.15 * Math.sign(dis || 1))

            this.banana += dt
            if (this.banana > this.bananaThrow) {
                if (!this.air) this.speed_y = -.2

                new Banana(
                    this.x + (this.w / 2 * this.dir),
                    this.y + this.h / 2,
                    random(.15, .25, 0) * this.dir,
                    -random(.2, .4, 0))
                this.banana = 0
                this.angry = true
            }
        }

        this.speed_x *= Math.pow(.9, dt)
        this.speed_y += GRAVITY * dt

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.flip(this.flipSpeed)

        this.collision()
        this.applyToCells()
    }

    draw() {
        const s = this.h
        this.walk += this.speed_x * 2 * dt
        this.time += dt

        const goalLean = this.speed_x * -10
        this.lean += (goalLean - this.lean) / 10 * dt

        this.swingTail += (this.speed_y * 5 - this.swingTail) / 40 * dt
        const breathe = 1.4 + this.swingTail + Math.sin(this.time / 90) * .2
        const tailRot = breathe * this.dir + Math.PI

        let goalArm = 2 * this.dir
        if (this.banana > this.bananaThrow / 5)
            goalArm = 0

        this.arm += (goalArm - this.arm) / 3 * dt

        const pad = .09 * s
        const faceW = .35 * s
        const faceH = .35 * s

        const eyeW = .06 * s
        const eyeH = .07 * s
        const eyeX = .06 * s
        const eyeY = .135 * s
        const eyeOft = .03 * s

        const bodyW = .045 * s
        const bodyH = .37 * s

        const armH = .3 * s
        const hand = .05 * s
        const earW = .05 * s
        const earH = .15 * s
        const earY = .3
        const earPad = .04 * s

        const tailW = .05 * s
        const baseTailH = .15
        const tailH = (baseTailH - (1 - Math.abs(this.dir)) * baseTailH / 2) * s
        const tailSegs = 6

        let x = this.x + this.w / 2
        const y = this.y + this.yOft

        const legY = y + faceH + bodyH
        const legH = this.h - (faceH + bodyH)

        const FACE = rgb(.6, .35, .15)
        const HAND = rgb(.25, .13, .05)
        const BODY = rgb(.13, .07, 0)
        const EYES = rgb(.3, .15, .03)

        // tail
        clear()
        rotate(x, legY, tailRot)
        ctx.strokeStyle = BODY
        for (let i = 0; i < tailSegs; i ++) {
            rotate(x, legY + i * tailH, (.08 + i / (4 + Math.sin(this.time / 50))) * -this.dir)
            rotRect(x - tailW / 2, legY + i * tailH, tailW, tailH)
        }
        clear()

        // body
        clear()
        ctx.strokeStyle = BODY
        rotate(x, y + faceH + bodyH, this.lean)
        const bodyLean = rotRect(x - bodyW / 2, y + faceH, bodyW, bodyH)
        clear()
        const faceX = bodyLean.x1
        const faceY = bodyLean.y1 - faceH

        // face shape
        ctx.fillStyle = BODY
        fillRect(faceX - faceW / 2, faceY, faceW, faceH)

        // ears
        fillRect(faceX - faceW / 2, faceY + faceH * earY, -earW, earH)
        fillRect(faceX + faceW / 2, faceY + faceH * earY, earW, earH)

        ctx.fillStyle = FACE
        fillRect(faceX - faceW / 2 + pad, faceY + faceH * earY + earPad, -earW + earPad - pad, earH - earPad * 2)
        fillRect(faceX + faceW / 2 - pad, faceY + faceH * earY + earPad, earW - earPad + pad, earH - earPad * 2)

        // face skin
        ctx.fillStyle = FACE
        fillRect(faceX - faceW / 2 + pad / 2, faceY + pad / 2, faceW - pad, faceH - pad)

        const arm = dir => {
            const armY = faceY + faceH

            clear()
            ctx.strokeStyle = BODY
            rotate(faceX, armY, dir * .5 + Math.cos(this.walk) * .2)
            rotRect(faceX - bodyW / 2, armY, bodyW, armH)

            ctx.strokeStyle = HAND
            rotRect(faceX - bodyW / 2 + bodyW / 2 - hand / 2, armY + armH - hand / 2, hand, hand)
            clear()
        }

        arm(-1 + this.arm)
        arm(1)

        const eye = dir =>
            fillRect(faceX - eyeW / 2 + eyeX * dir + eyeOft * this.dir, faceY + eyeY, eyeW, eyeH)

        ctx.fillStyle = EYES
        eye(-1)
        eye(1)

        const leg = dir => {
            clear()
            ctx.strokeStyle = BODY
            rotate(x, legY, dir * Math.sin(this.walk) * .5)
            const pos = rotRect(x - bodyW / 2, legY, bodyW, legH)

            ctx.strokeStyle = HAND
            rotRect(x - bodyW / 2 + bodyW / 2 - hand / 2, legY + legH - hand, hand, hand)
            clear()

            return pos.y2 - this.y
        }

        leg(-1)
        const pos = leg(1)
        this.yOft += this.h - pos
    }
}

class Banana extends Base {
    constructor(x, y, speedX, speedY, bad = false) {
        super(x, y)

        this.bad = bad

        if (bad) {
            this.w = 1.5
            this.h = .4
        }

        else {
            this.w = .8
            this.h = .2
        }

        this.speedX = speedX
        this.speedY = speedY
        this.ang = 0

        this.alpha = 7
        this.rest = random(-.2, .2, 0)
        this.air = true

        this.applyToCells()
    }

    collision() {
        const arr = this.collisionSetUp()
        this.air = true

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                if (mapItemExists(obj.x, obj.y, SOLID)) {
                    const overlap = mapMerge(this, obj, this.speedX, this.speedY)
    
                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speedX = 0
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speedY *= -.2
                        this.air = false
                    }
                }
            }
        }
    }

    update() {
        this.walls()

        this.ang = this.rest - this.speedY * 2

        const groundFriction = .7
        const airFriction = .95

        if (this.air)
            this.speedX *= Math.pow(airFriction, dt)
        else this.speedX *= Math.pow(groundFriction, dt)

        this.speedY += GRAVITY * dt

        this.x += this.speedX * dt
        this.y += this.speedY * dt

        this.alpha -= .05 * dt
        if (this.alpha <= 0) this.dead = true

        if (collide(this, hero)) {
            hero.speed_x += this.speedX * .5
            hero.speed_y += this.speedY * .1

            if (this.bad && this.air) {
                hero.injure(.08)
                game.filter = {r: 0, g: 0, b: 0, a: .1}
            }
        }

        this.collision()
        this.applyToCells()
    }

    draw() {
        let BLOB = .12

        if (this.bad)
            BLOB = .2

        const pad = .02
        const segs = 2
        const curve = .3

        const w = this.w / segs

        const posY = this.y + this.h

        clear()
        rotate(this.x + this.w / 2, this.y + this.h / 2, this.ang - .5)

        for (let i = 0; i < segs; i ++) {
            const segX = this.x + this.w * (i / segs)

            rotate(segX, posY + this.h, curve)

            ctx.strokeStyle = rgb(.8, .75, 0, this.alpha)
            rotRect(segX, posY, w, this.h)

            if (!i) {
                ctx.strokeStyle = rgb(.4, .2, .1, this.alpha)
                rotRect(segX - pad, posY - pad, BLOB, BLOB)
            }
            if (i == segs - 1) {
                ctx.strokeStyle = rgb(.4, .2, .1, this.alpha)
                rotRect(segX + w - BLOB + pad, posY - pad, BLOB, BLOB)
            }
        }
        clear()
    }
}

class MonkeyBoss extends Base {
    constructor(x, y, mid) {
        super(x, y)

        this.w = 2.5
        this.h = 6.5

        this.y -= this.h
        this.yOft = 0
        this.walk = 1.2

        this.air = false
        this.lean = 0
        this.headY = 0
        this.headX = 0
        this.standOffset = 0

        this.dir = -1
        this.speed_x = 0
        this.speed_y = 0
    
        this.bananaCharge = 100
        this.banana = this.bananaCharge
        this.bananaThrowSpeed = 10
        this.thrown = false

        this.moveCharge = 500
        this.moveTimer = 200
        this.moveLength = 250

        this.flipSpeed = 0

        this.time = 0
        this.onHead = false

        this.recoverTimer = 300
        this.recover = 0

        this.speed = .007
        this.anger = 0

        this.mid = mid
        this.rise = false
        this.evil = false

        this.applyToCells()
    }

    collision() {
        const arr = this.collisionSetUp()
        this.air = true

        // COLLIDE WITH THE CELLS
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                if (mapItemExists(obj.x, obj.y, SOLID)) {
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)
    
                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0

                        this.flip(Math.sign(overlap.x) * -.1)
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0

                        if (overlap.y > 0)
                            this.air = false
                    }
                }
            }
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

    update() {
        this.walls()

        if (!this.evil) {
            if (hero.x > this.x - 6 && !hero.in_air) {
                say('jungleMonkey', this)
                this.evil = true
            }

            return
        }

        if (this.anger > 3) {
            if (!this.rise) {
                const key = new KeySlot(this.x + this.w / 2, this.headY + this.h, 0, true)
                key.active = true
            }

            this.rise = true
            this.speed_y = -.35 * dt

            let col = [.1, .1, .1, .6]
            if (!random(0, 3)) col = [1, .3, 0, .6]
            puff(this.x, this.y + this.h, this.w, 0, 1, .8, col, .01, .01, [-.1, .1], [0, .2])
            cam.boom(10, .1, .1)
            if (this.y <= 0) this.dead = true
        }

        this.speed_x *= Math.pow(.9, dt)
        this.speed_y += GRAVITY * dt

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        // head collision
        this.onHead = false
        const box = {
            x: this.headX - this.w / 2,
            y: this.headY,
            w: this.w,
            h: this.h
        }
        if (collide(box, hero) && !this.rise) {
            if (hero.y + hero.h < box.y + 1 && this.recover < this.recoverTimer / 4) {
                this.moveTimer = -1
                hero.speed_y = 0
                hero.y = box.y - hero.h
                hero.in_air = false
                this.onHead = true

                if (hero.animate.new == 'pound')
                    this.recover += dt
            }

            else if (!this.recover) hero.injure(.2)
        }

        if (this.recover) {
            this.recover += dt

            if (this.recover < 60) {
                this.speed_x += .015 * dt * Math.sign(this.mid - this.x + this.w / 2)
                this.flip(Math.sign(this.speed_x) * .1)
            }

            this.moveTimer = this.moveCharge
            this.banana = this.bananaCharge

            if (this.recover > this.recoverTimer) {
                this.recover = 0

                // throws bananas faster
                this.bananaCharge /= 2 // timer
                this.bananaThrowSpeed -= 1 // amount of warning you get

                // move faster
                this.speed += .003
                // decrease recovery time
                this.recoverTimer /= 1.2

                this.anger ++
            }
        }

        // only purposefully face hero if not moving
        else if (this.moveTimer > 0)
            this.flip(Math.sign((hero.x + hero.w / 2) - (this.x + this.w / 2)) * .1)

        this.flip(this.flipSpeed)

        this.collision()
        this.applyToCells()
    }

    draw() {
        const s = this.h
        this.walk += this.speed_x * 1.5 * dt
        this.time += dt

        const breathe = Math.sin(this.time / 20) * .2

        const tailBreathe = 1.6 + Math.sin(this.time / 70) * .2
        const tailRot = tailBreathe * this.dir + Math.PI

        let armAng = 0
        this.lean = -this.speed_x * 3
        this.lean *= .8

        const move = this.banana / (this.bananaThrowSpeed - Math.sin(this.banana / this.bananaThrowSpeed - Math.PI / 2))

        this.moveTimer -= dt

        if (this.evil && !game.pause && !this.rise) {
            if (this.moveTimer < 0) {
                this.banana = this.bananaCharge
                this.speed_x += this.speed * this.dir * dt

                if (this.moveTimer < -this.moveLength) {
                    if (!this.air)
                        this.speed_y = -.2
                    this.moveTimer = this.moveCharge
                }
            }

            else {
                this.banana -= dt

                if (this.banana < 0) {
                    if (move < -Math.PI * 2)
                        this.banana = this.bananaCharge

                    else {
                        armAng = Math.sin(move) * 2
                        this.lean = Math.sin(move) * .4 * -this.dir
                    }
                }
                else this.thrown = false
            }
        }

        const pad = .09 * s
        const faceW = .35 * s
        const faceH = .35 * s

        const eyeW = .06 * s
        const eyeH = .07 * s
        const eyeX = .06 * s
        const eyeY = .135 * s
        const eyeOft = .03 * s

        const pup = .03 * s

        const bodyW = .045 * s
        const bodyH = .33 * s

        const armH = .3 * s
        const hand = .05 * s
        const earW = .05 * s
        const earH = .15 * s
        const earY = .3
        const earPad = .04 * s

        const tailW = .05 * s
        const baseTailH = .15
        const tailH = (baseTailH - (1 - Math.abs(this.dir)) * baseTailH / 2) * s
        const tailSegs = 6

        let x = this.x + this.w / 2
        const y = this.y + this.yOft
        const breatheY = y + breathe

        const legY = y + faceH + bodyH
        const legH = this.h - (faceH + bodyH)

        const FACE = rgb(.6, .35, .15)
        const HAND = rgb(.25, .13, .05)
        const BODY = rgb(.13, .07, 0)

        const a = this.anger * .1
        const EYES = rgb(.8 + a / 2, .8 - a, .8 - a)

        // tail
        clear()
        rotate(x, legY, tailRot)
        ctx.strokeStyle = BODY
        for (let i = 0; i < tailSegs; i ++) {
            rotate(x, legY + i * tailH, (.08 + i / (4 + Math.sin(this.time / 50))) * -this.dir)
            rotRect(x - tailW / 2, legY + i * tailH, tailW, tailH)
        }
        clear()

        // body
        clear()
        ctx.strokeStyle = BODY
        const h = bodyH - breathe
        rotate(x, breatheY + faceH + h, this.lean)
        const bodyLean = rotRect(x - bodyW / 2, breatheY + faceH, bodyW, h)
        clear()
        const faceX = bodyLean.x1
        const faceY = bodyLean.y1 - faceH

        this.headX = faceX
        this.headY = faceY

        // face shape
        ctx.fillStyle = BODY
        fillRect(faceX - faceW / 2, faceY, faceW, faceH)

        // ears
        fillRect(faceX - faceW / 2, faceY + faceH * earY, -earW, earH)
        fillRect(faceX + faceW / 2, faceY + faceH * earY, earW, earH)

        ctx.fillStyle = FACE
        fillRect(faceX - faceW / 2 + pad, faceY + faceH * earY + earPad, -earW + earPad - pad, earH - earPad * 2)
        fillRect(faceX + faceW / 2 - pad, faceY + faceH * earY + earPad, earW - earPad + pad, earH - earPad * 2)

        // face skin
        ctx.fillStyle = FACE
        fillRect(faceX - faceW / 2 + pad / 2, faceY + pad / 2, faceW - pad, faceH - pad)

        const arm = dir => {
            const armY = faceY + faceH
            const breatheOft = Math.sin(time / 20 - Math.PI) * .1 * dir

            clear()
            ctx.strokeStyle = BODY
            rotate(faceX, armY, dir * .5 + Math.cos(this.walk) * .2 + breatheOft)
            rotRect(faceX - bodyW / 2, armY, bodyW, armH)

            ctx.strokeStyle = HAND
            const handPos = rotRect(faceX - bodyW / 2 + bodyW / 2 - hand / 2, armY + armH - hand / 2, hand, hand)
            clear()

            return handPos
        }

        let armPos = {}

        if (this.dir > 0) {
            armPos = arm(-1 + armAng)
            arm(1 - armAng / 2)
        }
        else {
            arm(-1 + armAng / 2)
            armPos = arm(1 - armAng)
        }

        if (move < -Math.PI && !this.thrown) {
            const forceX = .23 + (armPos.x1 - (hero.x + hero.speed_x * 30 + hero.w * 2)) * .08
            const forceY = .15 + (armPos.y1 - hero.y) * .06

            new Banana(armPos.x1, armPos.y1, -forceX, -forceY + random(-.1, 0, 0), true)
            this.thrown = true
        }
        if (this.banana == this.bananaCharge)
            this.thrown = false

        const eye = dir => {
            const eyePosX = faceX - eyeW / 2 + eyeX * dir + eyeOft * this.dir
            const eyePosY = faceY + eyeY

            ctx.fillStyle = EYES
            fillRect(eyePosX, eyePosY, eyeW, eyeH)

            const disX = eyePosX - hero.x + hero.w / 2
            const disY = eyePosY - hero.y

            let pupX = disX / 2
            let pupY = disY / 2

            if (this.recover) {
                const speed = .13
                const oft = dir + Math.sin(this.recover * .1)
                pupX = Math.sin(oft + this.recover * speed * dir)
                pupY = Math.cos(oft + this.recover * speed * dir)
            }

            if (pupX > 1) pupX = 1
            if (pupX < -1) pupX = -1
            if (pupY > 1) pupY = 1
            if (pupY < -1) pupY = -1

            const rangeX = eyeW - pup
            const rangeY = eyeH - pup

            ctx.fillStyle = rgb(0, 0, 0)
            fillRect(
                eyePosX + eyeW / 2 - pup / 2 - pupX * rangeX / 2,
                eyePosY + eyeH / 2 - pup / 2 - pupY * rangeY / 2,
                pup, pup)

            clear()
            ctx.strokeStyle = rgb(0, 0, 0)
            rotate(eyePosX, eyePosY, (.1 + this.anger * .08) * dir)
            rotRect(eyePosX, eyePosY, eyeW, eyeH * .3 * dir)
            clear()
        }

        eye(-1)
        eye(1)

        const leg = dir => {
            clear()
            ctx.strokeStyle = BODY
            rotate(x, legY, dir * Math.sin(this.walk) * .5)
            const pos = rotRect(x - bodyW / 2, legY, bodyW, legH)

            ctx.strokeStyle = HAND
            rotRect(x - bodyW / 2 + bodyW / 2 - hand / 2, legY + legH - hand, hand, hand)
            clear()

            return pos.y2 - this.y
        }

        leg(-1)
        const pos = leg(1)
        this.yOft += this.h - pos
    }
}