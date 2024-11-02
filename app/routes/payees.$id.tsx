import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogHeader, DialogTrigger } from "~/components/ui/dialog";
import { payeeQueries } from "~/services/payees";
import { PayeeDetail } from "./payees.index";

export const Route = createFileRoute("/payees/$id")({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    if (!ctx.context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
    await ctx.context.queryClient.ensureQueryData(
      payeeQueries.getUserPayeeById(ctx.params.id),
    );
  },
});

function RouteComponent() {
  const params = Route.useParams();

  const { data } = useQuery(payeeQueries.getUserPayeeById(params.id));

  if (!data) {
    return <Navigate to="/payees" />;
  }

  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={(newValue) => {
        setOpen(newValue);
      }}
    >
      <DialogTrigger></DialogTrigger>
      <DialogHeader>
        <PayeeDetail {...data} showKeywords={true} />
      </DialogHeader>
    </Dialog>
  );
}
