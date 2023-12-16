'use strict'
// all the leftover objects. No idea about the name.

class Laser extends Base {
    constructor(x, y, special = false) {
        super(x, y)
        this.w = .1
        this.h = 0
        this.detect = 0
        this.stop = false
        this.lives = 0

        this.glow = random(.05, .3, 0)
        this.time = 0
        this.puff = random(0, 10, 0)
        this.kill = 0

        this.special = special

        this.applyToCells()
    }

    stopBeam() {
        if (!this.kill) this.lives --
        if (this.lives <= 0)
            this.kill += dt
    }

    update() {

        // only stop beam if lives is under zero
        if (this.kill) {
            this.kill += dt

            if (this.h > 0) this.h -= .3 * dt
            if (this.h < 0) this.h = 0

            return
        }

        if (collide(this, hero) && !hero.recover.timer) {
            if (this.special) hero.injure(1)
            else hero.injure(.4)

            puff(
                hero.x, hero.y, hero.w, hero.h, 10, .3,
                [0, 0, 0, .4], .01, .005, [.1 * hero.speed_x, .5 * hero.speed_x], [-.1, .1])
        }

        if (this.stop) return

        const ZAP = .2
        this.h += ZAP * dt

        if (Math.floor(this.h) != this.detect) {
            this.detect = Math.floor(this.h)

            if (mapItemExists(this.x, this.y + this.h, SOLID)) {
                this.stop = true
                this.h = this.detect
            }
        }

        this.applyToCells()
    }

    draw() {
        this.time += this.glow * dt

        const PAD = .5
        const PADH = .3
        const GLOW = .22 + Math.sin(this.time) * .05
        const BUTT = .35
        const BUTTH = .1
        const SMOKEW = .3 + random(0, .1, 0)
        const SMOKEH = .2 + random(0, .1, 0)
        const a = 1 - this.kill / 25

        ctx.fillStyle = rgb(.9, .3, .2, a)
        if (this.special)
            ctx.fillStyle = rgb(.6, .9, 0, a)

        fillRect(this.x, this.y, this.w, this.h)

        ctx.fillStyle = rgb(.6, .1, .1, .4 * a)
        if (this.special)
            ctx.fillStyle = rgb(.3, .6, .1, .7 * a)

        fillRect(this.x + this.w / 2 - GLOW / 2, this.y, GLOW, this.h)

        const kill = this.kill / 4
        const w = this.w + kill / 5
        ctx.fillStyle = rgb(1, kill / 5, kill / 5, Math.sin(kill) * .3)
        if (kill < Math.PI)
            fillRect(this.x + this.w / 2 - w / 2, this.y, w, this.h)

        ctx.fillStyle = rgb(.2, .2, .2)
        fillRect(this.x + this.w / 2 - PAD / 2, this.y, PAD, PADH)

        ctx.fillStyle = rgb(.17, .17, .17)
        fillRect(this.x + this.w / 2 - BUTT / 2, this.y + PADH, BUTT, BUTTH)

        if (this.h > SMOKEH) {
            ctx.fillStyle = rgb(1, .8, .8, (.15 + random(0, .2, 0)) * a)
            fillRect(this.x + this.w / 2 - SMOKEW / 2, this.y + this.h - SMOKEH, SMOKEW, SMOKEH)
        }
    }
}

class Button extends Base {
    constructor(x, y, laser, special = false) {
        super(x, y)

        this.w = .9
        this.h = .2

        this.x += .5 - this.w / 2
        this.y += 1 - this.h

        this.laser = laser

        this.drop = 0
        this.time = random(0, 10, 0)
        this.special = special

        this.laser.lives ++

        this.applyToCells()
    }

    kill() {
        this.drop += .004 * dt
    }

    update() {
        if (this.drop) {
            this.kill()
            return
        }

        if (collide(hero, this)) {
            this.laser.stopBeam()
            this.kill()
            cam.boom(10, .1, .1)
        }
    }

