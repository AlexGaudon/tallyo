import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getRealMonth, transformAmounts } from "@/lib/utils";
import { chartsQueries } from "@/services/charts";
import { useQuery } from "@tanstack/react-query";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function IncomeVsExpenseChart() {
  const { data, isLoading } = useQuery(chartsQueries.incomeVsExpense());

  if (!data || isLoading) {
    return <h1>No data available.</h1>;
  }

  const relevantData = data?.filter(
    (x) => x.period.substring(0, 4) === new Date().getFullYear().toString(),
  );

  const tableData = relevantData!
    .map((x) => {
      let parts = x.period.split("-");
      parts[1] = (Number(parts[1]) + 1).toString().padStart(2, "0");

      return {
        month: getRealMonth(new Date(parts.join("-"))),
        income: x.income,
        expenses: x.expenses,
      };
    })
    .map(transformAmounts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income v Expenses</CardTitle>
        <CardDescription suppressHydrationWarning>
          January -{" "}
          {new Date().toLocaleDateString("default", {
            month: "long",
          })}{" "}
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={tableData}>
            <ChartLegend />
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={4} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-5))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
