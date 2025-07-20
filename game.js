const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const PADDLE_WIDTH = 16;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12;

let leftScore = 0;
let rightScore = 0;

const paddleLeft = {
  x: 0,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#1abc9c"
};

const paddleRight = {
  x: canvas.width - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#e74c3c"
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: BALL_RADIUS,
  speed: 6,
  vx: 6 * (Math.random() > 0.5 ? 1 : -1),
  vy: 6 * (Math.random() > 0.5 ? 1 : -1),
  color: "#fff"
};

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#bbb";
  ctx.setLineDash([8, 16]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

function updateScore() {
  document.getElementById('score-left').textContent = leftScore;
  document.getElementById('score-right').textContent = rightScore;
}

canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  paddleLeft.y = mouseY - paddleLeft.height / 2;
  // Clamp within bounds
  paddleLeft.y = Math.max(0, Math.min(canvas.height - paddleLeft.height, paddleLeft.y));
});

function aiMove() {
  // Simple AI: move paddle towards ball Y position
  let target = ball.y - paddleRight.height / 2;
  let dy = target - paddleRight.y;
  if (Math.abs(dy) > 3) {
    paddleRight.y += Math.sign(dy) * 4;
  }
  paddleRight.y = Math.max(0, Math.min(canvas.height - paddleRight.height, paddleRight.y));
}

function ballCollision(paddle) {
  // Axis-Aligned Bounding Box collision
  return (
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y - ball.radius < paddle.y + paddle.height &&
    ball.y + ball.radius > paddle.y
  );
}

function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Ball collision with top/bottom walls
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy = -ball.vy;
    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
  }

  // Ball collision with paddles
  if (ball.vx < 0 && ballCollision(paddleLeft)) {
    ball.vx = -ball.vx;
    // Add some spin based on paddle movement or ball offset
    let collidePoint = (ball.y - (paddleLeft.y + paddleLeft.height / 2));
    ball.vy += collidePoint * 0.15;
  } else if (ball.vx > 0 && ballCollision(paddleRight)) {
    ball.vx = -ball.vx;
    let collidePoint = (ball.y - (paddleRight.y + paddleRight.height / 2));
    ball.vy += collidePoint * 0.15;
  }

  // Score update
  if (ball.x - ball.radius < 0) {
    rightScore++;
    updateScore();
    resetBall();
  }
  if (ball.x + ball.radius > canvas.width) {
    leftScore++;
    updateScore();
    resetBall();
  }

  aiMove();
}

function render() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Net
  drawNet();

  // Paddles
  drawRect(paddleLeft.x, paddleLeft.y, paddleLeft.width, paddleLeft.height, paddleLeft.color);
  drawRect(paddleRight.x, paddleRight.y, paddleRight.width, paddleRight.height, paddleRight.color);

  // Ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// Initial score
updateScore();
loop();
