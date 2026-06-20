const words = {
  A: "Apple",
  B: "Ball",
  C: "Cat",
  D: "Duck",
  E: "Egg",
  F: "Fish",
  G: "Gift",
  H: "Hat",
  I: "Ice",
  J: "Jam",
  K: "Key",
  L: "Lion",
  M: "Moon",
  N: "Nest",
  O: "Orange",
  P: "Panda",
  Q: "Queen",
  R: "Rainbow",
  S: "Sun",
  T: "Train",
  U: "Umbrella",
  V: "Violin",
  W: "Whale",
  X: "Xylophone",
  Y: "Yoyo",
  Z: "Zebra",
};

const alphabet = Object.keys(words);
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const colors = ["#ff715b", "#4c8df6", "#41c99b", "#f87bc8", "#ffb12b"];
const numberWordsKo = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const operationLabels = {
  number: "숫자",
  add: "덧셈",
  subtract: "뺄셈",
  multiply: "곱셈",
  divide: "나눗셈",
};

// 색깔 놀이: 포토샵식 컬러 피커로 연속 선택, RGB 평균으로 섞기

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) { [r, g, b] = [c, x, 0]; }
  else if (h < 120) { [r, g, b] = [x, c, 0]; }
  else if (h < 180) { [r, g, b] = [0, c, x]; }
  else if (h < 240) { [r, g, b] = [0, x, c]; }
  else if (h < 300) { [r, g, b] = [x, 0, c]; }
  else { [r, g, b] = [c, 0, x]; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function mixRgb(a, b) {
  return {
    r: Math.round((a.r + b.r) / 2),
    g: Math.round((a.g + b.g) / 2),
    b: Math.round((a.b + b.b) / 2),
  };
}

function hueBaseName(h) {
  if (h < 15) return "빨강";
  if (h < 45) return "주황";
  if (h < 70) return "노랑";
  if (h < 90) return "연두";
  if (h < 160) return "초록";
  if (h < 195) return "청록";
  if (h < 255) return "파랑";
  if (h < 300) return "보라";
  if (h < 330) return "자주";
  return "빨강";
}

// RGB 값을 한글 색 이름으로 변환
function nameColorKo(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);

  // 무채색 (채도가 거의 없을 때)
  if (s < 0.12) {
    if (l < 0.15) return "검정";
    if (l > 0.92) return "하양";
    if (l > 0.66) return "밝은 회색";
    if (l < 0.33) return "어두운 회색";
    return "회색";
  }

  const reddish = h < 15 || h >= 330;
  const orange = h >= 15 && h < 45;
  const yellow = h >= 45 && h < 70;
  const cyan = h >= 160 && h < 195;
  const blue = h >= 195 && h < 255;
  const purple = h >= 255 && h < 300;

  // 명도·채도와 결합된 고유 이름
  if ((orange || yellow || (reddish && h < 15)) && l < 0.42 && s > 0.18) {
    return l < 0.26 ? "진한 갈색" : "갈색";
  }
  if (blue && l < 0.35) return "남색";
  if ((blue || cyan) && l > 0.72) return "하늘색";
  if (reddish && l > 0.74) return l > 0.86 ? "연분홍" : "분홍";
  if (purple && l > 0.74) return "연보라";

  // 일반 색상 + 밝기/탁함 수식어
  const base = hueBaseName(h);
  if (l > 0.80) return `연한 ${base}`;
  if (l < 0.30) return `진한 ${base}`;
  if (s < 0.22) return `칙칙한 ${base}`;
  return base;
}

// 모양 놀이: 색깔 + 모양 맞추기
const shapeColors = [
  { key: "빨강", hex: "#e8473f" },
  { key: "주황", hex: "#ff8a1e" },
  { key: "노랑", hex: "#ffd21e" },
  { key: "초록", hex: "#36c95a" },
  { key: "파랑", hex: "#2f7ff0" },
  { key: "하늘", hex: "#56c5ff" },
  { key: "보라", hex: "#9b51e0" },
  { key: "분홍", hex: "#ff7eb6" },
  { key: "갈색", hex: "#9c6b3f" },
  { key: "검정", hex: "#2b2b2b" },
];

