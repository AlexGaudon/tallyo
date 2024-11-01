import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ShoppingBag, TrashIcon } from "lucide-react";
import { CategoryBadge } from "~/components/categories/category-badge";
import { CreatePayee } from "~/components/payees/create-payee";
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
import { categoriesQueries } from "~/services/categories";
import { payeeMutations, payeeQueries, UserPayee } from "~/services/payees";

export const Route = createFileRoute("/payees/")({
  component: PayeesRoute,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(payeeQueries.getUserPayees());
    await ctx.context.queryClient.ensureQueryData(
      categoriesQueries.getUserCategories(),
    );
  },
});

function PayeeDetail(props: UserPayee) {
  const { mutate: deletePayee } = payeeMutations.delete();
  return (
    <Card
      className="hover:bg-accent/50 w-full max-w-md transition-colors cursor-pointer"
      key={props.id}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <Link
              to="/payees/$id"
              params={{
                id: props.id,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-2xl">{props.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {props.category && (
                      <CategoryBadge
                        link={false}
                        name={props.category?.name}
                        color={props.category?.color}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this category and unassign and transactions that were related
                  to it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deletePayee({
                      id: props.id,
                    });
                  }}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function PayeesRoute() {
  const { data } = useQuery(payeeQueries.getUserPayees());

  return (
    <div className="my-2">
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-12">
        {data?.map((payee) => <PayeeDetail key={payee.id} {...payee} />)}
        <CreatePayee />
      </div>
    </div>
  );
}
