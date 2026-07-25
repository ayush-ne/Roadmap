import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type OnNodesChange,
  type Connection,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, LayoutGrid, GitBranch, Share2, FolderPlus, X, Cable } from 'lucide-react';
import CustomNode from './CustomNode';
import FilterPanel from '@/components/Search/FilterPanel';
import { useStore } from '@/store/useStore';
import { useFilteredNodes } from '@/hooks/useFilteredNodes';
import { getVisibleNodes } from '@/utils/layout';
import { isReadOnlyBuild } from '@/utils/env';
import type { LayoutMode } from '@/types';

const nodeTypes = { custom: CustomNode };

const layoutOptions: { mode: LayoutMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: 'tree', label: 'Tree', icon: GitBranch },
  { mode: 'mindmap', label: 'Mind Map', icon: Share2 },
  { mode: 'grid', label: 'Grid', icon: LayoutGrid },
];

export default function KnowledgeGraph() {
  const graphRef = useRef<HTMLDivElement>(null);
  const filteredNodes = useFilteredNodes();
  const edges = useStore((s) => s.edges);
  const customEdges = useStore((s) => s.customEdges);
  const editMode = useStore((s) => s.settings.editMode) && !isReadOnlyBuild;
  const viewMode = useStore((s) => s.settings.viewMode);
  const layoutMode = useStore((s) => s.settings.layoutMode);
  const activeCategory = useStore((s) => s.settings.activeCategory);
  const categories = useStore((s) => s.categories);
  const moveNode = useStore((s) => s.moveNode);
  const addNode = useStore((s) => s.addNode);
  const addCategory = useStore((s) => s.addCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const setActiveCategory = useStore((s) => s.setActiveCategory);
  const setLayoutMode = useStore((s) => s.setLayoutMode);
  const applyAutoLayout = useStore((s) => s.applyAutoLayout);
  const selectNode = useStore((s) => s.selectNode);
  const addCustomEdge = useStore((s) => s.addCustomEdge);
  const removeCustomEdge = useStore((s) => s.removeCustomEdge);

  const [connectHint, setConnectHint] = useState(false);

  const visibleNodes = useMemo(() => getVisibleNodes(filteredNodes), [filteredNodes]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  const flowNodes: Node[] = useMemo(
    () =>
      visibleNodes.map((node) => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          node,
          editMode,
          compact: viewMode === 'compact',
        },
      })),
    [visibleNodes, editMode, viewMode]
  );

  const flowEdges: Edge[] = useMemo(() => {
    const treeEdges = edges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((edge) => {
        const isRelated = edge.type === 'related';
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: isRelated,
          style: {
            stroke: isRelated ? '#6366f1' : 'var(--color-text-muted)',
            strokeDasharray: isRelated ? '5 5' : undefined,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: isRelated ? '#6366f1' : '#94a3b8' },
        } satisfies Edge;
      });

    const custom = customEdges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map(
        (edge) =>
          ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            animated: true,
            style: { stroke: '#f97316', strokeWidth: 2 },
            labelStyle: { fill: '#f97316', fontSize: 10, fontWeight: 600 },
            labelBgStyle: { fill: 'var(--color-surface)' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
          }) satisfies Edge
      );

    return [...treeEdges, ...custom];
  }, [edges, customEdges, visibleIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [flowEdgesState, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          moveNode(change.id, change.position);
        }
      });
    },
    [onNodesChange, moveNode]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      addCustomEdge(connection.source, connection.target);
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [addCustomEdge, setEdges]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (!editMode) return;
      if (!edge.id.startsWith('custom-')) return;
      if (confirm('Remove this connection?')) {
        removeCustomEdge(edge.id);
      }
    },
    [editMode, removeCustomEdge]
  );

  const handleAddRoot = () => {
    const id = addNode(null, activeCategory);
    selectNode(id);
  };

  const handleAddWorkflow = () => {
    const name = prompt('Name your new workflow (e.g. "System Design", "DSA")');
    if (!name || !name.trim()) return;
    const id = addCategory(name.trim());
    setActiveCategory(id);
  };

  const handleDeleteWorkflow = (id: string, name: string) => {
    if (
      confirm(
        `Delete workflow "${name}"? All topics inside it will be deleted too. This cannot be undone.`
      )
    ) {
      deleteCategory(id);
      if (activeCategory === id && categories.length > 1) {
        const next = categories.find((c) => c.id !== id);
        if (next) setActiveCategory(next.id);
      }
    }
  };

  return (
    <div ref={graphRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={flowEdgesState}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={editMode}
        nodesConnectable={editMode}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--color-bg)]"
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const node = (n.data as { node: { isProject: boolean; status: string } })?.node;
            if (node?.isProject) return '#a855f7';
            return '#6366f1';
          }}
          maskColor="rgba(0,0,0,0.6)"
          className="!bottom-4 !right-4"
        />

        <Panel position="top-left" className="flex max-w-[65vw] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-surface-border bg-surface/95 p-1.5 shadow-lg backdrop-blur-sm">
            {categories.map((cat) => (
              <div key={cat.id} className="group relative">
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-surface-elevated'
                  }`}
                  style={
                    activeCategory === cat.id
                      ? { backgroundColor: cat.color }
                      : undefined
                  }
                >
                  {cat.name}
                </button>
                {editMode && categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkflow(cat.id, cat.name);
                    }}
                    title="Delete workflow"
                    className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                onClick={handleAddWorkflow}
                title="Add a new workflow"
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-surface-elevated"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <FilterPanel />
        </Panel>

        <Panel position="top-right" className="flex max-w-[70vw] flex-wrap items-start justify-end gap-1">
          <div className="flex rounded-xl border border-surface-border bg-surface/95 p-1 shadow-lg backdrop-blur-sm">
            {layoutOptions.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => {
                  setLayoutMode(mode);
                  setTimeout(() => applyAutoLayout(), 50);
                }}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  layoutMode === mode
                    ? 'bg-accent-muted text-accent'
                    : 'text-[var(--color-text-muted)] hover:bg-surface-elevated'
                }`}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          {editMode && (
            <div
              className="relative flex items-center rounded-xl border border-surface-border bg-surface/95 p-1.5 shadow-lg backdrop-blur-sm"
              onMouseEnter={() => setConnectHint(true)}
              onMouseLeave={() => setConnectHint(false)}
              title="Drag from a node's edge handle onto another node to connect them"
            >
              <Cable className="h-3.5 w-3.5 text-orange-500" />
              {connectHint && (
                <span className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-surface-border bg-surface p-2 text-[10px] text-[var(--color-text-muted)] shadow-lg">
                  Drag from a node's right-hand dot onto another node to draw a
                  directed connection between topics.
                </span>
              )}
            </div>
          )}

          {editMode && (
            <button
              onClick={handleAddRoot}
              className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface/95 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-colors hover:bg-surface-elevated"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Topic
            </button>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}

export { KnowledgeGraph };
