'use strict'
class Hero extends Base {
    constructor() {
        super(0, -1) // x and y pos

        // sizes
        this.w = .7
        this.h = 1.85

        // collision box (offset is difference from coords)
        this.box = {x: 0, y: 0, w: this.w, h: this.h, offset: {x: 0, y: 0}}
        this.collisionBox()

        // physics
        this.speed_x = 0
        this.speed_y = 0

        this.momentum = .7
        this.swim_momentum = .9
        this.damping = 20

        // other
        this.dir = 0
        this.walk = 0
        this.in_air = false
        this.in_water = false
        this.ang = 0

        this.health = 1
        this.smooth_health = 1
        this.coins = 0
        this.smooth_coins = 0
        this.enoughCoins = false

        this.keyTimerRange = 150
        this.keyTimer = this.keyTimerRange
        this.key = false
        this.keyHasAppeared = false
        this.justCollectedKey = false

        this.onReed = 0
        this.colliding = false

        this.eyeCol = [0, 0, 0]
        this.pow = {min: 5, max: 7, curr: 0}
        objSet(this.pow, 'min/max')

        // injury
        this.do_kill = 0
        this.recover = {
            timer: 0,
            last: 75,
            switch: 4
        }
        this.eye = 1
        this.eyeTimer = random(10, 30)

        this.leg_h = .5
        this.dash = {dir: 0, spin: 0, timer: 0, regen: 20, rot_speed: .32, move_speed: .07, execute: false}
        this.pound = {spin: 0, plummet: false, force: .7, spin_speed: .4, active: false}
        this.swim = {move: false, swim: 0, speed: .02, spin: 0, enabled: false, surface: false}
        this.waterSpin = {go: 0, speed: .03, force: .4, active: false, regen: 40, timer: 0}
        this.waterSpin.reset = () => {
            this.waterSpin.go = 0
            this.waterSpin.timer = this.waterSpin.regen
            this.waterSpin.active = false
        }
        this.climb = false

        // real body state
        this.body = this.bodyMake()
        // expected body state
        this._body = this.bodyMake()

        this.animate = {new: 'walk', old: 'walk', trans_new: 'walk'}
        this.animate_stage = 0
        this.animate_speed = .2

        this.offensive = false
        this.checkpoint = {
            go: () => {
                this.resurrect()
                this.restart()
            },
            enable: () => {},
            disable: () => {}
        }
    }

    resurrect() {
        // place hero at start of world by default
        map.setLevel(map.curr, 'start', true)

        this.health = 1
        this.do_kill = 0
        this.alpha = 1
        this.display = true
        this.speed_x = 0
        this.speed_y = 0

        const pos = map.lev[map.curr].doors.start
        this.collisionBox()
        this.x = pos.x
        this.y = pos.y
    }

    restart() {
        // reset all sequences in level if possible
        if (seq[map.curr]) {
            map.lev[map.curr].sqn.type = ''

            const arr = seq[map.curr].props
            for (let i = 0; i < arr.length; i ++) {
                arr[i].dead = true
                arr[i].applyToCells()
            }
            seq[map.curr].props = []
            seq[map.curr].go()
        }
    }

    bodyMake() {
        return {
            offset_x: 0,
            offset_y: 0,
            eye_x: 0,
            eye_y: 0,
            rot: 0,
            arm_oft: 0,
            arm1_ang: -.52,
            arm2_ang: .52,
            leg1_ang: -.52,
            leg2_ang: .52,
            head_x: 0,
            head_y: 0,
            head_offset: 0
        }
    }

    bodyKey(index) {
        if (index == 0) return 'offset_x'
        if (index == 1) return 'offset_y'
        if (index == 2) return 'eye_x'
        if (index == 3) return 'eye_y'
        if (index == 4) return 'rot'
        if (index == 5) return 'arm_oft'
        if (index == 6) return 'arm1_ang'
        if (index == 7) return 'arm2_ang'
        if (index == 8) return 'leg1_ang'
        if (index == 9) return 'leg2_ang'
        if (index == 10) return 'head_x'
        if (index == 11) return 'head_y'
        if (index == 12) return 'head_offset'
    }

