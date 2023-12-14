'use strict'

class Mine extends Base {
    constructor(x, y) {
        super(x, y)
        this.x = x
        this.y = y
        this.w = .9
        this.h = .9

        this.damage = .2

        this.rangeX = 4
        this.rangeY = 4

        this.flash = random(0, 10, 0)
        this.flashSpeed = random(.05, .3, 0)
        this.active = false
        this.do_kill = 0
        this.time = random(0, 10, 0)

        this.applyToCells()
    }

    kill() {
        if (!this.do_kill) {
            pound.play()
            const size = 6
            const boom = {
                x: this.x + this.w / 2 - size / 2,
                y: this.y + this.h / 2 - size / 2,
                w: size,
                h: size
            }

            // set game.activeMine so that sharks can crash into it
            game.activeMine = [boom, this.id]

            if (collide(hero.box, boom))
                hero.injure(this.damage)

            puff(this.x, this.y, this.w, this.h, 3, 1, [0, 0, 0, .5], .02, .005, [-.2, .2], [-.2, .2])
            puff(this.x, this.y, this.w, this.h, 2, 1, [1, .3, 0, .6], -.002, .007, [-.2, .2], [-.2, .2])
            puff(boom.x, boom.y, size, size, 1, size, [0, 0, 0, .3], -.05, .01)
            cam.boom(15, .8, .8)
        }
        this.do_kill += dt
        this.alpha -= .07 * dt

        if (this.alpha < 0) {
            this.dead = true
            this.applyToCells()
        }
    }

    update() {
        this.time += .02 * dt

        // reset game.activeMine
        if (game.activeMine && game.activeMine[1] == this.id) game.activeMine = false

        if (this.do_kill || collide(hero.box, this)) {
            this.kill()
            return
        }

        const dis_x = (hero.box.x + hero.box.w / 2) - (this.x + this.w / 2)
        const dis_y = (hero.box.y + hero.box.h / 2) - (this.y + this.h / 2)

        if (Math.abs(dis_x) < this.rangeX && Math.abs(dis_y) < this.rangeY)
            this.active = true

        if (this.active) {
            this.flashSpeed += .025 * dt
            if (this.flashSpeed > 1) this.kill()
        }

        this.flash += this.flashSpeed * dt
    }

    draw() {
        const y = this.y + Math.sin(this.time) * .4

        const f = this.flashSpeed
        ctx.fillStyle = rgb(.3 + f / 2, .3 - f / 10, .3 - f / 6, this.alpha)
        fillRect(this.x, y, this.w, this.h)

        const PAD_W = .5
        const PAD_H = .15
        const FLASH = .25

        ctx.fillStyle = rgb(.2, .2, .2, this.alpha)
        fillRect(this.x - PAD_H / 2, y + this.h / 2 - PAD_W / 2, PAD_H, PAD_W)
        fillRect(this.x + this.w - PAD_H / 2, y + this.h / 2 - PAD_W / 2, PAD_H, PAD_W)
        fillRect(this.x + this.w / 2 - PAD_W / 2, y - PAD_H / 2, PAD_W, PAD_H)
        fillRect(this.x + this.w / 2 - PAD_W / 2, y + this.h - PAD_H / 2, PAD_W, PAD_H)

        ctx.fillStyle = rgb(.5 + Math.sin(this.flash) * .5, 0, 0, this.alpha)
        fillRect(this.x + this.w / 2 - FLASH / 2, y + this.h / 2 - FLASH / 2, FLASH, FLASH)
    }
}