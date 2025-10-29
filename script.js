// --- mode pick from start screen ---
let selectedMode = "classic";
let bestScore = 0;
let timeLeft = 60;
let timerInterval = null;
let gameRunning = false;  // 👈 NEW: Track if game is running


document.querySelectorAll('input[name="mode"]').forEach(i=>{
  i.addEventListener("change",()=> selectedMode = i.value);
});

const startBtn = document.getElementById("startButton");
// --- SOUND EFFECTS ---
// --- AUDIO: SFX + MUSIC ---
const SOUNDS = {
  button:     new Audio("assets/sound/button.mp3"),
  catch:      new Audio("assets/sound/catch.mp3"),
  golden:     new Audio("assets/sound/golden_egg.mp3"),
  rotten:     new Audio("assets/sound/rotten_egg.mp3"),
  gameOver:   new Audio("assets/sound/game-over.mp3")
};
// --- AUDIO: Start screen background music ---
const MUSIC_START = new Audio("assets/sound/game_bg.mp3");
MUSIC_START.loop = true;
MUSIC_START.volume = 0.35;

let startMusicPlaying = false;
// When page loads, start background music for start screen
window.addEventListener("load", () => {
  MUSIC_START.currentTime = 0;
  MUSIC_START.play().catch(() => {});
  startMusicPlaying = true;
});


// volumes (tweak if you like)
for (let k in SOUNDS) SOUNDS[k].volume = 0.6;

// background music (looping)
const MUSIC = new Audio("assets/sound/background_music.mp3");
MUSIC.loop = true;
MUSIC.volume = 0.35;

let musicStarted = false;

// helper: play SFX reliably (clones so rapid repeats don’t cut off)
function playSfx(audio){
  try {
    const a = audio.cloneNode();
    a.volume = audio.volume;
    a.play().catch(()=>{});
  } catch(e) {
    console.warn("SFX failed:", e);
  }
}

// mobile unlock (enables audio after first user gesture)
window.addEventListener("pointerdown", () => {
  // prime all SFX and music
  Object.values(SOUNDS).forEach(a => { a.play().then(()=>a.pause()).catch(()=>{}); });
  MUSIC.play().then(()=>MUSIC.pause()).catch(()=>{});
}, { once: true });


const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const canvas = document.getElementById("gameCanvas");



// 🔊 All buttons (including Start) get the click sound
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => playSfx(SOUNDS.button));
});

// 🔊 Mode radio toggles click sound
document.querySelectorAll('input[type="radio"][name="mode"]').forEach(radio => {
  radio.addEventListener("change", () => playSfx(SOUNDS.button));
});


startBtn.onclick = async () => {
  // 🔊 button click
  playSfx(SOUNDS.button);
   // 🎵 stop start-screen music
  if (startMusicPlaying) {
    MUSIC_START.pause();
    startMusicPlaying = false;
  }

  selectedMode = (document.querySelector('input[name="mode"]:checked')?.value) || "classic";
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  // 🎵 start music (once)
  if (!musicStarted) {
    MUSIC.currentTime = 0;
    MUSIC.play().catch(()=>{});
    musicStarted = true;
  }
  if (selectedMode === "classic") {
    initClassic();
  } else {
    initTimer();
  }

};
// 🔊 Play button sound for all buttons (except Start) + radio inputs
function playButtonSound() {
  try {
    SOUNDS.button.currentTime = 0;
    SOUNDS.button.play();
  } catch (e) {
    console.warn("Button sound failed:", e);
  }
}

// For all regular buttons except Start
document.querySelectorAll("button").forEach(btn => {
  if (btn.id !== "startButton") {
    btn.addEventListener("click", playButtonSound);
  }
});

// For radio buttons (Classic / Timer)
document.querySelectorAll('input[type="radio"][name="mode"]').forEach(radio => {
  radio.addEventListener("change", playButtonSound);
});


const ctx = canvas.getContext("2d");
const dpr = Math.max(1, window.devicePixelRatio || 1);

