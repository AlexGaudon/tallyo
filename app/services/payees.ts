import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { getEvent } from "vinxi/http";
import { transform } from "~/lib/utils";
import { db } from "~/server/db";
import { category, payee } from "~/server/db/schema";

const fetchUserPayees = createServerFn("GET", async (_, ctx) => {
  const event = getEvent();
  const auth = event.context.auth;

  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      code: 400,
    });
  }

  const payees = await db
    .select({
      id: payee.id,
      name: payee.name,
      userId: payee.userId,
      category: {
        id: category.id,
        color: category.color,
        name: category.name
      }
    })
    .from(payee)
    .where(eq(payee.userId, auth.user.id))
    .leftJoin(category, eq(payee.categoryId, category.id))
    .execute();

  return payees.map(transform);
});

export const payeeQueries = {
  getUserPayees: () =>
    queryOptions({
      queryKey: ["payees", "all"],
      queryFn: () => fetchUserPayees(),
    }),
} as const;
