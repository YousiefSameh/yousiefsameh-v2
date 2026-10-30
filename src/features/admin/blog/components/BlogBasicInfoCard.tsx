import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { UseFormReturn } from "react-hook-form";
import { BlogPostFormValues } from "@/features/admin/blog/validations/blogs.validation";
import { FormInput } from "@/components/molecules/form-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Textarea } from "@/components/atoms/textarea";
import { ImageUpload } from "@/components/molecules/upload-images/ImageUpload";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Wand2 } from "lucide-react";
import { generateSlug } from "@/lib/utils";

interface BlogBasicInfoCardProps {
  form: UseFormReturn<BlogPostFormValues>;
}

export function BlogBasicInfoCard({ form }: BlogBasicInfoCardProps) {

  const handleGenerateSlug = () => {
    const title = form.getValues("title");
    if (!title) return;
    form.setValue("slug", generateSlug(title), { shouldValidate: true });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="featuredImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={{ folder: "blogs" }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={form.control}
            name="title"
            label="Title *"
            placeholder="My Awesome Blog Post"
            required
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Slug *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="my-awesome-blog-post" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSlug}
                    className="shrink-0 h-full gap-2"
                    title="Generate from title"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span className="hidden lg:inline">Generate</span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short summary of the post..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}