
import React from "react";
import { DashboardLayout } from "../components/Dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MissingMaterialsTable } from "../components/MissingMaterials";

const MissingMaterials = () => {
  return (
    <DashboardLayout>
      <ScrollArea className="h-full w-full">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Missing Materials</h1>
            <p className="text-muted-foreground">
              Track and manage missing materials for active projects
            </p>
          </div>
          <MissingMaterialsTable />
        </div>
      </ScrollArea>
    </DashboardLayout>
  );
};

export default MissingMaterials;
