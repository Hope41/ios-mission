'use strict'

class Chest extends Base {
    constructor(x, y) {
        super(x, y)
        this.powerful = true
        this.do_kill = 0
    }

    kill() {
        if (!this.do_kill) {
            pound.play()
            this.releaseCoins()
            puff(this.x, this.y, this.w, this.h, 5, 1, [1, .95, .9, .5], .006, .007, [-.2, .2], [-.2, .2])
            cam.boom(30, .5, .5)
        }
        this.do_kill += dt

        this.alpha -= .07 * dt
        if (this.alpha < 0) {
            this.dead = true
            this.applyToCells()
        }
    }

    update() {
        if (this.do_kill > 0) this.kill()

        if (collide(this, hero.box)) {
            const move = merge(hero.box, this, hero.speed_x, hero.speed_y)

            if (move.x) {
                hero.x -= move.x
                hero.speed_x = 0
            }
            else if (move.y) {
                hero.y -= move.y
                hero.speed_y = 0

                if (move.y > 0)
                    hero.in_air = false
            }

            if (hero.offensive) this.kill()
        }

        this.applyToCells()
    }

    draw() {
        const LID = 1
        const GRAD_AMT = .07
        const GRAD_RES = 4

        const PANEL_W = .2
        const SEAM_H = .1
        const LOCK_W = .3
        const LOCK_H = .4
        const LOCK_Y = -.1

        // BODY
        ctx.fillStyle = rgb(this.main.r, this.main.g, this.main.b, this.alpha)
        fillRect(this.x, this.y + LID, this.w, this.h - LID)

        // SHADE
        for (let i = 0; i < GRAD_RES; i ++) {
            const sha = (i * GRAD_AMT / GRAD_RES) - GRAD_AMT
            const y = this.y + i * (LID / GRAD_RES)
            const h = LID / GRAD_RES

            // MAIN
            ctx.fillStyle = rgb(this.main.r - sha, this.main.g - sha, this.main.b - sha, this.alpha)
            fillRect(this.x, y, this.w, h)

            // PANEL
            ctx.fillStyle = rgb(this.side.r - sha, this.side.g - sha, this.side.b - sha, this.alpha)
            fillRect(this.x, y, PANEL_W, h)
            fillRect(this.x + this.w - PANEL_W, y, PANEL_W, h)
        }

        // SEAM
        ctx.fillStyle = rgb(0, 0, 0, this.alpha * .4)
        fillRect(this.x, this.y + LID, this.w, SEAM_H)

        // PANELS
        ctx.fillStyle = rgb(this.side.r, this.side.g, this.side.b, this.alpha)
        fillRect(this.x, this.y + LID, PANEL_W, this.h - LID)
        fillRect(this.x + this.w - PANEL_W, this.y + LID, PANEL_W, this.h - LID)

        // LOCK
        ctx.fillStyle = rgb(this.side.r - .06, this.side.g - .06, this.side.b - .06, this.alpha)
        fillRect(this.x + this.w / 2 - LOCK_W / 2, this.y + LID + LOCK_Y, LOCK_W, LOCK_H)
    }
}

class GoldenChest extends Chest {
    constructor(x, y) {
        super(x, y)

        this.w = GOLD_CHEST_W
        this.h = GOLD_CHEST_H

        this.x = x
        this.y = y - this.h

        this.main = {
            r: .37,
            g: .24,
            b: .12
        }
        this.side = {
            r: .6,
            g: .4,
            b: .05
        }

        this.defineCoins(25, 30)
        this.applyToCells()
    }

    update() {
        super.update()
    }
}

class SilverChest extends Chest {
    constructor(x, y) {
        super(x, y)

        this.w = SILV_CHEST_W
        this.h = SILV_CHEST_H

        this.x = x
        this.y = y - this.h

        this.main = {
            r: .37,
            g: .24,
            b: .12
        }
        this.side = {
            r: .3,
            g: .3,
            b: .35
        }

        this.defineCoins(7, 10)
        this.applyToCells()
    }

    update() {
        super.update()
    }
}