import { queryOptions } from "@tanstack/react-query";
import { fetchCategoryBreakdownData } from "./category-breakdown";
import { fetchIncomeVsExpenseData } from "./income-vs-expenses";
import { fetchMonthlyExpenseData } from "./monthly-expense";

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
} as const;
