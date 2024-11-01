import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { getEvent } from "vinxi/http";
import { transform } from "~/lib/utils";
import { db } from "~/server/db";
import { category, transaction } from "~/server/db/schema";


const fetchUserTransactions = createServerFn('GET', async (_, ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
        throw redirect({
            to: '/signin',
            code: 400
        })
    }

    const transactions = await db.select({
        id: transaction.id,
        amount: transaction.amount,
        vendor: transaction.vendor,
        date: transaction.date,
        categoryId: transaction.categoryId,
        reviewed: transaction.reviewed,
        categoryName: category.name,
        categoryColor: category.color,
        hideFromInsights: category.hideFromInsights,
        treatAsIncome: category.treatAsIncome,
        externalId: transaction.externalId,
        createdAt: transaction.createdAt,
    }).from(transaction).where(eq(transaction.userId, auth.user?.id)).orderBy(asc(transaction.date)).leftJoin(category, eq(category.id, transaction.categoryId))
    return transactions.map(transform);
})

export const fetchUserPaginatedTransactions = createServerFn('GET', async (input: {
    page: number;
    filter: string | undefined
}, ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    console.log('Querying with page: ', input.page, ' and filter: ', input.filter);


    if (!auth.isAuthenticated) {
        throw redirect({
            to: '/signin',
            code: 400
        })
    }

    let conditions = [
        eq(transaction.userId, auth.user?.id)
    ]
    console.log(input)
    if (input.filter !== undefined) {
        conditions.push(ilike(transaction.vendor, `%${input.filter}%`))
    }

    // Set limit to one more than the items you want to fetch
    const offset = input.page * 10;
    const count = 10
    const limit = count + 1;

    const transactions = await db.select({
        id: transaction.id,
        amount: transaction.amount,
        vendor: transaction.vendor,
        date: transaction.date,
        categoryId: transaction.categoryId,
        reviewed: transaction.reviewed,
        categoryName: category.name,
        categoryColor: category.color,
        hideFromInsights: category.hideFromInsights,
        treatAsIncome: category.treatAsIncome,
        externalId: transaction.externalId,
        createdAt: transaction.createdAt
    })
        .from(transaction)
        .where(and(...conditions))
        .orderBy(desc(transaction.date))
        .leftJoin(category, eq(category.id, transaction.categoryId))
        .limit(limit)
        .offset(offset)

    // Determine hasMore based on the length of fetched data
    const hasMore = transactions.length > count;

    // Trim the extra item if it was fetched
    const paginatedTransactions = hasMore ? transactions.slice(0, count) : transactions;

    return {
        transactions: paginatedTransactions.map(transform),
        hasMore
    };

})

export const transactionQueries = {
    getUserTransactions: () => queryOptions({
        queryKey: ['transactions', 'all'],
        queryFn: () => fetchUserTransactions(),
    }),
    getUserTransactionsPaginated: (page: number, filter?: string) =>
        queryOptions({
            queryKey: ['transactions', 'paginated', page, filter],
            queryFn: () => fetchUserPaginatedTransactions({
                page, filter
            }),
        })
} as const;
