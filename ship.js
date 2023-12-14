'use strict'

class Ship extends Base {
    constructor(x, y) {
        super(x, y)

        this.w = 55
        this.h = 14

        this.x = x
        this.y = y - this.h * .5

        this.main_y = this.y

        this.planks = 20
        this.plank_h = this.h / this.planks
        this.top = 12
        this.base = this.w * .75

        this.time = 0
        this.canAng = 0
        this.timer = 0

        this.ladder = {
            w: 1.1,
            gap: .4,
            rungs: 18
        }

        this.door = {
            x: .2,
            w: 2.5,
            obj: new TeleportDoor(this.x, this.y, {world: 'boss', door: 'start'}, false, 'wooden')
        }
        this.door.obj.x = this.x + this.door.w / 2 + this.door.x * this.w - this.door.obj.w / 2

        this.makeBox()

        this.applyToCells()
    }

    collideShip(part) {
        if (collide(hero.box, part)) {
            hero.collisionBox()

            const overlap = merge(hero.box, part, hero.speed_x, hero.speed_y)

            if (overlap.x) {
                hero.speed_x = 0
                hero.x -= overlap.x
                hero.box.x -= overlap.x
            }
            if (overlap.y) {
                hero.speed_y = 0
                hero.y -= overlap.y
                hero.box.y -= overlap.y

                if (overlap.y > 0) hero.in_air = false
            }
        }
    }

    makeBox() {
        this.topBox = {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.top * this.plank_h
        }
        this.botBox = {
            x: this.x + this.w / 2 - this.base / 2,
            y: this.y + this.topBox.h,
            w: this.base,
            h: (this.planks - this.top) * this.plank_h
        }
    }

    update() {
        this.time += .01
        this.y = this.main_y + Math.sin(this.time)
        this.door.obj.y = this.y - this.door.obj.h

        this.box = this.makeBox()
        this.collideShip(this.topBox)
        this.collideShip(this.botBox)

        const water = (hero.swim.enabled && !hero.swim.surface) || hero.waterSpin.active || hero.in_water

        if (!water && collide(hero, {
            x: this.x + this.w, y: this.y, w: this.ladder.w,
            h: this.ladder.rungs * this.ladder.gap})) {
            
            hero.swim.enabled = false
            hero.swim.surface = false
            hero.in_water = false

            for (let i = 0; i < this.ladder.rungs; i ++) {
                const rung = {
                    x: this.x + this.w,
                    y: this.y + i * this.ladder.gap,
                    w: this.ladder.w,
                    h: this.ladder.gap
                }

                if (collide(hero, rung)) {
                    const base = hero.y + hero.h
                    if (base - hero.speed_y <= rung.y && base >= rung.y) {
                        const move = hero.y + hero.h - rung.y
                        hero.y -= move
                        hero.box.y -= move
                        hero.in_air = false
                        hero.speed_y = 0
                    }
                }
            }
        }

        this.applyToCells()
    }

