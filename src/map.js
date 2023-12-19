'use strict'
const AIR = 0
const SOLID = 1
const WATER = 2
const GRASS = 3
const SEAWEED = 4
const LEDGE = 5
const COIN = 6
const DECO = 7
const HANGWEED = 8
const WEED = 9

const GREEN = [.3, .5, .3]
const WOOD = [.7, .5, .3]
const SAND = [1, .8, .4]
const TGOSLD = [.75, .7, .65]
const TGOBG = [.4, .375, .35]
const EARTH = [.55, .35, .1]
const MUD = [.2, .1, 0]
const RUBBLE = [.5, .5, .4]
const GRAY = [.4, .37, .35]

// In case you're struggling to understand, map.lev[map.curr].arr works like this:
// >> map.lev[map.curr].arr[cell][blocksInCell]{blockDetails}

// returns the blocks inside a specified cell
function mapItem(x, y) {
    let array = map.lev[map.curr].arr[posToIndex(x, y, map.lev[map.curr].w)]
    if (array == undefined) array = [{type: AIR}] // AIR position is zero

    return array
}
// returns if block in cell exsists
function mapItemExists(x, y, blockType) {
    return mapItem(x, y)[blockType] != undefined
}

function mapMerge(man, wall, speed_x = 0, speed_y = 0) {
    const bad = {up: false, down: false, left: false, right: false}
    if (mapItemExists(wall.x, wall.y - .5, SOLID)) bad.up = true
    if (mapItemExists(wall.x, wall.y + 1.5, SOLID)) bad.down = true
    if (mapItemExists(wall.x - .5, wall.y, SOLID)) bad.left = true
    if (mapItemExists(wall.x + 1.5, wall.y, SOLID)) bad.right = true

    if (bad.up && bad.down && bad.left && bad.right) {
        bad.up = false
        bad.down = false
        bad.left = false
        bad.right = false
    }

    return merge(man, wall, speed_x, speed_y, bad)
}

class Map {
    constructor() {
        this.alpha = 1

        /*
        Arr contains blocks and foliage
        Actors contain enemies and objects
        Items contain coins and power ups
        Live contains actors that update off the screen
        */

        const makeLev = (w, h) => {
            return {
                arr: [],
                actors: [],
                actor_w: 0,
                actor_h: 0,
                items: [],
                live: [],
                doors: {},
                sqn: {
                    time: 0, // sequence progress
                    type: '', // sequence keyword
                    stuff: {} // things involved in the sequence
                },
                w,
                h,
                coinCount: 0,
                key: 0,
                endY: 0
            }
        }

        this.lev = {
            tgo: makeLev(200, 100),
            floor1: makeLev(40, 34),
            floor2: makeLev(40, 34),
            floor3: makeLev(40, 34),
            floor4: makeLev(40, 34),
            floor5: makeLev(40, 34),
            floor6: makeLev(40, 34),
            prison: makeLev(40, 10),
            council: makeLev(34, 12),
            tutorial: makeLev(120, 100),
            beach: makeLev(450, 90),
            ship: makeLev(500, 90),
            boss: makeLev(118, 95),
            jungle: makeLev(300, 95),
            jungleBoss: makeLev(300, 95),
            city: makeLev(300, 95)
        }
        this.curr = ''
    }

    setActorArray() {
        const lvl = this.lev[this.curr]

        lvl.actor_w = Math.ceil(lvl.w / ACTOR_CELL_SIZE)
        lvl.actor_h = Math.ceil(lvl.h / ACTOR_CELL_SIZE)
        for (let i = 0; i < lvl.actor_w * lvl.actor_h; i ++) lvl.actors.push([])
    }

    loadLevels() {
        this.curr = 'tgo'
        this.setActorArray()
        this.TGOGenerate()

        this.curr = 'floor1'
        this.setActorArray()
        this.floorOneGenerate()

        this.curr = 'tutorial'
        this.setActorArray()
        this.tutorialGenerate()

        this.curr = 'floor2'
        this.setActorArray()
        this.floorTwoGenerate()

        this.curr = 'floor3'
        this.setActorArray()
        this.floorThreeGenerate()

        this.curr = 'floor4'
        this.setActorArray()
        this.floorFourGenerate()

        this.curr = 'floor5'
        this.setActorArray()
        this.floorFiveGenerate()

        this.curr = 'floor6'
        this.setActorArray()
        this.floorSixGenerate()

        this.curr = 'prison'
        this.setActorArray()
        this.prisonGenerate()

        this.curr = 'council'
        this.setActorArray()
        this.councilGenerate()

        this.curr = 'beach'
        this.setActorArray()
        this.beachGenerate()

        this.curr = 'ship'
        this.setActorArray()
        this.shipGenerate()

        this.curr = 'boss'
        this.setActorArray()
        this.bossGenerate()

        this.curr = 'jungle'
        this.setActorArray()
        this.jungleGenerate()

        this.curr = 'jungleBoss'
        this.setActorArray()
        this.jungleBossGenerate()

        this.curr = 'city'
        this.setActorArray()
        this.cityGenerate()
    }

    setLevel(level, door, died = false) {
        this.curr = level

        if (level == 'tutorial') this.tutorialSet()
        if (level == 'tgo') this.TGOSet()
        if (level == 'floor1') this.floorOneSet()
        if (level == 'floor2') this.floorTwoSet()
        if (level == 'floor3') this.floorThreeSet()
        if (level == 'floor4') this.floorFourSet()
        if (level == 'floor5') this.floorFiveSet()
        if (level == 'floor6') this.floorSixSet()
        if (level == 'prison') this.prisonSet()
        if (level == 'council') this.councilSet()
        if (level == 'beach') this.beachSet()
        if (level == 'ship') this.shipSet()
        if (level == 'boss') this.bossSet()
        if (level == 'jungle') this.jungleSet()
        if (level == 'jungleBoss') this.jungleBossSet()
        if (level == 'city') this.citySet()

        const doorPos = this.lev[this.curr].doors[door]
        hero.x = doorPos.x
        hero.y = doorPos.y

        if (this.lev[this.curr].key != 0) {
            this.lev[this.curr].doors.start.locked = false
            if (died && this.lev[this.curr].key.taken)
                this.lev[this.curr].doors.start.locked = true
        }

        if (!died)
            hero.justCollectedKey = false

        if (this.curr != 'tgo' && this.curr != 'floor1' && this.curr != 'tutorial') {
            let curr = this.curr
            if (curr == 'beach') curr = 'floor2'
            if (curr == 'ship' || curr == 'boss') curr = 'floor3'
            if (curr == 'jungle') curr = 'floor4'
            if (curr == 'jungleBoss') curr = 'floor5'
            if (curr == 'city') curr = 'floor6'

            localStorage.setItem(
                KEYWORD,
                game.totalMinutes+','+
                game.totalDeaths+','+
                game.totalCoinsCollected+','+
                curr)
        }
    }

    makeItem(item, x = 0, y = 0) {
        let pos = posToIndex(x, y, this.lev[this.curr].w)
        if (x == 0) pos = posToIndex(item.x, item.y, this.lev[this.curr].w)

        if (pos == undefined) return

        // if there is nothing in the cell already
        if (this.lev[this.curr].items[pos] == undefined)
            this.lev[this.curr].items[pos] = [item]

        // if there is already something in the cell
        else
            this.lev[this.curr].items[pos].push(item)
    }

    makeCoin(x, y, count = true) {
        if (count) this.lev[this.curr].coinCount ++
        this.makeItem({type: 'coin', x, y, collected: 0, time: 0, dir: random(.3, 1, 0)})
    }

    makePower(x, y) {
        hero.pow.curr --
        if (hero.pow.curr <= 0) {
            this.makeItem({type: 'health', x, y, collected: 0, time: 0})
            hero.pow.reset()
        }
    }

    // assigns details to each type of block
    blockAssign(blockType, blockData, seed = random(0, 1, 0)) {
        const block = {}
        block.type = blockType

        if (block.type == SOLID) {
            // default
            if (blockData.color == undefined) blockData.color = SAND
            if (blockData.min == undefined) blockData.min = .65
            if (blockData.max == undefined) blockData.max = .75

            // set block color
            block.color = colorShade(
                blockData.color, hashRandom(blockData.min, blockData.max, false, seed))
        }
        else if (block.type == GRASS) block.offset = hashRandom(0, 3.1, false, seed)
        else if (block.type == WEED) block.offset = hashRandom(0, 10, false, seed)
        else if (block.type == WATER) {
            block.choice = hashRandom(0, 1, false, seed)
            block.status = blockData.status
        }
        else if (block.type == SEAWEED) {
            block.offset = hashRandom(0, 3.1, false, seed)
            block.blades = hashRandom(1, 6, true, seed)
        }
        else if (block.type == LEDGE) {
            block.speed = 0
            block.w = 0
            block.side = blockData.side
        }
        else if (block.type == DECO) {
            block.visual = blockData.visual

            if (blockData.color != undefined) {
                let alpha = blockData.color[3]
                if (alpha == undefined) alpha = 1

                block.color = shift(
                    blockData.color,
                    hashRandom(blockData.min, blockData.max, false, seed),
                    true,
                    alpha)
            }
        }
        else if (block.type == HANGWEED) block.blades = hashRandom(3, 7, true, seed)

        return block
    }

    infinite(x, y) {
        const arr = []
        let type = AIR

        if (this.curr == 'tgo') {
            const stretch = 8
            const height = 6

            const change = x / stretch
            const curr = hash(Math.floor(change)) * height
            const next = hash(Math.floor(change + 1)) * height
            const avg = curr + (next - curr) * ((change % 1 + 1) % 1)
            const ground_y = Math.floor(50 - avg)

            if (y > ground_y) type = SOLID
            if (y == ground_y && hash(x * x) < .3) type = GRASS

            arr[type] = this.blockAssign(type, {color: GREEN, min: .65, max: .7}, 1e4 + x * y)
        }
        else if (this.curr == 'tutorial') {
            let ground = 49
            if (x > 0) ground = this.lev[this.curr].endY

            if (y > ground) arr[SOLID] = this.blockAssign(SOLID, {}, 1e4 + x * y)
        }
        else if (this.curr == 'beach') {
            const stretch = 6
            const height = 12

            let ground = 14
            if (x >= this.lev[this.curr].w) {
                x -= this.lev[this.curr].w
                ground = this.lev[this.curr].endY
            }
            else if (x > 0) {
                x -= this.lev[this.curr].w
                ground += x
            }

            const change = x / stretch
            const curr = hash(Math.floor(change)) * height
            const next = hash(Math.floor(change) + 1) * height

            // interpolate bewteen heights
            const avg = curr + (next - curr) * ((change % 1 + 1) % 1)

            const ground_y = Math.floor(ground - avg + Math.abs(x / 2))

            if (y >= 37) type = WATER
            if (y > ground_y) type = SOLID
            if (y == ground_y && hash(x * x) < .1) {
                if (type == WATER) type = SEAWEED
                else type = GRASS
            }

            const block = map[(x - 1) + y * this.lev[this.curr].w]
            if (block != undefined && block.type == SOLID) {
                type = LEDGE
            }

            arr[type] = this.blockAssign(type, {}, 1e4 + x * y)

            // put water behind seaweed
            if (type == SEAWEED) arr[WATER] = this.blockAssign(WATER, {}, 1e4 + x * y)
        }
        else if (this.curr == 'ship') {
            let waterLev = 29

            if (x >= 0) {
                waterLev = this.lev[this.curr].endY
                if (x < this.lev[this.curr].w) type = SOLID
            }

            if (type == AIR && y > waterLev)
                type = WATER

            arr[type] = this.blockAssign(type, {}, 1e4 + x * y)
        }
        else if (this.curr == 'jungle') {
            let ground = 73

            if (y > ground + (Math.sin(x * 2 / 10) + Math.sin(x * Math.PI / 10)) * 2)
                type = 'ground'

            if (type == 'ground')
                arr[SOLID] = this.blockAssign(SOLID, {color: EARTH, min: .75, max: .85}, 1e4 + x * y)
        }
        else if (this.curr == 'jungleBoss') {
            let ground = 54

            if (y > ground + (Math.sin(x * 2 / 10) + Math.sin(x * Math.PI / 10)) * 2)
                type = 'ground'

            if (type == 'ground')
                arr[SOLID] = this.blockAssign(SOLID, {color: EARTH, min: .75, max: .85}, 1e4 + x * y)
        }
        else if (this.curr == 'city') {
            let ground = 49

            if (y > ground + perlin(x, .1) * HERO_JUMP_MAX)
                type = 'ground'

            if (type == 'ground')
                arr[SOLID] = this.blockAssign(SOLID, {color: GRAY, min: .65, max: .7}, 1e4 + x * y)
        }

        return arr
    }

    add(x, y, blockType, blockData, replace) {
        const block = this.blockAssign(blockType, blockData)

        const index = posToIndex(x, y, this.lev[this.curr].w)
        if (index < this.lev[this.curr].w * this.lev[this.curr].h && index >= 0) {
            if (replace || !this.lev[this.curr].arr[index]) this.lev[this.curr].arr[index] = []
            this.lev[this.curr].arr[index][blockType] = block
        }
    }

    TGOSet() {
        game.raining = false
        game.background = images.backgroundtgo
        hero.collisionBox()
    }
    TGOGenerate() {
        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            for (let y = 0; y < this.lev[this.curr].h; y ++) this.add(x, y, AIR, {}, true)
        }

        const ground = {y: 50, grass: 0, shift: 0, tree: 0}

