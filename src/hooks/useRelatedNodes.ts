import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { TopicNode } from '@/types';

export function useRelatedNodes(id: string | undefined): TopicNode[] {
  const nodes = useStore((s) => s.nodes);
  const customEdges = useStore((s) => s.customEdges);

  return useMemo(() => {
    if (!id) return [];
    const node = nodes.find((n) => n.id === id);
    if (!node) return [];

    const customIds = customEdges
      .filter((e) => e.source === id || e.target === id)
      .map((e) => (e.source === id ? e.target : e.source));

    const ids = new Set([
      ...node.related,
      ...(node.parentId ? [node.parentId] : []),
      ...node.children,
      ...customIds,
    ]);

    return nodes.filter((n) => ids.has(n.id));
  }, [nodes, customEdges, id]);
}
