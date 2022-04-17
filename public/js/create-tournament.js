// CREATE TOURNAMENT //

// const confirmTeamsButton = document.querySelector("#countries-submit")
// console.log(confirmTeamsButton);

const confirmCountriesForm = document.querySelector("#confirm-countries")

const teamsFromJSONDiv = document.querySelector("#teamsFromJSON");

const confirmationButton = document.querySelector("#confirmationButton");

confirmCountriesForm.addEventListener("submit", e => {

    e.preventDefault();

    const isChecked = atLeastOneCheckboxIsChecked("countries");

    console.log(isChecked);

    if (!isChecked) {
        swal({
            title: "Error en la validación",
            text: "Por favor, elija al menos una casilla para conformar el torneo",
            icon: "error",
            buttons: true,
            // dangerMode: true,
        });
        return;
    }

    // swal({
    //     title: "Confirmación - países",
    //     text: "¿Está seguro que desea elegir estos países para conformar el torneo?",
    //     icon: "info",
    //     buttons: true,
    //     // dangerMode: true,
    // })
    //     .then((willConfirm) => {
    //         if (willConfirm) {
    //             swal("Países confirmados", {
    //                 icon: "success",
    //             });
    //         }
    //         else {
    //             swal("Vuelva a intentarlo");
    //         }
    //     });

    const arrayFromValues = Object.values(confirmCountriesForm);

    const cleanArrayFromValues = arrayFromValues.map((input) => {

        return { name: input.name, value: input.checked }

    });
    const confirmedCountries = cleanArrayFromValues.filter((input) => input.value) // Me quedo solo con los boxes chequeados

    // console.log(confirmedCountries);
    // if (!confirmedCountries.length) {
    //     alert("Ningún país ha sido seleccionado");
    //     return;
    // }

    let infoFromJSON = [];

    let itemsProcessed = 0;

    confirmedCountries.forEach(async (element) => {

        await fetch(`./../teams/${element.name}-teams.json`)
            .then(response => {
                return response.json()
            })
            .then(data => {
                infoFromJSON.push(data.response);
            });

        itemsProcessed++;

        if (itemsProcessed === confirmedCountries.length) {
            console.log(infoFromJSON);
            infoFromJSON.forEach((league, index) => {
                league.forEach((squad) => {
                    inyectHTML(squad.team);
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

const inyectHTML = (param) => {

    let div = document.createElement("div");
    div.classList.add("form-check");
    // let p = document.createElement("p")
    // div.append(p)
    let htmlNode;

    htmlNode = `<input name="ID${param.id}" class="form-check-input form-check-input-teams" type="checkbox" value="${param.name}" id="ID${param.id}">
                <label class="form-check-label" for="ID${param.id}">
                ${param.name}
                </label>
                <img src="${param.logo}">`

    div.innerHTML = htmlNode;

    teamsFromJSONDiv.appendChild(div);
}

const confirmDataForDbForm = document.querySelector("#confirmDataForDB");

console.log(confirmDataForDbForm);

confirmDataForDbForm.addEventListener("submit", e => {

    const isCheckedForPlayers = atLeastOneCheckboxIsChecked("players");

    const isCheckedForTeams = atLeastOneCheckboxIsChecked("teams");

    console.log("isCheckedForPlayers: " + isCheckedForPlayers);

    console.log("isCheckedForTeams: " + isCheckedForTeams);

    if (!isCheckedForPlayers) {
        e.preventDefault()
        swal({
            title: "Error en la validación",
            text: "Por favor, elija al menos un jugador para conformar el torneo",
            icon: "error",
            // buttons: true,
        });
    }
    if (!isCheckedForTeams) {
        e.preventDefault()
        swal({
            title: "Error en la validación",
            text: "Por favor, elija al menos un equipo para conformar el torneo",
            icon: "error",
            // buttons: true,
        });
    }
});

function atLeastOneCheckboxIsChecked(section) {
    const checkboxes = Array.from(document.querySelectorAll(`.form-check-input-${section}`));
    return checkboxes.reduce((acc, curr) => acc || curr.checked, false);
}