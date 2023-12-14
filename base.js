'use strict'
class Base {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.alpha = 1
        this.display = true
        this.dead = false
        this.coins = 0
        this.cellsArr = []
        this.manual = false

        this.world = map.curr
    }

    defineCoins(min, max) {
        this.coins = random(min, max)
        map.lev[map.curr].coinCount += this.coins
    }

    releaseCoins() {
        const randX = () => {return this.x + random(0, this.w - 1, 0)}
        const randY = () => {return this.y + random(0, this.h - 1, 0)}

        for (let i = 0; i < this.coins; i ++) map.makeCoin(randX(), randY(), false)
        if (this.powerful) map.makePower(randX(), randY())
    }

    collisionSetUp(maxSpeed = true) {
        if (maxSpeed)
            this.maxSpeed()

        const arr = []
        const box = {}
        box.x = Math.floor(this.x),
        box.y = Math.floor(this.y),
        box.w = Math.floor(this.x + this.w) - box.x,
        box.h = Math.floor(this.y + this.h) - box.y
    
        for (let i = 0; i < box.w + 1; i ++) {
            arr.push({x: box.x + i, y: box.y, w: 1, h: 1})
            arr.push({x: box.x + i, y: box.y + box.h, w: 1, h: 1})
        }
        for (let i = 1; i < box.h; i ++) {
            arr.push({x: box.x, y: box.y + i, w: 1, h: 1})
            arr.push({x: box.x + box.w, y: box.y + i, w: 1, h: 1})
        }
    
        return arr
    }

    applyToCells() {
        if (this.world != map.curr) return

        // GET BOX AROUND THE OBJECT
        const boxAroundObj = {}
        boxAroundObj.x = Math.floor(this.x / ACTOR_CELL_SIZE)
        boxAroundObj.y = Math.floor(this.y / ACTOR_CELL_SIZE)
        boxAroundObj.w = Math.floor((this.x + this.w) / ACTOR_CELL_SIZE) - boxAroundObj.x
        boxAroundObj.h = Math.floor((this.y + this.h) / ACTOR_CELL_SIZE) - boxAroundObj.y

        // REMOVE OLD OBJECT POSITIONS FROM ACTOR ARRAY
        for (let i = 0; i < this.cellsArr.length; i ++) {
            const item = this.cellsArr[i]
            map.lev[map.curr].actors[item.cell][item.idx] = undefined
        }
        this.cellsArr = []

        if (!this.dead && !this.manual) {
            // ADD NEW OBJECT POSITIONS TO ACTOR ARRAY
            for (let x = 0; x < boxAroundObj.w + 1; x ++) {
                for (let y = 0; y < boxAroundObj.h + 1; y ++) {
                    const pos = posToIndex(boxAroundObj.x + x, boxAroundObj.y + y, map.lev[map.curr].actor_w)
                    // do not add outside of map
                    if (pos != undefined && map.lev[map.curr].actors[pos] != undefined) {
                        map.lev[map.curr].actors[pos].push(this)

                        this.cellsArr.push({cell: pos, idx: map.lev[map.curr].actors[pos].length - 1})
                    }
                }
            }
        }
    }

    maxSpeed(max = MAX_SPEED) {
        // Min and max speed limits
        if (this.speed_x > max) this.speed_x = max
        if (this.speed_x < -max) this.speed_x = -max
        if (this.speed_y > max) this.speed_y = max
        if (this.speed_y < -max) this.speed_y = -max
    }

    walls() {
        const w = map.lev[map.curr].w
        const h = map.lev[map.curr].h

        if (this.x < 0) {
            this.x = 0
            this.speed_x = 0
        }
        if (this.y < 0) {
            this.y = 0
            this.speed_y = 0
        }
        if (this.x > w - this.w) {
            this.x = w - this.w
            this.speed_x = 0
        }
        if (this.y > h - this.h) {
            this.y = h - this.h
            this.speed_y = 0
        }
    }
}