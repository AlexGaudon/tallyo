import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

import { useForm } from "@tanstack/react-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesQueries } from "@/services/categories";
import { payeeMutations } from "@/services/payees";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { CategoryBadge } from "../categories/category-badge";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

export function CreatePayee() {
  const form = useForm({
    defaultValues: {
      payeeName: "",
      categoryId: "",
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        payeeName: value.payeeName,
        categoryId: value.categoryId,
      });
    },
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync, isError, error } = payeeMutations.create(() => {
    setOpen(false);
    form.reset();
  });

  const { data: categories } = useQuery(categoriesQueries.getUserCategories());

  return (
    <Dialog
      open={open}
      onOpenChange={(newValue) => {
        setOpen(newValue);
      }}
    >
      <DialogTrigger asChild>
        <Card className="hover:bg-muted max-w-md transition-colors cursor-pointer">
          <CardContent className="flex justify-center items-center pt-6">
            <PlusIcon className="w-24 h-24 text-muted-foreground" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="lg:grid mx-auto w-fit">
            {isError && <p>{error.message}</p>}
            <div className="flex justify-center items-center py-2">
              <div className="gap-6 grid mx-auto w-[350px]">
                <DialogTitle>
                  <div className="gap-2 grid text-center">
                    <h1 className="font-bold text-3xl">Create a Payee</h1>
                    <p className="text-balance text-muted-foreground">
                      Pick a name and designate a default category.
                    </p>
                  </div>
                </DialogTitle>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-2"
                >
                  <div>
                    <Label className="pb-20">Payee Name</Label>
                    <form.Field
                      validators={{
                        onChange: ({ value, fieldApi }) =>
                          value.length <= 0 && fieldApi.state.meta.isTouched
                            ? "This field is required"
                            : undefined,
                      }}
                      name="payeeName"
                      children={(field) => (
                        <>
                          <Input
                            autoComplete="off"
                            aria-autocomplete="none"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                            }}
                          />
                          {field.state.meta.errors ? (
                            <em role="alert" className="text-red-400">
                              {field.state.meta.errors.join(", ")}
                            </em>
                          ) : null}
                        </>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="pb-20">Default Category</Label>
                    <form.Field
                      validators={{
                        onChange: ({ value, fieldApi }) => {
                          if (
                            fieldApi.state.meta.isTouched &&
                            value.length === 0
                          ) {
                            return "This is required";
                          }

                          return undefined;
                        },
                      }}
                      name="categoryId"
                      children={(field) => (
                        <>
                          <Select
                            required
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {categories?.map((category) => (
                                  <SelectItem
                                    value={category.id}
                                    key={category.id}
                                  >
                                    <CategoryBadge
                                      link={false}
                                      name={category.name}
                                      color={category.color}
                                    />
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {field.state.meta.errors ? (
                            <em role="alert" className="text-red-400">
                              {field.state.meta.errors.join(", ")}
                            </em>
                          ) : null}
                        </>
                      )}
                    />
                  </div>
                  <div className="float-right">
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
