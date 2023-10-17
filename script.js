let x,
  y,
  highscore = 0,
  maxscore = 0,
  totalscore,
  minTurns = 0,
  currentTurns = 0,
  colors = 4, // default 4
  color0 = "#ed283a", // "#db2737", // "#b51f2c", // red
  color1 = "#5abf4e", // green
  color2 = "#f2ed55", // yellow
  color3 = "#303cc7", // blue
  colorX = "white", // ${colorX}
  puzzle = [],
  mixedPuzzle = [],
  min = 0,
  sec = 0,
  totalseconds = 0,
  currentSeconds = 0,
  timerTimer,
  minutesAndSeconds,
  isSolved = false,
  r1score,
  r1time,
  r2score,
  r2time,
  r3score,
  r3time,
  rounds = 1,
  currentRound = 1,
  logRounds,
  logSize,
  logColors,
  logFormat,
  sbShown = false,
  mobile = false;
let localScores = JSON.parse(localStorage.getItem("colorMatchScores")) || {};

// wait for document ready
document.addEventListener("DOMContentLoaded", () => {
  let sbRoundFormatId = document.getElementById("sbRoundFormatId"),
    sbTime = document.getElementById("sbTime"),
    sbScore = document.getElementById("sbScore"),
    scoreBoard = document.getElementById("scoreBoard"),
    currentBoard = document.getElementById("currentBoard"),
    colorButton = document.getElementById("colorButton"),
    gameModeButton = document.getElementById("gameModeButton"),
    turnDiv = document.getElementById("turnDiv"),
    roundDiv = document.getElementById("roundDiv").textContent,
    scoreDiv = document.getElementById("scoreDiv");

  /* Regex test to determine if user is on mobile */
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    mobile = true;
  }
});

function rNumber() {
  return Math.floor(Math.random() * colors);
}

function selectColors() {
  if (colors == 4) {
    colors = 3;
    colorButton.textContent = "🎨 " + colors;
  } else {
    colors = 4;
    colorButton.textContent = "🎨 " + colors;
  }
}

function selectGamemode() {
  if (rounds == 1) {
    rounds = 3;
    gameModeButton.textContent = "rounds: " + rounds;
  } else {
    rounds = 1;
    gameModeButton.textContent = "rounds: " + rounds;
  }
}

function myTimer() {
  sec++;
  currentSeconds++;
  if (sec >= 60) {
    sec = 0;
    min++;
  }
  minutesAndSeconds = document.getElementById("timer");
  if (sec < 10) {
    minutesAndSeconds.textContent = min + ":0" + sec;
  } else {
    minutesAndSeconds.textContent = min + ":" + sec;
  }
}

function timeInMinSec(seconds) {
  let cmin = Math.floor(seconds / 60);
  let cseconds = seconds % 60;
  if (cseconds < 10) {
    cseconds = "0" + cseconds;
  }
  return cmin + ":" + cseconds;
}

function resetEverything(params) {
  min = 0;
  sec = 0;
  totalseconds = 0;
  currentRound = 1;
  currentSeconds = 0;
  totalscore = 0;
  clearInterval(timerTimer);
  timerTimer = setInterval(myTimer, 1000);
  currentTurns = 0;
  roundDiv.textContent = "R" + currentRound;
  document.getElementById("timer").textContent = "0:00";
  // turndiv is in shufflefield
  scoreDiv.textContent = "0";
  isSolved = false;
  sbShown = false;
  hideSB();
  clearSB();
  hideCurrent();
  clearCurrent();
}

function startGame() {
  document.getElementById("exampleDiv").style.zIndex = "-1";
  document.getElementById("exampleDiv").style.visibility = "hidden";
  resetEverything();
  createField();
  shuffleField();
  generateTable();
}

function startRoundNext() {
  // only reset nesseary stuff
  currentSeconds = 0;
  isSolved = false;
  currentTurns = 0;
  roundDiv.textContent = "R" + currentRound;

  createField();
  shuffleField();
  generateTable();
}

