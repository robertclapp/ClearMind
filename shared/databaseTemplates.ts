/**
 * Database Templates
 * 
 * Pre-configured database templates to help users get started quickly.
 * Each template includes a schema definition with properties and sample data.
 */

export interface DatabaseProperty {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiSelect' | 'date' | 'checkbox' | 'url' | 'email' | 'phone';
  options?: string[]; // For select/multiSelect types
}

export interface DatabaseTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'personal' | 'business' | 'creative';
  properties: DatabaseProperty[];
  sampleData?: Record<string, any>[];
}

export const DATABASE_TEMPLATES: DatabaseTemplate[] = [
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    description: 'Track projects with status, priority, and deadlines',
    icon: '📊',
    category: 'productivity',
    properties: [
      { name: 'Project Name', type: 'text' },
      { name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'On Hold', 'Completed'] },
      { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
      { name: 'Start Date', type: 'date' },
      { name: 'Due Date', type: 'date' },
      { name: 'Owner', type: 'text' },
      { name: 'Budget', type: 'number' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Project Name': 'Website Redesign',
        'Status': 'In Progress',
        'Priority': 'High',
        'Start Date': new Date('2025-01-01').toISOString(),
        'Due Date': new Date('2025-03-31').toISOString(),
        'Owner': 'Design Team',
        'Budget': 50000,
        'Notes': 'Focus on mobile-first approach',
      },
    ],
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Build and maintain daily habits with streak tracking',
    icon: '✅',
    category: 'personal',
    properties: [
      { name: 'Habit', type: 'text' },
      { name: 'Category', type: 'select', options: ['Health', 'Productivity', 'Learning', 'Social', 'Creative'] },
      { name: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'] },
      { name: 'Current Streak', type: 'number' },
      { name: 'Best Streak', type: 'number' },
      { name: 'Start Date', type: 'date' },
      { name: 'Active', type: 'checkbox' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Habit': 'Morning Exercise',
        'Category': 'Health',
        'Frequency': 'Daily',
        'Current Streak': 7,
        'Best Streak': 30,
        'Start Date': new Date('2025-01-01').toISOString(),
        'Active': true,
        'Notes': '30 minutes of cardio',
      },
    ],
  },
  {
    id: 'reading-list',
    name: 'Reading List',
    description: 'Track books you want to read and have read',
    icon: '📚',
    category: 'personal',
    properties: [
      { name: 'Title', type: 'text' },
      { name: 'Author', type: 'text' },
      { name: 'Status', type: 'select', options: ['Want to Read', 'Reading', 'Completed', 'Abandoned'] },
      { name: 'Genre', type: 'multiSelect', options: ['Fiction', 'Non-Fiction', 'Biography', 'Science', 'History', 'Self-Help', 'Business'] },
      { name: 'Rating', type: 'select', options: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'] },
      { name: 'Pages', type: 'number' },
      { name: 'Started', type: 'date' },
      { name: 'Finished', type: 'date' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Title': 'Atomic Habits',
        'Author': 'James Clear',
        'Status': 'Completed',
        'Genre': ['Self-Help', 'Non-Fiction'],
        'Rating': '⭐⭐⭐⭐⭐',
        'Pages': 320,
        'Started': new Date('2024-12-01').toISOString(),
        'Finished': new Date('2024-12-15').toISOString(),
        'Notes': 'Excellent framework for building habits',
      },
    ],
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Monitor spending and manage your budget',
    icon: '💰',
    category: 'personal',
    properties: [
      { name: 'Description', type: 'text' },
      { name: 'Amount', type: 'number' },
      { name: 'Category', type: 'select', options: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other'] },
      { name: 'Date', type: 'date' },
      { name: 'Payment Method', type: 'select', options: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'] },
      { name: 'Recurring', type: 'checkbox' },
      { name: 'Vendor', type: 'text' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Description': 'Grocery Shopping',
        'Amount': 150.50,
        'Category': 'Food',
        'Date': new Date().toISOString(),
        'Payment Method': 'Credit Card',
        'Recurring': false,
        'Vendor': 'Whole Foods',
        'Notes': 'Weekly groceries',
      },
    ],
  },
  {
    id: 'contact-manager',
    name: 'Contact Manager',
    description: 'Organize contacts with tags and notes',
    icon: '👥',
    category: 'business',
    properties: [
      { name: 'Name', type: 'text' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phone' },
      { name: 'Company', type: 'text' },
      { name: 'Role', type: 'text' },
      { name: 'Tags', type: 'multiSelect', options: ['Client', 'Vendor', 'Partner', 'Friend', 'Family', 'Colleague'] },
      { name: 'Last Contact', type: 'date' },
      { name: 'LinkedIn', type: 'url' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '+1-555-0123',
        'Company': 'Acme Corp',
        'Role': 'Product Manager',
        'Tags': ['Client', 'Partner'],
        'Last Contact': new Date().toISOString(),
        'LinkedIn': 'https://linkedin.com/in/johndoe',
        'Notes': 'Met at conference',
      },
    ],
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Plan and schedule content across platforms',
    icon: '📅',
    category: 'creative',
    properties: [
      { name: 'Title', type: 'text' },
      { name: 'Platform', type: 'multiSelect', options: ['Blog', 'Twitter', 'LinkedIn', 'Instagram', 'YouTube', 'TikTok', 'Facebook'] },
      { name: 'Status', type: 'select', options: ['Idea', 'Drafting', 'Review', 'Scheduled', 'Published'] },
      { name: 'Content Type', type: 'select', options: ['Article', 'Video', 'Image', 'Infographic', 'Podcast', 'Story'] },
      { name: 'Publish Date', type: 'date' },
      { name: 'Author', type: 'text' },
      { name: 'Tags', type: 'multiSelect', options: ['Tutorial', 'News', 'Opinion', 'Review', 'Case Study', 'How-To'] },
      { name: 'URL', type: 'url' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Title': '10 Productivity Tips for Remote Workers',
        'Platform': ['Blog', 'LinkedIn'],
        'Status': 'Drafting',
        'Content Type': 'Article',
        'Publish Date': new Date('2025-02-01').toISOString(),
        'Author': 'Content Team',
        'Tags': ['How-To', 'Tutorial'],
        'URL': '',
        'Notes': 'Include infographics',
      },
    ],
  },
  {
    id: 'job-applications',
    name: 'Job Applications',
    description: 'Track job applications and interview progress',
    icon: '💼',
    category: 'business',
    properties: [
      { name: 'Company', type: 'text' },
      { name: 'Position', type: 'text' },
      { name: 'Status', type: 'select', options: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'] },
      { name: 'Applied Date', type: 'date' },
      { name: 'Salary Range', type: 'text' },
      { name: 'Location', type: 'text' },
      { name: 'Remote', type: 'checkbox' },
      { name: 'Job URL', type: 'url' },
      { name: 'Contact', type: 'text' },
      { name: 'Notes', type: 'text' },
    ],
    sampleData: [
      {
        'Company': 'Tech Startup Inc',
        'Position': 'Senior Developer',
        'Status': 'Interview',
        'Applied Date': new Date('2025-01-15').toISOString(),
        'Salary Range': '$120k - $150k',
        'Location': 'San Francisco, CA',
        'Remote': true,
        'Job URL': 'https://example.com/jobs/123',
        'Contact': 'Jane Smith - HR',
        'Notes': 'Second round interview scheduled',
      },
    ],
  },
];

export function getDatabaseTemplateById(id: string): DatabaseTemplate | undefined {
  return DATABASE_TEMPLATES.find(template => template.id === id);
}

export function getDatabaseTemplatesByCategory(category: DatabaseTemplate['category']): DatabaseTemplate[] {
  return DATABASE_TEMPLATES.filter(template => template.category === category);
}
