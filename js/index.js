const ranking = JSON.parse(localStorage.getItem('Ranking')) || [];

const leaderBoard = document.getElementById("leaderBoard");
ranking.sort((a,b) => b.score - a.score);

for(let i = 0; i < ranking.length && i < 10; i++) {
    let fila = document.createElement("tr");

    let position = document.createElement("td");
    let nick = document.createElement("td");
    let score = document.createElement("td");
    let time = document.createElement("td");
    let difficulty = document.createElement("td");

    position.textContent = (i+1) + "º";
    position.style.textAlign = "center";

    nick.textContent = ranking[i].nick

    score.textContent = ranking[i].score;
    score.style.textAlign = "center";

    time.textContent = ranking[i].time;

    difficulty.textContent = getDifficulty(ranking[i].difficulty);
    difficulty.style.textAlign = "center";

    fila.appendChild(position);
    fila.appendChild(nick);
    fila.appendChild(score);
    fila.appendChild(time);
    fila.appendChild(difficulty);

    fila.style.backgroundColor = positionColor(i);

    leaderBoard.appendChild(fila);
}


function positionColor(position) {
    switch (position) {
        case 0:
            return "gold";
        case 1:
            return "silver";
        case 2:
            return "#CD7F32";
        default:
            return "white";
    }
}


function getDifficulty(level) {
    switch (level) {
        case 1:
            return "MEDIUM";
        case 2:
            return "HARD";
        default:
            return "EASY";
    }
}