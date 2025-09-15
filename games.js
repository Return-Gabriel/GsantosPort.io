// ===== GAMES FUNCTIONALITY =====

class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.currentGame = null;
    this.gameLoop = null;
    this.isFullscreen = false;
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  startGame(gameType) {
    this.stopGame();
    
    switch(gameType) {
      case 'tetris':
        this.currentGame = new TetrisGame(this.ctx, this.canvas);
        break;
      case 'snake':
        this.currentGame = new SnakeGame(this.ctx, this.canvas);
        break;
      case 'pong':
        this.currentGame = new PongGame(this.ctx, this.canvas);
        break;
      case 'breakout':
        this.currentGame = new BreakoutGame(this.ctx, this.canvas);
        break;
      default:
        console.error('Jogo não encontrado:', gameType);
        return;
    }

    this.currentGame.init();
    this.gameLoop = setInterval(() => {
      this.currentGame.update();
      this.currentGame.draw();
    }, 1000 / 60); // 60 FPS
  }

  stopGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    if (this.currentGame) {
      this.currentGame.destroy();
      this.currentGame = null;
    }
  }

  toggleFullscreen() {
    const modal = document.getElementById('gameModal');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!this.isFullscreen) {
      modal.classList.add('fullscreen');
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
      this.isFullscreen = true;
    } else {
      modal.classList.remove('fullscreen');
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
      this.isFullscreen = false;
    }
  }
}

// ===== TETRIS GAME =====
class TetrisGame {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.board = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.dropTime = 0;
    this.dropInterval = 1000;
    
    this.pieces = [
      { shape: [[1,1,1,1]], color: '#00ffff' }, // I
      { shape: [[1,1],[1,1]], color: '#ffff00' }, // O
      { shape: [[0,1,0],[1,1,1]], color: '#800080' }, // T
      { shape: [[0,1,1],[1,1,0]], color: '#00ff00' }, // S
      { shape: [[1,1,0],[0,1,1]], color: '#ff0000' }, // Z
      { shape: [[1,0,0],[1,1,1]], color: '#ff8000' }, // L
      { shape: [[0,0,1],[1,1,1]], color: '#0000ff' }  // J
    ];
    
