import { transform } from "@/lib/utils";
import { db } from "@/server/db";
import { category, transaction } from "@/server/db/schema";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, asc, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";

export const fetchIncomeVsExpenseData = createServerFn(
  "GET",
  async (_, ctx) => {
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
        period: sql<string>`to_char(${transaction.date}, 'YYYY-MM')`,
        income: sql<number>`SUM(CASE WHEN ${category.treatAsIncome} THEN ${transaction.amount} ELSE 0 END)`,
        expenses: sql<number>`SUM(CASE WHEN NOT ${category.treatAsIncome} THEN ${transaction.amount} ELSE 0 END)`,
      })
      .from(transaction)
      .leftJoin(category, eq(category.id, transaction.categoryId))
      .where(
        and(
          eq(transaction.userId, auth.user.id),
          eq(category.hideFromInsights, false),
        ),
      )
      .orderBy(asc(sql`to_char(${transaction.date}, 'YYYY-MM')`))
      .groupBy(sql`to_char(${transaction.date}, 'YYYY-MM')`);

    return results.map(transform);
  },
);
