import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";

export function useGuestbook() {
  return useQuery(orpc.guestbook.list.queryOptions({ staleTime: 30_000 }));
}

export function useSignGuestbook() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.guestbook.sign.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.guestbook.key() }),
    }),
  );
}

export function useViews() {
  return useQuery(orpc.counters.views.queryOptions({ staleTime: 60_000 }));
}

/** Counts one visit per browser session, then refreshes the displayed count. */
export function useCountVisit() {
  const queryClient = useQueryClient();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("counted-visit")) return;
    sessionStorage.setItem("counted-visit", "1");

    client.counters
      .visit()
      .then(() =>
        queryClient.invalidateQueries({ queryKey: orpc.counters.views.key() }),
      )
      .catch(() => undefined);
  }, [queryClient]);
}