    this.boardWidth = 10;
    this.boardHeight = 20;
    this.blockSize = 30;
  }

  init() {
    // Inicializar tabuleiro
    this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
    this.spawnPiece();
    this.bindEvents();
  }

  bindEvents() {
    this.keyHandler = (e) => {
      switch(e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          this.movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.rotatePiece();
          break;
        case 'Space':
          e.preventDefault();
          this.hardDrop();
          break;
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  spawnPiece() {
    const pieceType = Math.floor(Math.random() * this.pieces.length);
    this.currentPiece = {
      shape: this.pieces[pieceType].shape,
      color: this.pieces[pieceType].color,
      x: Math.floor(this.boardWidth / 2) - 1,
      y: 0
    };
  }

  movePiece(dx, dy) {
    if (this.canMove(this.currentPiece.x + dx, this.currentPiece.y + dy, this.currentPiece.shape)) {
      this.currentPiece.x += dx;
      this.currentPiece.y += dy;
      return true;
    }
    return false;
  }

  rotatePiece() {
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (this.canMove(this.currentPiece.x, this.currentPiece.y, rotated)) {
      this.currentPiece.shape = rotated;
    }
  }

  hardDrop() {
    while (this.movePiece(0, 1)) {}
    this.placePiece();
  }

  canMove(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          if (newX < 0 || newX >= this.boardWidth || 
              newY >= this.boardHeight || 
              (newY >= 0 && this.board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placePiece() {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const x = this.currentPiece.x + col;
          const y = this.currentPiece.y + row;
          if (y >= 0) {
            this.board[y][x] = this.currentPiece.color;
          }
        }
      }
    }
    
    this.clearLines();
    this.spawnPiece();
    
    if (!this.canMove(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
      this.gameOver();
    }
  }

  clearLines() {
    let linesCleared = 0;
    for (let row = this.boardHeight - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== 0)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(this.boardWidth).fill(0));
        linesCleared++;
        row++; // Check the same row again
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += linesCleared * 100 * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
    }
  }

  update() {
    this.dropTime += 16; // ~60fps
    if (this.dropTime >= this.dropInterval) {
      if (!this.movePiece(0, 1)) {
        this.placePiece();
      }
      this.dropTime = 0;
    }
  }

  draw() {
    // Limpar canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar tabuleiro
    for (let row = 0; row < this.boardHeight; row++) {
      for (let col = 0; col < this.boardWidth; col++) {
        if (this.board[row][col]) {
          this.ctx.fillStyle = this.board[row][col];
          this.ctx.fillRect(col * this.blockSize, row * this.blockSize, 
                           this.blockSize - 1, this.blockSize - 1);
        }
      }
    }
    
    // Desenhar peça atual
    if (this.currentPiece) {
      this.ctx.fillStyle = this.currentPiece.color;
      for (let row = 0; row < this.currentPiece.shape.length; row++) {
        for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
          if (this.currentPiece.shape[row][col]) {
            const x = (this.currentPiece.x + col) * this.blockSize;
            const y = (this.currentPiece.y + row) * this.blockSize;
            this.ctx.fillRect(x, y, this.blockSize - 1, this.blockSize - 1);
          }
        }
      }
    }
    
    // Desenhar informações
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 150, 30);
    this.ctx.fillText(`Level: ${this.level}`, this.canvas.width - 150, 60);
    this.ctx.fillText(`Lines: ${this.lines}`, this.canvas.width - 150, 90);
  }

  gameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
  }

  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }
}

// ===== SNAKE GAME =====
class SnakeGame {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.snake = [{x: 10, y: 10}];
    this.food = {x: 15, y: 15};
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.gridSize = 20;
    this.gameRunning = true;
  }

  init() {
    this.bindEvents();
    this.generateFood();
  }

  bindEvents() {
    this.keyHandler = (e) => {
      if (!this.gameRunning) return;
      
      switch(e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          if (this.dx === 0) { this.dx = -1; this.dy = 0; }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (this.dx === 0) { this.dx = 1; this.dy = 0; }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (this.dy === 0) { this.dx = 0; this.dy = -1; }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (this.dy === 0) { this.dx = 0; this.dy = 1; }
          break;
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  generateFood() {
    this.food = {
      x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
      y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
    };
    
    // Verificar se a comida não está na cobra
    for (let segment of this.snake) {
      if (segment.x === this.food.x && segment.y === this.food.y) {
        this.generateFood();
        break;
      }
    }
  }

  update() {
    if (!this.gameRunning) return;
    
    const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
    
    // Verificar colisão com paredes
    if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
        head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
      this.gameOver();
      return;
    }
    
    // Verificar colisão com o próprio corpo
    for (let segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.gameOver();
        return;
      }
    }
    
    this.snake.unshift(head);
    
    // Verificar se comeu a comida
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  draw() {
    // Limpar canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar cobra
    this.ctx.fillStyle = '#00ff00';
    for (let segment of this.snake) {
      this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize,
                       this.gridSize - 2, this.gridSize - 2);
    }
    
    // Desenhar cabeça da cobra
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(this.snake[0].x * this.gridSize, this.snake[0].y * this.gridSize,
                     this.gridSize - 2, this.gridSize - 2);
    
    // Desenhar comida
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize,
                     this.gridSize - 2, this.gridSize - 2);
    
    // Desenhar pontuação
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
  }

  gameOver() {
    this.gameRunning = false;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
  }

  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }
}

