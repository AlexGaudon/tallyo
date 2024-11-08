import { useToast } from "@/hooks/use-toast";
import { payeeQueries } from "@/services/payees";
import { transactionMutations } from "@/services/transactions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import { DialogDescription, DialogTitle } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AssignPayeeModal(props: {
  transactionId: string;
  onSuccess: () => void;
}) {
  const { data } = useQuery(payeeQueries.getUserPayees());
  const { mutateAsync } = transactionMutations.updatePayee();

  const [value, setValue] = useState("");

  const { toast } = useToast();

  return (
    <div className="lg:grid mx-auto w-fit">
      <div className="flex justify-center items-center py-2">
        <div className="gap-6 grid mx-auto w-[350px]">
          <div className="gap-2 grid text-center">
            <DialogTitle>
              <p className="font-bold text-3xl">Assign a Payee</p>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign a Payee to this transaction to help with grouping
              transactions.
            </DialogDescription>
          </div>
        </div>
      </div>
      <Select
        value={value}
        onValueChange={async (val) => {
          setValue(val);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {data?.map((x) => (
            <SelectItem value={x.id} key={x.id}>
              {x.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={async () => {
          props.onSuccess();
          const res = await mutateAsync({
            payeeId: value,
            transactionId: props.transactionId,
          });
          toast({
            description: res.message,
          });
        }}
      >
        Apply
      </Button>
    </div>
  );
}
