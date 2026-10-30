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
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { UseFormReturn } from "react-hook-form";
import { BlogPostFormValues } from "@/features/admin/blog/validations/blogs.validation";
import { BlogPostCategory } from "@/app/generated/prisma/enums";
import { TagsInput } from "@/components/molecules/tags-input";
import { FormInput } from "@/components/molecules/form-input";
import { Switch } from "@/components/atoms/switch";

interface BlogMetadataCardProps {
  form: UseFormReturn<BlogPostFormValues>;
}

export function BlogMetadataCard({ form }: BlogMetadataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata & Publishing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(BlogPostCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormInput
            control={form.control}
            name="readingTimeMinutes"
            label="Reading Time (Minutes)"
            type="number"
            min={1}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Add tags..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publishing Status Switch */}
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">Published Status</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
