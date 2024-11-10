import { transform } from "@/lib/utils";
import { db } from "@/server/db";
import { category, transaction } from "@/server/db/schema";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, desc, eq } from "drizzle-orm";
import { getEvent } from "vinxi/http";
import { z } from "zod";
import { Category } from "../categories";

const transactionSelectFields = {
  id: transaction.id,
  amount: transaction.amount,
  vendor: transaction.vendor,
  date: transaction.date,
  description: transaction.description,
  category: {
    id: category.id,
    name: category.name,
    color: category.color,
    hideFromInsights: category.hideFromInsights,
    treatAsIncome: category.treatAsIncome,
  },
  reviewed: transaction.reviewed,
  externalId: transaction.externalId,
  createdAt: transaction.createdAt,
};

export type Transaction = Awaited<ReturnType<typeof fetchUserTransactions>>[0];

export const transactionQueries = {
  getUserTransactions: () =>
    queryOptions({
      queryKey: ["transactions", "all"],
      queryFn: () => fetchUserTransactions(0),
    }),
  getUserTransactionsLimit: (limit = 100) =>
    queryOptions({
      queryKey: ["transactions", "all"],
      queryFn: () => fetchUserTransactions(limit),
    }),
} as const;

export const transactionMutations = {
  updateCategory: (onSuccess?: () => void) =>
    useAddTransactionCategory(onSuccess),
} as const;

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

      return {
        message: "Updated.",
      };
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

export const fetchUserTransactions = createServerFn(
  "GET",
  async (limit: number, ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
        code: 400,
      });
    }

    const query = db
      .select(transactionSelectFields)
      .from(transaction)
      .where(eq(transaction.userId, auth.user?.id))
      .orderBy(desc(transaction.date))
      .leftJoin(category, eq(category.id, transaction.categoryId));

    if (limit) query.limit(limit);

    const transactions = await query.execute();

    return transactions.map(transform);
  },
);