    bodyLength() {return 13}

    collision() {
        this.collisionBox()

        // DETECT THE CELLS AROUND THE PLAYER
        const arr = this.collisionSetUp()

        // COLLIDE WITH THE CELLS
        this.colliding = false
        let in_water = false
        let pool = false

        const oldInAir = this.in_air

        // check if he is in a pool
        const _x = this.box.x + this.box.w / 2
        const _y = this.box.y + this.box.h - this.speed_y
        if (mapItemExists(_x, _y + 1, SOLID) &&
            mapItemExists(_x, _y - 1, AIR) && !this.waterSpin.active) {
            this.swim.enabled = false
            this.swim.surface = false
            pool = true
        }

        const moveX = x => {
            this.x += x
            this.box.x += x
        }
        const moveY = y => {
            this.y += y
            this.box.y += y
        }

        for (let i = arr.length; i --;) {
            const obj = arr[i]

            if (collide(this.box, obj)) {
                let block = mapItem(obj.x, obj.y)
                if (obj.x < 0 || obj.x >= map.lev[map.curr].w || obj.y >= map.lev[map.curr].h)
                    block = map.infinite(obj.x, obj.y)

                // solid collision
                if (block[SOLID]) {
                    say('coin')

                    const overlap = mapMerge(this.box, obj, this.speed_x, this.speed_y)
                    this.colliding = true

                    if (overlap.x) {
                        moveX(-overlap.x)
                        this.speed_x = 0
                    }
                    else {
                        moveY(-overlap.y)
                        this.speed_y = 0

                        if (overlap.y > 0) this.in_air = false
                    }
                }

                // swimming
                if (block[WATER]) {
                    if (!pool) {
                        if (_y > obj.y) {
                            this.in_air = false
                            in_water = true
                            this.swim.enabled = true
                            this.swim.surface = false
                        }
                    }
                }

                // ledges
                if (block[LEDGE]) {
                    if (this.y + this.h < obj.y + this.speed_y * 2) {
                        this.colliding = true
                        moveY(obj.y - (this.box.y + this.box.h))
                        this.speed_y = 0
                        this.in_air = false
                    }
                }
            }
        }
        if (this.colliding) this.dash.execute = false
        if (!this.colliding && this.speed_y > GRAVITY && !this.in_water) this.in_air = true

        if (!this.in_air && oldInAir)
            puff(
                this.x, this.y + this.h - .1, this.w,
                0, 2, .1, [0, 0, 0, .5], .01, .05,
                [-.05, .05], [-.01, 0])

        this.in_water = true
        if (!in_water) {
            this.in_water = false
            // leaping out of the water
            if (this.swim.enabled && !this.colliding && !pool)
                this.swim.surface = true
            // ordinary land
            else {
                if (this.swim.enabled)
                    this.speed_y = -.1
                this.swim.enabled = false
                this.swim.surface = false
            }
        }

        this.collisionBox()
    }

    collisionBox() {
        this.box.x = this.x + this.box.offset.x
        this.box.y = this.y + this.box.offset.y
    }

    resetBox() {
        this.box.offset.x = 0
        this.box.offset.y = 0
        this.box.h = this.h
        this.box.w = this.w
    }

