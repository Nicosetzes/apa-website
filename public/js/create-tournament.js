// CREATE TOURNAMENT //

// const confirmTeamsButton = document.querySelector("#countries-submit")
// console.log(confirmTeamsButton);

const confirmCountriesForm = document.querySelector("#confirm-countries")

const teamsFromJSONDiv = document.querySelector("#teamsFromJSON");

const confirmationButton = document.querySelector("#confirmationButton");

confirmCountriesForm.addEventListener("submit", e => {

    e.preventDefault();
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
    // console.log(arrayFromValues);
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
                infoFromJSON.push(data.response); // PROBAR DATA.RESPONSE
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

    // confirmationButton.addEventListener("click", () => {
    //     swal({
    //         title: "Confirmación - nuevo torneo",
    //         text: "¿Está seguro de los parámetros elegidos?",
    //         icon: "info",
    //         buttons: true,
    //         // dangerMode: true,
    //     })
    //         .then((willConfirm) => {
    //             if (willConfirm) {
    //                 swal("Torneo confirmado", {
    //                     icon: "success",
    //                 });
    //             }
    //             else {
    //                 swal("Vuelva a intentarlo");
    //             }
    //         });
    // })
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

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()