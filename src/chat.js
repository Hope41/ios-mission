'use strict'

const spoken = {}
function say(key, man = 'none', oneOff = true) {

    // if it hasn't already spoken or it is allowed to repeat itself
    if (!spoken[key] || !oneOff) {
        spoken[key] = key

        const HERO = [.25, .55, .75]
        const MAN = [.55, .45, .25]

        if (key == 'guardPirate') {
            chat.say(man, MAN, ['Hey! What are you doing down \'ere?'])
            chat.say(hero, HERO, ['Sorry to interfere, do you happen to know the whereabouts of the Teleport Key?'])
            chat.say(man, MAN, ['What key?', 'There ain\'t nuffin over \'ere. Go away!'])
            chat.say(hero, HERO, ['I can see it in your hand.'])
            chat.say(man, MAN, ['Oops. Well anyway, I\'m not going to give it to you just like that. You\'ll never get past me!'])
            return
        }

        if (key == 'victoryIoGuardPirate') {
            chat.say(man, MAN, ['Argh. You win. Take the key and be off with you.'])
            return
        }

        if (key == 'victoryGuardPirate') {
            chat.say(man, MAN, ['Farewell me hearties! Ha ha ha.'])
            return
        }

        if (key == 'cheifPirate') {
            chat.say(man, MAN, ['Arr! Who are ye?'])
            chat.say(hero, HERO, ['Hi! I\'m Io. May you please tell me where to find the Teleport Door?'])
            chat.say(man, MAN, ['...', 'What door?'])
            chat.say(hero, HERO, ['I\'m sure you know the one I\'m talking about...'])
            chat.say(man, MAN, ['Garrr! Well it\'s going to be extremely difficult for ye get to.'])
            return
        }

        if (key == 'staff1Hello') {
            chat.say(man, MAN, ['Io! What are you doing in here?! This isn\'t the place for a person like you.'])
            chat.say(hero, HERO, ['I need to save my friends. Do you know where they went?'])
            chat.say(man, MAN, ['Hmm... good question. Actually, I think I saw the guards take your friends upstairs earlier. Follow me!'])
            return
        }

        if (key == 'staff1WhereTheyWent') {
            chat.say(man, MAN, ['They went through here. All the best with your adventures!'])
            return
        }

        if (key == 'staff1PASS1') {
            chat.say(man, MAN, ['Off you go then! Through the door!'])
            return
        }

        if (key == 'staff1ItsLocked') {
            chat.say(hero, HERO, ['It\'s locked.'])
            chat.say(man, MAN, ['Oh no! We can\'t have that.', 'Maybe try the other door. You might be able to find the key!'])
            return
        }

        if (key == 'staff1PASS2') {
            chat.say(man, MAN, ['Off you go!'])
            return
        }

        if (key == 'staff1PASS3') {
            chat.say(man, MAN, ['Haha, I\'m happy to chat, but I think you really must be getting on.'])
            return
        }

        if (key == 'staff1PASS4') {
            chat.say(man, MAN, ['Don\'t worry Io, I\'m sure this one\'s open. I actually checked it this morning.'])
            return
        }

        if (key == 'staff1PASS5') {
            chat.say(man, MAN, ['Please try the door, your friends could be in danger! The sooner you get them out of this tower the better.', 'You need to save them, remember?'])
            return
        }

        if (key == 'staff1FoundTheKey') {
            chat.say(man, MAN, ['Oh, finally. You took ages! I was beginning to think you\'d never come back! I only asked you to get a key.'])
            chat.say(hero, HERO, ['I didn\'t take that long, did I? It was like a whole other world in there.'])
            chat.say(man, MAN, ['Haha, I was only teasing! Anyway, are you ready to try the door again?'])
            chat.say(hero, HERO, ['Yep!'])
            chat.say(man, MAN, ['That\'s the spirit! Lead on!'])
        }

        if (key == 'staff2PASS1') {
            chat.say(man, MAN, ['Don\'t talk to me.'])
            return
        }

        if (key == 'staff2PASS2') {
            chat.say(man, MAN, ['Shoo! Go away!'])
            return
        }

        if (key == 'staff2PASS3') {
            chat.say(man, MAN, ['Did you hear me? Can you go please?'])
            return
        }

        if (key == 'staff2PASS4') {
            chat.say(man, MAN, ['Ugh, why do you have to make my job so hard?!'])
            chat.say(hero, HERO, ['And what is your job exactly?'])
            chat.say(man, MAN, ['To be a Member of Staff. It\'s a "profession" apparently.'])
            chat.say(hero, HERO, ['Oh. That sounds hard.'])
            chat.say(man, MAN, ['It is. So go away please. You\'re not helping.'])
            return
        }

        if (key == 'staff3PASS1') {
            chat.say(man, MAN, ['Oh, hello.'])
            chat.say(hero, HERO, ['Hi!'])
            return
        }

        if (key == 'staff3PASS2') {
            chat.say(man, MAN, ['What are you up to then?'])
            chat.say(hero, HERO, ['I\'m trying to get to the top of this tower. Am I nearly there?'])
            chat.say(man, MAN, ['Ha ha ha, you\'ve still got a way to go mate. Better get going eh?'])
            return
        }

        if (key == 'staff3PASS3') {
            chat.say(man, MAN, ['The world through that door is particularly difficult. You\'ll need to remember all your skills for it.'])
            chat.say(hero, HERO, ['Thank you, I think I\'ll be alright.'])
            chat.say(man, MAN, ['Have fun! And remember you can always get help by pressing that question mark button at the top right of the screen.'])
            return
        }

        if (key == 'staff4PASS1') {
            chat.say(man, MAN, ['Hi! Who are you?'])
            chat.say(hero, HERO, ['Hello! I\'m Io!'])
            chat.say(man, MAN, ['Cool. I like your name.'])
            return
        }

        if (key == 'staff4PASS2') {
            chat.say(man, MAN, ['This floor has the start of the Jungle World. Watch out for the crocodiles!'])
            chat.say(hero, HERO, ['Oh no! Are they bad?'])
            chat.say(man, MAN, ['You can avoid them if you\'re quick, but it\'s no good news if you get stuck.'])
            return
        }

        if (key == 'staff4PASS3') {
            chat.say(hero, HERO, ['Thanks for the tips. I\'ll try to be careful.'])
            chat.say(man, MAN, ['Oh, you\'ll be alright Io. Just need to be a bit cautious, huh?'])
            return
        }

        if (key == 'staff5PASS1') {
            chat.say(man, MAN, ['What are you doing, loser?'])
            chat.say(hero, HERO, ['I\'m not a loser.', 'I just want to save my friends and get out of here.'])
            chat.say(man, MAN, ['Pah! You\'re never going make it through in one piece. This is the tower of The Great Ominous!!!'])
            chat.say(hero, HERO, ['Who is the Great Ominous?'])
            chat.say(man, MAN, ['The worst evil corporation in existence. The society is currently made up of five members.', 'You\'ll never get past them.'])
            return
        }

        if (key == 'staff6PASS1') {
            chat.say(man, MAN, ['Hi there! I\'m Granite. What\'s your name?'])
            chat.say(hero, HERO, ['Hi! I\'m Io.'])
            chat.say(man, MAN, ['Ooh hello Io!'])
            chat.say(hero, HERO, ['Am I nearly at the top of this tower? I need to rescue my friends.'])
            chat.say(man, MAN, ['Yes! Your friends are in the floor just above us.'])
            chat.say(hero, HERO, ['Thank you! I\'d better get going now.'])
            chat.say(man, MAN, ['Good-bye! Come back soon!'])
            return
        }

        if (key == 'jungleMonkey') {
            chat.say(man, MAN, ['Hmm. Who are you down there?'])
            chat.say(hero, HERO, ['Hi! I\'m Io. Do you mind lending me the Teleport Key?'])
            chat.say(man, MAN, ['Hah, I\'m not going to give you that very easily. It\'s my only possesion!'])
            chat.say(hero, HERO, ['Oh, I\'m sorry. But it\'s really important. I need to save my friends!'])
            chat.say(man, MAN, ['Ugh! Why should I care about you and your friends? It can only mean trouble as far as I\'m concerned.', 'Prepare for revenge!'])
            return
        }

        if (key == 'cityStaff1') {
            chat.say(man, MAN, ['Hello there! Looking for the key? It\'s at the top of this building.'])
            chat.say(hero, HERO, ['Thanks for telling me! I\'ll go up there now.'])
            chat.say(man, MAN, ['Not at all. Can I come too? I\'ll take the elevator and you can take the stairs.'])
            chat.say(hero, HERO, ['Erm.. can\'t both of us take the elevator?'])
            chat.say(man, MAN, ['No no, it only holds one person at a time. And I\'ve got a bad knee.'])
            chat.say(hero, HERO, ['Ooh, okay then.'])
            return
        }

        if (key == 'cityStaff2') {
            chat.say(man, MAN, ['Race you to the top! On an count of three!', '3...', '2...', '1...', 'GO!'])
            return
        }

        if (key == 'youLoseCity') {
            chat.say(man, MAN, ['Aw, you were too slow! Maybe you\'ll do better next time.'])
            return
        }

        if (key == 'youWinCity') {
            chat.say(man, MAN, ['Wow, you did that fast!', 'Well done mate. Now off you go. Your friends need your help.'])
            return
        }

        if (key == 'Drillo1') {
            chat.say(hero, HERO, ['Drillo!!! I found you! Are you okay?'])
            chat.say(man, MAN, ['Hi, I\'m fine for now, but you need to act quickly. The Great Ominous have planned to lock me in the dungeons forever!'])
            chat.say(hero, HERO, ['Oh no! That\'s a bit drastic. I\'ll do what I can.'])
            chat.say(man, MAN, ['All the best! Please try hard! They... they\'re in the next room.'])
            chat.say(hero, HERO, ['I\'ve got this! Don\'t worry, I\'ll get you safe.'])
            chat.say(man, MAN, ['Thank you so much! Now go before it\'s too late!'])
            return
        }

        if (key == 'council') {
            chat.say(man[0], MAN, ['Aah, I do like a good headquarters I must say. Just the place for scheming evil plans.'])
            chat.say(man[1], MAN, ['Um... yes, captain.', 'The only trouble is we seem to be running out of evil things to do.'])
            chat.say(man[2], MAN, ['True, but that X-ray Orb of ours was a great success.', 'I still can\'t believe Drillo destroyed it that easily though.'])
            return
        }

        if (key == 'council2') {
            chat.say(man[0], MAN, ['OI!! What do you think you\'re doing??!!'])
            chat.say(hero, HERO, ['Oh, hi. Could you please unlock the prison doors? I need to save my friends.'])
            chat.say(man[0], MAN, ['Oh, the cheek of him! Simply outrageous. I can\'t cope with any more of Drillo\'s friends.'])
            chat.say(man[1], MAN, ['How did he even get up here?'])
            chat.say(man[0], MAN, ['Never mind that, my friend. Now\'s our chance to catch him off his guard.'])
            return
        }

        if (key == 'councilHaHa') {
            chat.say(man[1], MAN, ['Ha ha ha ha. Good one captain.'])
            chat.say(man[0], MAN, ['Heh. That was rather nifty of me wasn\'t it?', 'Anyway. We\'re going to be dealing with Drillo now.'])
            chat.say(man[0], MAN, ['But be warned: WE WILL BE BACK.'])
            return
        }

        if (key == 'ponderCage') {
            chat.say(hero, HERO, ['I need to get out of here fast.', 'I wonder if I could get the cage on the ground?'])
            return
        }

        if (key == 'prison1') {
            chat.say(man[0], MAN, ['It\'s about time we forgot about you Drillo. You\'ve been too much of a nuisance to stay.', 'Lead the way to the dungeons!'])
            chat.say(man[1], MAN, ['Ye... yes sir.'])
            return
        }

        if (key == 'prison2') {
            chat.say(hero, HERO, ['This is my chance!'])
            return
        }
    }
}

