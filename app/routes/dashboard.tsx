import { categoriesQueries } from "@/services/categories";
import { chartsQueries } from "@/services/charts";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  CategoryBreakdownChart,
  IncomeVsExpenseChart,
  MonthyExpenseChart,
} from "../components/charts";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    if (!context.auth) {
      throw redirect({ to: "/signin" });
    }

    await Promise.all([
      await context.queryClient.ensureQueryData(
        chartsQueries.categoryBreakdown(),
      ),
      await context.queryClient.ensureQueryData(
        chartsQueries.incomeVsExpense(),
      ),
      await context.queryClient.ensureQueryData(
        categoriesQueries.getUserCategories(),
      ),
      await context.queryClient.ensureQueryData(chartsQueries.monthlyExpense()),
    ]);
  },
});

function DashboardPage() {
  return (
    <div className="gap-x-4 gap-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 pt-4 pb-12">
      <div className="space-y-4">
        <CategoryBreakdownChart />
        <IncomeVsExpenseChart />
      </div>
      <div suppressHydrationWarning>
        <MonthyExpenseChart />
      </div>
    </div>
  );
}
