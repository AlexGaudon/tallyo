import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn, json } from "@tanstack/start";
import { and, desc, eq, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { getEvent } from "vinxi/http";
import { z } from "zod";
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

export type UserPayee = Awaited<ReturnType<typeof fetchUserPayeeById>>;

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
    .limit(1)
    .execute();

  return payees
    .map((x) => ({
      ...x,
      keywords: x.keywords.at(0) !== null ? x.keywords : [],
    }))
    .map(transform)[0];
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


export const payeeMutations = {
  create: (onSuccess?: () => void) => useCreatePayeeMutation(onSuccess),
} as const;

// create

export const createPayeeSchema = z.object({
  payeeName: z.string(),
  categoryId: z.string()
});


const createUserPayee = createServerFn(
  "POST",
  async (params: z.infer<typeof createPayeeSchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .insert(payee)
        .values({
          id: uuidv7(),
          userId: auth.user?.id,
          name: params.payeeName,
          categoryId: params.categoryId
        })
        .execute();
      return json(
        {
          message: "Created.",
        },
        {
          status: 200,
        },
      );
    } catch (e) {
      console.error(e);
      const message = (e as Error).message;
      return json(
        {
          message: message.includes("duplicate key value")
            ? "A category with this name already exists."
            : message,
        },
        {
          status: 500,
        },
      );
    }
  },
);

export const useCreatePayeeMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserPayee,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["payees", 'all'] });
      await queryClient.invalidateQueries({ queryKey: ["payees", 'all'] });
      onSuccess?.();
    },
  });
};