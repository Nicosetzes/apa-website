const deleteMatchForm = document.querySelectorAll(".deleteMatchForm");

deleteMatchForm.forEach((element) => {
  element.addEventListener("submit", (e) => {
    const isFixtureDelete = e.submitter.className.split(" ")[0];
    if (isFixtureDelete === "fixture-delete") {
      e.preventDefault();

      const playerP1Value = element.querySelector('[name="playerP1"]').value;
      const teamP1Value = element.querySelector('[name="teamP1"]').value;

      const playerP2Value = element.querySelector('[name="playerP2"]').value;
      const teamP2Value = element.querySelector('[name="teamP2"]').value;

      Swal.fire({
        title: "Eliminar resultado",
        html: `¿Está seguro que desea eliminar este resultado? <br><br>
                  <b>${teamP1Value}</b> vs <b>${teamP2Value}</b> <br>
                  <b>${playerP1Value}</b> - <b>${playerP2Value}</b>`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        confirmButtonText: "Eliminar",
        reverseButtons: true,
        customClass: {
          htmlContainer: "text-align:center",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "El partido ha sido eliminado con éxito",
            text: "Aguarde unos instantes...",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
          setTimeout(() => {
            element.submit();
          }, 3000);
        } else {
          Swal.fire({
            title: "Cancelado",
            text: "El partido no ha sido eliminado",
            icon: "error",
            showCancelButton: false,
          });
        }
      });
    }
  });
});
