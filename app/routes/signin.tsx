import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/authClient";

export const Route = createFileRoute("/signin")({
  component: AuthPage,
  beforeLoad: async ({ context }) => {
    if (context.auth) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8 rounded-xl border bg-card p-10">
        Logo here
        <Button
          onClick={async () => {
            await authClient.signIn.social({
              provider: "discord",
              callbackURL: "/", //redirect to dashboard after sign in
            });
          }}
          type="submit"
          variant="outline"
          size="lg"
        >
          Sign in with Discord
        </Button>
      </div>
    </div>
  );
}
