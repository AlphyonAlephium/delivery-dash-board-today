
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SmallJob {
  id: string;
  title: string;
  status: string;
  order_number?: string;
}

interface SmallJobsSectionProps {
  projects: any[];
}

const SmallJobsSection = ({ projects }: SmallJobsSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newJobTitle, setNewJobTitle] = useState("");

  const { data: smallJobs = [] } = useQuery({
    queryKey: ['small_jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('small_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SmallJob[];
    }
  });

  const createJobMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('small_jobs')
        .insert([{ title, status: 'pending' }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
      setNewJobTitle("");
      toast({
        title: "Small job created",
        description: "New small job has been added successfully"
      });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SmallJob> }) => {
      const { data, error } = await supabase
        .from('small_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
      toast({
        title: "Job updated",
        description: "Small job has been updated successfully"
      });
    }
  });

  const handleCreateJob = () => {
    if (newJobTitle.trim()) {
      createJobMutation.mutate(newJobTitle.trim());
    }
  };

  const handleCompleteJob = (job: SmallJob) => {
    updateJobMutation.mutate({
      id: job.id,
      updates: { status: 'completed' }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Small Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add new small job..."
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateJob()}
            className="flex-1"
          />
          <Button 
            onClick={handleCreateJob} 
            size="sm"
            disabled={!newJobTitle.trim() || createJobMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {smallJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{job.title}</p>
                {job.order_number && (
                  <p className="text-xs text-muted-foreground">Order: {job.order_number}</p>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {job.status}
                </span>
              </div>
              {job.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCompleteJob(job)}
                  disabled={updateJobMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {smallJobs.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No small jobs yet. Add one above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmallJobsSection;
