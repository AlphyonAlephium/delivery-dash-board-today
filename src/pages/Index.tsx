
import React from "react";
import {
  DashboardLayout,
  LogisticsTimeline,
  ActiveProjectsList
} from "../components/Dashboard";
import { logisticsEvents, projects } from "../data/sampleData";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logistics Timeline Section */}
        <LogisticsTimeline events={logisticsEvents} />
        
        {/* Active Projects List */}
        <ActiveProjectsList projects={projects} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
