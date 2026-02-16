import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/lib/externalSupabase";
import type { Store } from "@/types/store";

export const useStores = (search?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ["external-stores", search, categoryId],
    queryFn: async () => {
      let query = externalSupabase
        .from("stores")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Store[];
    },
  });
};

export const useStore = (storeId: string) => {
  return useQuery({
    queryKey: ["external-store", storeId],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();
      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId,
  });
};
