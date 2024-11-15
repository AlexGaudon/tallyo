import { db } from "@/server/db";
import { transaction, TransactionSchema } from "@/server/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, desc, eq, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { getEvent } from "vinxi/http";
import { z } from "zod";
import { Category } from "../categories";
import { Transaction } from "./queries";

export const transactionMutations = {
  updateCategory: (onSuccess?: () => void) =>
    useAddTransactionCategory(onSuccess),
  updateReviewed: (onSuccess?: () => void) =>
    useUpdateTransactionReviewed(onSuccess),
  splitTransaction: () => useSplitTransaction(),
} as const;

// split transaction

export const splitTransactionSchema = z.object({
  transactionId: z.string(),
  firstAmount: z.number(),
  secondAmount: z.number(),
});

export const splitTransaction = createServerFn({ method: "POST" })
  .validator(splitTransactionSchema.parse)
  .handler(async (ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    const existingTransaction = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, auth.user.id),
          eq(transaction.id, ctx.data.transactionId),
        ),
      );

    if (!existingTransaction || existingTransaction.length === 0) {
      return {
        ok: false,
        message: "Error splitting transaction. Original transaction not found.",
      };
    }

    const newTransaction: TransactionSchema = {
      id: uuidv7(),
      userId: auth.user.id,
      date: existingTransaction[0].date,
      amount: ctx.data.firstAmount,
      categoryId: existingTransaction[0].categoryId,
      vendor: existingTransaction[0].vendor,
    };

    await db.insert(transaction).values(newTransaction).execute();

    await db.update(transaction).set({
      ...existingTransaction[0],
      amount: ctx.data.secondAmount,
    });

    return {
      ok: true,
      message: "Split transaction",
    };
  });

export const useSplitTransaction = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: splitTransaction,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: ["transactions", "all"] });
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
    onSuccess: () => onSuccess?.(),
  });
};

// suggest category

export const suggestCategorySchema = z.string();

export const suggestCategory = createServerFn({ method: "POST" })
  .validator(suggestCategorySchema.parse)
  .handler(async (ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    const trans = await db
      .select()
      .from(transaction)
      .where(
        and(eq(transaction.userId, auth.user.id), eq(transaction.id, ctx.data)),
      )
      .limit(1)
      .execute();

    if (trans === null) {
      return null;
    }

    const thisTransaction = trans.at(0);

    const suggestedCategory = await getRecommendedCategoryId(
      thisTransaction!.vendor,
    );

    return suggestedCategory;
  });

// update reviewed

export const updateReviewedSchema = z.object({
  transactionId: z.string(),
  reviewed: z.boolean(),
});

export const $updateTransactionReviewed = createServerFn({
  method: "POST",
})
  .validator(updateReviewedSchema)
  .handler(async (ctx) => {
    console.log(ctx);
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .update(transaction)
        .set({
          reviewed: ctx.data.reviewed,
        })
        .where(
          and(
            eq(transaction.id, ctx.data.transactionId),
            eq(transaction.userId, auth.user.id),
          ),
        )
        .execute();
      return true;
    } catch (e) {
      return {
        message: (e as Error).message,
      };
    }
  });

export const useUpdateTransactionReviewed = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: $updateTransactionReviewed,
    onMutate: async (ctx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", "all"] });

      const previousTransactions = queryClient.getQueryData([
        "transactions",
        "all",
      ]);

      queryClient.setQueryData(
        ["transactions", "all"],
        (old: Transaction[] = []) => {
          return old.map((transaction) =>
            transaction.id === ctx.data.transactionId
              ? {
                  ...transaction,
                  reviewed: ctx.data.reviewed,
                }
              : transaction,
          );
        },
      );

      return { previousTransactions };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["transactions", "all"],
        context?.previousTransactions,
      );
    },
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: ["transactions", "all"] });
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
    onSuccess: () => onSuccess?.(),
  });
};

// add category

export const addTransactionCategorySchema = z.object({
  transactionId: z.string(),
  categoryId: z.string(),
});

const addTransactionCategory = createServerFn({ method: "POST" })
  .validator(addTransactionCategorySchema.parse)
  .handler(async (ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }

    try {
      await db
        .update(transaction)
        .set({
          categoryId: ctx.data.categoryId,
        })
        .where(
          and(
            eq(transaction.userId, auth.user.id),
            eq(transaction.id, ctx.data.transactionId),
          ),
        )
        .execute();

      return true;
    } catch (e) {
      console.error(e);
      const message = (e as Error).message;
      return {
        message,
      };
    }
  });

export const useAddTransactionCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransactionCategory,
    onMutate: async (ctx) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", "all"] });

      const previousTransactions = queryClient.getQueryData([
        "transactions",
        "all",
      ]);

      const categories = queryClient.getQueryData([
        "categories",
        "all",
      ]) as Category[];

      queryClient.setQueryData(
        ["transactions", "all"],
        (old: Transaction[] = []) => {
          return old.map((transaction) =>
            transaction.id === ctx.data.transactionId
              ? {
                  ...transaction,
                  category: {
                    ...transaction.category,
                    id: ctx.data.categoryId,
                    color:
                      categories.find((x) => x.id === ctx.data.categoryId)
                        ?.color || "#ee7662",
                    name:
                      categories.find((x) => x.id === ctx.data.categoryId)
                        ?.name || "Loading...",
                    hideFromInsights: false,
                    treatAsIncome: false,
                  },
                }
              : transaction,
          );
        },
      );

      return { previousTransactions };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        ["transactions", "all"],
        context?.previousTransactions,
      );
    },
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: ["transactions", "all"] });
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
    onSuccess: () => onSuccess?.(),
  });
};

async function getRecommendedCategoryId(
  vendor: string,
): Promise<string | null> {
  // Query to get the most frequently used categoryId for the vendor
  const result = await db
    .select({
      categoryId: transaction.categoryId,
    })
    .from(transaction)
    .where(eq(transaction.vendor, vendor))
    .groupBy(transaction.categoryId)
    .orderBy(desc(sql<number>`count(${transaction.categoryId})`))
    .limit(1)
    .execute();

  // Return the categoryId or null if no results were found
  return result.length > 0 ? result[0].categoryId : null;
}
