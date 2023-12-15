'use strict'

class Cannon extends Base {
    constructor(x, y) {
        super(x, y)

        this.w = 2
        this.h = 3

        this.canAng = .5
        this.timer = 100
        this.active = false
    }

    update() {
        if (!this.active) return

        this.timer -= dt
        if (this.timer < 0) {
            const x_dir = Math.sin(this.canAng)
            const y_dir = Math.cos(this.canAng)

            const vx = -x_dir * 1.5
            const vy = -y_dir * .52

            new CannonBall(
                this.x + this.w / 2 - x_dir * this.w,
                this.y - y_dir * 3.5,
                vx, vy, false, [.1, .1, .1])

            cam.boom(20, .5, .5)

            this.timer = 120
        }
    }

    draw() {
        const rimw = this.w * 1.1
        const rimh = this.w * .2
        const pad = this.w * 2
        const padh = 1
        const lift = 3.5

        ctx.strokeStyle = rgb(.15, .15, .15)
        clear()
        rotate(this.x + this.w / 2, this.y + this.h - lift, this.canAng)
        rotRect(this.x, this.y - lift, this.w, this.h)

        ctx.strokeStyle = rgb(.1, .1, .1)
        rotRect(this.x + this.w / 2 - rimw / 2, this.y - lift, rimw, rimh)
        clear()

        ctx.fillStyle = rgb(.17, .17, .17)
        fillRect(this.x + this.w / 2 - pad / 2, this.y - padh, pad, padh)
    }
}