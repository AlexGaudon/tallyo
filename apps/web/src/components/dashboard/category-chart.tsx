import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CategoryData } from "../../../../server/src/routers";
import { formatCategoryText } from "../categories/category-select";

export function CategoryChart({ data }: { data: CategoryData }) {
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Category Breakdown</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground">
							No transaction data available to display category breakdown.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Sort by amount descending
	const sortedData = [...data].sort(
		(a, b) => Number(b.amount) - Number(a.amount),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Category Breakdown</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{sortedData.map((item) => (
						<div
							key={item.category.id}
							className="flex items-center justify-between p-3 rounded-lg border bg-card"
						>
							<div className="flex flex-col">
								<span className="font-medium">
									{formatCategoryText(item.category)}
								</span>
								<span className="text-sm text-muted-foreground">
									{item.count} transaction{item.count !== 1 ? "s" : ""}
								</span>
							</div>
							<div className="text-right">
								<span className="font-semibold text-lg">
									{formatCurrency(Number(item.amount))}
								</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
