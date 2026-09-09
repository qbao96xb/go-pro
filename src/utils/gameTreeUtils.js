export function createRootNode(createEmptyBoard) {
  return {
    id: "root",
    parentId: null,
    move: null,
    moveNumber: 0,
    board: createEmptyBoard(),
    captures: { B: 0, W: 0 },
    children: [],
    mainChildId: null,
    isMainLine: true,
    comment: "",
    eval: null
  };
}

export function createInitialGameTree(createEmptyBoard) {
  const root = createRootNode(createEmptyBoard);

  return {
    rootId: root.id,
    currentNodeId: root.id,
    nodes: {
      [root.id]: root
    }
  };
}

export function createNodeId() {
  return `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCurrentNode(gameTree) {
  return gameTree.nodes[gameTree.currentNodeId];
}

export function getNodeLine(gameTree, nodeId) {
  const line = [];
  let current = gameTree.nodes[nodeId];

  while (current) {
    line.unshift(current);
    if (!current.parentId) break;
    current = gameTree.nodes[current.parentId];
  }

  return line;
}

export function getMovesToNode(gameTree, nodeId) {
  return getNodeLine(gameTree, nodeId)
    .filter(node => node.move)
    .map(node => node.move);
}

export function getNextMoveColorFromNode(gameTree, nodeId) {
  const moves = getMovesToNode(gameTree, nodeId);
  return moves.length % 2 === 0 ? "B" : "W";
}

export function addChildMove(gameTree, parentId, childNode) {
  const parent = gameTree.nodes[parentId];

  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`);
  }

  const existingSameMove = parent.children
    .map(id => gameTree.nodes[id])
    .find(node => node.move?.[0] === childNode.move?.[0] && node.move?.[1] === childNode.move?.[1]);

  if (existingSameMove) {
    return {
      ...gameTree,
      currentNodeId: existingSameMove.id
    };
  }

  const updatedParent = {
    ...parent,
    children: [...parent.children, childNode.id],
    mainChildId: parent.mainChildId || childNode.id
  };

  return {
    ...gameTree,
    currentNodeId: childNode.id,
    nodes: {
      ...gameTree.nodes,
      [parentId]: updatedParent,
      [childNode.id]: childNode
    }
  };
}

export function historyToGameTree(
  history,
  evalHistory = [],
  existingTree = null
) {
  if (!history.length) {
    throw new Error("Cannot create a tree from empty history.");
  }

  const evaluations = new Map(
    evalHistory.map(entry => [entry.moveNumber, entry])
  );

  const toNodeEvaluation = (entry) => {
    if (!entry) return null;

    return {
      rootInfo: {
        winrate: Number.isFinite(entry.blackWinrate)
          ? entry.blackWinrate / 100
          : null,
        scoreLead: entry.scoreLead ?? null
      },
      pointLoss: entry.pointLoss ?? null,
      moveInfos: [],
      ownership: null
    };
  };

  const nodes = { ...(existingTree?.nodes || {}) };

  for (let index = 0; index < history.length; index += 1) {
    const state = history[index];
    const id = index === 0 ? "root" : `main-${index}`;
    const parentId =
      index === 0 ? null : index === 1 ? "root" : `main-${index - 1}`;
    const nextId =
      index < history.length - 1 ? `main-${index + 1}` : null;

    const previousNode = nodes[id];
    const children = [...(previousNode?.children || [])];

    if (nextId && !children.includes(nextId)) {
      children.unshift(nextId);
    }

    const savedEvaluation = toNodeEvaluation(
      evaluations.get(state.moves.length)
    );

    nodes[id] = {
      ...previousNode,
      id,
      parentId,
      move: index === 0 ? null : state.moves[state.moves.length - 1],
      moveNumber: state.moves.length,
      board: state.board,
      captures: state.captures,
      children,
      mainChildId: nextId || previousNode?.mainChildId || null,
      isMainLine: true,
      comment: state.feedback || "",
      eval: previousNode?.eval || savedEvaluation
    };
  }

  const lastId = history.length === 1
    ? "root"
    : `main-${history.length - 1}`;

  return {
    rootId: "root",
    currentNodeId: existingTree?.currentNodeId || lastId,
    nodes
  };
}

export function getMainLine(gameTree) {
  const result = [];
  let current = gameTree.nodes[gameTree.rootId];

  while (current) {
    result.push(current);

    if (!current.mainChildId) break;
    current = gameTree.nodes[current.mainChildId];
  }

  return result;
}

export function getFirstChild(gameTree, nodeId) {
  const node = gameTree.nodes[nodeId];
  if (!node || node.children.length === 0) return null;

  return gameTree.nodes[node.mainChildId || node.children[0]];
}

export function getPreviousSibling(gameTree, nodeId) {
  const node = gameTree.nodes[nodeId];
  if (!node?.parentId) return null;

  const parent = gameTree.nodes[node.parentId];
  const index = parent.children.indexOf(nodeId);

  if (index <= 0) return null;

  return gameTree.nodes[parent.children[index - 1]];
}

export function getNextSibling(gameTree, nodeId) {
  const node = gameTree.nodes[nodeId];
  if (!node?.parentId) return null;

  const parent = gameTree.nodes[node.parentId];
  const index = parent.children.indexOf(nodeId);

  if (index < 0 || index >= parent.children.length - 1) return null;

  return gameTree.nodes[parent.children[index + 1]];
}

export function getBranchAwareLine(gameTree, nodeId) {
  const line = getNodeLine(gameTree, nodeId);
  let cursor = getFirstChild(gameTree, nodeId);

  while (cursor) {
    line.push(cursor);
    cursor = getFirstChild(gameTree, cursor.id);
  }

  return line;
}

export function findNodeByMoveNumberOnCurrentLine(gameTree, currentNodeId, moveNumber) {
  const line = getBranchAwareLine(gameTree, currentNodeId);
  const target = line.find(node => node.moveNumber === moveNumber);

  return target || null;
}

export function markPivotalMovesOnMainLine(gameTree, pivotalMoves = []) {
  const pivotalMap = new Map(
    pivotalMoves.map(move => [move.moveNumber, move])
  );

  const nodes = { ...gameTree.nodes };

  Object.values(nodes).forEach(node => {
    if (!node.isMainLine) return;

    const pivotal = pivotalMap.get(node.moveNumber);

    nodes[node.id] = {
      ...node,
      pivotalLevel: pivotal?.level || null,
      pivotalScoreSwing: pivotal?.scoreSwing ?? null,
      pivotalWinrateSwing: pivotal?.winrateSwing ?? null
    };
  });

  return {
    ...gameTree,
    nodes
  };
}
