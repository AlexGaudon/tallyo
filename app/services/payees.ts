import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, desc, eq, sql } from "drizzle-orm";
import { getEvent } from "vinxi/http";
import { transform } from "~/lib/utils";
import { db } from "~/server/db";
import { category, payee, payeeKeyword } from "~/server/db/schema";

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
        name: category.name,
      },
      keywords: sql<string[]>`ARRAY_AGG(${payeeKeyword.keyword})`.as(
        "keywords",
      ),
    })
    .from(payee)
    .where(eq(payee.userId, auth.user.id))
    .leftJoin(category, eq(payee.categoryId, category.id))
    .groupBy(payee.id, category.id)
    .leftJoin(payeeKeyword, eq(payeeKeyword.payeeId, payee.id))
    .orderBy(desc(category.name))
    .execute();

  return payees
    .map((x) => ({
      ...x,
      keywords: x.keywords.at(0) !== null ? x.keywords : [],
    }))
    .map(transform);
});

const fetchUserPayeeById = createServerFn("GET", async (id: string, ctx) => {
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
        name: category.name,
      },
      keywords: sql<string[]>`ARRAY_AGG(${payeeKeyword.keyword})`.as(
        "keywords",
      ),
    })
    .from(payee)
    .where(and(eq(payee.userId, auth.user.id), eq(payee.id, id)))
    .leftJoin(category, eq(payee.categoryId, category.id))
    .groupBy(payee.id, category.id)
    .leftJoin(payeeKeyword, eq(payeeKeyword.payeeId, payee.id))
    .orderBy(desc(category.name))
    .execute();

  return payees
    .map((x) => ({
      ...x,
      keywords: x.keywords.at(0) !== null ? x.keywords : [],
    }))
    .map(transform);
});

export const payeeQueries = {
  getUserPayees: () =>
    queryOptions({
      queryKey: ["payees", "all"],
      queryFn: () => fetchUserPayees(),
    }),
  getUserPayeeById: (id: string) =>
    queryOptions({
      queryKey: ["payees", "id", id],
      queryFn: () => fetchUserPayeeById(id),
    }),
} as const;
