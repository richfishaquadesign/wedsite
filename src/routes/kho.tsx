import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kho")({
  beforeLoad: () => {
    throw redirect({ to: "/bo-suu-tap" });
  },
});
