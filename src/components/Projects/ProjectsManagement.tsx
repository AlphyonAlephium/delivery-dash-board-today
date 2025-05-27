
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProjectForm from "./ProjectForm";
import DeliveryForm from "./DeliveryForm";
import { logisticsEvents } from "@/data/sampleData";
import { toast } from "@/components/ui/use-toast";
import ProjectsSidebar from "./ProjectsSidebar";
import ProjectCriteria from "./ProjectCriteria";
import DeliveriesTimeline from "./DeliveriesTimeline";
import DeliveriesCarousel from "./DeliveriesCarousel";
import SmallJobsSection from "./SmallJobsSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ProjectsManagement = () => {
  const [deliveries, setDeliveries] = useState(logisticsEvents.map(event => ({
    ...event,
    projectsInvolved: [],
    projectsInvolvedNames: []
  })));
  const [editingProject, setEditingProject] = useState(null);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const queryClient = useQueryClient();
  
  // Fetch projects from Supabase
  const { data: activeProjects = [], isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data || [];
    }
  });
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project created",
        description: "Your project has been successfully created"
      });
    },
    onError: (error: any) => {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Update selected project if it's the one being edited
      if (selectedProject && selectedProject.id === data.id) {
        setSelectedProject(data);
      }
      
      toast({
        title: "Project updated",
        description: `${data.name} has been successfully updated.`
      });
    },
    onError: (error: any) => {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      return projectId;
    },
    onSuccess: (deletedId: string) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // If the deleted project was selected, clear the selection
      if (selectedProject?.id === deletedId) {
        setSelectedProject(null);
      }
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted."
      });
      
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveProject = (projectData: any) => {
    if (editingProject) {
      // Update existing project
      updateProjectMutation.mutate({
        ...projectData,
        id: editingProject.id
      });
    } else {
      // Add new project
      createProjectMutation.mutate({
        ...projectData,
        status: "active"
      });
    }
    setEditingProject(null);
  };

  const handleSaveDelivery = (deliveryData: any) => {
    if (editingDelivery) {
      // Update existing delivery
      setDeliveries(deliveries.map((d, index) => 
        index === deliveries.indexOf(editingDelivery) ? deliveryData : d
      ));
      
      // Show involved projects in toast
      const additionalProjects = deliveryData.projectsInvolved?.length || 0;
      const projectDescription = additionalProjects > 0 
        ? ` and ${additionalProjects} additional project(s)` 
        : '';
        
      toast({
        title: "Delivery updated",
        description: `Delivery for ${deliveryData.projectName}${projectDescription} has been updated.`
      });
    } else {
      // Add new delivery
      setDeliveries([...deliveries, deliveryData]);
      
      // Show involved projects in toast
      const additionalProjects = deliveryData.projectsInvolved?.length || 0;
      const projectDescription = additionalProjects > 0 
        ? ` and ${additionalProjects} additional project(s)` 
        : '';
        
      toast({
        title: "Delivery added",
        description: `New delivery for ${deliveryData.projectName}${projectDescription} has been scheduled.`
      });
    }
    setEditingDelivery(null);
  };

  const handleDeleteDelivery = (delivery: any) => {
    setDeliveries(deliveries.filter(d => d !== delivery));
    toast({
      title: "Delivery deleted",
      description: `Delivery for ${delivery.projectName} has been removed.`
    });
  };

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project);
  };
  
  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    deleteProjectMutation.mutate(projectToDelete.id);
  };

  const handleUpdateProject = (updatedProject: any) => {
    updateProjectMutation.mutate(updatedProject);
  };

  return (
    <div className="space-y-6">
      {/* Display loading state */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <p className="text-destructive">Error loading projects. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Add Horizontal Deliveries Carousel at the top */}
          <DeliveriesCarousel
            deliveries={deliveries}
            projects={activeProjects}
            onAddDelivery={() => {
              setEditingDelivery(null);
              document.getElementById("add-delivery-dialog-trigger")?.click();
            }}
            onEditDelivery={(delivery) => {
              setEditingDelivery(delivery);
              document.getElementById("add-delivery-dialog-trigger")?.click();
            }}
            onDeleteDelivery={handleDeleteDelivery}
          />
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Projects Management</CardTitle>
              <CardDescription>Manage all your projects and deliveries in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProject(null)}>
                      <Plus className="mr-2" />
                      Add New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProject ? `Edit Project: ${editingProject.name}` : 'Create New Project'}
                      </DialogTitle>
                    </DialogHeader>
                    <ProjectForm 
                      initialData={editingProject} 
                      onSave={handleSaveProject}
                      isSubmitting={createProjectMutation.isPending || updateProjectMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[250px_250px_1fr] gap-6">
                <div className="space-y-6">
                  <ProjectsSidebar 
                    projects={activeProjects} 
                    activeProject={selectedProject} 
                    onSelectProject={setSelectedProject}
                    onDeleteProject={handleDeleteProject}
                    isLoading={isLoading}
                  />
                </div>
                
                <div className="space-y-6">
                  <SmallJobsSection projects={activeProjects} />
                </div>
                
                <ProjectCriteria 
                  project={selectedProject} 
                  onUpdateProject={handleUpdateProject}
                  isSubmitting={updateProjectMutation.isPending}
                />
              </div>

              {/* Hidden delivery dialog trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    id="add-delivery-dialog-trigger" 
                    className="hidden"
                  >
                    Add Delivery
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDelivery ? 'Edit Delivery/Pickup' : 'Schedule New Delivery/Pickup'}
                    </DialogTitle>
                  </DialogHeader>
                  <DeliveryForm 
                    initialData={editingDelivery}
                    projects={activeProjects}
                    onSave={handleSaveDelivery}
                  />
                </DialogContent>
              </Dialog>

              {/* Delete Project Confirmation Dialog */}
              <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the project "{projectToDelete?.name}" and all associated deliveries.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={confirmDeleteProject}
                      disabled={deleteProjectMutation.isPending}
                    >
                      {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProjectsManagement;
