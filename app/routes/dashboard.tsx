import { chartsQueries } from "@/services/charts";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { CategoryBreakdownChart } from "../components/charts/category-breakdown";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    if (!context.auth) {
      throw redirect({ to: "/signin" });
    }

    await context.queryClient.ensureQueryData(
      chartsQueries.categoryBreakdown(),
    );
  },
});

function DashboardPage() {
  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
      <CategoryBreakdownChart />
    </div>
  );
}
