import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Download, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MissingMaterial {
  id?: string;
  project_id: string;
  material_name: string;
  steel_grade: string;
  quantity: number;
  unit: 'pieces' | 'meters';
  status?: string;
}

interface ProjectWithMaterials {
  id: string;
  name: string;
  description?: string;
  materials: MissingMaterial[];
}

export const MissingMaterialsTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [materials, setMaterials] = useState<MissingMaterial[]>([]);
  const [editingMode, setEditingMode] = useState(false);

  // Fetch active projects
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all missing materials grouped by project (status = 'missing' OR 'quoted')
  const { data: projectsWithMaterials = [], isLoading } = useQuery({
    queryKey: ['missing_materials_overview'],
    queryFn: async () => {
      // First get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (projectsError) throw projectsError;

      // Then get all missing materials with status 'missing' OR 'quoted'
      const { data: materialsData, error: materialsError } = await supabase
        .from('missing_materials')
        .select('*')
        .in('status', ['missing', 'quoted'])
        .order('created_at');
      
      if (materialsError) throw materialsError;

      // Group materials by project
      const result: ProjectWithMaterials[] = [];
      
      projectsData?.forEach(project => {
        const projectMaterials = materialsData?.filter(m => m.project_id === project.id) || [];
        if (projectMaterials.length > 0) {
          result.push({
            id: project.id,
            name: project.name,
            description: project.description,
            materials: projectMaterials as MissingMaterial[]
          });
        }
      });

      return result;
    }
  });

  // Fetch missing materials for selected project (for editing) - status = 'missing' OR 'quoted'
  const { data: existingMaterials } = useQuery({
    queryKey: ['missing_materials', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      const { data, error } = await supabase
        .from('missing_materials')
        .select('*')
        .eq('project_id', selectedProjectId)
        .in('status', ['missing', 'quoted'])
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId
  });

  // Save materials mutation
  const saveMaterialsMutation = useMutation({
    mutationFn: async (materials: MissingMaterial[]) => {
      if (!selectedProjectId) throw new Error('No project selected');
      
      // Delete existing materials for this project with status 'missing'
      await supabase
        .from('missing_materials')
        .delete()
        .eq('project_id', selectedProjectId)
        .eq('status', 'missing');
      
      // Insert new materials with status 'missing'
      if (materials.length > 0) {
        const { error } = await supabase
          .from('missing_materials')
          .insert(materials.map(m => ({
            project_id: selectedProjectId,
            material_name: m.material_name,
            steel_grade: m.steel_grade,
            quantity: m.quantity,
            unit: m.unit,
            status: 'missing'
          })));
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Missing materials saved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['missing_materials'] });
      queryClient.invalidateQueries({ queryKey: ['missing_materials_overview'] });
      setEditingMode(false);
      setSelectedProjectId("");
      setMaterials([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save missing materials",
        variant: "destructive"
      });
      console.error('Error saving materials:', error);
    }
  });

  // Mark material as ordered mutation
  const markAsOrderedMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('missing_materials')
        .update({ status: 'ordered' })
        .eq('id', materialId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material marked as ordered"
      });
      queryClient.invalidateQueries({ queryKey: ['missing_materials'] });
      queryClient.invalidateQueries({ queryKey: ['missing_materials_overview'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark material as ordered",
        variant: "destructive"
      });
      console.error('Error marking material as ordered:', error);
    }
  });

  // Mark material as sent for price offering mutation
  const markAsPriceOfferingMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('missing_materials')
        .update({ status: 'quoted' })
        .eq('id', materialId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material marked as sent for price offering"
      });
      queryClient.invalidateQueries({ queryKey: ['missing_materials'] });
      queryClient.invalidateQueries({ queryKey: ['missing_materials_overview'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark material as sent for price offering",
        variant: "destructive"
      });
      console.error('Error marking material as sent for price offering:', error);
    }
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('missing_materials')
        .delete()
        .eq('id', materialId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['missing_materials'] });
      queryClient.invalidateQueries({ queryKey: ['missing_materials_overview'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive"
      });
      console.error('Error deleting material:', error);
    }
  });

  // Export to Excel function
  const exportToExcel = () => {
    // Create CSV data
    const csvData = [];
    csvData.push(['Project Name', 'Material Name', 'Steel Grade', 'Quantity', 'Unit']);
    
    projectsWithMaterials.forEach(project => {
      project.materials.forEach(material => {
        csvData.push([
          project.name,
          material.material_name,
          material.steel_grade,
          material.quantity.toString(),
          material.unit
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `missing_materials_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Missing materials exported successfully"
    });
  };

  // Load existing materials when project is selected for editing
  React.useEffect(() => {
    if (existingMaterials && editingMode) {
      setMaterials(existingMaterials.map(m => ({
        id: m.id,
        project_id: m.project_id,
        material_name: m.material_name,
        steel_grade: m.steel_grade,
        quantity: m.quantity,
        unit: m.unit as 'pieces' | 'meters',
        status: m.status
      })));
    }
  }, [existingMaterials, editingMode]);

  const addNewRow = () => {
    if (!selectedProjectId) {
      toast({
        title: "Warning",
        description: "Please select a project first",
        variant: "destructive"
      });
      return;
    }
    
    setMaterials([...materials, {
      project_id: selectedProjectId,
      material_name: "",
      steel_grade: "",
      quantity: 0,
      unit: "pieces"
    }]);
  };

  const removeRow = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof MissingMaterial, value: any) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const handleSave = () => {
    const validMaterials = materials.filter(m => 
      m.material_name.trim() && m.steel_grade.trim() && m.quantity > 0
    );
    saveMaterialsMutation.mutate(validMaterials);
  };

  const startEditing = (projectId: string) => {
    setSelectedProjectId(projectId);
    setEditingMode(true);
  };

  const cancelEditing = () => {
    setEditingMode(false);
    setSelectedProjectId("");
    setMaterials([]);
  };

  const handleMarkAsOrdered = (materialId: string) => {
    markAsOrderedMutation.mutate(materialId);
  };

  const handleMarkAsPriceOffering = (materialId: string) => {
    markAsPriceOfferingMutation.mutate(materialId);
  };

  const handleDeleteMaterial = (materialId: string) => {
    deleteMaterialMutation.mutate(materialId);
  };

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading missing materials...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Missing Materials</span>
          <div className="flex gap-2">
            {!editingMode && projectsWithMaterials.length > 0 && (
              <Button onClick={exportToExcel} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            )}
            {!editingMode && (
              <Button onClick={() => setEditingMode(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Missing Materials
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!editingMode ? (
          // Overview mode - show all projects with their missing materials
          <div className="space-y-6">
            {projectsWithMaterials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No missing materials recorded yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Add Missing Materials" to get started.</p>
              </div>
            ) : (
              projectsWithMaterials.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(project.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material Name</TableHead>
                          <TableHead>Steel Grade</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-64">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.materials.map((material, index) => (
                          <TableRow key={material.id || index} className={material.status === 'quoted' ? 'bg-green-50' : ''}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {material.status === 'quoted' && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                                {material.material_name}
                              </div>
                            </TableCell>
                            <TableCell>{material.steel_grade}</TableCell>
                            <TableCell>{material.quantity}</TableCell>
                            <TableCell className="capitalize">{material.unit}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                material.status === 'quoted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {material.status === 'quoted' ? 'Price Offering Sent' : 'Missing'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {material.status === 'missing' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAsPriceOffering(material.id!)}
                                    disabled={markAsPriceOfferingMutation.isPending}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Price Offering
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkAsOrdered(material.id!)}
                                  disabled={markAsOrderedMutation.isPending}
                                >
                                  Mark as Ordered
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteMaterial(material.id!)}
                                  disabled={deleteMaterialMutation.isPending}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Editing mode - show the editable table
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Project</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Choose active project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProject && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProject.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={addNewRow} size="sm" disabled={!selectedProjectId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
                <Button 
                  onClick={handleSave} 
                  size="sm" 
                  variant="outline"
                  disabled={saveMaterialsMutation.isPending || !selectedProjectId}
                >
                  Save
                </Button>
                <Button 
                  onClick={cancelEditing} 
                  size="sm" 
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-80">Material Name</TableHead>
                    <TableHead className="w-40">Steel Grade</TableHead>
                    <TableHead className="w-32">Quantity</TableHead>
                    <TableHead className="w-32">Unit</TableHead>
                    <TableHead className="w-16">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={material.material_name}
                          onChange={(e) => updateMaterial(index, 'material_name', e.target.value)}
                          placeholder="Enter material name..."
                          className="border-0 focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={material.steel_grade}
                          onChange={(e) => updateMaterial(index, 'steel_grade', e.target.value)}
                          placeholder="e.g., S355, S275..."
                          className="border-0 focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="border-0 focus-visible:ring-0"
                          min="0"
                          step="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={material.unit}
                          onValueChange={(value: 'pieces' | 'meters') => updateMaterial(index, 'unit', value)}
                        >
                          <SelectTrigger className="border-0 focus-visible:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="meters">Meters</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {materials.length === 0 && selectedProjectId && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No missing materials recorded. Click "Add Row" to start tracking.
                      </TableCell>
                    </TableRow>
                  )}
                  {!selectedProjectId && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Please select a project to view and manage missing materials.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
