import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MetaRepository } from "@/repositories/meta";
import { TransactionRepository } from "@/repositories/transactions";
import type { Transaction } from "@/repositories/transactions/transactions.getAll";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDown, CircleCheckIcon } from "lucide-react";
import React, { useState } from "react";
import { CategoryBadge } from "../categories/category-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import AmountDisplay from "./amount-display";
import { SplitTransaction } from "./split-transaction";

// Define the props for the TransactionRow component
interface TransactionRowProps {
  showIdField: boolean;
  transaction: Transaction;
  onUpdate: (id: string, data: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onRecommendCategory: (vendor: string, transactionId: string) => void;
  isEditing: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  vendor: string;
  setVendor: React.Dispatch<React.SetStateAction<string>>;
  editingField: string;
  setEditingField: React.Dispatch<React.SetStateAction<string>>;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  showIdField,
  transaction,
  onUpdate,
  onDelete,
  onRecommendCategory,
  isEditing,
  setEditingId,
  description,
  setDescription,
  vendor,
  setVendor,
  editingField,
  setEditingField,
}) => {
  const formatVendor = (vendor: string) => (vendor.length > 20 ? vendor.substring(0, 20) + "..." : vendor);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);

  return (
    <>
      <SplitTransaction transaction={transaction} open={splitOpen} setOpen={(open) => setSplitOpen(open)} />
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(transaction.id);
                setDeleteConfirmOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TableRow key={transaction.id}>
        {showIdField && <TableCell>{transaction.id}</TableCell>}
        <TableCell>{transaction.date}</TableCell>
        <TableCell>
          {isEditing === transaction.id && editingField === "vendor" ? (
            <Input
              type="text"
              className="px-0 py-0 h-6"
              disabled={transaction.reviewed}
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              onBlur={() => {
                onUpdate(transaction.id, { displayVendor: vendor });
                setEditingId("");
                setEditingField("");
              }}
              autoFocus
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className="cursor-pointer"
                    onClick={() => {
                      if (!transaction.reviewed) {
                        setEditingId(transaction.id);
                        setEditingField("vendor");
                        setVendor(transaction.displayVendor || transaction.vendor);
                      }
                    }}
                  >
                    {transaction.displayVendor
                      ? formatVendor(transaction.displayVendor)
                      : formatVendor(transaction.vendor)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{transaction.vendor}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            {isEditing === transaction.id && editingField === "description" ? (
              <Input
                type="text"
                className="px-0 py-0 h-6"
                disabled={transaction.reviewed}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  onUpdate(transaction.id, { description });
                  setEditingId("");
                  setEditingField("");
                }}
                autoFocus
              />
            ) : (
              <p
                className={cn("cursor-pointer", {
                  "italic text-muted-foreground": !transaction.description,
                })}
                onClick={() => {
                  if (!transaction.reviewed) {
                    setEditingId(transaction.id);
                    setEditingField("description");
                    setDescription(transaction.description ?? "");
                  }
                }}
              >
                {transaction.description || "Click to add description"}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <AmountDisplay amount={transaction.amount} colored />
        </TableCell>
        <TableCell className="flex items-center gap-x-2 my-auto">
          {(() => {
            if (transaction.category && transaction.reviewed) {
              return (
                <CategoryBadge
                  link
                  color={transaction.category.color}
                  name={transaction.category.name}
                  className="text-sm"
                />
              );
            }

            return (
              <CategoryBadge
                className="text-sm"
                transactionId={transaction.id}
                name={transaction.category?.name ?? "Uncategorized"}
                color={transaction.category?.color ?? "#ff0000"}
              />
            );
          })()}
        </TableCell>
        <TableCell>
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-6 h-6">
                  <span className="sr-only">Open menu</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!transaction.reviewed && (
                  <DropdownMenuItem
                    onClick={() => {
                      onRecommendCategory(transaction.vendor, transaction.id);
                    }}
                  >
                    Automatically Categorize
                  </DropdownMenuItem>
                )}
                {!transaction.reviewed && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSplitOpen(true);
                    }}
                  >
                    Split
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setDeleteConfirmOpen(true);
                  }}
                  className="text-red-400"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="ml-auto">
              <CircleCheckIcon
                onClick={() => onUpdate(transaction.id, { reviewed: !transaction.reviewed })}
                className={cn(
                  {
                    "text-green-400": transaction.reviewed,
                    "text-gray-500": !transaction.reviewed,
                  },
                  "cursor-pointer",
                  "hover:scale-105",
                )}
              />
            </div>
          </div>

          {/* <div className="flex gap-x-2">
          <CircleCheckIcon
            onClick={() =>
              onUpdate(transaction.id, { reviewed: !transaction.reviewed })
            }
            className={cn(
              {
                "text-green-400": transaction.reviewed,
                "text-gray-500": !transaction.reviewed,
              },
              "cursor-pointer",
              "hover:scale-105"
            )}
          />
          {isEditing === transaction.id ? (
            <SaveIcon
              className="ml-auto"
              onClick={() => {
                onUpdate(transaction.id, { description });
                setEditingId("");
              }}
            />
          ) : (
            <PencilIcon
              className="ml-auto"
              onClick={() => {
                setEditingId(transaction.id);
                setDescription(transaction.description ?? "");
              }}
            />
          )}
          {!transaction.reviewed && (
            <SplitTransaction transaction={transaction}>
              <SplitIcon className="text-gray-500 hover:scale-105 cursor-pointer" />
            </SplitTransaction>
          )}
          <DangerConfirm onConfirm={() => onDelete(transaction.id)}>
            <TrashIcon />
          </DangerConfirm>
        </div> */}
        </TableCell>
      </TableRow>
    </>
  );
};

