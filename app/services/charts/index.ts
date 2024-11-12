import { queryOptions } from "@tanstack/react-query";
import { fetchCategoryBreakdownData } from "./category-breakdown";
import { fetchIncomeVsExpenseData } from "./income-vs-expenses";
import { fetchMonthlyExpenseData } from "./monthly-expense";
import { fetchStatsData } from "./stats";

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
  monthlyExpense: () =>
    queryOptions({
      queryKey: ["charts", "monthlyExpense"],
      queryFn: () => fetchMonthlyExpenseData(),
    }),
  stats: () =>
    queryOptions({
      queryKey: ["charts", "stats"],
      queryFn: () => fetchStatsData(),
    }),
} as const;
