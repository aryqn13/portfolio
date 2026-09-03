import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

const HOUR = 60 * 60 * 1000;

export function useFilms() {
  return useQuery(
    orpc.letterboxd.recent.queryOptions({ staleTime: 30 * 60 * 1000 }),
  );
}

export function useGithub() {
  return useQuery(orpc.github.overview.queryOptions({ staleTime: HOUR }));
}

export function useContributions() {
  return useQuery(
    orpc.github.contributions.queryOptions({ staleTime: 6 * HOUR }),
  );
}
