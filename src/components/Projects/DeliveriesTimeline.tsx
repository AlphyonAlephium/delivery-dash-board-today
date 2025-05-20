
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Truck, Package, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DeliveriesTimelineProps {
  deliveries: any[];
  projects: any[];
  onAddDelivery: () => void;
  onEditDelivery: (delivery: any) => void;
}

const DeliveriesTimeline = ({ 
  deliveries, 
  projects, 
  onAddDelivery,
  onEditDelivery 
}: DeliveriesTimelineProps) => {
  // Get the next 14 days (2 weeks)
  const getNext14Days = (): Date[] => {
    const days: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    
    return days;
  };
  
  const next14Days = getNext14Days();
  
  // Group deliveries by date
  const getDeliveriesByDate = (date: Date) => {
    return deliveries.filter(delivery => 
      new Date(delivery.date).toDateString() === date.toDateString()
    );
  };

  // Format date as "Mon, 25 May"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return new Date().toDateString() === date.toDateString();
  };

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
          Upcoming Logistics
        </CardTitle>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0" 
          onClick={onAddDelivery}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-2 pb-4 pt-0">
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {next14Days.map((day) => {
            const dayDeliveries = getDeliveriesByDate(day);
            
            if (dayDeliveries.length === 0) return null;
            
            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className={cn(
                  "text-xs font-medium",
                  isToday(day) 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}>
                  {isToday(day) ? "Today" : formatDate(day)}
                </div>
                
                {dayDeliveries.map((delivery, idx) => {
                  const project = projects.find(p => p.id === delivery.projectNumber);
                  const colorIndex = projects.indexOf(project) % 6;
                  
                  // Color map for different project types - Monday.com style
                  const getProjectColor = (index: number) => {
                    const colors = [
                      "from-purple-500 to-indigo-500",
                      "from-pink-500 to-rose-500",
                      "from-blue-500 to-cyan-500",
                      "from-emerald-500 to-teal-500",
                      "from-amber-500 to-orange-500",
                      "from-violet-500 to-purple-500"
                    ];
                    return colors[index % colors.length];
                  };
                  
                  return (
                    <div 
                      key={`${delivery.projectNumber}-${idx}`}
                      className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onEditDelivery(delivery)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-full flex items-center justify-center",
                          "bg-gradient-to-r",
                          getProjectColor(colorIndex)
                        )}>
                          {delivery.type === "delivery" ? (
                            <ArrowDown className="h-4 w-4 text-white" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <Badge variant="outline" className="mb-1 text-xs font-normal">
                              {delivery.projectNumber}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{delivery.time}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {delivery.projectName}
                            </span>
                            
                            <Badge className={cn(
                              "text-[10px] px-1.5 py-0",
                              delivery.type === "delivery" 
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
                            )}>
                              {delivery.type}
                            </Badge>
                          </div>
                          
                          {delivery.location && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {delivery.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          
          {/* If no deliveries in the next 14 days */}
          {next14Days.every(day => getDeliveriesByDate(day).length === 0) && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No deliveries scheduled for the next 2 weeks</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={onAddDelivery}
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule a delivery
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveriesTimeline;
