
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProjectFormProps {
  initialData?: {
    name: string;
    progress?: number;
    documentationDone?: boolean;
    materialsOrdered?: boolean;
    materialsReceived?: boolean;
    designApproved?: boolean;
    qualityChecked?: boolean;
    clientApproved?: boolean;
    description?: string;
  } | null;
  onSave: (data: any) => void;
  isSubmitting?: boolean;
}

const ProjectForm = ({ initialData, onSave, isSubmitting = false }: ProjectFormProps) => {
  const defaultValues = initialData || {
    name: "",
    description: "",
    progress: 0,
    documentationDone: false,
    materialsOrdered: false,
    materialsReceived: false,
    designApproved: false,
    qualityChecked: false,
    clientApproved: false,
  };

  const form = useForm({
    defaultValues,
  });

  const handleSubmit = (data) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter project description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="Enter progress percentage" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>Project completion percentage (0-100)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="documentationDone"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Documentation Complete</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialsOrdered"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Materials Ordered</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialsReceived"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Materials Received</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="designApproved"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Design Approved</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qualityChecked"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Quality Checked</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientApproved"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel className="font-normal">Client Approved</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
