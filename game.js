// SELECT CVS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

let frames = 0;
const DEGREE = Math.PI / 180;
let paused = false;

const state = {
    current: 0,
    menu: -1,
    getReady: 0,
    game: 1,
    over: 2,
    success: 3
};

let speedMode = 'moderate';
const speedModes = {
    slow: 1,
    moderate: 2,
    god: 4
};

// LOAD IMAGE
const birdImg = new Image();
birdImg.src = "https://i.imgur.com/N4N3nHn.png"; 

// Lecture Selection
const lectures = {
    Lecture2: [
        {
            question: "The primary purpose of MapReduce?",
            options: [
                "Create graphical user interfaces",
                "Simplify distributed computing on large datasets"
            ],
            answer: 1
        },
        {
            question: "NOT a challenge addressed by MapReduce?",
            options: [
                "Handling machine failures",
                "Writing sequential programs"
            ],
            answer: 1
        },
        {
            question: "In word count, the map function emits...",
            options: [
                "(word, 1)",
                "(document name, word count)"
            ],
            answer: 0
        },
        {
            question: "The role of the 'shuffle and sort' phase?",
            options: [
                "Group values with the same key",
                "Randomize the input data"
            ],
            answer: 0
        },
        {
            question: "File system used with Hadoop is...",
            options: [
                "HDFS",
                "NTFS"
            ],
            answer: 0
        },
        {
            question: "What is a combiner in MapReduce?",
            options: [
                "A function to pre-aggregate values",
                "A tool to merge input files"
            ],
            answer: 0
        },
        {
            question: "MapReduce handles machine failures by...",
            options: [
                "Rescheduling failed tasks",
                "Ignoring failed tasks"
            ],
            answer: 0
        },
        {
            question: "The phase that processes values with a key?",
            options: [
                "Reduce",
                "Map",
                "Shuffle"
            ],
            answer: 0
        },
        {
            question: "What is the purpose of partitioning?",
            options: [
                "Control which reducers process keys",
                "Split input into equal chunks",
                "Sort keys alphabetically"
            ],
            answer: 0
        },
        {
            question: "An alternative to disk-based MapReduce?",
            options: [
                "Spark",
                "MySQL",
                "Hadoop DFS"
            ],
            answer: 0
        }
    ],
    Lecture3: [
        {
            question: "A major challenge in data mining is...",
            options: [
                "Random access to all data",
                "Handling streaming and real-time data",
                "Easy labeling of training data"
            ],
            answer: 1
        },
        {
            question: "What does the Map step in MapReduce do?",
            options: [
                "Extracts key data pieces",
                "Aggregates data values",
                "Stores output in HDFS"
            ],
            answer: 0
        },
        {
            question: "What does edit distance measure?",
            options: [
                "Vector angle",
                "Edits to turn one string into another",
                "Sum of vector differences"
            ],
            answer: 1
        },
        {
            question: "What does Jaccard distance compare?",
            options: [
                "Similarity between sets",
                "Length of strings"
            ],
            answer: 0
        },
        {
            question: "Why is naive duplicate search slow?",
            options: [
                "It skips some documents",
                "It compares all pairs"
            ],
            answer: 1
        },
        {
            question: "What is the idea of LSH?",
            options: [
                "Store large files efficiently",
                "Hash similar items into the same bucket"
            ],
            answer: 1
        },
        {
            question: "What does MinHash estimate?",
            options: [
                "Cosine distance",
                "Jaccard similarity"
            ],
            answer: 1
        }
    ]
};

let currentLecture = null;

// Pause Button UI
const pauseBtn = {
    x: cvs.width - 50,
    y: 10,
    w: 30,
    h: 30,
    draw: function () {
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "#ecf0f1";
        ctx.fillRect(this.x + 6, this.y + 5, 5, 20);
        ctx.fillRect(this.x + 18, this.y + 5, 5, 20);
    },
    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.w &&
               mouseY >= this.y && mouseY <= this.y + this.h;
    }
};