const IMGS = {
  chicken: "assets/img/chicken.png",
  basket: "assets/img/basket.png",
  egg_normal: "assets/img/normal_egg.png",
  egg_golden: "assets/img/golden_egg.png",
  egg_rotten: "assets/img/rotten_egg.png",
  heart_full: "assets/img/full_heart.png",
  heart_empty: "assets/img/lost_heart.png"
};

function loadImage(src){ return new Promise(res=>{ const i=new Image(); i.onload=()=>res(i); i.src=src; }); }

let imgs, score, lives, eggs, chickens, basket, lastT, lastSpawn, spawnEvery, paused;

function sizeCanvas(){
  const w = Math.min(window.innerWidth, 1000);
  const h = Math.round(w * 9/16);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function layoutChickens(){
  const w = canvas.clientWidth;
  const y = 90;
  const margin = 90;
  const step = (w - margin*2) / 5;
  chickens = Array.from({length:6},(_,i)=>({ x: margin + step*i, y }));
}

function drawPerch(){
  const y = 133;
  ctx.save();
  ctx.fillStyle = "#8a5a2b";
  ctx.shadowColor = "rgba(0,0,0,.25)";
  ctx.shadowBlur = 6;
  ctx.fillRect(30, y-6, canvas.clientWidth-60, 12);
  ctx.restore();
}

function drawChickens(){
  const s =110;
  chickens.forEach(c=> ctx.drawImage(imgs.chicken, c.x - s/2, c.y - s/2, s, s));
}

function drawBasket(){
  const s = 130;
  basket.w = s; basket.h = 72;
  basket.y = canvas.clientHeight - 60;
  ctx.drawImage(imgs.basket, basket.x - s/2, basket.y - s/2, s, s);
}

function randType(){
  const r = Math.random();
  if (r < 0.10) return "golden";
  if (r > 0.85) return "rotten";
  return "normal";
}

function spawnEgg(){
  const idx = Math.floor(Math.random()*chickens.length);
  const c = chickens[idx];
  const type = randType();
  const img = type==="golden" ? imgs.egg_golden : type==="rotten" ? imgs.egg_rotten : imgs.egg_normal;
  const size = 30;
  const vy = 180 + score*4;
  eggs.push({ x:c.x, y:c.y+20, w:size, h:size*1.25, vy, type, img });
}

function drawEgg(e){ ctx.drawImage(e.img, e.x - e.w/2, e.y - e.h/2, e.w, e.h); }

function updateHearts(){
  livesEl.innerHTML = "";
  for(let i=0;i<3;i++){
    const img = document.createElement("img");
    img.src = i < lives ? IMGS.heart_full : IMGS.heart_empty;
    img.className = "heart";
    livesEl.appendChild(img);
  }
}

function pointsFor(t){ return t==="golden" ? 5 : t==="rotten" ? -2 : 1; }

let keys = new Set();
document.addEventListener("keydown", e=>{ keys.add(e.key); });
document.addEventListener("keyup", e=>{ keys.delete(e.key); });

canvas.addEventListener("mousemove", e=>{
  const r = canvas.getBoundingClientRect();
  basket.x = Math.max(basket.w/2, Math.min(r.width - basket.w/2, e.clientX - r.left));
});

let dragging=false;
canvas.addEventListener("pointerdown", ()=> dragging=true);
canvas.addEventListener("pointerup", ()=> dragging=false);
canvas.addEventListener("pointermove", e=>{
  if(!dragging) return;
  const r = canvas.getBoundingClientRect();
  basket.x = Math.max(basket.w/2, Math.min(r.width - basket.w/2, e.clientX - r.left));
});

function moveBasket(dt){
  let dir=0;
  if(keys.has("ArrowLeft")||keys.has("a")) dir-=1;
  if(keys.has("ArrowRight")||keys.has("d")) dir+=1;
  if(dir!==0) basket.x += dir * basket.speed * dt;
  basket.x = Math.max(basket.w/2, Math.min(canvas.clientWidth - basket.w/2, basket.x));
}

function handleCatch(){
  for(let i=eggs.length-1;i>=0;i--){
    const e = eggs[i];
    const byTop = basket.y - basket.h/2;
    const byBot = basket.y + basket.h/2;
    const bxL = basket.x - basket.w/2 + 20;
    const bxR = basket.x + basket.w/2 - 20;
    if(e.y + e.h/2 >= byTop && e.y - e.h/2 <= byBot && e.x >= bxL && e.x <= bxR){
      eggs.splice(i,1);
      score = Math.max(0, score + pointsFor(e.type));
      scoreEl.textContent = score;
      // after updating scoreEl.textContent = score;
      if (e.type === "golden")      playSfx(SOUNDS.golden);
      else if (e.type === "rotten") playSfx(SOUNDS.rotten);
      else                          playSfx(SOUNDS.catch);


    }
  }
}

function handleMiss(){
  for(let i=eggs.length-1;i>=0;i--){
    const e = eggs[i];
    if(e.y - e.h/2 > canvas.clientHeight){
      eggs.splice(i,1);
      if(e.type==="normal"){
        lives -= 1;
        updateHearts();
        if(lives<=0){ gameOver(); return; }
      }
    }
  }
}

function gameOver(){
  gameRunning = false;  // 👈 STOP the game
   // 🔊 game over sound
  try { SOUNDS.gameOver.currentTime = 0; SOUNDS.gameOver.play(); } catch {}

    // 🎵 stop music (quick fade)
  const startVol = MUSIC.volume;
  let steps = 6, step = 0;
  const f = setInterval(() => {
    step++;
    MUSIC.volume = Math.max(0, startVol * (1 - step/steps));
    if (step >= steps) {
      clearInterval(f);
      MUSIC.pause();
      MUSIC.volume = startVol; // reset for next round
      musicStarted = false;    // allow restart next round
    }
  }, 60);

  
  // Clear timer interval if it exists
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Update best score if current score is higher
  if (score > bestScore) {
    bestScore = score;
  }
  
  // Display scores in the banner
  document.getElementById("finalScore").textContent = score;
  document.getElementById("bestScore").textContent = bestScore;
  
  // Show encouraging message based on score
  const msgEl = document.getElementById("encouragingMsg");
  if (score < 20) {
    msgEl.textContent = "Keep trying! 🐣";
  } else if (score < 50) {
    msgEl.textContent = "Good effort! 🥚";
  } else if (score < 100) {
    msgEl.textContent = "Great job! ⭐";
  } else {
    msgEl.textContent = "Amazing! 🏆";
  }
  
  // Show the game over banner
  document.getElementById("gameOverBanner").classList.remove("hidden");
}

document.getElementById("backToStart").onclick = () => {
  
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  document.getElementById("gameOverBanner").classList.add("hidden");
  document.getElementById("lives").classList.remove("hidden");
  document.getElementById("timer").classList.add("hidden");
  MUSIC.pause();
  musicStarted = false;
  // 🎵 resume start screen music
  MUSIC_START.currentTime = 0;
  MUSIC_START.play().catch(()=>{});
  startMusicPlaying = true;
};

document.getElementById("playAgain").onclick = () => {
  if (!musicStarted) { MUSIC.currentTime = 0; MUSIC.play().catch(()=>{}); musicStarted = true; }

  document.getElementById("gameOverBanner").classList.add("hidden");
  if (selectedMode === "classic") {
    initClassic();
  } else {
    initTimer();
  }
};

function loop(t){
  if(!gameRunning) return;  // 👈 STOP if game over
  if(paused) { requestAnimationFrame(loop); return; }
  
  const dt = Math.min(0.033, (t - lastT)/1000 || 0);
  lastT = t;
  
  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
  drawPerch();
  drawChickens();
  
  if(t - lastSpawn > spawnEvery){
    spawnEgg();
    lastSpawn = t;
    if(spawnEvery > 350) spawnEvery -= 6;
  }
  
  eggs.forEach(e => e.y += e.vy * dt);
  eggs.forEach(drawEgg);
  drawBasket();
  moveBasket(dt);
  handleCatch();
  handleMiss();
  
  requestAnimationFrame(loop);
}

async function initClassic(){
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas, { passive:true });
  
  const list = await Promise.all([
    loadImage(IMGS.chicken),
    loadImage(IMGS.basket),
    loadImage(IMGS.egg_normal),
    loadImage(IMGS.egg_golden),
    loadImage(IMGS.egg_rotten)
  ]);
  
  imgs = { chicken:list[0], basket:list[1], egg_normal:list[2], egg_golden:list[3], egg_rotten:list[4] };
  
  score = 0; lives = 3; eggs = [];
  basket = { x: canvas.clientWidth/2, y: 0, w: 130, h: 72, speed: 520 };
  spawnEvery = 800;
  paused = false;
  gameRunning = true;  // 👈 Start the game
  
  scoreEl.textContent = score;
  updateHearts();
  
  // Hide timer, show lives
  document.getElementById("timer").classList.add("hidden");
  document.getElementById("lives").classList.remove("hidden");
  
  layoutChickens();
  document.getElementById("gameOverBanner").classList.add("hidden");
  lastT = performance.now();
  lastSpawn = lastT;
  requestAnimationFrame(loop);
}

