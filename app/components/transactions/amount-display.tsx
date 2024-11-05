import { cn } from "@/lib/utils";

export const displayFormat = (amount: number) => (amount / 100).toFixed(2);

export default function AmountDisplay({
  amount,
  colored,
}: {
  amount: number;
  colored?: boolean;
}) {
  let displayAmount = amount;

  if (Number(amount).toString() === "NaN") {
    displayAmount = 0;
  }

  return (
    <span
      className={cn({
        "text-red-500": displayAmount <= 0 && colored,
        "text-green-500": displayAmount > 0 && colored,
      })}
    >
      {displayAmount < 0 ? "-" : ""}${displayFormat(Math.abs(displayAmount))}
    </span>
  );
}
