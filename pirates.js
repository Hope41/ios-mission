'use strict'

class Pirate extends Base {
    constructor(x, y, evil = true, auto = true) {
        super(x, y)

        this.auto = auto
        this.hits = 0
        this.climb = true

        this.evil = evil

        // It's too hurty mummy!
        this.hurty = true
        this.key = false

        this.body = this.bodyMake()

        this.momentum = .9

        this.speed_x = 0
        this.speed_y = 0
        this.dir = 1
        this.walk = 0
        this.in_water = false
        this.do_kill = 0

        this.animate = {
            old: 'walk',
            new: 'walk',
            stage: 0
        }
        this.recover = {
            timer: 0,
            last: 120
        }

        this.powerful = true

        // do not edit
        this.bodyLength = 15
    }
    
    bodyMake() {
        return {
            y: 0,
            arm_1_ang: 1,
            arm_2_ang: 6,

            elb_1_ang: .5,
            elb_2_ang: .7,

            leg_1_ang: 0,
            leg_2_ang: 0,

            leg_1_x: 0,
            leg_2_x: 0,

            knee_1_ang: 0,
            knee_2_ang: 0,

            foot_1_x: 0,
            foot_2_x: 0,

            foot_1_y: 0,
            foot_2_y: 0,

            leg_h: 0,
            leg_y: 0
        }
    }

    bodyKey(index) {
        if (index == 0) return 'y'
        if (index == 1) return 'arm_1_ang'
        if (index == 2) return 'arm_2_ang'
        if (index == 3) return 'elb_1_ang'
        if (index == 4) return 'elb_2_ang'
        if (index == 5) return 'leg_1_ang'
        if (index == 6) return 'leg_2_ang'
        if (index == 7) return 'leg_1_x'
        if (index == 8) return 'leg_2_x'
        if (index == 9) return 'knee_1_ang'
        if (index == 10) return 'knee_2_ang'
        if (index == 11) return 'foot_1_x'
        if (index == 12) return 'foot_2_x'
        if (index == 13) return 'leg_h'
        if (index == 14) return 'leg_y'
    }
    
    flip(speed) {
        this.flipSpeed = speed
        this.dir += speed * dt

        if (this.dir >= 1) {
            this.dir = 1
            this.flipSpeed = 0
        }
        if (this.dir <= -1) {
            this.dir = -1
            this.flipSpeed = 0
        }
    }

    collision() {
        const arr = this.collisionSetUp()

        // COLLIDE WITH THE CELLS
        let colliding = false
        let readyJump = 0
        let water = false

        const base = this.y + this.h

        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                let block = mapItem(obj.x, obj.y)

                if (block[SOLID]) {
                    this.animate.new = 'walk'

                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)

                    colliding = true

                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0

                        if (this.angry.state && this.evil && this.climb) {
                            let wallHeight = 0
                            let DIR = 0
                            if (this.dir > 0) DIR = 1.5

                            for (let i = 0; i < this.jumpMax; i ++) {
                                if (mapItem(obj.x + DIR, base - i - 1)[SOLID])
                                    wallHeight ++

                                else break
                            }

                            if (wallHeight < this.jumpMax)
                                readyJump = .1 + wallHeight / 10
                            else this.angry.giveUp()
                        }
                        else {
                            if (this.in_water) jump(this, .1)
                            else this.flip(FLIP_SPEED * -Math.sign(this.dir))
                        }
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                        if (overlap.y > 0) this.in_air = false
                    }
                }

                if (block[WATER]) {
                    water = true
                    colliding = true
                    this.animate.new = 'swim'
                    this.in_air = false

                    if (mapItemExists(obj.x, this.y + this.h / 2, WATER))
                        this.speed_y -= .001
                    else this.speed_y += .001
                }
            }
        }
        if (!colliding && this.speed_y > GRAVITY * 2) this.in_air = true

        if (!this.in_air && readyJump != 0) {
            this.speed_y = -readyJump
            readyJump = 0
        }
        if (!colliding) this.animate.new = 'walk'
        else if (water) this.in_water = true
        else this.in_water = false
    }

    spare() {

    }

    control() {
        // distance to hero
        const dist = (hero.x + hero.w / 2) - (this.x + this.w / 2)
        // standing on both feet
        const step = ((this.walk % whole) + whole) % whole < 1

        this.flip(this.flipSpeed)

        // ANGRY (AND SWIMMING) CALCULATIONS
        this.angry.recover -= dt
        if (Math.abs(dist) < this.angry.activate && this.angry.recover < 0 && hero.alpha > 0)
            this.angry.state = true
        if (Math.abs(dist) > this.angry.limit && this.angry.state && step)
            this.angry.giveUp()

        if (this.angry.state && this.evil) {
            let DIR = Math.sign(dist)
            if (DIR == 0) DIR = 1
            this.flip(FLIP_SPEED * DIR)

            if (Math.abs(dist) > 1) this.speed_x += this.dir * this.angrySpeed * dt
            else if (!this.in_water) {
                if (step) this.walk = 0
                else this.walk += .2
            }
        }

        // PEACEFUL CALCULATIONS
        else {
            this.timer.move.time.curr -= dt
            this.timer.turn.curr -= dt

            if (this.timer.move.time.curr < 0) {
                this.timer.move.last.curr -= dt

                this.speed_x += this.dir * this.speed * dt

                if (this.timer.move.last.curr < 0 && step) {
                    this.timer.move.last.reset()
                    this.timer.move.time.reset()
                    this.speed_x = 0
                    this.walk = 0
                }
            }
            if (this.timer.turn.curr < 0) {
                let DIR = -1
                if (this.dir < 0) DIR = 1

                this.flip(FLIP_SPEED * DIR)
                this.timer.turn.reset()
            }
        }

        this.spare()
    }

    transition() {
        if (this.animate.old != this.animate.new) {
            const OLD = this.animation(this.animate.old)
            const NEW = this.animation(this.animate.new)
            // iterate through every joint and move it
            for (let i = 0; i < this.bodyLength; i ++) {
                const jointOld = OLD[this.bodyKey(i)]
                const jointNew = NEW[this.bodyKey(i)]
                const dist = jointNew - jointOld

                this.body[this.bodyKey(i)] = jointOld + (dist * this.animate.stage)
            }
            this.animate.stage += .04 * dt
            if (this.animate.stage >= 1) {
                this.animate.old = this.animate.new
                this.animate.stage = 0
            }
        }
        else this.body = this.animation(this.animate.new)
    }

    recovery() {
        if (!this.recover.timer) {
            cam.boom(10, .2, .2)
            this.hits ++
            pound.play()
        }

        this.recover.timer += dt

        if (this.recover.timer % 6 >= 3) this.alpha = 0
        else this.alpha = 1

        if (this.recover.timer > this.recover.last) {
            this.alpha = 1
            this.recover.timer = 0
        }
    }

    fight() {
        if (hero.do_kill || !this.hurty) this.angry.state = false
        else if (collide(hero.box, this)) {
            if (hero.offensive) this.recovery(this)
            else {
                this.animate.new = 'fight'
                if (this.recover.timer == 0) hero.injure(this.damage)
            }

            const dis_x = (this.x + this.w / 2) - (hero.x + hero.w / 2)
            hero.speed_x -= (1 * Math.sign(dis_x) - dis_x) / 70 * dt
        }
    }

    animation(type, body, DIR) {
        if (type == 'fight') {
            const sword = {
                arm: Math.cos(time / 10) * .1 + .3,
                elb: Math.cos(Math.PI + time / 15) * .3 + 1.5
            }
            const hook = {
                arm: .1 + Math.sin(time / 20) * .05,
                elb: 1 + Math.sin(time / 20) * .1
            }
            const foot = {
                leg: .3 - Math.sin(time / 5) * .05,
                knee: .2
            }

            body.arm_1_ang = sword.arm * DIR
            body.elb_1_ang = sword.elb * DIR
            body.arm_2_ang = hook.arm * DIR
            body.elb_2_ang = hook.elb * DIR
    
            body.leg_1_ang = foot.leg * DIR
            body.knee_1_ang = -foot.knee * DIR
            body.leg_2_ang = -foot.leg / 2 * DIR
            body.knee_2_ang = -foot.knee * DIR
        }

        if (type == 'swim') {
            const moveArm = oft => {
                const arm = Math.cos(oft + this.walk / 4) * .3 + .5
                const elb = Math.cos(oft + this.walk / 3) * .2 + .5
                return {arm, elb}
            }
            const moveLeg = oft => {
                const leg = Math.cos(oft + this.walk / 4) * .3 - .5
                const knee = Math.cos(oft + this.walk / 3) * .2 - .2
                return {leg, knee}
            }
    
            const arm_1 = moveArm(0)
            const arm_2 = moveArm(Math.PI)
            const leg_1 = moveLeg(0)
            const leg_2 = moveLeg(Math.PI)
    
            body.arm_1_ang = arm_1.arm * DIR
            body.elb_1_ang = arm_1.elb * DIR
            body.arm_2_ang = arm_2.arm * DIR
            body.elb_2_ang = arm_2.elb * DIR
    
            body.leg_1_ang = leg_1.leg * DIR
            body.knee_1_ang = leg_1.knee * DIR
            body.leg_2_ang = leg_2.leg * DIR
            body.knee_2_ang = leg_2.knee * DIR
        }

        return body
    }

    update() {
        if (this.recover.timer > 0) this.recovery()
        else this.control()
        this.maxSpeed()
        this.walls()

        // REST ON GROUND SET-UP
        const foot_2 = this.body.foot_2_y
        const foot_1 = this.body.foot_1_y

        // TRANSITION
        this.transition()

        // REST ON GROUND CALCULATIONS
        this.body.y = (this.y + this.h) - foot_2
        if (foot_1 > foot_2) this.body.y = (this.y + this.h) - foot_1

        // PHYSICS
        this.x += this.speed_x * dt
        this.y += this.speed_y * dt

        if (this.animate.new == 'swim') {
            this.speed_x *= Math.pow(this.momentum, dt)
            this.speed_y *= Math.pow(this.momentum, dt)
        }
        else if (this.animate.new == 'walk' || this.animate.new == 'fight') {
            this.speed_x *= Math.pow(this.momentum, dt)
            this.speed_y += GRAVITY * dt
        }

        this.maxSpeed()
        this.collision()

        if (this.auto) this.applyToCells()

        this.fight()
    }
}

