'use strict'

class Barrel extends Base {
    constructor(x, y) {
        super(x, y)

        this.w = 1.4
        this.h = 1.9
        this.x = x - this.w / 2
        this.y = y - this.h

        this.applyToCells()
    }

    update() {

    }

    draw() {
        const PANNEL_GAP = .2
        const PANNEL = .18
        const BAR_GAP = .4
        const BAR = .18

        // MAIN
        ctx.fillStyle = rgb(.36, .25, .13)
        fillRect(this.x, this.y, this.w, this.h)

        // PANNEL
        ctx.fillStyle = rgb(.2, .2, .2, .2)
        fillRect(this.x + PANNEL_GAP, this.y, PANNEL, this.h)
        fillRect(this.x + this.w - PANNEL_GAP - PANNEL, this.y, PANNEL, this.h)

        // BAR
        ctx.fillStyle = rgb(.18, .18, .18, .9)
        fillRect(this.x, this.y + BAR_GAP, this.w, BAR)
        fillRect(this.x, this.y + this.h - BAR_GAP - BAR, this.w, BAR)

        // GRADIENT
        const RES = 10
        const SEG = this.w / RES
        for (let i = 0; i < RES; i ++) {
            const fluc = i - (i * i) / (RES - 1)
            const s = .7 + (fluc / RES)
            ctx.fillStyle = rgb(0, 0, 0, 1 - s)
            fillRect(this.x + i * SEG, this.y, SEG, this.h)
        }
    }
}