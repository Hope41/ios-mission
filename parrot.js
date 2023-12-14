'use strict'

class Parrot extends Base {
    constructor(x, y, landRange, swamp) {
        super(x, y)

        this.w = 1
        this.bodyH = 1
        this.h = 1.2

        this.landRange = landRange
        this.swamp = swamp

        this.col = [
            random(0, .6, 0),
            random(.4, .7, 0),
            random(0, .6, 0)
        ]

        this.tailW = random(.15, .17, 0)
        this.tailH = random(.3, .35, 0)
        this.beakW = random(.1, .2, 0)

        this.speed_x = 0
        this.speed_y = 0

        this.blink = 0
        this.peck = 0

        this.hop = 0
        this.hopping = 0

        this.ang = 0
        this.dir = 1

        this.flipSpeed = 0
        this.flipChange = 0

        this.fly = 0
        this.flyLength = 0

        this.flyMom = .96
        this.gndMom = .85

        this.flap = 0
        this.time = random(0, 10, 0)

        this.goalSwitch = 0
        this.goalOft = {x: 0, y: 0}

        this.air = false

        this.applyToCells()
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

        // hop over obstacles
        if (this.hop < 0 && !this.air &&
            mapItemExists((this.x + this.w / 2) + this.dir, this.y + this.h - .5, SOLID)) {
            this.speed_y = -.3
            this.air = true

            // give it a few extra hops
            this.hopping += 30
        }

        if (this.y > this.swamp - 5) {
            this.fly = -1
            this.speed_y -= .01 * dt
        }
    }

    update() {
        this.walls()

        let align = true

        this.fly -= dt
        // speed up timer if hero is on his way to the treetops
        if (hero.y < this.y - 7) this.fly -= dt

        if (this.fly < 0) {
            align = false
            this.ang -= .12 * dt
            this.flap += .5 * dt
            this.goalSwitch -= dt

            if (this.goalSwitch < 0) {
                this.goalOft.x = random(-4, 4, 0)
                this.goalOft.y = random(-3, 2, 0)

                this.goalSwitch = 50
            }

            if (this.ang < -Math.PI / 2.5)
                this.ang = -Math.PI / 2.5

            if (collide(this, hero))
                hero.speed_x += this.speed_x * .05 * dt

            const xDis = (hero.x + hero.w / 2) - (this.x + this.w / 2 + this.goalOft.x)
            const yDis = (hero.y + this.goalOft.y) - (this.y + this.h / 2)

            // normal flying
            let vY = yDis / 800 * dt
            let vX = xDis / 800 * dt

            const maxX = .01
            const maxY = .01

            if (vY > maxY) vY = maxY
            if (vY < -maxY) vY = -maxY
            if (vX < -maxX) vX = -maxX
            if (vX > maxX) vX = maxX

            this.speed_y += vY
            this.speed_x += vX

            this.flip(Math.sign(this.speed_x || 1) * .3)

            // reset flying
            if ((this.fly < -this.flyLength && hero.y > this.landRange) ||
                (hero.y > this.y + 10 && mapItemExists(this.x, this.y + this.h + .5, SOLID))) {
                this.flap = 0
                this.fly = random(400, 600)
                this.flyLength = random(550, 750)
            }
        }

        else {
            this.flipChange -= dt
            if (this.flipChange < 0) {
                this.flip(-this.dir * .3)
                this.flipChange = random(500, 300, 0)
            }

            this.hop -= dt
            if (this.hop < 0) {
                this.speed_x += this.dir * .004 * dt
                if (!this.air) this.speed_y = -.2

                if (this.hop < -this.hopping) {
                    this.hop = random(100, 200, 0)
                    this.hopping = random(20, 40, 0)
                }
            }

            else {
                this.peck -= dt
                if (this.peck < 0) {
                    align = false
                    this.ang -= .3 * dt
                    if (this.ang < -Math.PI / 2) this.peck = random(200, 500, 0)
                }
            }
        }

        if (align)
            this.ang *= .6

        if (this.fly > 0)
            this.speed_y += .03 * dt

        if (this.air) {
            this.speed_x *= Math.pow(this.flyMom, dt)
            this.speed_y *= Math.pow(this.flyMom, dt)
        }

        else {
            this.speed_x *= Math.pow(this.gndMom, dt)
            this.speed_y *= Math.pow(this.gndMom, dt)
        }

        this.y += this.speed_y * dt
        this.x += this.speed_x * dt

        this.flip(this.flipSpeed)

        this.collision()
        this.applyToCells()
    }

    draw() {
        this.time += .03 * dt

        const w = .5
        const posX = this.x + w / 2

        const breathe = Math.sin(this.time) * .04
        const bob = Math.sin(this.flap) * .08 + breathe

        const center = posX + w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const rect = (x, y, w, h) => {rotRect(flip(x), y, w * this.dir, h)}
        const rot = (x, y, angle) => {rotate(flip(x), y, angle * this.dir)}

        const s = this.bodyH
        const y = this.y + bob

        const TAIL_W = this.tailW * s
        const TAIL_H = this.tailH * s

        const EYE = .2 * s
        const PUP = .09 * s

        const legW = .1 * s

        let blink = 0
        this.blink -= .3 * dt
        if (this.blink < 0) {
            blink = -Math.sin(this.blink) * EYE
            if (this.blink < -Math.PI)
                this.blink = random(40, 80, 0)
        }

        // legs
        ctx.fillStyle = rgb(.8, .5, 0)
        fillRect(flip(posX + w / 2), y + this.bodyH, legW * this.dir, this.h - this.bodyH - bob)

        // body
        rot(flip(posX + w / 2), y + this.bodyH, this.ang)
        ctx.strokeStyle = shift(this.col)
        rect(posX, y, w, this.bodyH)
        rect(posX, y + this.bodyH, TAIL_W, TAIL_H)

        // eye
        const eyeX = posX + w - EYE - .1 * s
        const eyeY = y + .15 * s

        ctx.strokeStyle = rgb(1, 1, 1)
        rect(eyeX, eyeY, EYE, EYE)

        const ang = Math.atan2( hero.x + hero.w / 2 - posX + w / 2, hero.y - y) * this.dir
        const pupX = Math.sin(ang) * (EYE / 2 - PUP / 2)
        const pupY = Math.cos(ang) * (EYE / 2 - PUP / 2)

        ctx.strokeStyle = rgb(0, 0, 0)
        rect(eyeX + EYE / 2 - PUP / 2 + pupX, eyeY + EYE / 2 - PUP / 2 + pupY, PUP, PUP)

        ctx.strokeStyle = shift(this.col, -.1)
        rect(eyeX, eyeY, EYE, blink)

        // beak
        const beakY = .2 * s
        const beakW = this.beakW * s
        const beakH = .1 * s

        ctx.strokeStyle = rgb(1, .8, 0)
        rect(posX + w, y + beakY, beakW, beakH)

        // wings
        const wingW = .2 * s
        const wingH = .4 * s
        ctx.strokeStyle = shift(this.col, -.1)

        rot(posX + wingW / 2, y + this.bodyH / 2, -Math.sin(this.flap) * .5 - .2)
        rect(posX, y + this.bodyH / 2, wingW, wingH)
        clear()
    }
}