
import React from "react";
import LogisticsEvent from "./LogisticsEvent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample data - in real app, this would come from an API or state
const getWorkingDays = (days: number): Date[] => {
  const result: Date[] = [];
  const today = new Date();
  let count = 0;
  let currentDate = new Date(today);
  
  while (result.length < days) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      result.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
    count++;
    if (count > 14) break; // Safety to avoid infinite loop
  }
  
  return result;
};

type LogisticsTimelineProps = {
  events: {
    type: "pickup" | "delivery";
    date: Date;
    projectNumber: string;
    projectName: string;
    location?: string;
    time?: string;
  }[];
};

const LogisticsTimeline = ({ events }: LogisticsTimelineProps) => {
  // Get the next 6 working days (today + 5 more)
  const workingDays = getWorkingDays(6);
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Upcoming Logistics</span>
          <span className="text-sm font-normal text-muted-foreground">
            Next {workingDays.length} working days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workingDays.map((day, index) => {
          // Get events for this specific day
          const dayEvents = events.filter(event => 
            event.date.toDateString() === day.toDateString()
          );
          
          if (dayEvents.length === 0) return null;
          
          const dayName = index === 0 ? 'Today' : day.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          });
          
          return (
            <div key={day.toISOString()} className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {dayName}
              </h3>
              {dayEvents.map((event, eventIndex) => (
                <LogisticsEvent
                  key={`${event.projectNumber}-${eventIndex}`}
                  {...event}
                />
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LogisticsTimeline;
