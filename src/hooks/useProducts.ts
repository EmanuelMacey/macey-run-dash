import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/lib/externalSupabase";
import type { Product } from "@/types/store";

export const useProducts = (storeId: string, search?: string) => {
  return useQuery({
    queryKey: ["external-products", storeId, search],
    queryFn: async () => {
      let query = externalSupabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("name");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });
};
