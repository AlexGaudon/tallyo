import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronsUpDownIcon,
  CircleCheckIcon,
  SortAscIcon,
  SortDescIcon,
  SquareFunctionIcon,
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
import {
  suggestCategory,
  Transaction,
  transactionMutations,
} from "@/services/transactions";
import { useDebounce } from "@uidotdev/usehooks";
import { CategoryBadge } from "../categories/category-badge";
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
      const reviewed = row.original.reviewed;
      const category = row.getValue("category") as Category | null;

      if (category && reviewed) {
        return (
          <CategoryBadge
            color={category.color}
            name={category.name}
            className="text-sm"
          />
        );
      }

      return (
        <CategoryBadge
          className="text-sm"
          transactionId={row.original.id}
          name={category?.name || "Uncategorized"}
          color={category?.color || "#ff0000"}
        />
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const orig = row.original;

      const { mutateAsync: updateCategory } =
        transactionMutations.updateCategory();
      const { mutateAsync: splitTransaction } =
        transactionMutations.splitTransaction();

      let elems = [];

      if (orig.category === null || orig.category.id === null) {
        elems.push(
          <SquareFunctionIcon
            className="hover:scale-105 cursor-pointer"
            onClick={async () => {
              const res = await suggestCategory(orig.id);

              if (res !== null) {
                await updateCategory({
                  categoryId: res,
                  transactionId: orig.id,
                });
              }
            }}
          />,
        );
      }

      if (!orig.reviewed) {
        // todo
        // elems.push(
        //   <SplitIcon
        //     onClick={() => {
        //       splitTransaction({
        //         transactionId: row.original.id,
        //         firstAmount: -125,
        //         secondAmount: row.original.amount,
        //       });
        //     }}
        //     className={cn("text-gray-500", "cursor-pointer", "hover:scale-105")}
        //   />,
        // );
      }

      return <div className="flex gap-x-2">{elems.map((x) => x)}</div>;
    },
  },
  {
    id: "reviewed",
    enableHiding: false,
    cell: ({ row }) => {
      const reviewed = row.original.reviewed;

      const { mutate: updateReviewed } = transactionMutations.updateReviewed();

      return (
        <CircleCheckIcon
          onClick={async () => {
            updateReviewed({
              reviewed: !reviewed,
              transactionId: row.original.id,
            });
          }}
          className={cn(
            {
              "text-green-400": reviewed,
              "text-gray-500": !reviewed,
            },
            "cursor-pointer",
            "hover:scale-105",
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

  const [typeToShow, setTypeToShow] = useState<"unreviewed" | "all">("all");

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

    setTableData(data);
  };

  useEffect(() => {
    applyFiltersAndSorting();
  }, [typeToShow, debouncedValue, props.data]);

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
        <div className="sm:block md:flex items-center space-x-2 mx-2 py-4">
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
            }}
          >
            Reset Table
          </Button>

          <Button
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

          {/* <DropdownMenu>
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
          </DropdownMenu> */}
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
