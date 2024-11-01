import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createServerFn, json } from "@tanstack/start";
import { asc, eq } from 'drizzle-orm';
import { getEvent } from "vinxi/http";
import { db } from "~/server/db";
import { transaction } from "~/server/db/schema";


const fetchUserTransactions = createServerFn('GET', async (_, ctx) => {
    const event = getEvent();
    const auth = event.context.auth;

    if (!auth.isAuthenticated) {
        throw redirect({
            to: '/signin',
            code: 400
        })
    }

    const categories = await db.select().from(transaction).where(eq(transaction.userId, auth.user?.id)).orderBy(asc(transaction.date))

    return json(categories);
})

export const transactionQueries = {
    getUserTransactions: () => queryOptions({
        queryKey: ['transactions', 'all'],
        queryFn: () => fetchUserTransactions(),
    }),
} as const;
