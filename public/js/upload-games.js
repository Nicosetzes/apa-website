const uploadGamesForm = document.querySelector("#uploadGamesForm")

uploadGamesForm.addEventListener("submit", e => {
    e.preventDefault();

    const playerP1Value = document.querySelector("#playerP1").value;
    const teamP1Value = document.querySelector("#teamP1").value;
    const scoreP1Value = document.querySelector("#scoreP1").value;
    const playerP2Value = document.querySelector("#playerP2").value;
    const teamP2Value = document.querySelector("#teamP2").value;
    const scoreP2Value = document.querySelector("#scoreP2").value;

    Swal.fire({
        title: "Confirmación - partido",
        html: `<b>${playerP1Value}</b> vs <b>${playerP2Value}</b> <br>
        ${teamP1Value} <b>${scoreP1Value}</b> vs <b>${scoreP2Value}</b> ${teamP2Value}`,
        icon: "info",
        showCancelButton: true,
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Confirmar',
        reverseButtons: true,
        customClass: {
            htmlContainer: 'text-align:center'
        }
    })
        .then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Partido cargado",
                    text: "Será redirigido en breve...",
                    icon: "success",
                    timer: 3000,
                    timerProgressBar: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
                setTimeout(() => {
                    uploadGamesForm.submit();
                }, 3000)
            }
            else {
                Swal.fire({
                    title: "Cancelado",
                    text: "El partido no se ha cargado, vuelva a intentarlo",
                    icon: "error",
                    showCancelButton: false,
                });
            }
        });
});