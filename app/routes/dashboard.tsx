import { StatsForNerds } from "@/components/charts/stats-for-nerds";
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
      context.queryClient.ensureQueryData(
        categoriesQueries.getUserCategories(),
      ),
      context.queryClient.ensureQueryData(chartsQueries.categoryBreakdown()),
      context.queryClient.ensureQueryData(chartsQueries.incomeVsExpense()),
      context.queryClient.ensureQueryData(chartsQueries.stats()),
      context.queryClient.ensureQueryData(chartsQueries.monthlyExpense()),
    ]);
  },
});

function DashboardPage() {
  return (
    <div className="gap-x-4 gap-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 pt-4 pb-12">
      <div suppressHydrationWarning>
        <MonthyExpenseChart />
      </div>
      <div className="space-y-4">
        <IncomeVsExpenseChart />
        <CategoryBreakdownChart />
      </div>
      <div suppressHydrationWarning>
        <StatsForNerds />
      </div>
    </div>
  );
}