class Chat {
    constructor() {
        this.active = false
        this.alpha = 0
        this.fade = 'none'

        this.queue = []

        this.gap = 0
        this.height = 0
        this.border = 0
        this.pad = 0

        this.speaking = 0
        this.speakLine = 0
        this.rest = 30
        this.restTime = this.rest

        this.arrow = new Arrow(0, [0, 0, 0])
    }

    setFont() {
        ctx.font = box * .9 + 'px font, sans-serif'
    }

    setChatBox() {
        this.gap = .5 * box
        this.height = 4 * box
        this.border = .2 * box
        this.pad = .4 * box
    }

    // defines veriables for new speech
    newChat() {
        this.restTime = this.rest
        if (this.queue.length > 1) {
            this.queue.shift()

            this.setChatWords()

            this.speaking = 0
            this.speakLine = 0
        }
        else {
            this.fade = 'out'
            this.alpha = 1
        }
    }

    // resizes current speech and wraps text
    setChatWords() {
        if (this.queue.length) {
            this.fade = 'in'

            // get size of box
            this.setChatBox()
            this.setFont()
            const boxWidth = cvs.width - this.gap * 2 - this.border * 2 - this.pad * 2

            // get current phrase
            const phrase = this.queue[0].speech

            // prepare new phrase with line breaks
            let str = ''
            
            let currentLine = ''
            let currentWord = ''
            let amtOfLines = 0

            // go though phrase and split up into characters
            for (let j = 0; j < phrase.length; j ++) {
                let char = phrase[j]
                // remove old new lines (?)
                if (char == '\n') char = ' '

                // add character to entire speech and line
                str += char
                currentLine += char

                // get the word we're currently on
                if (char == ' ') currentWord = ''
                else currentWord += char

                if (ctx.measureText(currentLine).width > boxWidth) {
                    if (ctx.measureText(currentWord).width > boxWidth) {
                        str += '\n'
                        currentLine = ''
                    }
                    else {
                        // remove the start of the word from the first line
                        str = str.slice(0, str.length - currentWord.length - 1)

                        // add the start of the word to the second line
                        str += '\n' + currentWord

                        // also do this for the current line
                        currentLine = currentWord
                    }

                    amtOfLines ++
                }
            }

            // if there is too much writing in the box
            if (amtOfLines + 2 > this.height / box) {
                const dic = this.queue[0]
                const newSpeech = {color: dic.color, speaker: dic.speaker, speech: currentLine}
                // add new box
                this.queue.splice(1, 0, newSpeech)
                // remove the last bit of writing from the old box
                str = str.slice(0, str.length - currentLine.length - 1)
            }

            this.queue[0].speech = str
        }
    }

