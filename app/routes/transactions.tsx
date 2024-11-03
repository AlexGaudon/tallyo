import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import AmountDisplay from "~/components/transactions/amount-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { transactionQueries } from "../services/transactions";

import { z } from "zod";
import { CategoryBadge } from "~/components/categories/category-badge";
import { Button } from "~/components/ui/button";

const transactionSearchSchema = z.object({
  page: z.number().default(1),
  filter: z.string().default("").optional(),
});

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      transactionQueries.getUserTransactionsPaginated(
        ctx.search.page,
        ctx.search.filter,
      ),
    );
  },
  validateSearch: transactionSearchSchema,
});

function TransactionsPage() {
  const search = Route.useSearch();

  const navigate = Route.useNavigate();

  const client = useQueryClient();
  client.ensureQueryData(
    transactionQueries.getUserTransactionsPaginated(
      search.page + 1,
      search.filter,
    ),
  );

  const { data } = useQuery(
    transactionQueries.getUserTransactionsPaginated(search.page, search.filter),
  );

  return (
    <div>
      <Button
        disabled={!data?.hasMore}
        onClick={() => {
          navigate({
            to: ".",
            search: {
              page: search.page + 1,
              filter: search.filter,
            },
          });
        }}
      >
        Next Page
      </Button>
      <Button
        disabled={search.page <= 1}
        onClick={() => {
          navigate({
            to: ".",
            search: {
              page: (() => {
                if (search.page === 1) {
                  return 1;
                }
                return search.page - 1;
              })(),
              filter: search.filter,
            },
          });
        }}
      >
        Prev Page
      </Button>

      <div className="sm:block hidden">
        <h1>desktop</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead className="w-[180px]">Vendor</TableHead>
              <TableHead className="w-[180px]">Payee</TableHead>
              <TableHead className="w-[180px]">Amount</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Reviewed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.transactions.map((transaction) => {
              const date = new Date(transaction.date)
                .toISOString()
                .split("T")[0];
              return (
                <TableRow key={transaction.id}>
                  <TableCell>{date}</TableCell>
                  <TableCell>{transaction.vendor}</TableCell>
                  <TableCell>{transaction.payee?.name}</TableCell>
                  <TableCell>
                    <AmountDisplay amount={transaction.amount} />
                  </TableCell>
                  <TableCell>
                    {transaction.category?.id === null ? (
                      <CategoryBadge
                        name="Uncategorized"
                        color="#ff0000"
                        link={false}
                      />
                    ) : (
                      <CategoryBadge
                        name={transaction.category?.name!}
                        color={transaction.category?.color!}
                        link={true}
                      />
                    )}
                  </TableCell>
                  <TableCell>{transaction.reviewed.toString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="sm:hidden">
        <h1>mobile</h1>
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
