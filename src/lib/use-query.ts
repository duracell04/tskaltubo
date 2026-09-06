"use client";
import { useSyncExternalStore } from "react";
const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
export function useQuery() {
  return new URLSearchParams(
    useSyncExternalStore(
      subscribe,
      () => window.location.search,
      () => "",
    ),
  );
}
