import { transform } from "@/lib/utils";
import { db } from "@/server/db";
import { category, transaction } from "@/server/db/schema";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";

export const fetchStatsData = createServerFn({
  method: "GET",
}).handler(async (ctx) => {
  const event = getEvent();
  const auth = event.context.auth;

  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      code: 400,
    });
  }

  const results = await db
    .select({
      count: sql<number>`COUNT(*)`,
      income: sql<number>`ABS(SUM(CASE WHEN ${category.treatAsIncome} THEN ${transaction.amount} ELSE 0 END))`,
      expenses: sql<number>`ABS(SUM(CASE WHEN NOT ${category.treatAsIncome} THEN ${transaction.amount} ELSE 0 END))`,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, auth.user.id),
        eq(category.hideFromInsights, false),
      ),
    )
    .leftJoin(category, eq(category.id, transaction.categoryId));

  return results.map(transform)[0];
});
