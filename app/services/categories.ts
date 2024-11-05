import { db } from "@/server/db";
import { category } from "@/server/db/schema";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn, json } from "@tanstack/start";
import { and, asc, eq } from "drizzle-orm";
import { getEvent } from "vinxi/http";
import { z } from "zod";

import { transform } from "@/lib/utils";
import { uuidv7 } from "uuidv7";


// types

export type Category = Awaited<ReturnType<typeof fetchUserCategories>>[0];

export const categoriesQueries = {
  getUserCategories: () =>
    queryOptions({
      queryKey: ["categories", "all"],
      queryFn: () => fetchUserCategories(),
    }),
} as const;

export const categoriesMutations = {
  create: (onSuccess?: () => void) => useCreateCategoryMutation(onSuccess),
  update: (onSuccess?: () => void) => useEditCategoryMutation(onSuccess),
  delete: (onSuccess?: () => void) => useDeleteCategoryMutation(onSuccess),
} as const;

const fetchUserCategories = createServerFn("GET", async (_, ctx) => {
  const event = getEvent();
  const auth = event.context.auth;

  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      code: 400,
    });
  }

  const categories = await db
    .select()
    .from(category)
    .where(eq(category.userId, auth.user?.id))
    .orderBy(asc(category.name));

  return categories.map(transform)
});

// create

export const createCategorySchema = z.object({
  categoryName: z.string(),
  color: z.string().startsWith("#"),
  hideFromInsights: z.boolean().optional(),
  treatAsIncome: z.boolean().optional(),
});

const createUserCategory = createServerFn(
  "POST",
  async (params: z.infer<typeof createCategorySchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .insert(category)
        .values({
          id: uuidv7(),
          userId: auth.user?.id,
          name: params.categoryName,
          ...params,
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

export const useCreateCategoryMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserCategory,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["categories", "all"] });
      await queryClient.invalidateQueries({ queryKey: ["categories", "all"] });
      onSuccess?.();
    },
  });
};

// edit

export const editCategorySchema = z.object({
  id: z.string(),
  hideFromInsights: z.boolean().optional(),
  treatAsIncome: z.boolean().optional(),
});

const editUserCategory = createServerFn(
  "POST",
  async (params: z.infer<typeof editCategorySchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .update(category)
        .set({
          hideFromInsights: params.hideFromInsights,
          treatAsIncome: params.treatAsIncome,
        })
        .where(
          and(eq(category.id, params.id), eq(category.userId, auth.user.id)),
        )
        .execute();

      return json(
        {
          message: "Updated.",
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

export const useEditCategoryMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editUserCategory,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
  });
};

// delete

export const deleteCategorySchema = z.object({
  id: z.string(),
});

const deleteUserCategory = createServerFn(
  "POST",
  async (params: z.infer<typeof deleteCategorySchema>) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .delete(category)
        .where(
          and(eq(category.id, params.id), eq(category.userId, auth.user.id)),
        )
        .execute();

      return {
        message: "Deleted.",
      }
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

export const useDeleteCategoryMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserCategory,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
  });
};