    control() {
        // player cannot stand in a tunnel
        let duck = false

        const currentBlock = mapItem(this.x + this.w / 2, this.box.y + this.box.h)
        if (!this.in_water &&
            currentBlock != SOLID && currentBlock != WATER &&
            mapItemExists(this.x + this.w / 2, this.y, SOLID)) {
            duck = true
            this.animate.new = 'duck'
        }

        // PHYSICS CONTROL
        if (this.animate.new == 'walk' || this.animate.new == 'climb')
            this.speed_x += this.dir / this.damping * DT

        if (this.animate.new == 'duck') {
            if (this.dash.dir) {
                if (!this.dash.execute) dash.play()

                this.dash.execute = true
                this.dash.spin += this.dash.rot_speed * this.dash.dir * DT
                this.speed_x += this.dash.dir * this.dash.move_speed * DT
    
                if (Math.abs(this.dash.spin) >= whole) {
                    this.dash.timer = this.dash.regen
                    this.dash.dir = 0
                    this.dash.spin = 0
                    this.speed_x = 0
                }
            }
        }
        else {
            this.dash.dir = 0
            this.dash.spin = 0
            this.dash.timer = 0
        }
        if (!this.in_air) this.dash.execute = false

        if (this.animate.new == 'pound' && !this.dash.execute) {
            if (this.pound.plummet) this.speed_y = this.pound.force
            else {
                this.speed_y = 0
                this.pound.spin += this.pound.spin_speed * DT
                if (this.pound.spin >= whole) {
                    this.pound.spin = 0
                    this.pound.plummet = true
                }
            }

            if (!this.in_air) {
                this.pound.spin = 0
                this.pound.plummet = false
                this.pound.active = false
                cam.boom(15, .2, .15)
                pound.play()
            }
        }
        else {
            this.pound.spin = 0
            this.pound.plummet = false
            this.pound.active = false
        }

        if (this.animate.new == 'swim') {
            if (this.swim.move) {
                const speed = this.swim.speed +
                    Math.sin(this.swim.swim + this.swim.spin + Math.PI / 2) * .0035
                this.speed_x += Math.sin(this.swim.spin) * speed * DT
                this.speed_y -= Math.cos(this.swim.spin) * speed * DT
            }
        }
        else if (this.animate.new != 'water spin') this.swim.spin /= Math.pow(1.6, DT)

        if (this.animate.new == 'water spin') {
            if (!this.waterSpin.go) spin.play()
            // move
            this.speed_x = Math.sin(this.swim.spin) * this.waterSpin.force * DT
            this.speed_y = -Math.cos(this.swim.spin) * this.waterSpin.force * DT

            // reset spin
            this.waterSpin.go += this.waterSpin.speed * DT
            if (this.waterSpin.go >= 1) this.waterSpin.reset()
        }
        else this.waterSpin.active = false

        // KEY CONTROL
        this.dir = 0
        this.dash.timer -= DT

        if (!this.in_water) {
            if (this.waterSpin.active) {
                this.waterSpin.reset()
                this.waterSpin.go += this.waterSpin.speed * DT
            }
            this.waterSpin.active = false
        }
        else this.waterSpin.timer -= DT

        if (this.swim.enabled || this.waterSpin.active || this.in_water) {
            if (this.waterSpin.active || (this.in_water && this.waterSpin.timer <= 0 && key.down)) {
                this.animate.new = 'water spin'
                this.waterSpin.active = true
            }
            else {
                this.animate.new = 'swim'

                const speed = Math.sqrt((this.speed_x * this.speed_x) + (this.speed_y * this.speed_y))
                this.swim.swim += speed * .8 * DT

                const rot_speed = .1 * speed + .05
                if (key.left) this.swim.spin -= rot_speed * DT
                if (key.right) this.swim.spin += rot_speed * DT

                this.swim.move = false
                if (!this.swim.surface && key.up) this.swim.move = true
            }

            if (this.swim.spin < -Math.PI) this.swim.spin = Math.PI
            if (this.swim.spin > Math.PI) this.swim.spin = -Math.PI
        }

        else {
            this.waterSpin.reset()

            if ((this.in_air && key.down || this.pound.active) && !this.dash.execute) {
                this.animate.new = 'pound'
                this.pound.active = true
            }

            else {
                // if key down or the hero is spinning
                if (key.down || this.dash.spin || duck) {
                    this.animate.new = 'duck'
                    if (!key.left && !key.right) this.dash.timer = 0
                    if (!this.dash.dir && this.dash.timer <= 0) {
                        if (key.left) this.dash.dir = -1
                        if (key.right) this.dash.dir = 1
                    }
                }
                else {
                    this.animate.new = 'walk'
                    if (key.left) this.dir = -1
                    if (key.right) this.dir = 1
                    if (key.up && !this.in_air) {
                        jump(this, .35)
                        bounce.play()
                    }
                }
            }
        }

        this.ang = this.dash.spin + this.pound.spin + this.swim.spin
    }

