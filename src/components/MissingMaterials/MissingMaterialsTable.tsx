
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
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
}

export const MissingMaterialsTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [materials, setMaterials] = useState<MissingMaterial[]>([]);

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

  // Fetch missing materials for selected project
  const { data: existingMaterials } = useQuery({
    queryKey: ['missing_materials', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      const { data, error } = await supabase
        .from('missing_materials')
        .select('*')
        .eq('project_id', selectedProjectId)
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
      
      // Delete existing materials for this project
      await supabase
        .from('missing_materials')
        .delete()
        .eq('project_id', selectedProjectId);
      
      // Insert new materials
      if (materials.length > 0) {
        const { error } = await supabase
          .from('missing_materials')
          .insert(materials.map(m => ({
            project_id: selectedProjectId,
            material_name: m.material_name,
            steel_grade: m.steel_grade,
            quantity: m.quantity,
            unit: m.unit
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

  // Load existing materials when project is selected
  React.useEffect(() => {
    if (existingMaterials) {
      setMaterials(existingMaterials.map(m => ({
        id: m.id,
        project_id: m.project_id,
        material_name: m.material_name,
        steel_grade: m.steel_grade,
        quantity: m.quantity,
        unit: m.unit as 'pieces' | 'meters'
      })));
    } else {
      setMaterials([]);
    }
  }, [existingMaterials]);

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

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Missing Materials</span>
          <div className="flex gap-2">
            <Button onClick={addNewRow} size="sm">
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
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
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
      </CardContent>
    </Card>
  );
};
