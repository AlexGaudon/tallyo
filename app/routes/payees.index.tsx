import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { CategoryBadge } from "~/components/categories/category-badge";
import { Card, CardContent } from "~/components/ui/card";
import { payeeQueries } from "~/services/payees";

export const Route = createFileRoute("/payees/")({
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
        <Card
          className="hover:bg-accent/50 w-full max-w-md transition-colors cursor-pointer"
          key={payee.id}
        >
          <Link
            to="/payees/$id"
            params={{
              id: payee.id,
            }}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-2xl">{payee.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {payee.category && (
                          <CategoryBadge
                            link={false}
                            name={payee.category?.name}
                            color={payee.category?.color}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
