import React from "react";

export default function BoardToolbar({
  currentIndex,
  historyLength,
  isThinking,
  gameOver,
  goToMove,
  passMove,
  resignGame
}) {
  return (
    <div className="board-toolbar">
      <button onClick={() => goToMove(0)} disabled={currentIndex === 0}>
        ⏮ First
      </button>

      <button onClick={() => goToMove(currentIndex - 10)} disabled={currentIndex === 0}>
        ⏪ -10
      </button>

      <button onClick={() => goToMove(currentIndex - 1)} disabled={currentIndex === 0}>
        ◀ Previous
      </button>

      <button onClick={() => goToMove(currentIndex + 1)} disabled={currentIndex >= historyLength - 1}>
        Next ▶
      </button>

      <button onClick={() => goToMove(currentIndex + 10)} disabled={currentIndex >= historyLength - 1}>
        +10 ⏩
      </button>

      <button onClick={() => goToMove(historyLength - 1)} disabled={currentIndex >= historyLength - 1}>
        Last ⏭
      </button>

      <button onClick={passMove} disabled={isThinking || gameOver}>
        Pass
      </button>

      <button onClick={resignGame} disabled={isThinking || gameOver}>
        Resign
      </button>
    </div>
  );
}
