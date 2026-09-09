export const BOARD_SIZE = 19;
export const COL_LETTERS = "ABCDEFGHJKLMNOPQRST";

export function createEmptyBoard() {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(0));
}

export function cloneBoard(board) {
  return board.map(row => [...row]);
}

export function boardsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function coordToXY(coord) {
  if (!coord || coord.toLowerCase() === "pass") return null;

  const col = coord[0];
  const row = parseInt(coord.slice(1), 10);

  const x = COL_LETTERS.indexOf(col);
  const y = BOARD_SIZE - row;

  if (x < 0 || y < 0 || y >= BOARD_SIZE) return null;
  return [x, y];
}

export function xyToCoord(x, y) {
  return `${COL_LETTERS[x]}${BOARD_SIZE - y}`;
}

export function neighbors(x, y) {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1]
  ].filter(([nx, ny]) => (
    nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE
  ));
}

export function getGroup(board, x, y) {
  const color = board[y][x];
  const visited = new Set();
  const stones = [];
  const liberties = new Set();
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    const key = `${cx},${cy}`;

    if (visited.has(key)) continue;
    visited.add(key);
    stones.push([cx, cy]);

    for (const [nx, ny] of neighbors(cx, cy)) {
      if (board[ny][nx] === 0) {
        liberties.add(`${nx},${ny}`);
      } else if (board[ny][nx] === color) {
        stack.push([nx, ny]);
      }
    }
  }

  return {
    stones,
    liberties
  };
}

export function playMoveOnBoard(board, x, y, color, previousBoard = null) {
  if (board[y][x] !== 0) {
    return {
      legal: false,
      reason: "Point already occupied."
    };
  }

  const newBoard = cloneBoard(board);
  newBoard[y][x] = color;

  const opponent = -color;
  let captured = 0;

  for (const [nx, ny] of neighbors(x, y)) {
    if (newBoard[ny][nx] !== opponent) continue;

    const group = getGroup(newBoard, nx, ny);

    if (group.liberties.size === 0) {
      for (const [gx, gy] of group.stones) {
        newBoard[gy][gx] = 0;
        captured += 1;
      }
    }
  }

  const ownGroup = getGroup(newBoard, x, y);

  if (ownGroup.liberties.size === 0) {
    return {
      legal: false,
      reason: "Suicide move is not allowed."
    };
  }

  if (previousBoard && boardsEqual(newBoard, previousBoard)) {
    return {
      legal: false,
      reason: "Ko violation."
    };
  }

  return {
    legal: true,
    board: newBoard,
    captured
  };
}

export function getCurrentTurnFromMoveCount(moveCount) {
  return moveCount % 2 === 0 ? "B" : "W";
}