const shapeDefs = [
  { key: "triangle", label: "세모", svg: '<polygon points="50,8 90,88 10,88"/>' },
  { key: "square", label: "네모", svg: '<rect x="10" y="10" width="80" height="80" rx="8"/>' },
  { key: "circle", label: "동그라미", svg: '<circle cx="50" cy="50" r="44"/>' },
  { key: "star", label: "별", svg: '<polygon points="50,2 61.2,34.6 95.6,35.2 68.1,55.9 78.2,88.8 50,69 21.8,88.8 31.9,55.9 4.3,35.2 38.8,34.6"/>' },
  { key: "rectangle", label: "직사각형", svg: '<rect x="6" y="26" width="88" height="48" rx="8"/>' },
  { key: "ellipse", label: "타원", svg: '<ellipse cx="50" cy="50" rx="46" ry="30"/>' },
  { key: "diamond", label: "마름모", svg: '<polygon points="50,6 92,50 50,94 8,50"/>' },
];

function shapeSvgMarkup(shapeKey, fill) {
  const def = shapeDefs.find((item) => item.key === shapeKey);
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="${fill}">${def.svg}</svg>`;
}

const stage = document.querySelector("#stage");
const letterCard = document.querySelector("#letterCard");
const bigLetter = document.querySelector("#bigLetter");
const phonics = document.querySelector("#phonics");
const promptLabel = document.querySelector("#promptLabel");
const celebration = document.querySelector("#celebration");
const inputPad = document.querySelector("#inputPad");
const appTitle = document.querySelector("#appTitle");
const eyebrow = document.querySelector("#eyebrow");
const operationTabs = document.querySelector("#operationTabs");
const operationButtons = [...document.querySelectorAll(".operation-button")];
const alphabetPlayButton = document.querySelector("#alphabetPlayButton");
const numberPlayButton = document.querySelector("#numberPlayButton");
const colorPlayButton = document.querySelector("#colorPlayButton");
const modeToggle = document.querySelector("#modeToggle");
const showModeButton = document.querySelector("#showModeButton");
const quizModeButton = document.querySelector("#quizModeButton");
const nextQuizButton = document.querySelector("#nextQuizButton");
const soundToggle = document.querySelector("#soundToggle");
const letterZone = document.querySelector("#letterZone");
const colorZone = document.querySelector("#colorZone");
const colorCard = document.querySelector("#colorCard");
const colorCelebration = document.querySelector("#colorCelebration");
const colorPrompt = document.querySelector("#colorPrompt");
const swatchA = document.querySelector("#swatchA");
const swatchB = document.querySelector("#swatchB");
const swatchResult = document.querySelector("#swatchResult");
const nameA = document.querySelector("#nameA");
const nameB = document.querySelector("#nameB");
const nameResult = document.querySelector("#nameResult");
const colorSlotA = document.querySelector("#colorSlotA");
const colorSlotB = document.querySelector("#colorSlotB");
const svSquare = document.querySelector("#svSquare");
const svThumb = document.querySelector("#svThumb");
const hueSlider = document.querySelector("#hueSlider");
const hueThumb = document.querySelector("#hueThumb");
const shapePlayButton = document.querySelector("#shapePlayButton");
const shapeZone = document.querySelector("#shapeZone");
const shapeCard = document.querySelector("#shapeCard");
const shapeTarget = document.querySelector("#shapeTarget");
const shapePrompt = document.querySelector("#shapePrompt");
const shapeCelebration = document.querySelector("#shapeCelebration");

let playKind = "alphabet";
let mode = "show";
let numberQuizKind = "number";
let currentValue = "A";
let typedNumber = "";
let currentQuizHint = "";
let quizTimer;
let soundOn = true;
let audioContext;
// 두 색깔을 HSV(색상·채도·명도)로 저장, activeColorSlot이 지금 고르는 칸
let colorState = [
  { h: 0, s: 0.85, v: 0.92 },
  { h: 215, s: 0.85, v: 0.92 },
];
let activeColorSlot = 0;
let shapeTargetColor = "";
let shapeTargetShape = "";
let shapeSelectedColor = "";
let shapeSelectedShape = "";
let shapeLocked = false;

function setDisplay(value, label, effect = "pop") {
  currentValue = String(value);
  bigLetter.textContent = currentValue;
  bigLetter.classList.toggle("problem", /[+\-x÷]/.test(currentValue));
  bigLetter.style.color = colors[colorIndex(currentValue)];
  phonics.textContent = label;
  pulseCard(effect);
}

function colorIndex(value) {
  return [...String(value)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
}

function pulseCard(className) {
  letterCard.classList.remove("pop", "correct", "wrong");
  void letterCard.offsetWidth;
  letterCard.classList.add(className);
}

function setPlayKind(nextKind) {
  playKind = nextKind;
  typedNumber = "";
  window.clearTimeout(quizTimer);
  updateStageState();
  renderPlayKindTabs();
  renderChrome();
  renderOperationTabs();
  updateZones();
  buildPad();

  if (playKind === "color") {
    startColorPlay();
    return;
  }

  if (playKind === "shape") {
    startShapePlay();
    return;
  }

  setMode(mode);
}

function setMode(nextMode) {
  mode = nextMode;
  typedNumber = "";
  window.clearTimeout(quizTimer);
  updateStageState();
  showModeButton.classList.toggle("active", mode === "show");
  quizModeButton.classList.toggle("active", mode === "quiz");
  showModeButton.setAttribute("aria-selected", String(mode === "show"));
  quizModeButton.setAttribute("aria-selected", String(mode === "quiz"));
  nextQuizButton.style.visibility = mode === "quiz" ? "visible" : "hidden";
  renderOperationTabs();

  if (mode === "quiz") {
    startQuiz();
    return;
  }

  if (playKind === "alphabet") {
    promptLabel.textContent = "키보드에서 알파벳을 눌러보세요";
    setDisplay(alphabet.includes(currentValue) ? currentValue : "A", words[alphabet.includes(currentValue) ? currentValue : "A"]);
  } else {
    promptLabel.textContent = "키보드나 버튼으로 숫자를 눌러보세요";
    setDisplay("0", "영");
  }
}

function renderChrome() {
  if (playKind === "alphabet") {
    appTitle.textContent = "알파벳 놀이터";
    eyebrow.textContent = "ALPHABET PLAY";
    nextQuizButton.textContent = "다음 문제";
  } else if (playKind === "number") {
    appTitle.textContent = "숫자 놀이터";
    eyebrow.textContent = "NUMBER PLAY";
    nextQuizButton.textContent = "다음 숫자";
  } else if (playKind === "color") {
    appTitle.textContent = "색깔 놀이터";
    eyebrow.textContent = "COLOR PLAY";
    nextQuizButton.textContent = "랜덤 색깔";
  } else {
    appTitle.textContent = "모양 놀이터";
    eyebrow.textContent = "SHAPE PLAY";
    nextQuizButton.textContent = "다음 문제";
  }
}

function renderPlayKindTabs() {
  alphabetPlayButton.classList.toggle("active", playKind === "alphabet");
  numberPlayButton.classList.toggle("active", playKind === "number");
  colorPlayButton.classList.toggle("active", playKind === "color");
  shapePlayButton.classList.toggle("active", playKind === "shape");
  alphabetPlayButton.setAttribute("aria-selected", String(playKind === "alphabet"));
  numberPlayButton.setAttribute("aria-selected", String(playKind === "number"));
  colorPlayButton.setAttribute("aria-selected", String(playKind === "color"));
  shapePlayButton.setAttribute("aria-selected", String(playKind === "shape"));
}

function updateZones() {
  const isColor = playKind === "color";
  const isShape = playKind === "shape";
  const isLetterLike = !isColor && !isShape;
  letterZone.hidden = !isLetterLike;
  colorZone.hidden = !isColor;
  shapeZone.hidden = !isShape;
  modeToggle.hidden = isColor || isShape;
  if (isColor || isShape) {
    nextQuizButton.style.visibility = "visible";
  }
}

function updateStageState() {
  const isNumberQuiz = playKind === "number" && mode === "quiz";
  stage.classList.toggle("number-quiz", isNumberQuiz);
  stage.classList.toggle("operation-quiz", isNumberQuiz && numberQuizKind !== "number");
}

function renderOperationTabs() {
  const isNumberQuiz = playKind === "number" && mode === "quiz";
  operationTabs.classList.toggle("visible", isNumberQuiz);
  operationButtons.forEach((button) => {
    const isActive = button.dataset.operation === numberQuizKind;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function setNumberQuizKind(nextKind) {
  numberQuizKind = nextKind;
  typedNumber = "";
  updateStageState();
  renderOperationTabs();
  if (playKind === "number" && mode === "quiz") {
    startQuiz();
  }
}

function slotRgb(index) {
  const { h, s, v } = colorState[index];
  return hsvToRgb(h, s, v);
}

function paintSwatch(swatchEl, nameEl, rgb) {
  swatchEl.classList.remove("empty");
  swatchEl.style.background = rgbToHex(rgb);
  nameEl.textContent = nameColorKo(rgb.r, rgb.g, rgb.b);
}

function setActiveSlot(index) {
  activeColorSlot = index;
  colorSlotA.classList.toggle("active", index === 0);
  colorSlotB.classList.toggle("active", index === 1);
  syncPicker();
}

function syncPicker() {
  const { h, s, v } = colorState[activeColorSlot];
  // 채도/명도 박스 배경을 현재 색상(hue)에 맞추고, 점 위치 갱신
  const pureHue = rgbToHex(hsvToRgb(h, 1, 1));
  svSquare.style.setProperty("--hue-color", pureHue);
  svThumb.style.left = `${s * 100}%`;
  svThumb.style.top = `${(1 - v) * 100}%`;
  svThumb.style.background = rgbToHex(hsvToRgb(h, s, v));
  hueThumb.style.left = `${(h / 360) * 100}%`;
  hueThumb.style.background = pureHue;
}

function renderColorPlay() {
  const rgbA = slotRgb(0);
  const rgbB = slotRgb(1);
  const rgbMix = mixRgb(rgbA, rgbB);
  paintSwatch(swatchA, nameA, rgbA);
  paintSwatch(swatchB, nameB, rgbB);
  paintSwatch(swatchResult, nameResult, rgbMix);
  colorPrompt.textContent = `${nameColorKo(rgbA.r, rgbA.g, rgbA.b)} + ${nameColorKo(rgbB.r, rgbB.g, rgbB.b)} = ${nameColorKo(rgbMix.r, rgbMix.g, rgbMix.b)}`;
}

function startColorPlay() {
  setActiveSlot(0);
  renderColorPlay();
}

function randomizeColors() {
  colorState = colorState.map(() => ({
    h: Math.random() * 360,
    s: 0.55 + Math.random() * 0.45,
    v: 0.55 + Math.random() * 0.45,
  }));
  playTone("tap");
  syncPicker();
  renderColorPlay();
  swatchResult.classList.remove("reveal");
  void swatchResult.offsetWidth;
  swatchResult.classList.add("reveal");
  burst("correct", colorCard, colorCelebration);
}

function pointerRatio(event, element) {
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
}

function pickFromSquare(event) {
  const { x, y } = pointerRatio(event, svSquare);
  colorState[activeColorSlot].s = x;
  colorState[activeColorSlot].v = 1 - y;
  syncPicker();
  renderColorPlay();
}

function pickFromHue(event) {
  const { x } = pointerRatio(event, hueSlider);
  colorState[activeColorSlot].h = x * 360;
  syncPicker();
  renderColorPlay();
}

function bindDrag(element, handler) {
  let active = false;
  element.addEventListener("pointerdown", (event) => {
    active = true;
    element.setPointerCapture(event.pointerId);
    playTone("tap");
    handler(event);
  });
  element.addEventListener("pointermove", (event) => {
    if (active) handler(event);
  });
  const stop = () => { active = false; };
  element.addEventListener("pointerup", stop);
  element.addEventListener("pointercancel", stop);
}

function startShapePlay() {
  newShapeProblem();
}

function newShapeProblem() {
  window.clearTimeout(quizTimer);
  shapeLocked = false;
  shapeSelectedColor = "";
  shapeSelectedShape = "";
  shapeTargetColor = shapeColors[Math.floor(Math.random() * shapeColors.length)].key;
  shapeTargetShape = shapeDefs[Math.floor(Math.random() * shapeDefs.length)].key;

  const hex = shapeColors.find((item) => item.key === shapeTargetColor).hex;
  shapeTarget.innerHTML = shapeSvgMarkup(shapeTargetShape, hex);
  shapePrompt.textContent = "같은 색과 모양을 골라보세요";
  pulseShape("pop");
  refreshShapeSelection();
}

function refreshShapeSelection() {
  inputPad.querySelectorAll(".pick-color").forEach((button) => {
    button.classList.toggle("selected", button.dataset.color === shapeSelectedColor);
  });
  inputPad.querySelectorAll(".pick-shape").forEach((button) => {
    button.classList.toggle("selected", button.dataset.shape === shapeSelectedShape);
  });
}

function selectShapeColor(key) {
  if (shapeLocked) return;
  shapeSelectedColor = key;
  playTone("tap");
  refreshShapeSelection();
  checkShapeAnswer();
}

function selectShapeShape(key) {
  if (shapeLocked) return;
  shapeSelectedShape = key;
  playTone("tap");
  refreshShapeSelection();
  checkShapeAnswer();
}

function checkShapeAnswer() {
  if (!shapeSelectedColor || !shapeSelectedShape) return;

  if (shapeSelectedColor === shapeTargetColor && shapeSelectedShape === shapeTargetShape) {
    shapeLocked = true;
    shapePrompt.textContent = "맞았어요!";
    pulseShape("correct");
    flashStage("stage-correct");
    playTone("correct");
    burst("correct", shapeCard, shapeCelebration);
    quizTimer = window.setTimeout(newShapeProblem, 1050);
  } else {
    shapePrompt.textContent = "다시 골라볼까요?";
    pulseShape("wrong");
    flashStage("stage-wrong");
    playTone("wrong");
  }
}

function pulseShape(className) {
  shapeTarget.classList.remove("pop", "correct", "wrong");
  void shapeTarget.offsetWidth;
  shapeTarget.classList.add(className);
}

function startQuiz() {
  typedNumber = "";
  currentQuizHint = "";

  if (playKind === "alphabet") {
    const next = alphabet[Math.floor(Math.random() * alphabet.length)];
    promptLabel.textContent = "이 알파벳을 눌러보세요";
    setDisplay(next, words[next]);
    return;
  }

  if (numberQuizKind === "number") {
    const next = String(Math.floor(Math.random() * 1000));
    promptLabel.textContent = "이 숫자를 똑같이 눌러보세요";
    currentQuizHint = numberToKorean(next);
    setDisplay(next, numberToKorean(next));
    return;
  }

  const problem = makeOperationProblem(numberQuizKind);
  promptLabel.textContent = `${operationLabels[numberQuizKind]} 문제`;
  currentQuizHint = problem.spoken;
  setDisplay(problem.expression, problem.spoken);
  currentValue = String(problem.answer);
}

function handleKeyInput(rawValue) {
  if (playKind === "color" || playKind === "shape") return;

  const letter = rawValue.toUpperCase();

  if (playKind === "alphabet") {
    handleAlphabetInput(letter);
    return;
  }

  if (/^\d$/.test(rawValue)) {
    handleNumberInput(rawValue);
  } else if (rawValue === "Backspace") {
    backspaceNumber();
  } else if (rawValue === "Enter" && mode === "quiz") {
    checkNumberAnswer();
  }
}

function handleAlphabetInput(letter) {
  if (!alphabet.includes(letter)) return;

  if (mode === "show") {
    promptLabel.textContent = `${letter} 를 눌렀어요`;
    setDisplay(letter, words[letter]);
    playTone("tap");
    burst("tap");
    return;
  }

  if (letter === currentValue) {
    correctAnswer();
  } else {
    wrongAnswer();
  }
}

function handleNumberInput(digit) {
  if (mode === "show") {
    typedNumber = normalizeNumber(`${typedNumber}${digit}`).slice(0, 3);
    promptLabel.textContent = `${typedNumber} 를 눌렀어요`;
    setDisplay(typedNumber, numberToKorean(typedNumber));
    playTone("tap");
    burst("tap");
    return;
  }

  typedNumber = `${typedNumber}${digit}`.slice(0, currentValue.length);
  promptLabel.textContent = typedNumber || "숫자를 눌러보세요";
  phonics.textContent = typedNumber ? numberToKorean(typedNumber) : currentQuizHint;

  if (typedNumber.length === currentValue.length) {
    checkNumberAnswer();
  } else {
    playTone("tap");
  }
}

function checkNumberAnswer() {
  if (normalizeNumber(typedNumber) === normalizeNumber(currentValue)) {
    correctAnswer();
  } else {
    typedNumber = "";
    wrongAnswer();
  }
}

function backspaceNumber() {
  if (playKind !== "number") return;
  typedNumber = typedNumber.slice(0, -1);

  if (mode === "show") {
    const next = typedNumber || "0";
    promptLabel.textContent = typedNumber ? `${typedNumber} 를 눌렀어요` : "키보드나 버튼으로 숫자를 눌러보세요";
    setDisplay(next, numberToKorean(next));
  } else {
    promptLabel.textContent = typedNumber || "숫자를 눌러보세요";
    phonics.textContent = typedNumber ? numberToKorean(typedNumber) : currentQuizHint;
  }
}

function correctAnswer() {
  promptLabel.textContent = "맞았어요!";
  pulseCard("correct");
  flashStage("stage-correct");
  playTone("correct");
  burst("correct");
  quizTimer = window.setTimeout(startQuiz, 950);
}

function wrongAnswer() {
  promptLabel.textContent = "다시 해볼까요?";
  pulseCard("wrong");
  flashStage("stage-wrong");
  playTone("wrong");
}

function normalizeNumber(value) {
  return String(Number(value || 0));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeOperationProblem(kind) {
  if (kind === "add") {
    const answer = randomInt(0, 19);
    const left = randomInt(0, answer);
    const right = answer - left;
    return makeProblem(`${left} + ${right}`, answer, left, "더하기", right);
  }

  if (kind === "subtract") {
    const answer = randomInt(0, 19);
    const right = randomInt(0, 19 - answer);
    const left = answer + right;
    return makeProblem(`${left} - ${right}`, answer, left, "빼기", right);
  }

  if (kind === "multiply") {
    const problems = [];
    for (let left = 0; left <= 9; left += 1) {
      for (let right = 0; right <= 9; right += 1) {
        const answer = left * right;
        if (answer <= 20) {
          problems.push({ left, right, answer });
        }
      }
    }

    const problem = problems[randomInt(0, problems.length - 1)];
    const { left, right, answer } = problem;
    return makeProblem(`${left} x ${right}`, answer, left, "곱하기", right);
  }

  if (kind === "divide") {
    const problems = [];
    for (let dividend = 1; dividend <= 20; dividend += 1) {
      for (let divisor = 1; divisor <= 9; divisor += 1) {
        if (dividend % divisor === 0) {
          problems.push({ dividend, divisor, answer: dividend / divisor });
        }
      }
    }

    const problem = problems[randomInt(0, problems.length - 1)];
    const { dividend, divisor, answer } = problem;
    return makeProblem(`${dividend} ÷ ${divisor}`, answer, dividend, "나누기", divisor);
  }

  return makeProblem("0", 0, 0, "", 0);
}

function makeProblem(expression, answer, left, operator, right) {
  return {
    expression,
    answer,
    spoken: operator
      ? `${numberToKorean(left)} ${operator} ${numberToKorean(right)}`
      : numberToKorean(answer),
  };
}

function numberToKorean(value) {
  const number = Number(normalizeNumber(value));
  if (number === 0) return numberWordsKo[0];

  const hundreds = Math.floor(number / 100);
  const tens = Math.floor((number % 100) / 10);
  const ones = number % 10;
  let spoken = "";

  if (hundreds > 0) {
    spoken += `${hundreds === 1 ? "" : numberWordsKo[hundreds]}백`;
  }

  if (tens > 0) {
    spoken += `${tens === 1 ? "" : numberWordsKo[tens]}십`;
  }

  if (ones > 0) {
    spoken += numberWordsKo[ones];
  }

  return spoken;
}

function flashStage(className) {
  stage.classList.remove("stage-correct", "stage-wrong");
  void stage.offsetWidth;
  stage.classList.add(className);
}

function burst(kind, anchor = letterCard, layer = celebration) {
  const rect = anchor.getBoundingClientRect();
  const layerRect = layer.getBoundingClientRect();
  const centerX = rect.left - layerRect.left + rect.width / 2;
  const centerY = rect.top - layerRect.top + rect.height / 2;
  const count = kind === "correct" ? 34 : 12;

  for (let index = 0; index < count; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const distance = 90 + Math.random() * 170;
    spark.className = "spark";
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
    spark.style.setProperty("--spark-color", colors[index % colors.length]);
    layer.appendChild(spark);
    window.setTimeout(() => spark.remove(), 950);
  }
}

function ensureAudio() {
  if (!soundOn) return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(type) {
  const context = ensureAudio();
  if (!context) return;

  const now = context.currentTime;
  const notes = {
    tap: [523.25, 659.25],
    correct: [523.25, 659.25, 783.99, 1046.5],
    wrong: [220, 185],
  }[type];

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type === "wrong" ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.09);
    gain.gain.setValueAtTime(0.001, now + index * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.22, now + index * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + index * 0.09);
    oscillator.stop(now + index * 0.09 + 0.2);
  });
}

function buildPad() {
  inputPad.innerHTML = "";
  inputPad.classList.toggle("number-pad", playKind === "number");
  inputPad.classList.toggle("color-pad", playKind === "color");
  inputPad.classList.toggle("shape-pad", playKind === "shape");

  if (playKind === "color") {
    // 색깔 놀이는 색깔 영역 안의 컬러 피커를 사용하므로 입력 패드는 비워 둔다
    return;
  }

  if (playKind === "shape") {
    buildShapePad();
    return;
  }

  if (playKind === "alphabet") {
    alphabet.forEach((letter) => {
      const button = document.createElement("button");
      button.className = "letter-button";
      button.type = "button";
      button.textContent = letter;
      button.setAttribute("aria-label", `${letter} 알파벳`);
      button.addEventListener("click", () => handleAlphabetInput(letter));
      inputPad.appendChild(button);
    });
    return;
  }

  digits.forEach((digit) => {
    const button = document.createElement("button");
    button.className = "number-button";
    button.type = "button";
    button.textContent = digit;
    button.setAttribute("aria-label", `${digit} 숫자`);
    button.addEventListener("click", () => handleNumberInput(digit));
    inputPad.appendChild(button);
  });

  const clearButton = document.createElement("button");
  clearButton.className = "number-button clear-button";
  clearButton.type = "button";
  clearButton.textContent = "지우기";
  clearButton.addEventListener("click", backspaceNumber);
  inputPad.appendChild(clearButton);
}

function buildShapePad() {
  const colorRow = document.createElement("div");
  colorRow.className = "shape-pick-row";
  shapeColors.forEach(({ key, hex }) => {
    const button = document.createElement("button");
    button.className = "shape-pick pick-color";
    button.type = "button";
    button.dataset.color = key;
    button.setAttribute("aria-label", `${key} 색깔`);
    const chip = document.createElement("span");
    chip.className = "pick-swatch";
    chip.style.background = hex;
    const name = document.createElement("span");
    name.className = "pick-name";
    name.textContent = key;
    button.append(chip, name);
    button.addEventListener("click", () => selectShapeColor(key));
    colorRow.appendChild(button);
  });

  const shapeRow = document.createElement("div");
  shapeRow.className = "shape-pick-row";
  shapeDefs.forEach(({ key, label }) => {
    const button = document.createElement("button");
    button.className = "shape-pick pick-shape";
    button.type = "button";
    button.dataset.shape = key;
    button.setAttribute("aria-label", `${label} 모양`);
    const icon = document.createElement("span");
    icon.className = "pick-icon";
    icon.innerHTML = shapeSvgMarkup(key, "#5f6f85");
    const name = document.createElement("span");
    name.className = "pick-name";
    name.textContent = label;
    button.append(icon, name);
    button.addEventListener("click", () => selectShapeShape(key));
    shapeRow.appendChild(button);
  });

  inputPad.append(colorRow, shapeRow);
}

document.addEventListener("keydown", (event) => {
  handleKeyInput(event.key);
});

alphabetPlayButton.addEventListener("click", () => setPlayKind("alphabet"));
numberPlayButton.addEventListener("click", () => setPlayKind("number"));
colorPlayButton.addEventListener("click", () => setPlayKind("color"));
shapePlayButton.addEventListener("click", () => setPlayKind("shape"));
showModeButton.addEventListener("click", () => setMode("show"));
quizModeButton.addEventListener("click", () => setMode("quiz"));
operationButtons.forEach((button) => {
  button.addEventListener("click", () => setNumberQuizKind(button.dataset.operation));
});
nextQuizButton.addEventListener("click", () => {
  if (playKind === "color") {
    randomizeColors();
    return;
  }
  if (playKind === "shape") {
    newShapeProblem();
    return;
  }
  startQuiz();
});

colorSlotA.addEventListener("click", () => {
  if (activeColorSlot !== 0) playTone("tap");
  setActiveSlot(0);
});
colorSlotB.addEventListener("click", () => {
  if (activeColorSlot !== 1) playTone("tap");
  setActiveSlot(1);
});
bindDrag(svSquare, pickFromSquare);
bindDrag(hueSlider, pickFromHue);
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.classList.toggle("active", soundOn);
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  soundToggle.textContent = soundOn ? "소리 켬" : "소리 끔";
  if (soundOn) playTone("tap");
});

function readInitialState() {
  const params = new URLSearchParams(window.location.search);
  const requestedPlay = params.get("play");
  const requestedMode = params.get("mode");
  const requestedOperation = params.get("op");

  if (requestedOperation && operationLabels[requestedOperation]) {
    numberQuizKind = requestedOperation;
  }

  if (requestedPlay === "number") {
    playKind = "number";
  } else if (requestedPlay === "color") {
    playKind = "color";
  } else if (requestedPlay === "shape") {
    playKind = "shape";
  } else {
    playKind = "alphabet";
  }
  mode = requestedMode === "quiz" ? "quiz" : "show";
}

readInitialState();
renderPlayKindTabs();
renderChrome();
updateStageState();
renderOperationTabs();
updateZones();
buildPad();

if (playKind === "color") {
  startColorPlay();
} else if (playKind === "shape") {
  startShapePlay();
} else {
  setMode(mode);
}