// Lecture Selection Buttons
const lectureButtons = {
    Lecture2: {
        x: cvs.width / 2 - 150,
        y: cvs.height / 2 - 50,
        w: 300,
        h: 50,
        text: "Lecture 2 - MapReduce"
    },
    Lecture3: {
        x: cvs.width / 2 - 150,
        y: cvs.height / 2 + 20,
        w: 300,
        h: 50,
        text: "Lecture 3 - Approximate Retrieval I"
    },
    draw: function () {
        ctx.fillStyle = "#ff69b4"; // pink for Lecture 2
        ctx.fillRect(this.Lecture2.x, this.Lecture2.y, this.Lecture2.w, this.Lecture2.h);
        ctx.fillStyle = "#ff69b4"; // pink for Lecture 3
        ctx.fillRect(this.Lecture3.x, this.Lecture3.y, this.Lecture3.w, this.Lecture3.h);

        ctx.fillStyle = "#ecf0f1";
        ctx.font = "15px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText(this.Lecture2.text, this.Lecture2.x + this.Lecture2.w / 2, this.Lecture2.y + 32);
        ctx.fillText(this.Lecture3.text, this.Lecture3.x + this.Lecture3.w / 2, this.Lecture3.y + 32);
        ctx.textAlign = "start";
    },
    isClicked(mouseX, mouseY) {
        if (mouseX >= this.Lecture2.x && mouseX <= this.Lecture2.x + this.Lecture2.w &&
            mouseY >= this.Lecture2.y && mouseY <= this.Lecture2.y + this.Lecture2.h) {
            return "Lecture2";
        }
        if (mouseX >= this.Lecture3.x && mouseX <= this.Lecture3.x + this.Lecture3.w &&
            mouseY >= this.Lecture3.y && mouseY <= this.Lecture3.y + this.Lecture3.h) {
            return "Lecture3";
        }
        return null;
    }
};

cvs.addEventListener("click", function (evt) {
    const rect = cvs.getBoundingClientRect();
    const clickX = evt.clientX - rect.left;
    const clickY = evt.clientY - rect.top;

    if (state.current === state.menu) {
        const selectedLecture = lectureButtons.isClicked(clickX, clickY);
        if (selectedLecture) {
            currentLecture = selectedLecture;
            challenges.labels = lectures[selectedLecture];
            score.totalQuestions = challenges.labels.length;
            state.current = state.getReady;
            return;
        }
    }

    if (pauseBtn.isClicked(clickX, clickY)) {
        paused = !paused;
        return;
    }

    if (paused) return;

    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            challenges.forceNextQuestion();
            break;
        case state.game:
            if (objj.y - objj.height/2 <= 0) return;
            objj.flap();
            FLAP.play();
            break;
        case state.success:
            popup.style.display = "none";
            challenges.reset();
            objj.speedReset();
            objj.y = 150;
            score.reset();
            state.current = state.getReady;
            frames = 0;
            break;
    }
});

// Speed mode selection UI
const speedMenu = document.createElement("div");
speedMenu.style.position = "fixed";
speedMenu.style.top = "10px";
speedMenu.style.left = "10px";
speedMenu.style.zIndex = 1001;
speedMenu.style.background = "#ecf0f1";
speedMenu.style.padding = "5px 10px";
speedMenu.style.borderRadius = "8px";
speedMenu.style.boxShadow = "0 0 5px rgba(0,0,0,0.2)";
speedMenu.style.fontFamily = "'Segoe UI', sans-serif";
speedMenu.innerHTML = '<label style="margin-right:5px;">Speed:</label>';

const speedSelect = document.createElement("select");
speedSelect.style.fontSize = "14px";
speedSelect.style.padding = "3px 5px";
["slow", "moderate", "god"].forEach(mode => {
    const option = document.createElement("option");
    option.value = mode;
    option.text = mode.charAt(0).toUpperCase() + mode.slice(1);
    speedSelect.appendChild(option);
});
speedSelect.value = speedMode;
speedSelect.onchange = function () {
    speedMode = this.value;
    challenges.dx = speedModes[speedMode];
};
speedMenu.appendChild(speedSelect);
document.body.appendChild(speedMenu);

// LOAD SOUNDS
const SCORE_S = new Audio("audio/sfx_point.wav");
const FLAP = new Audio("audio/sfx_flap.wav");
const SWOOSHING = new Audio("audio/sfx_swooshing.wav");
const HIT = new Audio("audio/sfx_hit.wav");
const DIE = new Audio("audio/sfx_die.wav");
const WIN = new Audio("audio/sfx_win.wav");

