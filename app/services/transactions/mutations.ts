import { db } from "@/server/db";
import { transaction } from "@/server/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { getEvent } from "vinxi/http";
import { z } from "zod";
import { Category } from "../categories";
import { Transaction } from "./queries";

export const transactionMutations = {
  updateCategory: (onSuccess?: () => void) =>
    useAddTransactionCategory(onSuccess),
  updateReviewed: (onSuccess?: () => void) =>
    useUpdateTransactionReviewed(onSuccess),
} as const;

// update reviewed

export const updateReviewedSchema = z.object({
  transactionId: z.string(),
  reviewed: z.boolean(),
});

export const updateTransactionReviewed = createServerFn(
  "POST",
  async (params: z.infer<typeof updateReviewedSchema>) => {
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
          reviewed: params.reviewed,
        })
        .where(
          and(
            eq(transaction.id, params.transactionId),
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
  },
);

export const useUpdateTransactionReviewed = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTransactionReviewed,
    onMutate: async (newVal) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", "all"] });

      const previousTransactions = queryClient.getQueryData([
        "transactions",
        "all",
      ]);

      queryClient.setQueryData(
        ["transactions", "all"],
        (old: Transaction[] = []) => {
          return old.map((transaction) =>
            transaction.id === newVal.transactionId
              ? {
                  ...transaction,
                  reviewed: newVal.reviewed,
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
        queryKey: ["transactions", "all"],
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

const addTransactionCategory = createServerFn(
  "POST",
  async (params: z.infer<typeof addTransactionCategorySchema>) => {
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
          categoryId: params.categoryId,
        })
        .where(
          and(
            eq(transaction.userId, auth.user.id),
            eq(transaction.id, params.transactionId),
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
  },
);

export const useAddTransactionCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransactionCategory,
    onMutate: async (newVal) => {
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
            transaction.id === newVal.transactionId
              ? {
                  ...transaction,
                  category: {
                    ...transaction.category,
                    id: newVal.categoryId,
                    color:
                      categories.find((x) => x.id === newVal.categoryId)
                        ?.color || "#ee7662",
                    name:
                      categories.find((x) => x.id === newVal.categoryId)
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
        queryKey: ["transactions", "all"],
      });
    },
    onSuccess: () => onSuccess?.(),
  });
};
