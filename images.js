'use strict'
const image_list = [
    'water',
    'backgroundsea',
    'backgroundstormsea',
    'backgroundtgo',
    'backgroundjungle',
    'backgroundcity',
    'rain',
    'tgoletters',
    'dream',
    'white',
    'gray',
    'filter'
]
const images = {}

class MakeImage extends Base {
    constructor(img, x, y, size) {
        super(x, y)

        this.img = images[img]

        this.x = x
        this.y = y

        this.w = this.img.width * size
        this.h = this.img.height * size

        this.applyToCells()
    }

    update() {

    }

    draw() {
        drawImage(this.img, this.x, this.y, this.w, this.h)
    }
}

function generateImage(name) {
    const image_arr = []

    if (name == 'water') {
        const amt = 5

        for (let i = 0; i < amt; i ++) {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.width = amt
            canvas.height = amt

            for (let y = 0; y < amt; y ++) {
                const s = random(.62, .65, 0)
                const l = .02
                context.fillStyle = rgb(l+s*.4,l+s*random(.77,.78,0),l+s,random(.9,1,0))
                context.fillRect(0, y, amt, 1)
            }

            image_arr.push(canvas)
        }
        images[name] = image_arr
        return
    }

    if (name == 'backgroundsea') {
        const res = 200
        const bg = [.6, .7, .8]

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        context.fillStyle = rgb(bg[0], bg[1], bg[2])
        context.fillRect(0, 0, res, res)

        const sea_level = .65

        // SEA
        const layers = Math.ceil(res * (1 - sea_level))
        for (let i = 0; i < layers; i ++) {
            const idx = (i / res + i / res) / 2
            context.fillStyle = rgb(0, idx / .6, idx / .5, idx / .5)
            context.fillRect(0, res * sea_level + i, res, 1)
        }

        context.fillStyle = '#fff1'
        context.fillRect(0, .5 * res, .15 * res, .08 * res)
        context.fillStyle = '#fff2'
        context.fillRect(.5 * res, .2 * res, .2 * res, .1 * res)

        images[name] = canvas
        return
    }

    if (name == 'backgroundstormsea') {
        const res = 200
        const bg = [.5, .5, .55]

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        // SKY
        for (let i = 0; i < res; i ++) {
            const s = (i / 400) - .4
            context.fillStyle = rgb(bg[0] - s, bg[1] - s, bg[2] - s)
            context.fillRect(0, i, res, 1)
        }

        const sea_level = .65

        // SEA
        const layers = Math.ceil(res * (1 - sea_level))
        for (let i = 0; i < layers; i ++) {
            const idx = (i / res + i / res) / 2
            context.fillStyle = rgb(idx / .6, idx / .5, idx / .5, idx / .5)
            context.fillRect(0, res * sea_level + i, res, 1)
        }

        context.fillStyle = '#3331'
        context.fillRect(0, .5 * res, .15 * res, .08 * res)
        context.fillRect(.5 * res, .2 * res, .17 * res, .09 * res)

        images[name] = canvas
        return
    }

    if (name == 'backgroundtgo') {
        const res = 200
        const bg = [.4, .5, .6]

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        const mount = .5
        const trees = .7

        const peaks = 5
        const hills = 3
    
        const trunk_w = res / 130
        const trunk_h = res / 50
        const tree_w = res / 40
        const tree_h = res / 40

        // SKY
        for (let i = 0; i < res; i ++) {
            const s = (i / 400) - .4
            context.fillStyle = rgb(bg[0] - s, bg[1] - s, bg[2] - s)
            context.fillRect(0, i, res, 1)
        }

        context.beginPath()
        context.fillStyle = rgb(.9, .9, .8, .3)
        context.arc(res / 5, res / 5, res / 20, 0, Math.PI * 2, false)
        context.fill()

        // mountains
        context.fillStyle = rgb(.4, .5, .6, .6)
        context.beginPath()
        context.moveTo(res, res)
        context.lineTo(0, res)
        context.lineTo(0, res * mount)

        for (let i = 0; i < peaks - 1; i ++) {
            const x = i * (res / peaks) + (res / peaks)
            context.lineTo(x, res * mount - Math.sin(i * i) * (res / 20))
        }

        context.lineTo(res, res * mount)
        context.fill()

        // trees
        context.fillStyle = rgb(.4, .5, .4, .9)
        context.beginPath()
        context.moveTo(res, res)
        context.lineTo(0, res)
        context.lineTo(0, res * trees)

        for (let i = 0; i < hills - 1; i ++) {
            const x = i * (res / hills) + (res / hills)
            const y = res * trees - Math.sin(i * i * 30) * (res / 20)
            context.lineTo(x, y)

            context.fillRect(x - trunk_w / 2, y - trunk_h, trunk_w, trunk_h)
            context.fillRect(x - tree_w / 2, y - trunk_h - tree_h, tree_w, tree_h)
        }

        context.lineTo(res, res * trees)
        context.fill()

        context.fillStyle = rgb(1, 1, 1, .1)
        context.fillRect(res / 3, res / 10, res / 6, res / 12)
        context.fillRect(res / 1.5, res / 4, res / 6, res / 12)

        images[name] = canvas
        return
    }

    if (name == 'backgroundjungle') {
        const res = 200

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        const bg = [.15, .25, 0]

        context.fillStyle = rgb(bg[0], bg[1], bg[2])
        context.fillRect(0, 0, res, res)

        const STALKS = 10
        const LAYERS = 3
        const LEAVES = 10

        for (let j = 0; j < LAYERS; j ++) {
            const s = j / 25

            for (let i = 0; i < STALKS; i ++) {
                const X = (i * res) / STALKS + Math.sin((i + 1) * j) * res * .03
                const W = res * j * .008

                // leaves
                for (let k = 0; k < LEAVES; k ++) {
                    context.fillStyle = rgb(bg[0] + s, bg[1] + s, bg[2] + s)
                    context.fillRect(X - W / 2, (k * res) / LEAVES + Math.sin(k * j * i) * res * .04, W * 2, res * .008)
                }

                // stalk
                context.fillStyle = rgb(bg[0] + s, bg[1] + s, bg[2] + s)
                context.fillRect(X, 0, W, res)
            }
        }

        images[name] = canvas
        return
    }

    if (name == 'backgroundcity') {
        const res = 300

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        const bg = [.5, .8, 1]

        context.fillStyle = rgb(bg[0], bg[1], bg[2])
        context.fillRect(0, 0, res, res)

        for (let i = 0; i < res; i ++) {
            context.fillStyle = rgb(1, 1, .8, i / res)
            context.fillRect(0, i, res, 1)
        }

        const builds = 10
        const w = res / builds
        const wind = res * .025
        const apart = .05 * res
        const apartY = .03 * res
        const yPos = .2
        const clouds = 5

        context.fillStyle = rgb(1, 1, 1, .3)
        for (let i = 0; i < clouds; i ++) {
            const oft = Math.sin(i * i)
            context.fillRect(
                i * (res / clouds) + (oft * res * .2),
                res / 2 + oft * res / 2,
                res * .2,
                res * .1)
        }

        for (let i = 0; i < builds; i ++) {
            const x = i * w
            const y = res - perlin(i, 1.4) * res * .2 - res * .4 - res * yPos

            const density = Math.sin(i * 20)
            const g = density * .02

            context.fillStyle = rgb(.2 - g, .2 - g, .2 - g)
            context.fillRect(x, y, w + 1, res - y)

            const W = Math.floor((w) / apart)

            for (let j = 0; j < 100; j ++) {
                if (Math.sin(j * 20) > density) continue

                const red = (1 + perlin(j)) * .1
                const shrink = red * .03 * res

                context.fillStyle = rgb(.6 + red, .6 + red, .4, .5)
                context.fillRect(
                    x + wind / 2 + (j % W) * apart,
                    y + wind / 2 + Math.floor(j / W) * apartY,
                    wind - shrink, wind - shrink)
            }
        }

        for (let i = 0; i < res; i ++) {
            context.fillStyle = rgb(0, 0, 0, i / res)
            context.fillRect(0, i, res, 1)
        }

        images[name] = canvas
        return
    }

    if (name == 'rain') {
        const res = 300
        const length = 7

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        for (let x = 0; x < res; x ++) {
            for (let y = 0; y < Math.ceil((res / length) + length); y ++) {
                context.fillStyle = rgb(0, 0, 0, random(.02, .06, 0))

                context.fillRect(
                    x + random(0, 1, 0),
                    y * length + random(0, length, 0) - length,
                    1, length)
            }
        }

        images[name] = canvas
        return
    }

    if (name == 'tgoletters') {
        const w = 22
        const h = 6

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = w
        canvas.height = h

        const arr = [
            1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1,
            0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1
        ]

        for (let x = 0; x < w; x ++) {
            for (let y = 0; y < h; y ++) {
                if (arr[x + y * w]) {
                    context.fillStyle = colorShade([.65, .1, .1], random(.65, .7, 0))
                    context.fillRect(x, y, 1, 1)
                }
            }
        }

        images[name] = canvas
        return
    }

    if (name == 'dream') {
        const res = 50

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        for (let x = 0; x < res; x ++) {
            for (let y = 0; y < res; y ++) {
                context.fillStyle = rgb(
                    .9, .2, .3,
                    (1 - Math.sin(x / res * Math.PI) * Math.sin(y / res * Math.PI)) / 2)
                context.fillRect(x, y, 1, 1)
            }
        }

        images[name] = canvas
        return
    }

    if (name == 'white') {
        const res = 100

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        for (let x = 0; x < res; x ++) {
            for (let y = 0; y < res; y ++) {
                context.fillStyle = rgb(
                    0, 0, .05,
                    (1 - Math.sin(x / res * Math.PI) * Math.sin(y / res * Math.PI)) / 3)
                context.fillRect(x, y, 1, 1)
            }
        }

        images[name] = canvas
        return
    }

    if (name == 'gray') {
        const res = 100

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        for (let x = 0; x < res; x ++) {
            for (let y = 0; y < res; y ++) {
                context.fillStyle = rgb(
                    .1, .1, .1,
                    (1 - Math.sin(x / res * Math.PI) * Math.sin(y / res * Math.PI)) / 2)
                context.fillRect(x, y, 1, 1)
            }
        }

        images[name] = canvas
        return
    }

    if (name == 'filter') {
        const res = 500

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = res
        canvas.height = res

        const strength = .02
        const stop = Math.floor(res * .03)

        for (let y = 0; y < res; y ++) {
            context.fillStyle = rgb(0, 0, 0, strength + Math.sin(y * 10 * res) * strength)
            context.fillRect(0, y, res, 1)

            if (y % stop == 0) {
                context.fillStyle = rgb(0, 0, 0, Math.sin(y) * .007)
                const X = hashRandom(-res, res, 0, y * y)
                context.fillRect(X, y, res, stop / 2)
            }
        }

        images[name] = canvas
        return
    }
}