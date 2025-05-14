
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Project = {
  id: string;
  name: string;
  status: "active" | "completed" | "on-hold";
  progress?: number;
  documentationDone: boolean;
  materialsOrdered: boolean;
  materialsReceived: boolean;
};

type ActiveProjectsListProps = {
  projects: Project[];
};

const StatusIndicator = ({ 
  isComplete, 
  label
}: { 
  isComplete: boolean; 
  label: string;
}) => {
  const Icon = isComplete ? Check : X;
  
  return (
    <div 
      className={`flex items-center gap-1 rounded px-2 py-1 ${
        isComplete ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
      title={label}
    >
      <Icon size={14} />
      <span className="text-xs hidden sm:inline">{label}</span>
    </div>
  );
};

const ActiveProjectsList = ({ projects }: ActiveProjectsListProps) => {
  const activeProjects = projects.filter(p => p.status === "active");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Clone projects for infinite scroll effect
  const duplicatedProjects = [...activeProjects, ...activeProjects];
  
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const scroll = () => {
      if (!scrollRef.current) return;
      
      // If we've scrolled to the bottom, reset to the top
      if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 2) {
        scrollRef.current.scrollTop = 0;
      } else {
        // Slow scroll from bottom to top (negative value)
        scrollRef.current.scrollTop += 1;
      }
    };
    
    const intervalId = setInterval(scroll, 50);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Active Projects</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden max-h-[600px] p-0">
        <div 
          ref={scrollRef}
          className="h-[600px] overflow-hidden" 
          style={{ 
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex flex-col-reverse space-y-reverse space-y-3 p-6">
            {duplicatedProjects.map((project, index) => (
              <div
                key={`${project.id}-${index}`}
                className="p-3 bg-accent/50 rounded-md border border-border/50 transition-all hover:bg-accent"
              >
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline">{project.id}</Badge>
                  {project.progress !== undefined && (
                    <span className="text-xs font-medium">
                      {project.progress}%
                    </span>
                  )}
                </div>
                
                <h3 className="font-medium mb-2">{project.name}</h3>
                
                <div className="flex flex-wrap gap-1">
                  <StatusIndicator 
                    isComplete={project.documentationDone} 
                    label="Documentation"
                  />
                  <StatusIndicator 
                    isComplete={project.materialsOrdered} 
                    label="Materials Ordered"
                  />
                  <StatusIndicator 
                    isComplete={project.materialsReceived} 
                    label="Materials Received"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveProjectsList;