function loopTimer(t){
  if(!gameRunning) return;  // 👈 STOP if game over
  if(paused) { requestAnimationFrame(loopTimer); return; }
  
  const dt = Math.min(0.033, (t - lastT)/1000 || 0);
  lastT = t;
  
  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
  drawPerch();
  drawChickens();
  
  if(t - lastSpawn > spawnEvery){
    spawnEgg();
    lastSpawn = t;
    if(spawnEvery > 350) spawnEvery -= 6;
  }
  
  eggs.forEach(e => e.y += e.vy * dt);
  eggs.forEach(drawEgg);
  drawBasket();
  moveBasket(dt);
  handleCatchTimer();
  handleMissTimer();
  
  requestAnimationFrame(loopTimer);
}

function handleCatchTimer(){
  for (let i = eggs.length - 1; i >= 0; i--) {
    const e = eggs[i];
    const byTop = basket.y - basket.h / 2;
    const byBot = basket.y + basket.h / 2;
    const bxL  = basket.x - basket.w / 2 + 20;
    const bxR  = basket.x + basket.w / 2 - 20;

    const caught =
      e.y + e.h / 2 >= byTop &&
      e.y - e.h / 2 <= byBot &&
      e.x >= bxL && e.x <= bxR;

    if (caught) {
      eggs.splice(i, 1);
      score = Math.max(0, score + pointsFor(e.type));
      scoreEl.textContent = score;

      // 🔊 catch sounds (same mapping)
      if (e.type === "golden")      playSfx(SOUNDS.golden);
      else if (e.type === "rotten") playSfx(SOUNDS.rotten);
      else                          playSfx(SOUNDS.catch);
    }
  }
}


