import Phaser from 'phaser';
import * as YouTubePlayables from './YouTubePlayables.js';

// Global Game State
let globalHighScore = 0;
let languageCode = 'en-US';

/**
 * SCENE: BOOT
 * Standard entry scene that immediately hands off to the Preloader.
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // Hand off to Preloader immediately
        this.scene.start('PreloaderScene');
    }
}

/**
 * SCENE: PRELOADER
 * Simulates asset loading, generates procedural vector graphics,
 * reads save data, and calls firstFrameReady().
 */
class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Custom loading bar styling (Neon Cyberpunk Theme)
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING CORE SYSTEMS...', {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);
        loadingText.setShadow(0, 0, '#00ffff', 10, true, true);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.lineStyle(2, 0x00ffff, 0.8);
        progressBox.strokeRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 6);

        // Progress event listeners
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xff00ff, 0.8); // Glowing magenta progress bar
            progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 10, 310 * value, 20, 4);
        });

        // Parallel loads: High Score and System Language via SDK
        this.load.addFile(new Phaser.Loader.FileTypes.HTML5AudioFile(this.load, 'dummy', '')); // Phaser needs a load queue to trigger progress

        // Async tasks
        YouTubePlayables.loadLanguage().then(lang => {
            languageCode = lang;
        });

        YouTubePlayables.loadData().then(data => {
            if (data && typeof data.highscore !== 'undefined') {
                globalHighScore = data.highscore;
            }
        });
    }

    create() {
        // Generate procedural vector textures (No external images required)
        this.generateProceduralAssets();

        // SDK: Signal that the first frame has rendered and loaded successfully
        YouTubePlayables.firstFrameReady();

        // Add a slight realistic load lag for UX polish
        this.time.delayedCall(1200, () => {
            this.scene.start('MainMenuScene');
        });
    }

    generateProceduralAssets() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // 1. Paddle (Neon Blue Cyber-Glow)
        g.fillStyle(0x0044aa, 0.4);
        g.fillRoundedRect(0, 0, 140, 26, 13);
        g.fillStyle(0x00ffff, 1);
        g.fillRoundedRect(6, 6, 128, 14, 7);
        g.generateTexture('paddle', 140, 26);
        g.clear();

        // 2. Ball (Cyber Green Core)
        g.fillStyle(0x005500, 0.4);
        g.fillCircle(12, 12, 12);
        g.fillStyle(0x00ff00, 1);
        g.fillCircle(12, 12, 7);
        g.generateTexture('ball', 24, 24);
        g.clear();

        // 3. Neon Bricks (Magenta, Yellow, Cyan)
        const colors = [0xff00ff, 0xffff00, 0x00ffff];
        colors.forEach((color, index) => {
            g.fillStyle(color, 0.2);
            g.fillRect(0, 0, 70, 28);
            g.fillStyle(color, 1);
            g.fillRect(4, 4, 62, 20);
            g.lineStyle(2, 0xffffff, 0.9);
            g.strokeRect(4, 4, 62, 20);
            g.generateTexture(`brick_${index}`, 70, 28);
            g.clear();
        });

        // 4. Particle Flare (Neon sparks)
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 6, 6);
        g.generateTexture('particle', 6, 6);
        g.clear();

        // 5. Retro Space Grid Background
        g.lineStyle(1, 0x0a2240, 0.7);
        for (let i = 0; i <= 64; i += 32) {
            g.moveTo(i, 0); g.lineTo(i, 64);
            g.moveTo(0, i); g.lineTo(64, i);
        }
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(16, 16, 1.2); // Tiny background star
        g.fillCircle(48, 48, 0.8); // Tiny background star
        g.generateTexture('bgGrid', 64, 64);
        g.clear();
    }
}

