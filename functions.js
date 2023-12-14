'use strict'

function perlin(x, m = 1) {
    return Math.sin(x * m * 2) - Math.sin(x * m * Math.PI)
}

function rain(seed) {
    const third = Math.PI * 2 / 3
    return [Math.sin(seed), Math.sin(seed + third), Math.sin(seed + third * 2)]
}

function shift(arr, shift = 0, multiply = false, alpha = 1) {
    if (multiply)
        return rgb(arr[0] * shift, arr[1] * shift, arr[2] * shift, alpha)
    return rgb(arr[0] + shift, arr[1] + shift, arr[2] + shift, alpha)
}

function indexToPos(index, width) {
    return {
        x: index % width,
        y: Math.floor(index / width)
    }
}

function posToIndex(x, y, width) {
    x = Math.floor(x)
    y = Math.floor(y)
    if (x < 0 || x >= width) return
    return x + y * width
}

function color(alpha = 1, min = 0, max = 1) {
    return rgb(random(min, max, 0), random(min, max, 0), random(min, max, 0), alpha)
}

function colorShade(RGB, shade) {
    return rgb(
        RGB[0] * shade,
        RGB[1] * shade,
        RGB[2] * shade)
}

function objSet(obj, run = 'none') {
    // exclusive function for map generation timers
    obj.reset = () => obj.curr = random(obj.min, obj.max)
    if (run == '0/min') obj.curr = random(0, obj.min)
    else if (run == 'min/max') obj.curr = random(obj.min, obj.max)
}

function merge(obj1, obj2, speed_x, speed_y, bad = {}) {
    /* Swept AABB Collision and Reponse
    1. Detect collision
    2. Get previous pos
    3. Find largest intersection with previous pos and block
    4. Move object to opposite side */

    const obj1_x = obj1.x - speed_x
    const obj1_y = obj1.y - speed_y

    const mar = [
        obj2.y - (obj1_y + obj1.h), // top
        obj1_y - (obj2.y + obj2.h), // bottom
        obj2.x - (obj1_x + obj1.w), // left
        obj1_x - (obj2.x + obj2.w) // right
    ]

    let min = 0
    if (mar[1] > mar[min] && !bad.down) min = 1
    if (mar[2] > mar[min] && !bad.left) min = 2
    if (mar[3] > mar[min] && !bad.right) min = 3


    if (min == 0) return {x: 0, y: (obj1.y + obj1.h) - obj2.y}
    if (min == 1) return {x: 0, y: obj1.y - (obj2.y + obj2.h)}
    if (min == 2) return {x: (obj1.x + obj1.w) - obj2.x, y: 0}
    if (min == 3) return {x: obj1.x - (obj2.x + obj2.w), y: 0}
}

function collide(obj1, obj2) {
    /* Detects if object1 is
    colliding with object2.*/

    return (
        obj1.x < obj2.x + obj2.w &&
        obj1.x + obj1.w > obj2.x &&
        obj1.y < obj2.y + obj2.h &&
        obj1.y + obj1.h > obj2.y
    )
}

function realPos(x, y, w = 0, h = 0) {
    x = (x - cam.x) * scale + cvs.width / 2
    y = (y - cam.y) * scale + cvs.height / 2
    w = w * scale
    h = h * scale
    return {x, y, w, h}
}

function fakePos(x, y) {
    return {
        x: (x - cvs.width / 2) / scale + cam.x,
        y: (y - cvs.height / 2) / scale + cam.y
    }
}

function rotAroundAhr(x, y, ahr_x, ahr_y, ang) {
    const cos = Math.cos(ang)
    const sin = Math.sin(ang)
    const dist_x = x - ahr_x
    const dist_y = y - ahr_y

    const new_x = (cos * dist_x) + (sin * dist_y) + ahr_x
    const new_y = (cos * dist_y) - (sin * dist_x) + ahr_y

    return {x: new_x, y: new_y}
}

function rotRect(base_x, base_y, width, height) {
    // Draws a rotated line based on anchor positions and angles
    if (width < 0) {
        width = -width
        base_x -= width
    }
    if (height < 0) {
        height = -height
        base_y -= height
    }

    let angle = 0
    let curr_x = base_x
    let curr_y = base_y

    const X = 0
    const Y = 1
    const ANG = 2

    for (let i = ahr.length; i --;) {
        // point change
        const pos = rotAroundAhr(curr_x, curr_y, ahr[i][X], ahr[i][Y], ahr[i][ANG])
        curr_x = pos.x
        curr_y = pos.y
        angle += ahr[i][ANG]
    }

    const x1 = curr_x + Math.sin(angle + Math.PI / 2) * width / 2
    const y1 = curr_y + Math.cos(angle + Math.PI / 2) * width / 2
    const x2 = x1 + Math.sin(angle) * height
    const y2 = y1 + Math.cos(angle) * height

    const real_1 = realPos(x1, y1)
    const real_2 = realPos(x2, y2)

    ctx.lineWidth = width * scale
    ctx.beginPath()
    ctx.moveTo(real_1.x, real_1.y)
    ctx.lineTo(real_2.x, real_2.y)
    ctx.stroke()

    return {x1, y1, x2, y2}
}

function fillRect(x, y, width, height) {
    const real = realPos(x, y)
    ctx.fillRect(real.x, real.y, width * scale, height * scale)
}

function strokeRect(x, y, width, height, thickness) {
    ctx.lineWidth = thickness * scale
    width -= thickness / 2
    height -= thickness / 2

    const real = realPos(x, y)
    ctx.strokeRect(real.x, real.y, width * scale, height * scale)
}

function line(data, width) {
    for (let i = 0; i < data.length; i += 2) {
        const real1 = realPos(data[i], data[i + 1])
        const real2 = realPos(data[i + 2], data[i + 3])

        ctx.lineWidth = width * scale

        ctx.beginPath()
        ctx.moveTo(real1.x, real1.y)
        ctx.lineTo(real2.x, real2.y)
        ctx.stroke()
    }
}

function lineFill(data) {
    ctx.beginPath()
    for (let i = 0; i < data.length; i += 2) {
        const real = realPos(data[i], data[i + 1])
        ctx.lineTo(real.x, real.y)
    }
    ctx.fill()
}

function drawImage(image, x, y, width, height) {
    const real = realPos(x, y)
    ctx.drawImage(image, real.x, real.y, width * scale, height * scale)
}

function hash(seed) {
    const whole = 2038074743

    seed *= 15485863
    return ((seed * seed * seed % whole + whole) % whole) / whole
}

function random(min, max, int = true) {
    SEED ++
    return hashRandom(min, max, int, SEED)

    // const value = Math.random() * (max - min) + min
    // if (int) return Math.floor(value)
    // return value
}

function hashRandom(min, max, int = true, seed) {
    const value = hash(seed) * (max - min) + min
    if (int) return Math.floor(value)
    return value
}

function rgb(r, g, b, a = 1) {
    return 'rgb('+r*255+','+g*255+','+b*255+','+a+')'
}

function jump(obj, force = .1) {
    obj.speed_y = -force
    obj.in_air = true
}