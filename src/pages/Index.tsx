
import React from "react";
import {
  DashboardLayout,
  LogisticsTimeline,
  ProjectCarousel
} from "../components/Dashboard";
import { logisticsEvents, projects } from "../data/sampleData";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6">
        {/* Logistics Timeline Section */}
        <LogisticsTimeline events={logisticsEvents} />
        
        {/* Project Carousel */}
        <ProjectCarousel projects={projects} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
