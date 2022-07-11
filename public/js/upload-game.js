const uploadGamesForm = document.querySelector("#uploadGamesForm")

uploadGamesForm.addEventListener("submit", e => {
    e.preventDefault();

    const playerP1Value = document.querySelector("#playerP1").value;
    const teamP1Value = document.querySelector("#teamP1").value;
    const scoreP1Value = document.querySelector("#scoreP1").value;

    const playerP2Value = document.querySelector("#playerP2").value;
    const teamP2Value = document.querySelector("#teamP2").value;
    const scoreP2Value = document.querySelector("#scoreP2").value;

    const penaltiesDiv = document.querySelector("#penalties");
    const penaltiesChecked = document.querySelector("#penalties-yes").checked;

    const penaltyScoreP1Value = document.querySelector("#penaltyScoreP1").value;
    const penaltyScoreP2Value = document.querySelector("#penaltyScoreP2").value;

    if (scoreP1Value === scoreP2Value && penaltiesDiv.classList.contains("penalties")) {
        penaltiesDiv.classList.remove("penalties");
        return;
    }

    if (scoreP1Value !== scoreP2Value && penaltiesChecked) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Solo puede haber penales en caso de empate',
        });
        return;
    }

    if (scoreP1Value === scoreP2Value && penaltiesChecked && (penaltyScoreP1Value === "" || penaltyScoreP2Value === "")) {
        console.log(penaltyScoreP1Value)
        console.log(penaltyScoreP2Value)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete ambos campos',
        });
        return;
    }

    if (scoreP1Value === scoreP2Value && penaltiesChecked && (penaltyScoreP1Value === penaltyScoreP2Value)) {
        console.log(penaltyScoreP1Value)
        console.log(penaltyScoreP2Value)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Los equipos no pueden marcar la misma cantidad de penales',
        });
        return;
    }

    if (scoreP1Value === scoreP2Value && penaltiesChecked) {
        Swal.fire({
            title: "Confirmación - partido",
            html: `<b>${playerP1Value}</b> vs <b>${playerP2Value}</b> <br>
            ${teamP1Value} <b>${scoreP1Value}</b> vs <b>${scoreP2Value}</b> ${teamP2Value} <br><br>
            <b>Resultado penales</b> <br>
            ${teamP1Value} <b>${penaltyScoreP1Value}</b> - <b>${penaltyScoreP2Value}</b> ${teamP2Value}`,
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
                        title: "Se está cargando el partido",
                        text: "Una vez cargado, será redirigido...",
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
    }

    // if (scoreP1Value === scoreP2Value && !penaltiesChecked) {
    //     console.log(penaltyScoreP1Value)
    //     console.log(penaltyScoreP2Value)
    //     penaltiesDiv.classList.add("penalties");
    // }

    else {
        penaltiesDiv.classList.add("penalties");
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
                    document.getElementById("penaltyScoreP1").remove();
                    document.getElementById("penaltyScoreP2").remove();
                    Swal.fire({
                        title: "Se está cargando el partido",
                        text: "Una vez cargado, será redirigido...",
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
            })
    }

});