
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SmallJob {
  id: string;
  title: string;
  order_number?: string;
  status: "pending" | "in-progress" | "completed";
  created_at: Date;
}

interface SmallJobsSectionProps {
  projects: any[];
}

const SmallJobsSection = ({ projects }: SmallJobsSectionProps) => {
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    order_number: "",
  });

  const queryClient = useQueryClient();

  // Fetch small jobs from Supabase
  const { data: smallJobs = [], isLoading } = useQuery({
    queryKey: ['small_jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('small_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching small jobs:", error);
        toast({
          title: "Error loading small jobs",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data?.map(job => ({
        ...job,
        created_at: new Date(job.created_at)
      })) || [];
    }
  });

  // Create small job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: { title: string; order_number?: string }) => {
      const { data, error } = await supabase
        .from('small_jobs')
        .insert([{
          title: jobData.title,
          order_number: jobData.order_number || null,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
      setNewJob({ title: "", order_number: "" });
      setIsAddingJob(false);
      toast({
        title: "Job added",
        description: `"${data.title}" has been added to small jobs`,
      });
    },
    onError: (error: any) => {
      console.error("Error creating small job:", error);
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update small job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: SmallJob["status"] }) => {
      const { data, error } = await supabase
        .from('small_jobs')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
    },
    onError: (error: any) => {
      console.error("Error updating small job:", error);
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete small job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('small_jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
      toast({
        title: "Job deleted",
        description: "The job has been removed",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting small job:", error);
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mock order numbers - you can replace this with actual order data
  const orderNumbers = ["ORD-001", "ORD-002", "ORD-003", "ORD-004"];

  const handleAddJob = () => {
    if (!newJob.title.trim()) {
      toast({
        title: "Error",
        description: "Job title is required",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      title: newJob.title,
      order_number: newJob.order_number || undefined
    });
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const handleStatusChange = (jobId: string, newStatus: SmallJob["status"]) => {
    updateJobMutation.mutate({ jobId, status: newStatus });
  };

  const getStatusColor = (status: SmallJob["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Small Jobs</CardTitle>
          <Dialog open={isAddingJob} onOpenChange={setIsAddingJob}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Small Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="Enter job title"
                  />
                </div>
                <div>
                  <Label htmlFor="order-number">Order Number (Optional)</Label>
                  <Select 
                    value={newJob.order_number} 
                    onValueChange={(value) => setNewJob({ ...newJob, order_number: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order number or leave blank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No order number</SelectItem>
                      {orderNumbers.map((orderNum) => (
                        <SelectItem key={orderNum} value={orderNum}>
                          {orderNum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingJob(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddJob}
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? "Adding..." : "Add Job"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Loading small jobs...
            </p>
          ) : smallJobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No small jobs yet
            </p>
          ) : (
            smallJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-1 cursor-grab active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      {job.order_number && (
                        <p className="text-xs text-muted-foreground">
                          Order: {job.order_number}
                        </p>
                      )}
                      <div className="mt-1">
                        <Select
                          value={job.status}
                          onValueChange={(value: SmallJob["status"]) => 
                            handleStatusChange(job.id, value)
                          }
                          disabled={updateJobMutation.isPending}
                        >
                          <SelectTrigger className="h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deleteJobMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmallJobsSection;
