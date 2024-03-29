/* Io's Mission Copyright 2023. Play the game at JoachimFord.uk */

'use strict'
function resize() {
    cvs.width = innerWidth * dpr
    cvs.height = (innerHeight + 1) * dpr

    game.resize()
}

function control() {
    const press = (e, bool) => {
        if (e.repeat) return
        key.press = bool
        if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'z') key.up = bool
        if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'q') key.left = bool
        if (e.key == 'ArrowDown' || e.key == 's') key.down = bool
        if (e.key == 'ArrowRight' || e.key == 'd') key.right = bool
    }

    onkeydown = e => press(e, 1)
    onkeyup = e => press(e, 0)
}

function update() {
    requestAnimationFrame(update)

    // implementing deltatime means the game will stay the same speed on all devices
    DT = (performance.now() - oldPerf) / 16
    oldPerf = performance.now()
    if (DT > 1) DT = 1
    time = performance.now() / 16
    dt = DT

    document.body.style.cursor = 'default'

    if (start) {
        ctx.clearRect(0, 0, cvs.width, cvs.height)
        cam.y = 47
        cam.x = 300 + time / 50

        // SCENE
        const size = cvs.height
        const amount = Math.ceil(cvs.width / size) + 1
        const offset = (cam.x / (size / scale)) / 5
        for (let i = 0; i < amount; i ++) {
            const idx = i + Math.floor(offset) - offset
            if (game.background != 'none')
                ctx.drawImage(game.background, Math.floor(idx * size), 0, size, size)
        }
        map.draw()

        const sh = box * .1
        const HELPGAP = box * .6
        const HELP = box * 2
        const volx = cvs.width - HELP - HELPGAP
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

        const tall = cvs.height > cvs.width
        ctx.textAlign = 'center'

        if (know) {
            const W = box * 18
            let H = box * 18
            const X = cvs.width / 2 - W / 2
            const Y = box

            if (tall)
                H = cvs.height / 20 * 18

            know += dt
            ctx.fillStyle = rgb(.1, .1, .1, know / 20)
            ctx.fillRect(X, Y, W, H)

            ctx.fillStyle = rgb(1, 1, 1, know / 20)
            ctx.font = box + 'px font, sans-serif'
            ctx.fillText('* ACKNOWLEDGEMENTS *', cvs.width / 2, box * 4)

            ctx.font = box * .7 + 'px font, sans-serif'
            ctx.fillText('INSPIRED BY', cvs.width / 2, box * 6.5)
            ctx.fillText('- Mobility by Auroriax', cvs.width / 2, box * 8)
            ctx.fillText('- Dadish by Thomas K Young', cvs.width / 2, box * 9)
            ctx.fillText('- Yoshi\'s Island by Nintendo', cvs.width / 2, box * 10)

            ctx.font = box * .5 + 'px font, sans-serif'
            ctx.fillText('SPECIAL THANKS to @JeroenG and @KilledByAPixel', cvs.width / 2, box * 13)
            ctx.fillText('for motivating me to keep making games :)', cvs.width / 2, box * 14)

            if (mp || key.press)
                know = 0
        }
        else {
            // TITLE
            const sh = box * .08 + Math.sin(time / 100) * box * .02
            ctx.font = box * 2 + 'px font, sans-serif'
            ctx.fillStyle = '#fff'
            ctx.fillText('IO\'S MISSION', cvs.width / 2 + sh, box * 4 + sh)
            ctx.fillStyle = '#000'
            ctx.fillText('IO\'S MISSION', cvs.width / 2 - sh, box * 4 - sh)

            // BUTTONS
            let CONTINUE = 1
            if (LOCALSTORAGE) CONTINUE = -1 // make invalid

            const W = box * 15
            let H = box * 2.3
            const GAP = box * .7
            const texth = box * .7
            let y = box * 6

            if (tall)
                H = cvs.height / 20 * 2.3

            for (let i = 0; i < buttons.length; i ++) {
                const item = buttons[i]

                const x = cvs.width / 2 - W / 2

                if (collide({x: mx, y: my, w: 0, h: 0}, {x, y, w: W, h: H}) && i != CONTINUE) {
                    document.body.style.cursor = 'pointer'
                    if (item.z < .1 * box)
                        item.z += .03 * box * dt

                    if (mp) item.command(item)
                }
                else item.z *= Math.pow(.6, dt)

                ctx.fillStyle = '#0009'
                ctx.fillRect(x - item.z * 2, y - item.z, W + item.z * 4, H / 2 + item.z)
                ctx.fillStyle = '#000d'
                ctx.fillRect(x - item.z * 2, y + H / 2, W + item.z * 4, H / 2 + item.z * 2)

                ctx.fillStyle = '#fff'
                if (i == CONTINUE) ctx.fillStyle = '#888'

                // ARROW
                if (buttonIdx == i) {
                    ctx.fillStyle = '#bfb'

                    const width = box * .2
                    const height = box * .3
                    for (let i = 0; i < 3; i ++) {
                        const h = (i + 1) * height
                        ctx.fillRect(
                            cvs.width / 2 + W / 2 - (i + 3) * width,
                            y + H / 2 - h / 2,
                            width + 1, h)
                    }

                    if (key.press && !key.up && !key.down) {
                        key.press = false
                        item.command(item)
                    }
                }

                // TEXT
                ctx.font = item.z / 2 + box * .9 + 'px font, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(item.text, cvs.width / 2, y + H / 2 + texth / 2 + item.z / 3)

                y += GAP + H
            }

            if (key.down) {
                buttonIdx ++
                if (buttonIdx == CONTINUE) buttonIdx ++
                if (buttonIdx > buttons.length - 1)
                    buttonIdx = 0
                key.down = false
            }
            if (key.up) {
                buttonIdx --
                if (buttonIdx == CONTINUE) buttonIdx --
                if (buttonIdx < 0)
                    buttonIdx = buttons.length - 1
                key.up = false
            }

            if (fadeStart) {
                fadeStart += dt
                const MAX = 100

                ctx.fillStyle = rgb(1, 1, 1, .5 - Math.cos(fadeStart / MAX * Math.PI) * .5)
                ctx.fillRect(0, 0, cvs.width, cvs.height)

                key.up = false
                key.down = false
                key.left = false
                key.right = false
                hero.update()
                cam.x = hero.x + hero.w / 2
                cam.y = hero.y

                if (fadeStart > MAX) {
                    start = false
                    game.fadeSpeed = MAX
                    game.filter = {r:1,g:1,b:1,a:1}
                }
            }
        }

        ctx.drawImage(images.filter, 0, 0, cvs.width, cvs.height)

        mp = false
        key.press = false
    }

    if (blaze) {
        blaze += dt
        const pad = box * .2
        const forw = box * 4
        const forh = box * 2.5
        const fory = box * 5
        const barw = box * .6
        const shakeLast = 150
        const shakeAmt = .2
        const reveal = 60
        const ending = 200

        let a = 1 - (blaze - ending) / 100
        if (a > 1) a = 1

        if (blaze > ending) {
            start = true
            if (a < 0)
                blaze = 0
        }

        let oftx = 0
        let ofty = 0
        if (blaze > reveal) {
            let amt = shakeAmt - (blaze - reveal) / shakeLast
            if (amt < 0) amt = 0
            oftx += random(-1, 1) * box * amt
            ofty += random(-1, 1) * box * amt
        }

        if (blaze > 20) {
            blazeSpeed += (fory - blazeY) / 14 * dt
            blazeSpeed *= Math.pow(.9, dt)
            blazeY += blazeSpeed * dt
        }
        else blazeY = -forh

        ctx.textAlign = 'center'

        ctx.fillStyle = rgb(0,0,0,a)
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        if (blaze < ending) {
            ctx.fillStyle = rgb(.25,.1,.06)
            ctx.fillRect(oftx + cvs.width / 2 - box * 9 + forw / 2 - barw / 2, 0, barw, blazeY + ofty)
            ctx.fillStyle = rgb(.3,.15,.1)
            ctx.fillRect(oftx + cvs.width / 2 - box * 9, ofty + blazeY, forw, forh)
            ctx.fillStyle = rgb(.1,.1,.1)
            ctx.fillRect(oftx + cvs.width / 2 - box * 9 + pad, ofty + blazeY + pad, forw - pad * 2, forh - pad * 2)
            ctx.fillStyle = rgb(.8,.8,.8)
            ctx.font = box * 1.3 + 'px font, sans-serif'
            ctx.fillText('FOR', oftx + cvs.width / 2 - box * 7, ofty + blazeY + box * 1.7)

            if (blaze > reveal) {
                ctx.fillStyle = rgb(.8,1,1)
                ctx.font = box * 2 + 'px font, sans-serif'
                ctx.fillText('BLAZINGSTAR32111', oftx * 2 + cvs.width / 2, ofty * 2 + box * 11)

                const grow = (blaze - reveal) / 30
                const wid = 20 + grow
                ctx.fillStyle = rgb(.8, 1, .9, .5 - (blaze - reveal) / 300)
                ctx.fillRect(cvs.width / 2 - box * wid * .5, box * 9 - grow * box / 2, box * wid, box * 2.6 + grow * box)
            }

            ctx.fillStyle = rgb(0, 0, 0, 1 - (ending - blaze) / 50)
            ctx.fillRect(0, 0, cvs.width, cvs.height)
        }

        return
    }

    if (start)
        return

    ctx.textAlign = 'left'
    game.update()
    clear()

    // MOBILE CONTROL PAD
    if (MOBILE) {
        PADRAD = box * 3
        x1PAD = box + PADRAD
        x2PAD = cvs.width - box - PADRAD
        yPAD = cvs.height - box - PADRAD

        ctx.fillStyle = '#dfe3'
        if (key.right) ctx.fillStyle = '#dfe4'
        ctx.beginPath()
        ctx.arc(x1PAD, yPAD, PADRAD, -Math.PI / 2, Math.PI / 2)
        ctx.fill()
        ctx.fillStyle = '#dfe6'
        if (key.left) ctx.fillStyle = '#dfe5'
        ctx.beginPath()
        ctx.arc(x1PAD, yPAD, PADRAD, Math.PI / 2, -Math.PI / 2)
        ctx.fill()

        ctx.fillStyle = '#dfe3'
        if (key.down) ctx.fillStyle = '#dfe4'
        ctx.beginPath()
        ctx.arc(x2PAD, yPAD, PADRAD, 0, Math.PI)
        ctx.fill()
        ctx.fillStyle = '#dfe6'
        if (key.up) ctx.fillStyle = '#dfe5'
        ctx.beginPath()
        ctx.arc(x2PAD, yPAD, PADRAD, Math.PI, 0)
        ctx.fill()
    }

    if (end) {
        end += dt
        const fade = .003

        let w = cvs.width * fade * end
        let h = cvs.height * fade * end
        if (w > cvs.width) w = cvs.width
        if (h > cvs.height) h = cvs.height

        ctx.fillStyle = rgb(1, 1, 1, end * fade)
        ctx.fillRect(cvs.width / 2 - w / 2, cvs.height / 2 - h / 2, w, h)

        ctx.textAlign = 'center'

        ctx.font = 'bold ' + box * 1.1 + 'px font, sans-serif'
        ctx.fillStyle = rgb(0, 0, 0, end * fade - 1)
        ctx.fillText('Thanks for playing!', cvs.width / 2, cvs.height / 2 - box)

        ctx.font = box * .7 + 'px font, sans-serif'
        ctx.fillStyle = rgb(.6, .4, 0, end * fade - 1.5)
        ctx.fillText(game.totalCoinsCollected + ' coins collected', cvs.width / 2, cvs.height / 2)
        ctx.fillStyle = rgb(.6, 0, 0, end * fade - 1.8)
        ctx.fillText(game.totalDeaths + ' deaths', cvs.width / 2, cvs.height / 2 + box)
        ctx.fillStyle = rgb(0, .5, 0, end * fade - 2.1)
        ctx.fillText(game.totalMinutes + ' minutes taken', cvs.width / 2, cvs.height / 2 + box * 2)
    }

    else game.totalMinutes = Math.ceil((time / 3600) + game.timeOft)

    mm = false
}