// ===== PONG GAME =====
class PongGame {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.paddle1 = {x: 10, y: canvas.height / 2 - 50, width: 10, height: 100, speed: 5};
    this.paddle2 = {x: canvas.width - 20, y: canvas.height / 2 - 50, width: 10, height: 100, speed: 5};
    this.ball = {x: canvas.width / 2, y: canvas.height / 2, dx: 5, dy: 3, radius: 10};
    this.score1 = 0;
    this.score2 = 0;
    this.keys = {};
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.keyDownHandler = (e) => {
      this.keys[e.code] = true;
    };
    
    this.keyUpHandler = (e) => {
      this.keys[e.code] = false;
    };
    
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  update() {
    // Controles do jogador 1
    if (this.keys['KeyW'] && this.paddle1.y > 0) {
      this.paddle1.y -= this.paddle1.speed;
    }
    if (this.keys['KeyS'] && this.paddle1.y < this.canvas.height - this.paddle1.height) {
      this.paddle1.y += this.paddle1.speed;
    }
    
    // Controles do jogador 2 (IA simples)
    const paddle2Center = this.paddle2.y + this.paddle2.height / 2;
    if (paddle2Center < this.ball.y - 35) {
      this.paddle2.y += this.paddle2.speed;
    } else if (paddle2Center > this.ball.y + 35) {
      this.paddle2.y -= this.paddle2.speed;
    }
    
    // Movimento da bola
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Colisão com topo e fundo
    if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) {
      this.ball.dy = -this.ball.dy;
    }
    
    // Colisão com raquetes
    if (this.ball.x <= this.paddle1.x + this.paddle1.width &&
        this.ball.y >= this.paddle1.y &&
        this.ball.y <= this.paddle1.y + this.paddle1.height) {
      this.ball.dx = -this.ball.dx;
    }
    
    if (this.ball.x >= this.paddle2.x &&
        this.ball.y >= this.paddle2.y &&
        this.ball.y <= this.paddle2.y + this.paddle2.height) {
      this.ball.dx = -this.ball.dx;
    }
    
    // Pontuação
    if (this.ball.x < 0) {
      this.score2++;
      this.resetBall();
    } else if (this.ball.x > this.canvas.width) {
      this.score1++;
      this.resetBall();
    }
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.dx = -this.ball.dx;
  }

  draw() {
    // Limpar canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar linha central
    this.ctx.setLineDash([5, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.strokeStyle = '#fff';
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Desenhar raquetes
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
    this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
    
    // Desenhar bola
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Desenhar pontuação
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score1, this.canvas.width / 4, 50);
    this.ctx.fillText(this.score2, 3 * this.canvas.width / 4, 50);
    
    // Instruções
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Use W/S para controlar', this.canvas.width / 2, this.canvas.height - 20);
  }

  destroy() {
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
  }
}

// ===== BREAKOUT GAME =====
class BreakoutGame {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.paddle = {x: canvas.width / 2 - 50, y: canvas.height - 30, width: 100, height: 10, speed: 7};
    this.ball = {x: canvas.width / 2, y: canvas.height - 50, dx: 4, dy: -4, radius: 8};
    this.bricks = [];
    this.score = 0;
    this.lives = 3;
    this.keys = {};
    
