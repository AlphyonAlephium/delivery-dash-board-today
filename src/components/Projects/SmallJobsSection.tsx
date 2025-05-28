import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tables } from "@/integrations/supabase/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type SmallJob = Tables<'small_jobs'>;

const jobSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  order_number: z.string().optional(),
});

const SmallJobsSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs } = useQuery({
    queryKey: ['small_jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('small_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const insertJobMutation = useMutation({
    mutationFn: async (newJob: z.infer<typeof jobSchema>) => {
      const { error } = await supabase
        .from('small_jobs')
        .insert({ ...newJob, status: 'pending' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New job added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add new job",
        variant: "destructive"
      });
      console.error('Error inserting job:', error);
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string, status: SmallJob["status"] }) => {
      const { error } = await supabase
        .from('small_jobs')
        .update({ status })
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job status updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
      console.error('Error updating job:', error);
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('small_jobs')
        .delete()
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['small_jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
      console.error('Error deleting job:', error);
    }
  });

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      order_number: "",
    },
  });

  const { handleSubmit } = form;

  const onSubmit = (values: z.infer<typeof jobSchema>) => {
    insertJobMutation.mutate(values);
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    // Validate the status before casting
    if (newStatus === "pending" || newStatus === "in-progress" || newStatus === "completed") {
      updateJobMutation.mutate({ jobId, status: newStatus as SmallJob["status"] });
    }
  };

  const handleMarkAsFinished = (jobId: string) => {
    handleStatusChange(jobId, "completed");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Small Jobs</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Number (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter order number..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={insertJobMutation.isPending}>
              {insertJobMutation.isPending ? "Adding..." : "Add Job"}
            </Button>
          </form>
        </Form>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {jobs?.map((job) => (
              <div key={job.id} className={`p-3 rounded-lg border-l-4 transition-colors ${
                job.status === "completed" 
                  ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" 
                  : "border-l-red-500 bg-red-50 dark:bg-red-950/20"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{job.title}</h4>
                    {job.order_number && (
                      <p className="text-xs text-muted-foreground">
                        Order: {job.order_number}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1">
                        <Select
                          value={job.status}
                          onValueChange={(value) => handleStatusChange(job.id, value)}
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
                      {job.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsFinished(job.id)}
                          disabled={updateJobMutation.isPending}
                          className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        >
                          ✓
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deleteJobMutation.isPending}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SmallJobsSection;
