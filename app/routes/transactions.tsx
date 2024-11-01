import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { categoriesQueries } from "~/services/categories";
import { transactionQueries } from "~/services/transactions";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      transactionQueries.getUserTransactions()
    );
  },
});

function TransactionsPage() {
  const { data } = useQuery(categoriesQueries.getUserCategories());

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