function handleMissTimer(){
  for(let i=eggs.length-1;i>=0;i--){
    const e = eggs[i];
    // Just remove eggs that fall off screen (NO life penalty in timer mode)
    if(e.y - e.h/2 > canvas.clientHeight){
      eggs.splice(i,1);
    }
  }
}

async function initTimer(){
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas, { passive:true });
  
  const list = await Promise.all([
    loadImage(IMGS.chicken),
    loadImage(IMGS.basket),
    loadImage(IMGS.egg_normal),
    loadImage(IMGS.egg_golden),
    loadImage(IMGS.egg_rotten)
  ]);
  
  imgs = { chicken:list[0], basket:list[1], egg_normal:list[2], egg_golden:list[3], egg_rotten:list[4] };
  
  score = 0;
  timeLeft = 60;
  eggs = [];
  basket = { x: canvas.clientWidth/2, y: 0, w: 130, h: 72, speed: 520 };
  spawnEvery = 800;
  paused = false;
  gameRunning = true;  // 👈 Start the game
  
  scoreEl.textContent = score;
  document.getElementById("timeLeft").textContent = timeLeft;
  
  // Hide lives, show timer
  document.getElementById("lives").classList.add("hidden");
  document.getElementById("timer").classList.remove("hidden");
  
  // Start countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timeLeft").textContent = timeLeft;
    
    const timerEl = document.getElementById("timer");
    if (timeLeft <= 10) {
      timerEl.classList.add("warning");
    }
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameOver();
    }
  }, 1000);
  
  layoutChickens();
  document.getElementById("gameOverBanner").classList.add("hidden");
  lastT = performance.now();
  lastSpawn = lastT;
  requestAnimationFrame(loopTimer);
}