/**
 * SCENE: MAIN MENU
 * Displays the main interface, sets audio callbacks, calls gameReady(),
 * and prompts game initiation.
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Scrolling Background
        this.bg = this.add.tileSprite(0, 0, width, height, 'bgGrid').setOrigin(0);

        // Cyber Game Title
        this.titleText = this.add.text(width / 2, height / 3, 'BLOCK SMASHER', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '54px',
            fontStyle: 'bold',
            fill: '#00ffff',
            align: 'center'
        }).setOrigin(0.5);
        this.titleText.setShadow(0, 0, '#00ffff', 25, true, true);

        // High Score
        this.highScoreText = this.add.text(width / 2, height / 2 - 40, `HIGH SCORE: ${globalHighScore}`, {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '22px',
            fontStyle: 'bold',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
        this.highScoreText.setShadow(0, 0, '#ffff00', 8, true, true);

        // Interactive START GAME Button
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xff00ff, 0.2);
        btnBg.lineStyle(3, 0xff00ff, 1);
        btnBg.fillRoundedRect(width / 2 - 150, height / 2 + 50, 300, 60, 12);
        btnBg.strokeRoundedRect(width / 2 - 150, height / 2 + 50, 300, 60, 12);

        this.startText = this.add.text(width / 2, height / 2 + 80, 'START GAME', {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '26px',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.startText.setShadow(0, 0, '#ffffff', 8, true, true);

        // Make button zone interactive
        const startBtn = this.add.zone(width / 2, height / 2 + 80, 300, 60).setInteractive({ useHandCursor: true });

        // Pulsing Start Button Animation
        this.tweens.add({
            targets: [this.startText],
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Developer Signature (Preserved)
        this.signatureText = this.add.text(width / 2, height - 40, 'kod yapımcısı: kemal kartal youngscreen', {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '14px',
            fill: '#556677',
            align: 'center'
        }).setOrigin(0.5);

        // Button events
        startBtn.on('pointerdown', () => {
            this.startGame();
        });

        // Audio System Integration with YouTube SDK Specifications
        const initialAudioMute = !YouTubePlayables.isAudioEnabled();
        this.sound.setMute(initialAudioMute);
        console.log(`[Audio Setup] Initial system sound mute state: ${initialAudioMute}`);

        YouTubePlayables.setAudioChangeCallback((enabled) => {
            console.log(`[Audio Event] System audio change event: ${enabled ? 'ENABLED' : 'MUTED'}`);
            this.sound.setMute(!enabled);
        });

        // SDK: Signal YouTube that game load is complete and interactive
        YouTubePlayables.gameReady();

        this.scale.on('resize', this.resize, this);
    }

    startGame() {
        console.log("[Menu] Launching GameScene. Sending initialization payloads to SDK...");

        // Save a dummy/start state progress as required
        YouTubePlayables.saveData({
            highscore: globalHighScore,
            level: 1,
            lastPlayed: Date.now()
        });

        // Send high score via SDK
        YouTubePlayables.sendScore(globalHighScore);

        this.scene.start('GameScene');
    }

    update() {
        this.bg.tilePositionY -= 0.6;
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        this.bg.setSize(width, height);
        this.titleText.setPosition(width / 2, height / 3);
        this.highScoreText.setPosition(width / 2, height / 2 - 40);
        this.signatureText.setPosition(width / 2, height - 40);
    }
}

/**
 * SCENE: GAME
 * Core game loop with responsiveness, physics, and gameplay mechanics.
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.score = 0;
        this.lives = 3;
        this.lastCenterX = width / 2;

        // Background
        this.bg = this.add.tileSprite(0, 0, width, height, 'bgGrid').setOrigin(0);

        // Setup physics bounds (leaving the bottom floor open for life loss)
        this.physics.world.setBounds(0, 0, width, height);
        this.physics.world.checkCollision.down = false;

        // Create Paddle
        this.paddle = this.physics.add.image(width / 2, height - 100, 'paddle').setImmovable();
        this.paddle.body.allowGravity = false;

        // Create Ball
        this.ball = this.physics.add.image(width / 2, height - 140, 'ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);
        this.ball.setData('onPaddle', true);

        // Create static group for bricks
        this.bricks = this.physics.add.staticGroup();
        this.buildLevel();

        // Particles system for neon explosion
        this.particles = this.add.particles(0, 0, 'particle', {
            lifespan: 500,
            speed: { min: 80, max: 280 },
            scale: { start: 1.2, end: 0 },
            blendMode: 'ADD',
            emitting: false
        });

        // Game UI overlay
        this.scoreText = this.add.text(25, 25, 'SCORE: 0', {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffffff'
        });
        this.scoreText.setShadow(0, 0, '#ffffff', 4, true, true);

        this.livesText = this.add.text(width - 25, 25, 'LIVES: 3', {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ff3333'
        }).setOrigin(1, 0);
        this.livesText.setShadow(0, 0, '#ff3333', 4, true, true);

        // Colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        // Controls (pointer sliding)
        this.input.on('pointermove', (pointer) => {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, this.paddle.width / 2, this.scale.width - this.paddle.width / 2);
            if (this.ball.getData('onPaddle')) {
                this.ball.x = this.paddle.x;
            }
        });

        this.input.on('pointerdown', () => {
            if (this.ball.getData('onPaddle')) {
                this.ball.setData('onPaddle', false);
                this.ball.setVelocity(-100, -500); // Shoot upwards
            }
        });

        this.scale.on('resize', this.resize, this);
    }

    buildLevel() {
        this.bricks.clear(true, true);
        const width = this.scale.width;

        const brickWidth = 70;
        const brickHeight = 28;
        const padding = 12;
        const totalBrickWidth = brickWidth + padding;

        // Auto-scale grid logic for responsive screen sizing
        const maxCols = Math.floor((width - 40) / totalBrickWidth);
        const cols = Math.min(10, maxCols);
        const rows = 5;

        const startX = (width - (cols * totalBrickWidth) + padding) / 2;
        const startY = 100;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const texIndex = j % 3;
                const bX = startX + i * totalBrickWidth + brickWidth / 2;
                const bY = startY + j * (brickHeight + padding) + brickHeight / 2;
                this.bricks.create(bX, bY, `brick_${texIndex}`);
            }
        }
    }

    hitBrick(ball, brick) {
        brick.disableBody(true, true);
        this.particles.emitParticleAt(brick.x, brick.y, 16);

        this.score += 10;
        this.scoreText.setText('SCORE: ' + this.score);

        // Check Win Condition
        if (this.bricks.countActive() === 0) {
            this.buildLevel();
            this.resetBall();
        }
    }

    hitPaddle(ball, paddle) {
        // Alter X velocity based on where the ball lands relative to paddle center
        let diff = 0;
        if (ball.x < paddle.x) {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-8 * diff);
        } else if (ball.x > paddle.x) {
            diff = ball.x - paddle.x;
            ball.setVelocityX(8 * diff);
        } else {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    resetBall() {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, this.paddle.y - 35);
        this.ball.setData('onPaddle', true);
    }

    update() {
        this.bg.tilePositionY -= 0.6;

        // Fall check (out of bounds at the bottom)
        if (this.ball.y > this.scale.height) {
            this.lives--;
            this.livesText.setText('LIVES: ' + this.lives);
            this.cameras.main.shake(200, 0.012);

            if (this.lives === 0) {
                this.scene.start('GameOverScene', { score: this.score });
            } else {
                this.resetBall();
            }
        }
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.physics.world.setBounds(0, 0, width, height);
        this.bg.setSize(width, height);
        this.livesText.setPosition(width - 25, 25);

        const dx = (width / 2) - this.lastCenterX;
        this.lastCenterX = width / 2;

        this.paddle.y = height - 100;
        this.paddle.x = Phaser.Math.Clamp(this.paddle.x + dx, this.paddle.width / 2, width - this.paddle.width / 2);

        if (this.ball.getData('onPaddle')) {
            this.ball.setPosition(this.paddle.x, this.paddle.y - 35);
        }

        // Keep bricks centered during active layout changes
        this.bricks.getChildren().forEach(brick => {
            brick.x += dx;
            brick.refreshBody();
        });
    }
}

/**
 * SCENE: GAME OVER
 * Saves high score state, pushes results to SDK, and allows restart.
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Process score and achievements
        let newRecord = false;
        if (this.finalScore > globalHighScore) {
            globalHighScore = this.finalScore;
            newRecord = true;

            // SDK: Save persistent data securely
            YouTubePlayables.saveData({ highscore: globalHighScore });
        }

        // SDK: Send final score to YouTube API
        YouTubePlayables.sendScore(this.finalScore);

        this.bg = this.add.tileSprite(0, 0, width, height, 'bgGrid').setOrigin(0);

        // Header Styling
        this.overText = this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ff0055'
        }).setOrigin(0.5);
        this.overText.setShadow(0, 0, '#ff0055', 20, true, true);

        // Core score summary
        this.scoreText = this.add.text(width / 2, height / 2 - 20, `SCORE: ${this.finalScore}`, {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '26px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        if (newRecord) {
            this.bestText = this.add.text(width / 2, height / 2 + 25, 'NEW HIGH SCORE!', {
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '22px',
                fontStyle: 'bold',
                fill: '#ffff00'
            }).setOrigin(0.5);
            this.bestText.setShadow(0, 0, '#ffff00', 8, true, true);

            this.tweens.add({
                targets: this.bestText,
                scale: 1.15,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        }

        // Restart prompt
        this.restartText = this.add.text(width / 2, height / 1.5, 'TAP TO RESTART', {
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '26px',
            fontStyle: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);
        this.restartText.setShadow(0, 0, '#00ffff', 10, true, true);

        this.tweens.add({
            targets: this.restartText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Trigger restart listener
        this.time.delayedCall(400, () => {
            this.input.once('pointerdown', () => {
                this.scene.start('MainMenuScene');
            });
        });

        this.scale.on('resize', this.resize, this);
    }

    update() {
        this.bg.tilePositionY -= 0.6;
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        this.bg.setSize(width, height);
        this.overText.setPosition(width / 2, height / 3);
        this.scoreText.setPosition(width / 2, height / 2 - 20);
        if (this.bestText) this.bestText.setPosition(width / 2, height / 2 + 25);
        this.restartText.setPosition(width / 2, height / 1.5);
    }
}

// Game Bootstrapping configuration
const config = {
    type: Phaser.AUTO,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 820,
        height: 1180,
        parent: 'gameParent'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, PreloaderScene, MainMenuScene, GameScene, GameOverScene]
};

// Start bootstrapping sequence inside SDK listener
YouTubePlayables.boot(() => {
    new Phaser.Game(config);
});
