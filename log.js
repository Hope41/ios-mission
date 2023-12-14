'use strict'
class Log extends Base {
    constructor(x, y) {
        super(x, y)

        this.w = 2
        this.h = .9

        this.y -= this.h / 2
        this.speed_y = 0
        this.settle = this.y

        this.applyToCells()
    }

    update() {
        const momentum = .9
        const speed = .1
        const damping = 3
        const impact = 1
        const heroWeight = .007

        // make collision with the hero
        if (collide(this, hero.box)) {
            const move = merge(hero, this, hero.speed_x, hero.speed_y)

            if (move.y) {
                if (move.y > 0) {

                    // jolt log downwards
                    if (hero.in_air)
                        this.speed_y += hero.speed_y * impact * dt

                    // set hero pos to top of log
                    hero.y += ((this.speed_y * momentum) / damping - move.y) * dt

                    // change hero speed
                    hero.speed_y = heroWeight
                    hero.in_air = false
                }

                else hero.y -= move.y
            }
            else hero.x -= move.x
        }
        
        // change the speeds
        this.speed_y += (this.settle - this.y) * speed * dt

        this.speed_y *= Math.pow(momentum, dt)
        this.y += (this.speed_y / damping) * dt

        this.applyToCells()
    }

    draw() {
        ctx.fillStyle = rgb(.3, .15, .05)
        fillRect(this.x, this.y, this.w, this.h)

        const WOOD = .5
        const BARK = .09

        ctx.fillStyle = rgb(.47, .23, .1)
        fillRect(this.x + BARK, this.y + BARK, WOOD, this.h - BARK * 2)
    }
}