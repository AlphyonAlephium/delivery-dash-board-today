
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderedMaterial {
  id: string;
  project_id: string;
  material_name: string;
  steel_grade: string;
  quantity: number;
  unit: string;
  created_at: string;
}

interface ProjectWithOrderedMaterials {
  id: string;
  name: string;
  description?: string;
  materials: OrderedMaterial[];
}

export const OrderedMaterialsTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all ordered materials grouped by project
  const { data: projectsWithOrderedMaterials = [], isLoading } = useQuery({
    queryKey: ['ordered_materials_overview'],
    queryFn: async () => {
      // First get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (projectsError) throw projectsError;

      // Then get all ordered materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('missing_materials')
        .select('*')
        .eq('status', 'ordered')
        .order('created_at');
      
      if (materialsError) throw materialsError;

      // Group materials by project
      const result: ProjectWithOrderedMaterials[] = [];
      
      projectsData?.forEach(project => {
        const projectMaterials = materialsData?.filter(m => m.project_id === project.id) || [];
        if (projectMaterials.length > 0) {
          result.push({
            id: project.id,
            name: project.name,
            description: project.description,
            materials: projectMaterials as OrderedMaterial[]
          });
        }
      });

      return result;
    }
  });

  // Mark material back as missing mutation
  const markAsMissingMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('missing_materials')
        .update({ status: 'missing' })
        .eq('id', materialId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material moved back to missing"
      });
      queryClient.invalidateQueries({ queryKey: ['ordered_materials_overview'] });
      queryClient.invalidateQueries({ queryKey: ['missing_materials_overview'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move material back to missing",
        variant: "destructive"
      });
      console.error('Error marking material as missing:', error);
    }
  });

  const handleMarkAsMissing = (materialId: string) => {
    markAsMissingMutation.mutate(materialId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading ordered materials...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordered Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projectsWithOrderedMaterials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No ordered materials yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Materials marked as ordered will appear here.</p>
            </div>
          ) : (
            projectsWithOrderedMaterials.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                </div>
                
                <div className="border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material Name</TableHead>
                        <TableHead>Steel Grade</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Ordered Date</TableHead>
                        <TableHead className="w-32">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.material_name}</TableCell>
                          <TableCell>{material.steel_grade}</TableCell>
                          <TableCell>{material.quantity}</TableCell>
                          <TableCell className="capitalize">{material.unit}</TableCell>
                          <TableCell>
                            {new Date(material.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsMissing(material.id)}
                              disabled={markAsMissingMutation.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Mark as Missing
                            </Button>
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
      </CardContent>
    </Card>
  );
};
