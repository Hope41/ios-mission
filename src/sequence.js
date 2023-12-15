'use strict'

const seq = {}

function sequenceReset() {
    /* cancels the sequence completely */

    map.lev[map.curr].sqn = {}
    map.lev[map.curr].sqn.time = 0
}
function sequenceSet(keyword, stuff) {
    /* starts the sequence and puts it into motion */

    if (map.lev[map.curr].sqn.type == keyword) return

    map.lev[map.curr].sqn = stuff // ----------> stuff
    map.lev[map.curr].sqn.time = dt // --------> progress
    map.lev[map.curr].sqn.type = keyword // ---> keyword
}

function sequence() {
    /* what happens during the sequence */
    const type = map.lev[map.curr].sqn.type

    if (type == 'staff1') {
        staffOneSequence()
        return
    }
    if (type == 'pirate') {
        pirateSequence()
        return
    }
    if (type == 'pirateCheif') {
        cheifPirateSequence()
        return
    }
    if (type == 'cityStaff') {
        cityStaffSequence()
        return
    }
    if (type == 'council') {
        councilSequence()
        return
    }
    if (type == 'prison') {
        endSequence()
        return
    }
}

function staffOneSequence() {
    const i = map.lev[map.curr].sqn

    i.staff.sequence = true

    // start speaking right away
    if (i.time <= 1) {
        say('staff1Hello', i.staff)
        i.turnAround = false
        i.stop = 5
        i.commentLocked = false
        i.commentTeleport = false
        i.foundKeyTimer = 40
        i.nextToDoor = false
    }

    if (!game.pause) i.time += dt

    if (!i.turnAround && hero.x < 5.5) {
        hero.x = 5.5
        hero.speed_x = 0
    }

    if (i.staff.x <= i.stop) {
        i.staff.speed_x = 0
        i.staff.dir = 0
        i.staff.x = i.stop
        i.nextToDoor = true

        if (i.turnAround) {
            if (hero.key) {
                // when the key is collected
                i.staff.comments = []

                i.foundKeyTimer --

                if (i.foundKeyTimer < 0) {
                    say('staff1FoundTheKey', i.staff)
                }
                else if (hero.x > i.stop - 1.5) hero.x = i.stop - 1.5
            }

            else {
                i.staff.body.arm1 = Math.sin(time / 4 + Math.sin(time / 2)) * .2 - 1

                // comments for the teleport door
                if (!i.commentTeleport)
                    i.staff.comments = [
                        'staff1PASS2',
                        'staff1PASS3',
                        'staff1PASS4',
                        'staff1PASS5'
                    ]

                i.commentTeleport = true
            }
        }

        else if (i.nextToDoor) {
            i.staff.body.arm2 = 1 + Math.sin(time / 4 + Math.sin(time / 2)) * .2

            // comments for the locked door
            if (!i.commentLocked) i.staff.comments = ['staff1PASS1']
            i.commentLocked = true
        }

        if (!hero.in_air) say('staff1WhereTheyWent', i.staff)

        if (!game.pause && collide(hero, i.nextFloor) && key.down && hero.animate.old == 'walk') {
            say('staff1ItsLocked', i.staff)

            i.turnAround = true
            i.stop = 3
            i.staff.body.arm2 = .6

            i.beachWay.locked = false
        }

    }

    else if (!game.pause) i.staff.dir = -1
}

function pirateSequence() {
    const i = map.lev[map.curr].sqn

    // make the pirate jump and flip around to the player
    if (i.time <= 1) {
        i.end = false
        jump(i.guard, .3)
    }

    if (!game.pause) {
        i.time += dt

        i.guard.flip(i.guard.flipSpeed)

        // start speaking once landed
        if (!i.guard.in_air) {
            say('guardPirate', i.guard)
            if (i.time > 60)
                i.guard.evil = true
        }
        else if (hero.x > i.guard.x - 4 && hero.y > i.guard.y) {
            hero.x = i.guard.x - 4
            i.guard.flip(-.3)
        }
    }

    if (hero.do_kill) {
        say('victoryGuardPirate', i.guard)
        hero.display = false
    }

    // if hero has destroyed pirate
    if (i.guard.hits > 3 && !i.guard.recover.timer) {
        say('victoryIoGuardPirate', i.guard)

        i.guard.evil = false
        i.guard.hurty = false
        i.guard.key = false

        if (!i.end) {
            i.guard.walk = 0
            new KeySlot(i.guard.x + i.guard.w, i.guard.y + i.guard.h + .5, 0, true).active = true
        }

        i.end = true
    }
}

