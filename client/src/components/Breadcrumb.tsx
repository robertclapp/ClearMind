import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb component for navigation hierarchy.
 * Provides clear visual path for nested pages and improves navigation UX.
 *
 * Features:
 * - Automatic home link
 * - Support for custom icons
 * - Accessible (aria-current for current page)
 * - Truncation for long labels
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm', className)}
    >
      <ol className="flex items-center gap-1">
        {/* Home link */}
        <li>
          <Link
            href="/home"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium truncate max-w-[200px]"
                  title={item.label}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
                  title={item.label}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Hook to generate breadcrumb items from the current route.
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const [location] = useLocation();
  const segments = location.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Convert route segments to readable labels
    let label = segment;
    let href = currentPath;

    // Handle special cases
    switch (segment) {
      case 'home':
        continue; // Skip home in breadcrumbs (we have the home icon)
      case 'pages':
        label = 'Pages';
        break;
      case 'databases':
        label = 'Databases';
        break;
      case 'timeline':
        label = 'Timeline';
        break;
      case 'mood':
        label = 'Mood Tracker';
        break;
      case 'automations':
        label = 'Automations';
        break;
      case 'settings':
        label = 'Settings';
        break;
      default:
        // If it's a number, it's likely an ID - skip adding href
        // The parent component should handle setting the label
        if (/^\d+$/.test(segment)) {
          label = `#${segment}`;
        }
    }

    items.push({ label, href });
  }

  return items;
}

/**
 * PageBreadcrumb - A convenience wrapper for page-level breadcrumbs.
 * Uses the current route to auto-generate breadcrumb items.
 */
export function PageBreadcrumb({
  pageTitle,
  className,
}: {
  pageTitle?: string;
  className?: string;
}) {
  const items = useBreadcrumbs();

  // If a page title is provided, update the last item's label
  if (pageTitle && items.length > 0) {
    items[items.length - 1].label = pageTitle;
  }

  if (items.length === 0) return null;

  return <Breadcrumb items={items} className={className} />;
}
