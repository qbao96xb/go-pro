import React, { useEffect, useMemo, useRef } from "react";

const STEP_X = 44;
const STEP_Y = 48;
const PADDING = 28;
const STONE_SIZE = 30;

function buildLayout(gameTree) {
  const positions = [];
  const edges = [];
  let nextRow = 1;

  function placeLine(startId, row, parentPosition = null) {
    let node = gameTree.nodes[startId];
    let previous = parentPosition;
    const alternatives = [];

    while (node) {
      const position = {
        node,
        x: PADDING + node.moveNumber * STEP_X,
        y: PADDING + row * STEP_Y
      };

      positions.push(position);

      if (previous) {
        edges.push({
          id: `${previous.node.id}-${node.id}`,
          from: previous,
          to: position
        });
      }

      const mainId = node.mainChildId || node.children[0] || null;

      node.children.forEach(childId => {
        if (childId !== mainId) {
          alternatives.push({ childId, parent: position });
        }
      });

      previous = position;
      node = mainId ? gameTree.nodes[mainId] : null;
    }

    alternatives.forEach(({ childId, parent }) => {
      const childRow = nextRow++;
      placeLine(childId, childRow, parent);
    });
  }

  placeLine(gameTree.rootId, 0);

  return {
    positions,
    edges,
    width: Math.max(
      320,
      ...positions.map(position => position.x + PADDING)
    ),
    height: Math.max(180, PADDING * 2 + nextRow * STEP_Y)
  };
}

function getPivotalBorder(node, selected) {
  if (selected) return "#ef4444";
  if (node.pivotalLevel === "critical") return "#dc2626";
  if (node.pivotalLevel === "important") return "#f97316";
  if (node.pivotalLevel === "notice") return "#facc15";
  return "rgba(0,0,0,.45)";
}

function getPivotalWrapperBackground(node, selected) {
  if (selected) return "rgba(239, 68, 68, 0.95)";
  if (node.pivotalLevel === "critical") return "rgba(220, 38, 38, 0.55)";
  if (node.pivotalLevel === "important") return "rgba(249, 115, 22, 0.5)";
  if (node.pivotalLevel === "notice") return "rgba(250, 204, 21, 0.35)";
  return "transparent";
}

export default function VariationTree({
  gameTree,
  currentNodeId,
  onSelectNode
}) {
  const selectedRef = useRef(null);

  const layout = useMemo(
    () => gameTree ? buildLayout(gameTree) : null,
    [gameTree]
  );

  const activePath = useMemo(() => {
    const ids = new Set();
    let node = gameTree?.nodes[currentNodeId];

    while (node) {
      ids.add(node.id);
      node = node.parentId ? gameTree.nodes[node.parentId] : null;
    }

    return ids;
  }, [gameTree, currentNodeId]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
  }, [currentNodeId]);

  if (!layout) return <p>No game loaded.</p>;

  return (
    <div
      aria-label="Game variation tree"
      className="variation-tree-canvas"
    >
      <div
        style={{
          position: "relative",
          width: layout.width,
          height: layout.height
        }}
      >
        {layout.edges.map(edge => {
          const dx = edge.to.x - edge.from.x;
          const dy = edge.to.y - edge.from.y;

          return (
            <div
              key={edge.id}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: edge.from.x,
                top: edge.from.y,
                width: Math.hypot(dx, dy),
                height: 2,
                background: "#39260e",
                transformOrigin: "0 50%",
                transform: `rotate(${Math.atan2(dy, dx)}rad)`,
                pointerEvents: "none"
              }}
            />
          );
        })}

        {layout.positions.map(({ node, x, y }) => {
          const selected = node.id === currentNodeId;
          const black = node.move?.[0] === "B";
          const root = !node.move;

          const title = root
            ? "Initial position"
            : `Move ${node.moveNumber}: ${node.move[0]} ${node.move[1]}${
                node.pivotalLevel
                  ? ` | ${node.pivotalLevel} pivotal move`
                  : ""
              }`;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: STONE_SIZE + 10,
                height: STONE_SIZE + 10,
                transform: "translate(-50%, -50%)",
                display: "grid",
                placeItems: "center",
                background: getPivotalWrapperBackground(node, selected),
                borderRadius: 6
              }}
            >
              <button
                ref={selected ? selectedRef : null}
                type="button"
                aria-label={title}
                aria-current={selected ? "step" : undefined}
                title={title}
                onClick={() => onSelectNode(node.id)}
                style={{
                  boxSizing: "border-box",
                  display: "grid",
                  placeItems: "center",
                  width: STONE_SIZE,
                  minWidth: STONE_SIZE,
                  height: STONE_SIZE,
                  margin: 0,
                  padding: 0,
                  borderRadius: "50%",
                  border: `3px solid ${getPivotalBorder(node, selected)}`,
                  background: root
                    ? "#ead8af"
                    : black
                      ? "radial-gradient(circle at 32% 25%, #666, #080808 75%)"
                      : "radial-gradient(circle at 32% 25%, #fff, #ccc 80%)",
                  color: black && !root ? "#fff" : "#181818",
                  opacity: selected || activePath.has(node.id) ? 1 : 0.68,
                  boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {root ? "△" : node.moveNumber}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
