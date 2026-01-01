class KidsGame {
    constructor() {
        this.score = 0;
        this.currentGame = null;
        this.questionCount = 0;
        this.playerName = '';
        this.gameScores = { numbers: 0, letters: 0, colors: 0, shapes: 0 };
        this.init();
    }

    init() {
        const lastPlayer = localStorage.getItem('lastPlayer');
        if (lastPlayer) {
            this.playerName = lastPlayer;
            this.loadPlayerData();
            this.showMenu();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
    }

    login() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        if (name) {
            this.playerName = name;
            localStorage.setItem('lastPlayer', name);
            this.loadPlayerData();
            this.showMenu();
        }
    }

    logout() {
        localStorage.removeItem('lastPlayer');
        this.playerName = '';
        this.score = 0;
        this.gameScores = { numbers: 0, letters: 0, colors: 0, shapes: 0 };
        this.showLogin();
    }

    loadPlayerData() {
        const allPlayers = JSON.parse(localStorage.getItem('allPlayersData') || '{}');
        if (this.playerName && allPlayers[this.playerName]) {
            this.gameScores = allPlayers[this.playerName].gameScores;
            this.score = allPlayers[this.playerName].totalScore || 0;
        }
    }

    savePlayerData() {
        const allPlayers = JSON.parse(localStorage.getItem('allPlayersData') || '{}');
        const totalScore = Object.values(this.gameScores).reduce((a, b) => a + b, 0);
        
        allPlayers[this.playerName] = {
            gameScores: this.gameScores,
            totalScore: totalScore
        };
        
        localStorage.setItem('allPlayersData', JSON.stringify(allPlayers));
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('playerNameDisplay').textContent = `Hello, ${this.playerName}! ??`;
    }

    updateScoresTable() {
        const tbody = document.getElementById('scoresBody');
        tbody.innerHTML = '';
        
        const allPlayers = JSON.parse(localStorage.getItem('allPlayersData') || '{}');
        
        // Current player total
        const currentTotal = Object.values(this.gameScores).reduce((a, b) => a + b, 0);
        const currentRow = tbody.insertRow();
        currentRow.innerHTML = `
            <td><strong>?? ${this.playerName}</strong></td>
            <td><strong>${currentTotal}</strong></td>
        `;
        
        // Other players totals
        Object.keys(allPlayers)
            .filter(p => p !== this.playerName)
            .sort((a, b) => {
                const totalA = Object.values(allPlayers[a].gameScores).reduce((x, y) => x + y, 0);
                const totalB = Object.values(allPlayers[b].gameScores).reduce((x, y) => x + y, 0);
                return totalB - totalA;
            })
            .forEach(playerName => {
                const playerTotal = Object.values(allPlayers[playerName].gameScores).reduce((a, b) => a + b, 0);
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${playerName}</td>
                    <td>${playerTotal}</td>
                `;
            });
    }

    showMenu() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('menuScreen').style.display = 'block';
        document.getElementById('gameScreen').style.display = 'none';
        this.updateScore();
        this.updateScoresTable();
    }

    startGame(gameType) {
        this.currentGame = gameType;
        this.questionCount = 0;
        document.getElementById('menuScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        this.generateQuestion();
    }

    backToMenu() {
        this.showMenu();
        this.currentGame = null;
    }

    generateQuestion() {
        this.questionCount++;
        const questionEl = document.getElementById('question');
        const answersEl = document.getElementById('answersGrid');
        const feedbackEl = document.getElementById('feedback');
        
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
        
        let question, answers, correctAnswer;

        switch(this.currentGame) {
            case 'numbers':
                ({ question, answers, correctAnswer } = this.generateNumberQuestion());
                break;
            case 'letters':
                ({ question, answers, correctAnswer } = this.generateLetterQuestion());
                break;
            case 'colors':
                ({ question, answers, correctAnswer } = this.generateColorQuestion());
                break;
            case 'shapes':
                ({ question, answers, correctAnswer } = this.generateShapeQuestion());
                break;
        }

        questionEl.innerHTML = question;
        this.renderAnswers(answers, correctAnswer, { question, answers, correctAnswer });
    }

    generateNumberQuestion() {
        const types = ['addition', 'subtraction', 'counting', 'comparison'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        switch(type) {
            case 'addition':
                const a = Math.floor(Math.random() * 4) + 1;
                const b = Math.floor(Math.random() * 4) + 1;
                const sum = a + b;
                return {
                    question: `?? What is ${a} + ${b}?`,
                    answers: this.generateUniqueOptions(sum, 1, 8, 4),
                    correctAnswer: sum
                };
            
            case 'subtraction':
                const x = Math.floor(Math.random() * 6) + 4;
                const y = Math.floor(Math.random() * (x-1)) + 1;
                const diff = x - y;
                return {
                    question: `? What is ${x} - ${y}?`,
                    answers: this.generateUniqueOptions(diff, 0, 7, 4),
                    correctAnswer: diff
                };
            
            case 'counting':
                const count = Math.floor(Math.random() * 6) + 2;
                const emojis = ['??', '?', '??', '??', '??'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                const items = Array(count).fill(emoji).join(' ');
                return {
                    question: `?? How many ${emoji}?<br>${items}`,
                    answers: this.generateUniqueOptions(count, 1, 8, 4),
                    correctAnswer: count
                };
            
            case 'comparison':
                const num1 = Math.floor(Math.random() * 7) + 1;
                let num2 = Math.floor(Math.random() * 7) + 1;
                while(num2 === num1) num2 = Math.floor(Math.random() * 7) + 1;
                const bigger = Math.max(num1, num2);
                return {
                    question: `?? Which is bigger?`,
                    answers: [num1, num2],
                    correctAnswer: bigger
                };
        }
    }

    generateLetterQuestion() {
        const types = ['uppercase', 'phonics', 'alphabet'];
        const type = types[Math.floor(Math.random() * types.length)];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        switch(type) {
            case 'uppercase':
                const randomIndex = Math.floor(Math.random() * 10);
                const lowerLetter = letters[randomIndex].toLowerCase();
                const upperLetter = letters[randomIndex];
                return {
                    question: `?? Find the BIG letter for "${lowerLetter}"`,
                    answers: this.generateUniqueLetters(upperLetter, 4),
                    correctAnswer: upperLetter
                };
            
            case 'phonics':
                const phonics = {
                    'A': '??', 'B': '??', 'C': '??', 'D': '??',
                    'E': '??', 'F': '??', 'G': '??', 'H': '??'
                };
                const phoneticKeys = Object.keys(phonics);
                const phoneticLetter = phoneticKeys[Math.floor(Math.random() * phoneticKeys.length)];
                return {
                    question: `?? ${phonics[phoneticLetter]} starts with?`,
                    answers: this.generateUniqueLetters(phoneticLetter, 4),
                    correctAnswer: phoneticLetter
                };
            
            case 'alphabet':
                const alphabetIndex = Math.floor(Math.random() * 8) + 1;
                const nextLetter = letters[alphabetIndex];
                const prevLetter = letters[alphabetIndex - 1];
                return {
                    question: `?? What comes after "${prevLetter}"?`,
                    answers: this.generateUniqueLetters(nextLetter, 4),
                    correctAnswer: nextLetter
                };
        }
    }

    generateColorQuestion() {
        const colors = {
            'red': '#ff4757', 'yellow': '#ffa502', 'blue': '#3742fa', 
            'green': '#2ed573', 'orange': '#ff6348', 'purple': '#a55eea'
        };
        const colorNames = Object.keys(colors);
        const selectedColor = colorNames[Math.floor(Math.random() * colorNames.length)];
        
        const wrongColors = colorNames.filter(c => c !== selectedColor);
        const options = [selectedColor];
        while (options.length < 4) {
            const randomColor = wrongColors[Math.floor(Math.random() * wrongColors.length)];
            if (!options.includes(randomColor)) {
                options.push(randomColor);
            }
        }
        
        return {
            question: `?? What color is this? <div class="color-circle" style="background: ${colors[selectedColor]};"></div>`,
            answers: this.shuffleArray(options),
            correctAnswer: selectedColor,
            isColorGame: true,
            colors: colors
        };
    }

    generateShapeQuestion() {
        const shapes = {
            '??': 'circle', '??': 'triangle', '??': 'square', '?': 'star'
        };
        const shapeEmojis = Object.keys(shapes);
        const selectedEmoji = shapeEmojis[Math.floor(Math.random() * shapeEmojis.length)];
        const correctShape = shapes[selectedEmoji];
        
        const types = ['identify', 'count'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        if (type === 'identify') {
            const wrongShapes = Object.values(shapes).filter(s => s !== correctShape);
            const options = [correctShape];
            while (options.length < 4) {
                const randomShape = wrongShapes[Math.floor(Math.random() * wrongShapes.length)];
                if (!options.includes(randomShape)) {
                    options.push(randomShape);
                }
            }
            return {
                question: `?? What shape is this? <span style="font-size: 4rem;">${selectedEmoji}</span>`,
                answers: this.shuffleArray(options),
                correctAnswer: correctShape
            };
        } else {
            const count = Math.floor(Math.random() * 5) + 2;
            const shapes = Array(count).fill(selectedEmoji).join(' ');
            return {
                question: `?? Count the shapes:<br><span style="font-size: 2rem;">${shapes}</span>`,
                answers: this.generateUniqueOptions(count, 1, 8, 4),
                correctAnswer: count
            };
        }
    }

    generateUniqueOptions(correct, min, max, count) {
        const options = [correct];
        while (options.length < count) {
            const option = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!options.includes(option)) {
                options.push(option);
            }
        }
        return this.shuffleArray(options);
    }

    generateUniqueLetters(correct, count) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const options = [correct];
        while (options.length < count) {
            const option = letters[Math.floor(Math.random() * 10)];
            if (!options.includes(option)) {
                options.push(option);
            }
        }
        return this.shuffleArray(options);
    }





    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderAnswers(answers, correctAnswer, questionData = null) {
        const answersEl = document.getElementById('answersGrid');
        answersEl.innerHTML = '';
        
        answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            
            if (questionData && questionData.isColorGame) {
                button.innerHTML = `<div class="color-circle" style="background: ${questionData.colors[answer]};"></div>`;
                button.onclick = () => this.checkAnswer(answer, correctAnswer, button);
            } else {
                button.textContent = answer;
                button.onclick = () => this.checkAnswer(answer, correctAnswer, button);
            }
            
            answersEl.appendChild(button);
        });
    }

    checkAnswer(selected, correct, buttonEl) {
        const feedbackEl = document.getElementById('feedback');
        const allButtons = document.querySelectorAll('.answer-btn');
        
        allButtons.forEach(btn => btn.disabled = true);
        
        if (selected === correct) {
            buttonEl.classList.add('correct');
            feedbackEl.textContent = this.getPositiveFeedback();
            feedbackEl.className = 'feedback correct';
            this.score += 10;
            this.gameScores[this.currentGame] += 10;
            this.updateScore();
            this.savePlayerData();
            this.showCelebration();
            
            setTimeout(() => {
                this.generateQuestion();
            }, 2000);
        } else {
            buttonEl.classList.add('wrong');
            feedbackEl.textContent = this.getEncouragingFeedback();
            feedbackEl.className = 'feedback wrong';
            
            // Show correct answer
            allButtons.forEach(btn => {
                if (btn.textContent == correct) {
                    btn.classList.add('correct');
                }
            });
            
            setTimeout(() => {
                this.generateQuestion();
            }, 3000);
        }
    }

    getPositiveFeedback() {
        const messages = [
            '?? Great Job!', '?? Awesome!', '? Perfect!', '?? Excellent!',
            '?? Well Done!', '?? Amazing!', '?? Fantastic!', '?? Brilliant!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getEncouragingFeedback() {
        const messages = [
            '?? Try Again!', '?? Keep Going!', '?? Almost There!', '?? You Can Do It!',
            '? Good Try!', '?? Keep Learning!', '?? Nice Effort!', '?? Don\'t Give Up!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showCelebration() {
        const celebrationEl = document.getElementById('celebration');
        celebrationEl.style.display = 'flex';
        
        setTimeout(() => {
            celebrationEl.style.display = 'none';
        }, 1500);
    }
}

// Global functions for HTML onclick events
let game;

function startGame(gameType) {
    game.startGame(gameType);
}

function backToMenu() {
    game.backToMenu();
}

function login() {
    game.login();
}

function logout() {
    game.logout();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new KidsGame();
});