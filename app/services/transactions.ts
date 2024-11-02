import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
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

export const transactionQueries = {
  getUserTransactions: () =>
    queryOptions({
      queryKey: ["transactions", "all"],
      queryFn: () => fetchUserTransactions(),
    }),
  getUserTransactionsPaginated: (page: number, filter?: string) =>
    queryOptions({
      queryKey: ["transactions", "paginated", page, filter],
      queryFn: () =>
        fetchUserPaginatedTransactions({
          page,
          filter,
        }),
    }),
} as const;

const fetchUserTransactions = createServerFn("GET", async (_, ctx) => {
  const event = getEvent();
  const auth = event.context.auth;

  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      code: 400,
    });
  }

  const transactions = await db
    .select(transactionSelectFields)
    .from(transaction)
    .where(eq(transaction.userId, auth.user?.id))
    .orderBy(asc(transaction.date))
    .leftJoin(category, eq(category.id, transaction.categoryId))
    .leftJoin(payee, eq(payee.id, transaction.payeeId));
  return transactions.map(transform);
});

export const fetchUserPaginatedTransactions = createServerFn(
  "GET",
  async (
    input: {
      page: number;
      filter: string | undefined;
    },
    ctx,
  ) => {
    const event = getEvent();
    const auth = event.context.auth;

    console.log(
      "Querying with page: ",
      input.page,
      " and filter: ",
      input.filter,
    );

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
        code: 400,
      });
    }

    let conditions = [eq(transaction.userId, auth.user?.id)];
    console.log(input);
    if (input.filter !== undefined) {
      conditions.push(
        ilike(transaction.vendor, `%${input.filter.toLowerCase()}%`),
      );
    }

    // Set limit to one more than the items you want to fetch
    const offset = (input.page - 1) * 10;
    const count = 10;
    const limit = count + 1;

    const transactions = await db
      .select(transactionSelectFields)
      .from(transaction)
      .where(and(...conditions))
      .orderBy(desc(transaction.date))
      .leftJoin(category, eq(category.id, transaction.categoryId))
      .leftJoin(payee, eq(payee.id, transaction.payeeId))
      .limit(limit)
      .offset(offset)
      .execute();

    // Determine hasMore based on the length of fetched data
    const hasMore = transactions.length > count;

    // Trim the extra item if it was fetched
    const paginatedTransactions = hasMore
      ? transactions.slice(0, count)
      : transactions;

    return {
      transactions: paginatedTransactions.map(transform),
      hasMore,
    };
  },
);
