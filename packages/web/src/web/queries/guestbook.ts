import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

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

// The view counter (useViews/useCountVisit, backed by orpc.counters) was
// removed from the site's footer — no longer wired up to any page. The
// backend route and its counters table are left in place untouched (not
// ours to drop a DB table over a UI change), just nothing on the frontend
// calls them anymore.
