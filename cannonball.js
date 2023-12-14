'use strict'

class CannonBall extends Base {
    constructor(x, y, speed_x, speed_y, ship = false, col = [.2, .2, .2]) {
        super(x, y)

        this.speed_x = speed_x
        this.speed_y = speed_y

        this.damage = .3

        this.w = 1.8
        this.h = 1.8
        this.x = x - this.w / 2
        this.y = y - this.h / 2

        this.lifetime = 150
        this.do_kill = 0

        this.ship = ship
        this.col = col

        map.lev[map.curr].live.push(this)
    }

    collision() {
        const arr = this.collisionSetUp(false)

        for (let i = arr.length; i --;) {
            const obj = arr[i]
            if (collide(this, obj) && mapItemExists(obj.x, obj.y, SOLID))
                this.kill()
       }
    }

    kill() {
        if (!this.do_kill) {
            pound.play()
            puff(this.x, this.y, this.w, this.h, 5, 1.3, [.3, .3, .3, .5], .03, .01, [-.2, .2], [-.2, .2])
            puff(this.x, this.y, this.w, this.h, 5, .8, [1, .3, 0, .5], -.03, .02, [-.5, .5], [-.5, .5])
            cam.boom(5, .2, .2)
            this.dead = true
        }
        this.do_kill += dt
    }

    update() {
        this.collision()

        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.speed_x *= Math.pow(.98, dt)
        this.speed_y += GRAVITY * dt

        if (!this.do_kill && !hero.offensive && collide(hero.box, this))
            hero.injure(this.damage)

        // explode
        const box = {
            x: Math.floor(this.x + this.w / 2),
            y: Math.floor(this.y + this.h / 2)
        }

        this.lifetime -= dt
        if (this.lifetime < 0 || (this.ship && collide(this, this.ship.topBox))
            || mapItemExists(box.x, box.y, SOLID))
            this.kill()
    }

    draw() {
        ctx.strokeStyle = shift(this.col, 0)
        clear()
        rotate(this.x + this.w / 2, this.y + this.h / 2, -Math.atan2(this.speed_y, this.speed_x))
        rotRect(this.x, this.y, this.w, this.h)
        clear()
    }
}