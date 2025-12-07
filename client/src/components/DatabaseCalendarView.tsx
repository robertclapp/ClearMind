import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

/**
 * DatabaseCalendarView Component
 * 
 * Calendar view for database items with date properties.
 * Displays items on their corresponding dates in a monthly calendar layout.
 * 
 * Features:
 * - Monthly calendar grid
 * - Item display on dates
 * - Month navigation
 * - Click to view item details
 * - Visual date indicators
 */

interface DatabaseCalendarViewProps {
  databaseId: number;
  schema: any;
}

export function DatabaseCalendarView({ databaseId, schema }: DatabaseCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: items = [] } = trpc.databaseItems.getByDatabase.useQuery({
    databaseId,
  });

  // Find the date property
  const dateProperty = schema?.properties?.find(
    (p: any) => p.type === "date"
  );

  if (!dateProperty) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Calendar view requires a Date property. Add one to use this view.</p>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get items for each date
  const getItemsForDate = (date: Date) => {
    return items.filter((item) => {
      try {
        const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
        const itemDate = props[dateProperty.name];
        if (!itemDate) return false;
        return isSameDay(new Date(itemDate), date);
      } catch {
        return false;
      }
    });
  };

  const getItemTitle = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      return props.Title || props.Name || "Untitled";
    } catch {
      return "Untitled";
    }
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  // Calculate starting day of week (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  const daysFromPrevMonth = startDayOfWeek;

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: daysFromPrevMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-24 p-2 border-r border-b bg-muted/20"
            />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((date) => {
            const dayItems = getItemsForDate(date);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                className={`min-h-24 p-2 border-r border-b last:border-r-0 ${
                  !isSameMonth(date, currentDate) ? "bg-muted/20" : ""
                } ${isToday ? "bg-primary/5" : ""}`}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayItems.map((item) => (
                      <Card
                        key={item.id}
                        className="p-1 cursor-pointer hover:bg-accent transition-colors text-xs"
                        onClick={() => toast.info(`Item: ${getItemTitle(item)}`)}
                      >
                        <p className="truncate">{getItemTitle(item)}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/5 border rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-card border rounded" />
          <span>{items.length} total items</span>
        </div>
      </div>
    </div>
  );
}
