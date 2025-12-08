import { getDb } from "./db";
import { pages, databases, databaseItems, timelineEvents, comments, blocks } from "../drizzle/schema";
import { or, and, like, eq, desc } from "drizzle-orm";

export interface SearchResult {
  id: number;
  type: 'page' | 'database' | 'database-item' | 'timeline-event' | 'comment' | 'block';
  title: string;
  content?: string;
  icon?: string;
  url: string;
  updatedAt: Date;
  relevance: number;
}

/**
 * Global search across all content types.
 * Returns results ranked by relevance.
 */
export async function globalSearch(query: string, workspaceId: number, userId: number, limit: number = 50): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query.toLowerCase()}%`;
  const results: SearchResult[] = [];

  // Search pages
  const pageResults = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.workspaceId, workspaceId),
        eq(pages.archived, false),
        or(
          like(pages.title, searchTerm),
        )
      )
    )
    .limit(limit);

  results.push(...pageResults.map(page => ({
    id: page.id,
    type: 'page' as const,
    title: page.title,
    icon: page.icon || '📄',
    url: `/pages/${page.id}`,
    updatedAt: page.updatedAt,
    relevance: calculateRelevance(query, page.title, ''),
  })));

  // Search blocks (page content)
  const blockResults = await db
    .select({
      block: blocks,
      page: pages,
    })
    .from(blocks)
    .innerJoin(pages, eq(blocks.pageId, pages.id))
    .where(
      and(
        eq(pages.workspaceId, workspaceId),
        eq(pages.archived, false),
        like(blocks.content, searchTerm)
      )
    )
    .limit(limit);

  results.push(...blockResults.map(({ block, page }) => {
    const content = extractTextFromContent(block.content);
    return {
      id: block.id,
      type: 'block' as const,
      title: page.title,
      content: truncateContent(content, query),
      icon: page.icon || '📄',
      url: `/pages/${page.id}`,
      updatedAt: block.updatedAt,
      relevance: calculateRelevance(query, page.title, content),
    };
  }));

  // Search databases
  const databaseResults = await db
    .select()
    .from(databases)
    .where(
      and(
        eq(databases.workspaceId, workspaceId),
        or(
          like(databases.name, searchTerm),
          like(databases.description, searchTerm)
        )
      )
    )
    .limit(limit);

  results.push(...databaseResults.map(database => ({
    id: database.id,
    type: 'database' as const,
    title: database.name,
    content: database.description || undefined,
    icon: database.icon || '🗂️',
    url: `/databases/${database.id}`,
    updatedAt: database.updatedAt,
    relevance: calculateRelevance(query, database.name, database.description || ''),
  })));

  // Search database items
  const itemResults = await db
    .select({
      item: databaseItems,
      database: databases,
    })
    .from(databaseItems)
    .innerJoin(databases, eq(databaseItems.databaseId, databases.id))
    .where(
      and(
        eq(databases.workspaceId, workspaceId),
        eq(databaseItems.archived, false),
        like(databaseItems.properties, searchTerm)
      )
    )
    .limit(limit);

  results.push(...itemResults.map(({ item, database }) => {
    const properties = JSON.parse(item.properties);
    const title = properties.title || properties.name || 'Untitled';
    return {
      id: item.id,
      type: 'database-item' as const,
      title: `${database.name}: ${title}`,
      content: JSON.stringify(properties),
      icon: database.icon || '🗂️',
      url: `/databases/${database.id}`,
      updatedAt: item.updatedAt,
      relevance: calculateRelevance(query, title, JSON.stringify(properties)),
    };
  }));

  // Search timeline events
  const timelineResults = await db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.userId, userId),
        like(timelineEvents.title, searchTerm)
      )
    )
    .limit(limit);

  results.push(...timelineResults.map(event => ({
    id: event.id,
    type: 'timeline-event' as const,
    title: event.title,
    icon: event.icon || '📅',
    url: `/timeline?date=${event.startTime.toISOString().split('T')[0]}`,
    updatedAt: event.updatedAt,
    relevance: calculateRelevance(query, event.title, ''),
  })));

  // Search comments (only on pages, not blocks or database items)
  const commentResults = await db
    .select({
      comment: comments,
      page: pages,
    })
    .from(comments)
    .innerJoin(pages, and(
      eq(comments.parentType, 'page'),
      eq(comments.parentId, pages.id)
    ))
    .where(
      and(
        eq(pages.workspaceId, workspaceId),
        eq(comments.archived, false),
        like(comments.content, searchTerm)
      )
    )
    .limit(limit);

  results.push(...commentResults.map(({ comment, page }) => ({
    id: comment.id,
    type: 'comment' as const,
    title: `Comment on ${page.title}`,
    content: truncateContent(comment.content, query),
    icon: '💬',
    url: `/pages/${page.id}`,
    updatedAt: comment.updatedAt,
    relevance: calculateRelevance(query, page.title, comment.content),
  })));

  // Sort by relevance (descending) and then by updatedAt (descending)
  results.sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return results.slice(0, limit);
}

/**
 * Calculate relevance score for search results.
 * Higher score = more relevant.
 */
function calculateRelevance(query: string, title: string, content: string): number {
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  let score = 0;

  // Exact title match: highest score
  if (titleLower === queryLower) {
    score += 100;
  }
  // Title starts with query: high score
  else if (titleLower.startsWith(queryLower)) {
    score += 50;
  }
  // Title contains query: medium score
  else if (titleLower.includes(queryLower)) {
    score += 25;
  }

  // Content contains query: lower score
  if (contentLower.includes(queryLower)) {
    score += 10;
  }

  // Boost score based on query word count in content
  const queryWords = queryLower.split(/\s+/);
  const matchingWords = queryWords.filter(word => 
    titleLower.includes(word) || contentLower.includes(word)
  );
  score += matchingWords.length * 5;

  return score;
}

/**
 * Extract plain text from JSON content (for blocks).
 */
function extractTextFromContent(jsonContent: string): string {
  try {
    const content = JSON.parse(jsonContent);
    if (content.text) {
      return content.text;
    }
    if (typeof content === 'string') {
      return content;
    }
    return JSON.stringify(content);
  } catch {
    return jsonContent;
  }
}

/**
 * Truncate content around the search query for preview.
 */
function truncateContent(content: string, query: string, maxLength: number = 150): string {
  const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
  
  if (queryIndex === -1) {
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, queryIndex - 50);
  const end = Math.min(content.length, queryIndex + query.length + 100);
  
  let truncated = content.substring(start, end);
  if (start > 0) truncated = '...' + truncated;
  if (end < content.length) truncated = truncated + '...';
  
  return truncated;
}
