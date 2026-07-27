import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  TopicNode,
  Category,
  GraphEdge,
  FilterState,
  AppSettings,
  DashboardStats,
  Resource,
  GitHubRepo,
  LiveDemo,
  LayoutMode,
} from '@/types';
import initialData from '@/data/initial-data.json';
import { buildEdgesFromNodes, applyLayout, filterNodes } from '@/utils/layout';
import {
  calculateOverallProgress,
  countByStatus,
  getCompletedHours,
  getTotalEstimatedHours,
} from '@/utils/progress';

interface AppState {
  nodes: TopicNode[];
  categories: Category[];
  edges: GraphEdge[];
  customEdges: GraphEdge[];
  filters: FilterState;
  settings: AppSettings;
  selectedNodeId: string | null;
  sidebarOpen: boolean;

  // Node actions
  selectNode: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  updateNode: (id: string, updates: Partial<TopicNode>) => void;
  addNode: (
    parentId: string | null,
    category: string,
    overrides?: Partial<TopicNode>
  ) => string;
  deleteNode: (id: string) => void;
  addChildNode: (parentId: string, overrides?: Partial<TopicNode>) => string;
  addLink: (sourceId: string, targetId: string) => void;
  removeLink: (sourceId: string, targetId: string) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  renameNode: (id: string, title: string) => void;
  toggleCollapse: (id: string) => void;
  addCustomEdge: (sourceId: string, targetId: string, label?: string) => void;
  removeCustomEdge: (edgeId: string) => void;
  updateCustomEdgeLabel: (edgeId: string, label: string) => void;

  // Node detail actions
  addNote: (nodeId: string, content: string) => void;
  updateNote: (nodeId: string, noteId: string, content: string) => void;
  deleteNote: (nodeId: string, noteId: string) => void;
  addInterviewNote: (nodeId: string, content: string) => void;
  deleteInterviewNote: (nodeId: string, noteId: string) => void;
  addRevisionNote: (nodeId: string, content: string) => void;
  deleteRevisionNote: (nodeId: string, noteId: string) => void;
  addPractice: (nodeId: string, text: string) => void;
  togglePractice: (nodeId: string, practiceId: string) => void;
  deletePractice: (nodeId: string, practiceId: string) => void;
  addResource: (nodeId: string, resource: Omit<Resource, 'id'>) => void;
  deleteResource: (nodeId: string, resourceId: string) => void;
  addGithub: (nodeId: string, repo: Omit<GitHubRepo, 'id'>) => void;
  deleteGithub: (nodeId: string, repoId: string) => void;
  addLiveDemo: (nodeId: string, demo: Omit<LiveDemo, 'id'>) => void;
  deleteLiveDemo: (nodeId: string, demoId: string) => void;

  // Category actions
  addCategory: (name: string) => string;
  deleteCategory: (id: string) => void;
  setActiveCategory: (id: string) => void;

  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleEditMode: () => void;
  setLayoutMode: (mode: LayoutMode) => void;

  // Import/Export
  importData: (
    nodes: TopicNode[],
    categories: Category[],
    edges?: GraphEdge[],
    customEdges?: GraphEdge[]
  ) => void;
  resetToDefault: () => void;
  applyAutoLayout: () => void;

  // Computed getters
  getFilteredNodes: () => TopicNode[];
  getDashboardStats: () => DashboardStats;
  getNodeById: (id: string) => TopicNode | undefined;
  getAllTags: () => string[];
  getRelatedNodes: (nodeId: string) => TopicNode[];
}

const defaultFilters: FilterState = {
  statuses: [],
  tags: [],
  categories: [],
  difficulty: [],
  confidence: [],
  showProjects: true,
  searchQuery: '',
};

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#6366f1',
  layoutMode: 'tree',
  viewMode: 'expanded',
  editMode: false,
  activeCategory: 'python',
};

