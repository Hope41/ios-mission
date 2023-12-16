'use strict'
class Game {
    constructor() {
        // stores mine currently exploding [collision size, mine id]
        this.activeMine = []

        this.clouds = []

        this.bar = 0
        this.speed = 0
        this.coins = {r: 1, g: 1, b: 1}
        this.filter = {r: 1, g: 1, b: 1, a: 0}

        this.startTime = 0
        this.endTime = 0

        this.totalCoinsCollected = 0
        this.totalDeaths = 0
        this.totalMinutes = 0

        this.alpha = 1
        this.rain_y = 0
        this.raining = false
        this.background = 'none'
        this.fadeSpeed = 200

        this.fade = 'none'
        this.black = 0

        this.pause = false
        this.timeOft = 0
    }

    start() {
        for (let i = 0; i < image_list.length; i ++) generateImage(image_list[i])

        map.loadLevels()
        map.setLevel('tgo', 'start')
    }

    resize() {
        scale = (cvs.width + cvs.height) / 50

        box = cvs.width / 20
        if (cvs.width > cvs.height) box = cvs.height / 20

        chat.setChatWords()
    }

    overlay() {
        const BAR_W = (10 + (hero.smooth_health * 5)) * box
        const BAR_H = .7 * box
        const GAP = .2 * box
        const GLOW = .2 * box
        const LINE = .14 * box
        const FADE = 5
        const BLACK_SPEED = .03

        this.speed *= Math.pow(.6, dt)
        this.speed += (BAR_W - this.bar) / 5 * dt
        this.bar += this.speed * dt

        const BAR = this.bar - LINE

        const x = cvs.width / 2 - this.bar / 2 + LINE / 2
        let y = GAP + LINE / 2

        // HEALTH
        const sh = box * .1
        const shad = rgb(0, 0, 0, .4)
        const healthColor = rgb(.5, .8, .7, this.alpha)

        ctx.fillStyle = shad
        ctx.strokeStyle = shad
        ctx.fillRect(x, y + sh, BAR * hero.smooth_health, BAR_H - LINE)
        ctx.lineWidth = LINE
        ctx.strokeRect(x, y + sh, BAR, BAR_H - LINE)

        ctx.fillStyle = healthColor
        ctx.strokeStyle = healthColor
        ctx.fillRect(x, y, BAR * hero.smooth_health, BAR_H - LINE)
        ctx.lineWidth = LINE
        ctx.strokeRect(x, y, BAR, BAR_H - LINE)

        // COINS
        y += BAR_H + GAP + LINE / 2

        let goal = {r: .86, g: .8, b: .2}
        if (hero.enoughCoins) goal = {r: .2, g: .55 + Math.sin(time / 20) * .2, b: .2}

        this.coins.r += (goal.r - this.coins.r) / FADE * dt
        this.coins.g += (goal.g - this.coins.g) / FADE * dt
        this.coins.b += (goal.b - this.coins.b) / FADE * dt
        const coinsColor = rgb(this.coins.r, this.coins.g, this.coins.b, this.alpha)

        if (hero.enoughCoins) {
            ctx.fillStyle = rgb(this.coins.r, this.coins.g, this.coins.b, this.alpha * .3)
            ctx.fillRect(x - GLOW, y - GLOW, BAR + GLOW * 2, (BAR_H - LINE) + GLOW * 2)
        }

        ctx.fillStyle = shad
        ctx.strokeStyle = shad
        ctx.fillRect(x, y + sh, BAR * hero.smooth_coins, BAR_H - LINE)
        ctx.lineWidth = LINE
        ctx.strokeRect(x, y + sh, BAR, BAR_H - LINE)

        ctx.fillStyle = coinsColor
        ctx.strokeStyle = coinsColor
        ctx.fillRect(x, y, BAR * hero.smooth_coins, BAR_H - LINE)
        ctx.lineWidth = LINE
        ctx.strokeRect(x, y, BAR, BAR_H - LINE)

        if (map.curr == 'city')
            ctx.drawImage(images.white, 0, 0, cvs.width, cvs.height)

        // HELP
        const HELPGAP = box * .6
        const HELP = box * 2
        const helpx = cvs.width - HELP - HELPGAP
        let helpHover = false

        if (collide({x:mx,y:my,w:0,h:0}, {x:helpx,y:HELPGAP,w:HELP,h:HELP})) {
            document.body.style.cursor = 'pointer'
            helpHover = true
            if (mp) {
                if (help) help = 0
                else if (!chat.active) help += dt
                mp = false
                key.press = false
            }
        }

        ctx.fillStyle = '#777'
        if (helpHover) ctx.fillStyle = '#333'
        ctx.fillRect(helpx - sh, HELPGAP + sh, HELP, HELP)

        ctx.fillStyle = '#444'
        if (helpHover) ctx.fillStyle = '#000'
        ctx.fillRect(helpx, HELPGAP, HELP, HELP)

        ctx.fillStyle = '#fff'
        ctx.fillRect(helpx + box * .5, HELPGAP + box * .2, box * .8, box * .3)
        ctx.fillRect(helpx + box * 1.3, HELPGAP + box * .2, box * .3, box * .6)
        ctx.fillRect(helpx + box * .8, HELPGAP + box * .8, box * .8, box * .3)
        ctx.fillRect(helpx + box * .8, HELPGAP + box * .8, box * .3, box * .5)
        ctx.fillRect(helpx + box * .8, HELPGAP + box * 1.45, box * .3, box * .3)

        // VOLUME
        const volx = cvs.width - HELP * 2 - HELPGAP * 2
        let volHover = false

        if (collide({x:mx,y:my,w:0,h:0}, {x:volx,y:HELPGAP,w:HELP,h:HELP})) {
            document.body.style.cursor = 'pointer'
            volHover = true
            if (mp) {
                if (SOUND.muted) {
                    muteSound(false)
                    song.play()
                    song.loop = true
                }
                else {
                    muteSound(true)
                    song.pause()
                }

                mp = false
                key.press = false
            }
        }

        ctx.fillStyle = '#777'
        if (volHover) ctx.fillStyle = '#333'
        ctx.fillRect(volx - sh, HELPGAP + sh, HELP, HELP)

        ctx.fillStyle = '#444'
        if (volHover) ctx.fillStyle = '#000'
        ctx.fillRect(volx, HELPGAP, HELP, HELP)

        ctx.fillStyle = '#fff'
        ctx.fillRect(volx + box * .3, HELPGAP + box * .6, box * .4, box * .8)
        ctx.fillRect(volx + box * .7, HELPGAP + box * .45, box * .45, box * 1.1)
        ctx.fillRect(volx + box * 1.3, HELPGAP + box * .7, box * .15, box * .6)
        ctx.fillRect(volx + box * 1.6, HELPGAP + box * .6, box * .15, box * .8)

        if (SOUND.muted) {
            ctx.strokeStyle = '#a00'
            ctx.lineWidth = box * .3
            ctx.beginPath()
            ctx.moveTo(volx + box * 2, HELPGAP)
            ctx.lineTo(volx, HELPGAP + box * 2)
            ctx.stroke()
        }

        // HELP BOX
        if (help) {
            ctx.textAlign = 'center'
            const W = box * 18
            let H = box * 18
            const X = cvs.width / 2 - W / 2
            const Y = box

            if (cvs.height > cvs.width)
                H = cvs.height / 20 * 18

            help += dt
            ctx.fillStyle = rgb(.1, .1, .1, help / 20)
            ctx.fillRect(X, Y, W, H)

            ctx.fillStyle = rgb(1, 1, 1, help / 20)
            ctx.font = box + 'px font, sans-serif'
            ctx.fillText('* HELP *', cvs.width / 2, box * 3)

            ctx.font = box * .6 + 'px font, sans-serif'
            ctx.fillText('Use the WASD, ZQSD or arrow', cvs.width / 2, box * 4.3)
            ctx.fillText('keys to control Io.', cvs.width / 2, box * 5)

            ctx.fillStyle = rgb(.6, 1, .6, help / 20)
            ctx.fillText('All the controls below can be used to', cvs.width / 2, box * 6)
            ctx.fillText('open chests or deal damage.', cvs.width / 2, box * 6.7)

            ctx.fillStyle = rgb(1, 1, 1, help / 20)
            ctx.fillText('While in the air (W to jump), press', cvs.width / 2, box * 8)
            ctx.fillText('the down key (S) to Ground Pound.', cvs.width / 2, box * 9)

            ctx.fillText('On the ground, duck-and-dash by holding', cvs.width / 2, box * 10.5)
            ctx.fillText('the down key (S) and then pressing either', cvs.width / 2, box * 11.5)
            ctx.fillText('the left key (A), or the right key (D).', cvs.width / 2, box * 12.5)

            ctx.fillText('Press the down key (S) underwater', cvs.width / 2, box * 14)
            ctx.fillText('to water-dash!', cvs.width / 2, box * 15)

            ctx.fillStyle = rgb(1, .3, .3, help / 20)
            ctx.fillText('Use the down key (S) to interact', cvs.width / 2, box * 16.5)
            ctx.fillText('with signs, doors, and people.', cvs.width / 2, box * 17)

            if (mp || key.press)
                help = 0
            mp = false
            key.press = false

            ctx.textAlign = 'left'
        }

        // CHAT
        if (chat.active) chat.update()

        // HELPER TUTORIAL
        if (!help && map.curr == 'tgo') {
            const yPos = box * 2.2

            ctx.fillStyle = '#111'
            ctx.fillRect(cvs.width / 2 - box * 9, box, box * 18, box * 3)

            ctx.textAlign = 'center'
            ctx.fillStyle = '#fff'
            ctx.font = box * .7 + 'px font, sans-serif'

            if (hero.x < 35) {
                if (MOBILE) {
                    ctx.fillText('Use the pad on the left', cvs.width / 2, yPos)
                    ctx.fillText('to move left and right.', cvs.width / 2, yPos + box)
                }
                else {
                    ctx.fillText('Use the left and right arrow', cvs.width / 2, yPos)
                    ctx.fillText('keys (A and D) to move.', cvs.width / 2, yPos + box)
                }
            }
            else if (hero.x < 90) {
                if (MOBILE) {
                    ctx.fillText('Tap the top of the', cvs.width / 2, yPos)
                    ctx.fillText('right pad to jump.', cvs.width / 2, yPos + box)
                }
                else ctx.fillText('Press the up key (W) to jump.', cvs.width / 2, yPos)
            }
            else {
                if (MOBILE) {
                    ctx.fillText('Tap the base of the right pad to', cvs.width / 2, yPos)
                    ctx.fillText('interact with signs, doors or people.', cvs.width / 2, yPos + box)
                }
                else {
                    ctx.fillText('Press the down key (S) to interact', cvs.width / 2, yPos)
                    ctx.fillText('with signs, doors or people.', cvs.width / 2, yPos + box)
                }
            }
            ctx.textAlign = 'left'
        }

        // FILTERS
        goal = [.5, .3, .1, .1]

        this.filter.r += (goal[0] - this.filter.r) / this.fadeSpeed * dt
        this.filter.g += (goal[1] - this.filter.g) / this.fadeSpeed * dt
        this.filter.b += (goal[2] - this.filter.b) / this.fadeSpeed * dt
        this.filter.a += (goal[3] - this.filter.a) / this.fadeSpeed * dt

        ctx.fillStyle = rgb(this.filter.r, this.filter.g, this.filter.b, this.alpha * this.filter.a)
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        // CLOUD
        if (this.raining)
            ctx.drawImage(images.gray, 0, 0, cvs.width, cvs.height)

        ctx.drawImage(images.filter, 0, 0, cvs.width, cvs.height)

        if (this.fade == 'black' || this.black < 0) this.black += BLACK_SPEED * dt
        else if (this.fade == 'none' || this.black > 1) this.black -= BLACK_SPEED * dt
        ctx.fillStyle = rgb(0, 0, 0, this.black)
        ctx.fillRect(0, 0, cvs.width, cvs.height)
    }

