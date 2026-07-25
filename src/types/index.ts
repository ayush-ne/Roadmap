export type NodeStatus =
  | 'completed'
  | 'learning'
  | 'revision'
  | 'not_started'
  | 'blocked';

export type ResourceType =
  | 'documentation'
  | 'youtube'
  | 'blog'
  | 'cheatsheet'
  | 'paper'
  | 'github'
  | 'book'
  | 'pdf';

export type LayoutMode = 'tree' | 'mindmap' | 'grid';

export type ViewMode = 'compact' | 'expanded';

export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  type: ResourceType;
}

export interface GitHubRepo {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface LiveDemo {
  id: string;
  title: string;
  url: string;
  platform: 'vercel' | 'netlify' | 'render' | 'github-pages' | 'other';
}

export interface PracticeItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface TopicNode {
  id: string;
  title: string;
  category: string;
  status: NodeStatus;
  description: string;
  difficulty: number;
  confidence: number;
  estimatedHours: number;
  keyLearnings: string[];
  notes: Note[];
  practice: PracticeItem[];
  resources: Resource[];
  github: GitHubRepo[];
  liveDemo: LiveDemo[];
  related: string[];
  children: string[];
  parentId: string | null;
  tags: string[];
  updatedAt: string;
  position: { x: number; y: number };
  isProject: boolean;
  collapsed?: boolean;
  architecture?: string;
  techStack?: string[];
  lessonsLearned?: string[];
  challenges?: string[];
  futureScope?: string;
  screenshots?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: 'hierarchy' | 'related' | 'custom';
  label?: string;
}

export interface FilterState {
  statuses: NodeStatus[];
  tags: string[];
  categories: string[];
  difficulty: number[];
  confidence: number[];
  showProjects: boolean;
  searchQuery: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  accentColor: string;
  layoutMode: LayoutMode;
  viewMode: ViewMode;
  editMode: boolean;
  activeCategory: string;
}

export interface DashboardStats {
  overallProgress: number;
  totalTopics: number;
  completedTopics: number;
  learningTopics: number;
  revisionTopics: number;
  pendingTopics: number;
  projectCount: number;
  completedProjects: number;
  totalHours: number;
  completedHours: number;
  streak: number;
  recentlyUpdated: TopicNode[];
  currentTopic: TopicNode | null;
}

export const STATUS_CONFIG: Record<
  NodeStatus,
  { label: string; color: string; bgColor: string; progress: number; emoji: string }
> = {
  completed: {
    label: 'Completed',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    progress: 100,
    emoji: '🟢',
  },
  learning: {
    label: 'Learning',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    progress: 50,
    emoji: '🟡',
  },
  revision: {
    label: 'Revision',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    progress: 80,
    emoji: '🔵',
  },
  not_started: {
    label: 'Not Started',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    progress: 0,
    emoji: '⚪',
  },
  blocked: {
    label: 'Blocked',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    progress: 0,
    emoji: '🔴',
  },
};

export const ACCENT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  documentation: 'Documentation',
  youtube: 'YouTube',
  blog: 'Blog',
  cheatsheet: 'Cheat Sheet',
  paper: 'Research Paper',
  github: 'GitHub Example',
  book: 'Book',
  pdf: 'PDF',
};
