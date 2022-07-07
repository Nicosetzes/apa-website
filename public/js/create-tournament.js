const confirmCountriesForm = document.querySelector("#confirm-countries")

const teamsFromJSONDiv = document.querySelector("#teamsFromJSON");

const confirmationButton = document.querySelector("#confirmationButton");

confirmCountriesForm.addEventListener("submit", e => {

    e.preventDefault();

    const isChecked = atLeastOneCheckboxIsChecked("countries");

    console.log(isChecked);

    if (!isChecked) {
        Swal.fire({
            title: "Error en la validación",
            text: "Por favor, elija al menos una casilla para conformar el torneo",
            icon: "error",
        });
        return;
    }

    confirmCountriesForm.querySelector("button").setAttribute("disabled", ""); // Agrego atributo disabled en estado true //

    const arrayFromValues = Object.values(confirmCountriesForm);

    const cleanArrayFromValues = arrayFromValues.map((input) => {

        return { name: input.name, value: input.checked }

    });
    const confirmedCountries = cleanArrayFromValues.filter((input) => input.value) // Me quedo solo con los boxes chequeados

    let infoFromJSON = [];

    let itemsProcessed = 0;

    confirmedCountries.forEach(async (element) => {

        await fetch(`./../teams/${element.name}-teams.json`)
            .then(response => {
                return response.json()
            })
            .then(data => {
                infoFromJSON.push({
                    data: data.response,
                    code: element.name
                });
            });

        itemsProcessed++;

        if (itemsProcessed === confirmedCountries.length) {
            console.log(infoFromJSON);
            infoFromJSON.forEach((object) => {
                object.data.forEach((squad) => {
                    inyectHTML(squad.team, object.code);
                })
            })
        };
    });

    let explanatorySpan = document.createElement("span");
    explanatorySpan.classList.add("teams-span");
    explanatorySpan.innerHTML = `Por favor, seleccione los equipos que formarán parte del torneo:`;
    teamsFromJSONDiv.prepend(explanatorySpan);

    let button = document.createElement("button");
    button.type = "submit";
    button.classList.add("btn");
    button.classList.add("btn-primary");
    button.innerHTML = `Confirmar torneo`;
    confirmationButton.append(button);
})

const inyectHTML = (param, countryCode) => {

    let div = document.createElement("div");
    div.classList.add("form-check");
    let htmlNode;

    htmlNode = `<input name="ID${param.id}" class="form-check-input form-check-input-teams" type="checkbox" value="${param.name}|${param.code}|${countryCode}" id="ID${param.id}">
                <label class="form-check-label" for="ID${param.id}">
                ${param.name}
                </label>
                <img src="${param.logo}">`

    div.innerHTML = htmlNode;

    teamsFromJSONDiv.appendChild(div);
}

const confirmDataForDbForm = document.querySelector("#confirmDataForDB");

confirmDataForDbForm.addEventListener("submit", e => {

    e.preventDefault()

    const isCheckedForPlayers = atLeastOneCheckboxIsChecked("players");

    const isCheckedForTeams = atLeastOneCheckboxIsChecked("teams");

    console.log("isCheckedForPlayers: " + isCheckedForPlayers);

    console.log("isCheckedForTeams: " + isCheckedForTeams);

    if (!isCheckedForPlayers) {
        Swal.fire({
            title: "Error en la validación",
            text: "Por favor, elija al menos un jugador para conformar el torneo",
            icon: "error",
        });
        return;
    }

    if (!isCheckedForTeams) {
        Swal.fire({
            title: "Error en la validación",
            text: "Por favor, elija al menos un equipo para conformar el torneo",
            icon: "error",
        });
        return;
    }

    const tournamentNameValue = confirmDataForDbForm.querySelector("#tournamentName").value;
    const formatValue = confirmDataForDbForm.querySelector("#format").value;
    const originValue = confirmDataForDbForm.querySelector("#origin").value;

    const humanPlayerCheckboxes = confirmDataForDbForm.querySelector("#humanPlayerCheckboxes");
    const teamsFromJSON = confirmDataForDbForm.querySelector("#teamsFromJSON");

    const amountOfPlayers = humanPlayerCheckboxes.querySelectorAll('input[type="checkbox"]:checked').length
    const amountOfTeams = teamsFromJSON.querySelectorAll('input[type="checkbox"]:checked').length

    const translateValue = (value) => {
        if (value === "league") {
            return "Temporada";
        }
        if (value === "playoff") {
            return "Eliminatoria";
        }
        if (value === "league_playoff") {
            return "Temporada + eliminatoria";
        }
        if (value === "clubs") {
            return "Clubes";
        }
        else {
            return "Selecciones";
        }
    }

    Swal.fire({
        title: "Confirmación - torneo",
        html: `Nombre: <b>${tournamentNameValue}</b> <br>
                Tipo de torneo: <b>${translateValue(formatValue)}</b> <br>
                Tipos de equipo: <b>${translateValue(originValue)}</b> <br>
                Cantidad de jugadores: <b>${amountOfPlayers}</b> <br>
                Cantidad de equipos: <b>${amountOfTeams}</b>`,
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
                    title: "El torneo ha sido creado con éxito",
                    text: "Será redirigido en breve...",
                    icon: "success",
                    timer: 3000,
                    timerProgressBar: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
                setTimeout(() => {
                    confirmDataForDbForm.submit();
                }, 3000)
            }
            else {
                Swal.fire({
                    title: "Cancelado",
                    text: "La creación del torneo ha sido detenida, vuelva a intentarlo",
                    icon: "error",
                    showCancelButton: false,
                });
            };
        });
});

function atLeastOneCheckboxIsChecked(section) {
    const checkboxes = Array.from(document.querySelectorAll(`.form-check-input-${section}`));
    return checkboxes.reduce((acc, curr) => acc || curr.checked, false);
}