function createField() {
  // empty clear array
  puzzle.length = 0;

  x = document.getElementById("selectSize").value;
  y = document.getElementById("selectSize").value;

  //should be here to prevent cheating
  if (colors == 4) {
    maxscore = x * y * 100;
  } else {
    maxscore = x * y * 100 * 1.5;
  }
  logSize = x + "x" + y;
  logColors = "C" + colors;
  logRounds = rounds + "R";
  logFormat = logSize + "_" + logColors + "_" + logRounds;

  for (let i = 0; i < x * y; i++) {
    if (i > x - 1 && i < x * y - x && i % x == 0) {
      // Linker Mittelteil
      puzzle.push({
        top: puzzle[i - x].bottom,
        bottom: rNumber(),
        left: rNumber(),
        right: rNumber(),
      });
    } else if (i > x - 1 && i < x * y - x && (i + 1) % x == 0) {
      // Rechter Mittelteil
      puzzle.push({
        top: puzzle[i - x].bottom,
        bottom: rNumber(),
        left: puzzle[i - 1].right,
        right: puzzle[i - x + 1].left,
      });
    } else if (i > x - 1 && i < x * y - x) {
      // vorher checken ob linker oder rechter Rand MITTELTEIL
      puzzle.push({
        top: puzzle[i - x].bottom,
        bottom: rNumber(),
        left: puzzle[i - 1].right,
        right: rNumber(),
      });
    } else if (i > 0 && i < x - 1) {
      // ERTSE Reihe MITTEL
      puzzle.push({
        top: rNumber(),
        bottom: rNumber(),
        left: puzzle[i - 1].right,
        right: rNumber(),
      });
    } else if (i > x * y - x && i < x * y - 1) {
      // letzte Reihe mittelteil
      puzzle.push({
        top: puzzle[i - x].bottom,
        bottom: puzzle[i - x * (y - 1)].top,
        left: puzzle[i - 1].right,
        right: rNumber(),
      });
    } else if (i == 0) {
      // ANFANG erstes Feld links oben komplett zufall
      puzzle.push({
        top: rNumber(),
        bottom: rNumber(),
        left: rNumber(),
        right: rNumber(),
      });
    } else if (i == x - 1) {
      // RECHTS OBEN Feld
      puzzle.push({
        top: rNumber(),
        bottom: rNumber(),
        left: puzzle[i - 1].right,
        right: puzzle[0].left,
      });
    } else if (i == x * y - x) {
      // LINKS UNTEN
      puzzle.push({
        top: puzzle[i - x].bottom, //puzzle[x * y - 2 * x].bottom,
        bottom: puzzle[0].top,
        left: rNumber(),
        right: rNumber(),
      });
    } else if (i == x * y - 1) {
      // ENDE letztes Feld recht unten
      puzzle.push({
        top: puzzle[i - x].bottom,
        bottom: puzzle[x - 1].top,
        left: puzzle[i - 1].right,
        right: puzzle[x * y - x].left,
      });
    } else if (i == 0) {
      // erstes Feld links oben komplett zufall
      puzzle.push({
        top: rNumber(),
        bottom: rNumber(),
        left: rNumber(),
        right: rNumber(),
      });
    }
  }
  // console.log(puzzle);
}

function shuffleField() {
  minTurns = 0;
  mixedPuzzle = JSON.parse(JSON.stringify(puzzle));

  mixedPuzzle.forEach((element) => {
    if (checkIfAllSame(element)) {
      // console.log("same");
    } else {
      // ansonsten drehen
      if (
        // 50/50 oben unten & links rechts
        element.top == element.bottom &&
        element.top != element.left &&
        element.top != element.right &&
        element.left == element.right &&
        element.left != element.bottom &&
        element.bottom != element.right
      ) {
        // console.log("50/50 oben unten & links rechts");
        if (Math.floor(Math.random() * 2) == 1) {
          // bei 1 drehen ansonsten lassen
          // console.log("links drehen");
          // i = 1 Links - 2 180 -3 Rechts
          drehen(element, 3);
          // linksDrehen(element);
          minTurns++;
        }
      } else {
        switch (Math.floor(Math.random() * 4)) {
          case 1:
            //  console.log("nach rechts");
            drehen(element, 1);
            // linksDrehen(element);
            minTurns++;
            break;
          case 3:
            drehen(element, 3);
            // rechtsDrehen(element);
            if (mobile) {
              minTurns += 3;
            } else {
              minTurns++;
            }
            break;
          case 2:
            drehen(element, 2);
            // drehen180(element);
            // console.log("180 Grad");
            minTurns += 2;
            break;
          default:
            break;
        }
      }
    }
  });

  if (minTurns < 100) {
    turnDiv.textContent = "0" + currentTurns + "/" + minTurns;
  } else {
    turnDiv.textContent = "00" + currentTurns + "/" + minTurns;
  }
}

