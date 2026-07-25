import type { TopicNode, Category, GraphEdge } from '@/types';

export function exportToJSON(
  nodes: TopicNode[],
  categories: Category[],
  edges: GraphEdge[],
  customEdges: GraphEdge[] = []
): string {
  return JSON.stringify(
    { nodes, categories, edges, customEdges, exportedAt: new Date().toISOString() },
    null,
    2
  );
}

export function exportToMarkdown(nodes: TopicNode[], categories: Category[]): string {
  let md = '# AI Learning Knowledge Graph\n\n';
  md += `> Exported on ${new Date().toLocaleDateString()}\n\n`;

  categories.forEach((cat) => {
    const catNodes = nodes.filter((n) => n.category === cat.id);
    if (catNodes.length === 0) return;

    md += `## ${cat.name}\n\n`;
    catNodes.forEach((node) => {
      const statusEmoji =
        node.status === 'completed'
          ? '✅'
          : node.status === 'learning'
            ? '🔄'
            : node.status === 'revision'
              ? '📘'
              : '⬜';
      md += `### ${statusEmoji} ${node.title}\n\n`;
      if (node.description) md += `${node.description}\n\n`;
      if (node.keyLearnings.length > 0) {
        md += '**Key Learnings:**\n';
        node.keyLearnings.forEach((k) => (md += `- ${k}\n`));
        md += '\n';
      }
      if (node.resources.length > 0) {
        md += '**Resources:**\n';
        node.resources.forEach((r) => (md += `- [${r.title}](${r.url})\n`));
        md += '\n';
      }
    });
  });

  return md;
}

export async function exportToPNG(element: HTMLElement): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg') || '#0f172a',
    scale: 2,
  });
  const link = document.createElement('a');
  link.download = `knowledge-graph-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportToPDF(element: HTMLElement): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`knowledge-graph-${Date.now()}.pdf`);
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(json: string): {
  nodes: TopicNode[];
  categories: Category[];
  edges: GraphEdge[];
  customEdges: GraphEdge[];
} | null {
  try {
    const data = JSON.parse(json);
    if (!data.nodes || !Array.isArray(data.nodes)) return null;
    return {
      nodes: data.nodes,
      categories: data.categories || [],
      edges: data.edges || [],
      customEdges: data.customEdges || [],
    };
  } catch {
    return null;
  }
}

export function generateShareableLink(data: object): string {
  const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
  return `${window.location.origin}${import.meta.env.BASE_URL}?data=${encoded.slice(0, 500)}`;
}
