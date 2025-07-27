function preload() {
    seconds = prompt('Seconds per board: (leave empty for no timer)', window.localStorage.seconds || '')
    seconds = round(parseInt(seconds))
    if (!seconds || seconds <= 0) {seconds = Infinity}
    maxTime = seconds * 1000
    if (seconds == Infinity) seconds = ''
    window.localStorage.seconds = seconds
}

function setup() {
    createCanvas().mouseClicked(handleClick)
    windowResized()
    
    ellipseMode(RADIUS)
    strokeCap(PROJECT)
    noStroke()
    score = 0
    started = false

    loadBoard()
}

// Declare global variables at the top
let board = null;
let TEXT_SIZE = 16; // Will be calculated dynamically in windowResized()

function windowResized() {
    // Calculate canvas size based on board dimensions if board exists
    let boardWidth = board ? board.width : 9;  // Default to 9x9 if no board loaded yet
    let boardHeight = board ? board.height : 9;
    
    // Use full screen width, minimal horizontal margins
    let availableWidth = window.innerWidth;
    
    // Calculate standardized text size first (consistent across all elements)
    // Larger text on smaller screens for better readability
    let baseTextSize;
    if (window.innerWidth < 800) {
        baseTextSize = Math.max(18, Math.min(28, window.innerWidth / 20));
    } else {
        baseTextSize = Math.max(16, Math.min(24, window.innerWidth / 40));
    }
    TEXT_SIZE = baseTextSize;
    
    // Minimal margins to keep text as close to board as possible
    let topMargin = TEXT_SIZE * 1.3;     // Minimal space at top for text only
    let bottomMargin = TEXT_SIZE * 1.3;   // Minimal space for buttons only
    let sideMargin = Math.min(TEXT_SIZE * 0.2, 5);  // Almost no side spacing
    
    // Calculate maximum board size to fill available space
    let availableBoardWidth = availableWidth - (2 * sideMargin);
    let availableBoardHeight = window.innerHeight - topMargin - bottomMargin;
    
    // Calculate cell size based on available space and board dimensions
    let maxCellWidth = availableBoardWidth / boardWidth;
    let maxCellHeight = availableBoardHeight / boardHeight;
    
    // Use the smaller dimension to ensure board fits completely, but maximize usage
    let cellSize = min(maxCellWidth, maxCellHeight);
    
    // Ensure minimum cell size for playability, but prioritize using full width on small screens
    cellSize = Math.max(cellSize, 20); // Minimum 20px cells
    
    R = Math.floor(cellSize / 2) - 1;
    D = 2 * R;
    
    // Calculate actual canvas size to use full screen
    width = window.innerWidth;
    height = window.innerHeight;
    
    // Scale stroke weight proportionally to cell size
    halfStrokeWeight = Math.max(1, ceil(D/70));
    strokeWeight(2 * halfStrokeWeight);

    // Position UI elements based on calculated margins
    sx = width/2;
    
    // Position text extremely close to board edges with minimal distance
    sy = TEXT_SIZE * 0.8; // Very close to top edge
    let bottomY = height - TEXT_SIZE * 0.8; // Very close to bottom edge
    by = bottomY;
    wy = bottomY;
    
    // Position restart and about buttons closer to center like the bottom buttons
    let topButtonSpacing = Math.max(TEXT_SIZE * 6, width * 0.3);
    restartX = width/2 - topButtonSpacing/2;
    aboutX = width/2 + topButtonSpacing/2;
    
    // Position game buttons in bottom margin, ensuring they don't overlap
    let buttonSpacing = Math.max(TEXT_SIZE * 4, D * 1.5);
    bx = width/2 - buttonSpacing/2;
    wx = width/2 + buttonSpacing/2;
    
    resizeCanvas(width, height);
}

