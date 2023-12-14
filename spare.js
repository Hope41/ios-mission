const holdHero = () => {
    hero.onReed += dt

    // make reed swing
    this.swingSpeed += hero.speed_x * heroPower * dt

    // position hero
    if (hero.colliding)
        this.swingSpeed = -.1 * Math.sign(this.swing)

    hero.x = this.grab.x + this.grab.w / 2 - hero.w / 2 - this.oft.x
    hero.y = this.grab.y + this.grab.h / 2 - hero.h - this.oft.y

    this.oft.x *= .7
    this.oft.y *= .7

    if (hero.onReed < 40 && !key.left && !key.right)
        key.up = false

    // detect if hero should jump
    else if (key.up || key.down) {
        this.holdingHero = false
        hero.onReed = 0

        hero.speed_y = -Math.abs(jumpEfficiency * this.swingSpeed) - Math.abs(hero.speed_x)

        this.release = true
    }
}

// grab hold of hero if not with a reed already nor already leaving this reed
const holdOn =  !hero.onReed && !this.release

// grab hero if he is in the right place
const grabHero = collide(hero, this.grab)

// slow hero if he's touching the reed but its not holding on
const slowDown = !this.holdingHero && collide(hero, this)

if (grabHero && holdOn) {
    this.swingSpeed = initialSwingForce * (Math.sign(hero.speed_x) || 1)
    this.holdingHero = true

    this.oft = {
        x: this.grab.x + this.grab.w / 2 - hero.w / 2 - hero.x,
        y: this.grab.y + this.grab.h / 2 - hero.h - hero.y}

    key.up = false
}

if (slowDown)
    hero.speed_x = 0

if (!slowDown && !grabHero)
    this.release = false

// hold hero
if (this.holdingHero) holdHero()