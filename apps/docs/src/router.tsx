import { createRouter } from "@tanstack/solid-router";
import { NotFound } from "~/components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
  });
}