function cheifPirateSequence() {
    const i = map.lev[map.curr].sqn

    if (i.time <= 1) {
        i.cheif.manual = true
        i.jump = true

        i.walls = [{x: 0, dir: .019}]
        i.spikeIncrease = 1.3
        i.cheifIncrease = .001

        i.max = 14

        i.cheifBelowHero = false

        i.cheif.flip(-.3)
        jump(i.cheif, .3)

        // set movement logic
        i.cheif.control = () => {
            if (i.cheifBelowHero) {
                let move = hero.x + hero.w - (i.cheif.x - i.cheif.w)
                if (i.cheif.dir < 0) move = hero.x - (i.cheif.x + i.cheif.w * 2)
    
                i.cheif.speed_x += move * .01 * dt
                if (Math.abs(move) < Math.abs(i.cheif.speed_x)) i.cheif.speed_x = 0
            }
            else i.cheif.speed_x += i.cheif.dir * i.cheif.speed * dt
        }
        i.cheif.fight = () => {
            hero.collisionBox()
            if (collide(i.cheif, hero.box)) {
                let move = i.cheif.x + i.cheif.w - hero.x
                if (i.cheif.dir < 0) move = i.cheif.x - (hero.x + hero.w)
    
                hero.x += move
                hero.box.x += move
    
                if (hero.offensive) i.cheif.speed_x += i.cheif.dir * -.015 * dt
            }
        }

        i.time += dt
    }

    // prevent hero from proceeding at start
    if (hero.x > i.cheif.x - hero.w - 3 && i.jump) {
        hero.x = i.cheif.x - hero.w - 3
        hero.speed_x = 0
    }

    // cheif movement checks
    if (!game.pause) {
        if (!i.cheif.dead)
            i.cheif.update()

        i.cheif.flip(i.cheif.flipSpeed)

        const prevBelow = i.cheifBelowHero
        i.cheifBelowHero = false
        if (i.cheif.y > hero.y + hero.h) {
            i.cheifBelowHero = true

            // increase cheif speed
            if (!prevBelow) i.cheif.speed += i.cheifIncrease
        }

        // start speaking once landed
        if (!i.cheif.in_air) {
            i.jump = false
            say('cheifPirate', i.cheif)
        }
        else i.cheif.speed_x = 0
    }

    // SPIKEY WALLS
    const H = 11
    const SPIKES = 25
    const SPIKE_W = .4
    const SPIKE_H = .15
    const SPIKEGAP = H / SPIKES

    const calcY = val => {
        return 43 + (Math.floor(val) * (H + 4))
    }

    const rect = (x, y, w, h, dir) => {
        if (dir < 0) x = (i.max + 4) - x - w

        const box = {x: 79 + x, y, w, h}
        fillRect(box.x, box.y, box.w, box.h)
        return box
    }

    for (let j = 0; j < i.walls.length; j ++) {
        const item = i.walls[j]
        const y = calcY(j)

        // turn cheif around to face spikes when he is not below the hero
        if (!i.cheifBelowHero)
            i.cheif.flip(-Math.sign(item.dir) * .3)

        ctx.fillStyle = rgb(.05, .05, .05)
        for(let k = 0; k < SPIKES; k ++)
            rect(item.x, y + k * SPIKEGAP + SPIKEGAP / 2 - SPIKE_H / 2, SPIKE_W, SPIKE_H, item.dir)
        ctx.fillStyle = rgb(.1, .1, .1)
        const box = rect(0, y, item.x, H, item.dir)

        if (j == i.walls.length - 1) {
            // make new wall if hero is below the most recent wall
            if (hero.y > y + H && j < 2) {
                i.walls.push({x: 0, dir: item.dir * -i.spikeIncrease})
                cam.boom(10, .15, .15)
            }
        }

        if (!game.pause && !i.jump) {
            if (item.x < i.max) item.x += Math.abs(item.dir)
            else item.x = i.max
        }

        if (collide(hero.box, box) && !hero.do_kill) {
            hero.health --
            hero.do_kill = dt
            cam.boom(20, .5, .5)
        }
    }

    ctx.fillStyle = rgb(0, 0, 0, .1)
    fillRect(98, 84, 15, 10)

    if (i.cheif.alpha > 0 && !i.cheif.dead) i.cheif.draw()
}

