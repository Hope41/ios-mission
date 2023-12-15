'use strict'

class Sign extends Base {
    constructor(x, y, message) {
        super(x, y)

        this.message = message

        this.w = 1.2
        this.h = 1.3

        this.x = x + .5 - this.w / 2
        this.y = y - this.h

        this.arrow = new Arrow(this, [.8, .6, 0])
        this.arrow.active = false

        this.applyToCells()
    }

    update() {
    }

    draw() {
        if (collide(hero, this) && !chat.active) {
            this.arrow.active = true
            if (key.down) chat.say(this, [.8, .6, 0], this.message)
        }
        else this.arrow.active = false

        const POST_W = .35 * this.w
        const SIGN_H = .7 * this.w
        const PAD = .07 * this.w
        const WRITING = .07 * this.w

        // outline
        ctx.fillStyle = rgb(.5, .29, .08)
        fillRect(this.x, this.y, this.w, SIGN_H)

        // main
        ctx.fillStyle = rgb(.55, .35, .15)
        fillRect(this.x + PAD, this.y + PAD, this.w - PAD * 2, SIGN_H - PAD * 2)

        // writing
        ctx.fillStyle = rgb(0, 0, 0, .2)
        fillRect(this.x + PAD * 2, this.y + PAD * 2, this.w - PAD * 4, WRITING)
        fillRect(this.x + PAD * 2, this.y + PAD * 4, this.w - PAD * 8, WRITING)
        fillRect(this.x + PAD * 2, this.y + PAD * 6, this.w - PAD * 6, WRITING)

        // post
        ctx.fillStyle = rgb(.45, .27, .1)
        fillRect(this.x + this.w / 2 - POST_W / 2, this.y + SIGN_H, POST_W, this.h - SIGN_H)

        // shade
        ctx.fillStyle = rgb(0, 0, 0, .1)
        fillRect(this.x, this.y, this.w / 2, SIGN_H)

        this.arrow.draw()
    }
}