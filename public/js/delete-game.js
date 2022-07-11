const deleteMatchForm = document.querySelector(".deleteMatchForm")

deleteMatchForm.addEventListener("submit", e => {

    const isFixtureDelete = e.submitter.className;

    if (isFixtureDelete === "fixture-delete") {

        e.preventDefault();

        const playerP1Value = deleteMatchForm.querySelector('[name="playerP1"]').value;
        const teamP1Value = deleteMatchForm.querySelector('[name="teamP1"]').value;

        const playerP2Value = deleteMatchForm.querySelector('[name="playerP2"]').value;
        const teamP2Value = deleteMatchForm.querySelector('[name="teamP2"]').value;


        Swal.fire({
            title: "Eliminar resultado",
            html: `¿Está seguro que desea eliminar este resultado? <br><br>
                <b>${teamP1Value}</b> vs <b>${teamP2Value}</b> <br>
                <b>${playerP1Value}</b> - <b>${playerP2Value}</b>`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            reverseButtons: true,
            customClass: {
                htmlContainer: 'text-align:center'
            }
        })
            .then((result) => {
                if (result.isConfirmed) {
                    console.log("Confirmé")
                    Swal.fire({
                        title: "El partido ha sido eliminado con éxito",
                        text: "Aguarde unos instantes...",
                        icon: "success",
                        timer: 3000,
                        timerProgressBar: true,
                        showCancelButton: false,
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });
                    setTimeout(() => {
                        deleteMatchForm.submit();
                    }, 3000)
                }
                else {
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