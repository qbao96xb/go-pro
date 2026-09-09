import React from "react";

import {
  BOARD_SIZE,
  COL_LETTERS,
  coordToXY
} from "../utils/goUtils";

import {
  TOP_MOVE_LABEL_LIMIT
} from "../utils/analysisUtils";

export const OVERLAY_VERTEX_SIZE = 36;
export const OVERLAY_BOARD_PADDING = 31;
export const OVERLAY_EXTRA_SPACE = 80;

const TOP_MOVE_MARKER_OFFSET_X = 0;
const TOP_MOVE_MARKER_OFFSET_Y = 0;

const COORD_TOP_OFFSET = 38;
const COORD_BOTTOM_OFFSET = 44;
const COORD_LEFT_OFFSET = 38;
const COORD_RIGHT_OFFSET = 38;

const TERRITORY_SHADOW_THRESHOLD = 0.35;

const OVERLAY_SIZE =
  OVERLAY_VERTEX_SIZE * BOARD_SIZE +
  OVERLAY_BOARD_PADDING * 2 +
  OVERLAY_EXTRA_SPACE;

function getBoardPixelPosition(x, y) {
  return {
    left: OVERLAY_BOARD_PADDING + x * OVERLAY_VERTEX_SIZE,
    top: OVERLAY_BOARD_PADDING + y * OVERLAY_VERTEX_SIZE
  };
}

function pointKey(x, y) {
  return `${x},${y}`;
}

function buildOccupiedPointSet(currentBoard) {
  const occupied = new Set();

  if (!currentBoard) return occupied;

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const value = currentBoard[y]?.[x];

      if (value !== 0 && value !== null && value !== undefined) {
        occupied.add(pointKey(x, y));
      }
    }
  }

  return occupied;
}

function normalizePvMoves(branchPreview, currentMoves = []) {
  if (!branchPreview) return [];

  const rootMove = branchPreview.rootMove;
  const pv = Array.isArray(branchPreview.moves) ? branchPreview.moves : [];

  const rawMoves = [];

  // Avoid duplicating rootMove if pv already starts with it.
  if (rootMove && rootMove.toLowerCase?.() !== "pass") {
    rawMoves.push(rootMove);
  }

  pv.forEach((move, index) => {
    if (typeof move !== "string") return;
    if (move.toLowerCase() === "pass") return;

    const isDuplicateRoot =
      index === 0 &&
      rootMove &&
      move.toLowerCase() === rootMove.toLowerCase();

    if (!isDuplicateRoot) {
      rawMoves.push(move);
    }
  });

  const nextColorIsBlack = currentMoves.length % 2 === 0;

  return rawMoves
    .map((coord, index) => {
      const xy = coordToXY(coord);
      if (!xy) return null;

      const colorIsBlack =
        index % 2 === 0 ? nextColorIsBlack : !nextColorIsBlack;

      return {
        coord,
        x: xy[0],
        y: xy[1],
        number: index + 1,
        color: colorIsBlack ? "B" : "W"
      };
    })
    .filter(Boolean)
    .slice(0, 15);
}

function getLastMove(currentMoves = []) {
  if (!currentMoves.length) return null;

  const last = currentMoves[currentMoves.length - 1];
  if (!last || last[1]?.toLowerCase?.() === "pass") return null;

  const xy = coordToXY(last[1]);
  if (!xy) return null;

  return {
    color: last[0],
    coord: last[1],
    x: xy[0],
    y: xy[1]
  };
}

function territoryShadowOpacity(confidence) {
  if (confidence >= 0.9) return 0.72;
  if (confidence >= 0.75) return 0.58;
  if (confidence >= 0.6) return 0.44;
  if (confidence >= 0.45) return 0.32;
  return 0.22;
}

