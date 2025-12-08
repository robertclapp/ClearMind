/**
 * Page templates provide pre-built starting points for common use cases.
 * Each template includes a title, icon, description, and initial content structure.
 */

export interface PageTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  category: 'productivity' | 'planning' | 'personal' | 'creative';
  content: TemplateBlock[];
}

export interface TemplateBlock {
  type: 'heading' | 'paragraph' | 'bulletList' | 'taskList' | 'codeBlock' | 'divider';
  content?: string;
  level?: number; // For headings (1-3)
  items?: string[]; // For lists
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    icon: '📝',
    description: 'Structured template for capturing meeting discussions, decisions, and action items',
    category: 'productivity',
    content: [
      { type: 'heading', level: 1, content: 'Meeting Notes' },
      { type: 'heading', level: 2, content: '📅 Meeting Details' },
      { type: 'bulletList', items: ['Date: ', 'Attendees: ', 'Duration: '] },
      { type: 'heading', level: 2, content: '🎯 Agenda' },
      { type: 'bulletList', items: ['Topic 1', 'Topic 2', 'Topic 3'] },
      { type: 'heading', level: 2, content: '💬 Discussion Notes' },
      { type: 'paragraph', content: 'Key points discussed...' },
      { type: 'heading', level: 2, content: '✅ Decisions Made' },
      { type: 'bulletList', items: ['Decision 1', 'Decision 2'] },
      { type: 'heading', level: 2, content: '🚀 Action Items' },
      { type: 'taskList', items: ['Action item 1 - @assignee', 'Action item 2 - @assignee'] },
    ],
  },
  {
    id: 'project-plan',
    title: 'Project Plan',
    icon: '📊',
    description: 'Comprehensive project planning template with goals, timeline, and resources',
    category: 'planning',
    content: [
      { type: 'heading', level: 1, content: 'Project Plan' },
      { type: 'heading', level: 2, content: '🎯 Project Overview' },
      { type: 'paragraph', content: 'Brief description of the project...' },
      { type: 'heading', level: 2, content: '🎪 Goals & Objectives' },
      { type: 'bulletList', items: ['Goal 1: ', 'Goal 2: ', 'Goal 3: '] },
      { type: 'heading', level: 2, content: '📅 Timeline' },
      { type: 'bulletList', items: ['Phase 1: ', 'Phase 2: ', 'Phase 3: '] },
      { type: 'heading', level: 2, content: '👥 Team & Resources' },
      { type: 'bulletList', items: ['Team member 1 - Role', 'Team member 2 - Role'] },
      { type: 'heading', level: 2, content: '⚠️ Risks & Mitigation' },
      { type: 'bulletList', items: ['Risk 1 → Mitigation strategy', 'Risk 2 → Mitigation strategy'] },
      { type: 'heading', level: 2, content: '📈 Success Metrics' },
      { type: 'bulletList', items: ['Metric 1: ', 'Metric 2: '] },
    ],
  },
  {
    id: 'daily-journal',
    title: 'Daily Journal',
    icon: '📔',
    description: 'Daily reflection template for gratitude, goals, and personal growth',
    category: 'personal',
    content: [
      { type: 'heading', level: 1, content: 'Daily Journal - [Date]' },
      { type: 'heading', level: 2, content: '🌅 Morning Reflection' },
      { type: 'paragraph', content: 'How am I feeling today?' },
      { type: 'heading', level: 2, content: '🎯 Today\'s Priorities' },
      { type: 'taskList', items: ['Priority 1', 'Priority 2', 'Priority 3'] },
      { type: 'heading', level: 2, content: '🙏 Gratitude' },
      { type: 'bulletList', items: ['I\'m grateful for...', 'I\'m grateful for...', 'I\'m grateful for...'] },
      { type: 'heading', level: 2, content: '💭 Thoughts & Ideas' },
      { type: 'paragraph', content: 'Free writing space...' },
      { type: 'heading', level: 2, content: '🌙 Evening Reflection' },
      { type: 'paragraph', content: 'What went well today?' },
      { type: 'paragraph', content: 'What could I improve tomorrow?' },
    ],
  },
  {
    id: 'task-list',
    title: 'Task List',
    icon: '✅',
    description: 'Simple task list with categories and priorities',
    category: 'productivity',
    content: [
      { type: 'heading', level: 1, content: 'Tasks' },
      { type: 'heading', level: 2, content: '🔥 High Priority' },
      { type: 'taskList', items: ['Urgent task 1', 'Urgent task 2'] },
      { type: 'heading', level: 2, content: '📌 Medium Priority' },
      { type: 'taskList', items: ['Important task 1', 'Important task 2'] },
      { type: 'heading', level: 2, content: '💡 Low Priority' },
      { type: 'taskList', items: ['Nice to have 1', 'Nice to have 2'] },
      { type: 'heading', level: 2, content: '✅ Completed' },
      { type: 'taskList', items: [] },
    ],
  },
  {
    id: 'brainstorming',
    title: 'Brainstorming Session',
    icon: '💡',
    description: 'Creative brainstorming template for generating and organizing ideas',
    category: 'creative',
    content: [
      { type: 'heading', level: 1, content: 'Brainstorming: [Topic]' },
      { type: 'heading', level: 2, content: '🎯 Challenge/Question' },
      { type: 'paragraph', content: 'What problem are we solving?' },
      { type: 'heading', level: 2, content: '💡 Ideas' },
      { type: 'bulletList', items: ['Idea 1', 'Idea 2', 'Idea 3', 'Idea 4', 'Idea 5'] },
      { type: 'heading', level: 2, content: '⭐ Top Ideas' },
      { type: 'bulletList', items: ['Best idea 1 - Why it works', 'Best idea 2 - Why it works'] },
      { type: 'heading', level: 2, content: '🚀 Next Steps' },
      { type: 'taskList', items: ['Research idea 1', 'Prototype idea 2', 'Get feedback'] },
    ],
  },
  {
    id: 'weekly-review',
    title: 'Weekly Review',
    icon: '📆',
    description: 'Weekly reflection and planning template',
    category: 'planning',
    content: [
      { type: 'heading', level: 1, content: 'Weekly Review - Week of [Date]' },
      { type: 'heading', level: 2, content: '🎯 Last Week\'s Goals' },
      { type: 'taskList', items: ['Goal 1', 'Goal 2', 'Goal 3'] },
      { type: 'heading', level: 2, content: '🏆 Wins & Achievements' },
      { type: 'bulletList', items: ['Win 1', 'Win 2', 'Win 3'] },
      { type: 'heading', level: 2, content: '📚 Lessons Learned' },
      { type: 'bulletList', items: ['Lesson 1', 'Lesson 2'] },
      { type: 'heading', level: 2, content: '🔮 Next Week\'s Focus' },
      { type: 'bulletList', items: ['Focus area 1', 'Focus area 2', 'Focus area 3'] },
      { type: 'heading', level: 2, content: '⚡ Action Items' },
      { type: 'taskList', items: ['Action 1', 'Action 2', 'Action 3'] },
    ],
  },
];
