import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { TrashIcon } from "lucide-react";
import { CategoryBadge } from "~/components/categories/category-badge";
import { CreateCategoryForm } from "~/components/categories/create-category";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { categoriesMutations, categoriesQueries } from "~/services/categories";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      categoriesQueries.getUserCategories()
    );
  },
});

function CategoriesPage() {
  const { data } = useQuery(categoriesQueries.getUserCategories());

  const { mutate: editCategory } = categoriesMutations.edit();
  const { mutate: deleteCategory } = categoriesMutations.delete();

  return (
    <div>
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-12">
        {data?.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex justify-between items-center">
                <CategoryBadge name={category.name} color={category.color} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <TrashIcon />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this category and unassign and transactions that
                        were related to it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteCategory({
                            id: category.id,
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm">Include in Insights</Label>
                <Switch
                  checked={category.hideFromInsights || false}
                  onCheckedChange={(checked) => {
                    editCategory({
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
                    editCategory({
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
