"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesContentAPI } from "@/lib/api";
import { useServicesContentStore, type ServicesPageContent } from "@/lib/store/services-content";
import { toast } from "sonner";

const QUERY_KEY = ["services-content"] as const;

export function useServicesContent() {
  const queryClient = useQueryClient();
  const storeContent = useServicesContentStore((s) => s.content);
  const setContent = useServicesContentStore((s) => s.setContent);
  const storeSaving = useServicesContentStore((s) => s.isSaving);
  const loadedRef = useRef(false);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => servicesContentAPI.getAll(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (query.data && !loadedRef.current) {
      loadedRef.current = true;
      const current = useServicesContentStore.getState().content;
      if (!current || !current.lastUpdated || query.data.lastUpdated !== current.lastUpdated) {
        setContent(query.data);
      }
      useServicesContentStore.setState({ isLoading: false, error: null });
    }
  }, [query.data, setContent]);

  const saveMutation = useMutation({
    mutationFn: (content: ServicesPageContent) => servicesContentAPI.saveAll(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      loadedRef.current = false;
      useServicesContentStore.setState({ isSaving: false });
      toast.success("Services content saved to database");
    },
    onError: () => {
      useServicesContentStore.setState({ isSaving: false });
      toast.error("Failed to save services content");
    },
  });

  const saveToDatabase = useCallback(() => {
    const current = useServicesContentStore.getState().content;
    if (!current) return;
    useServicesContentStore.setState({ isSaving: true });
    saveMutation.mutate(current);
  }, [saveMutation]);

  return {
    content: storeContent,
    isLoading: query.isFetching,
    isSaving: storeSaving,
    saveToDatabase,
    isLoaded: !query.isFetching && !!query.data,
  };
}
