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
import {
  formatCurrency,
  getPeriodFromDate,
  transformAmounts,
} from "@/lib/utils";
import { chartsQueries } from "@/services/charts";
import { useQuery } from "@tanstack/react-query";
import { x } from "node_modules/better-auth/dist/index-DUqGSAH3";
import { Label, Pie, PieChart } from "recharts";

let chartConfig: ChartConfig = {} satisfies ChartConfig;

export function CategoryBreakdownChart(props: { month?: string }) {
  const { data, isLoading } = useQuery(chartsQueries.categoryBreakdown());

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data) {
    return <h1>No data available</h1>;
  }

  // Process data to ensure it's in the correct format and positive for display purposes
  const relevantData = data
    .filter((x) => {
      if (props.month) {
        return x.period === props.month;
      }

      return x.period === getPeriodFromDate(new Date());
    })
    .map(transformAmounts)
    .map((x) => ({
      name: x.name!,
      amount: parseFloat(x.amount), // Ensure amounts are positive
      fill: x.color!,
    }));

  // Configure chart settings based on the data
  relevantData.forEach((item) => {
    chartConfig[item.name] = {
      label: item.name,
      color: item.fill,
    };
  });

  const totalAmount = relevantData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Transaction Category Breakdown</CardTitle>
        <CardDescription suppressHydrationWarning>
          {new Date(props.month ?? new Date()).toLocaleDateString("default", {
            month: "long",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto max-h-[300px] aspect-square"
        >
          <PieChart>
            <ChartLegend />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={relevantData}
              dataKey="amount"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="font-bold text-xl fill-foreground"
                        >
                          {formatCurrency(totalAmount)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Spent
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