function cityStaffSequence() {
    const i = map.lev[map.curr].sqn

    i.staff.sequence = true

    if (i.time <= 1) {
        i.stop = i.staff.x + 6
        i.start = 20
        say('cityStaff1', i.staff)
        say('cityStaff2', i.staff, false)
        hero.x = i.staff.x - 5
        i.time ++
    }

    if (!game.pause) i.time += dt

    if (collide(i.staff, i.lift)) {
        const goal = i.lift.Y - i.staff.h - .25

        i.staff.speed_y = 0
        i.staff.y = goal
    }

    if (i.staff.x >= i.stop) {
        i.start -= dt

        if (i.start < 0) {
            if (!i.lift.on)
                cam.boom(20, .1, .1)
            i.lift.on = true

            if (i.lift.off) {
                i.staff.dir = 1

                if (!i.key.active) {
                    say('youWinCity', i.staff)
                    i.staff.dir = 0
                }

                else if (collide(i.staff, i.key)) {
                    say('youLoseCity', i.staff)
                    hero.injure(1)
                    hero.display = true
                }
            }

            else if (hero.key) {
                if (!i.heroX)
                    i.heroX = hero.x

                hero.x = i.heroX
            }
        }
        else {
            i.staff.speed_x = 0
            i.staff.dir = 0
            i.staff.x = i.stop
        }
    }

    else if (!game.pause) i.staff.dir = .8
}

function councilSequence() {
    const i = map.lev[map.curr].sqn

    i.can.draw()
    i.can.update()

    if (i.time <= 1) {
        say('council', i.tgo)
        i.time ++
        i.flipped = false
        i.hang = i.cage.rest - 3.5
        i.rise = true
        i.leverStick = false
    }

    if (!game.pause) {
        i.time += dt

        if (i.time > 20 && !i.flipped) {
            for (let j = 0; j < i.tgo.length; j ++) {
                i.tgo[j].speedy = -hashRandom(.25, .4, 0, j)
                i.tgo[j].dir = -1
            }

            i.flipped = true
        }

        if (i.time > 70)
            say('council2', i.tgo)

        if (i.time > 100)
            i.cage.drop = true

        if (i.time > 150) {
            say('councilHaHa', i.tgo)

            if (i.cage.dead)
                i.cage.draw()

            if (!i.tgo.length) {
                i.cage.boring = false

                if (!hero.in_air)
                    say('ponderCage')

                if (hero.x > i.lever.x - 1) {
                    hero.speed_x = 0
                    hero.x = i.lever.x - 1
                    i.lever.stuck = true
                }

                if (i.lever.ang > 0 && !i.cage.dead)
                    i.can.active = true

                const item = map.lev[map.curr].live[0]
                if (!i.cage.dead && item && !item.do_kill) {
                    i.door.locked = false
                    i.can.active = false

                    const box = {
                        x: i.cage.X,
                        y: i.cage.Y,
                        w: i.cage.W,
                        h: i.cage.H
                    }

                    if (collide(box, item)) {
                        i.cage.dead = true
                        item.kill()
                        hero.brokenOut = true
                        cam.boom(20, .3, .3)

                        puff(i.cage.X, i.cage.Y - i.cage.H, i.cage.W, i.cage.H, 20, 1, [.1, .1, .1, .5], .01, .003, [-.2, .2], [-.2, .2])
                    }
                }
            }

            else {
                i.cage.boring = true

                if (i.time > 230) {
                    for (let j = 0; j < i.tgo.length; j ++) {
                        const I = i.tgo[j]

                        I.speedx -= .01 * dt
                        if (I.x <= 1.5) {
                            I.x = 1.5
                            I.a -= .2 * dt
                            if (I.a < 0) {
                                I.dead = true
                                i.tgo.shift()
                            }
                        }
                    }
                }

                else if (i.time > 170) {
                    if (i.cage.rest > i.hang)
                        i.cage.rest -= .1 * dt
                    else {
                        if (i.rise) {
                            cam.boom(10, .2, .2)
                            pound.play()
                        }

                        i.rise = false
                        i.cage.rest = i.hang
                    }
                }
            }
        }

        else hero.x = i.tgo[0].x - 8
    }
}

