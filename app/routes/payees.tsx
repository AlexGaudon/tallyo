import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CategoryBadge } from "~/components/categories/category-badge";
import { Card, CardHeader } from "~/components/ui/card";
import { payeeQueries } from "~/services/payees";

export const Route = createFileRoute("/payees")({
  component: PayeesRoute,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(payeeQueries.getUserPayees());
  },
});

function PayeesRoute() {
  const { data } = useQuery(payeeQueries.getUserPayees());

  return (
    <div>
      {data?.map((payee) => (
        <Card key={payee.id}>
          <CardHeader>
            {payee.name}

            {payee.category && (
              <CategoryBadge
                link
                name={payee.category.name}
                color={payee.category.color}
              />
            )}
          </CardHeader>
        </Card>
      ))}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
