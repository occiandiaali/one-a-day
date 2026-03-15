// import './style.css'
// import javascriptLogo from './assets/javascript.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import { setupCounter } from './counter.js'

// document.querySelector('#app').innerHTML = `
// <section id="center">
//   <div class="hero">
//     <img src="${heroImg}" class="base" width="170" height="179">
//     <img src="${javascriptLogo}" class="framework" alt="JavaScript logo"/>
//     <img src=${viteLogo} class="vite" alt="Vite logo" />
//   </div>
//   <div>
//     <h1>Get started</h1>
//     <p>Edit <code>src/main.js</code> and save to test <code>HMR</code></p>
//   </div>
//   <button id="counter" type="button" class="counter"></button>
// </section>

// <div class="ticks"></div>

// <section id="next-steps">
//   <div id="docs">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
//     <h2>Documentation</h2>
//     <p>Your questions, answered</p>
//     <ul>
//       <li>
//         <a href="https://vite.dev/" target="_blank">
//           <img class="logo" src=${viteLogo} alt="" />
//           Explore Vite
//         </a>
//       </li>
//       <li>
//         <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//           <img class="button-icon" src="${javascriptLogo}" alt="">
//           Learn more
//         </a>
//       </li>
//     </ul>
//   </div>
//   <div id="social">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
//     <h2>Connect with us</h2>
//     <p>Join the Vite community</p>
//     <ul>
//       <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
//       <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
//       <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
//       <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
//     </ul>
//   </div>
// </section>

// <div class="ticks"></div>
// <section id="spacer"></section>
// `

// setupCounter(document.querySelector('#counter'))

import van from "vanjs-core";

const { br, div, h1, img, select, option, button, span, fragment } = van.tags;

const topic = van.state(null); // no topic selected at start
const question = van.state(null);
const showHint = van.state(false);
const showModal = van.state(false);
const modalContent = van.state("");
const incorrectMsg = van.state("");

const triviaDataState = van.state([]); // reactive trivia data

// Fetch trivia JSON from GitHub
async function loadTrivia() {
  const res = await fetch(
    "https://raw.githubusercontent.com/occiandiaali/one-a-day/refs/heads/main/data.json",
  );
  const json = await res.json();
  triviaDataState.val = json.data; // ✅ assign into state
}

function loadQuestion() {
  const qset = triviaDataState.val.filter((q) => q.topic === topic.val);
  if (qset.length > 0) {
    question.val = qset[Math.floor(Math.random() * qset.length)];
    showHint.val = false;
    showModal.val = false;
    //  console.log("Question set:", question.val);
  }
}

function checkAnswer(ans) {
  if (ans === question.val.correct) {
    // Speech synthesis
    const utterance = new SpeechSynthesisUtterance("Yes! That's correct!");
    speechSynthesis.speak(utterance);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });

    incorrectMsg.val = ""; // clear any previous wrong message

    modalContent.val = question.val.links
      .map((l) => `<p><a href="${l}" target="_blank">${l}</a></p>`)
      .join("");
    showModal.val = true;
  } else {
    incorrectMsg.val = "Wrong answer!";
    modalContent.val = question.val.links
      .map((l) => `<p><a href="${l}" target="_blank">${l}</a></p>`)
      .join("");
    setTimeout(() => {
      showModal.val = true;
    }, 500);
  }
}

function resetQuiz() {
  topic.val = null;
  question.val = null;
  showHint.val = false;
  showModal.val = false;
  modalContent.val = "";
  incorrectMsg.val = "";
}

export const MainPage = div(
  img({
    src: "/oad-logo.svg",
    alt: "one-a-day",
    style: "width:50px; height:50px;margin-top:10%",
  }),
  h1({ class: "main-h1" }, "one-a-day"),
  // ✅ Reset button only shows if a topic is selected
  () =>
    topic.val
      ? button(
          {
            onclick: resetQuiz,
            style:
              "margin-top:5px; padding:6px 12px; background:#f8d7da; border:1px solid #721c24; border-radius:4px; cursor:pointer;",
          },
          "Reset",
        )
      : span(null),
  br(),
  select(
    {
      onchange: (e) => {
        topic.val = e.target.value;
        loadQuestion();
      },
      style: "width:120px;",
    },
    // Default option (disabled)
    option({ value: "", disabled: true, selected: true }, "Select a topic…"),
    () => {
      const topics = [...new Set(triviaDataState.val.map((q) => q.topic))];
      // console.log("Dropdown topics:", topics);
      return fragment(...topics.map((t) => option({ value: t }, t)));
    },
  ),

  div(() =>
    question.val
      ? span({ style: "padding:12px" }, question.val.text)
      : span("Pick a topic!"),
  ),
  () =>
    question.val
      ? fragment(
          // Hint button
          button(
            {
              onclick: () => (showHint.val = true),
              style:
                "margin:10px; padding:8px 12px; background:black;color:white; border: none; cursor:pointer;",
            },
            "💡 Hint",
          ),
          // Hint text
          showHint.val
            ? div(
                { style: "margin:10px; font-style:italic;" },
                "Hint: " + question.val.hint,
              )
            : null,
          // Answer options
          div(
            {
              class: "answers",
            },
            ...question.val.options.map((opt) =>
              button(
                {
                  onclick: () => checkAnswer(opt),
                  style:
                    "padding:8px 8px;margin:0 auto; background:#e0f7fa; border:1px solid #00796b; border-radius:4px; cursor:pointer;",
                },
                opt,
              ),
            ),
          ),
          // ✅ Incorrect message
          () =>
            incorrectMsg.val
              ? div({ style: "color:red; margin-top:10px;" }, incorrectMsg.val)
              : span(""),
        )
      : span(""),

  () =>
    showModal.val
      ? fragment(
          // Overlay
          div({
            class: "overlay",
            onclick: () => (showModal.val = false), // click overlay to close
          }),

          // Modal
          div(
            { class: "modal" },
            span("Learn more:"),
            div({ innerHTML: modalContent.val }),
            button(
              {
                class: "modalCloseBtn",
                onclick: () => (showModal.val = false),
              },
              "Close",
            ),
          ),
        )
      : span(""),
);

// Load trivia on startup
loadTrivia();