// Define the props for the TransactionTable component
interface TransactionTableProps {
  data: Transaction[];
  totalPages: number; // Total number of pages
  currentPage: number; // Current page number
  onPageChange: (page: number) => void; // Function to change the page
  children?: React.ReactNode;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  data,
  totalPages,
  currentPage,
  onPageChange,
  children,
}) => {
  const [description, setDescription] = useState<string>("");
  const [vendor, setVendor] = useState<string>("");
  const [editingId, setEditingId] = useState<string>("");
  const [editingField, setEditingField] = useState<string>("");

  const { data: meta } = useQuery(MetaRepository.getUserMeta());

  const { mutate: updateTransaction } = TransactionRepository.useUpdateUserTransactionMutation();
  const { mutate: deleteTransaction } = TransactionRepository.useDeleteUserTransactionMutation();
  const { mutateAsync: recommendCategory } = TransactionRepository.useSetRecommendedTransactionCategoryMutation();

  const onUpdate = (id: string, data: Partial<Transaction>) => {
    if ("reviewed" in data) {
      updateTransaction({
        id,
        reviewed: data.reviewed,
      });
    }
    if ("description" in data) {
      updateTransaction({
        id,
        description: data.description ?? "",
      });
    }
    if ("displayVendor" in data) {
      updateTransaction({
        id,
        displayVendor: data.displayVendor ?? "",
      });
    }
    if ("category" in data) {
      updateTransaction({
        id,
        categoryId: data.category?.id ?? "",
      });
    }
  };

  const onDelete = (id: string) => deleteTransaction({ id });

  const onRecommendCategory = (vendor: string, transactionId: string) =>
    recommendCategory({
      vendor,
    }).then((res) => {
      if (res != null) {
        updateTransaction({
          id: transactionId,
          categoryId: res,
        });
      }
    });

  return (
    <div className="border rounded-md w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {meta?.settings?.developerMode && <TableHead className="w-[100px]">ID</TableHead>}
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead className="w-1/6">Vendor</TableHead>
            <TableHead className="w-1/4">Description</TableHead>
            <TableHead className="w-[140px]">Amount</TableHead>
            <TableHead className="w-[140px]">Category</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              showIdField={meta?.settings?.developerMode ?? false}
              transaction={transaction}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRecommendCategory={onRecommendCategory}
              isEditing={editingId}
              setEditingId={setEditingId}
              description={description}
              setDescription={setDescription}
              vendor={vendor}
              setVendor={setVendor}
              editingField={editingField}
              setEditingField={setEditingField}
            />
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center px-4 py-4">
        <div className="flex-1 text-muted-foreground text-sm">A list of all transactions.</div>
        <div className="flex justify-center items-center space-x-2">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-200 disabled:opacity-50 px-2 py-1 rounded"
          >
            <ArrowLeftIcon />
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-200 disabled:opacity-50 px-2 py-1 rounded"
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
      <div className="space-x-2">{children}</div>
    </div>
  );
};
