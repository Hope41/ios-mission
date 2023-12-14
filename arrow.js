'use strict'

class Arrow {
    constructor(curr, col = [.5, .5, .5]) {
        this.x = 0
        this.y = 0

        this.oft = .3

        this.setCurr(curr)

        this.time = random(0, 10, 0)
        this.active = true
        this.col = col
    }

    setCurr(curr) {
        this.curr = curr

        this.x = curr.x + curr.w / 2
        this.y = curr.y - this.oft
    }

    draw() {
        if (!this.active) return
        this.time += .2 * dt

        const SIZE = .75
        const x = this.x
        const y = this.y + Math.sin(this.time) * .1

        const data = [
            x, y,
            x - SIZE / 2, y - SIZE / 2,
            x + SIZE / 2, y - SIZE / 2,
            x, y
        ]

        ctx.fillStyle = rgb(this.col[0], this.col[1], this.col[2])
        lineFill(data)

        ctx.strokeStyle = rgb(this.col[0] - .3, this.col[1] - .3, this.col[2] - .3)
        line(data, .04)
    }
}