class PirateRecruit extends Pirate {
    constructor(x, y) {
        super(x, y)
        this.damage = .1

        this.w = PIRATE_RECRUIT_W
        this.h = PIRATE_RECRUIT_H
        this.y -= this.h

        this.speed = .0035
        this.angrySpeed = .005

        this.in_air = false
        this.flipSpeed = 0

        this.timer = {
            move: {
                time: {min: 300, max: 400, curr: 0},
                last: {min: 30, max: 80, curr: 0}},
            turn: {min: 100, max: 200, curr: 0}
        }

        objSet(this.timer.move.time, 'min/max')
        objSet(this.timer.move.last, 'min/max')
        objSet(this.timer.turn, 'min/max')

        this.angry = {
            state: false,
            activate: 10,
            limit: 20,
            recover: 0
        }
        this.angry.giveUp = () => {
            this.angry.state = false
            this.angry.recover = 200
            this.walk = 0
            this.speed_x = 0
        }
        this.jumpMax = 4

        this.defineCoins(3, 5)
        this.applyToCells()
    }

    animation(type) {
        const body = this.bodyMake()
        const DIR = this.dir

        super.animation(type, body, DIR)
        
        if (type == 'walk') {
            const moveArm = (oft, strength) => {
                const sway = .1 * strength
                const bend = .15 * strength
                const arm = .1 + Math.cos(oft + this.walk) * sway
                const elb = 1 + Math.cos(oft + this.walk) * bend
                return {arm, elb}
            }
            const moveFoot = (oft) => {
                const stride = .2
                const lift = .2
                const bob = .04 + Math.sin(time / 10) * .02

                const x = Math.cos(oft + this.walk) * stride
                let y = Math.sin(oft + this.walk) * lift
                if (y > 0) y = 0

                return {x, y: y + this.body.leg_h - bob}
            }

            const arm_1 = moveArm(0, 1)
            const arm_2 = moveArm(Math.PI, .4)

            body.arm_1_ang = arm_1.arm * DIR
            body.elb_1_ang = arm_1.elb * DIR
            body.arm_2_ang = arm_2.arm * DIR
            body.elb_2_ang = arm_2.elb * DIR

            /* Get new feet goals. They're like little coordinates that the pirates'
            legs try to touch. Their position is relative to the leg position. */
            const foot_1 = moveFoot(0)
            const foot_2 = moveFoot(Math.PI)

            // point leg in direction of foot
            const ang_1 = Math.PI / 2 - Math.atan2(foot_1.y, foot_1.x)
            const ang_2 = Math.PI / 2 - Math.atan2(foot_2.y, foot_2.x)
            body.leg_1_ang = ang_1 * DIR
            body.leg_2_ang = ang_2 * DIR
            body.knee_1_ang = 0
            body.knee_2_ang = 0

            // bend leg if it doesn't need to stretch
            const leg_bend = 3
            const knee_bend = 6

            if (foot_1.y < this.body.leg_h) {
                body.leg_1_ang += (this.body.leg_h - foot_1.y) * leg_bend * DIR
                body.knee_1_ang = (foot_1.y - this.body.leg_h) * knee_bend * DIR
            }
            if (foot_2.y < this.body.leg_h) {
                body.leg_2_ang += (this.body.leg_h - foot_2.y) * leg_bend * DIR
                body.knee_2_ang = (foot_2.y - this.body.leg_h) * knee_bend * DIR
            }
        }

        return body
    }

    update() {
        super.update()

        this.walk += 6 * Math.abs(this.speed_x) * dt
    }

