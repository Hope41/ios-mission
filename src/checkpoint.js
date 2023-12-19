'use strict'

class Checkpoint extends Base {
    constructor(x, y, sequence = '') {
        super(x, y)

        this.w = 1.5
        this.h = 4
        this.world = map.curr

        this.y -= this.h

        this.pressY = 0
        this.pressSpeed = 0
        this.pressH = 1
        this.col = rgb(0, .6, .7)

        this.state = 'disable'
        this.sequence = sequence

        this.applyToCells()
    }

    go() {
        hero.resurrect()
        hero.restart()

        // cencel if the last checkpoint is not in the world
        if (this.world != map.curr)
            return

        // set hero to checkpoint
        hero.collisionBox()
        hero.x = this.x + this.w / 2 - hero.w / 2
        hero.y = this.y + this.h - hero.h
        hero.collisionBox()
    }

    change() {
        if (hero.checkpoint && hero.checkpoint != this)
            hero.checkpoint.disable()
        hero.checkpoint = this
    }

    enable() {
        this.state = 'enable'

        this.col = rgb(0, .7, 0)
        this.pressSpeed += (this.pressH - this.pressY) / 5 * dt
    }

    disable() {
        this.state = 'disable'

        this.col = rgb(0, .6, .7)
        this.pressSpeed -= (this.pressY / 5) * dt
    }

    update() {
        // if hero touches new checkpoint, disable the old one.
        if (collide(this, hero))
            this.change()

        // update
        if (this.state == 'enable') this.enable()
        else this.disable()

        this.pressSpeed *= Math.pow(.8, dt)
        this.pressY += this.pressSpeed * dt
    }

    draw() {
        const padH = .2
        const checkW = .7 * this.w
        const checkH = .2 + this.pressY
        const markW = .3 * this.w
        const markH = .15
        const markY = .1

        if (checkH > 0) {
            ctx.fillStyle = rgb(.1, .1, .1)
            fillRect(this.x + this.w / 2 - checkW / 2, this.y + this.h - padH, checkW, -checkH)

            ctx.fillStyle = this.col
            fillRect(this.x + this.w / 2 - markW / 2, this.y + this.h - padH - checkH + markY, markW, markH)
        }

        ctx.fillStyle = rgb(.15, .15, .15)
        fillRect(this.x, this.y + this.h, this.w, -padH)
    }
}