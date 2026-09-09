import { BOARD_SIZE } from "./goUtils";

export function movesToSgf({
  moves = [],
  blackName = "Black",
  whiteName = "White",
  blackRank = "?",
  whiteRank = "?",
  komi = 6.5,
  rules = "japanese",
  result = "",
  date = new Date().toISOString().slice(0, 10)
}) {
  const moveText = moves
    .map(([color, coord]) => {
      const sgfColor = color === "B" ? "B" : "W";
      const sgfCoord = goCoordToSgf(coord);

      return `;${sgfColor}[${sgfCoord}]`;
    })
    .join("");

  const resultText = result ? `RE[${escapeSgfText(result)}]` : "";

  return `(;GM[1]FF[4]CA[UTF-8]AP[GoTutor]SZ[${BOARD_SIZE}]KM[${komi}]RU[${rules}]DT[${escapeSgfText(date)}]PB[${escapeSgfText(blackName)}]PW[${escapeSgfText(whiteName)}]BR[${escapeSgfText(blackRank)}]WR[${escapeSgfText(whiteRank)}]${resultText}${moveText})`;
}


export function downloadTextFile(filename, content) {
  const blob = new Blob([content], {
    type: "application/x-go-sgf;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function parseSimpleSgfMoves(sgfText) {
  const moveRegex = /;([BW])\[([a-s]{0,2})\]/gi;
  const moves = [];
  let match;

  while ((match = moveRegex.exec(sgfText)) !== null) {
    const color = match[1].toUpperCase();
    const sgfCoord = match[2];

    moves.push([
      color,
      sgfCoord ? sgfCoordToGoCoord(sgfCoord) : "pass"
    ]);
  }

  return moves;
}

function goCoordToSgf(coord) {
  if (!coord || coord.toLowerCase() === "pass") return "";

  const letters = "ABCDEFGHJKLMNOPQRST";
  const lowerLetters = "abcdefghijklmnopqrs";

  const col = coord[0].toUpperCase();
  const row = Number(coord.slice(1));

  const x = letters.indexOf(col);
  const y = BOARD_SIZE - row;

  if (x < 0 || y < 0 || y >= BOARD_SIZE) return "";

  return `${lowerLetters[x]}${lowerLetters[y]}`;
}

function sgfCoordToGoCoord(sgfCoord) {
  if (!sgfCoord || sgfCoord.length < 2) return "pass";

  const lowerLetters = "abcdefghijklmnopqrs";
  const goLetters = "ABCDEFGHJKLMNOPQRST";

  const x = lowerLetters.indexOf(sgfCoord[0]);
  const y = lowerLetters.indexOf(sgfCoord[1]);

  if (x < 0 || y < 0) return "pass";

  return `${goLetters[x]}${BOARD_SIZE - y}`;
}

function escapeSgfText(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
}
