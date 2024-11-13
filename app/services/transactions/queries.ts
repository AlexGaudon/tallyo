import { transform } from "@/lib/utils";
import { db } from "@/server/db";
import { category, transaction } from "@/server/db/schema";
import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";

const transactionSelectFields = {
  id: transaction.id,
  amount: transaction.amount,
  vendor: transaction.vendor,
  date: transaction.date,
  description: transaction.description,
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
  getUserUnreviewedCount: () =>
    queryOptions({
      queryKey: ["transactions", "unreviewed"],
      queryFn: () => fetchUserUnreviewedCount(),
    }),
} as const;

export const fetchUserUnreviewedCount = createServerFn("GET", async (ctx) => {
  const event = getEvent();
  const auth = event.context.auth;

  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      code: 400,
    });
  }

  const unreviewed = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.reviewed, false),
        eq(transaction.userId, auth.user.id),
      ),
    );

  return unreviewed[0].count ?? 0;
});

export const fetchUserTransactions = createServerFn(
  "GET",
  async (limit: number, ctx) => {
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
      .orderBy(asc(transaction.reviewed), desc(transaction.date))
      .leftJoin(category, eq(category.id, transaction.categoryId));

    if (limit) query.limit(limit);

    const transactions = await query.execute();

    return transactions.map(transform);
  },
);