    draw() {
        const plankColor = i => {
            const s = hash(i) * .03
            ctx.fillStyle = rgb(.34 + s, .22 + s * .7, .1 + s * .5)
        }

        const MAST_X = this.w * .4
        const MAST_W = this.w * .02
        const MAST_H = this.h * 1.6

        const GAP = this.w * .015

        const SAIL_1_W = this.h * .8
        const SAIL_1_H = this.h
        const SAIL_1_Y = this.h * .1

        const SAIL_2_W = this.h * 1.2
        const SAIL_2_H = this.h * 1.2
        const SAIL_2_Y = this.h * .03

        const HOLE = 2.3
        const OUTLINE = .4
        
        const CANNON_X = this.w * .1
        const CANNON_W = this.w * .05
        const CANNON_H = this.w * .1
        const RIM_W = CANNON_W * 1.1
        const RIM_H = this.w * .01

        const LADDER_SIDE = .08
        const LADDER_H = .16
        const POLE_W = .16

        const DOOR_H = 2.5
        const DOOR_PAD = .3

        // cannon
        const x = this.x + CANNON_X
        const dist_x = (x - (hero.x + hero.w / 2 + hero.speed_x * 50)) / 20

        this.canAng += (dist_x - this.canAng) / 5 * dt
        if (this.canAng > 1) this.canAng = 1
        else if (this.canAng < -1) this.canAng = -1

        // shoot cannon ball
        this.timer -= dt
        if (this.timer < 0) {
            const x_dir = -Math.sin(this.canAng)
            const y_dir = -Math.cos(this.canAng)
            let force = .2 + Math.abs(dist_x / 1.77)
            if (force < .3) force = .3

            new CannonBall(
                x - Math.sin(this.canAng) * CANNON_H / 2,
                this.y - Math.cos(this.canAng) * CANNON_H / 2,
                x_dir * force, y_dir * force, this)

            cam.boom(10, .5, .5)

            this.timer = 50
        }

        // draw cannon
        ctx.strokeStyle = rgb(.3, .3, .3)
        clear()
        rotate(x, this.y, this.canAng)
        rotRect(x - CANNON_W / 2, this.y - CANNON_H / 2, CANNON_W, CANNON_H)

        ctx.strokeStyle = rgb(.25, .25, .25)
        rotRect(x - RIM_W / 2, this.y - CANNON_H / 2, RIM_W, RIM_H)
        clear()

        // DOOR
        this.door.obj.applyToCells()
        this.door.obj.arrow.setCurr(this.door.obj)
        const X = this.x + this.w * this.door.x
        ctx.fillStyle = rgb(.3, .2, .1)
        fillRect(X, this.y - DOOR_H, this.door.w, DOOR_H)

        ctx.fillStyle = rgb(.26, .15, .05)
        fillRect(
            X + DOOR_PAD,
            this.y - DOOR_H + DOOR_PAD,
            this.door.w - DOOR_PAD * 2,
            DOOR_H - DOOR_PAD)

        // body top
        for (let i = 0; i < Math.floor(this.top); i ++) {
            plankColor(i)
            fillRect(this.x, this.y + (i * this.plank_h), this.w, this.plank_h)
        }

        // body base
        for (let i = 0; i < Math.floor(this.planks - this.top); i ++) {
            plankColor(i)

            fillRect(
                this.x + this.w / 2 - this.base / 2,
                this.y + this.top * this.plank_h + (i * this.plank_h), this.base, this.plank_h)
        }

        // mast
        ctx.fillStyle = rgb(.2, .1, 0)
        fillRect(this.x + MAST_X, this.y - MAST_H, MAST_W, MAST_H)

        // sails
        ctx.fillStyle = rgb(.75, .7, .65)
        fillRect(this.x + MAST_X - GAP, this.y - MAST_H + SAIL_1_Y, -SAIL_1_W, SAIL_1_H)
        fillRect(this.x + MAST_X + MAST_W + GAP, this.y - MAST_H + SAIL_2_Y, SAIL_2_W, SAIL_2_H)

        // windows
        const center = this.x + this.w / 2 - HOLE / 2

        const hole = val => {
            const x = center + (this.w / 4 * val)
            const y = this.y + this.h * .6

            ctx.fillStyle = rgb(.55, .37, 0)
            fillRect(x, y, HOLE, HOLE)

            ctx.fillStyle = rgb(.2, .2, .2)
            fillRect(x + OUTLINE, y + OUTLINE, HOLE - OUTLINE * 2, HOLE - OUTLINE * 2)
        }

        hole(-1)
        hole(-.5)
        hole(0)
        hole(.5)
        hole(1)

        ctx.fillStyle = rgb(.3, .3, .3)
        for (let i = 0; i < this.ladder.rungs; i ++)
            fillRect(
                this.x + this.w, this.y + i * this.ladder.gap,
                this.ladder.w, LADDER_H)
        ctx.fillStyle = rgb(.2, .2, .2)
        fillRect(
            this.x + this.w + LADDER_SIDE, this.y - LADDER_SIDE,
            POLE_W, this.ladder.rungs * this.ladder.gap)
        fillRect(
            this.x + this.w + this.ladder.w - LADDER_SIDE, this.y - LADDER_SIDE,
            -POLE_W, this.ladder.rungs * this.ladder.gap)
    }
}