import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Clock,
  ExternalLink,
  Github,
  Globe,
  Plus,
  Trash2,
  Check,
  ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/store/useStore';
import { useRelatedNodes } from '@/hooks/useRelatedNodes';
import { STATUS_CONFIG, RESOURCE_TYPE_LABELS, type NodeStatus, type ResourceType } from '@/types';
import { getNodeProgress, renderDifficulty } from '@/utils/progress';
import { isReadOnlyBuild } from '@/utils/env';

const ALL_STATUSES: NodeStatus[] = [
  'completed',
  'learning',
  'revision',
  'not_started',
  'blocked',
];

export default function NodePanel() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const node = useStore((s) =>
    s.selectedNodeId ? s.getNodeById(s.selectedNodeId) : undefined
  );
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const selectNode = useStore((s) => s.selectNode);
  const updateNode = useStore((s) => s.updateNode);
  const renameNode = useStore((s) => s.renameNode);
  const addNote = useStore((s) => s.addNote);
  const deleteNote = useStore((s) => s.deleteNote);
  const addPractice = useStore((s) => s.addPractice);
  const togglePractice = useStore((s) => s.togglePractice);
  const deletePractice = useStore((s) => s.deletePractice);
  const addResource = useStore((s) => s.addResource);
  const deleteResource = useStore((s) => s.deleteResource);
  const addGithub = useStore((s) => s.addGithub);
  const deleteGithub = useStore((s) => s.deleteGithub);
  const addLiveDemo = useStore((s) => s.addLiveDemo);
  const deleteLiveDemo = useStore((s) => s.deleteLiveDemo);
  const allNodes = useStore((s) => s.nodes);
  const customEdges = useStore((s) => s.customEdges);
  const addCustomEdge = useStore((s) => s.addCustomEdge);
  const removeCustomEdge = useStore((s) => s.removeCustomEdge);
  const editMode = useStore((s) => s.settings.editMode) && !isReadOnlyBuild;
  const canEdit = editMode;
  const [connectTarget, setConnectTarget] = useState('');
  const [newResourceType, setNewResourceType] = useState<ResourceType>('documentation');
  const [newDemoPlatform, setNewDemoPlatform] = useState<
    'vercel' | 'netlify' | 'render' | 'github-pages' | 'other'
  >('other');
  const relatedNodes = useRelatedNodes(node?.id);

  if (!sidebarOpen || !node) return null;

  const progress = getNodeProgress(node);
  const outgoingLinks = customEdges.filter((e) => e.source === node.id);
  const incomingLinks = customEdges.filter((e) => e.target === node.id);
  const connectableNodes = allNodes.filter(
    (n) =>
      n.id !== node.id &&
      !outgoingLinks.some((e) => e.target === n.id)
  );

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 z-20 flex h-full w-full max-w-md flex-col border-l border-surface-border bg-surface shadow-2xl sm:w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div className="min-w-0 flex-1">
            {canEdit ? (
              <input
                key={node.id}
                defaultValue={node.title}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== node.title) {
                    renameNode(node.id, value);
                  } else {
                    e.target.value = node.title;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                className="w-full truncate rounded-lg bg-transparent text-lg font-bold outline-none focus:bg-surface-elevated focus:px-1"
              />
            ) : (
              <h2 className="truncate text-lg font-bold">{node.title}</h2>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">
              {node.isProject ? '🟣 Project' : STATUS_CONFIG[node.status].label}
            </p>
          </div>
          <button
            onClick={() => {
              setSidebarOpen(false);
              selectNode(null);
            }}
            className="rounded-lg p-2 hover:bg-surface-elevated"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Status & Meta */}
          <section className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="card !p-3">
                <p className="section-title">Progress</p>
                <p className="mt-1 text-xl font-bold text-accent">{progress}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="card !p-3">
                <p className="section-title">Difficulty</p>
                <p className="mt-1 text-sm">{renderDifficulty(node.difficulty)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {node.estimatedHours}h
              </span>
            </div>

            <div>
              <p className="section-title mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => canEdit && updateNode(node.id, { status })}
                    disabled={!canEdit}
                    className={`badge transition-colors ${
                      node.status === status
                        ? 'ring-2 ring-accent'
                        : 'opacity-60 hover:opacity-100'
                    } ${!canEdit ? 'cursor-default' : ''}`}
                    style={{
                      backgroundColor: STATUS_CONFIG[status].bgColor,
                      color: STATUS_CONFIG[status].color,
                    }}
                  >
                    {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-title mb-2">Confidence</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => canEdit && updateNode(node.id, { confidence: level })}
                    disabled={!canEdit}
                    className={`transition-transform ${canEdit ? 'hover:scale-110' : 'cursor-default'}`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        level <= node.confidence
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-[var(--color-text-muted)]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Description */}
          {(node.description || canEdit) && (
            <section>
              <p className="section-title mb-2">Description</p>
              {canEdit ? (
                <textarea
                  key={node.id}
                  defaultValue={node.description}
                  placeholder="What is this topic about?"
                  rows={3}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value !== node.description) {
                      updateNode(node.id, { description: value });
                    }
                  }}
                  className="input-field w-full resize-none text-sm leading-relaxed"
                />
              ) : (
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {node.description}
                </p>
              )}
            </section>
          )}

          {/* Key Learnings */}
          {(node.keyLearnings.length > 0 || canEdit) && (
            <section>
              <p className="section-title mb-2">Key Learnings</p>
              <ul className="space-y-1">
                {node.keyLearnings.map((item, i) => (
                  <li key={i} className="group flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0 flex-1">{item}</span>
                    {canEdit && (
                      <button
                        onClick={() =>
                          updateNode(node.id, {
                            keyLearnings: node.keyLearnings.filter((_, idx) => idx !== i),
                          })
                        }
                        className="shrink-0 text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {canEdit && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('keyLearning') as HTMLInputElement;
                    const value = input.value.trim();
                    if (value) {
                      updateNode(node.id, { keyLearnings: [...node.keyLearnings, value] });
                      form.reset();
                    }
                  }}
                  className="mt-2 flex gap-2"
                >
                  <input
                    name="keyLearning"
                    placeholder="Add a key learning..."
                    className="input-field flex-1 text-sm"
                  />
                  <button type="submit" className="btn-primary !px-2">
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              )}
            </section>
          )}

          {/* Project-specific sections */}
          {node.isProject && (
            <>
              {node.architecture && (
                <section>
                  <p className="section-title mb-2">Architecture</p>
                  <p className="rounded-lg bg-surface-elevated p-3 font-mono text-xs">
                    {node.architecture}
                  </p>
                </section>
              )}
              {node.techStack && node.techStack.length > 0 && (
                <section>
                  <p className="section-title mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {node.techStack.map((tech) => (
                      <span key={tech} className="badge bg-accent-muted text-accent">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {node.lessonsLearned && node.lessonsLearned.length > 0 && (
                <section>
                  <p className="section-title mb-2">Lessons Learned</p>
                  <ul className="space-y-1 text-sm">
                    {node.lessonsLearned.map((l, i) => (
                      <li key={i}>• {l}</li>
                    ))}
                  </ul>
                </section>
              )}
              {node.challenges && node.challenges.length > 0 && (
                <section>
                  <p className="section-title mb-2">Challenges</p>
                  <ul className="space-y-1 text-sm">
                    {node.challenges.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          {/* Notes */}
          <section>
            <p className="section-title mb-2">Personal Notes</p>
            <div className="space-y-2">
              {node.notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative rounded-lg bg-surface-elevated p-3 text-sm"
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => deleteNote(node.id, note.id)}
                      className="absolute right-2 top-2 hidden rounded p-1 text-red-500 group-hover:block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {canEdit && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).elements.namedItem(
                      'note'
                    ) as HTMLInputElement;
                    if (input.value.trim()) {
                      addNote(node.id, input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  <input
                    name="note"
                    placeholder="Add a note (markdown supported)..."
                    className="input-field text-sm"
                  />
                </form>
              )}
            </div>
          </section>

          {/* Practice */}
          <section>
            <p className="section-title mb-2">Practice</p>
            <div className="space-y-1.5">
              {node.practice.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-elevated"
                >
                  <button
                    onClick={() => canEdit && togglePractice(node.id, item.id)}
                    disabled={!canEdit}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      item.completed
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-surface-border'
                    }`}
                  >
                    {item.completed && <Check className="h-3 w-3" />}
                  </button>
                  <span className={item.completed ? 'line-through opacity-50' : ''}>
                    {item.text}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => deletePractice(node.id, item.id)}
                      className="ml-auto text-red-500 opacity-0 hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </label>
              ))}
              {canEdit && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).elements.namedItem(
                      'practice'
                    ) as HTMLInputElement;
                    if (input.value.trim()) {
                      addPractice(node.id, input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="practice"
                    placeholder="Add practice item..."
                    className="input-field flex-1 text-sm"
                  />
                  <button type="submit" className="btn-primary !px-2">
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Resources */}
          <section>
            <p className="section-title mb-2">Resources</p>
            <div className="space-y-2">
              {node.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 rounded-lg bg-surface-elevated p-3 text-sm transition-colors hover:bg-surface-border/50"
                >
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {RESOURCE_TYPE_LABELS[resource.type]}
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        deleteResource(node.id, resource.id);
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </a>
              ))}
              {canEdit && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const title = (form.elements.namedItem('resTitle') as HTMLInputElement).value.trim();
                    const url = (form.elements.namedItem('resUrl') as HTMLInputElement).value.trim();
                    if (title && url) {
                      addResource(node.id, { title, url, description: '', type: newResourceType });
                      form.reset();
                      setNewResourceType('documentation');
                    }
                  }}
                  className="space-y-1.5 rounded-lg bg-surface-elevated p-2"
                >
                  <input name="resTitle" placeholder="Resource title" className="input-field text-xs" />
                  <input name="resUrl" placeholder="https://..." className="input-field text-xs" />
                  <div className="flex gap-1.5">
                    <select
                      value={newResourceType}
                      onChange={(e) => setNewResourceType(e.target.value as ResourceType)}
                      className="input-field flex-1 text-xs"
                    >
                      {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-primary !px-2">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* GitHub */}
          {(node.github.length > 0 || canEdit) && (
            <section>
              <p className="section-title mb-2">GitHub Repositories</p>
              <div className="space-y-2">
                {node.github.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-elevated p-3 text-sm hover:bg-surface-border/50"
                  >
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <Github className="h-4 w-4 shrink-0" />
                      <span className="truncate font-medium">{repo.title}</span>
                    </a>
                    {canEdit && (
                      <button
                        onClick={() => deleteGithub(node.id, repo.id)}
                        className="shrink-0 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const title = (form.elements.namedItem('repoTitle') as HTMLInputElement).value.trim();
                      const url = (form.elements.namedItem('repoUrl') as HTMLInputElement).value.trim();
                      if (title && url) {
                        addGithub(node.id, { title, url, description: '' });
                        form.reset();
                      }
                    }}
                    className="flex gap-1.5"
                  >
                    <input name="repoTitle" placeholder="Repo name" className="input-field flex-1 text-xs" />
                    <input name="repoUrl" placeholder="https://github.com/..." className="input-field flex-1 text-xs" />
                    <button type="submit" className="btn-primary !px-2">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* Live Demo */}
          {(node.liveDemo.length > 0 || canEdit) && (
            <section>
              <p className="section-title mb-2">Live Applications</p>
              <div className="space-y-2">
                {node.liveDemo.map((demo) => (
                  <div
                    key={demo.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-elevated p-3 text-sm hover:bg-surface-border/50"
                  >
                    <a
                      href={demo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <Globe className="h-4 w-4 shrink-0 text-green-500" />
                      <span className="truncate font-medium">{demo.title}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-[var(--color-text-muted)]">
                        {demo.platform}
                      </span>
                    </a>
                    {canEdit && (
                      <button
                        onClick={() => deleteLiveDemo(node.id, demo.id)}
                        className="shrink-0 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const title = (form.elements.namedItem('demoTitle') as HTMLInputElement).value.trim();
                      const url = (form.elements.namedItem('demoUrl') as HTMLInputElement).value.trim();
                      if (title && url) {
                        addLiveDemo(node.id, { title, url, platform: newDemoPlatform });
                        form.reset();
                        setNewDemoPlatform('other');
                      }
                    }}
                    className="space-y-1.5 rounded-lg bg-surface-elevated p-2"
                  >
                    <div className="flex gap-1.5">
                      <input name="demoTitle" placeholder="Demo title" className="input-field flex-1 text-xs" />
                      <input name="demoUrl" placeholder="https://..." className="input-field flex-1 text-xs" />
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={newDemoPlatform}
                        onChange={(e) =>
                          setNewDemoPlatform(
                            e.target.value as 'vercel' | 'netlify' | 'render' | 'github-pages' | 'other'
                          )
                        }
                        className="input-field flex-1 text-xs"
                      >
                        <option value="vercel">Vercel</option>
                        <option value="netlify">Netlify</option>
                        <option value="render">Render</option>
                        <option value="github-pages">GitHub Pages</option>
                        <option value="other">Other</option>
                      </select>
                      <button type="submit" className="btn-primary !px-2">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          )}

          {/* Connections (free-form directed links) */}
          {(outgoingLinks.length > 0 || incomingLinks.length > 0 || editMode) && (
            <section>
              <p className="section-title mb-2">Connections</p>
              <div className="space-y-1.5">
                {outgoingLinks.map((e) => {
                  const target = allNodes.find((n) => n.id === e.target);
                  if (!target) return null;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 text-xs"
                    >
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                      <button
                        onClick={() => selectNode(target.id)}
                        className="min-w-0 flex-1 truncate text-left font-medium hover:text-accent"
                      >
                        {target.title}
                      </button>
                      {editMode && (
                        <button
                          onClick={() => removeCustomEdge(e.id)}
                          title="Remove connection"
                          className="shrink-0 rounded p-1 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {incomingLinks.map((e) => {
                  const source = allNodes.find((n) => n.id === e.source);
                  if (!source) return null;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 text-xs text-[var(--color-text-muted)]"
                    >
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 rotate-180 text-blue-400" />
                      <button
                        onClick={() => selectNode(source.id)}
                        className="min-w-0 flex-1 truncate text-left hover:text-accent"
                      >
                        {source.title}
                      </button>
                      <span className="shrink-0 text-[10px]">links here</span>
                    </div>
                  );
                })}
                {editMode && connectableNodes.length > 0 && (
                  <div className="flex gap-1.5">
                    <select
                      value={connectTarget}
                      onChange={(e) => setConnectTarget(e.target.value)}
                      className="input-field flex-1 text-xs"
                    >
                      <option value="">Connect to topic…</option>
                      {connectableNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (connectTarget) {
                          addCustomEdge(node.id, connectTarget);
                          setConnectTarget('');
                        }
                      }}
                      disabled={!connectTarget}
                      className="btn-secondary px-2 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Related Topics */}
          {relatedNodes.length > 0 && (
            <section>
              <p className="section-title mb-2">Related Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {relatedNodes.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => selectNode(related.id)}
                    className="badge bg-surface-elevated transition-colors hover:bg-accent-muted hover:text-accent"
                  >
                    {STATUS_CONFIG[related.status].emoji} {related.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {node.tags.length > 0 && (
            <section>
              <p className="section-title mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {node.tags.map((tag) => (
                  <span key={tag} className="badge bg-accent-muted text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
