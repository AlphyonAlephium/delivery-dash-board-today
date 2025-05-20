
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ProjectCriteriaProps {
  project: any;
  onUpdateProject: (updatedProject: any) => void;
}

const ProjectCriteria = ({ project, onUpdateProject }: ProjectCriteriaProps) => {
  const criteriaItems = [
    { key: "documentationDone", label: "Documentation Created" },
    { key: "materialsOrdered", label: "Materials Ordered" },
    { key: "materialsReceived", label: "Materials Received" },
    { key: "designApproved", label: "Design Approved" },
    { key: "qualityChecked", label: "Quality Checked" },
    { key: "clientApproved", label: "Client Approved" },
  ];

  const handleCriteriaChange = (key: string, checked: boolean) => {
    const updatedProject = {
      ...project,
      [key]: checked,
      // Update progress based on criteria completion
      progress: calculateProgress({
        ...project,
        [key]: checked,
      }),
    };
    
    onUpdateProject(updatedProject);
    toast({
      title: "Project updated",
      description: `${key} is now ${checked ? "completed" : "pending"}`,
    });
  };

  // Calculate progress based on completed criteria
  const calculateProgress = (projectData: any) => {
    const criteriaCount = criteriaItems.length;
    const completedCount = criteriaItems.filter(
      (item) => projectData[item.key] === true
    ).length;
    
    return Math.round((completedCount / criteriaCount) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          {project?.name || "Select a Project"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {project ? (
          <>
            <div className="mb-4">
              <p>Progress: {project.progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criteriaItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between space-x-2 p-4 border rounded-md"
                >
                  <Label
                    htmlFor={`${item.key}-${project.id}`}
                    className="flex-grow cursor-pointer"
                  >
                    {item.label}
                  </Label>
                  <Switch
                    id={`${item.key}-${project.id}`}
                    checked={project[item.key] || false}
                    onCheckedChange={(checked) =>
                      handleCriteriaChange(item.key, checked)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Select a project from the sidebar to view and update criteria
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCriteria;
