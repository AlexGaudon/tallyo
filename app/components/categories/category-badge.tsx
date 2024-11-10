import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { categoriesQueries } from "@/services/categories";
import { transactionMutations } from "@/services/transactions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type UncategorizedProps = {
  transactionId: string;
  name: string;
  color: string;
};

type CategorizedProps = {
  name: string;
  color: string;
  link?: boolean;
};

type CategoryBadgeProps = (UncategorizedProps | CategorizedProps) & {
  className?: string;
};

function CategoryPicker(props: { children: React.ReactNode; id: string }) {
  const { data: categories } = useQuery(categoriesQueries.getUserCategories());
  const client = useQueryClient();
  const { mutateAsync } = transactionMutations.updateCategory(async () => {
    console.log("mutate success");
    await client.cancelQueries({ queryKey: ["transactions", "all"] });
    await client.invalidateQueries({
      queryKey: ["transactions", "all"],
    });
  });

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogTrigger>
        <div className="flex justify-center items-center gap-x-2">
          {props.children} <PencilIcon />
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="lg:grid mx-auto w-fit">
          <div className="flex justify-center items-center py-2">
            <div className="gap-6 grid mx-auto w-[350px]">
              <DialogTitle>
                <div className="gap-2 grid text-center">
                  <h1 className="font-bold text-3xl">Assign a Category</h1>
                </div>
              </DialogTitle>
              <Select
                onValueChange={async (val) => {
                  setOpen(false);
                  await mutateAsync({
                    transactionId: props.id,
                    categoryId: val,
                  });
                }}
              >
                <SelectTrigger>{props.children}</SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <CategoryBadge
                        name={category.name}
                        color={category.color}
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryBadge(props: CategoryBadgeProps) {
  if ("transactionId" in props) {
    return (
      <CategoryPicker id={props.transactionId}>
        <CategoryBadge name={props.name} color={props.color} />
      </CategoryPicker>
    );
  }

  const element = (
    <div className="flex items-center">
      <div
        style={{
          background: props.color,
        }}
        className={`w-4 h-4 rounded-full mr-3`}
        aria-hidden="true"
      />
      <h2 className="text-sm">{props.name}</h2>
    </div>
  );

  if (props.link) {
    return <Link to="/categories">{element}</Link>;
  }

  return element;
}
