let boards;
let board;
let score = 0;
let started = false;
let timer = 0;
let maxTime = 0;
let seconds = '';
let boardSize = '9';
let gameMode = 'normal';
let correct = '';
let failed = false;
let startTime = 0;
let R, D, sx, sy, bx, by, wx, wy;
let halfStrokeWeight;

function preload() {
    seconds = prompt('Seconds per board: (leave empty for no timer)', window.localStorage.seconds || '')
    seconds = (seconds === '' || seconds === null) ? Infinity : round(parseInt(seconds))
    if (isNaN(seconds) || seconds <= 0) {seconds = Infinity}
    maxTime = (seconds === Infinity) ? Infinity : seconds * 1000
    window.localStorage.seconds = (seconds === Infinity) ? '' : seconds

    boardSize = prompt('Board size: 9, 13, 19, or random', window.localStorage.boardSize || '9')
    if (!['9', '13', '19', 'random'].includes(boardSize)) boardSize = '9'
    window.localStorage.boardSize = boardSize

    gameMode = prompt('Mode: normal or hardcore', window.localStorage.gameMode || 'normal')
    if (!['normal', 'hardcore'].includes(gameMode)) gameMode = 'normal'
    window.localStorage.gameMode = gameMode
}

function setup() {
    boards = {
        "9": boards9,
        "13": boards13,
        "19": boards19
    };

    createCanvas().mouseClicked(handleClick)
    
    ellipseMode(RADIUS)
    strokeCap(PROJECT)
    noStroke()
    score = 0
    started = false

    loadBoard()
}

function windowResized() {
    let bw = (board && board.width) ? board.width : (parseInt(boardSize) || 9)
    let bh = (board && board.height) ? board.height : (parseInt(boardSize) || 9)

    R = floor(min(window.innerWidth/(bw + 1), window.innerHeight/(bh + 3))/2)-1
    D = 2 * R
    let w = (bw + 1) * D
    let h = (bh + 3) * D
    halfStrokeWeight = ceil(D/70)
    strokeWeight(2 * halfStrokeWeight)

    sx = w/2
    sy = 1.5*R
    bx = w/2 - 2*D
    by = h - 1.5*R
    wx = w/2 + 2*D
    wy = h - 1.5*R
    
    resizeCanvas(w, h)
}

function draw() {
    clear()
    
    if (!board) return;

    push()
    stroke(0)
    translate(D, 2*D)

    for (let x = 0; x < board.width; x ++) {
        line(x * D, 0, x * D, (board.height - 1) * D)
    }

    for (let y = 0; y < board.height; y ++) {
        line(0, y * D, (board.width - 1) * D, y * D)
    }

    for (let x = 0; x < board.width; x ++) {
        for (let y = 0; y < board.height; y ++) {
            if (board[x][y]) {
                fill((board[x][y] === -1) * 255)
                circle(x * D, y * D, R - halfStrokeWeight)
            }
        }
    }
    pop()

    push()
    textSize(R)
    if (dist(mouseX, mouseY, 2*D, 0.5*R) < 1.5*R) textSize(R * 1.1)
    fill('black')
    textAlign(LEFT, CENTER)
    text('restart', 2*D, 1.2*R)

    push()
    fill('white')
    textSize(D)
    textAlign(CENTER, CENTER)
    textFont('courier')    
    text(score, width/2, 1.2*R)
    pop()

    textSize(R)
    if (dist(mouseX, mouseY, width - 2*D, 0.5*R) < 1.5*R) textSize(R * 1.1)
    fill('black')
    textAlign(RIGHT, CENTER)
    text('about', width - 2*D, 1.2*R)
    pop()

    push()
    let dx = map(timer, 0, maxTime, 0, width/2 - D)
    fill(255)
    stroke('white')
    strokeCap(ROUND)
    if (timer > 0 && maxTime !== Infinity) line(width/2 - dx, D, width/2 + dx, D)
    pop()

    if (timer > 0) {
        textAlign(CENTER, CENTER)

        fill('black')
        if (keyIsDown(LEFT_ARROW)) {
            textSize(D + 12)
        } else if (dist(mouseX, mouseY, bx, by) < D) {
            if (mouseIsPressed) textSize(D + 12)
            else textSize(D + 6)
        } else {
            textSize(D)
        }
        text('black', bx, by)
    
        fill('white')
        if (keyIsDown(RIGHT_ARROW)) {
            textSize(D + 12)
        } else if (dist(mouseX, mouseY, wx, wy) < D) {
            if (mouseIsPressed) textSize(D + 12)
            else textSize(D + 6)
        } else {
            textSize(D)
        }
        text('white', wx, wy)
        if (started && maxTime !== Infinity) {
            timer -= deltaTime
        }
        if (timer <= 0 && maxTime !== Infinity) {
            document.bgColor = "royalblue"
        }
    } else {
        textAlign(CENTER, CENTER)
        textSize(R)
        noStroke()
        fill(0, 200)
        let plurality = (score == 1) ? 'board' : 'boards'
        let displaySeconds = (seconds === Infinity) ? '' : seconds
        let hsKey = `highscore_${boardSize}_${gameMode}`
        let highscore = window.localStorage.getItem(hsKey) || 0
        let modeText = gameMode === 'hardcore' ? ' (hardcore)' : ''
        let sizeText = boardSize === 'random' ? 'random size' : boardSize + 'x' + boardSize

        let msg = `Game over!\nYou solved ${score} ${plurality} [${sizeText}${modeText}].`
        if (displaySeconds !== '') msg += `\n${displaySeconds}s per board.`
        msg += `\nHigh score: ${highscore}`

        text(msg, width/2, by)
    }
}

