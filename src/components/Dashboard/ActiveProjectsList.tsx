
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Box, Package, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Active Projects</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[600px]">
        <div className="flex flex-col-reverse space-y-reverse space-y-3">
          {activeProjects.map((project) => (
            <div
              key={project.id}
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
      </CardContent>
    </Card>
  );
};

export default ActiveProjectsList;
