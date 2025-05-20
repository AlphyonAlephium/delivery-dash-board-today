
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectsSidebarProps {
  projects: any[];
  activeProject: any | null;
  onSelectProject: (project: any) => void;
}

const ProjectsSidebar = ({ 
  projects, 
  activeProject, 
  onSelectProject 
}: ProjectsSidebarProps) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-4">Projects</h3>
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                activeProject?.id === project.id ? "bg-accent" : ""
              )}
              onClick={() => onSelectProject(project)}
            >
              <Folder className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm truncate">{project.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsSidebar;
