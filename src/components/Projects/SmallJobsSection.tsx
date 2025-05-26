
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

interface SmallJob {
  id: string;
  title: string;
  orderNumber?: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: Date;
}

interface SmallJobsSectionProps {
  projects: any[];
}

const SmallJobsSection = ({ projects }: SmallJobsSectionProps) => {
  const [smallJobs, setSmallJobs] = useState<SmallJob[]>([]);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    orderNumber: "",
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

    const job: SmallJob = {
      id: Math.random().toString(36).substr(2, 9),
      title: newJob.title,
      orderNumber: newJob.orderNumber || undefined,
      status: "pending",
      createdAt: new Date(),
    };

    setSmallJobs([...smallJobs, job]);
    setNewJob({ title: "", orderNumber: "" });
    setIsAddingJob(false);

    toast({
      title: "Job added",
      description: `"${job.title}" has been added to small jobs`,
    });
  };

  const handleDeleteJob = (jobId: string) => {
    setSmallJobs(smallJobs.filter(job => job.id !== jobId));
    toast({
      title: "Job deleted",
      description: "The job has been removed",
    });
  };

  const handleStatusChange = (jobId: string, newStatus: SmallJob["status"]) => {
    setSmallJobs(smallJobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
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
                    value={newJob.orderNumber} 
                    onValueChange={(value) => setNewJob({ ...newJob, orderNumber: value })}
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
                  <Button onClick={handleAddJob}>
                    Add Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {smallJobs.length === 0 ? (
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
                      title="Drag to confirm"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      {job.orderNumber && (
                        <p className="text-xs text-muted-foreground">
                          Order: {job.orderNumber}
                        </p>
                      )}
                      <div className="mt-1">
                        <Select
                          value={job.status}
                          onValueChange={(value: SmallJob["status"]) => 
                            handleStatusChange(job.id, value)
                          }
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
