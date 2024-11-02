import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn, json } from "@tanstack/start";
import { and, desc, eq, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { getEvent } from "vinxi/http";
import { z } from "zod";
import { transform } from "~/lib/utils";
import { db } from "~/server/db";
import { category, payee, payeeKeyword } from "~/server/db/schema";

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
  delete: (onSuccess?: () => void) => useDeletePayeeMigration(onSuccess),
  addKeyword: (onSuccess?: () => void) =>
    useCreatePayeeKeywordMutation(onSuccess),
  removeKeyword: (onSuccess?: () => void) => useDeletePayeeKeyword(onSuccess),
} as const;

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

// create

export const createPayeeSchema = z.object({
  payeeName: z.string(),
  categoryId: z.string(),
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
          categoryId: params.categoryId,
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
          message: "Bad",
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
      await queryClient.cancelQueries({ queryKey: ["payees", "all"] });
      await queryClient.invalidateQueries({ queryKey: ["payees", "all"] });
      onSuccess?.();
    },
  });
};

// add keyword

export const createPayeeKeywordSchema = z.object({
  payeeId: z.string(),
  keyword: z.string(),
});

const createUserPayeeKeyword = createServerFn(
  "POST",
  async (params: z.infer<typeof createPayeeKeywordSchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .insert(payeeKeyword)
        .values({
          id: uuidv7(),
          userId: auth.user?.id,
          keyword: params.keyword,
          payeeId: params.payeeId,
        })
        .execute();

      return {
        message: "Created.",
      };
    } catch (e) {
      console.error(e);
      const message = (e as Error).message;
      return {
        message: message,
      };
    }
  },
);

export const useCreatePayeeKeywordMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserPayeeKeyword,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["payees", "all"] });
      await queryClient.invalidateQueries({ queryKey: ["payees", "all"] });
      onSuccess?.();
    },
  });
};

// delete keyword

export const deleteKeywordSchema = z.object({
  keyword: z.string(),
});

const deleteUserKeyword = createServerFn(
  "POST",
  async (params: z.infer<typeof deleteKeywordSchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    await db
      .delete(payeeKeyword)
      .where(
        and(
          eq(payeeKeyword.keyword, params.keyword),
          eq(payeeKeyword.userId, auth.user.id),
        ),
      )
      .execute();

    return json(
      {
        message: "Deleted.",
      },
      {
        status: 200,
      },
    );
  },
);

export const useDeletePayeeKeyword = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserKeyword,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["payees", "all"] });
      await queryClient.invalidateQueries({ queryKey: ["payees", "all"] });
      onSuccess?.();
    },
  });
};

// delete

export const deletePayeeSchema = z.object({
  id: z.string(),
});

const deleteUserPayee = createServerFn(
  "POST",
  async (params: z.infer<typeof deletePayeeSchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    await db
      .delete(payee)
      .where(and(eq(payee.id, params.id), eq(payee.userId, auth.user.id)))
      .execute();

    return json(
      {
        message: "Deleted.",
      },
      {
        status: 200,
      },
    );
  },
);

export const useDeletePayeeMigration = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserPayee,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["payees", "all"] });
      await queryClient.invalidateQueries({ queryKey: ["payees", "all"] });
      onSuccess?.();
    },
  });
};
