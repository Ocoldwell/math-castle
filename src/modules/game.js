import gameBoard from './gameBoard';
import castle from './castle';
import Enemy from './enemy';
import Timer from './timer';
import questionGenerator from './questionGenerator';

const GAMESTATE = {
    MENU: 0,
    RUNNING: 1,
    GAMEOVER: 2,
};

const POSITION = {
    firstLane: 50,
    secondLane: 165,
    thirdLane: 280,
};

let enemySpeed = 40;
const startPage = document.getElementById('start-page');
const gamePage = document.getElementById('game-page');
const gameOverPage = document.getElementById('game-over-page');

class Game {
    constructor() {
        this.gameBoard = gameBoard;
        this.castle = castle;
        this.answerForm = document.querySelector('.answer-form');
        this.answerInput = document.querySelector('#answer-input');
        // width of area enemy can move in
        this.fieldWidth = gameBoard.width - castle.width;
        this.enemies = [];
        this.gameState = GAMESTATE.MENU;

        // bind methods 'this' to Game class
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.spawnEnemy = this.spawnEnemy.bind(this);
        this.handleAnswerSubmit = this.handleAnswerSubmit.bind(this);

        // spawn enemy every 2.5 seconds
        this.spawnTimer = new Timer(2500, this.spawnEnemy);
    }

    start() {
        this.castle.setup(this, 3);
        this.answerForm.addEventListener('submit', this.handleAnswerSubmit);
        this.gameState = GAMESTATE.RUNNING;
        // hide start page
        startPage.style.display = 'none';
        gameOverPage.style.display = 'none';
        gamePage.style.display = 'flex';
    }

    update(deltaTime) {
        if (this.gameState !== GAMESTATE.RUNNING) return;

        this.spawnTimer.tick(deltaTime);
        this.enemies.forEach((enemy) => enemy.update(this, deltaTime));
    }

    draw() {
        this.enemies.forEach((enemy) => enemy.draw());
    }

    spawnEnemy() {
        const enemy = new Enemy(
            0,
            this.randomLane(),
            this,
            questionGenerator('insane'),
            enemySpeed
        );
        enemySpeed += 3;
        this.gameBoard.element.appendChild(enemy.elements.enemy);
        this.enemies.push(enemy);
    }

    // eslint-disable-next-line class-methods-use-this
    randomLane() {
        // randomly choose an object keys in the POSITION object
        const keys = Object.keys(POSITION);
        return POSITION[keys[Math.floor(Math.random() * keys.length)]];
    }

    deleteEnemy(enemyToDelete) {
        this.enemies = this.enemies.filter((enemy) => enemy !== enemyToDelete);
    }

    gameOver() {
        this.gameState = GAMESTATE.GAMEOVER;
        gamePage.style.display = 'none';
        gameOverPage.style.display = 'flex';
        this.enemies.forEach((enemy) => {
            enemy.delete();
        });
        this.answerInput.value = '';
        enemySpeed = 40;
    }

    handleAnswerSubmit(event) {
        event.preventDefault();

        const selectedEnemy = this.enemies.find((enemy) => enemy.selected);
        if (!selectedEnemy) return;

        const correctAnswer = selectedEnemy.question.answer.toString();
        const userAnswer = this.answerInput.value;

        if (userAnswer === correctAnswer) selectedEnemy.delete(this);

        this.answerInput.value = '';
    }
}

export default Game;
