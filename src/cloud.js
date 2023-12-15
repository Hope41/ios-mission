'use strict'
function puff(x, y, w, h, amt, size, col, grow, fade, speedx = [0, 0], speedy = [0, 0], momentumx = .95, momentumy = .95) {
    // allow random colors
    let color = col

    for (let i = 0; i < amt; i ++) {
        if (col[0] == 'random') color = [random(0, 1, 0), random(0, 1, 0), random(0, 1, 0), col[1]]

        game.clouds.push(new Cloud(
            x + random(0, w - size, 0),
            y + random(0, h - size, 0),
            size, size, color, grow, fade,
            random(speedx[0], speedx[1], 0),
            random(speedy[0], speedy[1], 0),
            momentumx, momentumy))
    }
}

class Cloud {
    constructor(x, y, w, h, color, grow, fade, speedX = 0, speedY = 0, mX = .95, mY = .95) {
        this.kill = false

        // coords
        this.w = w
        this.h = h
        this.x = x + w / 2
        this.y = y + h / 2

        // details
        this.color = [color[0], color[1], color[2], color[3]]
        this.growSpeed = grow
        this.fadeSpeed = fade
        this.speedX = speedX
        this.speedY = speedY

        // momentum
        this.mX = mX
        this.mY = mY
    }

    update() {
        this.color[3] -= this.fadeSpeed * dt
        this.w += this.growSpeed * dt
        this.h += this.growSpeed * dt
        this.speedX *= Math.pow(this.mX, dt)
        this.speedY *= Math.pow(this.mY, dt)
        this.x += this.speedX * dt
        this.y += this.speedY * dt

        ctx.fillStyle = rgb(this.color[0], this.color[1], this.color[2], this.color[3])
        fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h)

        if (this.color[3] <= 0 || this.w < 0 || this.h < 0) this.kill = true
    }
}