    draw() {
        // draw rectangle with flip
        const center = this.x + this.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 3.5
        const s = this.h / HAPPY_H

        const LEG = rgb(0.66, 0.13, 0.13, this.alpha)
        const ARM = rgb(0.66, 0.06, 0.06, this.alpha)
        const RED_STRIPE = rgb(0.73, 0.13, 0.13, this.alpha)
        const WHITE_STRIPE = rgb(0.73, 0.73, 0.73, this.alpha)
        const SKIN = rgb(0.73, 0.6, 0.4, this.alpha)
        const BLACK = rgb(0, 0, 0, this.alpha)
        const HOOK = rgb(0.4, 0.33, 0.33, this.alpha)
        const SWORD = rgb(0.33, 0.26, 0.26, this.alpha)

        const HAIR = 4
        const STRIPES = 6
        const HEAD_W = 1 * s
        const HEAD_H = 1.4 * s
        const HAIR_W = .08 * s
        const HAIR_H = .1 * s
        const PATCH_Y = .45 * s
        const PATCH_W = .27 * s
        const PATCH_H = .4 * s
        const STRING_W = .3 * s
        const STRING_H = .07 * s
        const STRING_BUMP = .03 * s
        const MOUTH_Y = 1 * s
        const MOUTH_W = .4 * s
        const MOUTH_H = .07 * s
        const SAD_W = .07 * s
        const SAD_H = .07 * s
        const NECK_W = .2 * s
        const NECK_H = .2 * s
        const BODY_W = .8 * s
        const BODY_H = 1 * s
        const ARM_W = .2 * s
        const ARM_H = .6 * s
        const ELB_W = .2 * s
        const ELB_H = .5 * s
        const LEG_W = .2 * s
        const TOTAL_LEG_H = (HAPPY_H * s - (HEAD_H + NECK_H + BODY_H))
        const LEG_H = .4
        const KNEE_H = .6

        const HEAD_X = this.x + this.w / 2 - HEAD_W / 2
        const HEAD_Y = this.y + this.body.y
        const BODY_X = this.x + this.w / 2 - BODY_W / 2
        const BODY_Y = HEAD_Y + HEAD_H + NECK_H

        // LEG
        const leg_1_x = BODY_X + BODY_W / 2 + (BODY_W / 2 - LEG_W / 2)
        const leg_2_x = BODY_X + BODY_W / 2 - (BODY_W / 2 - LEG_W / 2)

        this.body.leg_1_x = leg_1_x
        this.body.leg_2_x = leg_2_x
        this.body.leg_y = BODY_Y + BODY_H
        this.body.leg_h = TOTAL_LEG_H

        const drawLeg = (x, leg, knee) => {
            ctx.strokeStyle = LEG

            const leg_y = BODY_Y + BODY_H

            clear()
            rotate(x, leg_y, leg)
            rotRect(x - LEG_W / 2, leg_y, LEG_W, TOTAL_LEG_H * LEG_H)
            rotate(x, leg_y + (TOTAL_LEG_H * LEG_H), knee)
            const foot_pos = rotRect(x - LEG_W / 2, leg_y + (TOTAL_LEG_H * LEG_H), LEG_W, TOTAL_LEG_H * KNEE_H)
            clear()

            return foot_pos
        }

        // draw feet
        const foot_1 = drawLeg(flip(leg_1_x), this.body.leg_1_ang, this.body.knee_1_ang)
        const foot_2 = drawLeg(flip(leg_2_x), this.body.leg_2_ang, this.body.knee_2_ang)

        // set feet positions
        this.body.foot_1_x = foot_1.x2
        this.body.foot_1_y = foot_1.y2 - this.body.y
        this.body.foot_2_x = foot_2.x2
        this.body.foot_2_y = foot_2.y2 - this.body.y

        // HEAD
        ctx.fillStyle = SKIN
        flipRect(HEAD_X, HEAD_Y, HEAD_W, HEAD_H)
        // NECK
        flipRect(HEAD_X + HEAD_W / 2 - NECK_W / 2, HEAD_Y + HEAD_H, NECK_W, NECK_H)

        ctx.fillStyle = BLACK
        // HAIR
        const gap = HEAD_W / HAIR
        for (let i = 0; i < HAIR; i ++)
            flipRect(gap / 2 + HEAD_X + i * gap - HAIR_W / 2, HEAD_Y, HAIR_W, HAIR_H)

        // PATCH
        flipRect(HEAD_X + HEAD_W - STRING_W - PATCH_W, HEAD_Y + PATCH_Y - PATCH_H / 2, PATCH_W, PATCH_H)
        // STRING
        flipRect(
            HEAD_X + HEAD_W - STRING_W, HEAD_Y + PATCH_Y - PATCH_H / 2,
            STRING_BUMP + STRING_W, STRING_H)
        // MOUTH
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y - MOUTH_H / 2, MOUTH_W, MOUTH_H)
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y + MOUTH_H / 2, SAD_W, SAD_H)

        // BODY
        for (let i = 0; i < STRIPES; i ++) {
            const height = BODY_H / STRIPES

            if ((i / 2) - Math.floor(i / 2) == 0) ctx.fillStyle = RED_STRIPE
            else ctx.fillStyle = WHITE_STRIPE

            flipRect(BODY_X, BODY_Y + i * height, BODY_W, height)
        }

        // ARM
        const arm_1_x = BODY_X + BODY_W
        const arm_2_x = BODY_X

        const drawArm = (x, arm, elb, func) => {
            ctx.strokeStyle = ARM

            clear()
            rotate(x, BODY_Y + ARM_W / 2, arm)
            rotRect(x - ARM_W / 2, BODY_Y + ARM_W / 2, ARM_W, ARM_H)

            rotate(x, BODY_Y + ELB_W / 2 + ARM_H, elb)
            rotRect(x - ELB_W / 2, BODY_Y + ELB_W / 2 + ARM_H, ELB_W, ELB_H)

            if (func == 'hook') {
                ctx.strokeStyle = HOOK
                const pad_w = .33 * s
                const pad_h = .1 * s
                const hook_w = .1 * s
                const hook_x = .05 * s
                const hook_h = .14 * s
                const bar_w = .22 * s
                // pad
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, pad_w, pad_h)
                // hook
                rotRect(x - hook_x - hook_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + pad_h, hook_w, hook_h)
                rotRect(
                    x - hook_x - hook_w / 2,
                    BODY_Y + ARM_W / 2 + ARM_H + ELB_H + pad_h + hook_h, bar_w, hook_w)
            }
            if (func == 'sword') {
                const hand_w = .3 * s
                const hand_h = .1 * s
                const pad_w = .34 * s
                const pad_h = .15 * s
                const sword_w = .2 * s
                const sword_h = 1 * s

                ctx.strokeStyle = SKIN
                rotRect(x - hand_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, hand_w, hand_h)
                ctx.strokeStyle = SWORD
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h, pad_w, pad_h)
                rotRect(x - sword_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h + pad_h, sword_w, sword_h)
            }
            clear()
        }

        drawArm(flip(arm_1_x), this.body.arm_1_ang, this.body.elb_1_ang, 'sword')
        drawArm(flip(arm_2_x), this.body.arm_2_ang, this.body.elb_2_ang, 'hook')
    }
}

