
import React from "react";
import { DashboardLayout } from "../components/Dashboard";
import { ProjectsManagement } from "../components/Projects";
import { ScrollArea } from "@/components/ui/scroll-area";

const Projects = () => {
  return (
    <DashboardLayout>
      <ScrollArea className="h-full w-full">
        <ProjectsManagement />
      </ScrollArea>
    </DashboardLayout>
  );
};

export default Projects;
