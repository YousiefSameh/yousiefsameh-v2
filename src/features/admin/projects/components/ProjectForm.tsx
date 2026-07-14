"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Loader2 } from "lucide-react";
import {
  ProjectFormValues,
  projectSchema,
} from "@/validations/projects.validation";
import {
  useCreateProject,
  useUpdateProject,
} from "@/features/admin/projects/hooks";
import { toast } from "sonner";
import { BasicInfoCard } from "@/features/admin/projects/components";
import { TechStackCard } from "@/features/admin/projects/components";
import { ImagesCard } from "@/features/admin/projects/components";
import { DescriptionCard } from "@/features/admin/projects/components";
import { DisplaySettingsCard } from "@/features/admin/projects/components";
import {
  Client,
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectType,
} from "@/app/generated/prisma/browser";

interface ProjectFormProps {
  project?: Project;
  clients?: Client[];
}

export function ProjectForm({ project, clients = [] }: ProjectFormProps) {
  const router = useRouter();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(
    project?.id ?? "",
  );

  const isPending = isCreating || isUpdating;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      shortDescription: project?.shortDescription ?? "",
      fullDescription: project?.fullDescription ?? {},
      thumbnailUrl: project?.thumbnailUrl ?? "",
      featuredImageUrl: project?.featuredImageUrl ?? "",
      galleryImages: project?.galleryImages ?? [],
      category: project?.category ?? ProjectCategory.LANDING_PAGE,
      techStack: project?.techStack ?? [],
      status: project?.status ?? ProjectStatus.IN_PROGRESS,
      liveUrl: project?.liveUrl ?? "",
      repoUrl: project?.repoUrl ?? "",
      isFeatured: project?.isFeatured ?? false,
      displayOrder: project?.displayOrder ?? 0,
      year: project?.year ?? new Date().getFullYear(),
      type: project?.type ?? ProjectType.PORTFOLIO,
      clientId: project?.clientId ?? null,
    },
  });

  function onSubmit(data: ProjectFormValues) {
    // Auto-set thumbnailUrl from featuredImageUrl if not set
    if (!data.thumbnailUrl && data.featuredImageUrl) {
      data.thumbnailUrl = data.featuredImageUrl;
    }

    // Clear clientId for portfolio projects
    if (data.type === ProjectType.PORTFOLIO) {
      data.clientId = null;
    }

    if (project) {
      updateProject(data, {
        onSuccess: () => {
          toast.success("Project updated successfully");
          router.push(`/admin/projects/${project.id}/settings`);
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createProject(data, {
        onSuccess: () => {
          toast.success("Project created successfully");
          router.push("/admin/projects");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoCard form={form} clients={clients} />
        <TechStackCard form={form} />
        <ImagesCard form={form} />
        <DescriptionCard form={form} />
        <DisplaySettingsCard form={form} />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : project ? (
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
