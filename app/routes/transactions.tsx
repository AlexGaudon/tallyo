import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { transactionQueries } from "../services/transactions";

import { TransactionTable } from "@/components/transactions/table";
import { categoriesQueries } from "@/services/categories";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      transactionQueries.getUserTransactionsLimit(),
    );
    await ctx.context.queryClient.ensureQueryData(
      categoriesQueries.getUserCategories(),
    );
  },
});

function TransactionsPage() {
  const queryClient = useQueryClient();
  const { data, dataUpdatedAt } = useQuery(
    transactionQueries.getUserTransactions(),
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;

    queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });

    setMounted(true);
  }, [mounted]);

  return <TransactionTable data={data!} />;
}
