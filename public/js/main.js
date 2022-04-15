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

// MODALS

document.addEventListener("click", e => {
  let modalCloseButton;
  e.target.matches(".button-modal-close") ? modalCloseButton = e.target : modalCloseButton = e.target.closest(".button-modal-close");
  if (modalCloseButton != null) onModalCloseButtonClick(modalCloseButton);
}, false);

document.addEventListener("click", e => {
  let containerModal;
  e.target.matches(".container__tournament-content-champion") ? containerModal = e.target : containerModal = e.target.closest(".container__tournament-content-champion");
  if (containerModal != null) onContainerModalClick(containerModal);
}, false);

document.addEventListener("click", e => {
  let containerModal;
  e.target.matches(".container__tournament-content-finalist") ? containerModal = e.target : containerModal = e.target.closest(".container__tournament-content-finalist");
  if (containerModal != null) onContainerModalClick(containerModal);
}, false);

const onContainerModalClick = (containerModal) => {
  const dividedArray = containerModal.classList[0].split("-");
  const isChampionOrFinalist = dividedArray[dividedArray.length - 1];
  if ((isChampionOrFinalist !== "champion") && (isChampionOrFinalist !== "finalist")) throw new Error({ error: "isChampionOrFinalist is neither of both" })
  const modal = containerModal.closest(".container__tournament-content").querySelector(`.modal-profile-${isChampionOrFinalist}`);
  if (modal.classList.contains("hidden")) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("visuallyHidden");
    }, 20);
  }
};

const onModalCloseButtonClick = (modalCloseButton) => {
  const modal = modalCloseButton.closest(".modal-profile");
  modal.classList.add("visuallyHidden");
  modal.addEventListener("transitionend", (e) => {
    modal.classList.add("hidden");
  }, {
    capture: false,
    once: true, // Without this, animations breaks. 
    passive: false
  });
}