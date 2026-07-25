import type { TopicNode, GraphEdge, LayoutMode } from '@/types';

const HORIZONTAL_SPACING = 220;
const VERTICAL_SPACING = 100;

export function buildEdgesFromNodes(nodes: TopicNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  nodes.forEach((node) => {
    node.children.forEach((childId) => {
      edges.push({
        id: `${node.id}-${childId}`,
        source: node.id,
        target: childId,
        type: 'hierarchy',
      });
    });
    node.related.forEach((relatedId) => {
      if (!edges.find((e) => e.id === `${node.id}-${relatedId}` || e.id === `${relatedId}-${node.id}`)) {
        edges.push({
          id: `related-${node.id}-${relatedId}`,
          source: node.id,
          target: relatedId,
          type: 'related',
        });
      }
    });
  });
  return edges;
}

// Returns the set of node ids that should be hidden because one of their
// ancestors (via the parent/child tree) is collapsed.
export function getCollapsedDescendantIds(nodes: TopicNode[]): Set<string> {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hidden = new Set<string>();

  function hideChildren(id: string) {
    const node = nodeMap.get(id);
    if (!node) return;
    node.children.forEach((childId) => {
      if (!hidden.has(childId)) {
        hidden.add(childId);
        hideChildren(childId);
      }
    });
  }

  nodes.forEach((node) => {
    if (node.collapsed) hideChildren(node.id);
  });

  return hidden;
}

export function getVisibleNodes(nodes: TopicNode[]): TopicNode[] {
  const hidden = getCollapsedDescendantIds(nodes);
  return nodes.filter((n) => !hidden.has(n.id));
}

export function computeTreeLayout(
  nodes: TopicNode[],
  rootIds?: string[]
): TopicNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]));
  const roots =
    rootIds ??
    nodes.filter((n) => !n.parentId || !nodeMap.has(n.parentId)).map((n) => n.id);

  let currentY = 0;

  function layoutSubtree(nodeId: string, depth: number): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const childIds = node.children.filter((id) => nodeMap.has(id));
    if (childIds.length === 0) {
      node.position = { x: depth * HORIZONTAL_SPACING, y: currentY };
      currentY += VERTICAL_SPACING;
      return node.position.y;
    }

    const childYs = childIds.map((id) => layoutSubtree(id, depth + 1));
    const avgY = childYs.reduce((a, b) => a + b, 0) / childYs.length;
    node.position = { x: depth * HORIZONTAL_SPACING, y: avgY };
    return avgY;
  }

  roots.forEach((rootId) => layoutSubtree(rootId, 0));

  return Array.from(nodeMap.values());
}

export function computeMindMapLayout(nodes: TopicNode[]): TopicNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]));
  const roots = nodes.filter((n) => !n.parentId);

  roots.forEach((root, rootIndex) => {
    const centerX = 400 + rootIndex * 600;
    const centerY = 300;
    const rootNode = nodeMap.get(root.id)!;
    rootNode.position = { x: centerX, y: centerY };

    function layoutRadial(
      nodeId: string,
      angle: number,
      radius: number,
      spread: number
    ) {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const childIds = node.children.filter((id) => nodeMap.has(id));
      if (childIds.length === 0) return;

      const angleStep = spread / Math.max(childIds.length - 1, 1);
      childIds.forEach((childId, i) => {
        const childAngle = angle - spread / 2 + i * angleStep;
        const child = nodeMap.get(childId)!;
        child.position = {
          x: node.position.x + Math.cos(childAngle) * radius,
          y: node.position.y + Math.sin(childAngle) * radius,
        };
        layoutRadial(childId, childAngle, radius * 0.7, spread * 0.6);
      });
    }

    layoutRadial(root.id, -Math.PI / 2, 180, Math.PI);
  });

  return Array.from(nodeMap.values());
}

export function computeGridLayout(nodes: TopicNode[]): TopicNode[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((node, i) => ({
    ...node,
    position: {
      x: (i % cols) * HORIZONTAL_SPACING,
      y: Math.floor(i / cols) * VERTICAL_SPACING,
    },
  }));
}

export function applyLayout(
  nodes: TopicNode[],
  mode: LayoutMode,
  categoryId?: string
): TopicNode[] {
  const filtered = categoryId
    ? nodes.filter((n) => n.category === categoryId || n.isProject)
    : nodes;

  switch (mode) {
    case 'mindmap':
      return computeMindMapLayout(filtered);
    case 'grid':
      return computeGridLayout(filtered);
    case 'tree':
    default:
      return computeTreeLayout(filtered);
  }
}

export function filterNodes(
  nodes: TopicNode[],
  filters: {
    statuses: string[];
    tags: string[];
    categories: string[];
    difficulty: number[];
    confidence: number[];
    showProjects: boolean;
    searchQuery: string;
  }
): TopicNode[] {
  return nodes.filter((node) => {
    if (!filters.showProjects && node.isProject) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(node.status))
      return false;
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(node.category)
    )
      return false;
    if (
      filters.tags.length > 0 &&
      !filters.tags.some((t) => node.tags.includes(t))
    )
      return false;
    if (
      filters.difficulty.length > 0 &&
      !filters.difficulty.includes(node.difficulty)
    )
      return false;
    if (
      filters.confidence.length > 0 &&
      !filters.confidence.includes(node.confidence)
    )
      return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = [
        node.title,
        node.description,
        ...node.tags,
        ...node.notes.map((n) => n.content),
        ...node.resources.map((r) => r.title),
        ...node.github.map((g) => g.title),
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}