function TerritoryOverlay({
  ownership,
  occupiedPoints
}) {
  if (!Array.isArray(ownership)) return null;

  return (
    <div
      className="territory-shadow-layer"
      style={{
        width: `${OVERLAY_SIZE}px`,
        height: `${OVERLAY_SIZE}px`
      }}
    >
      {ownership.map((value, index) => {
        if (typeof value !== "number") return null;

        const confidence = Math.abs(value);

        if (confidence < TERRITORY_SHADOW_THRESHOLD) return null;

        const x = index % BOARD_SIZE;
        const y = Math.floor(index / BOARD_SIZE);

        if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
          return null;
        }

        // Do not tint stones directly.
        if (occupiedPoints.has(pointKey(x, y))) return null;

        const pos = getBoardPixelPosition(x, y);
        const owner = value > 0 ? "black" : "white";

        return (
          <div
            key={`territory-shadow-${index}`}
            className={`territory-shadow territory-shadow-${owner}`}
            style={{
              left: `${pos.left}px`,
              top: `${pos.top}px`,
              opacity: territoryShadowOpacity(confidence)
            }}
            title={`${owner} ownership ${(confidence * 100).toFixed(0)}%`}
          />
        );
      })}
    </div>
  );
}

function CoordinateOverlay() {
  return (
    <>
      {/* Top coordinates */}
      {COL_LETTERS.split("").map((letter, x) => {
        const pos = getBoardPixelPosition(x, 0);

        return (
          <div
            key={`coord-top-${letter}`}
            className="coordinate-label coordinate-label-top"
            style={{
              left: `${pos.left}px`,
              top: `${pos.top - COORD_TOP_OFFSET}px`
            }}
          >
            {letter}
          </div>
        );
      })}

      {/* Bottom coordinates */}
      {COL_LETTERS.split("").map((letter, x) => {
        const pos = getBoardPixelPosition(x, BOARD_SIZE - 1);

        return (
          <div
            key={`coord-bottom-${letter}`}
            className="coordinate-label coordinate-label-bottom"
            style={{
              left: `${pos.left}px`,
              top: `${pos.top + COORD_BOTTOM_OFFSET}px`
            }}
          >
            {letter}
          </div>
        );
      })}

      {/* Left coordinates */}
      {Array.from({ length: BOARD_SIZE }, (_, y) => {
        const rowNumber = BOARD_SIZE - y;
        const pos = getBoardPixelPosition(0, y);

        return (
          <div
            key={`coord-left-${rowNumber}`}
            className="coordinate-label coordinate-label-left"
            style={{
              left: `${pos.left - COORD_LEFT_OFFSET}px`,
              top: `${pos.top}px`
            }}
          >
            {rowNumber}
          </div>
        );
      })}

      {/* Right coordinates */}
      {Array.from({ length: BOARD_SIZE }, (_, y) => {
        const rowNumber = BOARD_SIZE - y;
        const pos = getBoardPixelPosition(BOARD_SIZE - 1, y);

        return (
          <div
            key={`coord-right-${rowNumber}`}
            className="coordinate-label coordinate-label-right"
            style={{
              left: `${pos.left + COORD_RIGHT_OFFSET}px`,
              top: `${pos.top}px`
            }}
          >
            {rowNumber}
          </div>
        );
      })}
    </>
  );
}

