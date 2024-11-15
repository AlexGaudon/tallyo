import { transform } from "@/lib/utils";
import { db } from "@/server/db";
import { category, transaction } from "@/server/db/schema";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";

export const fetchMonthlyExpenseData = createServerFn({
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

  const conditions = [];

  conditions.push(eq(transaction.userId, auth.user!.id));
  conditions.push(eq(category.hideFromInsights, false));

  const results = await db
    .select({
      category: category.name,
      period: sql<string>`to_char(${transaction.date}, 'YYYY-MM')`,
      amount: sql<number>`SUM(AMOUNT)`,
      isIncome: sql<boolean>`${category.treatAsIncome}`,
    })
    .from(transaction)
    .where(and(...conditions))
    .leftJoin(category, eq(category.id, transaction.categoryId))
    .groupBy(
      category.name,
      sql`to_char(${transaction.date}, 'YYYY-MM')`,
      category.treatAsIncome,
    );

  return results.map(transform);
});
