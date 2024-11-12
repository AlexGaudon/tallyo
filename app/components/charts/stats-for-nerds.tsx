import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { chartsQueries } from "@/services/charts";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCardIcon,
  PiggyBankIcon,
} from "lucide-react";
import AmountDisplay from "../transactions/amount-display";
import { Card, CardHeader, CardTitle } from "../ui/card";

export function StatsForNerds(props: {}) {
  const { data, isLoading } = useQuery(chartsQueries.stats());

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data) {
    return <h1>No data available</h1>;
  }

  return (
    <div className="gap-4 grid md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Total Transactions
          </CardTitle>
          <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{data.count}</div>
          <p className="text-muted-foreground text-xs">
            financial activities tracked
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Income</CardTitle>
          <ArrowUpIcon className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            <AmountDisplay amount={data.income} />
          </div>
          <p className="text-muted-foreground text-xs">
            worth of income tracked
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Expenses</CardTitle>
          <ArrowDownIcon className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            <AmountDisplay amount={data.expenses} />
          </div>
          <p className="text-muted-foreground text-xs">
            worth of expenses tracked
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Savings Rate</CardTitle>
          <PiggyBankIcon className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {(() => {
              const value = (
                ((data.income - data.expenses) / data.income) *
                100
              ).toFixed(2);
              return (
                <span
                  className={cn({
                    "text-green-500": Number(value) > 0,
                  })}
                >
                  {value}%
                </span>
              );
            })()}
          </div>
          <p className="text-muted-foreground text-xs">of total income saved</p>
        </CardContent>
      </Card>
    </div>
  );
}
