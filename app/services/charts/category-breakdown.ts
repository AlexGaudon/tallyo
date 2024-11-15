import { transform } from "@/lib/utils";
import { db } from "@/server/db";
import { category, transaction } from "@/server/db/schema";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";

export const fetchCategoryBreakdownData = createServerFn({
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
      amount: sql<number>`SUM(${transaction.amount})`,
      name: category.name,
      color: category.color,
      period: sql<string>`to_char(${transaction.date}, 'YYYY-MM')`,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, auth.user.id),
        eq(category.treatAsIncome, false),
        eq(category.hideFromInsights, false),
      ),
    )
    .groupBy(category.id, sql`to_char(${transaction.date}, 'YYYY-MM')`)
    .leftJoin(category, eq(category.id, transaction.categoryId));

  return results.map(transform);
});
