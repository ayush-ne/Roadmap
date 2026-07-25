import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Pencil,
  FolderGit2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { STATUS_CONFIG } from '@/types';
import type { TopicNode } from '@/types';
import { getNodeProgress } from '@/utils/progress';
import { useStore } from '@/store/useStore';

export type CustomNodeData = {
  node: TopicNode;
  editMode: boolean;
  compact: boolean;
};

function CustomNode({ data, selected }: NodeProps) {
  const { node, editMode, compact } = data as CustomNodeData;
  const statusConfig = STATUS_CONFIG[node.status];
  const progress = getNodeProgress(node);
  const addChildNode = useStore((s) => s.addChildNode);
  const deleteNode = useStore((s) => s.deleteNode);
  const selectNode = useStore((s) => s.selectNode);
  const toggleCollapse = useStore((s) => s.toggleCollapse);

  const handleClick = useCallback(() => {
    selectNode(node.id);
  }, [node.id, selectNode]);

  const hasChildren = node.children.length > 0;

  const borderColor = node.isProject ? '#a855f7' : statusConfig.color;
  const bgColor = node.isProject
    ? 'rgba(168, 85, 247, 0.12)'
    : statusConfig.bgColor;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-accent !w-2 !h-2 !border-0" />
      <motion.div
        onClick={handleClick}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`relative cursor-pointer rounded-xl border-2 transition-shadow ${
          selected ? 'shadow-lg shadow-accent/20' : 'shadow-md'
        } ${node.isProject ? 'min-w-[180px]' : 'min-w-[140px]'}`}
        style={{
          borderColor,
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div
          className="absolute inset-0 rounded-xl opacity-50"
          style={{ backgroundColor: bgColor }}
        />

        <div className={`relative ${compact ? 'p-2' : 'p-3'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {node.isProject && (
                <FolderGit2 className="h-3.5 w-3.5 shrink-0 text-purple-400" />
              )}
              <span className="text-[10px]">{statusConfig.emoji}</span>
              <span
                className={`truncate font-semibold text-[var(--color-text)] ${
                  compact ? 'text-xs' : 'text-sm'
                } ${node.isProject ? 'text-purple-300' : ''}`}
              >
                {node.title}
              </span>
            </div>
          </div>

          {!compact && (
            <>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: borderColor,
                    }}
                  />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {progress}%
                </span>
              </div>

              {node.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {node.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-elevated px-1.5 py-0.5 text-[9px] text-[var(--color-text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {editMode && (
          <div
            className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-lg border border-surface-border bg-surface p-0.5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="rounded p-1 hover:bg-surface-elevated"
              title="Edit"
              onClick={() => selectNode(node.id)}
            >
              <Pencil className="h-3 w-3 text-[var(--color-text-muted)]" />
            </button>
            <button
              className="rounded p-1 hover:bg-surface-elevated"
              title="Add Child"
              onClick={() => addChildNode(node.id)}
            >
              <Plus className="h-3 w-3 text-green-500" />
            </button>
            <button
              className="rounded p-1 hover:bg-red-500/10"
              title="Delete"
              onClick={() => {
                if (confirm(`Delete "${node.title}" and all children?`)) {
                  deleteNode(node.id);
                }
              }}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
          </div>
        )}
      </motion.div>
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse(node.id);
          }}
          title={node.collapsed ? `Expand (${node.children.length} hidden)` : 'Collapse'}
          className="absolute -right-3 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-surface-border bg-surface shadow-md hover:bg-surface-elevated"
        >
          {node.collapsed ? (
            <ChevronRight className="h-3 w-3 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="h-3 w-3 text-[var(--color-text-muted)]" />
          )}
        </button>
      )}
      <Handle type="source" position={Position.Right} className="!bg-accent !w-2 !h-2 !border-0" />
    </>
  );
}

export default memo(CustomNode);
