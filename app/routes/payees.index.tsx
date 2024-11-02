import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, ShoppingBag, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";
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
import { DangerConfirm } from "~/components/ui/danger-confirm";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
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

  const [open, setOpen] = useState(false);

  const [newKeyword, setNewKeyword] = useState("");

  const { mutate: addKeyword } = payeeMutations.addKeyword();
  const { mutate: removeKeyword } = payeeMutations.removeKeyword();

  return (
    <Card
      className="hover:bg-accent/50 w-full max-w-md transition-colors cursor-pointer"
      key={props.id}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <Dialog
              open={open}
              onOpenChange={(newValue) => {
                setOpen(newValue);
              }}
            >
              <DialogTrigger asChild>
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
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>
                  <div className="gap-2 grid text-center">
                    <h1 className="font-bold text-3xl">
                      {props.name} Keywords
                    </h1>
                  </div>
                </DialogTitle>
                <ul className="flex flex-wrap gap-2">
                  {props.keywords.map((keyword) => (
                    <li
                      key={keyword}
                      className="flex items-center bg-secondary px-3 py-1 rounded-full text-sm"
                    >
                      {keyword}
                      <DangerConfirm
                        onConfirm={() =>
                          removeKeyword({
                            keyword,
                          })
                        }
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-0 w-4 h-4"
                        >
                          <XIcon className="w-3 h-3" />
                          <span className="sr-only">Remove {keyword}</span>
                        </Button>
                      </DangerConfirm>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Input
                    id="new-keyword"
                    placeholder="Enter new keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="col-span-3"
                  />
                  <Button
                    size="sm"
                    className="col-span-1"
                    onClick={() => {
                      if (newKeyword !== "") {
                        addKeyword({
                          payeeId: props.id,
                          keyword: newKeyword,
                        });
                      }
                      setNewKeyword("");
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="sr-only">Add Keyword</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
