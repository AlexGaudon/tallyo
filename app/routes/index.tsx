import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const ctx = Route.useRouteContext();

  if (ctx.auth.user?.id) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <div className="flex flex-col gap-4 p-6">
      Home Page, test another again woohoo yeehaw
    </div>
  );
}
