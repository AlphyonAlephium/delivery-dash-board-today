
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectsSidebarProps {
  projects: any[];
  activeProject: any | null;
  onSelectProject: (project: any) => void;
  onDeleteProject?: (project: any) => void;
  onToggleMaterialOrdering?: (project: any) => void;
  isLoading?: boolean;
}

const ProjectsSidebar = ({ 
  projects, 
  activeProject, 
  onSelectProject,
  onDeleteProject,
  onToggleMaterialOrdering,
  isLoading = false
}: ProjectsSidebarProps) => {
  // Helper function to calculate project progress
  const calculateProjectStatus = (project) => {
    const criteriaItems = [
      "documentation_done", 
      "materials_ordered", 
      "materials_received", 
      "design_approved", 
      "quality_checked", 
      "client_approved"
    ];
    
    return criteriaItems.map(item => project[item] === true ? 1 : 0);
  };

  // Color map for different project types - Monday.com style
  const getProjectColor = (index) => {
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
    <Card className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Projects</h3>
        <div className="space-y-2">
          {projects.map((project, index) => {
            const statusList = calculateProjectStatus(project);
            const completedCount = statusList.filter(Boolean).length;
            const progressPercent = (completedCount / statusList.length) * 100;
            const isMaterialOrderingActive = project.material_ordering_activated;
            
            return (
              <div
                key={project.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md relative group",
                  activeProject?.id === project.id 
                    ? "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-inner" 
                    : "hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                )}
              >
                <div className="flex items-center gap-2" onClick={() => onSelectProject(project)}>
                  <div 
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300",
                      isMaterialOrderingActive 
                        ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" 
                        : `bg-gradient-to-r ${getProjectColor(index)}`
                    )}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{project.name}</span>
                    {project.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  
                  {onDeleteProject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent-foreground/10"
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive hover:text-red-600 transition-colors" />
                    </button>
                  )}
                </div>
                
                {/* Progress bar - Monday.com style */}
                <div className="mt-2">
                  <Progress 
                    className="h-1 bg-gray-200 dark:bg-gray-700" 
                    value={progressPercent} 
                    style={{
                      background: "linear-gradient(to right, rgba(240, 240, 240, 1), rgba(230, 230, 230, 1))",
                    }}
                    indicatorClassName={`bg-gradient-to-r ${getProjectColor(index)}`}
                  />
                </div>
                
                {/* Status indicators */}
                <div className="flex items-center gap-1 mt-2 justify-center">
                  {statusList.map((status, idx) => (
                    <span 
                      key={idx}
                      className={cn(
                        "w-2 h-2 rounded-full transition-transform hover:scale-110",
                        status 
                          ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                          : "bg-gradient-to-r from-red-400 to-rose-500"
                      )}
                    />
                  ))}
                </div>

                {/* Material ordering button */}
                {onToggleMaterialOrdering && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant={isMaterialOrderingActive ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => onToggleMaterialOrdering(project)}
                      className={cn(
                        "w-full text-xs py-1 h-6 transition-all duration-300",
                        isMaterialOrderingActive && "animate-pulse"
                      )}
                    >
                      {isMaterialOrderingActive ? "Material ordering: ON" : "Material ordering activated"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsSidebar;