function generateTable() {
  // alten table entfernen
  if (document.getElementById("puzzleTbl")) {
    document.getElementById("puzzleTbl").remove();
  }

  // creates a <table> element and a <tbody> element
  const tbl = document.createElement("table");
  tbl.setAttribute("id", "puzzleTbl");
  tbl.setAttribute("oncontextmenu", "return false");
  tbl.setAttribute("ondragstart", "return false");
  const tblBody = document.createElement("tbody");

  // my code for rows
  for (let i = 0; i < y; i++) {
    const row = document.createElement("tr");
    row.setAttribute("id", "tr" + i);
    tblBody.appendChild(row);
  }
  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <body>
  document.body.appendChild(tbl);

  // creating all cells
  let currentRow = document.getElementById("tr" + 0);
  let j = 0;
  let strgFunc;
  for (let i = 0; i < mixedPuzzle.length; i++) {
    if (i % x == 0 && i > 0) {
      j++;
      currentRow = document.getElementById("tr" + j);
    }

    // Create a <td> element and a text node, make the text
    // node the contents of the <td>, and put the <td> at
    // the end of the table row
    const cell = document.createElement("td");
    cell.setAttribute("id", "td" + i);
    strgFunc = "moveCell(event," + i + ")";
    cell.setAttribute("onmousedown", strgFunc);
    cell.style.width = "calc(80vmin /" + y + ")";
    cell.style.height = "calc(80vmin /" + y + ")";

    drawColor(mixedPuzzle[i], cell);
    currentRow.appendChild(cell);
  }
  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <body>
  document.getElementById("tableId").appendChild(tbl);
}

// i = 1 RECHTS - 2 180 -3 Links
function drehen(e, i) {
  let topOld = e.top.valueOf(),
    bottomOld = e.bottom.valueOf(),
    leftOld = e.left.valueOf(),
    rightOld = e.right.valueOf();
  switch (i) {
    case 1: //Links
      e.top = leftOld.valueOf();
      e.bottom = rightOld.valueOf();
      e.left = bottomOld.valueOf();
      e.right = topOld.valueOf();
      break;
    case 2: //  180
      e.top = bottomOld.valueOf();
      e.bottom = topOld.valueOf();
      e.left = rightOld.valueOf();
      e.right = leftOld.valueOf();
      break;
    case 3: // RECHTS
      e.top = rightOld.valueOf();
      e.bottom = leftOld.valueOf();
      e.left = topOld.valueOf();
      e.right = bottomOld.valueOf();
      break;
    default:
      break;
  }
}

function checkIfSolved() {
  if (currentTurns >= minTurns) {
    isSolved = JSON.stringify(puzzle) == JSON.stringify(mixedPuzzle);
    if (isSolved) {
      calculateScore();

      totalseconds += currentSeconds;
      if (rounds > 1 && currentRound < rounds) {
        currentRound++;
        startRoundNext();
        return true;
      }
      clearInterval(timerTimer);
      return true;
    }
  }
}

function drawColor(obj, cell) {
  let topC, bottomC, leftC, rightC;
  switch (obj.top) {
    case 0:
      topC = color0;
      break;
    case 1:
      topC = color1;
      break;
    case 2:
      topC = color2;
      break;
    case 3:
      topC = color3;
      break;
    default:
      break;
  }
  switch (obj.bottom) {
    case 0:
      bottomC = color0;
      break;
    case 1:
      bottomC = color1;
      break;
    case 2:
      bottomC = color2;
      break;
    case 3:
      bottomC = color3;
      break;
    default:
      break;
  }
  switch (obj.left) {
    case 0:
      leftC = color0;
      break;
    case 1:
      leftC = color1;
      break;
    case 2:
      leftC = color2;
      break;
    case 3:
      leftC = color3;
      break;
    default:
      break;
  }
  switch (obj.right) {
    case 0:
      rightC = color0;
      break;
    case 1:
      rightC = color1;
      break;
    case 2:
      rightC = color2;
      break;
    case 3:
      rightC = color3;
      break;
    default:
      break;
  }

  cell.style.backgroundImage = `linear-gradient(to top left,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 49%,
      ${colorX} 49%,
      ${colorX} 51%,
      rgba(0, 0, 0, 0) 51%,
      rgba(0, 0, 0, 0) 100%),
  linear-gradient(to top right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 49%,
      ${colorX} 49%,
      ${colorX} 51%,
      rgba(0, 0, 0, 0) 51%,
      rgba(0, 0, 0, 0) 100%), conic-gradient(${topC} 0deg,${topC} 45deg, ${rightC} 45deg, ${rightC} 135deg, ${bottomC} 135deg, ${bottomC} 225deg, ${leftC} 225deg, ${leftC} 315deg,${topC} 270deg, ${topC} 0deg)`;
}