        const build = {w: 15, h: 50, arr: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1]
        }

        const W = this.lev[this.curr].w
        this.lev[this.curr].doors.start = {x: 14, y: ground.y - 2}
        new DirectionArrow(7, ground.y)

        for (let x = 0; x < W; x ++) {

            // place headquarters
            if (x > W / 2 - build.w && x < W / 2 + build.w) {

                if (x == Math.floor(W / 2 - build.w / 2)) {

                    for (let i = 0; i < build.w; i ++) {
                        for (let j = 0; j < build.h; j ++) {
                            const item = build.arr[i + j * build.w]

                            let col = [.2, .2, .2]
                            if (item == 2) col = [.15, .15, .15]
    
                            this.add(
                                x + i, (ground.y - build.h) + j, DECO,
                                {visual: 'plain', color: col, min: .65, max: .7},
                                true)
                            }
                    }

                    new MakeImage('tgoletters', x + 2, ground.y - 11, .5)

                    this.lev[this.curr].doors.end = new TeleportDoor(
                        x + build.w / 2, ground.y,
                        {world: 'floor1', door: 'start'},
                        false, 'wooden')
                }
            }

            else {
                ground.shift --

                if (ground.shift < 0) {
                    ground.y += random(0, 2) ? -1 : 1
                    ground.shift = random(5, 5)

                    if (ground.y < 40) ground.y ++
                    if (ground.y > 60) ground.y --
                }

                // GRASS
                ground.grass --
                if (ground.grass < 0) {
                    this.add(x, ground.y - 1, GRASS, {}, true)
                    ground.grass = random(1, 4)
                }

                // TREES
                ground.tree --
                if (ground.tree < 0) {
                    new FirTree(x, ground.y)
                    ground.tree = random(2, 5)
                }
            }

            // GROUND
            for (let y = ground.y; y < this.lev[this.curr].h; y ++)
                this.add(x, y, SOLID, {color: GREEN, min: .65, max: .75}, true)
        }
    }

    floorOneSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    floorOneGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++) {
                    this.add(X, Y, type, data, replace)
                }
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD}) // top
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD}) // bottom

        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD}) // left
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD}) // right

        // steps
        block(1, this.lev[this.curr].h - 2, 19, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 3, 18, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 4, 17, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 5, 16, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 6, 15, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 7, 14, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 8, 13, 1, SOLID, {color: TGOSLD})
        block(1, this.lev[this.curr].h - 9, 12, 1, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.start = new TeleportDoor(
            38, 33, {world: 'tgo', door: 'end'}, false, 'wooden')

        this.lev[this.curr].doors.tel = new TeleportDoor(
            2, 25, {world: 'tutorial', door: 'start'}, false, 'wooden')

        const floorOneDoor = new TeleportDoor(
            7, 25, {world: 'floor2', door: 'start'}, true, 'wooden')
        floorOneDoor.tryLocked = true

        this.lev[this.curr].doors.end = floorOneDoor
        
        const staff = new Staff(30, 33)

        // detect when to start the first sequence
        staff.control = () => {
            if (staff.sequence) return

            if (hero.x - 3 <= staff.x) {
                hero.x = staff.x + 3
                hero.speed_x = 0

                if (!hero.in_air)
                    sequenceSet('staff1', {
                        staff,
                        beachWay: this.lev[this.curr].doors.tel,
                        nextFloor: this.lev[this.curr].doors.end
                    })
            }
        }
    }

    floorTwoSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    floorTwoGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.start = new TeleportDoor(
            2, this.lev[this.curr].h - 1, {world: 'floor1', door: 'end'}, false, 'wooden')

        block(10, this.lev[this.curr].h - 15, 10, 1, SOLID, {color: TGOSLD})
        block(10, this.lev[this.curr].h - 11, 10, 1, SOLID, {color: TGOSLD})
        block(10, this.lev[this.curr].h - 14, 1, 3, SOLID, {color: TGOSLD})
        block(19, this.lev[this.curr].h - 14, 1, 3, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.tel = new TeleportDoor(
            35, 33, {world: 'beach', door: 'start'}, false, 'wooden')

        this.lev[this.curr].doors.end = new TeleportDoor(
            this.lev[this.curr].w - 2, 33, {world: 'floor3', door: 'start'}, true, 'wooden')

        const staff = new Staff(15, 33, true)
        staff.control = () => {
            if (hero.x > staff.x - 3 && !spoken['staff2PASS1']) {
                hero.x = staff.x - 3
                if (!hero.in_air) say('staff2PASS1', staff)
            }
        }
        staff.comments = [
            'staff2PASS2',
            'staff2PASS3',
            'staff2PASS4'
        ]
    }

    floorThreeSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    floorThreeGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.start = new TeleportDoor(
            this.lev[this.curr].w - 2, this.lev[this.curr].h - 1, {world: 'floor2', door: 'end'}, false, 'wooden')

        this.lev[this.curr].doors.tel = new TeleportDoor(
            2, 33, {world: 'ship', door: 'start'}, false, 'wooden')

        this.lev[this.curr].doors.end = new TeleportDoor(
            5, 33, {world: 'floor4', door: 'start'}, true, 'wooden')

        const staff = new Staff(15, 33, false)
        staff.control = () => {
            if (hero.x < staff.x + 3 && !spoken['staff3PASS1']) {
                hero.x = staff.x + 3
                if (!hero.in_air) say('staff3PASS1', staff)
            }
        }
        staff.comments = [
            'staff3PASS2',
            'staff3PASS3'
        ]
    }

    floorFourSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    floorFourGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.start = new TeleportDoor(
            2, this.lev[this.curr].h - 1, {world: 'floor3', door: 'end'}, false, 'wooden')

        this.lev[this.curr].doors.tel = new TeleportDoor(
            this.lev[this.curr].w - 4, 33, {world: 'jungle', door: 'start'}, false, 'wooden')

        this.lev[this.curr].doors.end = new TeleportDoor(
            this.lev[this.curr].w - 2, 33, {world: 'floor5', door: 'start'}, true, 'wooden')

        const staff = new Staff(10, 33)
        staff.control = () => {
            if (hero.x > staff.x - 3 && !spoken['staff4PASS1']) {
                hero.x = staff.x - 3
                if (!hero.in_air) say('staff4PASS1', staff)
            }
        }
        staff.comments = [
            'staff4PASS2',
            'staff4PASS3'
        ]
    }

    floorFiveSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    floorFiveGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.start = new TeleportDoor(
            this.lev[this.curr].w - 2, this.lev[this.curr].h - 1, {world: 'floor4', door: 'end'}, false, 'wooden')

        this.lev[this.curr].doors.tel = new TeleportDoor(
            4, 33, {world: 'jungleBoss', door: 'start'}, false, 'wooden')

        this.lev[this.curr].doors.end = new TeleportDoor(
            2, 33, {world: 'floor6', door: 'start'}, true, 'wooden')

        const staff = new Staff(20, 33, true)
        staff.control = () => {
            if ((hero.x < staff.x + 3 && !spoken['staff5PASS1'])) {
                hero.x = staff.x + 3
                if (!hero.in_air) say('staff5PASS1', staff)
            }
        }
    }

    floorSixSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    floorSixGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})

        this.lev[this.curr].doors.start = new TeleportDoor(
            2, this.lev[this.curr].h - 1, {world: 'floor5', door: 'end'}, false, 'wooden')

        this.lev[this.curr].doors.tel = new TeleportDoor(
            this.lev[this.curr].w - 4, 33, {world: 'city', door: 'start'}, false, 'wooden')

        this.lev[this.curr].doors.end = new TeleportDoor(
            this.lev[this.curr].w - 2, 33, {world: 'prison', door: 'start'}, true, 'wooden')

        const staff = new Staff(20, 33)
        staff.control = () => {
            if (hero.x > staff.x - 3 && !spoken['staff6PASS1']) {
                hero.x = staff.x - 3
                if (!hero.in_air) say('staff6PASS1', staff)
            }
        }
    }

    prisonSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    prisonGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        // background
        block(1, 1, this.lev[this.curr].w - 2, this.lev[this.curr].h - 2, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, this.lev[this.curr].h - 1, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, this.lev[this.curr].h - 2, SOLID, {color: TGOSLD})

        new Lamp(4, 1, random(1, 2, 0))
        new Lamp(35, 1, random(1, 2, 0))
        const friend = new Friend(19.2, 9)
        const drillo = new Drillo(17.5, 9)
        const prison = new Prison(15, 9)

        const lever = new Lever(28, 9)
        lever.stuck = true

        prison.update = () => {
            if (hero.x > prison.x - 2 && !prison.speak) {
                hero.x = prison.x - 2

                if (!hero.in_air) {
                    say('Drillo1', drillo)
                    prison.speak = true
                }
            }
        }

        this.lev[this.curr].doors.start = new TeleportDoor(
            2, this.lev[this.curr].h - 1, {world: 'floor6', door: 'end'}, false, 'wooden')

        const door = this.lev[this.curr].doors.end = new TeleportDoor(
            this.lev[this.curr].w - 2, this.lev[this.curr].h - 1,
            {world: 'council', door: 'start'}, false, 'wooden')

        door.spare = () => {
            if (hero.brokenOut) {
                seq.prison = {
                    props: [],
                    go: () => {
                        lever.stuck = false
                        const X = 15.5
                        const tgo = [
                            new TGO(X, 9, 2.8, 2),
                            new TGO(X + 4.2, 9, 2.2, 1.7),
                            new TGO(X + 5.5, 9, 2.6, 1.9),
                            new TGO(X + 6.8, 9, 2.4, 1.8),
                            new TGO(X + 8.2, 9, 2.5, 1.8)
                        ]
                        tgo[1].dir = -1
                        tgo[2].dir = -1
                        tgo[3].dir = -1
                        tgo[4].dir = -1

                        prison.update = () => {
                            if (hero.x < prison.x + 16 && map.lev[map.curr].sqn.type != 'prison') {
                                if (!hero.in_air)
                                    sequenceSet('prison', {tgo, lever, drillo, friend, prison})
                            }
                        }
                    }
                }
                seq.prison.go()

                hero.brokenOut = false
            }
        }
    }

    councilSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    councilGenerate() {
        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        const y = this.lev[this.curr].h - 1

        // background
        block(1, 1, this.lev[this.curr].w - 2, y - 1, DECO, {visual: 'plain', color: TGOBG, min: .6, max: .7}, true)

        // walls
        block(0, 0, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, y, this.lev[this.curr].w, 1, SOLID, {color: TGOSLD})
        block(0, 1, 1, y - 1, SOLID, {color: TGOSLD})
        block(this.lev[this.curr].w - 1, 1, 1, y - 1, SOLID, {color: TGOSLD})

        seq.council = {
            props: [],
            go: () => {
                const door = this.lev[this.curr].doors.start = new TeleportDoor(
                    2, y, {world: 'prison', door: 'end'}, true, 'wooden')

                const can = new Cannon(30, y)
                const tgo = [
                    new TGO(15, y, 2.8, 2),
                    new TGO(17, y, 2.2, 1.7),
                    new TGO(19, y, 2.6, 1.9),
                    new TGO(21, y, 2.4, 1.8),
                    new TGO(23, y, 2.5, 1.8)
                ]
                tgo[1].dir = -1
                tgo[2].dir = -1
                tgo[3].dir = -1
                tgo[4].dir = -1
                const cage = new Cage(5, 1, 10)
                const lever = new Lever(26.5, y)

                tgo[0].control = () => {
                    if (hero.x >= tgo[0].x - 8 && map.lev[map.curr].sqn.type != 'council') {
                        hero.x = tgo[0].x - 8

                        if (!hero.in_air)
                            sequenceSet('council', {tgo, can, cage, lever, door})
                    }
                }

                seq.council.props.push(tgo[0])
                seq.council.props.push(tgo[1])
                seq.council.props.push(tgo[2])
                seq.council.props.push(tgo[3])
                seq.council.props.push(tgo[4])
                seq.council.props.push(lever)
                seq.council.props.push(door)
                seq.council.props.push(can)
            }
        }
        seq.council.go()
    }

    tutorialSet() {
        game.raining = false
        game.background = images.backgroundsea

        hero.collisionBox()
    }
    tutorialGenerate() {
        const DOOR = new TeleportDoor(0, 50, {world: 'floor1', door: 'tel'}, false, 'seal')
        DOOR.spare = () => {
            if (hero.justCollectedKey) {
                DOOR.locked = true
                hero.justCollectedKey = false
            }
        }
        this.lev[this.curr].doors.start = DOOR

        const block = (x, y, w, h, type, data = {}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++) {
                    this.add(X, Y, type, data, replace)
                }
            }
        }

        block(0, 0, this.lev[this.curr].w, this.lev[this.curr].h, AIR)

        block(84, 44, 1, 1, LEDGE, {side: 'right'})
        block(82, 41, 1, 1, LEDGE, {side: 'left'})
        block(84, 38, 1, 1, LEDGE, {side: 'right'})
        block(82, 35, 1, 1, LEDGE, {side: 'left'})
        block(84, 32, 1, 1, LEDGE, {side: 'right'})

        block(21, 47, 1, 1, LEDGE, {side: 'left'})
        block(70, 28, 1, 1, LEDGE, {side: 'left'})

        block(0, 50, 120, 50, SOLID)
        block(10, 49, 1, 1, SOLID)
        block(11, 48, 1, 2, SOLID)
        block(12, 47, 3, 3, SOLID)
        block(15, 45, 1, 5, SOLID)
        block(16, 46, 5, 4, SOLID)
        block(35, 49, 1, 1, SOLID)
        block(36, 48, 1, 2, SOLID)
        block(37, 47, 26, 3, SOLID)
        block(82, 49, 1, 1, SOLID)
        block(83, 48, 1, 2, SOLID)
        block(84, 47, 1, 3, SOLID)
        block(85, 31, 35, 27, SOLID)

        block(54, 38, 3, 1, SOLID)
        block(53, 39, 4, 1, SOLID)
        block(52, 40, 5, 6, SOLID)
        block(57, 31, 18, 11, SOLID)
        block(75, 31, 7, 15, SOLID)
        block(75, 46, 6, 1, SOLID)
        block(75, 47, 5, 1, SOLID)
        block(57, 27, 13, 7, SOLID)
        block(58, 26, 12, 1, SOLID)
        block(59, 25, 11, 1, SOLID)

        block(57, 37, 7, 1, AIR)
        block(64, 35, 8, 3, AIR)

        block(5, 49, 1, 1, GRASS)
        block(17, 45, 2, 1, GRASS)
        block(30, 49, 1, 1, GRASS)
        block(32, 49, 1, 1, GRASS)

        block(58, 42, 1, 1, HANGWEED)
        block(60, 42, 1, 1, HANGWEED)

        block(63, 50, 10, 4, WATER)
        block(100, 31, 14, 1, WATER)
        block(101, 32, 12, 1, WATER)
        block(102, 33, 10, 3, WATER)

        block(52, 42, 30, 8, DECO, {visual: 'plain', color: [.75, .65, .45], min: .65, max: .7}, false)
        block(82, 31, 3, 18, DECO, {visual: 'plain', color: [.75, .65, .45], min: .65, max: .7}, false)
        block(57, 35, 16, 3, DECO, {visual: 'plain', color: [.75, .65, .45], min: .65, max: .7}, false)

        new SandCrab(26, 49)
        new BlueFish(64, 51)
        new BlueFish(69, 53)
        new Tree(75, 31, true)

        block(63, 53, 2, 1, SEAWEED, {}, false)
        block(71, 53, 1, 1, SEAWEED, {}, false)
        block(102, 35, 4, 1, SEAWEED, {}, false)
        block(110, 35, 2, 1, SEAWEED, {}, false)

        new Sign(38, 47, ['While jumping, press the down key to pound this treasure chest. Make sure you collect all the coins!'])
        new Sign(48, 47, ['When on the ground, press the down key to duck. You can use the left or right keys while ducking to dash under low ceilings!'])
        new Sign(61, 47, ['Use the up key to swim forwards.'])
        new Sign(80, 50, ['Collect all the coins to reveal the key!'])
        new Sign(54, 38, ['Press the left or right keys while ducking to dash into the treasure chest!'])
        new Sign(96, 31, ['Press the down key when underwater to water-dash! You can use it to open chests or deal damage.'])

        new SilverChest(42, 47)
        new SilverChest(68, 38)
        new SilverChest(108, 36)

        const door = new TeleportDoor(119, 31, {world: 'floor1', door: 'tel'}, true, 'seal')
        door.spare = () => {if (hero.key) door.locked = false}
        this.lev[this.curr].doors.end = door

        new KeySlot(63, 25, door)
        this.lev[this.curr].endY = 30
    }

    beachSet() {
        game.raining = false
        game.background = images.backgroundsea

        hero.collisionBox()
    }
    beachGenerate() {
        // 5
        SEED = 12
        const box = {
            top: 10,
            ground_bot: 14,
            pool_bot: 35,
            tunnel_bot: 38,
            sea_level: 37,
            chamber_level: {min: 40, max: 77},
            seabed: 80
        }

        const ground = {
            offset: 3, // offset the mountains
            y: 0,
            climb_speed: {min: 1, max: 5}, // how fast the ground moves towards goal
            climb_speed_sea: {min: 3, max: 6}, // how fast the ground moves towards goal
            hill_bump: 2, // how compact the hills are
            timer: {
                small: {min: 1, max: 3, curr: 0}, // small change timer
                large: {min: 1, max: 3, curr: 0, change: 0}, // large change timer
                sea: {min: 80, max: 90, curr: 0}, // when land should go underwater
            },
            range: {
                small: {min: -5, max: 0}, // small change fluctuation rate
                large: {min: box.top, max: box.ground_bot, curr: 0}, // large change fluctuation rate
                sea: {min: 30, max: 31, curr: 0} // how long the sea should last for
            },
            key: {x: 300, y: 0}
        }
        const pool = {
            timer: {min: 20, max: 40, curr: 0},
            size: 7,
            tunnels: []
        }
        const grass = {timer: {min: 0, max: 5, curr: 0}}
        const seaweed = {timer: {min: 0, max: 3, curr: 0}, tunnel: {min: 0, max: 9, curr: 0}}
        const foliage = []

        const pirate = {
            highest: this.lev[this.curr].h,
            pos: 0,
            timer: {min: 40, max: 50, curr: 0}, // pirate timer range
            type: ['moderate', PIRATE_MODERATE_W],
            leader: {min: 3, max: 4, curr: 0} // leader freq
        }
        const seaCrab = {
            land: {min: 10, max: 20, curr: 0},
            sea: {min: 10, max: 25, curr: 0}
        }
        const sandCrab = {min: 4, max: 8, curr: 0}
        const tree = {min: 8, max: 14, curr: 0}
        const blueFish = {
            timer: {min: 2, max: 3, curr: 0},
            y: box.chamber_level.min
        }
        const badFish = {min: 20, max: 24, curr: 0}
        const chest = {
            timer: {min: 5, max: 10, curr: 0},
            chamber: {min: 5, max: 6, curr: 0},
            ground: {min: 10, max: 20, curr: 0},
            last: GOLD_CHEST_W * 2
        }
        const checkmax = 50
        let check = checkmax

        /* The 'sea' object has an index (sea.i) and an array.
        The index refers to which sea the ground is currently
        active with. Just after a sea has been made, the shift()
        funtion runs, which enlarges the index and adds a new
        object to the array. The chambers array stores all
        respective chamber information for the sea index. */
        const sea = {
            i: 0,
            old_i: 0, // what the index was previously
            active: false,
            chambers: [[]],
            chamber: {
                timer: {min: 15, max: 25, curr: 0},
                size: {min: 6, max: 11},
                maxAmount: 4 // max amount per ocean
            },
            underWater: 0 // how long the sea has been underwater for
        }
        sea.shift = () => {
            calculateChambers()
            sea.chambers.push([])
            sea.i ++
        }

        objSet(ground.timer.small, '0/min')
        objSet(ground.timer.large, '0/min')
        objSet(ground.timer.sea, 'min/max') // when the sea should come
        objSet(ground.range.sea, 'min/max') // how long it should last for
        objSet(pool.timer, 'min/max')
        objSet(sea.chamber.timer, 'min/max')
        objSet(grass.timer, 'min/max')
        objSet(seaweed.timer, 'min/max')
        objSet(seaweed.tunnel, 'min/max')
        objSet(pirate.timer, 'min/max')
        objSet(pirate.leader, 'min/max')
        objSet(seaCrab.land, 'min/max')
        objSet(seaCrab.sea, 'min/max')
        objSet(sandCrab, 'min/max')
        objSet(tree, 'min/max')
        objSet(blueFish.timer, 'min/max')
        objSet(badFish, 'min/max')
        objSet(chest.timer, 'min/max')
        objSet(chest.chamber, 'min/max')
        objSet(chest.ground, 'min/max')

        ground.range.large.curr = ground.range.large.max
        ground.y = ground.range.large.curr

        const DOOR = new TeleportDoor(0, ground.y - 1, {world: 'floor2', door: 'tel'}, false, 'seal')
        DOOR.spare = () => {
            if (hero.justCollectedKey) {
                DOOR.locked = true
                hero.justCollectedKey = false
            }
        }
        this.lev[this.curr].doors.start = DOOR

        /* TOP and BOT tell us the proximities of the small ground range
        The two are used from the uneven seabed to the bumpy ground. They
        play a key role in making the world look organic. */
        let TOP = 0
        let BOT = 0

        const start = () => {
            for (let x = 0; x < this.lev[this.curr].w; x ++) {
                for (let y = 0; y < this.lev[this.curr].h; y ++) this.add(x, y, AIR, {}, true)
            }

            // loop through the width of the world to make map
            for (let x = 0; x < this.lev[this.curr].w; x ++) {
                // IN-RANGE-OF-GOAL CONSTANTS
                TOP = ground.range.large.curr + ground.range.small.min
                BOT = ground.range.large.curr + ground.range.small.max

                if (x < this.lev[this.curr].w - 20) {
                    // TIMER TO MAKE SEA
                    ground.timer.sea.curr --
                    if (ground.timer.sea.curr < 0) {
                        BOT = box.seabed
                        TOP = BOT - 2

                        // detects if gound has reached seabed
                        if (ground.y > TOP && ground.y < BOT) {
                            ground.range.sea.curr --

                            // underwater chests
                            chest.timer.curr --

                            if (chest.timer.curr <= 0) {
                                // chest placement
                                const startPoint = chest.last / 2 - GOLD_CHEST_W / 2
                                if (chest.timer.curr == -Math.floor(startPoint)) {
                                    const newChest = new GoldenChest(x, ground.y)
                                    new ChestShark(x - SHARK_W / 2, ground.y - 4, newChest)
                                }

                                // end of chest stretch
                                if (chest.timer.curr < -chest.last || ground.range.sea.curr < chest.last) {
                                    chest.timer.reset()
                                }
                            }

                            // sea creatures
                            badFish.curr --
                            blueFish.timer.curr --
                            blueFish.y ++
                            if (blueFish.y >= box.chamber_level.max)
                                blueFish.y = box.chamber_level.min

                            else if (badFish.curr < 0) {
                                new BadFish(x, ground.y - 1)
                                badFish.reset()
                            }

                            else if (blueFish.timer.curr < 0) {
                                new BlueFish(x, blueFish.y)
                                blueFish.timer.reset()
                            }

                            // decide whether to stop the sea or not
                            if (ground.range.sea.curr < 0) {
                                ground.range.sea.reset()
                                ground.timer.sea.reset()
                            }
                        }
                    }

                    // record the stopping point of the sea
                    if (ground.y <= box.sea_level && sea.active) {
                        sea.shift()
                        sea.active = false
                    }
                    if (ground.y > box.sea_level) sea.active = true

                    // only change height of ground when a pool or chest is NOT being constructed
                    if (pool.timer.curr > 0 && chest.timer.curr > 0 && chest.ground.curr > 0 && check > 0) {
                        // only count down for large change if ground is within area
                        if (ground.y >= TOP && ground.y <= BOT) ground.timer.large.curr --
                        ground.timer.small.curr --
                    }

                    // create underground chambers where there is no sea
                    if (!sea.active) {
                        sea.chamber.timer.curr --
                        if (ground.timer.sea.curr < 0 &&
                            sea.chamber.timer.curr <= 0 &&
                            sea.chambers[sea.i].length < sea.chamber.maxAmount) {

                            sea.chambers[sea.i].push({
                                x, y: random(box.chamber_level.min, box.chamber_level.max),
                                width: random(sea.chamber.size.min, sea.chamber.size.max),
                                height: random(sea.chamber.size.min, sea.chamber.size.max),
                                direction: 1
                            })
                            sea.chamber.timer.reset()
                        }
                    }

                    // create solid ground
                    const old_ground_y = ground.y
                    makeGround(x)

                    // add ledges
                    const dist = ground.y - old_ground_y
                    const ledges = Math.floor(Math.abs(dist) / (HERO_JUMP_MAX + .5))
                    let begin = ground.y
                    let oft = 0
                    let side = 'left'
                    if (dist < 0) {
                        begin = old_ground_y
                        oft = -1
                        side = 'right'
                    }
                    for (let i = 0; i < ledges; i ++) {
                        const y = begin - (i + 1) * HERO_JUMP_MAX
                        if (y < box.sea_level) this.add(x + oft, y, LEDGE, {side}, false)
                    }

                    // make pools if in range
                    if (ground.y < box.pool_bot) makePools(x, ground.y)

                    // create foliage, pirates, crabs, coins and chests
                    if (pool.timer.curr > 0) {
                        if (ground.y <= box.sea_level) {
                            tree.curr --
                            sandCrab.curr --
                            seaCrab.land.curr --
                            grass.timer.curr --
                            pirate.timer.curr --
                            chest.ground.curr --
                            check --

                            if (tree.curr < 0) {
                                new Tree(x, ground.y)
                                tree.reset()
                            }

                            else if (sandCrab.curr < 0) {
                                new SandCrab(x, ground.y - 1)
                                sandCrab.reset()
                            }

                            else if (seaCrab.land.curr < 0) {
                                new SeaCrab(x, ground.y - 1)
                                seaCrab.land.reset()
                            }

                            else if (grass.timer.curr < 0) {
                                foliage.push({x, y: ground.y - 1, type: GRASS})
                                grass.timer.reset()
                            }
        
                            if (pirate.timer.curr < 0) {
                                if (pirate.timer.curr == -1) pirate.pos = x
                                // find highest piece of ground for pirate
                                if (ground.y < pirate.highest) pirate.highest = ground.y

                                // MAKE PIRATE
                                if (pirate.timer.curr <= -Math.ceil(pirate.type[1])) {
                                    // calculate what type the pirate should be
                                    pirate.leader.curr --
                                    if (pirate.leader.curr <= 0) {
                                        pirate.type = ['leader', PIRATE_LEADER_W]
                                        pirate.leader.reset()
                                    }
                                    else {
                                        if (pirate.type[0] == 'recruit')
                                            pirate.type = ['moderate', PIRATE_MODERATE_W]

                                        else if (pirate.type[0] == 'moderate' || pirate.type[0] == 'leader')
                                            pirate.type = ['recruit', PIRATE_RECRUIT_W]
                                    }

                                    // set the pirate based on its decided type
                                    if (pirate.type[0] == 'recruit')
                                        new PirateRecruit(pirate.pos, pirate.highest)
                                    else if (pirate.type[0] == 'moderate')
                                        new PirateModerate(pirate.pos, pirate.highest)
                                    else if (pirate.type[0] == 'leader')
                                        new PirateLeader(pirate.pos, pirate.highest)

                                    pirate.timer.reset()
                                    pirate.highest = this.lev[this.curr].h
                                }
                            }

                            if (chest.ground.curr < 0) {
                                if (chest.ground.curr == -1) new SilverChest(x, ground.y)
                                if (chest.ground.curr < -chest.last)
                                    chest.ground.reset()
                            }

                            else if (check < 0) {
                                if (check == -1) new Checkpoint(x, ground.y)
                                if (check < -1)
                                    check = checkmax
                            }
                        }
                        else {
                            seaCrab.sea.curr --
                            seaweed.timer.curr --

                            if (seaCrab.sea.curr < 0) {
                                new SeaCrab(x, ground.y - 1)
                                seaCrab.sea.reset()
                            }

                            else if (seaweed.timer.curr < 0) {
                                foliage.push({x, y: ground.y - 1, type: SEAWEED})
                                seaweed.timer.reset()
                            }
                        }
                    }
                }

                // teleport door and key placement
                else {
                    if (ground.y > box.sea_level - 1)
                        ground.y -= 3

                    if (x == this.lev[this.curr].w - 4) {
                        sea.shift()

                        ground.y = box.sea_level - 1
                        const door = new TeleportDoor(x + 3, ground.y, {world: 'floor2', door: 'tel'}, true, 'seal')
                        door.spare = () => {if (hero.key) door.locked = false}

                        new KeySlot(ground.key.x, ground.key.y, door)

                        new Sign(x + 1, ground.y, ['Fill your coin bar to get through the door! Some treasure chests are well hidden.'])
                        this.lev[this.curr].endY = ground.y - 1
                    }

                    for (let y = 0; y < this.lev[this.curr].h - ground.y; y ++)
                        this.add(x, y + ground.y, SOLID, {}, true)

                    for (let y = 0; y < ground.y - box.sea_level; y ++)
                        this.add(x, box.sea_level + y, WATER, {}, false)
                }

                // set key y position
                if (x == ground.key.x) ground.key.y = ground.y
            }

            makeTunnels()

            // foliage
            for (let i = 0; i < foliage.length; i ++) {
                const item = foliage[i]
                if (item.type == GRASS || (item.type == SEAWEED &&
                    mapItemExists(item.x, item.y + 1.5, SOLID) &&
                    mapItemExists(item.x, item.y + .5, WATER)))
                    this.add(item.x, item.y, item.type, {}, false)
            }
        }

        // this function makes ground for a specific x position and returns the y result
        const makeGround = x => {
            // CHANGE-LARGE-HEIGHT CALCULATIONS
            if (ground.timer.large.curr < 0) {
                ground.timer.large.change += ground.hill_bump

                const min = ground.range.large.min
                const max = ground.range.large.max
                const mid = (min + max) / 2

                const jolt = mid + Math.cos(ground.timer.large.change + ground.offset) * (max - min) / 2

                ground.range.large.curr = Math.floor(jolt)

                ground.timer.large.reset()
            }

            // CHANGE-SMALL-HEIGHT CALCULATIONS
            if (ground.timer.small.curr < 0) {
                const options = []

                let speed = 1
                // climb quickly towards area if ground is out of range
                if (ground.y < TOP || ground.y > BOT) {
                    if (ground.y > box.sea_level)
                        speed = random(ground.climb_speed_sea.min, ground.climb_speed_sea.max)
                    else speed = random(ground.climb_speed.min, ground.climb_speed.max)
                }

                if (ground.y > TOP) options.push(ground.y - speed) // up available
                if (ground.y < BOT) options.push(ground.y + speed) // down available

                ground.y = options[random(0, options.length)]

                if (Math.abs(ground.y - TOP) < speed) ground.y = TOP
                if (Math.abs(ground.y - BOT) < speed) ground.y = BOT

                ground.timer.small.reset()
            }

            // SET BLOCKS

            // make sea
            if (ground.y > box.sea_level) {
                sea.underWater ++
                for (let y = 0; y < (ground.y - box.sea_level) + 1; y ++)
                    this.add(x, ground.y - y, WATER, {status: 'ocean'}, true)
            }
            else sea.underWater = 0

            // make ground
            for (let y = 0; y < this.lev[this.curr].h - ground.y; y ++) this.add(x, y + ground.y, SOLID, {}, true)

            // make shallow areas on either side of the sea
            if (sea.underWater == 1) this.add(x, box.sea_level + 1, SOLID, {}, true)
            else if (sea.i != sea.old_i) this.add(x - 2, box.sea_level + 1, SOLID, {}, true)
            sea.old_i = sea.i

            return ground.y
        }

        // this function adds a tunnel piece for a specific area
        const makeWaterTunnel = (tunnel) => {
            // carve
            for (let i = 0; i < tunnel.length; i ++) {
                const item = tunnel[i]

                const _x = item.x
                const _y = item.y

                if (mapItemExists(_x, _y, AIR)) continue

                this.add(_x, _y, WATER, {}, true)

                seaweed.tunnel.curr --

                if (seaweed.tunnel.curr < 0 &&
                    i < tunnel.length - 1 &&
                    mapItemExists(_x, _y + 1, SOLID) &&
                    tunnel[i + 1].y == _y) {

                    this.add(_x, _y, SEAWEED, {}, false)
                    seaweed.tunnel.reset()
                }
            }
        }

        const makePools = (x, y) => {
            pool.timer.curr --

            const curr = pool.timer.curr
            const size = pool.size + 2

            if (curr < 0) {
                // Give water a rim
                if (curr == -1 || curr == -size) this.add(x, y, SOLID, {}, true)
                // Fill pool
                else this.add(x, y, WATER, {}, true)

                // Run this process at the start of a pool
                if (curr == -2) {
                    const amount = 1
                    for (let i = 0; i < amount; i ++) {
                        const pos_x = x + random(0, pool.size)
                        pool.tunnels.push({x: pos_x, y})
                    }
                }

                // Reset pool
                if (curr <= -size) pool.timer.reset()
            }
        }

        // makes the tunnels for the pools
        const makeTunnels = () => {
            const check = (x, y) => {
                if (mapItemExists(x, y, AIR)) return 'mid'
                if (mapItemExists(x - 1, y, AIR) ||
                    mapItemExists(x + 1, y, AIR)) return 'side'
                if (mapItemExists(x, y - 1, AIR) ||
                    mapItemExists(x, y + 1, AIR)) return 'vert'
                if (mapItemExists(x + 1, y + 1, AIR) ||
                    mapItemExists(x + 1, y - 1, AIR) ||
                    mapItemExists(x - 1, y + 1, AIR) ||
                    mapItemExists(x - 1, y - 1, AIR)) return 'diag'
            }

            for (let i = 0; i < pool.tunnels.length; i ++) {
                const item = pool.tunnels[i]

                let x = item.x
                let y = item.y

                this.add(x - 1, y + 1, WATER, {}, true)
                this.add(x + 1, y + 1, WATER, {}, true)

                // how long ot should be untill the tunnel rises to the surface
                const rise_timer = {min: 4, max: 6, curr: 0}
                // shift determines when the x should 'shift' sideways by a block
                const shift = {min: 1, max: 3, curr: 0}
                // flat determines when a flat stretch of tunnel should occur
                const flat = {
                    timer: {min: 5, max: 10, curr: 0}, // when it should happen
                    last: {min: 6, max: 10, curr: 0} // how long it should last
                }

                // The tunnel length will be no smaller than MIN_LEN
                const MIN_LEN = 5
                // The tunnel will stop if it reaches MAX_LEN
                const MAX_LEN = 14

                objSet(rise_timer, 'min/max')
                objSet(shift, 'min/max')
                objSet(flat.timer, 'min/max')
                objSet(flat.last, 'min/max')

                const tunnel = [{x, y}]
                let ascend = false

                for (let j = 0; j < MAX_LEN; j ++) {
                    let index = j
                    if (index < 0) index = 0
                    const curr = tunnel[index]

                    let move = 'none'
                    const CHECK = check(x, y)
                    let warning = false

                    const decide = () => {
                        // stop tunnel if it's long enough and it hits air
                        if (j > MIN_LEN) ascend = true

                        // descend tunnel if it's too short and it hits air
                        else {
                            flat.timer.reset()
                            shift.reset()
                            rise_timer.reset()
                            x = curr.x
                            y ++
                        }
                    }

                    // force tunnel to rise if tunnel limit is reached (the countdown is overridden)
                    if (y >= box.tunnel_bot)
                        rise_timer.curr = 0

                    // don't let tunnel stop at the side of a wall
                    if (CHECK == 'side') {
                        warning = true

                        x = curr.x
                        y = curr.y

                        decide()
                    }
                    if (CHECK == 'vert' || CHECK == 'diag') {
                        warning = true

                        if (CHECK == 'diag') {
                            x = curr.x
                            y = curr.y
                        }

                        decide()
                    }

                    if (ascend) {
                        warning = true

                        if (CHECK == 'vert') {
                            tunnel.push({x, y})
                            break
                        }
                        move = 'up'
                    }

                    if (!warning) {
                        // flat stretch
                        if (flat.timer.curr < 0) {
                            move = 'right'

                            if (flat.timer.curr < -flat.last.curr) {
                                flat.last.reset()
                                flat.timer.reset()
                            }
                        }
                        // normal rise/fall
                        else {
                            if (shift.curr < 0) {
                                move = 'right'
                                shift.reset()
                            }
                            else {
                                if (rise_timer.curr <= 0) move = 'up'
                                else move = 'down'
                            }
                        }
                    }

                    // CARVE TUNNEL
                    tunnel.push({x, y})

                    // TIMERS AND RESTRICTIONS
                    if (move == 'up') y --
                    else if (move == 'down') y ++
                    else if (move == 'left') x --
                    else if (move == 'right') x ++

                    if (move == 'down' || move == 'up') rise_timer.curr --
                    shift.curr --
                    flat.timer.curr --
                }


                makeWaterTunnel(tunnel)
            }
        }

        // makes chambers and chamber tunnels
        const calculateChambers = () => {
            // get all chambers for specific sea
            const chambers = sea.chambers[sea.i]

            // passage movement
            const shift = {min: 1, max: 20, curr: 0}
            objSet(shift, 'min/max')

            for (let i = 0; i < chambers.length; i ++) {
                const item = chambers[i]

                // CARVE CHAMBERS
                for (let X = 0; X < item.width; X ++) {
                    for (let Y = 0; Y < item.height; Y ++) {
                        this.add(item.x + X, item.y + Y, WATER, {}, true)
                    }

                    chest.chamber.curr --
                    blueFish.timer.curr --
                    seaCrab.sea.curr --
                    seaweed.timer.curr --

                    if (chest.chamber.curr < 0 && X < item.width - SILV_CHEST_W) {
                        new SilverChest(item.x + X, item.y + item.height)
                        chest.chamber.reset()
                    }

                    if (blueFish.timer.curr < 0) {
                        new BlueFish(item.x + X, item.y + random(0, item.height - 1))
                        blueFish.timer.reset()
                    }

                    if (seaweed.timer.curr < 0) {
                        this.add(item.x + X, item.y + item.height - 1, SEAWEED, {}, false)
                        seaweed.timer.reset()
                    }

                    if (seaCrab.sea.curr < 0) {
                        new SeaCrab(item.x + X, item.y + item.height - 1)
                        seaCrab.sea.reset()
                    }
                }

                // PASSAGES
                // start at the chamber position
                const point = {x: item.x, y: item.y}
                // set up tunnel array
                const tunnel = []

                for (let i = 0; i < this.lev[this.curr].w * this.lev[this.curr].h; i ++) {
                    tunnel.push({x: point.x, y: point.y})
                    const touchedWater = mapItem(point.x, point.y)[WATER]

                    let change_y = false

                    // move tunnel vertically
                    shift.curr --
                    if (shift.curr <= 0) {
                        change_y = true

                        let dir = -1
                        if (random(0, 2)) dir = 1

                        if (point.y <= box.chamber_level.min) dir = 1
                        else if (point.y >= box.chamber_level.max) dir = -1
                        point.y += dir

                        shift.reset()
                    }

                    // move tunnel horizontally
                    if (!change_y) point.x += item.direction

                    // finish tunnel if reached goal
                    if (touchedWater) {
                        if (touchedWater.status == 'ocean') break
                    }
                }

                makeWaterTunnel(tunnel)
            }
        }

        start()
    }

    shipSet() {
        game.raining = true
        game.background = images.backgroundstormsea

        hero.collisionBox()
    }
    shipGenerate() {
        const box = {
            top: 10,
            bot: 30,
            sea: 35,
            seaBotTop: 45,
            seaBotBot: 50
        }

        const ground = {
            y: box.bot,
            change: {min: 0, max: 3, curr: 0}
        }
        const grass = {min: 0, max: 3, curr: 0}
        const tree = {min: 10, max: 20, curr: 0}
        const pirate = {
            highest: this.lev[this.curr].h,
            pos: 0,
            timer: {min: 20, max: 30, curr: 20},
            type: ['leader', PIRATE_LEADER_W]
        }
        const shark = {min: 30, max: 40, curr: 0}
        const mutant = {min: 3, max: 5, curr: 0}
        const fish = {min: 10, max: 50, curr: 0}
        const crab = {min: 15, max: 25, curr: 15}
        const island = {
            timer: {min: 90, max: 100, curr: 0},
            tree: {min: 9, max: 15, curr: 0},
            size: 40
        }
        const mine = {min: 50, max: 60, curr: 0}

        let sea = 50
        let ship = 300
        const maxCheck = 50
        let check = maxCheck

        objSet(ground.change, 'min/max')
        objSet(grass, 'min/max')
        objSet(tree, 'min/max')
        objSet(pirate.timer, 'none')
        objSet(shark, 'min/max')
        objSet(mutant, 'min/max')
        objSet(fish, 'min/max')
        objSet(crab, 'none')
        objSet(island.timer, 'min/max')
        objSet(island.tree, 'min/max')
        objSet(mine, 'min/max')

        const DOOR = new TeleportDoor(1, ground.y, {world: 'floor3', door: 'tel'}, false, 'seal')
        DOOR.spare = () => {
            if (hero.justCollectedKey) {
                DOOR.locked = true
                hero.justCollectedKey = false
            }
        }
        this.lev[this.curr].doors.start = DOOR

        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            for (let y = 0; y < this.lev[this.curr].h; y ++) this.add(x, y, AIR, {}, true)
        }

        let TOP = box.top
        let BOT = box.bot

        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            sea --
            const inSea = ground.y > box.sea

            ground.change.curr --
            grass.curr --
            crab.curr --
            check --

            // GROUND
            if (ground.change.curr < 0 && x > 1 && check > 0) {
                let dir = random(0, 2) ? 1 : -1
                if (ground.y <= TOP) dir = 1
                if (ground.y >= BOT) dir = -1
                ground.y += dir

                if (sea < 0) {
                    TOP = box.seaBotTop
                    BOT = box.seaBotBot
                }
                ground.change.reset()
            }

            if (check < 0) {
                if (check == -1) {
                    if (inSea) new Checkpoint(x, ground.y + 1)
                    else new Checkpoint(x, ground.y)
                }
                if (check < -2)
                    check = maxCheck
            }

            for (let y = 0; y < this.lev[this.curr].h - ground.y; y ++)
                this.add(x, y + ground.y, SOLID, {}, true)
            // sea
            if (ground.y > box.sea)
                for (let y = 0; y < ground.y - box.sea; y ++)
                    this.add(x, ground.y - y, WATER, {status: 'ocean'}, true)


            // THING PLACEMENT
            if (grass.curr < 0) {
                if (!inSea) this.add(x, ground.y - 1, GRASS, {}, true)
                else this.add(x, ground.y, SEAWEED, {}, false)
                grass.reset()
            }

            if (crab.curr < 0) {
                new BadCrab(x, ground.y)
                crab.reset()
            }

            if (!inSea) {
                tree.curr --
                pirate.timer.curr --

                if (tree.curr < 0) {
                    new Tree(x, ground.y, true)
                    tree.reset()
                }

                if (pirate.timer.curr < 0) {
                    if (pirate.timer.curr == -1) pirate.pos = x
                    // find highest piece of ground for pirate
                    if (ground.y < pirate.highest) pirate.highest = ground.y

                    // MAKE PIRATE
                    if (pirate.timer.curr <= -Math.ceil(pirate.type[1])) {
                        if (pirate.type[0] == 'leader')
                            pirate.type = ['moderate', PIRATE_MODERATE_W]

                        else if (pirate.type[0] == 'moderate')
                            pirate.type = ['leader', PIRATE_RECRUIT_W]

                        if (pirate.type[0] == 'moderate')
                            new PirateModerate(pirate.pos, pirate.highest)
                        else if (pirate.type[0] == 'leader')
                            new PirateLeader(pirate.pos, pirate.highest)

                        pirate.timer.reset()
                        pirate.highest = this.lev[this.curr].h
                    }
                }
            }

            else {
                const worsen = -sea
                shark.curr --
                fish.curr --
                mine.curr --

                // SHIP
                ship --
                if (ship <= 0) {
                    if (ship == 0) new Ship(x, box.sea + 1)
                }

                else {
                    if (fish.curr < 0) {
                        new BadFish(x, ground.y)
                        fish.reset()

                        fish.curr -= worsen / 20
                        if (fish.curr < 5) fish.curr = 5
                    }

                    // ISLANDS ON WATER
                    island.timer.curr --

                    if (island.timer.curr <= 0) {
                        island.tree.curr --

                        const center = island.size / 2
                        const height = (center - Math.abs(center + island.timer.curr)) * random(.5, .7, 0)
                        const base = (center - Math.abs(center + island.timer.curr)) * random(.05, .2, 0)

                        // make ground
                        for (let i = -Math.floor(base); i < Math.floor(height); i ++)
                            this.add(x, box.sea - i, SOLID, {}, true)

                        // trees, crabs, and power ups
                        const y = box.sea - Math.floor(height) + 1
                        if (island.tree.curr < 0) {
                            new Tree(x, y, true)

                            island.tree.reset()
                        }
                        if (x > 150 && island.timer.curr == -Math.floor(center))
                            this.makeItem({type: 'health', x, y: y - 1, collected: 0, time: 0})

                        // reset
                        if (island.timer.curr <= -island.size || (island.timer.curr < -center && height <= 0))
                            island.timer.reset()
                    }

                    // make shark
                    if (shark.curr < 0) {
                        mutant.curr --

                        // if timer is ready, make mutant
                        if (mutant.curr < 0) {
                            new MutantShark(x, random(box.sea + 4, ground.y - 2, 0))
                            mutant.reset()
        
                            // increase mutant frequency
                            mutant.curr -= worsen / 30
                        }
                        // make normal sharks
                        else new BadShark(x, random(box.sea + 4, ground.y - 2, 0))

                        // reset shark timer
                        shark.reset()

                        shark.curr -= worsen / 20
                        if (shark.curr < 30) shark.curr = 30
                    }

                    // mines
                    if (mine.curr < 0) {
                        if (ship <= 0) new Mine(x, ground.y - 2)
                        else if (island.timer.curr <= 0) new Mine(x, random(box.sea + 5, ground.y - 2, 0))
                        else new Mine(x, random(box.sea + 2, ground.y - 2, 0))
                        mine.reset()

                        mine.curr -= worsen / 5
                        if (mine.curr < 3) mine.curr = 3
                    }
                }
            }
        }

        this.lev[this.curr].endY = ground.y
    }

    bossSet() {
        game.raining = false
        game.background = 'none'

        hero.collisionBox()
    }
    bossGenerate() {
        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            for (let y = 0; y < this.lev[this.curr].h; y ++) this.add(x, y, AIR, {}, true)
        }

        const array = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 4, 4, 4, 2, 4, 4, 2, 2, 2, 4, 4, 2, 4, 2, 2, 2, 2, 2, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 2, 2, 2, 3, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 2, 4, 2, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 4, 4, 4, 2 ,4 ,2, 4, 2, 4, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 3, 2, 2, 3, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 3, 3, 2, 3, 2, 2, 2, 2, 3, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 4, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2, 4, 2, 2, 2, 4, 4, 2, 2, 2, 2, 4, 2, 4, 1, 0, 0, 0, 1, 2, 2, 2, 4, 2, 2, 2, 2, 4, 2, 4, 4, 2, 4, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 3, 2, 3, 2, 2, 2, 2, 2, 2, 3, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 2, 2, 2, 2, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4, 2, 4, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 4, 2, 2, 2, 2, 4, 4, 2, 4, 2, 2, 4, 4, 4, 2, 2, 2, 2, 3, 2, 2, 2, 1, 0, 1, 2, 2, 2, 3, 2, 3, 3, 2, 3, 2, 2, 2, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 4, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 2, 2, 4, 2, 4, 4, 4, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 4, 4, 2, 4, 2, 2, 4, 2, 2, 2, 2, 2, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 3, 2, 3, 3, 3, 2, 2, 2, 3, 2, 3, 3, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 2, 2, 2, 4, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 4, 4, 4, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 4, 4, 2, 4, 2, 2, 4, 2, 2, 4, 2, 4, 2, 2, 4, 2, 4, 4, 4, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 3, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0
        ]

        const bg = (x, y) => this.add(x, y, DECO, {visual: 'wood'}, false)

        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            for (let y = 0; y < this.lev[this.curr].h; y ++) {
                const item = array[posToIndex(x, y, this.lev[this.curr].w)]
                if (item == 0) this.add(x, y, AIR, {}, true)
                else if (item == 1) this.add(x, y, SOLID, {color: WOOD}, true)
                else if (item == 2) bg(x, y)
                else if (item == 3) {
                    this.add(x, y, GRASS, {}, false)
                    bg(x, y)
                }
                else if (item == 4) {
                    this.add(x, y, HANGWEED, {}, false)
                    bg(x, y)
                }
                else if (item == 5) this.add(x, y, WATER, {status: 'ocean'}, true)
            }
        }

        new SilverChest(10, 32)
        new SilverChest(45, 23)
        new GoldenChest(89, 14)

        new NormalDoor(25, 32, {x: 33, y: 23}, false, 'wooden')
        new NormalDoor(33, 23, {x: 25, y: 32}, false, 'wooden')
        new NormalDoor(58, 23, {x: 78, y: 6}, false, 'wooden')
        new NormalDoor(78, 6, {x: 58, y: 23}, false, 'wooden')
        new NormalDoor(96, 6, {x: 47, y: 15}, false, 'wooden')
        new NormalDoor(47, 15, {x: 96, y: 6}, false, 'wooden')
        new NormalDoor(76, 14, {x: 78, y: 6}, false, 'wooden')
        new NormalDoor(80, 29, {x: 62, y: 29}, false, 'wooden')
        new NormalDoor(62, 29, {x: 80, y: 29}, false, 'wooden')

        // new NormalDoor(6, 8, {x: 81, y: 54}, false, 'wooden')

        new Checkpoint(58.5, 29)

        this.makeCoin(50, 13)
        this.makeCoin(54, 13)
        this.makeCoin(58, 13)
        this.makeCoin(62, 13)

        new PirateLeader(85, 14, false)

        new Barrel(2, 32)
        new Barrel(40, 23)
        new Barrel(42, 23)
        new Barrel(55, 23)
        new Barrel(84, 14)
        new Barrel(67, 29)

        // BOSS AND GUARD SEQUENCE
        new Barrel(53, 54)
        new Barrel(49, 54)
        new Barrel(45, 54)
        new Barrel(43, 54)

        new NormalDoor(55, 54, {x: 80, y: 54}, true, 'wooden')
        new NormalDoor(80, 54, {x: 55, y: 54}, true, 'wooden')

        new Checkpoint(81.5, 54, 'pirateCheif')

        this.lev[this.curr].doors.start = {x: 17, y: 1}

        const key = new KeySlot(113.5, 84, {}, true)
        key.active = true

        // last door
        const end = new TeleportDoor(116, 84, {x: 17, y: 3, world: 'floor3', door: 'tel'}, true, 'magic')
        end.spare = () => {
            if (hero.key) end.locked = false
        }

        new Barrel(85, 54)
        new Barrel(88, 69)
        new Barrel(93, 84)
        new Barrel(95, 84)
        new Barrel(97, 84)

        seq.boss = {
            props: [],
            go: () => {
                const guard = new PirateLeader(50, 54, false)
                const cheif = new PirateCheif(86, 54, false)

                guard.key = true
                guard.climb = false

                const type = map.lev[map.curr].sqn.type

                guard.spare = () => {
                    if (map.lev[map.curr].sqn.type != 'pirate') {
                        guard.speed_x = 0
                        guard.timer.move.time.curr = 100

                        if (collide({x: hero.x, y: hero.y, w: hero.w + 3, h: hero.h}, guard))
                            sequenceSet('pirate', {guard})
                    }
                }
                cheif.control = () => {
                    if (collide({x: hero.x, y: hero.y, w: hero.w + 3, h: hero.h}, cheif) &&
                        type != 'pirateCheif')
                            sequenceSet('pirateCheif', {cheif, end})
                }

                seq.boss.props.push(guard)
                seq.boss.props.push(cheif)
            }
        }
        seq.boss.go()
    }

    jungleSet() {
        game.raining = false
        game.background = images.backgroundjungle

        hero.collisionBox()
    }
    jungleGenerate() {
        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            for (let y = 0; y < this.lev[this.curr].h; y ++) this.add(x, y, AIR, {}, true)
        }

        let doorY = 0
        let keyX = 0
        let keyY = 0
        let keyTimer = 20
        let checkMax = 20
        let check = checkMax

        const box = {
            stepsMin: 20,
            stepsMax: 57,
            ground: 72,
            platformMin: 60,
            platformMax: 66, // got to be at least 4 below groundMin
            groundMin: 70,
            swamp: 76,
            swampbed: 83 // (if that's a word)
        }

        const ground = {
            y: box.ground,
            size: 0, // the end of the current stretch of ground
            reedReady: 0 // whether or not to place a reed
        }

        // floating blocks
        const steps = {
            y: box.stepsMax,
            size: {min: 4, max: 6, curr: 2},
            timer: {curr: 5},
            dangle: {min: 1, max: 3, curr: 2},
            changable: false,
            ready: false
        }
        steps.timer.reset = () => steps.timer.curr = 4

        const plat = {
            y: 0,
            h: 0,
            hGoal: {min: 2, max: 7, curr: 2},
            grow: {min: 5, max: 10, curr: 2}, // when the height should change
            dir: 1,
            change: {min: 2, max: 5, curr: 3}, // when it should change direction
            move: {min: 0, max: 4, curr: 3}, // when it should move up or down
            active: false, // whether it is active or should be fading out
            reedReady: true
        }
        plat.y = box.platformMax - plat.h

        const swamp = {
            active: {min: 16, max: 20, curr: 2}, // how long the active type should last for
            gap: {min: 1, max: 2, curr: 1}, // how large the gap should be
            log: {min: 2, max: 4, curr: 2}, // when a log should be placed
            reed: {min: 2, max: 8, curr: 4}, // when a reed should be placed
            dangleReed: {min: 3, max: 5, curr: 1}, // when a dangling reed should be placed
            logReed: {min: 3, max: 5, curr: 1}, // when a log reed should be placed
            types: ['ground', 'logs', 'log vines', 'vines'], // swamp options
            idx: 10, // which option we're currently on (index)
            type: 0 // which option we're currently on (string)
        }

        const croc = {min: 10, max: 15, curr: 10}
        const bird = {min: 4, max: 8, curr: 3}
        const monkey = {min: 3, max: 7, curr: 2}
        const weed = {min: 0, max: 5, curr: 2}
        const coin = {min: 6, max: 8, curr: 15, make: (x, y) => {
            this.makeCoin(x, y - 1)
        }}

        objSet(swamp.gap)
        objSet(swamp.active)
        objSet(swamp.log)
        objSet(swamp.reed)
        objSet(swamp.dangleReed)
        objSet(swamp.logReed)
        objSet(plat.change)
        objSet(plat.move)
        objSet(plat.grow)
        objSet(plat.hGoal)
        objSet(steps.size)
        objSet(croc)
        objSet(bird)
        objSet(weed)
        objSet(monkey)
        objSet(coin)
        objSet(steps.dangle)

        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            bird.curr --
            monkey.curr --
            coin.curr --

            // make floating blocks with reeds
            steps.timer.curr --
            if (steps.ready && steps.timer.curr < 0) {
                keyTimer --

                // set parameters
                steps.timer.reset()
                steps.size.reset()

                const dangleLen = 10
                const sproutLen = 10
                const downDropMax = 10

                let oft = 0 // offset does not affect overall y pos of the steps

                let dangle = false
                let sprout = false

                // default choice is stalk
                let choice = 1

                // change choice based on predicament
                steps.dangle.curr --
                if (steps.dangle.curr < 0) {
                    choice = 0 // dangle reed
                    steps.dangle.reset()
                }

                if (steps.y <= box.stepsMin + sproutLen)
                    choice = 2 // move down

                if (steps.y >= box.stepsMax - steps.size.curr - downDropMax)
                    choice = 1 // move up (stalk)

                const up = type => {
                    // dangle reeds
                    if (!type) {
                        dangle = true
                        oft -= dangleLen
                    }

                    // stalk reeds
                    else sprout = true
                }
                const down = () => {
                    if (!steps.changable) return

                    steps.y += random(downDropMax / 2, downDropMax)
                }

                // upwards
                if (choice == 0 || choice == 1)
                    up(choice)

                // duplicate downwards
                else if (choice == 2)
                    down()

                // restrict
                if (steps.y + oft < box.stepsMin)
                    steps.y = box.stepsMin
                if (steps.y + oft > box.stepsMax - steps.size.curr)
                    steps.y = box.stepsMax - steps.size.curr

                // create blocks
                for (let X = 0; X < steps.size.curr; X ++) {
                    for (let Y = 0; Y < steps.size.curr; Y ++) {

                        // cap edges
                        if ((!Y && X == steps.size.curr - 1) ||
                            (!X && Y == steps.size.curr - 1) ||
                            (!X && !Y) ||
                            (X == steps.size.curr - 1 && Y == steps.size.curr - 1))
                            continue

                        this.add(x + X, steps.y + oft + Y, SOLID, {color: EARTH, min: .65, max: .75}, true)
                    }

                    // infrequent coins in the steps
                    coin.curr += .5
                    if (X > 0 && X < steps.size.curr - 1 && coin.curr < 0 && choice) {
                        coin.make(x + X, steps.y + oft)
                        coin.reset()
                    }

                    // occasional checkpoints
                    if (check < 0) {
                        if (check == -1)
                            new Checkpoint(x + 1.1, steps.y + oft)
                        if (check < -2)
                            check = checkMax
                    }

                    if (X == Math.floor(steps.size.curr / 2)) {
                        if (dangle)
                            new Reed(x + X, steps.y + oft + steps.size.curr, true, dangleLen - 5, random(0, 2))

                        if (sprout)
                            new Reed(x + X, steps.y + oft, false, sproutLen + 3)
                    }
                }

                steps.changable = true

                // change y pos for next step
                if (sprout) {
                    steps.y -= dangleLen
                    steps.changable = false
                }
                if (dangle)
                    steps.changable = false
            }

            // when to shift up or down
            plat.move.curr --
            if (plat.move.curr < 0 && plat.active && check > 0) {
                plat.y += plat.dir

                // change dir
                plat.change.curr --
                if (plat.change.curr < 0) {
                    plat.dir *= -1
                    plat.change.reset()
                }

                plat.move.reset()
            }
            // restrict platform
            if (plat.y < box.platformMin) {
                plat.y = box.platformMin
                plat.dir = 1
            }
            if (plat.y > box.platformMax - plat.h) {
                plat.y = box.platformMax - plat.h
                plat.dir = -1
            }

            // change height of platform
            const moveToGoal = () => {
                if (plat.h < plat.hGoal.curr) plat.h ++
                if (plat.h > plat.hGoal.curr) plat.h --
            }

            plat.grow.curr --
            if (plat.grow.curr < 0) {
                plat.hGoal.reset()
                plat.grow.reset()
            }
            if (plat.active) {
                if (check > 0)
                    moveToGoal()

                weed.curr --
                check --

                if (weed.curr < 0) {
                    this.add(x, plat.y - 1, WEED, {}, true)
                    weed.reset()
                }

                if (check < 0) {
                    if (check == -1)
                        new Checkpoint(x, plat.y)
                    if (check < -2)
                        check = checkMax
                }

                if (steps.ready && plat.reedReady && steps.timer.curr < 1) {
                    new Reed(x, plat.y, false, (plat.y - steps.y) + 2, false, (plat.y - steps.y) + 3)
                    plat.reedReady = false

                    for (let i = 0; i < plat.y; i ++)
                        this.add(x, i, AIR, {}, true)
                }

                // activate steps for the start
                steps.ready = true
            }

            // fade out platform
            else {
                plat.reedReady = true

                if (swamp.active.curr < 2)
                    moveToGoal()
                else if (plat.h > 0)
                    plat.h --
            }

            // when there should be a gap
            swamp.active.curr --
            if (swamp.active.curr < 0) {
                ground.y = box.swampbed

                // change swamp type after gap has finished
                swamp.gap.curr --
                if (swamp.gap.curr < 0) {
                    swamp.active.reset()
                    swamp.gap.reset()

                    swamp.log.curr = 0
                    swamp.reed.curr = 0
                    swamp.dangleReed.curr = 0
                    swamp.logReed.curr = 0

                    // change swamp type
                    swamp.idx ++
                    if (swamp.idx >= swamp.types.length) {
                        swamp.idx = 0
                        for (let i = 0; i < swamp.types.length; i ++) {
                            const choice = random(0, swamp.types.length - 1)
                            const copy = swamp.types[i]

                            swamp.types[i] = swamp.types[choice]
                            swamp.types[choice] = copy
                        }
                    }
                    swamp.type = swamp.types[swamp.idx]

                    // ground type
                    if (swamp.type == 'ground') {
                        ground.y = box.swamp - 2
                        ground.size = swamp.active.curr
                    }
                }
            }

            // when things in the swamp are active
            else {
                plat.active = false

                // make reeds and crocs if ground is not active
                swamp.reed.curr --
                croc.curr --
                if (swamp.type != 'ground') {
                    if (swamp.reed.curr < 0) {
                        new Reed(x, box.swampbed, false, random(3, 5.5, 0))
                        swamp.reed.reset()
                    }
                    if (croc.curr < 0) {
                        new Croc(x, box.swamp)
                        croc.reset()
                    }
                }

                // make ground
                if (swamp.type == 'ground') {
                    let center = ground.size / 2
                    if (!center) center = swamp.active.curr

                    const bump = (center - Math.abs(center - swamp.active.curr)) * .5
                    const height = bump

                    ground.y = box.swamp - Math.floor(height) - 2

                    // cap ground
                    if (ground.y < box.groundMin)
                        ground.y = box.groundMin

                    ground.y -= random(0, 2)

                    if (monkey.curr < 0) {
                        new Monkey(x, ground.y, box.swamp)
                        monkey.reset()
                    }

                    coin.curr -= .5
                    if (coin.curr < 0) {
                        coin.make(x, ground.y)
                        coin.reset()
                    }

                    weed.curr --
                    if (weed.curr < 0) {
                        this.add(x, ground.y - 1, WEED, {}, true)
                        weed.reset()
                    }
                }

                // make logs
                else if (swamp.type == 'logs') {
                    swamp.log.curr --
                    if (swamp.log.curr < 0) {
                        new Log(x, box.swamp)
                        swamp.log.reset()
                    }
                }

                // make log reeds
                else if (swamp.type == 'log vines') {
                    plat.active = true

                    const reedH = box.swamp - (plat.y + plat.h) - 2

                    swamp.logReed.curr --
                    if (swamp.logReed.curr < 0) {
                        new Reed(x, plat.y + plat.h, true, reedH, true)
                        swamp.logReed.reset()
                    }

                    coin.curr --
                    if (coin.curr < 0) {
                        coin.make(x + random(-.5, .5, 0), plat.y + plat.h + reedH - random(1, 2, 0))
                        coin.reset()
                    }
                }

                // make dangling reeds
                else if (swamp.type == 'vines') {
                    plat.active = true

                    const reedH = box.swamp - (plat.y + plat.h) - 2

                    swamp.dangleReed.curr --
                    if (swamp.dangleReed.curr < 0) {
                        new Reed(x, plat.y + plat.h, true, reedH)
                        swamp.dangleReed.reset()
                    }

                    coin.curr --
                    if (coin.curr < 0) {
                        coin.make(x + random(-.5, .5, 0), plat.y + plat.h + reedH - random(1, 4, 0))
                        coin.reset()
                    }
                }

                
                // climbing reeds from swamp
                if (!plat.h) {
                    ground.reedReady ++

                    if (ground.reedReady == 2)
                        new Reed(x, ground.y, false, ground.y - plat.y + 2, false, (ground.y - plat.y) + 2)
                }
                else ground.reedReady = 0
            }

            // make platforms
            for (let y = plat.y; y < plat.y + plat.h; y ++)
                this.add(x, y, SOLID, {color: EARTH, min: .75, max: .85}, true)

            // this can only be done after the blocks are added
            if (swamp.type == 'log vines' || swamp.type == 'vines' || plat.h > 0) {
                if (monkey.curr < 0) {
                    new Monkey(x, plat.y, box.swamp)
                    monkey.reset()
                }

                coin.curr -= 3
                if (coin.curr < 0) {
                    coin.make(x, plat.y)
                    coin.reset()
                }

                if (bird.curr < 0) {
                    new Parrot(x, plat.y - 1, box.stepsMax, box.swamp)
                    bird.reset()
                }
            }

            if (x == this.lev[this.curr].w - 1) {
                ground.y = box.swamp - 3
                doorY = ground.y
            }

            if (keyTimer == 0) {
                keyX = x
                keyY = steps.y
                keyTimer = -10
            }

            // make ground
            for (let y = ground.y; y < this.lev[this.curr].h; y ++)
                this.add(x, y, SOLID, {color: EARTH, min: .75, max: .85}, true)

            // make swamp
            for (let y = box.swamp; y < this.lev[this.curr].h; y ++)
                this.makeItem({x, y, type: 'mud', s: random(0, .01, 0)})

        }

        const DOOR = new TeleportDoor(1, box.swamp - 4, {world: 'floor4', door: 'tel'}, false, 'seal')
        DOOR.spare = () => {
            if (hero.justCollectedKey) {
                DOOR.locked = true
                hero.justCollectedKey = false
            }
        }
        this.lev[this.curr].doors.start = DOOR

        const door = new TeleportDoor(this.lev[this.curr].w - .4, doorY, {world: 'floor4', door: 'tel'}, true, 'seal')
        door.spare = () => {if (hero.key) door.locked = false}
        this.lev[this.curr].doors.end = door

        new KeySlot(keyX, keyY, door)
    }

    jungleBossSet() {
        game.raining = true
        game.background = images.backgroundjungle

        hero.collisionBox()
    }
    jungleBossGenerate() {
        const swampX = 30
        const swampH = 5
        const ground = 53
        const buildW = 30

        new Checkpoint(swampX + 69, ground - 43)

        let grass = true

        const block = (x, y, w, h, type, data = {color: EARTH, min: .75, max: .85}, replace = true) => {
            for (let X = x; X < x + w; X ++) {
                if (grass && random(0, 2))
                    this.add(X, y - 1, WEED, {}, false)

                for (let Y = y; Y < y + h; Y ++)
                    this.add(X, Y, type, data, replace)
            }
        }

        const swamp = (x, y, w, h, death = false) => {
            for (let X = x; X < x + w; X ++) {
                for (let Y = y; Y < y + h; Y ++) {
                    this.makeItem({x: X, y: Y, type: 'mud', s: random(0, .01, 0), death})
                }
            }
        }

        block(0, 0, this.lev[this.curr].w, this.lev[this.curr].h, AIR)
        block(0, ground, swampX, 5, SOLID)

        grass = 0
        block(0, ground + swampH, this.lev[this.curr].w, 50, SOLID)
        grass = 1

        new Reed(swampX - 1, ground, false, 10, false, 10)

        block(swampX + 1, ground - 10, 10, 3, SOLID)
        block(swampX + 8, ground - 20, 8, 5, SOLID)

        new Checkpoint(swampX + 8, ground - 10)

        new Reed(swampX + 13, ground - 15, true, 5, false, 7)

        block(swampX + 19, ground - 9, 8, 2, SOLID)
        grass = 0
        block(swampX + 25, ground - 7, 2, 2, SOLID)
        block(swampX + 25, ground - 5, 20, 2, SOLID)
        grass = 1

        // small swamp
        swamp(swampX + 27, ground - 8, 14, 3)

        block(swampX + 41, ground - 10, 5, 5, SOLID)

        new Log(swampX + 28, ground - 8)
        new Log(swampX + 32, ground - 8)
        new Log(swampX + 37, ground - 8)

        block(swampX + 48, ground - 12, 8, 3, SOLID)

        new Reed(swampX + 50, ground - 12, false, 7, false, 7)

        block(swampX + 53, ground - 18, 3, 6, SOLID)
        block(swampX + 53, ground - 29, 11, 3, SOLID)

        new Reed(swampX + 59, ground - 26, true, 7, true, 9)

        block(swampX + 64, ground - 20, 3, 3, SOLID)

        new Reed(swampX + 65, ground - 20, false, 10, false, 10)
        new Reed(swampX + 55, ground - 29, false, 11, false, 15)

        block(swampX + 58, ground - 39, 3, 3, SOLID)

        block(swampX + 63, ground - 41, 3, 3, SOLID)
        block(swampX + 68, ground - 43, 3, 3, SOLID)
        block(swampX + 74, ground - 53, 3, 3, SOLID)

        new Reed(swampX + 75, ground - 50, true, 6, false, 7)

        // building
        const floor = ground - 30

        block(swampX + 79, ground - 45, 1, this.lev[this.curr].h, SOLID)
        block(swampX + 80, floor, buildW, this.lev[this.curr].h, SOLID)
        block(swampX + 80 + buildW, ground - 45, 1, this.lev[this.curr].h, SOLID)

        new Reed(swampX + 80, floor, false, 6, false, 6)
        new Reed(swampX + 79 + buildW, floor, false, 6, false, 6)

        seq.jungleBoss = {
            props: [],
            go: () => {
                // monkeys
                for (let i = 1; i < buildW - 1; i ++) {
                    if (i % 5 == 0)
                        seq.jungleBoss.props.push(new Monkey(swampX + 80 + i + random(-1, 1, 0), floor))
                }

                seq.jungleBoss.props.push(new MonkeyBoss(swampX + 90, floor, swampX + 80 + buildW / 2))
            }
        }
        seq.jungleBoss.go()

        const door = new TeleportDoor(swampX + 80 + buildW - 1, floor, {world: 'floor5', door: 'tel'}, true, 'magic')
        door.spare = () => {if (hero.key) door.locked = false}

        // base swamp
        swamp(swampX, ground, this.lev[this.curr].w - swampX, swampH, true)

        const DOOR = new TeleportDoor(0, ground, {world: 'floor5', door: 'tel'}, false, 'seal')
        DOOR.spare = () => {
            if (hero.justCollectedKey) {
                DOOR.locked = true
                hero.justCollectedKey = false
            }
        }
        this.lev[this.curr].doors.start = DOOR
    }

    citySet() {
        game.raining = false
        game.background = images.backgroundcity

        hero.collisionBox()
    }
    cityGenerate() {
        const box = {
            ground: 50,
            min: 10
        }

        const DOOR = new TeleportDoor(0, box.ground, {world: 'floor6', door: 'tel'}, false, 'seal')
        DOOR.spare = () => {
            if (hero.justCollectedKey) {
                DOOR.locked = true
                hero.justCollectedKey = false
            }
        }
        this.lev[this.curr].doors.start = DOOR

        const build = {
            timer: 20,
            boss: 160,
            w: 100,
            h: 40,
            lvs: 8
        }

        const light = {min: 20, max: 25, curr: 4}
        const laserGap = -2

        const item = {min: 4, max: 7, curr: 0, type: 0}

        const steps = build.h / build.lvs // amount of steps needed to reach next floor
        const gap = 4

        const pow = {min: 15, max: 20, curr: 10}

        // colors block and deco
        const b = {color: GRAY, min: .65, max: .75}
        const d = {visual: 'plain', color: [.65, .65, .65], min: .68, max: .7}

        // steps
        const s = {
            min1: 15, max1: 20,
            min2: 35, max2: 40,
            curr: 9,
            small: 0,
            big: 0,
            start: true,
            dir: -1 // alternates every time
        }

        objSet(light)
        objSet(pow)
        objSet(item)

        s.reset = () => {
            s.small --
            s.big --

            if (s.start) s.curr = random(15, 16)

            else if (s.small < 0 || (random(0, 2) && s.big >= 0)) {
                s.curr = random(s.min1, s.max1)
                s.small = 3
            }
            else {
                s.curr = random(s.min2, s.max2)
                s.big = 2
            }
        }

        // make a flight of stairs
        const stair = (x, y, dir) => {
            // make stairs
            for (let j = 0; j < steps; j ++) {
                this.add(x + j * dir, y - j - 1, SOLID, b)
                this.add(x + (j + 1) * dir, y - j - 1, SOLID, b)
            }

            // make gap above stairs
            for (let i = 0; i < gap; i ++)
                this.add(
                    x + (steps - i - 2) * dir,
                    y - steps, DECO, d, true)
        }

        new Sign(25, box.ground, ['Falling barriers are harmless when they are not moving.'])

        // go through every column in the world
        for (let x = 0; x < this.lev[this.curr].w; x ++) {
            // make ground
            for (let y = box.ground; y < this.lev[this.curr].h; y ++)
                this.add(x, y, SOLID, {color: GRAY, min: .65, max: .7})

            if (x == build.timer) {
                const special = new Laser(x + build.w + .5, box.ground - steps - 3, true)
                const buttons = []

                let madeCheckpoint = false

                // make each floor
                for (let i = 0; i < build.lvs; i ++) {
                    const dir = (i + 1) % 2 * 2 - 1 // which way the stairs are going

                    s.start = true
                    s.reset()
                    s.small = 2
                    s.big = 2
                    let gapBetweenStairs = true

                    // make each cell for each floor
                    for (let X = 0; X < build.w; X ++) {
                        const xPos = x + X
                        const posX = xPos - steps * dir
                        const yPos = box.ground - i * steps

                        // don't add block if there is supposed to be a gap
                        if (!mapItemExists(xPos, yPos - steps, DECO))
                            this.add(xPos, yPos - steps, SOLID, b)

                        // place stairs on the relevant side
                        const w = build.w - 1
                        if (X == Math.floor(w / 2 + (w / 2) * dir) && i < build.lvs - 1)
                            stair(posX, yPos, dir)

                        // place inner stairs if within range and not above gap
                        else if (X > gap * dir && X < build.w - gap - steps &&
                                !mapItemExists(posX, yPos, DECO) &&
                                i < build.lvs - 1) {
                            s.curr --

                            const extend = s.curr

                            if (s.curr < 0) {
                                stair(posX, yPos, dir)

                                // only make stairs if not on left edge
                                if (!s.start) {
                                    const laserX = posX + .5 + (laserGap + 1) * dir

                                    if (s.dir) s.dir = -1
                                    else s.dir = 1

                                    buttons.push({
                                        x: laserX - .5,
                                        y: yPos - steps - 1,
                                        dir: s.dir,
                                        state: dir,
                                        steps: steps,
                                        laser: new Laser(laserX, yPos - steps + 1)
                                    })

                                    if (!gapBetweenStairs)
                                        new Button(posX - 4, yPos - 1, special, true)
                                }

                                s.reset()
                                s.start = false
                                gapBetweenStairs = false

                                if (!madeCheckpoint && i == build.lvs - 2) {
                                    madeCheckpoint = true
                                    new Checkpoint(posX + steps * dir, yPos - steps)
                                }
                            }

                            else if (i) {
                                // make lamp if above ground and there are blocks above it
                                if (mapItemExists(posX, yPos, SOLID) &&
                                    mapItemExists(posX - 1, yPos, SOLID) &&
                                    mapItemExists(posX + 1, yPos, SOLID)) {
                                    light.curr --
                                    if (light.curr < 0) {
                                        new Lamp(posX, yPos + 1)
                                        light.reset()
                                    }

                                    if (mapItemExists(posX - 1, yPos + steps, SOLID) &&
                                        mapItemExists(posX + 1, yPos + steps, SOLID) &&
                                        mapItemExists(posX + 2, yPos + steps, SOLID) &&
                                        mapItemExists(posX, yPos + steps, SOLID)) {
                                        pow.curr --
                                        if (pow.curr < 0) {
                                            new Pow(posX - .5, yPos + 1, steps - 1)
                                            pow.reset()
                                        }
                                    }
                                }

                                // make Household Items
                                if (mapItemExists(posX, yPos, SOLID) &&
                                    !mapItemExists(posX, yPos - 1, SOLID) &&
                                    !mapItemExists(posX, yPos - 2, SOLID) &&
                                    !mapItemExists(posX - 1, yPos - 1, SOLID) &&
                                    !mapItemExists(posX + 1, yPos - 1, SOLID) &&
                                    extend > 4 &&
                                    mapItemExists(posX - 2, yPos, SOLID) &&
                                    mapItemExists(posX - 1, yPos, SOLID) &&
                                    mapItemExists(posX + 1, yPos, SOLID) &&
                                    mapItemExists(posX + 2, yPos, SOLID)) {

                                    item.curr --
                                    if (item.curr < 0) {
                                        new Item(posX, yPos, item.type)
                                        item.reset()

                                        if (!item.type) item.type = 1
                                        else item.type = 0
                                    }
                                }
                            }
                        }

                        else gapBetweenStairs = true
                    }
                }

                for (let i = 0; i < build.h + 1; i ++) {
                    // right edge
                    if (i > steps + 3 || i <= steps) this.add(x + build.w, box.ground - i, SOLID, b)

                    // special laser gap
                    else this.add(
                        x + build.w, box.ground - i,
                        DECO, d)

                    // left edge
                    if (i > 2) this.add(x - 1, box.ground - i, SOLID, b)

                    // doorway
                    else this.add(
                        x - 1, box.ground - i,
                        DECO, d)

                    // background detail
                    for (let j = 0; j < build.w; j ++)
                        this.add(x + j, box.ground - i, DECO, d)
                }

                for (let i = 0; i < buttons.length; i ++) {
                    const item = buttons[i]

                    const bad = () => {
                        return mapItemExists(item.x, item.y, SOLID) ||
                        mapItemExists(item.x, item.y - 1, SOLID) ||
                        mapItemExists(item.x, item.y - 2, SOLID)
                    }

                    const hop = item.steps * item.state
                    const old = item.x
                    const wantingToHop = item.state == item.dir

                    if (bad() || wantingToHop) {
                        item.x += hop
                        if (bad()) {
                            item.x = old
                            if (bad()) item.y --
                        }
                    }

                    let dir = item.dir
                    if (item.x < old) dir = -1
                    if (item.x > old) dir = 1

                    const walk = 20
                    let hole = 0
                    for (let j = 0; j < walk; j ++) {
                        item.x += dir
                        if (bad()) item.x -= dir

                        // the button falls down holes
                        if (!mapItemExists(item.x, item.y + 1, SOLID)) {
                            item.y ++
                            hole = 1
                            j = walk - 3
                        }
                        else if (hole) {
                            if (hole > 1)
                                break

                            hole ++
                        }

                        if (item.y > box.ground - 1) {
                            item.y = box.ground - 1
                            break
                        }
                    }

                    if (item.x <= x) item.x = x
                    if (item.x >= x + build.w) item.x = x + build.w
                    if (item.y > box.ground - 1) item.y = box.ground - 1

                    new Button(item.x, item.y, item.laser)
                }
            }

            else if (x == build.boss) {
                const stairs = (_x, _y, dir) => {
                    _x += x
                    _y += box.ground

                    for (let j = 0; j < 5; j ++) {
                        this.add(_x + j * dir, _y - j - 1, SOLID, b)
                        this.add(_x + (j + 1) * dir, _y - j - 1, SOLID, b)
                    }
                }

                const block = (_x, _y, w, h, type = [SOLID, b]) => {
                    _x += x
                    _y += box.ground

                    for (let X = 0; X < w; X ++)
                        for (let Y = 0; Y < h; Y ++)
                            this.add(_x + X, _y + Y, type[0], type[1], true)
                }

                new Checkpoint(x + 5, box.ground)
                const key = new KeySlot(x, box.ground - 39, {}, false)
                key.active = true

                seq.city = {
                    props: [],
                    go: () => {
                        const staff = new Staff(x - 10, box.ground)
                        const lift = new Lift(x - 5, box.ground - 40, 40)

                        // detect when to start the sequence
                        staff.control = () => {
                            if (staff.sequence) return

                            if (hero.x > staff.x - 5) {
                                hero.x = staff.x - 5
                                hero.speed_x = 0

                                if (!hero.in_air)
                                    sequenceSet('cityStaff', {staff, lift, key})
                            }
                        }

                        const laser = new Laser(x + 9, box.ground - 33, true)
                        const button = new Button(x + 2, box.ground - 26, laser, true)
                        const crate = new Item(x + 13, box.ground - 25, 1, true)

                        seq.city.props.push(staff)
                        seq.city.props.push(lift)
                        seq.city.props.push(laser)
                        seq.city.props.push(button)
                        seq.city.props.push(crate)
                    }
                }
                seq.city.go()

                const door = new TeleportDoor(x + 25, box.ground - 39, {world: 'floor6', door: 'tel'}, true, 'magic')
                door.spare = () => {
                    if (hero.key) door.locked = false
                }

                block(-1, -39, 27, 39, [DECO, d])

                block(0, -5, 20, 1)
                block(14, -6, 2, 1)
                stairs(20, 0, 1)
                stairs(5, -5, -1)
                block(6, -10, 20, 1)
                stairs(20, -10, 1)
                block(13, -14, 1, 3)
                block(14, -12, 2, 1)
                block(0, -15, 20, 1)
                block(6, -20, 20, 1)
                block(10, -17, 1, 2)
                block(12, -16, 1, 1)
                block(15, -17, 3, 1)
                block(17, -19, 1, 2)
                stairs(5, -15, -1)
                block(0, -25, 20, 1)
                block(8, -22, 1, 2)
                block(10, -24, 1, 3)
                block(12, -22, 1, 2)
                block(14, -24, 1, 2)
                block(14, -22, 5, 1)
                block(20, -22, 1, 2)
                block(23, -25, 1, 5)
                block(19, -28, 1, 3)
                block(20, -28, 2, 1)
                block(10, -30, 11, 1)
                block(17, -29, 1, 3)
                block(15, -26, 1, 1)
                block(8, -28, 5, 1)
                block(4, -29, 1, 3)
                block(10, -29, 1, 1)

                block(5, -34, 14, 1)
                stairs(20, -30, 1)
                stairs(5, -34, -1)
                block(4, -34, 1, 3)
                block(6, -39, 20, 1)

                block(-1, -39, 1, 37)
                block(26, -43, 1, 43)
            }
        }
    }

    draw() {
        const horiz = cvs.width / scale
        const verti = cvs.height / scale

        const top = Math.floor(cam.y - verti / 2)
        const lef = Math.floor(cam.x - horiz / 2)
        const bot = Math.floor(cam.y + verti / 2) + 1
        const rig = Math.floor(cam.x + horiz / 2) + 1

        const water_len = images.water.length - 1

        const decoWood = (x, y) => {
            ctx.fillStyle = rgb(.33, .24, .15)
            fillRect(x, y, 1, .5)
            ctx.fillStyle = rgb(.3, .21, .12)
            fillRect(x, y + .5, 1, .5)
        }

        const plain = (color, x, y) => {
            ctx.fillStyle = color
            fillRect(x, y, 1, 1)
        }

        const water = (item, x, y) => {
            drawImage(images.water[Math.floor(item.choice * water_len)], x, y, 1, 1)
        }

        const grass = (item, x, y) => {
            const blades = 3
            const width = .05
            const height = .5
            const tuft_width = .4
            const sway = .1

            const blade_gap = 1 / blades
            ctx.strokeStyle = rgb(.06, .13, .06)
            for (let i = 0; i < blades; i ++) {
                const blade = i / blades
                const angle = -(blade - .5 - Math.PI + blade_gap / 2) +
                    Math.sin(time / 70 + i * 2 + item.offset) * sway
                const offset = ((blade + blade_gap / 2) - .5) * tuft_width

                const X = x + .5 + offset
                const Y = y + 1

                clear()
                rotate(X, Y, angle)
                rotRect(X - width / 2, Y, width, height)
                clear()
            }
        }

        const hangweed = (item, x, y) => {
            const blades = item.blades
            const blade_gap = 1 / blades
            const w = .06
            const h = .5

            for (let i = 0; i < blades; i ++) {
                ctx.fillStyle = rgb(.07, .13, .05)
                fillRect(x + i * blade_gap, y, w, h + Math.sin(i * 9) * .3)
            }
        }

        const weed = (item, x, y) => {
            const blades = 3
            const width = .1
            const height = .6
            const ang = 1 + Math.sin(item.offset) * .05

            const gap = 1 / blades
            for (let i = 0; i < blades; i ++) {
                const rand = Math.sin(item.offset * 10 * i) * .06
                const blade = i / blades

                const s = rand + .25
                ctx.strokeStyle = rgb(.25 - s, .4 - s, .1 - s)

                const angle = (gap - blade) * ang + Math.sin(item.offset) * .1

                const X = x + .5
                const Y = y + 1
                const H = height + rand * 2

                clear()
                rotate(X, Y + H, angle)
                rotRect(X - width / 2, Y, width, -H)
                clear()
            }
        }

        const seaweed = (item, x, y) => {
            const blades = item.blades
            const width = .06
            const height = .4
            const tuft_width = .8
            const frond_w = .15
            const frond_h = .07
            const frond_y = .3

            const blade_gap = 1 / blades
            for (let i = 0; i < blades; i ++) {
                const height_real = height - Math.sin(i * 3) * .4

                const blade = i / blades
                const angle = Math.sin(time / 50 + i + item.offset) * .1
                const offset = (blade + blade_gap / 2) * tuft_width

                const X = x + offset
                const Y = y + 1

                clear()
                rotate(X, Y, angle)

                // fronds
                ctx.strokeStyle = rgb(.06, .66, .06)
                rotRect(X - frond_w / 2, (Y - height_real) + frond_y, frond_w, frond_h)

                // stem
                ctx.strokeStyle = rgb(0, .33, 0)
                rotRect(X - width / 2, Y, width, -height_real)

                clear()
            }
        }

        const ledge = (item, x, y) => {
            const dist = fakePos(cvs.width / 2, 0).x - x

            if (Math.abs(dist) < 4) item.speed += (1 - item.w) / 3
            else item.speed = -item.w / 5

            item.speed *= Math.pow(.7, dt)
            item.w += item.speed * dt

            ctx.fillStyle = rgb(.2, .2, .2)
            if (item.side == 'left') fillRect(x, y, item.w, .3)
            else fillRect(x + 1, y, -item.w, .3)
        }

        // iterate through each cell
        for (let x = lef; x < rig; x ++) {
            for (let y = top; y < bot; y ++) {
                // get each block in the cell
                const block = mapItem(x, y)
                if (block.length) {
                    if (block[DECO]) {
                        if (block[DECO].visual == 'wood') decoWood(x, y)
                        else if (block[DECO].visual == 'plain') plain(block[DECO].color, x, y)
                    }

                    if (block[SOLID]) plain(block[SOLID].color, x, y)
                    if (block[WATER]) water(block[WATER], x, y)
                    if (block[GRASS]) grass(block[GRASS], x, y)
                    if (block[HANGWEED]) hangweed(block[HANGWEED], x, y)
                    if (block[SEAWEED]) seaweed(block[SEAWEED], x, y)
                    if (block[WEED]) weed(block[WEED], x, y)
                    if (block[LEDGE]) ledge(block[LEDGE], x, y)
                }

                if (game.background != 'none') {
                    // infinite terrain around the edges
                    if (x < 0 || x >= this.lev[this.curr].w || y >= this.lev[this.curr].h) {
                        const block = this.infinite(x, y)

                        if (block[SOLID]) plain(block[SOLID].color, x, y)
                        if (block[WATER]) water(block[WATER], x, y)
                        if (block[GRASS]) grass(block[GRASS], x, y)
                        if (block[SEAWEED]) seaweed(block[SEAWEED], x, y)
                    }
                }
            }
        }
    }

    drawActors() {
        for (let i = 0; i < this.lev[this.curr].live.length; i ++) {
            const item = this.lev[this.curr].live[i]
            if (item.dead) this.lev[this.curr].live.splice(i, 1)
            item.update()
            item.draw()
        }

        const horiz = cvs.width / scale
        const verti = cvs.height / scale
        const top = Math.floor((cam.y - verti / 2) / ACTOR_CELL_SIZE)
        const lef = Math.floor((cam.x - horiz / 2) / ACTOR_CELL_SIZE)
        const bot = Math.floor((cam.y + verti / 2) / ACTOR_CELL_SIZE) + 1
        const rig = Math.floor((cam.x + horiz / 2) / ACTOR_CELL_SIZE) + 1

        const render = []

        // iterate through each cell on the screen
        for (let x = lef; x < rig; x ++) {
            for (let y = top; y < bot; y ++) {
                // get all actors in the current cell
                const cell = this.lev[this.curr].actors[posToIndex(x, y, this.lev[this.curr].actor_w)]
                if (cell == undefined) continue

                // update the actors
                for (let i = 0; i < cell.length; i ++) {
                    const item = cell[i]
                    if (item == undefined) continue

                    if (!item.rendered) {
                        if (!game.pause) item.update()
                        if (item.display) item.draw()
    
                        item.rendered = true
                        render.push(item)
                    }
                }
            }
        }
        for (let i = 0; i < render.length; i ++) render[i].rendered = false
    }

    foreground() {
        const horiz = cvs.width / scale
        const verti = cvs.height / scale

        const top = Math.floor(cam.y - verti / 2)
        const lef = Math.floor(cam.x - horiz / 2)
        const bot = Math.floor(cam.y + verti / 2) + 1
        const rig = Math.floor(cam.x + horiz / 2) + 1

        const coin = item => {
            item.time += .3 * item.dir * DT
            const w = .4
            const h = .55
            const border = .04
            const coin_x = item.x + .5 - w / 2
            const coin_y = item.y + Math.sin(item.time * dt) * .1 + .5 - h / 2

            if (item.time > 4 && (collide({x: coin_x, y: coin_y, w, h}, hero) || item.collected > 0)) {
                if (!item.collected) {
                    collect.play()
                    hero.coins ++
                    game.totalCoinsCollected ++
                    puff(coin_x, coin_y, w, h, 5, .2, [1, 1, 1, .6], .001, .01, [-.04, .04], [-.04, .04])
                }
                item.collected += .1 * DT
            }

            if (item.collected < 1) {
                clear()
                rotate(coin_x + w / 2, coin_y + h / 2, Math.sin(item.time / 5) * .2)

                if (this.curr == 'jungle') {
                    const data = [
                        coin_x + .3 * h, coin_y,
                        coin_x + .7 * h, coin_y,
                        coin_x + h, coin_y + .3 * h,
                        coin_x + h, coin_y + .7 * h,
                        coin_x + .7 * h, coin_y + h,
                        coin_x + .3 * h, coin_y + h,
                        coin_x, coin_y + .7 * h,
                        coin_x, coin_y + .3 * h,
                        coin_x + .3 * h, coin_y
                    ]

                    ctx.fillStyle = rgb(.45, .45, .45, 1 - item.collected)
                    lineFill(data)

                    ctx.strokeStyle = rgb(.2, .2, .2, 1 - item.collected)
                    line(data, .05)

                    ctx.fillStyle = rgb(.42, .42, .42, 1 - item.collected)
                    fillRect(coin_x + h / 2 - .1, coin_y + h / 2 - .1, .2, .2)

                    ctx.fillStyle = rgb(.7, .7, .7)
                    fillRect(coin_x + .15, coin_y + .15, .08, .08)
                }

                else {
                    const shadow_w = .05
                    const shadow_h = .3
                    const shadow_x = .1

                    // border
                    ctx.strokeStyle = rgb(.4, .3, .1, 1 - item.collected)
                    rotRect(coin_x, coin_y, w, h)

                    // main
                    ctx.strokeStyle = rgb(.65, .65, 0, 1 - item.collected)
                    rotRect(coin_x + border, coin_y + border, w - border * 2, h - border * 2)

                    // shadow
                    ctx.strokeStyle = rgb(.55, .45, .1, 1 - item.collected)
                    rotRect(coin_x + shadow_x, coin_y + h / 2 - shadow_h / 2, shadow_w, shadow_h)
                }

                clear()
            }
        }

        const health = item => {
            item.time += .2 * DT

            const x = item.x
            const y = item.y + Math.sin(item.time) * .07
            const w = .5
            const h = .55
            const half = w / 2
            const quar = w / 4

            const data = [
                x, y + quar,
                x + half, y + h,
                x + w, y + quar,
                x + half + quar, y,
                x + half, y + quar,
                x + quar, y,
                x, y + quar
            ]

            if (item.time > 4) {
                if (collide(hero, {x, y, w, h}) || item.collected > 0) {
                    if (!item.collected) {
                        hero.heal(1)
                        puff(x, y, w, h, 5, .2, [1, 1, 1, .6], .001, .01, [-.04, .04], [-.04, .04])
                    }
                    item.collected += .05 * DT
                }
            }

            if (item.collected < 1) {
                ctx.fillStyle = rgb(0, .6, .45, 1 - item.collected)
                lineFill(data)
                ctx.strokeStyle = rgb(0, .25, 0, 1 - item.collected)
                line(data, .04)
            }
        }

        const mud = item => {
            ctx.fillStyle = rgb(MUD[0] - item.s, MUD[1] - item.s, MUD[2] - item.s, .96)
            fillRect(item.x, item.y, 1, 1)

            if (collide({x: item.x, y: item.y, w: 1, h: 1}, hero)) {
                if (item.death)
                    hero.injure(1)

                else {
                    hero.speed_y += .002 * dt

                    hero.speed_x *= Math.pow(.7, dt)
                    hero.speed_y *= Math.pow(.96, dt)

                    hero.in_air = false
                    if (key.up)
                        key.up = false
                }
            }
        }

        const rend = []

        for (let x = lef; x < rig; x ++) {
            for (let y = top; y < bot; y ++) {
                // get array for the current cell
                const cell = this.lev[this.curr].items[posToIndex(x, y, this.lev[this.curr].w)]
                if (cell == undefined) continue

                // get each item in the array
                for (let i = 0; i < cell.length; i ++) {
                    const item = cell[i]
                    if (!item) continue

                    if (item.type == 'coin') coin(item)
                    else if (item.type == 'health') health(item)
                    else if (item.type == 'mud') mud(item)
                    else if (!item.rendered && !item.dead) {
                        item.fore()
                        item.rendered = true
                        rend.push(item)
                    }
                }
            }
        }

        for (let i = 0; i < rend.length; i ++) rend[i].rendered = false
    }
}
