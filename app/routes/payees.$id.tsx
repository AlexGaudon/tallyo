import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { payeeQueries } from "~/services/payees";

export const Route = createFileRoute("/payees/$id")({
  component: PayeeDetailRoute,
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

function PayeeDetailRoute() {
  const params = Route.useParams();

  const { data } = useQuery(payeeQueries.getUserPayeeById(params.id));

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
