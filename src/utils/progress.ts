import type { NodeStatus, TopicNode } from '@/types';
import { STATUS_CONFIG } from '@/types';

export function getNodeProgress(node: TopicNode): number {
  if (typeof node.progress === 'number') return node.progress;
  if (node.type !== 'topic') {
    return node.status === 'completed' ? 100 : node.status === 'learning' ? 50 : 0;
  }
  const base = STATUS_CONFIG[node.status].progress;
  const practiceBonus =
    node.practice.length > 0
      ? (node.practice.filter((p) => p.completed).length / node.practice.length) * 10
      : 0;
  return Math.min(100, base + practiceBonus * (base > 0 ? 1 : 0));
}

export function calculateOverallProgress(nodes: TopicNode[]): number {
  const topics = nodes.filter((n) => n.type === 'topic');
  if (topics.length === 0) return 0;
  const total = topics.reduce((sum, n) => sum + getNodeProgress(n), 0);
  return Math.round(total / topics.length);
}

export function calculateCategoryProgress(
  nodes: TopicNode[],
  categoryId: string
): number {
  const categoryNodes = nodes.filter(
    (n) => n.category === categoryId && n.type === 'topic'
  );
  if (categoryNodes.length === 0) return 0;
  const total = categoryNodes.reduce((sum, n) => sum + getNodeProgress(n), 0);
  return Math.round(total / categoryNodes.length);
}

export function countByStatus(
  nodes: TopicNode[],
  status: NodeStatus
): number {
  return nodes.filter((n) => n.status === status && n.type === 'topic').length;
}

export function getCompletedHours(nodes: TopicNode[]): number {
  return nodes
    .filter((n) => n.status === 'completed')
    .reduce((sum, n) => sum + n.estimatedHours, 0);
}

export function getTotalEstimatedHours(nodes: TopicNode[]): number {
  return nodes.reduce((sum, n) => sum + n.estimatedHours, 0);
}

export function getConfidenceDistribution(nodes: TopicNode[]): Record<number, number> {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  nodes.forEach((n) => {
    const level = Math.min(5, Math.max(1, n.confidence));
    dist[level] = (dist[level] || 0) + 1;
  });
  return dist;
}

export function getCategoryBreakdown(
  nodes: TopicNode[],
  categories: { id: string; name: string }[]
): { name: string; progress: number; count: number }[] {
  return categories.map((cat) => ({
    name: cat.name,
    progress: calculateCategoryProgress(nodes, cat.id),
    count: nodes.filter((n) => n.category === cat.id && n.type === 'topic').length,
  }));
}

export function renderStars(count: number, max = 5): string {
  return '★'.repeat(count) + '☆'.repeat(max - count);
}

export function renderDifficulty(count: number, max = 5): string {
  return '⭐'.repeat(count) + '☆'.repeat(max - count);
}
