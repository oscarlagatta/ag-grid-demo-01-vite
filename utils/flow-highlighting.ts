import type { Node, Edge } from "reactflow"

export interface HighlightConfig {
  selectedNodeId?: string
  highlightColor?: string
  dimmedOpacity?: number
  highlightOpacity?: number
}

export interface HighlightedElements {
  nodes: Node[]
  edges: Edge[]
}

/**
 * Highlights the selected node and its connected elements while dimming others
 * @param nodes - Array of all nodes in the flow
 * @param edges - Array of all edges in the flow
 * @param config - Configuration for highlighting behavior
 * @returns Updated nodes and edges with highlighting applied
 */
export function applyNodeHighlighting(nodes: Node[], edges: Edge[], config: HighlightConfig = {}): HighlightedElements {
  const { selectedNodeId, highlightColor = "#3b82f6", dimmedOpacity = 0.3, highlightOpacity = 1.0 } = config

  if (!selectedNodeId) {
    // No selection - return all elements with full opacity
    return {
      nodes: nodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: highlightOpacity,
        },
      })),
      edges: edges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          opacity: highlightOpacity,
        },
      })),
    }
  }

  // Find connected node IDs
  const connectedNodeIds = getConnectedNodeIds(selectedNodeId, edges)
  const allHighlightedIds = new Set([selectedNodeId, ...connectedNodeIds])

  // Apply highlighting to nodes
  const highlightedNodes = nodes.map((node) => {
    const isHighlighted = allHighlightedIds.has(node.id)
    const isSelected = node.id === selectedNodeId

    return {
      ...node,
      style: {
        ...node.style,
        opacity: isHighlighted ? highlightOpacity : dimmedOpacity,
        borderColor: isSelected ? highlightColor : node.style?.borderColor,
        borderWidth: isSelected ? 2 : node.style?.borderWidth || 1,
        boxShadow: isSelected ? `0 0 0 2px ${highlightColor}40` : node.style?.boxShadow,
      },
      className:
        `${node.className || ""} ${isSelected ? "selected-node" : ""} ${isHighlighted ? "highlighted-node" : "dimmed-node"}`.trim(),
    }
  })

  // Apply highlighting to edges
  const highlightedEdges = edges.map((edge) => {
    const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId

    return {
      ...edge,
      style: {
        ...edge.style,
        opacity: isConnected ? highlightOpacity : dimmedOpacity,
        stroke: isConnected ? highlightColor : edge.style?.stroke,
        strokeWidth: isConnected ? 2 : edge.style?.strokeWidth || 1,
      },
      className: `${edge.className || ""} ${isConnected ? "highlighted-edge" : "dimmed-edge"}`.trim(),
    }
  })

  return {
    nodes: highlightedNodes,
    edges: highlightedEdges,
  }
}

/**
 * Gets all node IDs that are directly connected to the specified node
 * @param nodeId - The ID of the node to find connections for
 * @param edges - Array of all edges in the flow
 * @returns Array of connected node IDs
 */
export function getConnectedNodeIds(nodeId: string, edges: Edge[]): string[] {
  const connectedIds = new Set<string>()

  edges.forEach((edge) => {
    if (edge.source === nodeId) {
      connectedIds.add(edge.target)
    }
    if (edge.target === nodeId) {
      connectedIds.add(edge.source)
    }
  })

  return Array.from(connectedIds)
}

/**
 * Gets all nodes and edges in a path between two nodes
 * @param startNodeId - Starting node ID
 * @param endNodeId - Ending node ID
 * @param edges - Array of all edges in the flow
 * @returns Object containing path node IDs and edge IDs
 */
export function getPathElements(
  startNodeId: string,
  endNodeId: string,
  edges: Edge[],
): { nodeIds: string[]; edgeIds: string[] } {
  const visited = new Set<string>()
  const pathNodeIds: string[] = []
  const pathEdgeIds: string[] = []

  function findPath(currentNodeId: string, targetNodeId: string, path: string[]): boolean {
    if (currentNodeId === targetNodeId) {
      pathNodeIds.push(...path, currentNodeId)
      return true
    }

    if (visited.has(currentNodeId)) {
      return false
    }

    visited.add(currentNodeId)

    for (const edge of edges) {
      if (edge.source === currentNodeId) {
        if (findPath(edge.target, targetNodeId, [...path, currentNodeId])) {
          pathEdgeIds.push(edge.id)
          return true
        }
      }
    }

    return false
  }

  findPath(startNodeId, endNodeId, [])

  return {
    nodeIds: [...new Set(pathNodeIds)],
    edgeIds: [...new Set(pathEdgeIds)],
  }
}

/**
 * Resets all highlighting by removing highlight-related styles and classes
 * @param nodes - Array of nodes to reset
 * @param edges - Array of edges to reset
 * @returns Elements with highlighting removed
 */
export function resetHighlighting(nodes: Node[], edges: Edge[]): HighlightedElements {
  const resetNodes = nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      opacity: 1,
      boxShadow: undefined,
    },
    className: node.className?.replace(/\b(selected-node|highlighted-node|dimmed-node)\b/g, "").trim(),
  }))

  const resetEdges = edges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: 1,
    },
    className: edge.className?.replace(/\b(highlighted-edge|dimmed-edge)\b/g, "").trim(),
  }))

  return {
    nodes: resetNodes,
    edges: resetEdges,
  }
}

/**
 * Highlights multiple nodes simultaneously
 * @param nodes - Array of all nodes
 * @param edges - Array of all edges
 * @param selectedNodeIds - Array of node IDs to highlight
 * @param config - Highlighting configuration
 * @returns Elements with multi-node highlighting applied
 */
export function applyMultiNodeHighlighting(
  nodes: Node[],
  edges: Edge[],
  selectedNodeIds: string[],
  config: HighlightConfig = {},
): HighlightedElements {
  const { highlightColor = "#3b82f6", dimmedOpacity = 0.3, highlightOpacity = 1.0 } = config

  if (selectedNodeIds.length === 0) {
    return resetHighlighting(nodes, edges)
  }

  // Get all connected nodes for all selected nodes
  const allConnectedIds = new Set<string>()
  selectedNodeIds.forEach((nodeId) => {
    allConnectedIds.add(nodeId)
    getConnectedNodeIds(nodeId, edges).forEach((id) => allConnectedIds.add(id))
  })

  const highlightedNodes = nodes.map((node) => {
    const isHighlighted = allConnectedIds.has(node.id)
    const isSelected = selectedNodeIds.includes(node.id)

    return {
      ...node,
      style: {
        ...node.style,
        opacity: isHighlighted ? highlightOpacity : dimmedOpacity,
        borderColor: isSelected ? highlightColor : node.style?.borderColor,
        borderWidth: isSelected ? 2 : node.style?.borderWidth || 1,
      },
      className:
        `${node.className || ""} ${isSelected ? "selected-node" : ""} ${isHighlighted ? "highlighted-node" : "dimmed-node"}`.trim(),
    }
  })

  const highlightedEdges = edges.map((edge) => {
    const isConnected = selectedNodeIds.some((nodeId) => edge.source === nodeId || edge.target === nodeId)

    return {
      ...edge,
      style: {
        ...edge.style,
        opacity: isConnected ? highlightOpacity : dimmedOpacity,
        stroke: isConnected ? highlightColor : edge.style?.stroke,
      },
      className: `${edge.className || ""} ${isConnected ? "highlighted-edge" : "dimmed-edge"}`.trim(),
    }
  })

  return {
    nodes: highlightedNodes,
    edges: highlightedEdges,
  }
}
