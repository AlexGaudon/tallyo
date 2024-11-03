import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col gap-4 p-6">
      Home Page, test another again woohoo yeehaw
    </div>
  );
}
