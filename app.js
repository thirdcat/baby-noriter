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

// 고를 수 있는 기본 색깔 (이름 -> 색상값)
const colorPalette = {
  빨강: "#e8473f",
  주황: "#ff8a1e",
  노랑: "#ffd21e",
  초록: "#36c95a",
  파랑: "#2f7ff0",
  보라: "#9b51e0",
  하양: "#ffffff",
  검정: "#2b2b2b",
};

// 결과로 나올 수 있는 색깔 (기본 색깔 + 섞어서 나오는 색깔)
const resultColors = {
  ...colorPalette,
  분홍: "#ff9ec7",
  갈색: "#9c6b3f",
  회색: "#9aa7b4",
  하늘: "#8ed0ff",
  연두: "#b6e84f",
  남색: "#28408f",
  청록: "#18b6b6",
};

// 두 색깔을 섞었을 때의 결과 (순서 상관 없음)
const mixRules = [
  ["빨강", "노랑", "주황"],
  ["빨강", "파랑", "보라"],
  ["빨강", "초록", "갈색"],
  ["빨강", "주황", "주황"],
  ["빨강", "보라", "보라"],
  ["빨강", "하양", "분홍"],
  ["빨강", "검정", "갈색"],
  ["주황", "노랑", "주황"],
  ["주황", "초록", "갈색"],
  ["주황", "파랑", "갈색"],
  ["주황", "보라", "갈색"],
  ["주황", "하양", "분홍"],
  ["주황", "검정", "갈색"],
  ["노랑", "초록", "연두"],
  ["노랑", "파랑", "초록"],
  ["노랑", "보라", "갈색"],
  ["노랑", "하양", "노랑"],
  ["노랑", "검정", "갈색"],
  ["초록", "파랑", "청록"],
  ["초록", "보라", "갈색"],
  ["초록", "하양", "연두"],
  ["초록", "검정", "초록"],
  ["파랑", "보라", "보라"],
  ["파랑", "하양", "하늘"],
  ["파랑", "검정", "남색"],
  ["보라", "하양", "분홍"],
  ["보라", "검정", "보라"],
  ["하양", "검정", "회색"],
];

const mixTable = {};
mixRules.forEach(([first, second, result]) => {
  mixTable[[first, second].sort().join("|")] = result;
});

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

let playKind = "alphabet";
let mode = "show";
let numberQuizKind = "number";
let currentValue = "A";
let typedNumber = "";
let currentQuizHint = "";
let quizTimer;
let soundOn = true;
let audioContext;
let colorSlots = [null, null];
let activeColorSlot = 0;

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
  resetColorSlots();
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
  } else {
    appTitle.textContent = "색깔 놀이터";
    eyebrow.textContent = "COLOR PLAY";
    nextQuizButton.textContent = "다시 하기";
  }
}

function renderPlayKindTabs() {
  alphabetPlayButton.classList.toggle("active", playKind === "alphabet");
  numberPlayButton.classList.toggle("active", playKind === "number");
  colorPlayButton.classList.toggle("active", playKind === "color");
  alphabetPlayButton.setAttribute("aria-selected", String(playKind === "alphabet"));
  numberPlayButton.setAttribute("aria-selected", String(playKind === "number"));
  colorPlayButton.setAttribute("aria-selected", String(playKind === "color"));
}

function updateZones() {
  const isColor = playKind === "color";
  colorZone.hidden = !isColor;
  letterZone.hidden = isColor;
  modeToggle.hidden = isColor;
  if (isColor) {
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

function resetColorSlots() {
  colorSlots = [null, null];
  activeColorSlot = 0;
}

function startColorPlay() {
  resetColorSlots();
  colorPrompt.textContent = "첫 번째 색깔을 골라보세요";
  renderColorSlots();
}

function colorsReady() {
  return Boolean(colorSlots[0]) && Boolean(colorSlots[1]);
}

function mixColors(first, second) {
  if (first === second) return first;
  return mixTable[[first, second].sort().join("|")] || first;
}

function setSwatch(swatchEl, nameEl, name) {
  if (!name) {
    swatchEl.classList.add("empty");
    swatchEl.style.background = "";
    nameEl.textContent = "?";
    return;
  }
  swatchEl.classList.remove("empty");
  swatchEl.style.background = resultColors[name] || colorPalette[name];
  nameEl.textContent = name;
}

function renderColorSlots() {
  setSwatch(swatchA, nameA, colorSlots[0]);
  setSwatch(swatchB, nameB, colorSlots[1]);
  if (!colorsReady()) {
    setSwatch(swatchResult, nameResult, null);
  }
  colorSlotA.classList.toggle("active", !colorsReady() && activeColorSlot === 0);
  colorSlotB.classList.toggle("active", !colorsReady() && activeColorSlot === 1);
}

function handleColorInput(name) {
  if (colorsReady()) {
    resetColorSlots();
  }

  colorSlots[activeColorSlot] = name;
  playTone("tap");

  if (activeColorSlot === 0) {
    activeColorSlot = 1;
    colorPrompt.textContent = "두 번째 색깔을 골라보세요";
    renderColorSlots();
    return;
  }

  activeColorSlot = 0;
  renderColorSlots();
  revealMix();
}

function revealMix() {
  const [first, second] = colorSlots;
  const result = mixColors(first, second);
  setSwatch(swatchResult, nameResult, result);
  colorPrompt.textContent = `${first} + ${second} = ${result}`;
  swatchResult.classList.remove("reveal");
  void swatchResult.offsetWidth;
  swatchResult.classList.add("reveal");
  playTone("correct");
  burst("correct", colorCard, colorCelebration);
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
  if (playKind === "color") return;

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

  if (playKind === "color") {
    Object.entries(colorPalette).forEach(([name, hex]) => {
      const button = document.createElement("button");
      button.className = "color-button";
      button.type = "button";
      button.style.background = hex;
      button.setAttribute("aria-label", `${name} 색깔`);
      const tag = document.createElement("span");
      tag.className = "color-button-name";
      tag.textContent = name;
      button.appendChild(tag);
      button.addEventListener("click", () => handleColorInput(name));
      inputPad.appendChild(button);
    });
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

document.addEventListener("keydown", (event) => {
  handleKeyInput(event.key);
});

alphabetPlayButton.addEventListener("click", () => setPlayKind("alphabet"));
numberPlayButton.addEventListener("click", () => setPlayKind("number"));
colorPlayButton.addEventListener("click", () => setPlayKind("color"));
showModeButton.addEventListener("click", () => setMode("show"));
quizModeButton.addEventListener("click", () => setMode("quiz"));
operationButtons.forEach((button) => {
  button.addEventListener("click", () => setNumberQuizKind(button.dataset.operation));
});
nextQuizButton.addEventListener("click", () => {
  if (playKind === "color") {
    startColorPlay();
    return;
  }
  startQuiz();
});
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
} else {
  setMode(mode);
}
