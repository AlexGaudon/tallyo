import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/authClient";

export const Route = createFileRoute("/signin")({
  component: AuthPage,
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

export default function AuthPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-8 bg-card p-10 border rounded-xl">
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
