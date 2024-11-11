import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { getRealMonth } from "@/lib/utils";
import { categoriesQueries } from "@/services/categories";
import { chartsQueries } from "@/services/charts";
import { useQuery } from "@tanstack/react-query";
import { subMonths } from "date-fns";
import { CategoryBadge } from "../categories/category-badge";
import AmountDisplay from "../transactions/amount-display";

export function MonthyExpenseChart(props: { numberOfMonths?: number }) {
  const { data, isLoading } = useQuery(chartsQueries.monthlyExpense());
  const { data: categories, isLoading: isCategoriesLoading } = useQuery(
    categoriesQueries.getUserCategories(),
  );

  if (!data || isLoading || !categories || isCategoriesLoading) {
    return <h1>No data available.</h1>;
  }

  const validPeriods: string[] = [];

  for (let i = 0; i < (props.numberOfMonths ?? 2); i++) {
    const year = new Date().getFullYear();
    validPeriods.push(`${year}-${subMonths(new Date(), i).getMonth() + 1}`);
  }

  const getAmountOfCategory = (category: string) =>
    Object.fromEntries(
      validPeriods.map((month) => [
        month,
        data?.find((x) => x.category === category && x.period === month)
          ?.amount ?? 0,
      ]),
    );

  console.log(getAmountOfCategory("Auto"));

  console.log(validPeriods);

  const isIncome = (category: string) =>
    data.find((x) => x.category === category)?.isIncome ?? false;

  const isExpense = (category: string) => !isIncome(category);

  const tableRows = (
    <>
      {categories
        .filter((x) => !x.hideFromInsights && !x.treatAsIncome)
        .map((category) => {
          const amounts = getAmountOfCategory(category.name);
          return (
            <TableRow>
              <TableCell className="p-1">
                <CategoryBadge color={category.color} name={category.name} />
              </TableCell>
              {validPeriods.map((month) => (
                <TableCell className="p-1" key={month}>
                  <AmountDisplay amount={amounts[month]} />
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      {categories
        .filter((x) => x.treatAsIncome)
        .map((category) => {
          const amounts = getAmountOfCategory(category.name);
          return (
            <TableRow>
              <TableCell className="p-1">
                <CategoryBadge color={category.color} name={category.name} />
              </TableCell>
              {validPeriods.map((month) => (
                <TableCell className="p-1" key={month}>
                  <AmountDisplay amount={amounts[month]} />
                </TableCell>
              ))}
            </TableRow>
          );
        })}
    </>
  );

  const calculateTotals = (filterFn: (category: string) => boolean) =>
    validPeriods.reduce(
      (acc, month) => {
        acc[month] = categories
          .filter((val) => filterFn(val.name))
          .reduce(
            (sum, category) =>
              sum +
              Math.abs(
                data?.find((x) => x.category === category.name)?.amount ?? 0,
              ),
            0,
          );
        return acc;
      },
      {} as Record<string, number>,
    );

  const totalIncomeAmounts = calculateTotals(isIncome);
  const totalExpenseAmounts = calculateTotals(isExpense);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expense Chart</CardTitle>
        <CardDescription suppressHydrationWarning>
          {" "}
          {getRealMonth(subMonths(new Date(), 2))} - {getRealMonth(new Date())}{" "}
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="p-1">Category</TableCell>
              {[...Array(props.numberOfMonths ?? 2).keys()].map((idx) => (
                <TableCell className="p-1" key={idx}>
                  {getRealMonth(subMonths(new Date(), idx))}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows}
            <TableRow>
              <TableCell className="p-0">Income</TableCell>
              {validPeriods.map((month) => (
                <TableCell className="p-0" key={month}>
                  <AmountDisplay amount={totalIncomeAmounts[month]} />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="p-0">Expense</TableCell>
              {validPeriods.map((month) => (
                <TableCell className="p-0" key={month}>
                  <AmountDisplay amount={totalExpenseAmounts[month]} />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="p-0">Totals</TableCell>
              {validPeriods.map((month) => (
                <TableCell className="p-0" key={month}>
                  <AmountDisplay
                    colored
                    amount={
                      totalIncomeAmounts[month] - totalExpenseAmounts[month]
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
