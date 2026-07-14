import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { useCreateTask } from "@/features/admin/tasks/hooks";
import { useProjectLabels } from "@/features/admin/tasks/labels/hooks";
import {
  createTaskFormSchema,
  CreateTaskFormValues,
} from "@/features/admin/tasks/validations";

export interface UseCreateTaskFormOptions {
  projectId: string;
  defaultStatus?: TaskStatus;
  onSuccess?: () => void;
}

function buildDefaults(status: TaskStatus): CreateTaskFormValues {
  return {
    title: "",
    status,
    priority: "MEDIUM",
    type: "FEATURE",
    labelIds: [],
  };
}

/**
 * Encapsulates all form logic for the create-task sheet.
 *
 * Returns:
 *  - `form`      — react-hook-form instance, pass to <Form> and <FormField>
 *  - `onSubmit`  — submit handler ready for <form onSubmit={onSubmit}>
 *  - `isPending` — true while the create mutation is in-flight
 *  - `labels`    — project labels from cache (for the LabelSelect picker)
 *  - `reset`     — call when the sheet re-opens to clear stale values
 *
 * The mutation's own `onSuccess` in `useCreateTask` invalidates
 * `taskKeys.all(projectId)` so the board refreshes automatically.
 * The caller's `onSuccess` callback fires after that to close the sheet.
 */

export function useCreateTaskForm({
  projectId,
  defaultStatus = "TODO",
  onSuccess,
}: UseCreateTaskFormOptions) {
  const { mutate: createTask, isPending } = useCreateTask(projectId);
  const { data: labelsData } = useProjectLabels(projectId);
  const labels = labelsData?.data ?? [];

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: buildDefaults(defaultStatus),
  });

  /**
   * Reset the form to fresh defaults for the given status column.
   * Call this whenever the sheet opens (e.g. in a useEffect on `open`).
   */
  function reset(status: TaskStatus = defaultStatus) {
    form.reset(buildDefaults(status));
  }

  function handleSubmit(values: CreateTaskFormValues) {
    createTask(values, {
      onSuccess: () => onSuccess?.(),
    });
  }

  return {
    form,
    onSubmit: form.handleSubmit(handleSubmit),
    isPending,
    labels,
    reset,
  };
}
