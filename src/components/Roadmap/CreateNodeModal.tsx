import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { NodeType, TopicNode } from '@/types';

interface CreateNodeModalProps {
  parentId: string | null;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export default function CreateNodeModal({ parentId, onClose, onCreated }: CreateNodeModalProps) {
  const categories = useStore((s) => s.categories);
  const activeCategory = useStore((s) => s.settings.activeCategory);
  const parent = useStore((s) => (parentId ? s.getNodeById(parentId) : undefined));
  const addNode = useStore((s) => s.addNode);
  const addChildNode = useStore((s) => s.addChildNode);

  const [type, setType] = useState<NodeType>('topic');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(parent?.category ?? activeCategory);
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [tagsInput, setTagsInput] = useState('');
  const [architecture, setArchitecture] = useState('');
  const [techStackInput, setTechStackInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const overrides: Partial<TopicNode> = {
      title: title.trim() || 'New Topic',
      type,
      description: description.trim(),
      difficulty,
      estimatedHours,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (type === 'project') {
      overrides.architecture = architecture.trim();
      overrides.techStack = techStackInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const id = parentId
      ? addChildNode(parentId, overrides)
      : addNode(null, category, overrides);

    onCreated(id);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-surface-border bg-surface p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {parentId ? `Add child under "${parent?.title}"` : 'Add topic'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-elevated">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="section-title mb-1 block">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NodeType)}
              className="input-field w-full text-sm"
            >
              <option value="topic">Topic</option>
              <option value="project">Project</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div>
            <label className="section-title mb-1 block">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Binary Search Trees"
              className="input-field w-full text-sm"
            />
          </div>

          {!parentId && (
            <div>
              <label className="section-title mb-1 block">Workflow</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-full text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="section-title mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this about?"
              className="input-field w-full resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title mb-1 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="input-field w-full text-sm"
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-title mb-1 block">Est. Hours</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="input-field w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="section-title mb-1 block">Tags (comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. algorithms, interview"
              className="input-field w-full text-sm"
            />
          </div>

          {type === 'project' && (
            <>
              <div>
                <label className="section-title mb-1 block">Architecture</label>
                <textarea
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  rows={2}
                  placeholder="High-level architecture / stack notes..."
                  className="input-field w-full resize-none font-mono text-xs"
                />
              </div>
              <div>
                <label className="section-title mb-1 block">Tech Stack (comma-separated)</label>
                <input
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. React, Node, Postgres"
                  className="input-field w-full text-sm"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