// Normalizes nodes from older data shapes (e.g. a boolean `isProject` instead
// of `type`, or missing `interviewNotes`/`revisionNotes`) into the current
// TopicNode schema. Safe to run on already-current data — it's a no-op then.
function migrateNode(raw: TopicNode & { isProject?: boolean }): TopicNode {
  const { isProject, ...rest } = raw;
  return {
    ...rest,
    type: rest.type ?? (isProject ? 'project' : 'topic'),
    interviewNotes: rest.interviewNotes ?? [],
    revisionNotes: rest.revisionNotes ?? [],
  };
}

function migrateNodes(nodes: TopicNode[]): TopicNode[] {
  return nodes.map(migrateNode);
}

function initFromData() {
  const nodes = migrateNodes(initialData.nodes as unknown as TopicNode[]);
  const categories = initialData.categories as Category[];
  const edges = buildEdgesFromNodes(nodes);
  const customEdges = ((initialData as { customEdges?: GraphEdge[] }).customEdges ?? []) as GraphEdge[];
  return { nodes, categories, edges, customEdges };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initFromData(),
      filters: defaultFilters,
      settings: defaultSettings,
      selectedNodeId: null,
      sidebarOpen: false,

      selectNode: (id) =>
        set({ selectedNodeId: id, sidebarOpen: id !== null }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      updateNode: (id, updates) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      addNode: (parentId, category, overrides) => {
        const id = uuidv4();
        const parent = parentId ? get().nodes.find((n) => n.id === parentId) : null;
        const newNode: TopicNode = {
          id,
          title: 'New Topic',
          category,
          type: 'topic',
          status: 'not_started',
          description: '',
          difficulty: 2,
          confidence: 1,
          estimatedHours: 1,
          keyLearnings: [],
          notes: [],
          practice: [],
          resources: [],
          github: [],
          liveDemo: [],
          interviewNotes: [],
          revisionNotes: [],
          related: [],
          children: [],
          parentId,
          tags: [],
          updatedAt: new Date().toISOString(),
          position: parent
            ? { x: parent.position.x + 220, y: parent.position.y }
            : { x: 0, y: 0 },
          ...overrides,
        };

        set((state) => {
          const nodes = [...state.nodes, newNode];
          if (parentId) {
            const idx = nodes.findIndex((n) => n.id === parentId);
            if (idx >= 0) {
              nodes[idx] = {
                ...nodes[idx],
                children: [...nodes[idx].children, id],
              };
            }
          }
          const edges = buildEdgesFromNodes(nodes);
          return { nodes, edges };
        });

        return id;
      },

      deleteNode: (id) =>
        set((state) => {
          const toDelete = new Set<string>();
          function collect(id: string) {
            toDelete.add(id);
            const node = state.nodes.find((n) => n.id === id);
            node?.children.forEach(collect);
          }
          collect(id);

          const nodes = state.nodes
            .filter((n) => !toDelete.has(n.id))
            .map((n) => ({
              ...n,
              children: n.children.filter((c) => !toDelete.has(c)),
              related: n.related.filter((r) => !toDelete.has(r)),
              parentId:
                n.parentId && toDelete.has(n.parentId) ? null : n.parentId,
            }));

          return {
            nodes,
            edges: buildEdgesFromNodes(nodes),
            customEdges: state.customEdges.filter(
              (e) => !toDelete.has(e.source) && !toDelete.has(e.target)
            ),
            selectedNodeId:
              state.selectedNodeId && toDelete.has(state.selectedNodeId)
                ? null
                : state.selectedNodeId,
            sidebarOpen:
              state.selectedNodeId && toDelete.has(state.selectedNodeId)
                ? false
                : state.sidebarOpen,
          };
        }),

      addChildNode: (parentId, overrides) => {
        const parent = get().nodes.find((n) => n.id === parentId);
        return get().addNode(
          parentId,
          parent?.category ?? get().settings.activeCategory,
          overrides
        );
      },

      addLink: (sourceId, targetId) =>
        set((state) => {
          const nodes = state.nodes.map((n) => {
            if (n.id === sourceId && !n.related.includes(targetId)) {
              return { ...n, related: [...n.related, targetId] };
            }
            if (n.id === targetId && !n.related.includes(sourceId)) {
              return { ...n, related: [...n.related, sourceId] };
            }
            return n;
          });
          return { nodes, edges: buildEdgesFromNodes(nodes) };
        }),

      removeLink: (sourceId, targetId) =>
        set((state) => {
          const nodes = state.nodes.map((n) => ({
            ...n,
            related: n.related.filter(
              (r) =>
                !(n.id === sourceId && r === targetId) &&
                !(n.id === targetId && r === sourceId)
            ),
          }));
          return { nodes, edges: buildEdgesFromNodes(nodes) };
        }),

      moveNode: (id, position) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, position, updatedAt: new Date().toISOString() } : n
          ),
        })),

      renameNode: (id, title) => get().updateNode(id, { title }),

      toggleCollapse: (id) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, collapsed: !n.collapsed } : n
          ),
        })),

      addCustomEdge: (sourceId, targetId, label) =>
        set((state) => {
          if (sourceId === targetId) return state;
          const exists = state.customEdges.some(
            (e) => e.source === sourceId && e.target === targetId
          );
          if (exists) return state;
          const newEdge: GraphEdge = {
            id: `custom-${uuidv4()}`,
            source: sourceId,
            target: targetId,
            type: 'custom',
            label,
          };
          return { customEdges: [...state.customEdges, newEdge] };
        }),

      removeCustomEdge: (edgeId) =>
        set((state) => ({
          customEdges: state.customEdges.filter((e) => e.id !== edgeId),
        })),

      updateCustomEdgeLabel: (edgeId, label) =>
        set((state) => ({
          customEdges: state.customEdges.map((e) =>
            e.id === edgeId ? { ...e, label } : e
          ),
        })),

      addNote: (nodeId, content) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  notes: [
                    ...n.notes,
                    { id: uuidv4(), content, createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      updateNote: (nodeId, noteId, content) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  notes: n.notes.map((note) =>
                    note.id === noteId ? { ...note, content } : note
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deleteNote: (nodeId, noteId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  notes: n.notes.filter((note) => note.id !== noteId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addInterviewNote: (nodeId, content) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  interviewNotes: [
                    ...n.interviewNotes,
                    { id: uuidv4(), content, createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deleteInterviewNote: (nodeId, noteId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  interviewNotes: n.interviewNotes.filter((note) => note.id !== noteId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addRevisionNote: (nodeId, content) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  revisionNotes: [
                    ...n.revisionNotes,
                    { id: uuidv4(), content, createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deleteRevisionNote: (nodeId, noteId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  revisionNotes: n.revisionNotes.filter((note) => note.id !== noteId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addPractice: (nodeId, text) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  practice: [
                    ...n.practice,
                    { id: uuidv4(), text, completed: false },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      togglePractice: (nodeId, practiceId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  practice: n.practice.map((p) =>
                    p.id === practiceId ? { ...p, completed: !p.completed } : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deletePractice: (nodeId, practiceId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  practice: n.practice.filter((p) => p.id !== practiceId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addResource: (nodeId, resource) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  resources: [...n.resources, { ...resource, id: uuidv4() }],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deleteResource: (nodeId, resourceId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  resources: n.resources.filter((r) => r.id !== resourceId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addGithub: (nodeId, repo) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  github: [...n.github, { ...repo, id: uuidv4() }],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deleteGithub: (nodeId, repoId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  github: n.github.filter((g) => g.id !== repoId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addLiveDemo: (nodeId, demo) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  liveDemo: [...n.liveDemo, { ...demo, id: uuidv4() }],
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      deleteLiveDemo: (nodeId, demoId) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  liveDemo: n.liveDemo.filter((d) => d.id !== demoId),
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      addCategory: (name) => {
        const id = uuidv4();
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id,
              name,
              description: '',
              color: '#6366f1',
              icon: 'folder',
            },
          ],
        }));
        return id;
      },

      deleteCategory: (id) =>
        set((state) => {
          const toDelete = new Set(
            state.nodes.filter((n) => n.category === id).map((n) => n.id)
          );
          const nodes = state.nodes
            .filter((n) => n.category !== id)
            .map((n) => ({
              ...n,
              children: n.children.filter((c) => !toDelete.has(c)),
              related: n.related.filter((r) => !toDelete.has(r)),
              parentId:
                n.parentId && toDelete.has(n.parentId) ? null : n.parentId,
            }));
          return {
            categories: state.categories.filter((c) => c.id !== id),
            nodes,
            edges: buildEdgesFromNodes(nodes),
            customEdges: state.customEdges.filter(
              (e) => !toDelete.has(e.source) && !toDelete.has(e.target)
            ),
          };
        }),

      setActiveCategory: (id) =>
        set((state) => ({
          settings: { ...state.settings, activeCategory: id },
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      toggleEditMode: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            editMode: !state.settings.editMode,
          },
        })),

      setLayoutMode: (mode) =>
        set((state) => ({
          settings: { ...state.settings, layoutMode: mode },
        })),

      importData: (nodes, categories, edges, customEdges) => {
        const migrated = migrateNodes(nodes);
        set({
          nodes: migrated,
          categories: categories.length > 0 ? categories : get().categories,
          edges: edges ?? buildEdgesFromNodes(migrated),
          customEdges: customEdges ?? [],
        });
      },

      resetToDefault: () => {
        const data = initFromData();
        set({ ...data, selectedNodeId: null, sidebarOpen: false });
      },

      applyAutoLayout: () =>
        set((state) => ({
          nodes: applyLayout(
            state.nodes,
            state.settings.layoutMode,
            state.settings.activeCategory
          ),
        })),

      getFilteredNodes: () => {
        const state = get();
        const categoryNodes = state.nodes.filter(
          (n) =>
            n.category === state.settings.activeCategory ||
            (n.type === 'project' && state.settings.activeCategory === 'projects')
        );
        return filterNodes(categoryNodes, state.filters);
      },

      getDashboardStats: (): DashboardStats => {
        const { nodes } = get();
        const topics = nodes.filter((n) => n.type === 'topic');
        const projects = nodes.filter((n) => n.type === 'project');
        const learning = topics.filter((n) => n.status === 'learning');
        const sorted = [...nodes].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return {
          overallProgress: calculateOverallProgress(nodes),
          totalTopics: topics.length,
          completedTopics: countByStatus(nodes, 'completed'),
          learningTopics: countByStatus(nodes, 'learning'),
          revisionTopics: countByStatus(nodes, 'revision'),
          pendingTopics: countByStatus(nodes, 'not_started'),
          projectCount: projects.length,
          completedProjects: projects.filter((n) => n.status === 'completed')
            .length,
          totalHours: getTotalEstimatedHours(topics),
          completedHours: getCompletedHours(topics),
          streak: 7,
          recentlyUpdated: sorted.slice(0, 5),
          currentTopic: learning[0] ?? null,
        };
      },

      getNodeById: (id) => get().nodes.find((n) => n.id === id),

      getAllTags: () => {
        const tags = new Set<string>();
        get().nodes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
        return Array.from(tags).sort();
      },

      getRelatedNodes: (nodeId) => {
        const state = get();
        const node = state.nodes.find((n) => n.id === nodeId);
        if (!node) return [];
        const customIds = state.customEdges
          .filter((e) => e.source === nodeId || e.target === nodeId)
          .map((e) => (e.source === nodeId ? e.target : e.source));
        const relatedIds = new Set([
          ...node.related,
          ...(node.parentId ? [node.parentId] : []),
          ...node.children,
          ...customIds,
        ]);
        return state.nodes.filter((n) => relatedIds.has(n.id));
      },
    }),
    {
      name: 'knowledge-graph-storage',
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as { nodes?: TopicNode[] } & Record<string, unknown>;
        if (version < 1 && Array.isArray(state?.nodes)) {
          state.nodes = migrateNodes(state.nodes);
        }
        return state;
      },
      partialize: (state) => ({
        nodes: state.nodes,
        categories: state.categories,
        edges: state.edges,
        customEdges: state.customEdges,
        settings: state.settings,
      }),
    }
  )
);
