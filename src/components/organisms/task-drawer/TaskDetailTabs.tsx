"use client";

import { TaskWithMeta } from "@/features/admin/tasks/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import { MessageSquare, ListTodo, Paperclip, Activity } from "lucide-react";
import { TaskCommentThread } from "@/components/organisms/comments/TaskCommentThread";
import { TaskAttachmentList } from "@/components/organisms/attachments/TaskAttachmentList";
import { TaskSubtaskList } from "../subtasks/TaskSubtaskList";

const TRIGGER_CLASS =
  "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full";

interface TaskDetailTabsProps {
  task: TaskWithMeta;
  projectId: string;
  onOpenTask: (taskId: string) => void;
}

export function TaskDetailTabs({
  task,
  projectId,
  onOpenTask,
}: TaskDetailTabsProps) {
  return (
    <Tabs defaultValue="comments" className="w-full">
      <div className="flex flex-col gap-2 w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-10 mb-4">
          <TabsTrigger value="subtasks" className={TRIGGER_CLASS}>
            <ListTodo className="size-4 mr-2" />
            Subtasks
          </TabsTrigger>
          <TabsTrigger value="comments" className={TRIGGER_CLASS}>
            <MessageSquare className="size-4 mr-2" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="attachments" className={TRIGGER_CLASS}>
            <Paperclip className="size-4 mr-2" />
            Attachments
          </TabsTrigger>
          <TabsTrigger value="activity" className={TRIGGER_CLASS}>
            <Activity className="size-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-0">
          <TaskCommentThread projectId={projectId} taskId={task.id} />
        </TabsContent>

        <TabsContent value="subtasks" className="mt-0">
          <TaskSubtaskList
            projectId={projectId}
            taskId={task.id}
            onOpenTask={onOpenTask}
          />
        </TabsContent>

        <TabsContent value="attachments" className="mt-0">
          <TaskAttachmentList projectId={projectId} taskId={task.id} />
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
