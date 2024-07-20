const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 8,
  hearts: 10,
};

const zombies = [];
const bullets = [];
let score = 0;
let gameOver = false;
let zombieSpawnRate = 0.02; // Reduced spawn rate
let zombieSpeed = 1; // Reduced initial zombie speed
let bulletSpeed = 10;

// Event listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

let rightPressed = false;
let leftPressed = false;

function keyDownHandler(e) {
  if (gameOver && e.key === "r") {
    restartGame();
  }
  if (gameOver) return;

  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === " ") {
    bullets.push({
      x: player.x + player.width / 2 - 2.5,
      y: player.y,
      width: 5,
      height: 10,
    });
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function movePlayer() {
  if (rightPressed && player.x < canvas.width - player.width) {
    player.x += player.speed;
  } else if (leftPressed && player.x > 0) {
    player.x -= player.speed;
  }
}

function createZombie() {
  if (Math.random() < zombieSpawnRate) {
    zombies.push({
      x: Math.random() * (canvas.width - 30),
      y: 0,
      width: 30,
      height: 30,
      speed: zombieSpeed,
    });
  }
}

function moveZombies() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    zombies[i].y += zombies[i].speed;
    if (zombies[i].y > canvas.height) {
      zombies.splice(i, 1);
      player.hearts--;
      if (player.hearts <= 0) {
        gameOver = true;
      }
    }
  }
}

function moveBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }
}

function checkCollisions() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    // Check for collision with player
    if (
      player.x < zombies[i].x + zombies[i].width &&
      player.x + player.width > zombies[i].x &&
      player.y < zombies[i].y + zombies[i].height &&
      player.y + player.height > zombies[i].y
    ) {
      player.hearts--;
      zombies.splice(i, 1);
      if (player.hearts <= 0) {
        gameOver = true;
      }
      continue;
    }

    // Check for collision with bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (
        bullets[j].x < zombies[i].x + zombies[i].width &&
        bullets[j].x + bullets[j].width > zombies[i].x &&
        bullets[j].y < zombies[i].y + zombies[i].height &&
        bullets[j].y + bullets[j].height > zombies[i].y
      ) {
        zombies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        increaseDifficulty();
        break;
      }
    }
  }
}

function increaseDifficulty() {
  if (score % 10 === 0) {
    zombieSpawnRate = Math.min(zombieSpawnRate + 0.005, 0.1); // Slower increase, lower cap
    zombieSpeed = Math.min(zombieSpeed + 0.2, 3); // Slower increase, lower cap
  }
}

function drawHearts() {
  ctx.fillStyle = "red";
  for (let i = 0; i < player.hearts; i++) {
    ctx.fillRect(10 + (i % 5) * 30, 40 + Math.floor(i / 5) * 30, 20, 20);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = "green";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw zombies
  ctx.fillStyle = "red";
  zombies.forEach((zombie) => {
    ctx.fillRect(zombie.x, zombie.y, zombie.width, zombie.height);
  });

  // Draw bullets
  ctx.fillStyle = "white";
  bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Draw score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  // Draw hearts
  drawHearts();

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText(
      "Press R to restart",
      canvas.width / 2 - 80,
      canvas.height / 2 + 40
    );
  }
}

function restartGame() {
  player.hearts = 10;
  player.x = canvas.width / 2 - 25;
  zombies.length = 0;
  bullets.length = 0;
  score = 0;
  gameOver = false;
  zombieSpawnRate = 0.02; // Reset to initial value
  zombieSpeed = 1; // Reset to initial value
}

function gameLoop() {
  if (!gameOver) {
    movePlayer();
    createZombie();
    moveZombies();
    moveBullets();
    checkCollisions();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