    draw() {
        this.time += .1 * dt
        const PAD = this.w * .8
        const PADH = .15
        const GLOW = .2
        const y = this.drop

        ctx.fillStyle = rgb(.22, .2, .22)
        fillRect(this.x, this.y, this.w, this.h)

        let h = PADH - y
        if (h < 0) h = 0

        ctx.fillStyle = rgb(.6 + Math.sin(this.time) * .2, y, 0)
        if (this.special)
            ctx.fillStyle = rgb(y, .6 + Math.sin(this.time) * .2, 0)

        fillRect(this.x + this.w / 2 - PAD / 2, this.y + y - PADH, PAD, h)

        ctx.fillStyle = rgb(.6, 0, 0, Math.sin(this.time) * .3)
        if (this.special)
            ctx.fillStyle = rgb(0, .6, 0, Math.sin(this.time) * .3)

        if (!y) fillRect(
            this.x + this.w / 2 - PAD / 2 - GLOW,
            this.y - PADH - GLOW,
            PAD + GLOW * 2,
            PADH * 2 + GLOW)
    }
}

class Lamp extends Base {
    constructor(x, y, h = random(.7, 1, 0)) {
        super(x, y)

        this.w = 1
        this.h = h
        this.swing = 0

        if (!random(0, 2))
            this.swing = random(.02, .05, 0)

        this.ang = 0
        this.rays = 2

        this.red = random(0, .3, 0)

        this.applyToCells()
    }

    update() {

    }

    draw() {
        this.ang += this.swing * dt

        const WIRE = .07
        const LAMP = .3
        const RAYS = this.rays
        const BRIGHTNESS = .4
        const FADE = .04
        const SPREAD = .3
        const x = this.x + this.w / 2

        clear()
        rotate(x, this.y, Math.sin(this.ang) * this.swing * 10)

        ctx.strokeStyle = rgb(.2, .2, .2)
        rotRect(x - WIRE / 2, this.y, WIRE, this.h)

        for (let i = 0; i < RAYS; i ++) {
            const GLOW = LAMP + i * SPREAD

            ctx.strokeStyle = rgb(1, .9 - this.red, 0, (1 - (i / RAYS)) * BRIGHTNESS - i * FADE)
            rotRect(x - GLOW / 2, this.y + this.h - (GLOW - LAMP) / 2, GLOW, GLOW)
        }

        clear()
    }
}

class Item extends Base {
    constructor(x, y, type, big = false) {
        super(x, y)

        this.x += .1

        this.type = type

        this.w = random(1.5, 2, 0)
        this.h = random(1, 2, 0)

        const s = random(1, 2, 0)
        this.w *= s
        this.h *= s

        if (type) {
            let size = random(1.05, 1.95, 0)
            if (big) size = random(1.8, 1.95, 0)

            this.w = size
            this.h = size
        }

        this.y -= this.h
        this.speed_x = 0
        this.speed_y = 0

        this.seed = random(10, 1000, 0)
        this.time = this.seed

        this.applyToCells()
    }

    update() {
        this.time += .1 * dt
    }

    machine() {
        const PAD = .1

        ctx.fillStyle = rgb(.35, .35, .35)
        fillRect(this.x, this.y, this.w, this.h)

        for (let i = 0; i < Math.floor((this.h - PAD) / PAD / 2); i ++) {
            const y = this.y + PAD + i * PAD * 2

            // occasionally green with flashing lights
            ctx.fillStyle = rgb(.4, .4, .4)
            if (Math.sin(i * this.seed) > .5) {
                const r = rain(Math.round(this.time + i * i))
                const s = .2
                ctx.fillStyle = rgb(.5 + r[0] * s, .5 + r[1] * s, .5 + r[2] * s)
                fillRect(this.x + this.w - PAD * 2, y, PAD, PAD)

                ctx.fillStyle = rgb(.2, .6, .2)
            }

            // lines
            fillRect(
                this.x + PAD, y,
                this.w / 2 + Math.sin(i * i * this.seed) * this.w / 4, PAD)
        }
    }

