
import React from "react";
import { cn } from "@/lib/utils";
import { Package, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LogisticsEventProps = {
  type: "pickup" | "delivery";
  date: Date;
  projectNumber: string;
  projectName: string;
  location?: string;
  time?: string;
};

const LogisticsEvent = ({ 
  type, 
  date, 
  projectNumber, 
  projectName, 
  location, 
  time 
}: LogisticsEventProps) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md mb-3",
      isToday ? "border-l-4 border-l-primary" : ""
    )}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-full text-white",
          type === "pickup" ? "bg-pickup" : "bg-delivery"
        )}>
          {type === "pickup" ? <Truck size={20} /> : <Package size={20} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <div>
              <Badge variant="outline" className="mb-1">
                {projectNumber}
              </Badge>
              <h3 className="font-medium text-sm truncate">{projectName}</h3>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-sm font-medium",
                isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {isToday ? "Today" : formattedDate}
              </div>
              {time && <div className="text-xs text-muted-foreground">{time}</div>}
            </div>
          </div>
          
          {location && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {location}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogisticsEvent;