function loadBoard() {
    let size = boardSize
    if (size === 'random') {
        let availableSizes = Object.keys(boards).filter(s => boards[s].length > 0)
        size = random(availableSizes)
    }

    let boardList = boards[size]
    if (!boardList || boardList.length === 0) {
        alert("No boards found for size " + size + ". Falling back to 9x9.")
        boardList = boards['9']
    }

    let boardObj = random(boardList)
	let textBoard = boardObj.map.trim().split('\n').map(row => row.split(' '))
    board = {width: textBoard[0].length, height: textBoard.length}
    board.lead = boardObj.lead

	let flipX = random() < 0.5
	let flipY = random() < 0.5
	let transpose = (board.width == board.height) && (random() < 0.5)
    let invert = random() < 0.5

    let mapWinner = (board.lead === null || board.lead >= 0) ? "black" : "white";
    correct = invert ? (mapWinner === "black" ? "white" : "black") : mapWinner;

	for (let x = 0; x < board.width; x ++) {
        board[x] = {}
		for (let y = 0; y < board.height; y ++) {
			let a = flipX ? board.width - 1 - x : x
			let b = flipY ? board.height - 1 - y : y
			if (transpose) [a, b] = [b, a]
			board[x][y] = {'O':1,'X':-1,'.':0}[textBoard[b][a]] * (-1)**invert
        }
    }

    windowResized()

    failed = false
    document.bgColor = 'seagreen'
    startTime = millis()
    timer = maxTime
}

function handleClick() {
    if (dist(mouseX, mouseY, 2*D, 1.2*R) < R) {
        setup()
        return
    }

    if (dist(mouseX, mouseY, width - 2*D, 1.2*R) < R) {
        window.location.href = "about.html"
        return
    }
    if (timer > 0) {
        if (dist(mouseX, mouseY, bx, by) < D) {
            submit('black')
        } else if (dist(mouseX, mouseY, wx, wy) < D) {
            submit('white')
        }
    }
    
    mouseX = -1
    mouseY = -1
}

function submit(guess) {
    started = true
    if (guess === correct) {
        if (gameMode === 'hardcore') {
            let leadGuess = prompt(`How many points is ${guess} leading by?`)
            if (leadGuess === null) return; // Cancelled
            if (board.lead !== null && parseInt(leadGuess) !== Math.abs(board.lead)) {
                timer = -1
                document.bgColor = 'crimson'
                return
            }
        }
        score ++
        let hsKey = `highscore_${boardSize}_${gameMode}`
        let currentHS = parseInt(window.localStorage.getItem(hsKey) || '0')
        if (score > currentHS) {
            window.localStorage.setItem(hsKey, score)
        }
        if (maxTime !== Infinity) maxTime -= 1000
        loadBoard()
    } else {
        if (!failed) {
            timer = -1
            document.bgColor = 'crimson'
        }
    }
}

function keyPressed() {
    if (keyCode === ENTER) setup()
    if (timer > 0) {
        if (keyCode === LEFT_ARROW)  submit('black')
        if (keyCode === RIGHT_ARROW) submit('white')
    }
}

function mouseReleased() {
    return false
}

function touchEnded() {
    mouseX = -1
    mouseY = -1
}