    crate() {
        // COLLIDE WITH THE CELLS
        const arr = this.collisionSetUp()
        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                const block = mapItem(obj.x, obj.y)
                if (block[SOLID]) {
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)

                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                    }
                }
            }
        }
        if (collide(this, hero)) {
            const move = merge(hero, this, hero.speed_x, hero.speed_y)

            if (move.x) {
                this.speed_x = hero.speed_x
                hero.x -= move.x - hero.speed_x
                hero.speed_x *= .5
            }

            if (move.y) {
                hero.y -= move.y
                hero.speed_y = 0
                if (move.y > 0)
                    hero.in_air = false
            }
        }
        this.speed_y += GRAVITY * dt
        this.speed_x *= Math.pow(.96, dt)
        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        this.applyToCells()

        // DRAW
        const BLOB = .2
        ctx.fillStyle = rgb(.2, .2, .2)
        fillRect(this.x, this.y, this.w, this.h)

        ctx.fillStyle = rgb(0, .4, 0)
        fillRect(this.x + this.w - BLOB * 2, this.y + BLOB, BLOB, BLOB)
    }

    draw() {
        if (this.type) this.crate()
        else this.machine()
    }
}

class Pow extends Base {
    constructor(x, y, h) {
        super(x, y)

        this.w = 1.9
        this.h = h

        this.drop = 0
        this.rest = 0
        this.rise = 1
        this.fall = 0

        this.applyToCells()
    }

    slam() {
        this.fall += .002 * dt
        this.drop += this.fall * dt * this.rise

        if (this.drop <= 0) {
            this.rise = 1
            this.drop = 0
            this.rest = 0
            this.fall = 0
        }

        if (this.drop > 1) {
            if (!this.rest) {
                cam.boom(20, .3, .15)
                pound.play()
            }
            this.drop = 1

            this.rest += dt
            if (this.rest > 40) {
                this.fall = 0
                this.rise = -1
                this.rest = 0
            }
        }
    }

    update() {
        if (collide(this, hero.box) || this.drop)
            this.slam()

        const box = {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.drop * this.h
        }
        if (this.rise == 1 && this.drop < 1 && collide(hero.box, box))
            hero.injure(.15)
    }

    draw() {
        const rect = (x, y, w, h) => {
            if (y < this.y) {
                h = h - (this.y - y)
                y = this.y
            }
            if (h < 0) h = 0

            fillRect(x, y, w, h)
        }
        const padW = 1.2
        const badH = 1
        const spikes = 8
        const spikeH = .2
        const WARN = .6

        const dropH = this.h - spikeH
        const _y = this.y - dropH + (dropH * this.drop)

        ctx.fillStyle = rgb(.18, .18, .18)
        rect(this.x + this.w / 2 - padW / 2, _y, padW, this.h - badH - spikeH)

        ctx.fillStyle = rgb(.2, .2, .2)
        rect(this.x, _y + this.h - spikeH - badH, this.w, badH)

        ctx.fillStyle = rgb(.3, .3, .1)
        rect(this.x + this.w / 2 - WARN / 2, _y + this.h / 2 - WARN / 2, WARN, WARN)

        ctx.fillStyle = rgb(0, 0, 0)
        for (let i = 0; i < spikes; i ++) {
            const oft = i / spikes
            rect(this.x + .5 / spikes + oft * this.w, _y + this.h - spikeH, .1, spikeH)
        }
    }
}

class Lift extends Base {
    constructor(x, y, h) {
        super(x, y)

        this.w = 3
        this.h = h
        this.Y = this.y + h
        this.H = 4

        this.on = false
        this.off = false

        this.h += this.H
        this.y -= this.H

        this.applyToCells()
    }

    update() {
        if (!this.on || this.off) return

        this.Y -= .023 * dt
        if (this.Y < this.y + this.H) {
            this.Y = this.y + this.H
            this.off = true
            cam.boom(20, .1, .1)
        }
    }

    draw() {
        const BAR = .3
        const PAD = .4
        const RIM = .2

        ctx.fillStyle = rgb(0, 0, 0)
        fillRect(this.x + PAD, this.y, BAR, this.h)
        fillRect(this.x + this.w - BAR - PAD, this.y, BAR, this.h)

        ctx.fillStyle = rgb(.3, .3, .3)
        fillRect(this.x, this.Y, this.w, -this.H)

        ctx.fillStyle = rgb(.2, .2, .2)
        fillRect(this.x + RIM, this.Y - RIM, this.w - RIM * 2, RIM * 2 - this.H)
    }
}