const ctx = cvs.getContext('2d')
document.body.appendChild(cvs)
const dpr = devicePixelRatio

const key = {
    up: false,
    down: false,
    left: false,
    right: false,
    press: false
}

let PADRAD = 0
let x1PAD = 0
let x2PAD = 0
let yPAD = 0

const padBlob = {x: 0, y: 0}
let end = 0
let start = false
let blaze = 1
let blazeSpeed = 0
let blazeY = 0
let know = 0
let help = 0
let buttonIdx = 0
let fadeStart = 0
const buttons = []
buttons.push({text: 'PLAY', command: () => fadeStart += dt, z: 0})
buttons.push({text: 'CONTINUE', command: () => {
    fadeStart += dt

    const data = LOCALSTORAGE.split(',')
    game.timeOft = Number(data[0])
    game.totalDeaths = Number(data[1])
    game.totalCoinsCollected = Number(data[2])
    map.setLevel(data[3], 'start')

    map.lev[map.curr].doors.start.locked = true
    map.lev[map.curr].doors.start.type = 'seal'
}, z: 0})
buttons.push({text: 'ACKNOWLEDGEMENTS', command: () => know += dt, z: 0})
buttons.push({text: 'JOACHIMFORD.UK', command: () => window.open('https://JoachimFord.uk', '_self'), z: 0})