// POPUP
const popup = document.createElement("div");
popup.id = "gamePopup";
popup.style.position = "fixed";
popup.style.top = "50%";
popup.style.left = "50%";
popup.style.transform = "translate(-50%, -50%)";
popup.style.background = "rgba(255, 255, 255, 0.95)";
popup.style.border = "2px solid #16a085";
popup.style.padding = "20px 30px";
popup.style.zIndex = 1000;
popup.style.display = "none";
popup.style.textAlign = "center";
popup.style.borderRadius = "10px";
popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
popup.style.fontFamily = "'Segoe UI', Verdana, sans-serif";

const popupText = document.createElement("p");
popupText.style.marginBottom = "15px";
popupText.style.fontSize = "16px";
popupText.style.color = "#2c3e50";

const buttonContainer = document.createElement("div");
buttonContainer.style.display = "flex";
buttonContainer.style.justifyContent = "center";
buttonContainer.style.gap = "10px";

const restartButton = document.createElement("button");
restartButton.innerText = "Restart";
restartButton.style.background = "#1abc9c";
restartButton.style.color = "white";
restartButton.style.border = "none";
restartButton.style.padding = "10px 20px";
restartButton.style.borderRadius = "5px";
restartButton.style.fontSize = "16px";
restartButton.style.cursor = "pointer";

const menuButton = document.createElement("button");
menuButton.innerText = "Menu";
menuButton.style.background = "#3498db";
menuButton.style.color = "white";
menuButton.style.border = "none";
menuButton.style.padding = "10px 20px";
menuButton.style.borderRadius = "5px";
menuButton.style.fontSize = "16px";
menuButton.style.cursor = "pointer";

restartButton.onclick = function () {
    popup.style.display = "none";
    challenges.reset();
    objj.speedReset();
    objj.y = 150;
    score.reset();
    state.current = state.getReady;
    frames = 0;
};

menuButton.onclick = function () {
    popup.style.display = "none";
    challenges.reset();
    objj.speedReset();
    objj.y = 150;
    score.reset();
    state.current = state.menu;
    frames = 0;
};

buttonContainer.appendChild(restartButton);
buttonContainer.appendChild(menuButton);
popup.appendChild(popupText);
popup.appendChild(buttonContainer);
document.body.appendChild(popup);

function showPopup(message, isSuccess = false) {
    // Set styles based on success/failure
    if (isSuccess) {
        // Victory styling - golden theme
        popup.style.border = "3px solid #f1c40f";
        popup.style.background = "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,248,220,0.95) 100%)";
        popup.style.boxShadow = "0 0 25px rgba(241, 196, 15, 0.5)";
        popupText.style.color = "#27ae60";
        restartButton.style.background = "linear-gradient(to bottom, #f1c40f, #f39c12)";
        restartButton.style.boxShadow = "0 4px 0 #d35400";
        menuButton.style.background = "linear-gradient(to bottom, #3498db, #2980b9)";
        WIN.play();
    } else {
        // Regular styling - teal theme
        popup.style.border = "3px solid #16a085";
        popup.style.background = "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(236, 240, 241,0.95) 100%)";
        popup.style.boxShadow = "0 0 25px rgba(22, 160, 133, 0.3)";
        popupText.style.color = "#2c3e50";
        restartButton.style.background = "linear-gradient(to bottom, #1abc9c, #16a085)";
        restartButton.style.boxShadow = "0 4px 0 #27ae60";
        menuButton.style.background = "linear-gradient(to bottom, #3498db, #2980b9)";
    }
    
    // Set popup content with improved formatting
    popupText.innerHTML = `
        ${message}
        <br><br>
        <div style="
            background: rgba(0,0,0,0.03);
            padding: 12px;
            border-radius: 8px;
            margin: 10px 0;
        ">
            <strong>
                Score: <span style="color: #e74c3c">${score.value}</span>/${score.totalQuestions}<br>
                XP: <span style="color: #e67e22">${score.xp}</span><br>
                Best XP: <span style="color: #9b59b6">${score.bestXP}</span>
            </strong>
        </div>
    `;
    
    popup.style.display = "block";
}

