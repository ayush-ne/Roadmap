import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { filterNodes } from '@/utils/layout';
import type { TopicNode } from '@/types';

export function useFilteredNodes(): TopicNode[] {
  const nodes = useStore((s) => s.nodes);
  const filters = useStore((s) => s.filters);
  const activeCategory = useStore((s) => s.settings.activeCategory);

  return useMemo(() => {
    const categoryNodes = nodes.filter(
      (n) =>
        n.category === activeCategory ||
        (n.isProject && activeCategory === 'projects')
    );

    return filterNodes(categoryNodes, filters);
  }, [nodes, filters, activeCategory]);
}
