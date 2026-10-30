import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/atoms/form";
import { UseFormReturn } from "react-hook-form";
import { BlogPostFormValues } from "@/features/admin/blog/validations/blogs.validation";
import { BlogEditor } from "./BlogEditor";

interface BlogEditorCardProps {
  form: UseFormReturn<BlogPostFormValues>;
}

export function BlogEditorCard({ form }: BlogEditorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <BlogEditor
                  initialContent={field.value}
                  onChange={(json) => field.onChange(json)}
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