class PirateModerate extends Pirate {
    constructor(x, y) {
        super(x, y)
        this.damage = .2
        this.health = 4

        this.w = PIRATE_MODERATE_W
        this.h = PIRATE_MODERATE_H
        this.y -= this.h

        this.speed = .0043
        this.angrySpeed = random(.005, .007, 0)

        this.in_air = false
        this.flipSpeed = 0

        this.timer = {
            move: {
                time: {min: 100, max: 140, curr: 0},
                last: {min: 50, max: 70, curr: 0}},
            turn: {min: 70, max: 110, curr: 0}
        }

        objSet(this.timer.move.time, 'min/max')
        objSet(this.timer.move.last, 'min/max')
        objSet(this.timer.turn, 'min/max')

        this.angry = {
            state: false,
            activate: 8,
            limit: 30,
            recover: 0
        }
        this.angry.giveUp = () => {
            this.angry.state = false
            this.angry.recover = 100
            this.walk = 0
            this.speed_x = 0
        }

        this.jumpMax = 15

        this.defineCoins(5, 8)
        this.applyToCells()
    }

    animation(type) {
        const body = this.bodyMake()
        const DIR = this.dir

        super.animation(type, body, DIR)

        if (type == 'walk') {
            const moveArm = (oft, strength) => {
                const sway = .1 * strength
                const bend = .2 * strength
                const arm = .1 + Math.cos(oft + this.walk) * sway
                const elb = 1.2 + Math.cos(oft + this.walk) * bend
                return {arm, elb}
            }
            const moveFoot = (oft) => {
                const stride = .3
                const lift = .2
                const bob = .04 + Math.sin(time / 10) * .02

                const x = Math.cos(oft + this.walk) * stride
                let y = Math.sin(oft + this.walk) * lift
                if (y > 0) y = 0

                return {x, y: y + this.body.leg_h - bob}
            }

            const arm_1 = moveArm(0, 1)
            const arm_2 = moveArm(Math.PI, .4)

            body.arm_1_ang = arm_1.arm * DIR
            body.elb_1_ang = arm_1.elb * DIR
            body.arm_2_ang = arm_2.arm * DIR
            body.elb_2_ang = arm_2.elb * DIR

            /* Get new feet goals. They're like little coordinates that the pirates'
            legs try to touch. Their position is relative to the leg position. */
            const foot_1 = moveFoot(0)
            const foot_2 = moveFoot(Math.PI)

            // point leg in direction of foot
            const ang_1 = Math.PI / 2 - Math.atan2(foot_1.y, foot_1.x)
            const ang_2 = Math.PI / 2 - Math.atan2(foot_2.y, foot_2.x)
            body.leg_1_ang = ang_1 * DIR
            body.leg_2_ang = ang_2 * DIR
            body.knee_1_ang = 0
            body.knee_2_ang = 0

            // bend leg if it doesn't need to stretch
            const leg_bend = 2
            const knee_bend = 5

            if (foot_1.y < this.body.leg_h) {
                body.leg_1_ang += (this.body.leg_h - foot_1.y) * leg_bend * DIR
                body.knee_1_ang = (foot_1.y - this.body.leg_h) * knee_bend * DIR
            }
            if (foot_2.y < this.body.leg_h) {
                body.leg_2_ang += (this.body.leg_h - foot_2.y) * leg_bend * DIR
                body.knee_2_ang = (foot_2.y - this.body.leg_h) * knee_bend * DIR
            }
        }

        return body
    }

    update() {
        super.update()

        this.walk += 4 * Math.abs(this.speed_x) * dt
    }

