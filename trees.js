'use strict'
class Tree extends Base {
    constructor(x, y, makeCoconuts = 'random') {
        super(x, y)

        this.w = 8
        this.h = 9
        this.x = x - this.w / 2
        this.y = y - this.h

        this.oft = random(0, 100)

        this.tree = {}
        this.tree.w = 1
        this.tree.h = random(6, 7.5, 0)
        this.tree.x = this.x + this.w / 2,
        this.tree.y = this.y + (this.h - this.tree.h)

        this.trunk_h = .6
        this.nut_size = .6
        this.damage = .2

        this.makeCoconuts = makeCoconuts
        this.leaf = {}

        this.nuts = []
        this.trunk = []

        this.generate()

        this.applyToCells()
    }
    generate() {
        // make nuts only if required
        if (this.makeCoconuts || (this.makeCoconuts == 'random' && random(0, 2))) {
            const amt = random(1, 4)
            for (let i = 0; i < amt; i ++)
                this.nuts.push({
                    x: random(-.5, .5, 0),
                    y: random(-.5, .5, 0),
                    fall: false,
                    shade: -i / 15,
                    speedY: 0
                })
        }

        // trunk
        const segments = Math.ceil(this.tree.h / this.trunk_h)
        for (let i = 0; i < segments; i ++) {
            const curve = Math.sin(this.oft + i / segments * 3)
            this.trunk.push({x: curve * (i / segments), y: i * this.trunk_h})
        }

        // leaves
        this.leaf = [
            random(.3, .4, 0),
            -random(.1, .3, 0),
            random(-.1, .1, 0)
        ]

        this.time = 0
    }
    update() {
    }
    draw() {
        this.time += .1 * dt

        const TRUNK_W = .8
        const LEAF_W = 2.8
        const LEAF_H = 1.3
        const GAP = .3

        // TREE
        for (let i = 0; i < this.trunk.length; i ++) {
            const item = this.trunk[i]

            const s = Math.sin(this.oft + i * i) * .04
            const w = TRUNK_W - (i / (this.trunk.length - 1)) / 6

            const x = this.tree.x + item.x + .5 - w / 2
            const y = this.tree.y + this.tree.h - item.y - this.trunk_h

            ctx.fillStyle = rgb(.55 + s, .45 + s, .3 + s)
            fillRect(x, y, w, this.trunk_h)
        }

        const trunk_x = this.trunk[this.trunk.length - 1].x
        const x = this.tree.x + trunk_x + TRUNK_W / 2
        const y = this.tree.y - LEAF_H / 2

        clear()
        ctx.strokeStyle = rgb(.2, .3, .05)
        rotate(x - GAP, y - GAP * 2 + LEAF_H / 2, this.leaf[0])
        rotRect(x - GAP, y - GAP * 2, LEAF_W, LEAF_H)
        rest()

        ctx.strokeStyle = rgb(.25, .35, .05)
        rotate(x, y - GAP + LEAF_H / 2, this.leaf[1])
        rotRect(x - LEAF_W, y - GAP, LEAF_W + GAP, LEAF_H)
        rest()

        ctx.strokeStyle = rgb(.35, .45, .05)
        rotate(x, y + LEAF_H / 2, this.leaf[2])
        rotRect(x, y, LEAF_W, LEAF_H)
        clear()

        // NUTS
        for (let i = 0; i < this.nuts.length; i ++) {
            const item = this.nuts[i]

            const X_POS = this.tree.x + trunk_x + TRUNK_W / 2 - this.nut_size / 2 + item.x
            const Y_POS = this.tree.y + item.y

            ctx.fillStyle = rgb(.5 + item.shade, .3 + item.shade, .1 + item.shade)
            fillRect(X_POS, Y_POS, this.nut_size, this.nut_size)

            const killNut = () => {
                puff(
                    X_POS, Y_POS - .3, this.nut_size, this.nut_size + .3,
                    4, .3, [1, 1, 1, .5], -.01, .01, [-.05, .05], [-.05, 0])
                this.nuts.splice(i, 1)
            }

            // collision
            const dist_x = (hero.x + hero.w / 2) - (X_POS + this.nut_size / 2)
            const dist_y = (hero.y + hero.h / 2) - (Y_POS + this.nut_size / 2)

            if (Math.abs(dist_x) < 2 + Math.abs(hero.speed_x) * 10 && dist_y < this.h * 2) {
                item.fall = true

                // damaging
                if (collide({x: X_POS, y: Y_POS, w: this.nut_size, h: this.nut_size}, hero.box)) {
                    if (hero.offensive) killNut()
                    else hero.injure(this.damage)
                }
            }

            // falling and landing
            if (item.fall) {
                item.y += item.speedY * dt
                item.speedY += .01 * dt

                const future = Y_POS + this.nut_size * 2 - item.speedY * 2
                if (mapItemExists(X_POS + this.nut_size / 2, future, SOLID))
                    killNut()
            }
        }
    }
}

class FirTree extends Base {
    constructor(x, y) {
        super(x, y)

        this.w = 5
        this.h = random(6, 9, 0)
        this.x = x - this.w / 2
        this.y = y - this.h

        this.t = {
            folds: random(2, 5),
            foldAmt: random(.3, .7, 0),
            spread: random(3, 4, 0),
            trunkW: random(.07, .13, 0),
            trunkH: random(.1, .6, 0),
            shade: random(.6, 1, 0)
        }

        this.time = random(0, 10)
        this.timeSpeed = random(.01, .03, 0)

        this.applyToCells()
    }

    update() {
    }
    draw() {
        this.time += this.timeSpeed * dt

        const TRUNK_W = this.t.trunkW * this.w
        const TRUNK_H = this.t.trunkH * this.h
        const TRUNK_X = this.x + this.w / 2 + (1 - TRUNK_W) / 2

        const RES = 20
        const SEGMENT_H = (this.h - TRUNK_H) / RES

        const FOLDS = this.t.folds
        const FOLD_AMT = this.t.foldAmt
        const SPREAD_SPEED = this.t.spread

        // TRUNK
        ctx.fillStyle = colorShade([.3, .2, .1], this.t.shade)
        fillRect(TRUNK_X, this.y + this.h - TRUNK_H, TRUNK_W, TRUNK_H)
        
        // LEAVES
        ctx.fillStyle = colorShade([.1, .3, .1], this.t.shade)

        let width = 0
        for (let i = 0; i < RES; i ++) {
            width += SPREAD_SPEED / RES

            const sway = Math.sin(this.time) * (RES - i) / 100

            fillRect(
                TRUNK_X + TRUNK_W / 2 - width / 2 + sway,
                this.y + (i * SEGMENT_H),
                width, SEGMENT_H)
            
            const fold = Math.floor(RES / FOLDS)
            if (i % fold == fold - 1) width -= FOLD_AMT
        }
    }
}