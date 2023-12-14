'use strict'
class Cam {
    constructor() {
        this.x = hero.x
        this.y = hero.y

        this.speed_x = 0
        this.speed_y = 0

        this.momentum = .6
        this.damping = 11

        this.booms = []

        this.goal = {}
        this.reset()
    }

    set(obj) {this.goal = obj}
    reset() {this.goal = hero.box}
    boom(time, x_shake, y_shake) {this.booms.push({time, shake: {x: x_shake, y: y_shake}})}

    update() {
        // MOVE
        const goal_x = this.goal.x + this.goal.w / 2
        const goal_y = this.goal.y

        this.speed_x *= Math.pow(this.momentum, DT)
        this.speed_y *= Math.pow(this.momentum, DT)

        this.speed_x += (goal_x - this.x) / this.damping * DT
        this.speed_y += (goal_y - this.y) / this.damping * DT

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        // SHAKE
        for (let i = 0; i < this.booms.length; i ++) {
            const item = this.booms[i]
            item.time -= DT

            if (item.time > 0) {
                this.x += random(-item.shake.x, item.shake.x, 0)
                this.y += random(-item.shake.y, item.shake.y, 0)
            }
            else this.booms.splice(i, 1)
        }
    }
}