class Prison extends Base {
    constructor(X, Y) {
        super(X, Y)

        this.w = 10
        this.h = 5

        this.y -= this.h

        for (let x = 0; x < this.w; x ++) {
            for (let y = 0; y < this.h; y ++) {
                map.add(
                    this.x + x, this.y + y, DECO,
                    {visual: 'plain', color: [.15, .15, .15], min: 1, max: 1}, true)
            }
        }

        this.applyToCells()
    }

    update() {
    }

    draw() {
        this.applyToCells()

        const bars = 11
        const barw = .3
        const gap = this.w / bars
        const posty = .5
        const posth = .3
        const sh = .3

        ctx.fillStyle = rgb(0, 0, 0, .1)
        fillRect(this.x - sh, this.y - sh, this.w + sh * 2, 5 + sh)

        ctx.fillStyle = rgb(.3, .3, .3)
        for (let i = 0; i < bars; i ++) {
            fillRect(this.x + gap / 2 + i * gap - barw / 2, this.y - posty, barw, this.h + posty)
        }

        ctx.fillStyle = rgb(.35, .35, .35)
        fillRect(this.x, this.y - posty, this.w, posth)
    }
}

// Drillo is back!!
class Drillo extends Base {
    constructor(x, y) {
        super(x, y) 

        this.w = 1
        this.h = 1.4

        this.walk = Math.PI / 2
        this.speed_x = 0

        this.y -= this.h
        this.blink = 100
        this.time = 0

        this.applyToCells()
    }

    update() {
        this.x += this.speed_x * dt
        this.speed_x *= Math.pow(.7, dt)
        this.walk += this.speed_x * 3 * dt

        this.applyToCells()
    }

    draw() {
        this.time += .07 * dt
        let blink = 1

        this.blink -= dt
        if (this.blink < 0) {
            const ch = this.blink / 3
            blink = 1 + Math.sin(ch)

            if (ch <= -Math.PI) {
                this.blink = random(100, 500, 0)
                blink = 1
            }
        }

        const y = this.y + Math.sin(this.walk * 2) * .05 + Math.sin(this.time) * .06

        const bod = .57
        const foot = .25
        const footPad = .06 - Math.sin(this.time) * .015
        const eye = .14
        const eyePad = .3

        ctx.fillStyle = rgb(0, 0, 0)
        fillRect(this.x, y, this.w, bod)

        const mid = this.x + this.w / 2 - foot / 2
        const gap = (this.w - foot - footPad) / 2
        let rise1 = Math.cos(this.walk) * gap
        let rise2 = Math.cos(this.walk + Math.PI) * gap
        if (rise1 < 0) rise1 = 0
        if (rise2 < 0) rise2 = 0

        fillRect(mid + Math.sin(this.walk) * gap, this.y + this.h - rise1, foot, -foot)
        fillRect(mid + Math.sin(this.walk + Math.PI) * gap, this.y + this.h - rise2, foot, -foot)

        ctx.fillStyle = rgb(1, 1, 1)
        const oft = this.speed_x
        fillRect(this.x + eyePad + oft, y + bod / 2 - eye / 2, eye, eye * blink)
        fillRect(this.x + this.w + oft - eyePad, y + bod / 2 - eye / 2, -eye, eye * blink)
    }
}

class Friend extends Base {
    constructor(x, y) {
        super(x, y) 

        this.w = .8
        this.h = .97

        this.y -= this.h
        this.blink = 10
        this.time = 5

        this.speed_x = 0

        this.applyToCells()
    }

    update() {
        this.x += this.speed_x * dt
        this.speed_x *= Math.pow(.7, dt)

        this.applyToCells()
    }