    this.initBricks();
  }

  init() {
    this.bindEvents();
  }

  initBricks() {
    const brickRows = 5;
    const brickCols = 10;
    const brickWidth = this.canvas.width / brickCols - 5;
    const brickHeight = 20;
    
    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        this.bricks.push({
          x: col * (brickWidth + 5) + 2.5,
          y: row * (brickHeight + 5) + 50,
          width: brickWidth,
          height: brickHeight,
          visible: true,
          color: `hsl(${row * 60}, 70%, 50%)`
        });
      }
    }
  }

  bindEvents() {
    this.keyDownHandler = (e) => {
      this.keys[e.code] = true;
    };
    
    this.keyUpHandler = (e) => {
      this.keys[e.code] = false;
    };
    
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  update() {
    // Controle da raquete
    if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
      this.paddle.x -= this.paddle.speed;
    }
    if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.width) {
      this.paddle.x += this.paddle.speed;
    }
    
    // Movimento da bola
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Colisão com paredes
    if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
      this.ball.dx = -this.ball.dx;
    }
    if (this.ball.y <= this.ball.radius) {
      this.ball.dy = -this.ball.dy;
    }
    
    // Colisão com raquete
    if (this.ball.y >= this.paddle.y - this.ball.radius &&
        this.ball.x >= this.paddle.x &&
        this.ball.x <= this.paddle.x + this.paddle.width) {
      this.ball.dy = -this.ball.dy;
      
      // Adicionar efeito baseado na posição de impacto
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
      this.ball.dx = 8 * (hitPos - 0.5);
    }
    
    // Colisão com blocos
    for (let brick of this.bricks) {
      if (brick.visible &&
          this.ball.x >= brick.x &&
          this.ball.x <= brick.x + brick.width &&
          this.ball.y >= brick.y &&
          this.ball.y <= brick.y + brick.height) {
        brick.visible = false;
        this.ball.dy = -this.ball.dy;
        this.score += 10;
        break;
      }
    }
    
    // Verificar se perdeu a bola
    if (this.ball.y > this.canvas.height) {
      this.lives--;
      if (this.lives > 0) {
        this.resetBall();
      } else {
        this.gameOver();
      }
    }
    
    // Verificar vitória
    if (this.bricks.every(brick => !brick.visible)) {
      this.victory();
    }
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height - 50;
    this.ball.dx = 4;
    this.ball.dy = -4;
  }

  draw() {
    // Limpar canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar blocos
    for (let brick of this.bricks) {
      if (brick.visible) {
        this.ctx.fillStyle = brick.color;
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
    }
    
    // Desenhar raquete
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    
    // Desenhar bola
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Desenhar informações
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 100, 30);
  }

  gameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
  }

  victory() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VOCÊ VENCEU!', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
  }

  destroy() {
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
  }
}

// ===== MUSIC PLAYER FUNCTIONALITY =====
class MusicPlayer {
  constructor() {
    this.currentTrack = null;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isShuffled = false;
    this.isRepeating = false;
    this.volume = 0.7;
    this.tracks = [];
    this.audio = new Audio();
    
    this.init();
  }

  init() {
    this.loadTracks();
    this.bindEvents();
    this.updateUI();
  }

  loadTracks() {
    const trackElements = document.querySelectorAll('.track-item');
    trackElements.forEach((element, index) => {
      this.tracks.push({
        title: element.dataset.title,
        artist: element.dataset.artist,
        src: element.dataset.src,
        element: element,
        index: index
      });
    });
  }