let scale = 1
let box = 1

let dt = 0
let DT = 0
let oldPerf = 0

let time = 0
let SEED = 0

let mx = 0
let my = 0
let mp = false
let mm = false

const KEYWORD = 'JoachimFordIoMissionData'
const LOCALSTORAGE = localStorage.getItem(KEYWORD)

let ahr = []
const clear = () => {ahr = []}
const rest = () => {ahr.pop()}
const rotate = (x, y, ang) => ahr.push([x, y, ang])

const map = new Map()
const hero = new Hero()
const cam = new Cam()
const game = new Game()
const chat = new Chat()
game.start()

const MOBILE = 'ontouchstart' in window

say('intro')

const song = new Audio('src/music.m4a')
const bounce = new Audio('src/jump.wav')
const pound = new Audio('src/pound.wav')
const hit = new Audio('src/hit.wav')
const collect = new Audio('src/coin.wav')
const dash = new Audio('src/dash.wav')
const spin = new Audio('src/spin.wav')
const tone = new Audio('src/tone.wav')
const SOUND = {}

function muteSound(bool) {
    song.muted = bool
    bounce.muted = bool
    pound.muted = bool
    hit.muted = bool
    collect.muted = bool
    dash.muted = bool
    spin.muted = bool
    tone.muted = bool
    SOUND.muted = bool
}
muteSound(true)