    draw() {
        // draw rectangle with flip
        const center = this.x + this.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 3.5
        const s = this.h / HAPPY_H

        const z = this.recover.timer > 0
        const EXTREMITY = rgb(0.46, 0.13, 0.13, this.alpha)
        const RED_STRIPE = rgb(0.33, 0.13, 0.13, this.alpha)
        const WHITE_STRIPE = rgb(0.13, 0.13, 0.13, this.alpha)
        const SKIN = rgb(0.66, 0.53, 0.33, this.alpha)
        const SWORD = rgb(0.2, 0.13, 0.13, this.alpha)
        const BLACK = rgb(0, 0, 0, this.alpha)

        const STRIPES = 8
        const LEG_H = .4
        const KNEE_H = .6

        const HEAD_W = 1 * s
        const HEAD_H = 1.4 * s
        const HAT_W = 1.05 * s
        const HAT_H = .27 * s
        const HAT_CROWN_W = .5 * s
        const HAT_CROWN_H = .17 * s
        const PATCH_Y = .5 * s
        const PATCH_W = .29 * s
        const PATCH_H = .38 * s
        const STRING_W = .3 * s
        const STRING_H = .06 * s
        const STRING_BUMP = .04 * s
        const MOUTH_Y = 1 * s
        const MOUTH_W = .4 * s
        const MOUTH_H = .06 * s
        const SAD_W = .07 * s
        const SAD_H = .05 * s
        const NECK_W = .2 * s
        const NECK_H = .2 * s
        const BODY_W = .8 * s
        const BODY_H = 1 * s
        const ARM_W = .2 * s
        const ARM_H = .6 * s
        const ELB_W = .2 * s
        const ELB_H = .5 * s
        const LEG_W = .2 * s
        const TOTAL_LEG_H = (HAPPY_H * s - (HEAD_H + NECK_H + BODY_H))

        const HEAD_X = this.x + this.w / 2 - HEAD_W / 2
        const HEAD_Y = this.y + this.body.y
        const BODY_X = this.x + this.w / 2 - BODY_W / 2
        const BODY_Y = HEAD_Y + HEAD_H + NECK_H
        const HAT_X = HEAD_X + HEAD_W  / 2 - HAT_W / 2

        // LEG
        const leg_1_x = BODY_X + BODY_W / 2 + (BODY_W / 2 - LEG_W / 2)
        const leg_2_x = BODY_X + BODY_W / 2 - (BODY_W / 2 - LEG_W / 2)

        this.body.leg_1_x = leg_1_x
        this.body.leg_2_x = leg_2_x
        this.body.leg_y = BODY_Y + BODY_H
        this.body.leg_h = TOTAL_LEG_H

        const drawLeg = (x, leg, knee) => {
            ctx.strokeStyle = EXTREMITY

            const leg_y = BODY_Y + BODY_H

            clear()
            rotate(x, leg_y, leg)
            rotRect(x - LEG_W / 2, leg_y, LEG_W, TOTAL_LEG_H * LEG_H)
            rotate(x, leg_y + (TOTAL_LEG_H * LEG_H), knee)
            const foot_pos = rotRect(x - LEG_W / 2, leg_y + (TOTAL_LEG_H * LEG_H), LEG_W, TOTAL_LEG_H * KNEE_H)
            clear()

            return foot_pos
        }

        // draw feet
        const foot_1 = drawLeg(flip(leg_1_x), this.body.leg_1_ang, this.body.knee_1_ang)
        const foot_2 = drawLeg(flip(leg_2_x), this.body.leg_2_ang, this.body.knee_2_ang)

        // set foot positions
        this.body.foot_1_x = foot_1.x2
        this.body.foot_1_y = foot_1.y2 - this.body.y
        this.body.foot_2_x = foot_2.x2
        this.body.foot_2_y = foot_2.y2 - this.body.y

        // HEAD
        ctx.fillStyle = SKIN
        flipRect(HEAD_X, HEAD_Y, HEAD_W, HEAD_H)
        // NECK
        flipRect(HEAD_X + HEAD_W / 2 - NECK_W / 2, HEAD_Y + HEAD_H, NECK_W, NECK_H)

        ctx.fillStyle = BLACK
        // HAT
        flipRect(HAT_X, HEAD_Y, HAT_W, HAT_H)
        flipRect(HAT_X + HAT_W - HAT_CROWN_W, HEAD_Y - HAT_CROWN_H, HAT_CROWN_W, HAT_CROWN_H)

        // PATCH
        flipRect(HEAD_X + HEAD_W - STRING_W - PATCH_W, HEAD_Y + PATCH_Y - PATCH_H / 2, PATCH_W, PATCH_H)
        // STRING
        flipRect(
            HEAD_X + HEAD_W - STRING_W, HEAD_Y + PATCH_Y - PATCH_H / 2,
            STRING_BUMP + STRING_W, STRING_H)
        // MOUTH
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y - MOUTH_H / 2, MOUTH_W, MOUTH_H)
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y + MOUTH_H / 2, SAD_W, SAD_H)

        // BODY
        for (let i = 0; i < STRIPES; i ++) {
            const height = BODY_H / STRIPES

            if ((i / 2) - Math.floor(i / 2) == 0) ctx.fillStyle = RED_STRIPE
            else ctx.fillStyle = WHITE_STRIPE
            flipRect(BODY_X, BODY_Y + i * height, BODY_W, height)
        }

        // ARM
        const arm_1_x = BODY_X + BODY_W
        const arm_2_x = BODY_X

        const drawArm = (x, arm, elb, func) => {
            ctx.strokeStyle = EXTREMITY

            clear()
            rotate(x, BODY_Y + ARM_W / 2, arm)
            rotRect(x - ARM_W / 2, BODY_Y + ARM_W / 2, ARM_W, ARM_H)

            rotate(x, BODY_Y + ELB_W / 2 + ARM_H, elb)
            rotRect(x - ELB_W / 2, BODY_Y + ELB_W / 2 + ARM_H, ELB_W, ELB_H)

            if (func == 'pad') {
                const pad_w = .17 * s
                const pad_h = .13 * s
                ctx.strokeStyle = BLACK
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, pad_w, pad_h)
            }
            if (func == 'sword') {
                const hand_w = .3 * s
                const hand_h = .1 * s
                const pad_w = .34 * s
                const pad_h = .15 * s
                const sword_w = .17 * s
                const sword_h = 1.3 * s

                ctx.strokeStyle = SKIN
                rotRect(x - hand_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, hand_w, hand_h)
                ctx.strokeStyle = SWORD
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h, pad_w, pad_h)
                rotRect(x - sword_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h + pad_h, sword_w, sword_h)
            }
            clear()
        }

        drawArm(flip(arm_1_x), this.body.arm_1_ang, this.body.elb_1_ang, 'sword')
        drawArm(flip(arm_2_x), this.body.arm_2_ang, this.body.elb_2_ang, 'pad')
    }
}

class PirateLeader extends Pirate {
    constructor(x, y, evil = true, auto = true) {
        super(x, y, evil, auto)

        this.damage = .26
        this.health = 8

        this.w = PIRATE_LEADER_W
        this.h = PIRATE_LEADER_H
        this.y -= this.h

        this.speed = .006
        this.angrySpeed = random(.007, .01, 0)

        this.in_air = false
        this.flipSpeed = 0

        this.timer = {
            move: {
                time: {min: 50, max: 70, curr: 0},
                last: {min: 10, max: 20, curr: 0}},
            turn: {min: 200, max: 300, curr: 0}
        }

        objSet(this.timer.move.time, 'min/max')
        objSet(this.timer.move.last, 'min/max')
        objSet(this.timer.turn, 'min/max')

        this.angry = {
            state: false,
            activate: 7,
            limit: 30,
            recover: 0
        }
        this.angry.giveUp = () => {
            this.angry.state = false
            this.angry.recover = 30
            this.walk = 0
            this.speed_x = 0
        }

        this.jumpMax = 30

        this.defineCoins(8, 10)
        if (auto) this.applyToCells()
    }

    animation(type) {
        const body = this.bodyMake()
        const DIR = this.dir

        super.animation(type, body, DIR)

        if (type == 'walk') {
            const moveArm = (oft, strength) => {
                const sway = .1 * strength
                const bend = .2 * strength
                const arm = .1 + Math.cos(oft + this.walk) * sway
                const elb = 1.2 + Math.cos(oft + this.walk) * bend
                return {arm, elb}
            }
            const moveFoot = (oft) => {
                const stride = .3
                const lift = .3
                const bob = .01 + Math.sin(time / 10) * .02

                const x = Math.cos(oft + this.walk) * stride
                let y = Math.sin(oft + this.walk) * lift
                if (y > 0) y = 0

                return {x, y: y + this.body.leg_h - bob}
            }

            const arm_1 = moveArm(0, 1)
            const arm_2 = moveArm(Math.PI, .4)

            body.arm_1_ang = arm_1.arm * DIR
            body.elb_1_ang = arm_1.elb * DIR
            body.arm_2_ang = arm_2.arm * DIR
            body.elb_2_ang = arm_2.elb * DIR

            /* Get new feet goals. They're like little coordinates that the pirates'
            legs try to touch. Their position is relative to the leg position. */
            const foot_1 = moveFoot(0)
            const foot_2 = moveFoot(Math.PI)

            // point leg in direction of foot
            const ang_1 = Math.PI / 2 - Math.atan2(foot_1.y, foot_1.x)
            const ang_2 = Math.PI / 2 - Math.atan2(foot_2.y, foot_2.x)
            body.leg_1_ang = ang_1 * DIR
            body.leg_2_ang = ang_2 * DIR
            body.knee_1_ang = 0
            body.knee_2_ang = 0

            // bend leg if it doesn't need to stretch
            const leg_bend = 2
            const knee_bend = 5

            if (foot_1.y < this.body.leg_h) {
                body.leg_1_ang += (this.body.leg_h - foot_1.y) * leg_bend * DIR
                body.knee_1_ang = (foot_1.y - this.body.leg_h) * knee_bend * DIR
            }
            if (foot_2.y < this.body.leg_h) {
                body.leg_2_ang += (this.body.leg_h - foot_2.y) * leg_bend * DIR
                body.knee_2_ang = (foot_2.y - this.body.leg_h) * knee_bend * DIR
            }
        }

        return body
    }

