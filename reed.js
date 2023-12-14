'use strict'

class Reed extends Base {
    constructor(x, y, dangle = false, height = random(4, 7, 0), log = false, segs = 10) {
        super(x, y)

        this.w = 1
        this.h = height

        if (!dangle) this.y -= this.h
        this.dangle = dangle

        this.leaf = random(.85, 1.2, 0)

        this.swing = 0
        this.swingSpeed = 0

        this.stepToHold = 0
        this.stepToHoldIdx = 0
        this.onReed = 0
        this.holdingHero = false
        this.release = 30
        this.oft = {x: 0, y: 0}
        this.stand = hero.h / 2

        this.log = log
        if (log)
            this.swingSpeed = .1
        this.standOffset = 0

        this.segs = segs

        this.applyToCells()
    }

    update() {

    }

    draw() {
        if (this.release)
            this.release += dt

        const momentum = .95
        const swingingMomentum = .99
        const damping = 10
        const equalize = .1
        const heroPower = .04
        const jumpEfficiency = .6
        const initialSwingForce = .3

        this.swingSpeed -= this.swing * equalize

        const leaves = this.segs
        const leafW = .8
        const leafH = .1
        const stem = .1

        if (!this.dangle && collide(hero, this) && key.up)
            hero.speed_x += (this.x + this.w / 2 - (hero.x + hero.w / 2)) / 50 * dt

        clear()

        let ahr = this.y + this.h
        if (this.dangle) ahr = this.y

        rotate(this.x + this.w / 2 + stem / 2, ahr, this.swing)

        let ang = this.leaf
        if (this.dangle) ang = -this.leaf

        ctx.strokeStyle = rgb(.01, .03, 0)
        for (let i = 1; i < leaves; i ++) {
            const x = this.x + this.w / 2
            const y = this.y + i * this.h / leaves

            rotate(x + stem / 2, y, ang + Math.sin(time * .02 + i) * .1)
            rotRect(x, y - leafH / 2, leafW, leafH)
            rest()

            rotate(x + stem / 2, y, Math.PI - ang + Math.sin(time * .015 + i) * .1)
            const pos = rotRect(x, y - leafH / 2, leafW, leafH)
            rest()

            const step = {
                x: pos.x1 - leafW / 4,
                y: pos.y1 - leafH,
                w: leafW / 2,
                h: this.h / leaves
            }

            // get new position of step if holding on
            if (i == this.stepToHoldIdx) {
                this.stepToHold = step
                this.stepToHoldIdx = i
            }

            if (collide(hero, step)) {
                // hold on to dangling reeds
                if (this.dangle) {
                    if (i > 3 &&
                        hero.y < step.y &&
                        !this.log &&
                        !this.holdingHero &&
                        this.release > 30 &&
                        !hero.onReed) {
                        this.stepToHold = step
                        this.stepToHoldIdx = i

                        this.release = 0
                        this.holdingHero = true
                        this.swingSpeed = initialSwingForce * (Math.sign(hero.speed_x) || 1)
                        key.up = false
                        this.oft.x = hero.x - step.x
                        this.oft.y = hero.y + this.stand - step.y
                    }
                }

                // climb up straight reeds
                else {
                    const base = hero.y + hero.h
                    if (base - hero.speed_y <= step.y && base >= step.y) {
                        const move = hero.y + hero.h - step.y
                        hero.y -= move
                        hero.box.y -= move
                        hero.in_air = false
                        hero.speed_y = 0
                    }
                }
            }

            if (i == leaves - 1 && this.log) {
                const WOOD = .4
                const BARK = .09
                const w = 2
                const h = .75
                const x = pos.x1 + .1 - w / 2
    
                ctx.fillStyle = rgb(.3, .15, .05)
                fillRect(x, pos.y1, w, h)
        
                ctx.fillStyle = rgb(.47, .23, .1)
                fillRect(x + BARK, pos.y1 + BARK, WOOD, h - BARK * 2)

                const box = {x, y: pos.y1, w, h}

                if (collide(hero, box)) {
                    if (!this.standOffset)
                        this.standOffset = hero.x - x

                    const move = merge(hero, box, hero.speed_x, hero.speed_y)

                    if (move.y) {
                        this.standOffset += hero.speed_x

                        hero.speed_y = GRAVITY
                        hero.y -= move.y
                        hero.x = x + this.standOffset

                        if (move.y > 0)
                            hero.in_air = false
                    }
                    else {
                        hero.x -= move.x
                        hero.speed_x = 0
                    }
                }
                else this.standOffset = 0

                this.swing += this.swingSpeed / 20 * dt
            }
        }

        ctx.strokeStyle = rgb(.03, .07, 0)
        rotRect(this.x + this.w / 2, this.y, stem, this.h)

        clear()

        // hold onto dangling reed
        if (!this.log && this.dangle) {
            if (this.holdingHero) {
                hero.onReed += dt

                // snap hero position
                hero.x = this.oft.x + this.stepToHold.x
                hero.y = this.oft.y + this.stepToHold.y - this.stand
                this.swingSpeed += hero.speed_x * heroPower * dt

                this.oft.x *= .7
                this.oft.y *= .7

                if (hero.onReed < 40 && !key.left && !key.right)
                    key.up = false
            
                // detect if hero should jump
                else if (key.up || key.down) {
                    this.stepToHold = 0
                    this.stepToHoldIdx = 0
                    this.holdingHero = false
                    hero.onReed = 0
                    hero.speed_y = -Math.abs(jumpEfficiency * this.swingSpeed) - Math.abs(hero.speed_x)
                    this.release += dt
                    key.up = false
                }
            }

            // set speeds
            if (this.holdingHero) this.swingSpeed *= Math.pow(swingingMomentum, dt)
            else this.swingSpeed *= Math.pow(momentum, dt)

            this.swing += this.swingSpeed / damping * dt
        }
    }
}