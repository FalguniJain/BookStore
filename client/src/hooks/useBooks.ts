import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Book } from "@shared/schema";

export function useAllBooks() {
  return useQuery({
    queryKey: ['/api/books'],
  });
}

export function useSearchBooks(query: string = "") {
  return useQuery({
    queryKey: ['/api/books/search', query],
    queryFn: async () => {
      if (!query) return [];
      
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Failed to search books');
      }
      return res.json() as Promise<Book[]>;
    },
    enabled: !!query,
  });
}

export function useFilterBooks(filters: { 
  subject?: string; 
  condition?: string; 
  freeOnly?: boolean 
}) {
  const queryParams = new URLSearchParams();
  
  if (filters.subject && filters.subject !== "All Subjects") {
    queryParams.append("subject", filters.subject);
  }
  
  if (filters.condition && filters.condition !== "All") {
    queryParams.append("condition", filters.condition);
  }
  
  if (filters.freeOnly) {
    queryParams.append("freeOnly", "true");
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/books/filter?${queryString}` : '/api/books';

  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error('Failed to filter books');
      }
      return res.json() as Promise<Book[]>;
    },
  });
}

export function useBookBySecretId(secretId: string) {
  return useQuery({
    queryKey: [`/api/books/secret/${secretId}`],
    queryFn: async () => {
      const res = await fetch(`/api/books/secret/${secretId}`);
      if (!res.ok) {
        throw new Error('Book not found');
      }
      return res.json() as Promise<Book>;
    },
    enabled: !!secretId,
  });
}

export function useReportBook() {
  return useMutation({
    mutationFn: async (bookId: number) => {
      const res = await fetch(`/api/books/${bookId}/report`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Failed to report book');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
    },
  });
}
