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
const showModeButton = document.querySelector("#showModeButton");
const quizModeButton = document.querySelector("#quizModeButton");
const nextQuizButton = document.querySelector("#nextQuizButton");
const soundToggle = document.querySelector("#soundToggle");

let playKind = "alphabet";
let mode = "show";
let numberQuizKind = "number";
let currentValue = "A";
let typedNumber = "";
let quizTimer;
let soundOn = true;
let audioContext;

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
  alphabetPlayButton.classList.toggle("active", playKind === "alphabet");
  numberPlayButton.classList.toggle("active", playKind === "number");
  alphabetPlayButton.setAttribute("aria-selected", String(playKind === "alphabet"));
  numberPlayButton.setAttribute("aria-selected", String(playKind === "number"));
  renderChrome();
  renderOperationTabs();
  buildPad();
  setMode(mode);
}

function setMode(nextMode) {
  mode = nextMode;
  typedNumber = "";
  window.clearTimeout(quizTimer);
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
  } else {
    appTitle.textContent = "숫자 놀이터";
    eyebrow.textContent = "NUMBER PLAY";
    nextQuizButton.textContent = "다음 숫자";
  }
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
  renderOperationTabs();
  if (playKind === "number" && mode === "quiz") {
    startQuiz();
  }
}

function startQuiz() {
  typedNumber = "";

  if (playKind === "alphabet") {
    const next = alphabet[Math.floor(Math.random() * alphabet.length)];
    promptLabel.textContent = "이 알파벳을 눌러보세요";
    setDisplay(next, words[next]);
    return;
  }

  if (numberQuizKind === "number") {
    const next = String(Math.floor(Math.random() * 1000));
    promptLabel.textContent = "이 숫자를 똑같이 눌러보세요";
    setDisplay(next, numberToKorean(next));
    return;
  }

  const problem = makeOperationProblem(numberQuizKind);
  promptLabel.textContent = `${operationLabels[numberQuizKind]} 문제`;
  setDisplay(problem.expression, numberToKorean(problem.answer));
  currentValue = String(problem.answer);
}

function handleKeyInput(rawValue) {
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
  phonics.textContent = typedNumber ? numberToKorean(typedNumber) : numberToKorean(currentValue);

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
    phonics.textContent = typedNumber ? numberToKorean(typedNumber) : numberToKorean(currentValue);
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
    return { expression: `${left} + ${right}`, answer };
  }

  if (kind === "subtract") {
    const answer = randomInt(0, 19);
    const right = randomInt(0, 19 - answer);
    const left = answer + right;
    return { expression: `${left} - ${right}`, answer };
  }

  if (kind === "multiply") {
    const answer = randomInt(0, 19);
    if (answer === 0) {
      return Math.random() > 0.5
        ? { expression: `0 x ${randomInt(0, 9)}`, answer }
        : { expression: `${randomInt(0, 9)} x 0`, answer };
    }

    const divisors = [];
    for (let factor = 1; factor <= 9; factor += 1) {
      if (answer % factor === 0 && answer / factor <= 9) {
        divisors.push(factor);
      }
    }
    const left = divisors[randomInt(0, divisors.length - 1)];
    const right = answer / left;
    return { expression: `${left} x ${right}`, answer };
  }

  if (kind === "divide") {
    const answer = randomInt(0, 19);
    const divisor = randomInt(1, 9);
    const dividend = answer * divisor;
    return { expression: `${dividend} ÷ ${divisor}`, answer };
  }

  return { expression: "0", answer: 0 };
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

function burst(kind) {
  const rect = letterCard.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
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
    celebration.appendChild(spark);
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
showModeButton.addEventListener("click", () => setMode("show"));
quizModeButton.addEventListener("click", () => setMode("quiz"));
operationButtons.forEach((button) => {
  button.addEventListener("click", () => setNumberQuizKind(button.dataset.operation));
});
nextQuizButton.addEventListener("click", startQuiz);
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.classList.toggle("active", soundOn);
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  soundToggle.textContent = soundOn ? "소리 켬" : "소리 끔";
  if (soundOn) playTone("tap");
});

renderChrome();
buildPad();
setMode("show");