// aah finally
function endSequence() {
    const i = map.lev[map.curr].sqn

    if (i.time <= 1) {
        say('prison1', [i.tgo[0], i.drillo])
        i.started = false
        i.drop = .5
        i.saveTheWorld = false
        i.goal = i.prison.x + 16
        hero.x = i.goal
        i.open = false
        i.prisonSmash = 30
        i.sayChance = 10
        i.stopandlook = 0
        i.moveafterlook = 60
        cam.set(i.drillo)
    }

    if (!game.pause) {
        i.time += dt

        if (i.time > 50) {
            if (!i.started)
                cam.boom(10, .1, .1)
            i.started = true

            if (!i.open) { 
                if (i.prison.h > i.drop) {
                    i.lever.dir = -1
                    i.lever.switch = true
                    i.prison.h -= .1 * dt
                }
                else {
                    if (i.prison.h < i.drop) {
                        cam.boom(10, .1, .1)
                        pound.play()
                    }
                    i.prison.h = i.drop
                    i.open = true
                }
            }

            if (i.time > 120) {
                if (i.drillo.x > 11.7) {
                    i.tgo[0].dir = -1
                    if (i.drillo.x > i.tgo[0]) i.tgo[0].dir = 1

                    i.drillo.speed_x -= .034 * dt
                    i.friend.speed_x -= .034 * dt
                }
                else {
                    i.drillo.walk = Math.PI / 2

                    i.sayChance -= dt
                    if (i.sayChance < 0) {
                        say('prison2')
                        i.saveTheWorld = true
                        cam.reset()
                    }

                    if (i.lever.switch) {
                        if (!i.stopandlook)
                            i.stopandlook = hero.x
                    }

                    if (i.stopandlook) {
                        i.moveafterlook -= dt
                        if (i.moveafterlook > 0) {
                            hero.x = i.stopandlook
                            hero.speed_x = 0
                        }
                    }

                    if (i.lever.ang <= -i.lever.A) {
                        if (!i.lever.stuck) {
                            i.prison.dead = true
                            i.prison.applyToCells()

                            i.prison2 = new Prison(i.prison.x, 9)
                            i.prison2.h = i.drop
                        }
                        i.lever.stuck = true
                        i.lever.dir = 1

                        i.prisonSmash -= dt
                        if (i.prisonSmash < 0) {
                            if (i.prison2.h < 5)
                                i.prison2.h += .4 * dt

                            else {
                                if (i.prison2.h > 5) {
                                    cam.boom(10, .2, .2)
                                    pound.play()
                                }
                                i.prison2.h = 5
                            }

                            if (i.prisonSmash < -30) {
                                for (let j = 0; j < i.tgo.length; j ++) {
                                    const item = i.tgo[j]
                                    item.boom = false

                                    if (!item.air)
                                        item.speedy = -random(.15, .23, 0)
                                }
                            }
                        }
                    }

                    if (hero.x < i.drillo.x + 1) {
                        hero.x = i.drillo.x + 1
                        if (!end)
                            end += dt
                    }
                }
            }
        }
        if (!i.saveTheWorld)
            hero.x = i.goal
    }
}