const objj = {
    x: 50,
    y: 150,
    width: 60,
    height: 70,
    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,
    invincibleFrames: 0,
    draw() {
        if (!birdImg.complete) {
            // Fallback to circle if image isn't loaded yet
            ctx.fillStyle = "#f1c40f";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw the image centered
        ctx.drawImage(
            birdImg, 
            -this.width/2, 
            -this.height/2, 
            this.width, 
            this.height
        );
        
        ctx.restore();
        
        // Optional: Add shadow effect
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(
            this.x, 
            this.y + this.height/2 + 5, 
            this.width/4, 
            this.height/8, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
    },
    flap() {
        this.speed = -this.jump;
    },
    update() {
        if (this.invincibleFrames > 0) this.invincibleFrames--;

        this.speed += this.gravity;
        this.y += this.speed;

        if (this.y + this.height/2 >= cvs.height - fg.h) {
            this.y = cvs.height - fg.h - this.height/2;
            if (state.current === state.game || state.current === state.getReady) {
                state.current = state.over;
                DIE.play();
                score.updateBestXP();
                showPopup("Game Over! " + (challenges.lastCorrectAnswerText ? "Correct: " + challenges.lastCorrectAnswerText : ""));
            }
        }

        this.rotation = this.speed >= this.jump ? 90 * DEGREE : -25 * DEGREE;
    },
    speedReset() {
        this.speed = 0;
        this.invincibleFrames = 0;
        this.rotation = 0;
    }
};

const challenges = {
    sets: [],
    labels: [],
    currentQuestionText: null,
    lastCorrectAnswerText: null,
    missedLastQuestion: false,
    h: 40,
    dx: speedModes[speedMode],
    gap: 30,
    questionDelay: 90,
    currentDelay: 0,
    showingQuestion: false,
    skippedQuestions: 0,
    
    draw() {
        this.sets.forEach(set => {
            set.options.forEach(block => {
                ctx.fillStyle = "#34495e";
                ctx.roundRect(block.x, block.y, block.w, this.h, 8);
                ctx.fillStyle = "#ecf0f1";
                ctx.font = "12px 'Segoe UI'";
                ctx.fillText(block.text, block.x + 10, block.y + 25);
            });
        });
    },
    
    update() {
        if (state.current !== state.game) return;

        if (this.showingQuestion) {
            this.currentDelay--;
            if (this.currentDelay <= 0) {
                this.showingQuestion = false;
                this.createAnswerBlocks();
            }
            return;
        }

        for (let i = 0; i < this.sets.length; i++) {
            let set = this.sets[i];
            for (let block of set.options) {
                block.x -= this.dx;

                if (
                    objj.x + objj.width/2 > block.x &&
                    objj.x - objj.width/2 < block.x + block.w &&
                    objj.y + objj.height/2 > block.y &&
                    objj.y - objj.height/2 < block.y + this.h
                ) {
                    if (block.correct && objj.invincibleFrames === 0) {
                        SCORE_S.play();
                        score.value++;
                        score.xp += 10;
                        objj.invincibleFrames = 30;
                        this.sets.splice(i, 1);
                        this.currentQuestionText = null;
                        
                        // Check if all questions answered correctly
                        if (score.value === score.totalQuestions) {
                            state.current = state.success;
                            score.updateBestXP();
                            showPopup("Congratulations! You answered all questions correctly!", true);
                            return;
                        }
                        
                        this.forceNextQuestion();
                        return;
                    } else if (!block.correct && objj.invincibleFrames === 0) {
                        state.current = state.over;
                        HIT.play();
                        DIE.play();
                        score.updateBestXP();
                        showPopup("Wrong! Correct: " + this.lastCorrectAnswerText);
                        return;
                    }
                }
            }

            if (set.options[0].x + set.options[0].w < 0) {
                this.skippedQuestions++;
                score.xp -= 15;
                DIE.play(); // Play die sound when XP is subtracted
                this.sets.splice(i, 1);
                i--;
                this.missedLastQuestion = true;
            }
        }

        if (this.sets.length === 0 && !this.showingQuestion) {
            this.forceNextQuestion();
        }
    },
    
    createAnswerBlocks() {
        const currentLabel = this.labels.find(label => label.question === this.currentQuestionText);
        if (!currentLabel) return;

        let baseX = cvs.width;
        let centerY = Math.random() * (cvs.height - fg.h - 150) + 50;
        let options = [];

        for (let i = 0; i < currentLabel.options.length; i++) {
            ctx.font = "12px 'Segoe UI'";
            const text = currentLabel.options[i];
            const textWidth = ctx.measureText(text).width;
            const padding = 20;
            const boxWidth = textWidth + padding;

            options.push({
                x: baseX,
                y: centerY + (i - 1) * (this.h + this.gap),
                text,
                correct: i === currentLabel.answer,
                w: boxWidth
            });
        }

        this.sets.push({ question: currentLabel.question, options });
    },
    
    reset() {
        this.sets = [];
        this.currentQuestionText = null;
        this.lastCorrectAnswerText = null;
        this.missedLastQuestion = false;
        this.showingQuestion = false;
        this.currentDelay = 0;
        this.skippedQuestions = 0;
    },
    
    forceNextQuestion() {
        let remainingLabels = this.labels.filter(label => !this.sets.some(set => set.question === label.question));
        if (remainingLabels.length === 0) remainingLabels = this.labels;
        let label = remainingLabels[Math.floor(Math.random() * remainingLabels.length)];
        
        this.currentQuestionText = label.question;
        this.lastCorrectAnswerText = label.options[label.answer];
        this.showingQuestion = true;
        this.currentDelay = this.questionDelay;
    }
};

CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    this.fill();
};

const fg = {
    y: cvs.height - 112,
    h: 112,
    draw() {
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(0, this.y, cvs.width, this.h);

        if (challenges.currentQuestionText) {
            ctx.font = "16px 'Segoe UI'";
            ctx.textAlign = "center";
            const text = challenges.currentQuestionText;
            const padding = 10;
            const textWidth = ctx.measureText(text).width;

            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(cvs.width / 2 - textWidth / 2 - padding, this.y + this.h / 2 - 14, textWidth + 2 * padding, 28);

            ctx.fillStyle = "#ecf0f1";
            ctx.fillText(text, cvs.width / 2, this.y + this.h / 2 + 6);
            ctx.textAlign = "start";
        }
    }
};

const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    bestXP: parseInt(localStorage.getItem("bestXP")) || 0,
    value: 0,
    xp: 0,
    totalQuestions: 0,
    draw() {
        ctx.font = "18px 'Segoe UI'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Score: " + this.value + "/" + this.totalQuestions, 20, 30);
        ctx.fillText("XP: " + this.xp, 20, 60);
    },
    reset() {
        this.updateBestXP();
        this.value = 0;
        this.xp = 0;
        this.totalQuestions = challenges.labels.length;
    },
    updateBest() {
        if (this.value > this.best) {
            this.best = this.value;
            localStorage.setItem("best", this.best);
        }
    },
    updateBestXP() {
        if (this.xp > this.bestXP) {
            this.bestXP = this.xp;
            localStorage.setItem("bestXP", this.bestXP);
        }
    }
};

