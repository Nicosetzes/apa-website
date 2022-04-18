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