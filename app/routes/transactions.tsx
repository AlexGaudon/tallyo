import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { transactionQueries } from "../services/transactions";

import { TransactionTable } from "~/components/transactions/table";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      transactionQueries.getUserTransactions(),
    );
  },
});

function TransactionsPage() {
  const { data } = useQuery({
    ...transactionQueries.getUserTransactions(),
  });

  return (
    <>
      <TransactionTable data={data!} />
    </>
  );
}
