"use client";

import { TaskWithMeta } from "@/features/admin/tasks/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import { MessageSquare, ListTodo, Paperclip, Activity } from "lucide-react";

interface TaskDetailTabsProps {
  task: TaskWithMeta;
}

export function TaskDetailTabs({ task }: TaskDetailTabsProps) {
  return (
    <Tabs defaultValue="comments" className="w-full">
      <div className="flex flex-col gap-2 w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-10 mb-4">
          <TabsTrigger
            value="subtasks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
          >
            <ListTodo className="size-4 mr-2" />
            Subtasks
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
          >
            <MessageSquare className="size-4 mr-2" />
            Comments
          </TabsTrigger>

          <TabsTrigger
            value="attachments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
          >
            <Paperclip className="size-4 mr-2" />
            Attachments
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
          >
            <Activity className="size-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-0">
          <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
            Comments tab content (placeholder)
          </div>
        </TabsContent>

        <TabsContent value="subtasks" className="mt-0">
          <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
            Subtasks tab content (placeholder)
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="mt-0">
          <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
            Attachments tab content (placeholder)
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-md">
            Activity tab content (placeholder)
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