    animationSetup() {
        // find old key animations if not already in transition
        if (!this.animate_stage) this.animate.old = this.animate.new
        // when transitioning, define what the previous goal was on the last frame
        else this.animate.trans_new = this.animate.new
    }

    animationChange() {
        // set old and goal points
        const body_old = this.animation(this.animate.old)
        const body_goal = this.animation(this.animate.new)

        // ordinary condition
        if (this.animate_stage <= 0) this.body = body_goal

        // initianise the transition if old and new animations are different
        if (this.animate.old != this.animate.new) {
            this.animate_stage += this.animate_speed * DT

            // iterate through every joint and move it
            for (let i = 0; i < this.bodyLength(); i ++) {
                const joint_old = body_old[this.bodyKey(i)]
                const joint_new = body_goal[this.bodyKey(i)]
                const dist = joint_new - joint_old

                this.body[this.bodyKey(i)] = joint_old + (dist * this.animate_stage)
            }

            // cancel animation when complete
            if (this.animate_stage >= 1 - this.animate_speed) this.animate_stage = 0
        }

        // reset goals if goal changes during transition
        else if (this.animate_stage > 0) {
            const old = this.animate.old
            this.animate.old = this.animate.trans_new
            this.animate.new = old
            this.animate_stage = 1 - this.animate_stage
        }
    }

    animation(type) {
        const body = this.bodyMake()
        this.resetBox()

        const walkOffset = ang => {return this.leg_h + Math.sin(ang - Math.PI / 2) * this.leg_h}
        const walk = val => {
            const leg_apart = .6
            const angle = Math.sin(this.walk + val * Math.PI / 2) * leg_apart
            return {ang: angle, offset: walkOffset(angle)}
        }
        const waterSpinOn = type == 'water spin'

        if (type == 'walk') {
            const leg1 = walk(-1)
            const leg2 = walk(1)
            body.leg1_ang = leg1.ang
            body.leg2_ang = leg2.ang

            body.offset_y = leg1.offset
            if (leg2.offset < leg1.offset) body.offset_y = leg2.offset
            if (body.offset_y > this.leg_h) body.offset_y = this.leg_h

            body.eye_x = this.speed_x * 7
            body.eye_y = this.speed_y
            if (body.eye_x > 1) body.eye_x = 1
            if (body.eye_x < -1) body.eye_x = -1
            if (body.eye_y > 1) body.eye_y = 1
            if (body.eye_y < -1) body.eye_y = -1

            body.head_x = 1.1 * this.speed_x
            body.arm_oft = Math.sin(this.walk) * .3
        }

        else if (type == 'duck' || type == 'pound') {
            const leg_ang = .8
            const arm_ang = 1.3

            body.head_y = .5
            body.head_offset = .4
            this.box.h = .65
            this.box.offset.y = this.h - this.box.h

            body.arm1_ang = -arm_ang
            body.arm2_ang = arm_ang

            if (walk(1).ang > 0) {
                body.leg1_ang = -leg_ang
                body.leg2_ang = leg_ang
            }
            else {
                body.leg1_ang = leg_ang
                body.leg2_ang = -leg_ang
            }

            body.offset_y = walkOffset(leg_ang)
        }

        else if (type == 'swim' || waterSpinOn) {
            this.box.w = this.w
            this.box.h = this.w
            this.box.offset.x = this.w / 2 - this.box.w / 2
            this.box.offset.y = this.h / 2 - this.box.h / 2

            const arm_move = 1
            const leg_move = .6
            const arm_ang = 1.3
            const leg_ang = .8
            const change = 1

            let ang = this.swim.swim + this.swim.spin
            if (waterSpinOn) ang = 1.5 + Math.sin(this.waterSpin.go * 5) * .2

            body.arm1_ang = -arm_ang + Math.sin(ang + change) * arm_move
            body.arm2_ang = arm_ang - Math.sin(ang + change) * arm_move

            if (walk(1).ang > 0) {
                body.leg1_ang = -leg_ang + Math.sin(ang) * leg_move
                body.leg2_ang = leg_ang - Math.sin(ang) * leg_move
            }
            else {
                body.leg1_ang = leg_ang - Math.sin(ang) * leg_move
                body.leg2_ang = -leg_ang + Math.sin(ang) * leg_move
            }
        }

        return body
    }

