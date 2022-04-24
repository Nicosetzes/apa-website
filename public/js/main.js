// MODALS

document.addEventListener(
  "click",
  (e) => {
    let modalCloseButton;
    e.target.matches(".button-modal-close")
      ? (modalCloseButton = e.target)
      : (modalCloseButton = e.target.closest(".button-modal-close"));
    if (modalCloseButton != null) onModalCloseButtonClick(modalCloseButton);
  },
  false
);

document.addEventListener(
  "click",
  (e) => {
    let containerModal;
    e.target.matches(".container__tournament-content-plaque")
      ? (containerModal = e.target)
      : (containerModal = e.target.closest(
          ".container__tournament-content-plaque"
        ));
    if (containerModal != null) onContainerModalClick(containerModal);
  },
  false
);

// document.addEventListener(
//   "click",
//   (e) => {
//     let containerModal;
//     e.target.matches(".container__tournament-content-finalist")
//       ? (containerModal = e.target)
//       : (containerModal = e.target.closest(
//           ".container__tournament-content-finalist"
//         ));
//     if (containerModal != null) onContainerModalClick(containerModal);
//   },
//   false
// );

const onContainerModalClick = (containerModal) => {
  const dividedArray = containerModal.classList[1].split("-");
  console.log(dividedArray);
  const isChampionOrFinalist = dividedArray[dividedArray.length - 1];
  if (
    isChampionOrFinalist !== "champion" &&
    isChampionOrFinalist !== "finalist"
  )
    throw new Error({ error: "isChampionOrFinalist is neither of both" });
  const modal = containerModal
    .closest(".container__tournament-content")
    .querySelector(`.modal-profile-${isChampionOrFinalist}`);
  const containerTournamentTitle = containerModal
    .closest(".active")
    .querySelector(".container__tournament-title");
  const imgTrophy = containerModal
    .closest(".active")
    .querySelector(".img-trophy");
  if (modal.classList.contains("hidden")) {
    modal.classList.remove("hidden");
    containerTournamentTitle.classList.add("no-index");
    imgTrophy.classList.add("no-index");
    setTimeout(() => {
      modal.classList.remove("visuallyHidden");
    }, 20);
  }
};

const onModalCloseButtonClick = (modalCloseButton) => {
  const modal = modalCloseButton.closest(".modal-profile");
  const containerTournamentTitle = modal
    .closest(".active")
    .querySelector(".container__tournament-title");
  const imgTrophy = modal.closest(".active").querySelector(".img-trophy");
  modal.classList.add("visuallyHidden");
  containerTournamentTitle.classList.remove("no-index");
  imgTrophy.classList.remove("no-index");
  modal.addEventListener(
    "transitionend",
    (e) => {
      modal.classList.add("hidden");
    },
    {
      capture: false,
      once: true, // Without this, animations breaks.
      passive: false,
    }
  );
};