function draw() {
    clear()
    
    // Only draw if board is loaded
    if (!board) return;
    
    push()
    stroke(0)
    // Center the board within the available game area (excluding UI margins)
    let boardPixelWidth = (board.width - 1) * D
    let boardPixelHeight = (board.height - 1) * D
    
    // Calculate top and bottom margins for UI elements (match windowResized values)
    let topMargin = TEXT_SIZE * 1.3;     // Minimal space at top for text only
    let bottomMargin = TEXT_SIZE * 1.3;   // Minimal space for buttons only
    
    // Center the board horizontally on screen
    let offsetX = (width - boardPixelWidth) / 2
    
    // Center the board vertically in the available space between UI elements
    let availableGameHeight = height - topMargin - bottomMargin
    let offsetY = topMargin + (availableGameHeight - boardPixelHeight) / 2
    
    translate(offsetX, offsetY)

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
    textAlign(CENTER, CENTER)
    textSize(TEXT_SIZE)
    if (dist(mouseX, mouseY, restartX, sy) < TEXT_SIZE * 1.5) textSize(TEXT_SIZE * 1.1)
    fill('black')
    text('RESTART', restartX, sy)

    push()
    textAlign(CENTER, CENTER)
    fill('white')
    textSize(TEXT_SIZE * 1.8)  // Significantly larger score for all screen sizes
    textFont('courier')    
    text(score, width/2, sy)
    pop()

    textAlign(CENTER, CENTER)
    textSize(TEXT_SIZE)
    if (dist(mouseX, mouseY, aboutX, sy) < TEXT_SIZE * 1.5) textSize(TEXT_SIZE * 1.1)
    fill('black')
    text('ABOUT', aboutX, sy)
    pop()

    push()

    let dx = map(timer, 0, maxTime, 0, width/2 - D)
    
    fill(255)
    stroke('white')
    strokeCap(ROUND)
    if (timer > 0) line(width/2 - dx, D, width/2 + dx, D)
    pop()

    
    if (timer > 0) {
        
        textAlign(CENTER, CENTER)

        fill('black')
        if (keyIsDown(LEFT_ARROW)) {
            textSize(TEXT_SIZE * 1.4)
        } else if (dist(mouseX, mouseY, bx, by) < TEXT_SIZE * 2) {
            if (mouseIsPressed) textSize(TEXT_SIZE * 1.4)
            else textSize(TEXT_SIZE * 1.2)
        } else {
            textSize(TEXT_SIZE)
        }
        text('BLACK', bx, by)
    
        fill('white')
        if (keyIsDown(RIGHT_ARROW)) {
            textSize(TEXT_SIZE * 1.4)
        } else if (dist(mouseX, mouseY, wx, wy) < TEXT_SIZE * 2) {
            if (mouseIsPressed) textSize(TEXT_SIZE * 1.4)
            else textSize(TEXT_SIZE * 1.2)
        } else {
            textSize(TEXT_SIZE)
        }
        text('WHITE', wx, wy)
        if (started) {
            timer -= deltaTime
        }
        if (timer <= 0) {
            document.bgColor = "royalblue"
        }
    } else {
        textAlign(CENTER, CENTER)
        textSize(TEXT_SIZE)
        noStroke()
        fill(0, 200)
        let plurality = (score == 1) ? 'board' : 'boards'
        if (seconds == '') {
            text(`Game over!\nYou solved ${score} ${plurality}.`, width/2, by)
        } else {
            text(`Game over!\nYou solved ${score} ${plurality} in ${seconds}s per board.`, width/2, by)
        }
        
    }

}

function loadBoard() {
    let textBoard = random(boards).split('\n').map(row => row.split(' '))
    board = {width: textBoard[0].length, height: textBoard.length}

    let flipX = random() < 0.5
    let flipY = random() < 0.5
    let transpose = (board.width == board.height) && (random() < 0.5)
    let invert = random() < 0.5
    correct = invert ? "white" : "black"

    for (let x = 0; x < board.width; x ++) {
        board[x] = {}
        for (let y = 0; y < board.height; y ++) {
            let a = flipX ? board.width - 1 - x : x
            let b = flipY ? board.height - 1 - y : y
            if (transpose) [a, b] = [b, a]
            board[x][y] = {'O':1,'X':-1,'.':0}[textBoard[b][a]] * (-1)**invert
        }
    }
    failed = false
    document.bgColor = 'seagreen'
    startTime = millis()
    timer = maxTime
    
    // Resize canvas to fit the new board dimensions
    windowResized()
}

function handleClick() {
    // Check restart button click (now centered)
    if (dist(mouseX, mouseY, restartX, sy) < TEXT_SIZE * 1.5) {
        setup()
    }

    // Check about button click (now centered) 
    if (dist(mouseX, mouseY, aboutX, sy) < TEXT_SIZE * 1.5) {
        window.location.href = "/about"
    }
    
    // Check game buttons (BLACK/WHITE) when timer is active
    if (timer > 0) {
        if (dist(mouseX, mouseY, bx, by) < TEXT_SIZE * 2) {
            submit('black')
        } else if (dist(mouseX, mouseY, wx, wy) < TEXT_SIZE * 2) {
            submit('white')
        }
    }
    
    mouseX = -1
    mouseY = -1
}

function submit(guess) {
    started = true
    if (guess === correct) {
        score ++
        maxTime -= 1000
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
