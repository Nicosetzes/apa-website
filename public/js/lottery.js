const playerArray = [];
const teamArray = [];

document.querySelector("#form-lottery").addEventListener("submit", (e) => {
    e.preventDefault();
    const playerNodes = document.querySelectorAll(".player")
    const teamNodes = document.querySelectorAll(".team")
    for (i = 0; i < playerNodes.length; i++) {
        playerArray.push({ player: playerNodes[i].value, NOfTeams: teamNodes.length / playerNodes.length });
    }
    for (i = 0; i < teamNodes.length; i++) {
        teamArray.push(teamNodes[i].value);
    }
    console.log(playerArray)
    console.log(teamArray)
    assignTeamsToPlayers();
})

// FUNCIÓN PARA EMPAREJAR A CADA JUGADOR CON LOS EQUIPOS DISPONIBLES (AL AZAR) //

const assignTeamsToPlayers = () => {

    // const teamIndexes = [];

    if (playerArray.length !== 0 && teamArray.length !== 0) {

        // for (i = 0; i < teamArray.length; i++) {
        //     teamIndexes.push(i);
        // }
        const lotteryResults = [];

        while (teamArray.length > 0) {

            let randomizedIndexForPlayers = Math.floor(Math.random() * playerArray.length);
            let randomizedIndexForTeams = Math.floor(Math.random() * teamArray.length);

            let object = { player: playerArray[randomizedIndexForPlayers], team: teamArray[randomizedIndexForTeams] }

            if (object.player.NOfTeams > 0) {
                lotteryResults.push(object);
                playerArray[randomizedIndexForPlayers].NOfTeams--;
            }
            else {
                continue;
            }
            // Descartar equipo que ya fue elegido //
            teamArray.splice(randomizedIndexForTeams, 1);
        }

        console.log(lotteryResults)

        let container = document.createElement("DIV");
        container.classList.add("results-identity")

        let limit = lotteryResults.length;

        lotteryResults.forEach((element) => {
            let node = document.createElement("DIV");
            let textInsideNode = document.createTextNode(`${element.player.player} - ${element.team}`);
            node.appendChild(textInsideNode);
            container.appendChild(node)
            limit--
            if (limit === 0) {
                document.getElementById("lotteryResults").appendChild(container);
                // fixture(lotteryResults, playerArray); // GENERO EL FIXTURE
            }
        });
    }
}