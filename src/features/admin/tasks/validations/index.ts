import {
  taskBaseSchema,
  taskQuerySchema,
  taskMoveSchema,
  createTaskFormSchema,
  TaskFormValues,
  TaskQuery,
  TaskMovePayload,
  CreateTaskFormValues,
} from "./tasks.validation";

import {
  TaskSubtaskCreateValues,
  taskSubtaskCreateSchema,
} from "./subtasks.validation";

import { LabelFormValues, labelBaseSchema } from "./labels.validation";

import {
  TaskCommentCreateValues,
  taskCommentCreateSchema,
} from "./comments.validation";
import {
  TaskAttachmentCreateValues,
  taskAttachmentCreateSchema,
} from "./attachments.validation";

// Schemas
export {
  // tasks.validation.ts
  taskBaseSchema,
  taskQuerySchema,
  taskMoveSchema,
  createTaskFormSchema,

  // subtasks.validation.ts
  taskSubtaskCreateSchema,

  // labels.validation.ts
  labelBaseSchema,

  // comments.validation.ts
  taskCommentCreateSchema,

  // attachments.validation.ts
  taskAttachmentCreateSchema,
};

// Types
export type {
  // tasks.validation.ts
  TaskFormValues,
  TaskQuery,
  TaskMovePayload,
  CreateTaskFormValues,

  // subtasks.validation.ts
  TaskSubtaskCreateValues,

  // labels.validation.ts
  LabelFormValues,

  // comments.validation.ts
  TaskCommentCreateValues,

  // attachments.validation.ts
  TaskAttachmentCreateValues,
};