    draw() {
        this.time += .05 * dt
        let blink = 1

        this.blink -= dt
        if (this.blink < 0) {
            const ch = this.blink / 3
            blink = 1 + Math.sin(ch)

            if (ch <= -Math.PI) {
                this.blink = random(100, 500, 0)
                blink = 1
            }
        }

        const y = this.y + Math.sin(this.time) * .02

        const bod = this.w
        const foot = .2
        const footPad = .06
        const eye = .25
        const eyePad = .1
        const eyeY = .19
        const pup = .1

        const a = Math.sin(this.time * 3) * foot / 4
        const b = Math.sin(this.time * 3 + Math.PI) * foot / 4

        ctx.fillStyle = rgb(.1, .1, .1)
        fillRect(this.x + footPad, this.y + this.h - foot, foot, foot * .75 + a)
        fillRect(this.x + this.w - footPad, this.y + this.h - foot, -foot, foot * .75 + b)

        ctx.fillStyle = rgb(.8, .65, 0)
        fillRect(this.x, y, this.w, bod)

        ctx.fillStyle = rgb(1, 1, 1)
        fillRect(this.x + eyePad, y + eyeY, eye, eye)
        fillRect(this.x + this.w - eyePad, y + eyeY, -eye, eye)

        let X = (this.x + this.w / 2 - (hero.x + hero.w / 2)) / 10
        let Y = (this.y + this.h / 2 - (hero.box.y + hero.box.h / 2)) / 10

        const m = eye / 2 - pup / 2
        if (X > m) X = m
        if (X < -m) X = -m
        if (Y > m) Y = m
        if (Y < -m) Y = -m

        ctx.fillStyle = rgb(0, 0, 0)
        fillRect(this.x + eyePad + eye / 2 - pup / 2 - X, y + eyeY + eye / 2 - pup / 2 - Y, pup, pup)
        fillRect(this.x + this.w - eyePad - eye / 2 - pup / 2 - X, y + eyeY + eye / 2 - pup / 2 - Y, pup, pup)

        ctx.fillStyle = rgb(.8, .65, 0)
        fillRect(this.x, y + eyeY, this.w, eye - eye * blink)
    }
}

class TGO extends Base {
    constructor(x, y, h, bod) {
        super(x, y)

        this.w = 1
        this.h = h
        this.bod = bod
        this.speedy = 0
        this.speedx = 0
        this.yOft = 0

        this.dir = 1

        this.y -= this.h
        this.browang = hashRandom(.05, .15, false, h)
        this.time = random(0, 100, 0)
        this.speed = random(.1, .3, 0)

        this.rest = this.y
        this.air = false
        this.walk = 0
        this.angry = false
        this.a = 1
        this.boom = true

        this.applyToCells()
    }

    control() {

    }

    update() {
        this.control()

        this.speedx *= Math.pow(.9, dt)
        this.speedy += GRAVITY * dt
        this.y += this.speedy * dt
        this.x += this.speedx * dt

        if (this.y >= this.rest) {
            this.y = this.rest
            this.speedy = 0

            if (this.boom && this.air) {
                cam.boom(10, .1, .1)
                pound.play()
            }

            this.air = false
        }
        else this.air = true

        this.walk += this.speedx / (this.h - this.bod) * 1.5
    }

