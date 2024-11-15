import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateRandomPalette } from "@/lib/utils";
import { PipetteIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

import { useForm } from "@tanstack/react-form";
import { HexColorPicker } from "react-colorful";

import { useDebounce } from "@uidotdev/usehooks";

import { categoriesMutations } from "@/services/categories";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { CategoryBadge } from "./category-badge";

export function CreateCategoryForm() {
  const [colors, setColors] = useState(generateRandomPalette(5));

  const [preview, setPreview] = useState<{ text: string; color: string }>({
    text: "Preview",
    color: colors[0],
  });

  const debouncedPreview = useDebounce(preview, 100);

  const form = useForm({
    defaultValues: {
      categoryName: "",
      color: colors[0],
    },
    onSubmit: async ({ value }) => {
      setPreview({
        text: "Preview",
        color: colors[0],
      });
      await mutateAsync({
        data: {
          categoryName: value.categoryName,
          color: value.color,
        },
      });
    },
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync, isError, error } = categoriesMutations.create(() => {
    setOpen(false);
    form.reset();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(newValue) => {
        setOpen(newValue);
        setColors(generateRandomPalette(5));
      }}
    >
      <DialogTrigger asChild>
        <Card className="hover:bg-muted transition-colors cursor-pointer">
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
                    <h1 className="font-bold text-3xl">Create a Category</h1>
                    <p className="text-balance text-muted-foreground">
                      Enter a name and pick a color
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
                  {debouncedPreview.text !== "" && (
                    <div className="flex items-center space-x-2 mx-auto">
                      <CategoryBadge
                        link={false}
                        color={debouncedPreview.color}
                        name={debouncedPreview.text}
                      />
                    </div>
                  )}
                  <div>
                    <Label className="pb-20">Category Name</Label>
                    <form.Field
                      validators={{
                        onChange: ({ value, fieldApi }) =>
                          value.length <= 0 && fieldApi.state.meta.isTouched
                            ? "This field is required"
                            : undefined,
                      }}
                      name="categoryName"
                      children={(field) => (
                        <>
                          <Input
                            autoComplete="off"
                            aria-autocomplete="none"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              setPreview((val) => ({
                                ...val,
                                text: e.target.value,
                              }));
                              if (e.target.value === "") {
                                setPreview((val) => ({
                                  ...val,
                                  text: "Groceries",
                                }));
                              }
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
                    <form.Field
                      name="color"
                      children={(field) => (
                        <>
                          <div className="gap-x-2 gap-y-2 grid grid-cols-6">
                            {colors.map((s) => (
                              <div
                                suppressHydrationWarning={true}
                                key={s}
                                style={{
                                  background: s,
                                }}
                                className="rounded-md w-12 h-12 cursor-pointer active:scale-105"
                                onClick={() => {
                                  field.handleChange(s);
                                  setPreview((val) => ({
                                    ...val,
                                    color: s,
                                  }));
                                }}
                              />
                            ))}
                            <div className="bg-primary rounded-md w-12 h-12 cursor-pointer active:scale-105">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <PipetteIcon className="mx-2 my-2 w-8 h-8 text-black" />
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <HexColorPicker
                                    color={field.state.value}
                                    onChange={(e) => {
                                      field.handleChange(e);
                                      setPreview((val) => ({
                                        ...val,
                                        color: e,
                                      }));
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
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
