
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ProjectForm from "./ProjectForm";
import DeliveryForm from "./DeliveryForm";
import { projects, logisticsEvents } from "@/data/sampleData";
import { toast } from "@/components/ui/use-toast";
import ProjectsSidebar from "./ProjectsSidebar";
import ProjectCriteria from "./ProjectCriteria";
import DeliveriesTimeline from "./DeliveriesTimeline";
import DeliveriesCarousel from "./DeliveriesCarousel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const ProjectsManagement = () => {
  const [activeProjects, setActiveProjects] = useState(projects);
  const [deliveries, setDeliveries] = useState(logisticsEvents.map(event => ({
    ...event,
    projectsInvolved: [],
    projectsInvolvedNames: []
  })));
  const [editingProject, setEditingProject] = useState(null);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const handleSaveProject = (projectData) => {
    if (editingProject) {
      // Update existing project
      setActiveProjects(activeProjects.map(p => 
        p.id === editingProject.id ? { ...projectData, id: editingProject.id } : p
      ));
      
      // Update selected project if it's the one being edited
      if (selectedProject && selectedProject.id === editingProject.id) {
        setSelectedProject({ ...projectData, id: editingProject.id });
      }
      
      toast({
        title: "Project updated",
        description: `${projectData.name} has been successfully updated.`
      });
    } else {
      // Add new project
      const newId = `PRJ-${new Date().getFullYear()}-${(activeProjects.length + 1).toString().padStart(3, '0')}`;
      const newProject = { ...projectData, id: newId, status: "active" };
      setActiveProjects([...activeProjects, newProject]);
      toast({
        title: "Project added",
        description: `${projectData.name} has been successfully created.`
      });
    }
    setEditingProject(null);
  };

  const handleSaveDelivery = (deliveryData) => {
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

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
  };
  
  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    const updatedProjects = activeProjects.filter(p => p.id !== projectToDelete.id);
    setActiveProjects(updatedProjects);
    
    // If the deleted project was selected, clear the selection
    if (selectedProject?.id === projectToDelete.id) {
      setSelectedProject(null);
    }
    
    // Update deliveries to remove this project from primary and involved lists
    const updatedDeliveries = deliveries.filter(d => d.projectNumber !== projectToDelete.id)
      .map(d => ({
        ...d,
        projectsInvolved: d.projectsInvolved ? 
          d.projectsInvolved.filter(id => id !== projectToDelete.id) : 
          [],
        projectsInvolvedNames: d.projectsInvolvedNames ? 
          d.projectsInvolvedNames.filter((_, idx) => 
            d.projectsInvolved[idx] !== projectToDelete.id
          ) : 
          []
      }));
    
    setDeliveries(updatedDeliveries);
    
    toast({
      title: "Project deleted",
      description: `${projectToDelete.name} has been successfully deleted.`
    });
    
    setProjectToDelete(null);
  };

  const handleUpdateProject = (updatedProject) => {
    setActiveProjects(activeProjects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
    setSelectedProject(updatedProject);
  };

  return (
    <div className="space-y-6">
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
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            <div className="space-y-6">
              <ProjectsSidebar 
                projects={activeProjects} 
                activeProject={selectedProject} 
                onSelectProject={setSelectedProject}
                onDeleteProject={handleDeleteProject}
              />
            </div>
            
            <ProjectCriteria 
              project={selectedProject} 
              onUpdateProject={handleUpdateProject} 
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
                <AlertDialogAction onClick={confirmDeleteProject}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsManagement;
