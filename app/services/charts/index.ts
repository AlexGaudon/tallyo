import { queryOptions } from "@tanstack/react-query";
import { fetchCategoryBreakdownData } from "./category-breakdown";
import { fetchIncomeVsExpenseData } from "./income-vs-expenses";

export const chartsQueries = {
  categoryBreakdown: () =>
    queryOptions({
      queryKey: ["charts", "categoryBreakdown"],
      queryFn: () => fetchCategoryBreakdownData(),
    }),
  incomeVsExpense: () =>
    queryOptions({
      queryKey: ["charts", "income-vs-expenses"],
      queryFn: () => fetchIncomeVsExpenseData(),
    }),
} as const;