    draw() {
        this.applyToCells()

        this.time += this.speed / 4

        const bod = this.bod
        const legw = .18
        const pad = .09
        const footw = .1
        const footh = .14
        const eyex = .11
        const eyey = .23
        const eye = .34
        const browh = .1
        const broww = eye + .1
        const browy = .1
        const browang = this.browang
        const pup = .13
        const sense = .2
        const breathe = Math.sin(this.time) * .1
        const y = this.y + breathe + this.yOft
        const legh = this.h - this.bod - breathe
        const armx = .1 + Math.cos(this.time) * .02
        const army = 1.2 + Math.cos(this.time / 2) * .08
        const arm = .2
        const swing = .4 + legh * .4

        ctx.fillStyle = rgb(0, 0, 0, this.a)
        fillRect(this.x, y, this.w, bod)

        fillRect(this.x - armx, y + army, -arm, arm)
        fillRect(this.x + this.w + armx, y + army, arm, arm)

        ctx.strokeStyle = rgb(0, 0, 0, this.a)
        clear()
        rotate(this.x + pad + legw / 2, y + bod, Math.sin(this.walk) * swing)
        rotRect(this.x + pad, y + bod, legw, legh)
        const pos1 = rotRect(this.x + pad + legw / 2 + (legw / 2) * this.dir, y + bod + legh, footw * this.dir, -footh)
        clear()
        rotate(this.x + this.w - pad - legw / 2, y + bod, Math.sin(this.walk + Math.PI) * swing)
        rotRect(this.x + this.w - pad - legw, y + bod, legw, legh)
        const pos2 = rotRect(this.x + this.w - pad - legw / 2 + (legw / 2) * this.dir, y + bod + legh, footw * this.dir, -footh)
        clear()

        let big = pos2.y2
        if (big < pos1.y2)
            big = pos1.y2

        this.yOft += this.h - big + this.y

        ctx.fillStyle = rgb(.7, .7, .7, this.a)
        fillRect(this.x + eyex, y + eyey, eye, eye)
        fillRect(this.x + this.w - eyex, y + eyey, -eye, eye)

        ctx.strokeStyle = rgb(0, 0, 0, this.a)
        clear()
        rotate(this.x + eyex, y + eyey - browy, -browang)
        rotRect(this.x + eyex, y + eyey - browy, broww, browh)
        clear()
        rotate(this.x + this.w - eyex, y + eyey - browy, browang)
        rotRect(this.x + this.w - eyex, y + eyey - browy, -broww, browh)
        clear()

        let dx = ((hero.x + hero.w / 2) - (this.x + this.w / 2)) * sense
        if (!this.angry) dx = this.dir
        let dy = ((hero.box.y + hero.box.h / 2) - (y + eyey + eye / 2)) * sense
        const m = eye / 2 - pup / 2
        if (dx > m) dx = m
        if (dx < -m) dx = -m
        if (dy > m) dy = m
        if (dy < -m) dy = -m

        ctx.fillStyle = rgb(0, 0, 0, this.a)
        fillRect(
            this.x + eyex + eye / 2 - pup / 2 + dx,
            y + eyey + eye / 2 - pup / 2 + dy,
            pup, pup)
        fillRect(
            this.x + this.w - eyex - eye + pup + dx,
            y + eyey + eye / 2 - pup / 2 + dy,
            pup, pup)
    }
}

class Cage extends Base {
    constructor(x, y, h) {
        super(x, y)

        this.W = 6
        this.w = this.W
        this.h = h
        this.speedy = 0
        this.speedx = 0

        this.Y = this.y
        this.X = this.x
        this.H = 4
        this.rest = this.y + this.h
        this.oft = 0
        this.vy = 0

        this.drop = false
        this.fall = true
        this.break = false
        this.boring = false

        map.makeItem(this)
        this.applyToCells()
    }

    heroCollision() {
        this.oft += this.vy * dt
        this.vy -= this.oft / 10 * dt
        this.vy *= Math.pow(.7, dt)
        if (this.Y >= this.y + this.h) {
            this.oft = 0
            this.vy = 0
        }

        const pad = .2
        const base = this.oft + this.Y - hero.h - pad

        if (this.boring) {
            this.break = false
            hero.y = base
            hero.speed_y = 0
            hero.in_air = false
        }

        if (hero.y < pad + this.oft + this.Y - this.H) {
            hero.y = pad + this.oft + this.Y - this.H
            hero.speed_y = this.vy
        }

        // land on floor of cage
        if (!this.fall && hero.y > base) {
            if (!this.break && hero.in_air) {
                if (hero.animate.new == 'pound') {
                    this.break = true
                    this.speed_y = hero.speed_y
                }
                else this.vy += hero.speed_y
            }

            hero.y = base + this.vy
            hero.speed_y = GRAVITY
            hero.in_air = false
        }

        const dash = () => {
            if (this.break && hero.dash.spin) {
                this.speedx += hero.speed_x / 5
                puff(this.X, this.Y, this.W, 0, 2, .1, [1, 1, 1, .3], .01, .01)
                cam.boom(10, .04, .04)
            }
            else hero.speed_x = 0
        }

        // collide with sides
        if (hero.x < this.X + pad) {
            hero.x = this.X + pad

            dash()
        }
        if (hero.x > this.X + this.W - hero.w - pad) {
            hero.x = this.X + this.W - hero.w - pad

            dash()
        }
    }

