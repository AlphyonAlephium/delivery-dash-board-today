
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ProjectForm from "./ProjectForm";
import DeliveryForm from "./DeliveryForm";
import { projects, logisticsEvents } from "@/data/sampleData";
import { toast } from "@/components/ui/use-toast";

const ProjectsManagement = () => {
  const [activeProjects, setActiveProjects] = useState(projects);
  const [deliveries, setDeliveries] = useState(logisticsEvents);
  const [editingProject, setEditingProject] = useState(null);
  const [editingDelivery, setEditingDelivery] = useState(null);
  
  const handleSaveProject = (projectData) => {
    if (editingProject) {
      // Update existing project
      setActiveProjects(activeProjects.map(p => 
        p.id === editingProject.id ? { ...projectData, id: editingProject.id } : p
      ));
      toast({
        title: "Project updated",
        description: `${projectData.name} has been successfully updated.`
      });
    } else {
      // Add new project
      const newId = `PRJ-${new Date().getFullYear()}-${(activeProjects.length + 1).toString().padStart(3, '0')}`;
      setActiveProjects([...activeProjects, { ...projectData, id: newId, status: "active" }]);
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
      toast({
        title: "Delivery updated",
        description: `Delivery for ${deliveryData.projectName} has been updated.`
      });
    } else {
      // Add new delivery
      setDeliveries([...deliveries, deliveryData]);
      toast({
        title: "Delivery added",
        description: `New delivery for ${deliveryData.projectName} has been scheduled.`
      });
    }
    setEditingDelivery(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Projects Management</CardTitle>
        <CardDescription>Manage all your projects and deliveries in one place</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
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
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Documentation</TableHead>
                    <TableHead>Materials Ordered</TableHead>
                    <TableHead>Materials Received</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.id}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.progress}%</TableCell>
                      <TableCell>{project.documentationDone ? "Yes" : "No"}</TableCell>
                      <TableCell>{project.materialsOrdered ? "Yes" : "No"}</TableCell>
                      <TableCell>{project.materialsReceived ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setEditingProject(project)}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Project: {project.name}</DialogTitle>
                            </DialogHeader>
                            <ProjectForm 
                              initialData={project} 
                              onSave={handleSaveProject} 
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="deliveries">
            <div className="flex justify-end mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingDelivery(null)}>
                    <Plus className="mr-2" />
                    Schedule New Delivery/Pickup
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
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(delivery.date)}</TableCell>
                      <TableCell>{delivery.time}</TableCell>
                      <TableCell className="capitalize">{delivery.type}</TableCell>
                      <TableCell>{delivery.projectName}</TableCell>
                      <TableCell>{delivery.location}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setEditingDelivery(delivery)}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit {delivery.type}</DialogTitle>
                            </DialogHeader>
                            <DeliveryForm 
                              initialData={delivery}
                              projects={activeProjects}
                              onSave={handleSaveDelivery}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProjectsManagement;