    // this function adds the new speech to the array
    say(speaker, color, speech) {
        this.active = true
        game.pause = true

        const dic = {color, speaker}

        // add each speech individually to the array
        for (let i = 0; i < speech.length; i ++)
            this.queue.push({color: dic.color, speaker: dic.speaker, speech: speech[i]})

        this.setChatWords()
    }

    update() {
        // move on to new speech when key is pressed
        const KEY = key.press || mp
        if (this.speaking > this.queue[0].speech.length)
            this.restTime -= dt
        if (KEY && this.restTime < 0) this.newChat()

        key.up = false
        key.down = false
        key.left = false
        key.right = false
        key.press = false
        mp = false

        if (this.fade == 'in') this.alpha += .2 * DT
        else if (this.fade == 'out') this.alpha -= .2 * DT

        cam.set(this.queue[0].speaker)

        if (this.alpha < 0) {
            this.active = false
            game.pause = false
            this.queue = []
            this.speaking = 0
            this.speakLine = 0
            cam.reset()
        }

        // draw chat
        else this.draw()
    }

    draw() {
        const chat = this.queue[0]

        // box
        const GAP = this.gap
        const HEIGHT = this.height
        const BORDER = this.border
        const PAD = this.pad

        // arrow
        if (this.arrow.col[3] != 0) {
            this.arrow.col = chat.color
            this.arrow.setCurr(chat.speaker)
            this.arrow.draw()
        }

        // speech box
        ctx.fillStyle = rgb(chat.color[0] - .2, chat.color[1] - .2, chat.color[2] - .2, this.alpha)
        ctx.fillRect(GAP, GAP, cvs.width - GAP * 2, HEIGHT)

        ctx.fillStyle = rgb(chat.color[0], chat.color[1], chat.color[2], this.alpha)
        ctx.fillRect(GAP + BORDER, GAP + BORDER, cvs.width - GAP * 2 - BORDER * 2, HEIGHT - BORDER * 2)

        if (this.restTime < this.rest) {
            ctx.fillStyle = rgb(.2, 0, 0, .5 + Math.sin(this.restTime / 5) * .5)
            const width = box * .2
            const height = box * .3
            for (let i = 0; i < 3; i ++) {
                const h = (i + 1) * height
                ctx.fillRect(
                    cvs.width - GAP * 2.5 - i * width,
                    HEIGHT - GAP - h / 2,
                    width, h)
            }
        }

        this.setFont()
        ctx.fillStyle = rgb(0, 0, 0, this.alpha)

        // type speech
        this.speaking += 1.2 * DT
        let letter = Math.floor(this.speaking)
        if (letter > chat.speech.length) letter = chat.speech.length
        else tone.play()
        let str = ''
        for (let i = 0; i < letter; i ++) str += chat.speech[i]

        // draw by going through every line
        const lines = str.split('\n')
        for (let i = 0; i < lines.length; i ++)
            ctx.fillText(lines[i], GAP + BORDER + PAD, GAP + BORDER + box * (i + 1))
    }
}