function drawMenu() {
    // Background
    ctx.fillStyle = "#2c3e50"; // Dark blue-gray
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Title Shadow
    ctx.font = "bold 48px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillText("Select Lecture", cvs.width / 2 + 3, cvs.height / 2 - 97);

    // Title Text
    ctx.fillStyle = "#ecf0f1"; // Light gray
    ctx.fillText("Select Lecture", cvs.width / 2, cvs.height / 2 - 100);

    // Optional divider line
    ctx.strokeStyle = "#7f8c8d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cvs.width / 2 - 100, cvs.height / 2 - 50);
    ctx.lineTo(cvs.width / 2 + 100, cvs.height / 2 - 50);
    ctx.stroke();

    // Draw the lecture buttons
    lectureButtons.draw();
}

function draw() {
    if (state.current === state.menu) {
        drawMenu();
        return;
    }

    // Game background
    ctx.fillStyle = "#3498db";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Game elements
    challenges.draw();
    fg.draw();
    objj.draw();
    score.draw();
    pauseBtn.draw();

    // Pause overlay
    if (paused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        ctx.fillStyle = "#ecf0f1";
        ctx.font = "20px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("Paused", cvs.width / 2, cvs.height / 2);
        ctx.textAlign = "start";
    }
}

function update() {
    if (
        paused ||
        state.current === state.over ||
        state.current === state.success ||
        state.current === state.menu
    )
        return;

    objj.update();
    challenges.update();
}

function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

// Initialize game with menu
state.current = state.menu;
loop();