  bindEvents() {
    // Controles principais
    document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlay());
    document.getElementById('prevBtn').addEventListener('click', () => this.previousTrack());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextTrack());
    
    // Controles da playlist
    document.getElementById('shuffleBtn').addEventListener('click', () => this.toggleShuffle());
    document.getElementById('repeatBtn').addEventListener('click', () => this.toggleRepeat());
    
    // Eventos dos tracks
    this.tracks.forEach((track, index) => {
      track.element.addEventListener('click', () => this.selectTrack(index));
      const playBtn = track.element.querySelector('.play-btn');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectTrack(index);
        this.togglePlay();
      });
    });
    
    // Eventos do áudio
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.nextTrack());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    
    // Controle de volume
    const volumeBar = document.querySelector('.volume-bar');
    volumeBar.addEventListener('click', (e) => this.setVolume(e));
    
    // Controle de progresso
    const progressBar = document.querySelector('.progress-bar');
    progressBar.addEventListener('click', (e) => this.setProgress(e));
  }

  selectTrack(index) {
    // Remover classe active do track atual
    if (this.currentTrack) {
      this.currentTrack.element.classList.remove('active');
    }
    
    this.currentIndex = index;
    this.currentTrack = this.tracks[index];
    this.currentTrack.element.classList.add('active');
    
    // Atualizar player principal
    document.querySelector('.current-title').textContent = this.currentTrack.title;
    document.querySelector('.current-artist').textContent = this.currentTrack.artist;
    
    // Carregar áudio (apenas se tiver src válido)
    if (this.currentTrack.src && this.currentTrack.src !== '#') {
      this.audio.src = this.currentTrack.src;
    }
    
    this.updateUI();
  }

  togglePlay() {
    if (!this.currentTrack) {
      this.selectTrack(0);
    }
    
    if (this.currentTrack.src === '#') {
      // Simular reprodução para tracks sem áudio
      this.isPlaying = !this.isPlaying;
      this.updateUI();
      return;
    }
    
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(e => console.log('Erro ao reproduzir:', e));
    }
    
    this.isPlaying = !this.isPlaying;
    this.updateUI();
  }

  previousTrack() {
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = this.tracks.length - 1;
    }
    this.selectTrack(newIndex);
    if (this.isPlaying) {
      this.togglePlay();
    }
  }

  nextTrack() {
    let newIndex;
    if (this.isShuffled) {
      newIndex = Math.floor(Math.random() * this.tracks.length);
    } else {
      newIndex = this.currentIndex + 1;
      if (newIndex >= this.tracks.length) {
        if (this.isRepeating) {
          newIndex = 0;
        } else {
          this.isPlaying = false;
          this.updateUI();
          return;
        }
      }
    }
    
    this.selectTrack(newIndex);
    if (this.isPlaying) {
      this.togglePlay();
    }
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.classList.toggle('active', this.isShuffled);
  }

  toggleRepeat() {
    this.isRepeating = !this.isRepeating;
    const repeatBtn = document.getElementById('repeatBtn');
    repeatBtn.classList.toggle('active', this.isRepeating);
  }

  updateProgress() {
    if (this.audio.duration) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100;
      document.getElementById('progress').style.width = progress + '%';
      
      document.querySelector('.current-time').textContent = this.formatTime(this.audio.currentTime);
    }
  }

  updateDuration() {
    document.querySelector('.total-time').textContent = this.formatTime(this.audio.duration);
  }

  setProgress(e) {
    if (this.audio.duration) {
      const rect = e.target.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = percent * this.audio.duration;
    }
  }

  setVolume(e) {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.volume = Math.max(0, Math.min(1, percent));
    this.audio.volume = this.volume;
    document.getElementById('volumeProgress').style.width = (this.volume * 100) + '%';
  }

  updateUI() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const vinylEffect = document.querySelector('.vinyl-effect');
    
    if (this.isPlaying) {
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      vinylEffect.classList.add('spinning');
    } else {
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      vinylEffect.classList.remove('spinning');
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar engine de jogos
  const gameEngine = new GameEngine();
  const canvas = document.getElementById('gameCanvas');
  gameEngine.init(canvas);
  
  // Inicializar player de música
  const musicPlayer = new MusicPlayer();
  
  // Event listeners para jogos
  document.querySelectorAll('.game-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const gameType = this.dataset.game;
      const modal = document.getElementById('gameModal');
      const modalTitle = document.getElementById('gameModalTitle');
      
      modalTitle.textContent = this.textContent.replace('Jogar ', '');
      modal.classList.add('active');
      
      gameEngine.startGame(gameType);
    });
  });
  
  // Controles do modal de jogos
  document.getElementById('closeGameBtn').addEventListener('click', function() {
    const modal = document.getElementById('gameModal');
    modal.classList.remove('active', 'fullscreen');
    gameEngine.stopGame();
    gameEngine.isFullscreen = false;
    document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
  });
  
  document.getElementById('fullscreenBtn').addEventListener('click', function() {
    gameEngine.toggleFullscreen();
  });
  
  // Fechar modal clicando fora
  document.getElementById('gameModal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active', 'fullscreen');
      gameEngine.stopGame();
      gameEngine.isFullscreen = false;
      document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
    }
  });
});