    update() {
        // SETUP
        ctx.clearRect(0, 0, cvs.width, cvs.height)
        ctx.imageSmoothingEnabled = false
        cam.update()

        // BACKGROUND IMAGE
        if (this.background == 'none') {
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, cvs.width, cvs.height)
        }
        else {
            const size = cvs.height
            const amount = Math.ceil(cvs.width / size) + 1
            const offset = (cam.x / (size / scale)) / 5
            for (let i = 0; i < amount; i ++) {
                const idx = i + Math.floor(offset) - offset
                ctx.drawImage(this.background, Math.floor(idx * size), 0, size, size)
            }
        }

        // RAIN
        if (this.raining) {
            let largest = cvs.width
            if (largest < cvs.height) largest = cvs.height

            this.rain_y += scale
            if (this.rain_y > largest) this.rain_y = this.rain_y - largest

            ctx.drawImage(images.rain, 0, this.rain_y - largest, largest, largest)
            ctx.drawImage(images.rain, 0, this.rain_y, largest, largest)
        }

        // First world with lighting ect
        if (map.curr == 'tgo') {
            const SEGMENTS = random(4, 6)

            const dist = 1 - Math.abs(map.lev[map.curr].w / 2 - hero.x) / 30

            let alpha = dist

            ctx.fillStyle = rgb(0, 0, 0, alpha)
            ctx.fillRect(0, 0, cvs.width, cvs.height)

            if (dist > .85) {
                ctx.strokeStyle = rgb(1, 1, 1, random(0, 1, 0))
                ctx.lineWidth = .15 * box

                const x = random(0, cvs.width)

                ctx.beginPath()
                ctx.moveTo(x, 0)

                for (let i = 1; i <= SEGMENTS; i ++)
                    ctx.lineTo(x + random(-1, 1, 0) * box * 3, cvs.height * i / SEGMENTS)
                ctx.stroke()

                cam.boom(2, .1, .1)
            }
        }

        // UPDATE THE HERO
        if (!this.pause) hero.update()

        // DRAW BLOCKS
        map.draw()

        // DRAW ACTORS
        map.drawActors()

        // SEQUENCES
        if (map.lev[map.curr].sqn.time) sequence()

        // render the hero
        if (hero.display) hero.draw()

        // HERO CALCULATIONS AND STATS
        hero.smooth_health += (hero.health - hero.smooth_health) / 5
        hero.enoughCoins = false

        const count = map.lev[map.curr].coinCount * .7
        if (count) {
            let coins = hero.coins
            if (coins > count) {
                coins = count

                hero.enoughCoins = true
            }

            hero.smooth_coins += ((coins / count) - hero.smooth_coins) / 5
        }

        // PARTICLES
        for (let i = 0; i < this.clouds.length; i ++) {
            const item = this.clouds[i]
            if (item.kill) this.clouds.splice(i, 1)
            else item.update()
        }

        // DRAW INFRONT BLOCKS
        map.foreground()

        // DRAW STATS
        this.overlay()
    }
}
