/**
 * Keyboard shortcuts registry for ClearMind.
 * Provides a centralized list of all keyboard shortcuts with descriptions.
 */

export interface KeyboardShortcut {
  id: string;
  category: 'general' | 'navigation' | 'editor' | 'database' | 'timeline';
  keys: string[]; // e.g., ['Cmd', 'K'] or ['Ctrl', 'K']
  description: string;
  action: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // General
  {
    id: 'command-palette',
    category: 'general',
    keys: ['⌘', 'K'],
    description: 'Open command palette / keyboard shortcuts',
    action: 'Open keyboard shortcuts panel',
  },
  {
    id: 'search',
    category: 'general',
    keys: ['⌘', 'P'],
    description: 'Quick search across all content',
    action: 'Open global search',
  },
  {
    id: 'new-page',
    category: 'general',
    keys: ['⌘', 'N'],
    description: 'Create new page',
    action: 'Open template selector',
  },
  {
    id: 'settings',
    category: 'general',
    keys: ['⌘', ','],
    description: 'Open settings',
    action: 'Navigate to settings',
  },

  // Navigation
  {
    id: 'go-home',
    category: 'navigation',
    keys: ['G', 'H'],
    description: 'Go to home',
    action: 'Navigate to home page',
  },
  {
    id: 'go-pages',
    category: 'navigation',
    keys: ['G', 'P'],
    description: 'Go to pages',
    action: 'Navigate to pages list',
  },
  {
    id: 'go-databases',
    category: 'navigation',
    keys: ['G', 'D'],
    description: 'Go to databases',
    action: 'Navigate to databases list',
  },
  {
    id: 'go-timeline',
    category: 'navigation',
    keys: ['G', 'T'],
    description: 'Go to timeline',
    action: 'Navigate to timeline',
  },
  {
    id: 'go-mood',
    category: 'navigation',
    keys: ['G', 'M'],
    description: 'Go to mood tracker',
    action: 'Navigate to mood tracker',
  },
  {
    id: 'sidebar-toggle',
    category: 'navigation',
    keys: ['⌘', 'B'],
    description: 'Toggle sidebar',
    action: 'Show/hide sidebar',
  },

  // Editor
  {
    id: 'bold',
    category: 'editor',
    keys: ['⌘', 'B'],
    description: 'Bold text',
    action: 'Toggle bold formatting',
  },
  {
    id: 'italic',
    category: 'editor',
    keys: ['⌘', 'I'],
    description: 'Italic text',
    action: 'Toggle italic formatting',
  },
  {
    id: 'underline',
    category: 'editor',
    keys: ['⌘', 'U'],
    description: 'Underline text',
    action: 'Toggle underline formatting',
  },
  {
    id: 'code',
    category: 'editor',
    keys: ['⌘', 'E'],
    description: 'Code formatting',
    action: 'Toggle code formatting',
  },
  {
    id: 'link',
    category: 'editor',
    keys: ['⌘', 'K'],
    description: 'Insert link',
    action: 'Insert or edit link',
  },
  {
    id: 'slash-menu',
    category: 'editor',
    keys: ['/'],
    description: 'Open block menu',
    action: 'Show block type menu',
  },
  {
    id: 'undo',
    category: 'editor',
    keys: ['⌘', 'Z'],
    description: 'Undo',
    action: 'Undo last action',
  },
  {
    id: 'redo',
    category: 'editor',
    keys: ['⌘', 'Shift', 'Z'],
    description: 'Redo',
    action: 'Redo last undone action',
  },
  {
    id: 'save',
    category: 'editor',
    keys: ['⌘', 'S'],
    description: 'Save (auto-save enabled)',
    action: 'Manually trigger save',
  },

  // Database
  {
    id: 'new-row',
    category: 'database',
    keys: ['⌘', 'Enter'],
    description: 'Add new row',
    action: 'Create new database item',
  },
  {
    id: 'filter',
    category: 'database',
    keys: ['⌘', 'F'],
    description: 'Filter database',
    action: 'Open filter builder',
  },
  {
    id: 'sort',
    category: 'database',
    keys: ['⌘', 'Shift', 'S'],
    description: 'Sort database',
    action: 'Open sort builder',
  },
  {
    id: 'switch-view',
    category: 'database',
    keys: ['⌘', 'Shift', 'V'],
    description: 'Switch view',
    action: 'Cycle through database views',
  },

  // Timeline
  {
    id: 'new-event',
    category: 'timeline',
    keys: ['⌘', 'Shift', 'E'],
    description: 'Create new event',
    action: 'Open event creation dialog',
  },
  {
    id: 'today',
    category: 'timeline',
    keys: ['T'],
    description: 'Go to today',
    action: 'Jump to today\'s timeline',
  },
  {
    id: 'prev-day',
    category: 'timeline',
    keys: ['['],
    description: 'Previous day',
    action: 'Navigate to previous day',
  },
  {
    id: 'next-day',
    category: 'timeline',
    keys: [']'],
    description: 'Next day',
    action: 'Navigate to next day',
  },
];

/**
 * Format keyboard shortcut keys for display.
 * Converts platform-specific modifiers (Cmd/Ctrl) based on user's OS.
 */
export function formatShortcutKeys(keys: string[]): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  return keys
    .map((key) => {
      if (key === '⌘') {
        return isMac ? '⌘' : 'Ctrl';
      }
      return key;
    })
    .join(' + ');
}

/**
 * Get shortcut key combination for a specific action.
 */
export function getShortcut(actionId: string): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find((shortcut) => shortcut.id === actionId);
}
