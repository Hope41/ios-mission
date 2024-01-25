'use strict'

class KeySlot extends Base {
    constructor(x, y, door, boring = false) {
        super(x, y)

        this.w = 1
        this.h = .5

        this.y -= 1.5

        this.active = false
        this.door = door
        this.taken = false

        if (!boring)
            map.lev[map.curr].key = this

        this.boring = boring

        this.applyToCells()
    }

    update() {
        if (this.boring && collide(hero, this) && this.active) {
            hero.key = true
            hero.coins = 0

            puff(
                this.x, this.y, this.w, this.h,
                5, .3, ['random', 1],
                .01, .01, [-.1, .1], [-.1, .1])

            this.active = false
            this.taken = true
        }
    }

    draw() {
        let s = this.w
        if (this.boring)
            s = this.w * .8

        const HOLD = .5 * s
        const THUMB = .25 * s

        const STICKH = .15 * s
        const STICKY = .1 * s

        const PRONGW = .12 * s
        const PRONGH = .16 * s
        const PRONGX = .16 * s

        const x = this.x
        const y = this.y + Math.sin(time / 10) * .1

        if (this.active) {
            if (!this.boring) {
                // glow
                ctx.strokeStyle = rgb(1, 1, 1, .1)

                const size = 1.4

                const glowX = x - size / 2 + this.w / 2
                const glowY = y - size / 2 + this.h / 2

                clear()
                rotate(glowX + size / 2, glowY + size / 2, Math.sin(time / 50 + Math.cos(time / 25)))
                rotRect(glowX, glowY, size, size)
                clear()
            }

            // key
            ctx.strokeStyle = rgb(.7, .55, 0)

            let rot = time / 10
            if (this.boring)
                rot = Math.sin(time / 10 + Math.cos(time / 5)) * .3

            clear()
            rotate(x + s / 2, y + this.h / 2, rot)

            rotRect(x, y, HOLD, HOLD)
            rotRect(x + HOLD, y + STICKY, s - HOLD, STICKH)

            rotRect(x + HOLD + PRONGX, y + STICKY + STICKH, PRONGW, PRONGH)
            rotRect(x + s - PRONGW, y + STICKY + STICKH, PRONGW, PRONGH)

            ctx.strokeStyle = rgb(.65, .4, 0)
            rotRect(x + HOLD / 2 - THUMB / 2, y + HOLD / 2 - THUMB / 2, THUMB, THUMB)

            clear()
        }
    }
}