
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectsSidebarProps {
  projects: any[];
  activeProject: any | null;
  onSelectProject: (project: any) => void;
  onDeleteProject?: (project: any) => void;
}

const ProjectsSidebar = ({ 
  projects, 
  activeProject, 
  onSelectProject,
  onDeleteProject
}: ProjectsSidebarProps) => {
  // Helper function to calculate project progress
  const calculateProjectStatus = (project) => {
    const criteriaItems = [
      "documentationDone", 
      "materialsOrdered", 
      "materialsReceived", 
      "designApproved", 
      "qualityChecked", 
      "clientApproved"
    ];
    
    return criteriaItems.map(item => project[item] === true ? 1 : 0);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-4">Projects</h3>
        <div className="space-y-2">
          {projects.map((project) => {
            const statusList = calculateProjectStatus(project);
            const completedCount = statusList.filter(Boolean).length;
            
            return (
              <div
                key={project.id}
                className={cn(
                  "p-2 rounded-md cursor-pointer hover:bg-accent transition-colors relative group",
                  activeProject?.id === project.id ? "bg-accent" : ""
                )}
              >
                <div className="flex items-center gap-2" onClick={() => onSelectProject(project)}>
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{project.name}</span>
                  
                  {onDeleteProject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent-foreground/10"
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  )}
                </div>
                
                {/* Status indicators row - now below the project name */}
                <div className="flex items-center gap-1 mt-2 justify-center">
                  {statusList.map((status, index) => (
                    <span 
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        status ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsSidebar;