    update() {
        super.update()

        this.walk += 4 * Math.abs(this.speed_x) * dt
    }

    draw() {
        // draw rectangle with flip
        const center = this.x + this.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 3.5
        const s = this.h / HAPPY_H

        const SKIN = rgb(0.66, 0.53, 0.4, this.alpha)
        const SWORD = rgb(0.06, 0, 0, this.alpha)
        const BLACK = rgb(0, 0, 0, this.alpha)
        const GOLDEN = rgb(0.73, 0.46, 0, this.alpha)
        const BODY = rgb(0.06, 0.06, 0.06, this.alpha)
        const SHIRT = rgb(0.33, 0, 0, this.alpha)

        const LEG_H = .4
        const KNEE_H = .6

        const HEAD_W = 1 * s
        const HEAD_H = 1.4 * s
        const HAT_W = 1.05 * s
        const HAT_H = .27 * s
        const HAT_CROWN_W = .5 * s
        const HAT_CROWN_H = .2 * s
        const SHIRT_W = .3 * s
        const SHIRT_H = .4 * s
        const OVERALL_W = .15 * s
        const OVERALL_H = .1 * s
        const OVERALL_OFT = .07 * s
        const PATCH_Y = .5 * s
        const PATCH_W = .29 * s
        const PATCH_H = .38 * s
        const STRING_W = .3 * s
        const STRING_H = .06 * s
        const STRING_BUMP = .04 * s
        const MOUTH_Y = 1 * s
        const MOUTH_W = .4 * s
        const MOUTH_H = .06 * s
        const SAD_W = .07 * s
        const SAD_H = .05 * s
        const NECK_W = .2 * s
        const NECK_H = .2 * s
        const BODY_W = .8 * s
        const BODY_H = 1 * s
        const ARM_W = .2 * s
        const ARM_H = .6 * s
        const ELB_W = .2 * s
        const ELB_H = .5 * s
        const LEG_W = .2 * s
        const TOTAL_LEG_H = (HAPPY_H * s - (HEAD_H + NECK_H + BODY_H))

        const HEAD_X = this.x + this.w / 2 - HEAD_W / 2
        const HEAD_Y = this.y + this.body.y
        const BODY_X = this.x + this.w / 2 - BODY_W / 2
        const BODY_Y = HEAD_Y + HEAD_H + NECK_H
        const HAT_X = HEAD_X + HEAD_W  / 2 - HAT_W / 2

        // LEG
        const leg_1_x = BODY_X + BODY_W / 2 + (BODY_W / 2 - LEG_W / 2)
        const leg_2_x = BODY_X + BODY_W / 2 - (BODY_W / 2 - LEG_W / 2)

        this.body.leg_1_x = leg_1_x
        this.body.leg_2_x = leg_2_x
        this.body.leg_y = BODY_Y + BODY_H
        this.body.leg_h = TOTAL_LEG_H

        const drawLeg = (x, leg, knee) => {
            ctx.strokeStyle = BLACK

            const leg_y = BODY_Y + BODY_H

            clear()
            rotate(x, leg_y, leg)
            rotRect(x - LEG_W / 2, leg_y, LEG_W, TOTAL_LEG_H * LEG_H)
            rotate(x, leg_y + (TOTAL_LEG_H * LEG_H), knee)
            const foot_pos = rotRect(x - LEG_W / 2, leg_y + (TOTAL_LEG_H * LEG_H), LEG_W, TOTAL_LEG_H * KNEE_H)
            clear()

            return foot_pos
        }

        // draw feet
        const foot_1 = drawLeg(flip(leg_1_x), this.body.leg_1_ang, this.body.knee_1_ang)
        const foot_2 = drawLeg(flip(leg_2_x), this.body.leg_2_ang, this.body.knee_2_ang)

        // set foot positions
        this.body.foot_1_x = foot_1.x2
        this.body.foot_1_y = foot_1.y2 - this.body.y
        this.body.foot_2_x = foot_2.x2
        this.body.foot_2_y = foot_2.y2 - this.body.y

        // HEAD
        ctx.fillStyle = SKIN
        flipRect(HEAD_X, HEAD_Y, HEAD_W, HEAD_H)
        // NECK
        flipRect(HEAD_X + HEAD_W / 2 - NECK_W / 2, HEAD_Y + HEAD_H, NECK_W, NECK_H)

        ctx.fillStyle = BLACK
        // HAT
        flipRect(HAT_X, HEAD_Y, HAT_W, HAT_H)
        flipRect(HAT_X + HAT_W - HAT_CROWN_W, HEAD_Y - HAT_CROWN_H, HAT_CROWN_W, HAT_CROWN_H)

        // PATCH
        flipRect(HEAD_X + HEAD_W - STRING_W - PATCH_W, HEAD_Y + PATCH_Y - PATCH_H / 2, PATCH_W, PATCH_H)
        // STRING
        flipRect(
            HEAD_X + HEAD_W - STRING_W, HEAD_Y + PATCH_Y - PATCH_H / 2,
            STRING_BUMP + STRING_W, STRING_H)
        // MOUTH
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y - MOUTH_H / 2, MOUTH_W, MOUTH_H)
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y + MOUTH_H / 2, SAD_W, SAD_H)

        // BODY
        ctx.fillStyle = BODY
        flipRect(BODY_X, BODY_Y, BODY_W, BODY_H)

        // OVERALLS
        ctx.fillStyle = GOLDEN
        flipRect(BODY_X + OVERALL_OFT, BODY_Y, OVERALL_W, OVERALL_H)
        flipRect(BODY_X + BODY_W - OVERALL_W - OVERALL_OFT, BODY_Y, OVERALL_W, OVERALL_H)

        // SHIRT
        ctx.fillStyle = SHIRT
        flipRect(BODY_X + BODY_W / 2 - SHIRT_W / 2, BODY_Y, SHIRT_W, SHIRT_H)

        // ARM
        const arm_1_x = BODY_X + BODY_W
        const arm_2_x = BODY_X

        const drawArm = (x, arm, elb, func) => {
            ctx.strokeStyle = BLACK

            clear()
            rotate(x, BODY_Y + ARM_W / 2, arm)
            rotRect(x - ARM_W / 2, BODY_Y + ARM_W / 2, ARM_W, ARM_H)

            rotate(x, BODY_Y + ELB_W / 2 + ARM_H, elb)
            rotRect(x - ELB_W / 2, BODY_Y + ELB_W / 2 + ARM_H, ELB_W, ELB_H)

            if (func == 'pad') {
                const pad_w = .17 * s
                const pad_h = .13 * s

                const X = x - pad_w / 2
                const Y = BODY_Y + ARM_W / 2 + ARM_H + ELB_H

                ctx.strokeStyle = BLACK
                rotRect(X, Y, pad_w, pad_h)

                if (this.key) {
                    const k = .65
                    const _x = X - .1
                    const _y = Y - .1

                    const HOLD = .5 * k
                    const THUMB = .25 * k
            
                    const STICKH = .15 * k
                    const STICKY = .1 * k
            
                    const PRONGW = .12 * k
                    const PRONGH = .16 * k
                    const PRONGX = .16 * k
        
                    ctx.strokeStyle = rgb(.7, .55, 0, this.alpha)
                    rotRect(_x, _y, HOLD, HOLD)
                    rotRect(_x + HOLD, _y + STICKY, k - HOLD, STICKH)
        
                    rotRect(_x + HOLD + PRONGX, _y + STICKY + STICKH, PRONGW, PRONGH)
                    rotRect(_x + k - PRONGW, _y + STICKY + STICKH, PRONGW, PRONGH)
        
                    ctx.strokeStyle = rgb(.65, .4, 0, this.alpha)
                    rotRect(_x + HOLD / 2 - THUMB / 2, _y + HOLD / 2 - THUMB / 2, THUMB, THUMB)
                }
            }
            if (func == 'sword') {
                const hand_w = .3 * s
                const hand_h = .1 * s
                const pad_w = .34 * s
                const pad_h = .15 * s
                const sword_w = .15 * s
                const sword_h = 1.6 * s

                ctx.strokeStyle = GOLDEN
                rotRect(x - hand_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, hand_w, hand_h)
                ctx.strokeStyle = SWORD
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h, pad_w, pad_h)
                rotRect(x - sword_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h + pad_h, sword_w, sword_h)
            }
            clear()
        }

        drawArm(flip(arm_1_x), this.body.arm_1_ang, this.body.elb_1_ang, 'sword')
        drawArm(flip(arm_2_x), this.body.arm_2_ang, this.body.elb_2_ang, 'pad')
    }
}