function moveCell(event, cellID) {
  if (isSolved || checkIfAllSame(mixedPuzzle[cellID])) {
    return;
  }

  switch (event.button) {
    case 1:
      break;
    case 0: //links
      // console.log(mixedPuzzle[cellID]);
      drehen(mixedPuzzle[cellID], 3);
      // console.log(mixedPuzzle[cellID]);
      drawColor(mixedPuzzle[cellID], document.getElementById("td" + cellID));
      break;
    case 2: // rechts
      // kein rechtsklick bei mobile
      if (mobile) {
        break;
      }
      // console.log(mixedPuzzle[cellID]);
      drehen(mixedPuzzle[cellID], 1);
      // console.log(mixedPuzzle[cellID]);
      drawColor(mixedPuzzle[cellID], document.getElementById("td" + cellID));
      break;
    default:
      break;
  }

  currentTurns++;
  //update turn text
  if (minTurns < 100) {
    if (currentTurns < 10) {
      turnDiv.textContent = "0" + currentTurns + "/" + minTurns;
    } else if (currentTurns < 100) {
      turnDiv.textContent = "" + currentTurns + "/" + minTurns;
    } else {
      turnDiv.textContent = "" + currentTurns + "/" + minTurns;
    }
  } else if (currentTurns < 10) {
    turnDiv.textContent = "00" + currentTurns + "/" + minTurns;
  } else if (currentTurns < 100) {
    turnDiv.textContent = "0" + currentTurns + "/" + minTurns;
  } else {
    turnDiv.textContent = "" + currentTurns + "/" + minTurns;
  }
  checkIfSolved();
}

function checkIfAllSame(element) {
  if (
    // check if all are the same number
    element.top == element.bottom &&
    element.top == element.left &&
    element.top == element.right &&
    element.left == element.right &&
    element.left == element.bottom &&
    element.bottom == element.right
  ) {
    return true;
  } else {
    return false;
  }
}

function calculateScore() {
  highscore = maxscore - (currentTurns - minTurns) * 30 - currentSeconds * 10;
  totalscore += highscore;

  if (!localScores[logFormat]) {
    localScores[logFormat] = [minutesAndSeconds.textContent, totalscore];
    localStorage.setItem("colorMatchScores", JSON.stringify(localScores));
  } else if (totalscore > localScores[logFormat][1]) {
    localScores[logFormat] = [minutesAndSeconds.textContent, totalscore];
    localStorage.setItem("colorMatchScores", JSON.stringify(localScores));
  }
  scoreDiv.textContent = totalscore;
  updateScoreText();
}

function updateScoreText() {
  if (currentRound == 1) {
    clearCurrent();
    //   \r\n
    cRoundId.textContent = "round " + currentRound + "\r\n";
    cTime.textContent = timeInMinSec(currentSeconds) + "\r\n";
    cScore.textContent = highscore + "\r\n";
  } else {
    //   \r\n
    cRoundId.textContent += "round " + currentRound + "\r\n";
    cTime.textContent += timeInMinSec(currentSeconds) + "\r\n";
    cScore.textContent += highscore + "\r\n";
  }
  if (currentRound == rounds) {
    if (rounds > 1) {
      cRoundId.textContent += "total..";
      cTime.textContent += minutesAndSeconds.textContent;
      cScore.textContent += totalscore;
    }
    visibleCurrent();
  }
}

function visibleCurrent() {
  currentBoard.style.zIndex = "1";
  currentBoard.style.visibility = "visible";
}

function clearCurrent() {
  cRoundId.textContent = "";
  cTime.textContent = "";
  cScore.textContent = "";
}

function hideCurrent() {
  currentBoard.style.zIndex = "-1";
  currentBoard.style.visibility = "hidden";
}

function showHighscores() {
  if (!sbShown) {
    sbShown = true;
    hideCurrent();
    clearSB();
    let obj = Object.entries(localScores).sort();

    let obj_keys = Object.keys(obj);
    let obj_values = Object.values(obj);
    for (let index = 0; index < obj_keys.length; index++) {
      sbRoundFormatId.textContent += obj_values[index][0] + "\r\n"; // oby_values[index][0] pulls format
      sbTime.textContent += obj_values[index][1][0] + "\r\n"; // oby_values[index] [1]( includes time and score)   [0] and as we want time
      sbScore.textContent += obj_values[index][1][1] + "\r\n";
    }
    if (obj.length == 0) {
      sbRoundFormatId.textContent = "no";
      sbTime.textContent = "local";
      sbScore.textContent = "scores";
    }
    visibleSB();
  } else {
    sbShown = false;
    hideSB();
    if (isSolved) {
      visibleCurrent();
    }
  }
}

function visibleSB() {
  scoreBoard.style.zIndex = "4";
  scoreBoard.style.visibility = "visible";
}

function clearSB() {
  sbRoundFormatId.textContent = "";
  sbTime.textContent = "";
  sbScore.textContent = "";
}

function hideSB() {
  scoreBoard.style.zIndex = "-1";
  scoreBoard.style.visibility = "hidden";
}

//TODO
/*
-80%- code cleanup
// console.log
*/
