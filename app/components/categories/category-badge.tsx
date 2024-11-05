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

type UncategorizedProps = {
  transactionId: string;
};

type CategorizedProps = {
  name: string;
  color: string;
  link?: boolean;
};

type CategoryBadgeProps = UncategorizedProps | CategorizedProps;

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

  return (
    <Select
      onValueChange={async (val) => {
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
            <CategoryBadge name={category.name} color={category.color} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CategoryBadge(props: CategoryBadgeProps) {
  if ("transactionId" in props) {
    return (
      <CategoryPicker id={props.transactionId}>
        <CategoryBadge name="Uncategorized" color="#ff0000" />
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
      ></div>
      <h2 className="text-base">{props.name}</h2>
    </div>
  );

  if (props.link) {
    return <Link to="/categories">{element}</Link>;
  }

  return element;
}