class PirateCheif extends Pirate {
    constructor(x, y, evil = true, auto = true) {
        super(x, y, evil, auto)

        this.damage = .26
        this.killed = false

        this.w = 3
        this.h = 10
        this.y -= this.h

        this.speed = .006
        this.angrySpeed = random(.007, .01, 0)

        this.in_air = false
        this.flipSpeed = 0

        this.timer = {
            move: {
                time: {min: 50, max: 70, curr: 0},
                last: {min: 10, max: 20, curr: 0}},
            turn: {min: 200, max: 300, curr: 0}
        }

        objSet(this.timer.move.time, 'min/max')
        objSet(this.timer.move.last, 'min/max')
        objSet(this.timer.turn, 'min/max')

        this.angry = {
            state: false,
            activate: 7,
            limit: 30,
            recover: 0
        }
        this.angry.giveUp = () => {
            this.angry.state = false
            this.angry.recover = 30
            this.walk = 0
            this.speed_x = 0
        }

        this.jumpMax = 30

        if (auto) this.applyToCells()
    }

    collision() {
        const arr = this.collisionSetUp()

        // COLLIDE WITH THE CELLS
        let colliding = false

        for (let i = 0; i < arr.length; i ++) {
            const obj = arr[i]

            if (collide(this, obj)) {
                let block = mapItem(obj.x, obj.y)

                if (block[SOLID]) {
                    const overlap = mapMerge(this, obj, this.speed_x, this.speed_y)

                    colliding = true

                    if (overlap.x) {
                        this.x -= overlap.x
                        this.speed_x = 0
                    }
                    else if (overlap.y) {
                        this.y -= overlap.y
                        this.speed_y = 0
                        if (overlap.y > 0) this.in_air = false
                    }
                }
                if (block[WATER]) {
                    puff(this.x, this.y, this.w, this.h, 10, 1, [1, 1, 1, .7], .01, .01, [-.1, .1], [-.1, .1])
                    cam.boom(20, .3, .3)
                    this.dead = true
                }
            }
        }
        if (!colliding && this.speed_y > GRAVITY * 2) this.in_air = true
    }

    animation() {
        const body = this.bodyMake()
        const DIR = this.dir

        const moveArm = (oft, strength) => {
            const sway = .1 * strength
            const bend = .2 * strength
            const arm = .1 + Math.cos(oft + this.walk) * sway
            const elb = 1.2 + Math.cos(oft + this.walk) * bend
            return {arm, elb}
        }
        const moveFoot = (oft) => {
            const stride = .3
            const lift = .3
            const bob = -.03 + Math.sin(time / 20) * .03

            const x = Math.cos(oft + this.walk) * stride
            let y = Math.sin(oft + this.walk) * lift
            if (y > 0) y = 0

            return {x, y: y + this.body.leg_h + bob}
        }

        const arm_1 = moveArm(0, 1)
        const arm_2 = moveArm(Math.PI, .4)

        body.arm_1_ang = arm_1.arm * DIR
        body.elb_1_ang = arm_1.elb * DIR
        body.arm_2_ang = arm_2.arm * DIR
        body.elb_2_ang = arm_2.elb * DIR

        /* Get new feet goals. They're like little coordinates that the pirates'
        legs try to touch. Their position is relative to the leg position. */
        const foot_1 = moveFoot(0)
        const foot_2 = moveFoot(Math.PI)

        // point leg in direction of foot
        const ang_1 = Math.PI / 2 - Math.atan2(foot_1.y, foot_1.x)
        const ang_2 = Math.PI / 2 - Math.atan2(foot_2.y, foot_2.x)
        body.leg_1_ang = ang_1 * DIR
        body.leg_2_ang = ang_2 * DIR
        body.knee_1_ang = 0
        body.knee_2_ang = 0

        // bend leg if it doesn't need to stretch
        const leg_bend = 2.5
        const knee_bend = 5

        if (foot_1.y < this.body.leg_h) {
            body.leg_1_ang += (this.body.leg_h - foot_1.y) * leg_bend * DIR
            body.knee_1_ang = (foot_1.y - this.body.leg_h) * knee_bend * DIR
        }
        if (foot_2.y < this.body.leg_h) {
            body.leg_2_ang += (this.body.leg_h - foot_2.y) * leg_bend * DIR
            body.knee_2_ang = (foot_2.y - this.body.leg_h) * knee_bend * DIR
        }

        return body
    }

    update() {
        super.update()

        this.walk += 4 * Math.abs(this.speed_x) * dt
    }

