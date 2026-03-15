import van from "vanjs-core";

const { div, h1, span } = van.tags;

export const AboutPage = div(
  h1("About us"),
  span(
    "We serve you a daily trivia offering, built with love, and a chance to boost your brain. Once a day.",
  ),
);
