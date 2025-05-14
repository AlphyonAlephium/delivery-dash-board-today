
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DeliveryFormProps {
  initialData?: {
    date: Date;
    time: string;
    type: "delivery" | "pickup";
    projectNumber: string;
    projectName: string;
    location: string;
  } | null;
  projects: any[];
  onSave: (data: any) => void;
}

const DeliveryForm = ({ initialData, projects, onSave }: DeliveryFormProps) => {
  const defaultValues = initialData || {
    date: new Date(),
    time: "09:00 AM",
    type: "delivery",
    projectNumber: "",
    projectName: "",
    location: ""
  };

  const form = useForm({
    defaultValues: {
      ...defaultValues,
      date: initialData?.date ? initialData.date : new Date(),
      projectId: initialData?.projectNumber || "",
    }
  });

  const watchProjectId = form.watch("projectId");
  
  // Update project name when project ID changes
  React.useEffect(() => {
    if (watchProjectId) {
      const selectedProject = projects.find(p => p.id === watchProjectId);
      if (selectedProject) {
        form.setValue("projectName", selectedProject.name);
        form.setValue("projectNumber", selectedProject.id);
      }
    }
  }, [watchProjectId, projects, form]);

  const handleSubmit = (data) => {
    // Format the data for saving
    const formattedData = {
      date: new Date(data.date),
      time: data.time,
      type: data.type,
      projectNumber: data.projectNumber,
      projectName: data.projectName,
      location: data.location
    };
    
    onSave(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Delivery Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <label htmlFor="delivery">Delivery</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <label htmlFor="pickup">Pickup</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 09:00 AM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.id} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};

export default DeliveryForm;
