import { CategoryBadge } from "@/components/categories/category-badge";
import { CreateCategoryForm } from "@/components/categories/create-category";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DangerConfirm } from "@/components/ui/danger-confirm";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { categoriesMutations, categoriesQueries } from "@/services/categories";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { TrashIcon } from "lucide-react";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      categoriesQueries.getUserCategories(),
    );
  },
});

function CategoriesPage() {
  const { data } = useQuery(categoriesQueries.getUserCategories());

  const { mutate: updateCategory } = categoriesMutations.update();
  const { mutateAsync: deleteCategory } = categoriesMutations.delete();

  const { toast } = useToast();

  return (
    <div className="my-2">
      <Toaster />
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-12">
        {data?.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex justify-between items-center">
                <CategoryBadge
                  name={category.name}
                  color={category.color}
                  link={false}
                />
                <DangerConfirm
                  onConfirm={async () => {
                    const res = await deleteCategory({
                      id: category.id,
                    });
                    toast({
                      description: res.message,
                      variant: res.ok ? "default" : "destructive",
                    });
                  }}
                >
                  <Button variant="ghost">
                    <TrashIcon />
                  </Button>
                </DangerConfirm>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm">Hide From Insights</Label>
                <Switch
                  checked={category.hideFromInsights || false}
                  onCheckedChange={(checked) => {
                    updateCategory({
                      id: category.id,
                      hideFromInsights: checked,
                    });
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm">Treat as Income</Label>
                <Switch
                  checked={category.treatAsIncome || false}
                  onCheckedChange={(checked) => {
                    updateCategory({
                      id: category.id,
                      treatAsIncome: checked,
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <CreateCategoryForm />
      </div>
    </div>
  );
}