    recovery() {
        this.recover.timer += DT

        if (this.recover.timer % (this.recover.switch * 2) < this.recover.switch)
            this.display = false
        else this.display = true

        if (this.recover.timer > this.recover.last) {
            this.display = true
            this.recover.timer = 0
        }
    }

    kill() {
        if (!this.do_kill) {
            cam.boom(10, .5, .5)
            puff(this.x, this.y, this.w, this.h, 15, .5, [.9, .3, 0, .5], .01, .007, [-.15, .15], [-.15, .15])
            puff(this.x, this.y, this.w, this.h, 15, .7, [.1, .1, .1, .7], .01, .005, [-.15, .15], [-.15, .15])

            game.totalDeaths ++
            this.display = true
        }

        this.alpha -= .2 * DT
        this.do_kill += DT
        this.health = 0

        if (this.alpha < 0 && this.do_kill) {
            game.fade = 'black'

            if (game.black >= 1) {
                this.checkpoint.go()
                game.fade = 'none'
            }
        }
    }

    injure(damage) {
        // only apply damage if no one is recovering or dead
        if (!this.do_kill && this.recover.timer == 0) {
            this.health -= damage

            cam.boom(20, .5, .5)

            this.recovery()
            hit.play()
        }
    }

    attack(enemy) {
        // if the enemy is alive and recovered, apply damage
        if (!enemy.do_kill && enemy.recover.timer == 0) {
            enemy.health --

            cam.boom(10, .2, .2)

            enemy.recovery()
        }
    }

    heal(amt) {
        this.health += amt
        if (this.health > 1) this.health = 1
    }

    update() {
        if (this.health <= 0 || this.do_kill) {
            this.kill()
            return
        }

        if (this.checkpoint)
            this.checkpoint.enable()

        // ANIMATION
        this.animationSetup()
        this.control()
        this.animationChange()

        this.maxSpeed()

        // PHYSICS
        this.x += this.speed_x * DT
        this.y += this.speed_y * DT

        // if he's swimming
        if (this.swim.enabled) {
            if (this.swim.surface)
                this.speed_y += GRAVITY * DT
            else {
                this.speed_x *= Math.pow(this.swim_momentum, DT)
                this.speed_y *= Math.pow(this.swim_momentum, DT)
            }
        }
        // if he's not swimming
        else {
            this.speed_x *= Math.pow(this.momentum, DT)
            this.speed_y += GRAVITY * DT
        }

        this.collision()

        // WALK
        this.walk += this.speed_x * 1.7 * DT

        if (this.animate.new == 'pound' ||
            this.animate.new == 'water spin' ||
            (!this.in_water && this.waterSpin.go > 0) ||
            (this.animate.new == 'duck' && this.dash.spin)) this.offensive = true
        else this.offensive = false

        if (this.recover.timer > 0) this.recovery()
    }

