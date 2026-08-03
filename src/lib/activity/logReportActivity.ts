import prisma from "@/lib/prisma";
import { buildActivityCreateData } from "@/lib/activity/log";
import {
  ActivityAction,
  ActivityActorType,
  ActivityEntityType,
} from "@/app/generated/prisma/enums";
import { PrismaClient, Prisma } from "@/app/generated/prisma/client";

/**
 * Shape of one field change inside the `diff` JSON column.
 * Both `from` and `to` are typed as `unknown` because field values vary
 * (strings, dates, booleans, arrays) and are stored as raw JSON.
 */
export type DiffEntry = { from: unknown; to: unknown };

/**
 * The full diff object — a map of field names to their before/after values.
 * e.g. { status: { from: "TODO", to: "DONE" } }
 */
export type ActivityDiff = Record<string, DiffEntry>;

/**
 * The transaction client type exposed by Prisma's $transaction callback.
 * Using Omit<PrismaClient, ...> matches what Prisma passes to $transaction
 * callbacks without requiring @prisma/client/runtime internals.
 */
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface LogTaskActivityOptions {
  projectId:   string;
  reportId:      string;
  action:      ActivityAction;
  actorUserId: string;
  diff?:       ActivityDiff;
}

/**
 * Write one ActivityLog record for a task mutation.
 *
 * Always pass the transaction client (`tx`) when calling from inside a
 * `prisma.$transaction` callback — this ensures the log is written atomically
 * with the mutation it describes and rolls back together on failure.
 *
 * Pass the bare `prisma` client only for fire-and-forget logging outside
 * a transaction (e.g. soft deletes where the mutation has already committed).
 *
 * @param client - A Prisma transaction client or the global prisma instance
 * @param options - Task context, action enum, actor ID, and optional diff
 */
export async function logReportActivity(
  client: TransactionClient | typeof prisma,
  options: LogTaskActivityOptions,
): Promise<void> {
  const { projectId, reportId, action, actorUserId, diff } = options;

  await client.activityLog.create({
    data: buildActivityCreateData({
      projectId,
      entityType: ActivityEntityType.REPORT,
      entityId:   reportId,
      action,
      actorType:  ActivityActorType.ADMIN,
      actorUserId,
      diff: diff as Prisma.InputJsonValue | undefined,
    }),
  });
}