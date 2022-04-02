// Remove the "preload" class from the body as page starts the load.

const body = document.getElementById("body");

window.addEventListener("load", () => {
  setInterval(() => {
    body.classList.remove("preload");
  }, 1);
});

// Hamburger menu

const hamburger = document.getElementById("hamburger");

const nav = document.querySelector(".nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("show");
});

// Removing the "show" class when going beyond 768px wide (viewport)

window.addEventListener("resize", () => {
  if (window.innerWidth >= 992) nav.classList.remove("show");
});

// Eliminating all animations when resizing

let resizeTimer;
window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});
