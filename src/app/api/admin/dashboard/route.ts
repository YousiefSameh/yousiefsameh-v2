import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { apiError, apiSuccess } from "@/lib/api";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { ActivityLog, Project, Task } from "@/app/generated/prisma/client";

export type DashboardStats = {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  dueTodayCount: number;
  overdueCount: number;
  recentProjects: Pick<Project, "id" | "title" | "status" | "slug" | "thumbnailUrl" | "updatedAt">[];
  dueTasks: (Pick<Task, "id" | "title" | "dueDate" | "priority" | "status"> & { project: Pick<Project, "id" | "title"> })[];
  overdueTasks: (Pick<Task, "id" | "title" | "dueDate" | "priority" | "status"> & { project: Pick<Project, "id" | "title"> })[];
  recentActivity: ActivityLog[];
};

/**
 * @summary Get dashboard statistics
 */
export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return apiError("Unauthorized", 401);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalProjects,
      activeProjects,
      totalClients,
      dueTodayCount,
      overdueCount,
      recentProjects,
      dueTasks,
      overdueTasks,
      recentActivity,
    ] = await prisma.$transaction([
      // Total projects count
      prisma.project.count(),
      // Active (IN_PROGRESS) projects count
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      // Total clients
      prisma.client.count(),
      // Tasks due today (not in DONE or REVIEW)
      prisma.task.count({
        where: {
          dueDate: { gte: startOfToday, lte: endOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.REVIEW] },
        },
      }),
      // Overdue tasks (past due, not done/review)
      prisma.task.count({
        where: {
          dueDate: { lt: startOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.REVIEW] },
        },
      }),
      // 5 most recently updated projects
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, slug: true, thumbnailUrl: true, updatedAt: true },
      }),
      // Tasks due today (full detail)
      prisma.task.findMany({
        where: {
          dueDate: { gte: startOfToday, lte: endOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.REVIEW] },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: {
          id: true, title: true, dueDate: true, priority: true, status: true,
          project: { select: { id: true, title: true } },
        },
      }),
      // Overdue tasks (full detail)
      prisma.task.findMany({
        where: {
          dueDate: { lt: startOfToday },
          status: { notIn: [TaskStatus.DONE, TaskStatus.REVIEW] },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: {
          id: true, title: true, dueDate: true, priority: true, status: true,
          project: { select: { id: true, title: true } },
        },
      }),
      // 10 most recent activity log entries (across all projects)
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const stats: DashboardStats = {
      totalProjects,
      activeProjects,
      totalClients,
      dueTodayCount,
      overdueCount,
      recentProjects,
      dueTasks,
      overdueTasks,
      recentActivity,
    };

    return apiSuccess(stats, "Dashboard stats fetched successfully");
  } catch (error) {
    console.error("[GET /api/admin/dashboard]", error);
    return apiError("Failed to fetch dashboard stats", 500);
  }
}