    draw() {
        // KEY ACTIVATION
        const key = map.lev[map.curr].key
        const arrow = [
            .5, 0,
            1, 1,
            .75, 1,
            .75, 2,
            .25, 2,
            .25, 1,
            0, 1,
            .5, 0
        ]
        const ARROW_W = 1 * scale
        const ARROW_H = .5 * scale

        const fake = fakePos(cvs.width / 2, cvs.height / 2)

        const drawArrow = (goal, c) => {
            const disX = fake.x - (goal.x + goal.w / 2)
            const disY = fake.y - (goal.y + goal.h / 2)

            const angle = Math.atan2(disX, disY)
            const dis = Math.hypot(disX, disY)

            const alpha = (dis - 15) / 40

            ctx.fillStyle = rgb(c[0], c[1], c[2], alpha)
            ctx.strokeStyle = rgb(0, 0, 0, alpha)
            ctx.lineWidth = scale * .05

            ctx.beginPath()

            for (let i = 0; i < arrow.length; i += 2) {
                const x = cvs.width / 2 + arrow[i] * ARROW_W - ARROW_W / 2 - cam.speed_x * scale
                const y = cvs.height * .2 + arrow[i + 1] * ARROW_H - ARROW_H / 2 - cam.speed_y * scale

                const pos = rotAroundAhr(x, y, cvs.width / 2, cvs.height / 2, angle)

                if (i) ctx.lineTo(pos.x, pos.y)
                else ctx.moveTo(pos.x, pos.y)
            }
            ctx.fill()
            ctx.stroke()
        }

        if (key) {
            const r = this.keyTimerRange

            if (!key.boring) {
                if (this.key && key.taken)
                    drawArrow(key.door, [.6, 1, .2])

                // only make key appear if hero is keyless
                else if (this.enoughCoins && !key.taken) {
                    this.keyTimer -= DT

                    // when the key has finished appearing
                    if (this.keyTimer < 0) {
                        if (!this.keyHasAppeared)
                            game.pause = false

                        this.keyHasAppeared = true

                        // if the key hasn't been collected
                        if (!this.key) {
                            // KEY ARROW
                            drawArrow(key, [1, .6, .2])
                        }
                    }

                    // reset the camera to the hero
                    else if (this.keyTimer < r * .1) cam.reset()

                    // make the key appear
                    else if (this.keyTimer < r * .5 && !key.active) {
                        key.active = true
                        puff(
                            key.x, key.y, key.w, key.h,
                            20, .2, ['random', 1],
                            .01, .01, [-.1, .1], [-.1, .1])

                        cam.boom(10, .5, .5)
                    }

                    // pause the game and look at the key
                    else if (this.keyTimer < r * .8) {
                        game.pause = true
                        cam.set(key)
                    }
                }
            }

            // if the hero touches the key and the key is not in the process of appearing
            if (key.active && collide(this, key) && (this.keyTimer < 0 || this.keyTimer == r)) {
                this.key = true
                this.coins = 0
                this.justCollectedKey = true

                puff(
                    key.x, key.y, key.w, key.h,
                    5, .3, ['random', 1],
                    .01, .01, [-.1, .1], [-.1, .1])

                key.active = false
                key.taken = true

                this.keyTimer = r
                this.keyHasAppeared = false
            }
        }

        // WATER SPIN READY
        const val = this.waterSpin.timer
        if (val < 0 && !this.waterSpin.active && this.in_water) {
            const size = .5 - val / 20
            ctx.fillStyle = rgb(0, 1, 1, .8 + val / 15)
            fillRect(
                this.box.x + this.box.w / 2 - size / 2,
                this.box.y + this.box.h / 2 - size / 2,
                size, size)
        }

        // BLINK
        this.eyeTimer -= .3 * DT
        if (this.eyeTimer < 0) {
            this.eye = Math.cos(this.eyeTimer)
            if (this.eyeTimer < -Math.PI) {
                this.eye = 1
                this.eyeTimer = random(30, 60, 0)
            }
        }

        // VARIABLES
        const head_w = this.w - .01
        const head_h = head_w
        const head_y = this.body.head_y + Math.cos(time / 30) * .03
        const head_thick = .06

        const head = [.8, .86, .93] // head colour

        const eye_w = .07
        const eye_h = .21 * this.eye
        const eye_from_center = .1
        const eye_shift = .06
        const arm_w = .06
        const arm_h = .5
        const arm_breathe = Math.sin(time / 30) * .1
        const leg_w = .06
        const body_w = .06
        const body_h = this.h - head_h - this.leg_h

        const X = this.x + this.body.offset_x
        const Y = this.y + this.body.offset_y

        let oft_x = 0
        let oft_y = 0
        let ahr_x = this.box.x + this.box.w / 2
        let ahr_y = this.box.y + this.box.h / 3

        if (this.dash.spin) {
            const perfetction = .4

            const dist_x = this.box.w / 2
            const dist_y = this.box.h / 2
            const diagonal_dist = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y))
            const diff = diagonal_dist - (dist_x + dist_y)
            oft_y = -Math.abs(Math.sin(this.dash.spin * 2) * diff * perfetction)
        }
        else if (this.swim.spin) ahr_y = this.box.y + this.box.h / 2
        if (this.pound.spin) {
            oft_x = 0
            oft_y = 0
        }

        clear()
        rotate(ahr_x + oft_x, ahr_y + oft_y, -this.ang)

        ctx.strokeStyle = rgb(0, 0, 0, this.alpha)
        // BODY
        rotRect(X + head_w / 2 - body_w / 2, Y + head_h + head_y, body_w, body_h - head_y)

        // LEG
        const leg = ang => {
            const x = X + head_w / 2
            const y = Y + head_h + body_h

            rotate(x, y, ang)
            rotRect(x - leg_w / 2, y, leg_w, this.leg_h)
            rest()
        }

        leg(this.body.leg1_ang)
        leg(this.body.leg2_ang)

        // ARM
        const arm = (ang, key = false) => {
            const x = X + head_w / 2
            const y = Y + head_h + head_y

            rotate(x, y, ang + this.body.arm_oft)
            rotRect(x - arm_w / 2, y, arm_w, arm_h)

            if (key) {
                const s = .65

                const _x = x - s / 2
                const _y = y + arm_h - s / 5

                const HOLD = .5 * s
                const THUMB = .25 * s
        
                const STICKH = .15 * s
                const STICKY = .1 * s
        
                const PRONGW = .12 * s
                const PRONGH = .16 * s
                const PRONGX = .16 * s
    
                ctx.strokeStyle = rgb(.7, .55, 0)
                rotRect(_x, _y, HOLD, HOLD)
                rotRect(_x + HOLD, _y + STICKY, s - HOLD, STICKH)
    
                rotRect(_x + HOLD + PRONGX, _y + STICKY + STICKH, PRONGW, PRONGH)
                rotRect(_x + s - PRONGW, _y + STICKY + STICKH, PRONGW, PRONGH)
    
                ctx.strokeStyle = rgb(.65, .4, 0)
                rotRect(_x + HOLD / 2 - THUMB / 2, _y + HOLD / 2 - THUMB / 2, THUMB, THUMB)

                ctx.strokeStyle = rgb(0, 0, 0, this.alpha)
            }
    
            rest()
        }

        arm(this.body.arm1_ang + arm_breathe, this.key)
        arm(this.body.arm2_ang - arm_breathe)

        // HEAD OUTLINE
        rotRect(
            X + this.body.head_x - head_thick, Y + head_y + this.body.head_offset - head_thick,
            head_w + head_thick * 2, head_h + head_thick * 2)

        // HEAD MAIN
        ctx.strokeStyle = rgb(head[0], head[1], head[2], this.alpha)
        rotRect(X + this.body.head_x, Y + head_y + this.body.head_offset, head_w, head_h)
        
        // EYE
        const eye = val => {
            const sum = eye_from_center * val - eye_w / 2
            const shift_x = this.body.eye_x * eye_shift
            const shift_y = this.body.eye_y * eye_shift

            ctx.strokeStyle = rgb(this.eyeCol[0], this.eyeCol[1], this.eyeCol[2], this.alpha)
            rotRect(
                X + this.body.head_x + head_w / 2 + shift_x + sum,
                Y + head_y + this.body.head_offset + head_h / 2 + shift_y - eye_h / 2,
                eye_w, eye_h)
        }
        eye(-1)
        eye(1)

        clear()
    }
}