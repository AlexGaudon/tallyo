import { queryOptions } from "@tanstack/react-query";
import { fetchCategoryBreakdownData } from "./category-breakdown";

export const chartsQueries = {
  categoryBreakdown: () =>
    queryOptions({
      queryKey: ["charts", "categoryBreakdown"],
      queryFn: () => fetchCategoryBreakdownData(),
    }),
} as const;
