import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, desc, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";
import { transform } from "~/lib/utils";
import { db } from "~/server/db";
import { category, payee, transaction } from "~/server/db/schema";

const transactionSelectFields = {
  id: transaction.id,
  amount: transaction.amount,
  vendor: transaction.vendor,
  date: transaction.date,
  payee: {
    id: payee.id,
    name: payee.name,
  },
  category: {
    id: category.id,
    name: category.name,
    color: category.color,
    hideFromInsights: category.hideFromInsights,
    treatAsIncome: category.treatAsIncome,
  },
  reviewed: transaction.reviewed,
  externalId: transaction.externalId,
  createdAt: transaction.createdAt,
};

export type Transaction = Awaited<ReturnType<typeof fetchUserTransactions>>[0];

export const transactionQueries = {
  getUserTransactions: () =>
    queryOptions({
      queryKey: ["transactions", "all"],
      queryFn: () => fetchUserTransactions(0),
    }),
  getUserTransactionsLimit: (limit = 100) =>
    queryOptions({
      queryKey: ["transactions", "all"],
      queryFn: () => fetchUserTransactions(limit),
    }),
  getUserTransactionsPaginated: (limit: number, offset: number) =>
    queryOptions({
      queryKey: ["transactions", "paginated", limit, offset],
      queryFn: () =>
        fetchUserPaginatedTransactions({
          limit, offset,
        }),
    }),
} as const;

export const fetchUserTransactions = createServerFn("GET", async (limit: number, ctx) => {
  const event = getEvent();
  const auth = event.context.auth;

  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      code: 400,
    });
  }

  const query = db
    .select(transactionSelectFields)
    .from(transaction)
    .where(eq(transaction.userId, auth.user?.id))
    .orderBy(desc(transaction.date))
    .leftJoin(category, eq(category.id, transaction.categoryId))
    .leftJoin(payee, eq(payee.id, transaction.payeeId));

  if (limit)
    query.limit(limit)

  const transactions = await query.execute();

  return transactions.map(transform);
});

export const fetchUserPaginatedTransactions = createServerFn(
  "GET",
  async (
    input: {
      limit: number,
      offset: number
    },
    ctx,
  ) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
        code: 400,
      });
    }

    let conditions = [eq(transaction.userId, auth.user?.id)];


    const transactions = await db
      .select(transactionSelectFields)
      .from(transaction)
      .where(and(...conditions))
      .orderBy(desc(transaction.date))
      .leftJoin(category, eq(category.id, transaction.categoryId))
      .leftJoin(payee, eq(payee.id, transaction.payeeId))
      .limit(input.limit + 1)
      .offset(input.offset)
      .execute();

    // Determine hasMore based on the length of fetched data
    const hasMore = transactions.length > input.limit;

    console.log(transactions.at(-1)?.id)

    // Trim the extra item if it was fetched
    const paginatedTransactions = hasMore
      ? transactions.slice(0, input.limit)
      : transactions;

    const total = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(transaction)
      .where(and(...conditions)).execute()

    return {
      transactions: paginatedTransactions.map(transform),
      hasMore,
      total: total[0].count
    };
  },
);