function TopMoveOverlay({
  topMoves
}) {
  if (!Array.isArray(topMoves)) return null;

  return (
    <>
      {topMoves.map((move, index) => {
        if (!move) return null;

        const x =
          typeof move.x === "number"
            ? move.x
            : coordToXY(move.move)?.[0];

        const y =
          typeof move.y === "number"
            ? move.y
            : coordToXY(move.move)?.[1];

        if (typeof x !== "number" || typeof y !== "number") return null;

        const pos = getBoardPixelPosition(x, y);
        const markerLeft = pos.left + TOP_MOVE_MARKER_OFFSET_X;
        const markerTop = pos.top + TOP_MOVE_MARKER_OFFSET_Y;
        const size = index === 0 ? 32 : 28;
        const showLabel = index < TOP_MOVE_LABEL_LIMIT;

        const scoreText =
          typeof move.scoreLead === "number"
            ? move.scoreLead > 0
              ? `+${move.scoreLead.toFixed(1)}`
              : move.scoreLead.toFixed(1)
            : "";

        const policyText =
          typeof move.policy === "number"
            ? `${(move.policy * 100).toFixed(0)}%`
            : "";

        const labelText =
          [scoreText, policyText].filter(Boolean).join(" / ");

        const intensity =
          typeof move.intensity === "number"
            ? move.intensity
            : index === 0
              ? 0.7
              : 0.28;

        return (
          <div
            key={`top-move-${move.move}-${index}`}
            className="top-move-marker"
            style={{
              left: `${markerLeft}px`,
              top: `${markerTop}px`,
              width: `${size}px`,
              height: `${size}px`,
              background: `rgba(34, 197, 94, ${intensity})`,
              borderColor: index === 0 ? "#14532d" : "#22c55e"
            }}
            title={`${move.move} ${labelText}`}
          >
            {showLabel && (
              <span className="top-move-label">
                {labelText}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}

function VariationPreviewOverlay({
  variationMoves
}) {
  return (
    <>
      {variationMoves.map(move => {
        const pos = getBoardPixelPosition(move.x, move.y);

        return (
          <div
            key={`variation-${move.number}-${move.coord}`}
            className={
              move.color === "B"
                ? "variation-stone variation-stone-black"
                : "variation-stone variation-stone-white"
            }
            style={{
              left: `${pos.left + 1}px`,
              top: `${pos.top + 1}px`
            }}
            title={`${move.number}. ${move.color} ${move.coord}`}
          >
            {move.number}
          </div>
        );
      })}
    </>
  );
}

function LastMoveOverlay({
  lastMove
}) {
  if (!lastMove) return null;

  const pos = getBoardPixelPosition(lastMove.x, lastMove.y);

  return (
    <div
      className={
        lastMove.color === "B"
          ? "last-move-marker last-move-marker-on-black"
          : "last-move-marker last-move-marker-on-white"
      }
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`
      }}
      title={`Last move: ${lastMove.color} ${lastMove.coord}`}
    />
  );
}

function HoverGhostOverlay({
  hoverPoint,
  nextMoveColor,
  occupiedPoints
}) {
  if (!hoverPoint) return null;

  if (occupiedPoints.has(pointKey(hoverPoint.x, hoverPoint.y))) {
    return null;
  }

  const pos = getBoardPixelPosition(hoverPoint.x, hoverPoint.y);

  return (
    <div
      className={
        nextMoveColor === "B"
          ? "hover-ghost-stone hover-ghost-black"
          : "hover-ghost-stone hover-ghost-white"
      }
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`
      }}
      title={`Preview: ${nextMoveColor}`}
    />
  );
}

export default function BoardOverlay({
  settings,
  ownership,
  topMoves,
  branchPreview,
  currentMoves = [],
  currentBoard = null,
  hoverPoint = null,
  nextMoveColor = "B"
}) {
  const variationMoves = normalizePvMoves(branchPreview, currentMoves);
  const lastMove = getLastMove(currentMoves);
  const occupiedPoints = buildOccupiedPointSet(currentBoard);

  return (
    <div
      className="board-overlay-layer"
      style={{
        width: `${OVERLAY_SIZE}px`,
        height: `${OVERLAY_SIZE}px`
      }}
    >
      {settings.showCoordinates && (
        <CoordinateOverlay />
      )}

      {settings.showTerritory && (
        <TerritoryOverlay
          ownership={ownership}
          occupiedPoints={occupiedPoints}
        />
      )}

      {settings.showTopMoves && !branchPreview && (
        <TopMoveOverlay topMoves={topMoves} />
      )}

      <VariationPreviewOverlay variationMoves={variationMoves} />

      {settings.showLastMoveMarker && (
        <LastMoveOverlay lastMove={lastMove} />
      )}

      {settings.showHoverGhostStone && (
        <HoverGhostOverlay
          hoverPoint={hoverPoint}
          nextMoveColor={nextMoveColor}
          occupiedPoints={occupiedPoints}
        />
      )}
    </div>
  );
}
