import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  CircleCheckIcon,
  SortAscIcon,
  SortDescIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Category } from "@/services/categories";
import { Transaction } from "@/services/transactions";
import { useDebounce } from "@uidotdev/usehooks";
import { CategoryBadge } from "../categories/category-badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import AmountDisplay from "./amount-display";

const getSortIcon = (column: any) => (
  <>
    {column.getIsSorted() === "asc" && <SortAscIcon className="ml-2 w-4 h-4" />}
    {column.getIsSorted() === "desc" && (
      <SortDescIcon className="ml-2 w-4 h-4" />
    )}
    {!column.getIsSorted() && <ChevronsUpDownIcon className="ml-2 w-4 h-4" />}
  </>
);

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue("date");
      return (
        <div className="capitalize">
          {
            new Date((value as String | Date).toString())
              .toISOString()
              .split("T")[0]
          }
        </div>
      );
    },
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("vendor")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="md:w-[180px] capitalize">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="float-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            {getSortIcon(column)}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-right">
        <AmountDisplay
          amount={row.getValue("amount")}
          colored={true}
          key={row.getValue("amount")}
        />
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          {getSortIcon(column)}
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.getValue("category") as Category | null;
      if (category) {
        return (
          <CategoryBadge
            color={category.color}
            name={category.name}
            className="text-sm"
          />
        );
      }

      return (
        <CategoryBadge className="text-sm" transactionId={row.original.id} />
      );
    },
  },
  {
    id: "reviewed",
    enableHiding: false,
    cell: ({ row }) => {
      const reviewed = row.original.reviewed;
      return (
        <CircleCheckIcon
          onClick={() => {}}
          className={cn(
            {
              "text-green-400": reviewed,
              "text-gray-500": !reviewed,
            },
            "cursor-pointer",
          )}
        />
      );
    },
  },
];

export function TransactionTable(props: {
  data: Transaction[];
  isFetching?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [tableData, setTableData] = useState(props.data);

  const [vendorFilter, setVendorFilter] = useState("");

  const debouncedValue = useDebounce(vendorFilter, 500);

  const isUnreviewed = (data: Transaction) => {
    return !data.reviewed;
  };

  const isUncategorized = (data: Transaction) => {
    return data.category === null;
  };

  const [typeToShow, setTypeToShow] = useState<"unreviewed" | "all">("all");
  const [uncategorizedOnly, setUncategorizedOnly] = useState(false);

  const applyFiltersAndSorting = () => {
    let data = props.data;

    if (debouncedValue !== "") {
      data = data.filter((x) =>
        x.vendor.toLowerCase().includes(debouncedValue.toLocaleLowerCase()),
      );
    }

    if (typeToShow === "unreviewed") {
      data = data.filter(isUnreviewed);
    }

    if (uncategorizedOnly) {
      data = data.filter(isUncategorized);
    }

    setTableData(data);
  };

  useEffect(() => {
    applyFiltersAndSorting();
  }, [typeToShow, debouncedValue, props.data, uncategorizedOnly]);

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    autoResetAll: false,
    autoResetExpanded: false,
    autoResetPageIndex: false,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="w-full">
        <div className="sm:block md:flex items-center space-x-2 space-y-2 mx-2 py-4">
          <Input
            placeholder="Filter vendor..."
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="sm:w-full max-w-sm"
          />
          <Button
            onClick={() => {
              table.resetSorting();
              setVendorFilter("");
              setTypeToShow("all");
              setTypeToShow("all");
              setUncategorizedOnly(false);
            }}
          >
            Reset Table
          </Button>

          <Button
            disabled={props.isFetching}
            onClick={() => {
              if (typeToShow === "all") {
                setTypeToShow("unreviewed");
              } else {
                setTypeToShow("all");
              }
            }}
          >
            {typeToShow === "all" ? "Show Unreviewed" : "Show All"}
          </Button>

          <Button
            disabled={props.isFetching}
            onClick={() => {
              setUncategorizedOnly((val) => !val);
            }}
          >
            {uncategorizedOnly
              ? "Show Uncategorized Only"
              : "Show All Transactions"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end items-center space-x-2 py-4">
          <div className="flex-1 text-muted-foreground text-sm">
            {table.getFilteredRowModel().rows.length} row(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.previousPage();
              }}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.nextPage();
              }}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
