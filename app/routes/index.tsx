import { Link, createFileRoute } from "@tanstack/react-router";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/authClient";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { auth } = Route.useRouteContext();
  const user = auth?.user;

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-4xl font-bold">TanStarter Better Auth</h1>
      <div className="flex items-center gap-2">
        This is an unprotected page:
        <pre className="rounded-md border bg-card p-1 text-card-foreground">
          routes/index.tsx
        </pre>
      </div>

      {user ? (
        <div className="flex flex-col gap-2">
          <Avatar>
            <img src={user.image} alt="" />
          </Avatar>
          <p>Welcome back, {user.name || user.email}!</p>
          <Button type="button" asChild className="w-fit" size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <div>
            More data:
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>

          <Button
            className="w-fit"
            variant="destructive"
            size="lg"
            onClick={async () => {
              await authClient.signOut();
              window.location.reload();
            }}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p>You are not signed in.</p>
          <Button type="button" asChild className="w-fit" size="lg">
            <Link to="/signin">Sign in</Link>
          </Button>
        </div>
      )}
      <div className="flex gap-x-2">
        <a
          className="text-muted-foreground underline hover:text-foreground"
          href="https://github.com/AlexGaudon/tanstarter-better-auth"
          target="_blank"
          rel="noreferrer noopener"
        >
          alexgaudon/tanstarter-better-auth
        </a>
        <p className="text-muted-foreground">inspired by</p>
        <a
          className="text-muted-foreground underline hover:text-foreground"
          href="https://github.com/dotnize/tanstarter"
          target="_blank"
          rel="noreferrer noopener"
        >
          dotnize/tanstarter
        </a>
      </div>
    </div>
  );
}
