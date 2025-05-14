
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Project = {
  id: string;
  name: string;
  status: "active" | "completed" | "on-hold";
  progress?: number;
};

type ProjectCarouselProps = {
  projects: Project[];
};

const ProjectCarousel = ({ projects }: ProjectCarouselProps) => {
  const activeProjects = projects.filter(p => p.status === "active");
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Clone projects for infinite scrolling effect
  const displayProjects = [...activeProjects, ...activeProjects];
  
  // Handle pause on hover
  const handleMouseEnter = () => {
    if (carouselRef.current) {
      carouselRef.current.style.animationPlayState = 'paused';
    }
  };
  
  const handleMouseLeave = () => {
    if (carouselRef.current) {
      carouselRef.current.style.animationPlayState = 'running';
    }
  };

  // Adjust animation duration based on number of projects
  useEffect(() => {
    if (carouselRef.current) {
      // More projects should move faster
      const duration = Math.max(20, Math.min(40, 60 - activeProjects.length * 2));
      carouselRef.current.style.animationDuration = `${duration}s`;
    }
  }, [activeProjects.length]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Active Projects</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex animate-carousel whitespace-nowrap"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {displayProjects.map((project, index) => (
              <div 
                key={`${project.id}-${index}`} 
                className="inline-flex items-center px-4 py-2 mx-2 bg-accent/50 rounded-md min-w-[200px]"
              >
                <span className="truncate font-medium">{project.name}</span>
                {project.progress !== undefined && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {project.progress}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCarousel;
