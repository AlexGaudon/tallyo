import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, EditIcon, PlusIcon } from "lucide-react";
import type { Category } from "../../../../server/src/routers";
import { MultiEntitySelect } from "../ui/multi-entity-select";

interface CategoryMultiSelectProps {
	value?: string[];
	onValueChange: (value: string[]) => void;
	placeholder?: string;
	excludeCategoryId?: string;
	className?: string;
	disabled?: boolean;
	// New props for action buttons
	onEditCategory?: (categoryId: string) => void;
	onCreateCategory?: () => void;
	showActionButtons?: boolean;
}

export const formatCategory = (category: Category) => {
	if (category.parentCategory) {
		return (
			<span className="flex items-center gap-1">
				{category.parentCategory.name}
				<ArrowRight className="h-3 w-3" />
				{category.name}
			</span>
		);
	}
	return category.name;
};

export const formatCategoryText = (category: Category) => {
	if (category.parentCategory) {
		return `${category.parentCategory.name} → ${category.name}`;
	}
	return category.name;
};

export function CategoryMultiSelect({
	value = [],
	onValueChange,
	placeholder = "Select categories",
	excludeCategoryId,
	className,
	disabled = false,
	// New props for action buttons
	onEditCategory,
	onCreateCategory,
	showActionButtons = false,
}: CategoryMultiSelectProps) {
	const { data } = useQuery(orpc.categories.getUserCategories.queryOptions());

	const categories = data?.categories ?? [];
	const filteredCategories = excludeCategoryId
		? categories.filter((cat) => cat.id !== excludeCategoryId)
		: categories;

	// Build action buttons
	const actionButtons = [];

	if (onCreateCategory) {
		actionButtons.push({
			label: "Create New Category",
			icon: <PlusIcon />,
			onClick: onCreateCategory,
			variant: "outline" as const,
		});
	}

	// Edit Category button (only show if categories are selected)
	if (value.length > 0 && onEditCategory) {
		actionButtons.push({
			label: "Edit Selected Category",
			icon: <EditIcon />,
			onClick: () => onEditCategory(value[0]), // Edit the first selected category
			variant: "outline" as const,
		});
	}

	return (
		<MultiEntitySelect
			value={value}
			onValueChange={onValueChange}
			placeholder={placeholder}
			className={className}
			entities={filteredCategories}
			formatEntity={formatCategory}
			emptyLabel="No categories available"
			disabled={disabled}
			showActionButtons={showActionButtons || actionButtons.length > 0}
			actionButtons={actionButtons}
		/>
	);
}
