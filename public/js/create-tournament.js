// CREATE TOURNAMENT //

// const confirmTeamsButton = document.querySelector("#countries-submit")
// console.log(confirmTeamsButton);

const confirmCountriesForm = document.querySelector("#confirm-countries")

const teamsFromJSONDiv = document.querySelector("#teamsFromJSON");

const confirmationButton = document.querySelector("#confirmationButton");

confirmCountriesForm.addEventListener("submit", e => {
    e.preventDefault();
    const arrayFromValues = Object.values(confirmCountriesForm);
    console.log(arrayFromValues);
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
                infoFromJSON.push(data.response); // PROBAR DATA.RESPONSE
            });

        itemsProcessed++;

        if (itemsProcessed === confirmedCountries.length) {
            console.log(infoFromJSON);
            infoFromJSON.forEach((league, index) => {
                league.forEach((squad) => {
                    inyectHTML(squad.team,);
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

    htmlNode = `<input name="${param.code}" class="form-check-input" type="checkbox" value="${param.name}" id="${param.code}">
                <label class="form-check-label" for="${param.code}">
                ${param.name}
                </label>
                <img src="${param.logo}">`

    div.innerHTML = htmlNode;

    teamsFromJSONDiv.appendChild(div);

}