    draw() {
        // draw rectangle with flip
        const center = this.x + this.w / 2
        const flip = x => {return x = center + (x - center) * this.dir}
        const flipRect = (x, y, width, height) => fillRect(flip(x), y, width * this.dir, height)

        const HAPPY_H = 3.5
        const s = this.h / HAPPY_H

        const SKIN = rgb(0.66, 0.53, 0.4, this.alpha)
        const SWORD = rgb(0.06, 0, 0, this.alpha)
        const BLACK = rgb(0, 0, 0, this.alpha)
        const RED = rgb(.3, 0, 0, this.alpha)
        const GOLDEN = rgb(0.73, 0.46, 0, this.alpha)
        const BODY = rgb(0.06, 0.06, 0.06, this.alpha)
        const SHIRT = rgb(.5, 0, 0, this.alpha)

        const LEG_H = .4
        const KNEE_H = .6

        const HEAD_W = 1 * s
        const HEAD_H = 1.4 * s
        const HAT_W = 1.05 * s
        const HAT_H = .27 * s
        const HAT_CROWN_W = .5 * s
        const HAT_CROWN_H = .2 * s
        const SHIRT_W = .3 * s
        const SHIRT_H = .4 * s
        const OVERALL_W = .15 * s
        const OVERALL_H = .1 * s
        const OVERALL_OFT = .07 * s
        const PATCH_Y = .5 * s
        const PATCH_W = .29 * s
        const PATCH_H = .38 * s
        const STRING_W = .3 * s
        const STRING_H = .06 * s
        const STRING_BUMP = .04 * s
        const MOUTH_Y = 1 * s
        const MOUTH_W = .4 * s
        const MOUTH_H = .06 * s
        const SAD_W = .07 * s
        const SAD_H = .05 * s
        const NECK_W = .2 * s
        const NECK_H = .2 * s
        const BODY_W = .8 * s
        const BODY_H = 1 * s
        const ARM_W = .2 * s
        const ARM_H = .6 * s
        const ELB_W = .2 * s
        const ELB_H = .5 * s
        const LEG_W = .2 * s
        const TOTAL_LEG_H = (HAPPY_H * s - (HEAD_H + NECK_H + BODY_H))

        const HEAD_X = this.x + this.w / 2 - HEAD_W / 2
        const HEAD_Y = this.y + this.body.y
        const BODY_X = this.x + this.w / 2 - BODY_W / 2
        const BODY_Y = HEAD_Y + HEAD_H + NECK_H
        const HAT_X = HEAD_X + HEAD_W  / 2 - HAT_W / 2

        // LEG
        const leg_1_x = BODY_X + BODY_W / 2 + (BODY_W / 2 - LEG_W / 2)
        const leg_2_x = BODY_X + BODY_W / 2 - (BODY_W / 2 - LEG_W / 2)

        this.body.leg_1_x = leg_1_x
        this.body.leg_2_x = leg_2_x
        this.body.leg_y = BODY_Y + BODY_H
        this.body.leg_h = TOTAL_LEG_H

        const drawLeg = (x, leg, knee) => {
            ctx.strokeStyle = BLACK

            const leg_y = BODY_Y + BODY_H

            clear()
            rotate(x, leg_y, leg)
            rotRect(x - LEG_W / 2, leg_y, LEG_W, TOTAL_LEG_H * LEG_H)
            rotate(x, leg_y + (TOTAL_LEG_H * LEG_H), knee)
            const foot_pos = rotRect(x - LEG_W / 2, leg_y + (TOTAL_LEG_H * LEG_H), LEG_W, TOTAL_LEG_H * KNEE_H)
            clear()

            return foot_pos
        }

        // draw feet
        const foot_1 = drawLeg(flip(leg_1_x), this.body.leg_1_ang, this.body.knee_1_ang)
        const foot_2 = drawLeg(flip(leg_2_x), this.body.leg_2_ang, this.body.knee_2_ang)

        // set foot positions
        this.body.foot_1_x = foot_1.x2
        this.body.foot_1_y = foot_1.y2 - this.body.y
        this.body.foot_2_x = foot_2.x2
        this.body.foot_2_y = foot_2.y2 - this.body.y

        // HEAD
        ctx.fillStyle = SKIN
        flipRect(HEAD_X, HEAD_Y, HEAD_W, HEAD_H)
        // NECK
        flipRect(HEAD_X + HEAD_W / 2 - NECK_W / 2, HEAD_Y + HEAD_H, NECK_W, NECK_H)

        ctx.fillStyle = BLACK
        // HAT
        flipRect(HAT_X, HEAD_Y, HAT_W, HAT_H)
        flipRect(HAT_X + HAT_W - HAT_CROWN_W, HEAD_Y - HAT_CROWN_H, HAT_CROWN_W, HAT_CROWN_H)

        // PATCH
        flipRect(HEAD_X + HEAD_W - STRING_W - PATCH_W, HEAD_Y + PATCH_Y - PATCH_H / 2, PATCH_W, PATCH_H)
        // STRING
        flipRect(
            HEAD_X + HEAD_W - STRING_W, HEAD_Y + PATCH_Y - PATCH_H / 2,
            STRING_BUMP + STRING_W, STRING_H)
        // MOUTH
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y - MOUTH_H / 2, MOUTH_W, MOUTH_H)
        flipRect(HEAD_X + HEAD_W - MOUTH_W, HEAD_Y + MOUTH_Y + MOUTH_H / 2, SAD_W, SAD_H)

        // BODY
        ctx.fillStyle = BODY
        flipRect(BODY_X, BODY_Y, BODY_W, BODY_H)

        // OVERALLS
        ctx.fillStyle = GOLDEN
        flipRect(BODY_X + OVERALL_OFT, BODY_Y, OVERALL_W, OVERALL_H)
        flipRect(BODY_X + BODY_W - OVERALL_W - OVERALL_OFT, BODY_Y, OVERALL_W, OVERALL_H)

        // SHIRT
        ctx.fillStyle = SHIRT
        flipRect(BODY_X + BODY_W / 2 - SHIRT_W / 2, BODY_Y, SHIRT_W, SHIRT_H)

        // ARM
        const arm_1_x = BODY_X + BODY_W
        const arm_2_x = BODY_X

        const drawArm = (x, arm, elb, func) => {
            ctx.strokeStyle = RED

            clear()
            rotate(x, BODY_Y + ARM_W / 2, arm)
            rotRect(x - ARM_W / 2, BODY_Y + ARM_W / 2, ARM_W, ARM_H)

            rotate(x, BODY_Y + ELB_W / 2 + ARM_H, elb)
            rotRect(x - ELB_W / 2, BODY_Y + ELB_W / 2 + ARM_H, ELB_W, ELB_H)

            if (func == 'pad') {
                const pad_w = .17 * s
                const pad_h = .13 * s
                ctx.strokeStyle = BLACK
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, pad_w, pad_h)
            }
            if (func == 'sword') {
                const hand_w = .3 * s
                const hand_h = .1 * s
                const pad_w = .34 * s
                const pad_h = .15 * s
                const sword_w = .15 * s
                const sword_h = 1.6 * s

                ctx.strokeStyle = GOLDEN
                rotRect(x - hand_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H, hand_w, hand_h)
                ctx.strokeStyle = SWORD
                rotRect(x - pad_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h, pad_w, pad_h)
                rotRect(x - sword_w / 2, BODY_Y + ARM_W / 2 + ARM_H + ELB_H + hand_h + pad_h, sword_w, sword_h)
            }
            clear()
        }

        drawArm(flip(arm_1_x), this.body.arm_1_ang, this.body.elb_1_ang, 'sword')
        drawArm(flip(arm_2_x), this.body.arm_2_ang, this.body.elb_2_ang, 'pad')
    }
}