function MOVE(x, y) {
    mx = x * dpr
    my = y * dpr

    mm = true
}

function touchMove(e) {
    if (e.originalEvent) e = e.originalEvent
    const touch = e.touches[0] || e.changedTouches[0]
    MOVE(touch.pageX, touch.pageY)
}

function cancelTouches(e) {
    for (let i = 0; i < e.changedTouches.length; i ++) {
        const release = key => {
            if (key && key.identifier == e.changedTouches[i].identifier)
                return false
            return key
        }

        key.up = release(key.up)
        key.down = release(key.down)
        key.left = release(key.left)
        key.right = release(key.right)
    }
}

addEventListener('touchstart', e => {
    e.preventDefault()

    mp = true
    touchMove(e)

    for (let i = 0; i < e.changedTouches.length; i ++) {
        const touch = e.changedTouches[i]
        const mouse = {x:touch.clientX*dpr,y:touch.clientY*dpr,w:0,h:0}

        if (collide(mouse, {x:x1PAD-PADRAD,y:yPAD-PADRAD,w:PADRAD,h:PADRAD*2}))
            key.left = touch
        if (collide(mouse, {x:x1PAD,y:yPAD-PADRAD,w:PADRAD,h:PADRAD*2}))
            key.right = touch
        if (collide(mouse, {x:x2PAD-PADRAD,y:yPAD-PADRAD,w:PADRAD*2,h:PADRAD}))
            key.up = touch
        if (collide(mouse, {x:x2PAD-PADRAD,y:yPAD,w:PADRAD*2,h:PADRAD}))
            key.down = touch
    }
})
addEventListener('touchend', e => {
    e.preventDefault()
    mp = false
    cancelTouches(e)
})
addEventListener('touchleave', e => {
    e.preventDefault()
    mp = false
    cancelTouches(e)
})
addEventListener('mousedown', () => mp = true)
addEventListener('mouseup', () => mp = false)
addEventListener('mousemove', e => MOVE(e.clientX, e.clientY))
addEventListener('touchmove', e => touchMove(e))

addEventListener('resize', resize)
resize()
control()

requestAnimationFrame(update)
