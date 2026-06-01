import {
  ActivityAction,
  ActivityActorType,
  ActivityEntityType,
} from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

export type ActivityLogInput = {
  projectId: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: ActivityAction;
  actorType: ActivityActorType;
  actorUserId?: string | null;
  actorClientId?: string | null;
  diff?: Prisma.InputJsonValue;
};

export function buildActivityCreateData(input: ActivityLogInput) {
  return {
    projectId: input.projectId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    actorType: input.actorType,
    actorUserId: input.actorUserId ?? null,
    actorClientId: input.actorClientId ?? null,
    diff: input.diff ?? undefined,
  } satisfies Prisma.ActivityLogUncheckedCreateInput;
}