    update() {
        this.X += this.speedx * dt
        this.speedx *= Math.pow(.5, dt)
        this.w = this.W + (this.X - this.x)

        if (this.break) {
            this.heroCollision()

            this.Y += this.speedy * dt
            this.speedy += .06 * dt

            if (this.Y > this.y + this.h)
                this.Y = this.y + this.h

            return
        }

        if (this.drop) {
            this.heroCollision()

            this.Y += this.speedy * dt
            this.speedy += .03 * dt

            if (this.Y >= this.rest) {
                if (this.fall) {
                    cam.boom(13, .2, .2)
                    pound.play()
                }

                this.fall = false
                this.speedy = 0
                this.Y = this.rest
            }
        }
    }

    rect(x, y, w, h) {
        if (y < this.y) {
            h = h - (this.y - y)
            y = this.y
        }
        if (h < 0) h = 0
        fillRect(x, y, w, h)
    }

    draw() {
        const rope = .4
        const padw = 1.4
        const padh = .3

        ctx.fillStyle = rgb(.12, .12, .12)

        if (this.break) this.rect(this.x + this.W / 2 - rope / 2, this.y, rope, 3)
        else this.rect(this.x + this.W / 2 - rope / 2, this.y, rope, this.oft + this.Y - this.H)

        if (!this.dead) {
            this.rect(this.X + this.W / 2 - padw / 2, this.oft + this.Y - this.H - padh, padw, padh)

            ctx.fillStyle = rgb(.15, .15, .15)
            this.rect(this.X, this.oft + this.Y - this.H, this.W, this.H)
        }

        this.applyToCells()
    }

    fore() {
        const bars = 10
        const barw = .2
        const gap = (this.W + barw + barw * 1.5) / bars

        ctx.fillStyle = rgb(.4, .4, .4)
        this.rect(this.X, this.oft + this.Y - this.H, this.W, barw)
        this.rect(this.X, this.oft + this.Y - barw, this.W, barw)

        for (let i = 0; i < bars; i ++)
            this.rect(this.X + i * gap, this.oft + this.Y - this.H, barw, this.H)

        for (let X = 0; X < Math.ceil(this.w); X += 2) {
            map.makeItem(this, this.x + X, this.y)
            map.makeItem(this, this.x + X, this.y + Math.ceil(this.h))
        }

        for (let Y = 0; Y < Math.ceil(this.h); Y += 2) {
            map.makeItem(this, this.x, this.y + Y)
            map.makeItem(this, this.x + Math.ceil(this.w), this.y + Y)
        }
    }
}

class Lever extends Base {
    constructor(x, y) {
        super(x, y)
        this.A = 1.2

        this.w = 1.5
        this.h = 1.5
        this.switch = false
        this.ang = -this.A
        this.y -= this.h
        this.dir = 1
        this.stuck = false

        this.applyToCells()
    }

    on() {
        this.ang -= .05 * dt * this.dir

        if (this.ang > this.A) {
            this.ang = this.A

            cam.boom(10, .1, .1)
            this.switch = false
            pound.play()
        }
        if (this.ang < -this.A) {
            this.ang = -this.A

            cam.boom(10, .1, .1)
            this.switch = false
            pound.play()
        }
    }

    update() {
        if (this.switch)
            this.on()

        const gap = .5
        const box = {
            x: this.x - gap,
            y: this.y,
            w: this.w + gap * 2,
            h: this.h
        }
        if (!this.stuck && !this.switch && collide(box, hero)) {
            this.switch = true
            this.dir = Math.sign(this.ang)
            hero.speed_x = 0
        }
    }

    draw() {
        const barw = .2
        const barh = 1.2
        const oft = .1
        const pad = .34
        const y = this.y + this.h

        clear()
        rotate(this.x + this.w / 2, y - oft, -this.ang)
        ctx.strokeStyle = rgb(.12, .12, .12)
        rotRect(this.x + this.w / 2 - barw / 2, y - oft - barh, barw, barh)
        ctx.strokeStyle = rgb(.3, .04, .04)
        rotRect(this.x + this.w / 2 - pad / 2, y - oft - barh - pad, pad, pad)
        clear()

        ctx.beginPath()
        ctx.fillStyle = rgb(.17, .17, .17)
        const r = realPos(this.x + this.w / 2, y)
        ctx.arc(r.x, r.y, this.w * scale * .5, Math.PI, 0)
        ctx.fill()
    }
}