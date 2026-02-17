import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Store, Package, ArrowLeft, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CATEGORIES = ["Fast Food", "Grill & Seafood", "Chinese Restaurant", "Pizza", "Coffee & Cafe", "Other"];

const AdminStores = () => {
  const queryClient = useQueryClient();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Store form state
  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState("Fast Food");
  const [storeDescription, setStoreDescription] = useState("");

  // Product form state
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productDescription, setProductDescription] = useState("");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_stores").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products", selectedStoreId],
    queryFn: async () => {
      const { data, error } = await supabase.from("marketplace_products").select("*").eq("store_id", selectedStoreId!).order("category").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStoreId,
  });

  const toggleStore = useMutation({
    mutationFn: async ({ id, is_open }: { id: string; is_open: boolean }) => {
      const { error } = await supabase.from("marketplace_stores").update({ is_open }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-stores"] }),
  });

  const toggleProduct = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase.from("marketplace_products").update({ is_available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products", selectedStoreId] }),
  });

  const openStoreDialog = (store?: any) => {
    if (store) {
      setEditingStore(store);
      setStoreName(store.name);
      setStoreCategory(store.category);
      setStoreDescription(store.description || "");
    } else {
      setEditingStore(null);
      setStoreName("");
      setStoreCategory("Fast Food");
      setStoreDescription("");
    }
    setStoreDialogOpen(true);
  };

  const saveStore = async () => {
    if (!storeName.trim()) return toast.error("Store name is required");
    const payload = { name: storeName.trim(), category: storeCategory, description: storeDescription.trim() || null };
    if (editingStore) {
      const { error } = await supabase.from("marketplace_stores").update(payload).eq("id", editingStore.id);
      if (error) return toast.error(error.message);
      toast.success("Store updated");
    } else {
      const { error } = await supabase.from("marketplace_stores").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Store created");
    }
    setStoreDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
  };

  const deleteStore = async (id: string) => {
    const { error } = await supabase.from("marketplace_stores").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Store deleted");
    if (selectedStoreId === id) setSelectedStoreId(null);
    queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
  };

  const openProductDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setProductPrice(String(product.price));
      setProductCategory(product.category || "");
      setProductDescription(product.description || "");
    } else {
      setEditingProduct(null);
      setProductName("");
      setProductPrice("");
      setProductCategory("");
      setProductDescription("");
    }
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!productName.trim() || !productPrice) return toast.error("Name and price are required");
    const payload = {
      name: productName.trim(),
      price: Number(productPrice),
      category: productCategory.trim() || null,
      description: productDescription.trim() || null,
      store_id: selectedStoreId!,
    };
    if (editingProduct) {
      const { error } = await supabase.from("marketplace_products").update(payload).eq("id", editingProduct.id);
      if (error) return toast.error(error.message);
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("marketplace_products").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Product added");
    }
    setProductDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-products", selectedStoreId] });
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("marketplace_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-products", selectedStoreId] });
  };

  // Product management view
  if (selectedStore) {
    const productCats = [...new Set(products.map((p) => p.category || "Other"))];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedStoreId(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All Stores
          </button>
          <Button size="sm" onClick={() => openProductDialog()}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-display font-bold text-lg">{selectedStore.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedStore.category} • {products.length} products</p>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products yet. Add your first product above.</p>
        ) : (
          productCats.map((cat) => (
            <div key={cat}>
              <h3 className="font-display font-semibold text-sm mb-2">{cat}</h3>
              <div className="space-y-2">
                {products.filter((p) => (p.category || "Other") === cat).map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-primary font-bold text-sm">${product.price.toLocaleString()} GYD</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={product.is_available} onCheckedChange={(v) => toggleProduct.mutate({ id: product.id, is_available: v })} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openProductDialog(product)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove this product.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Product dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. 9pc Bucket" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Price (GYD)</Label>
                  <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={productCategory} onChange={(e) => setProductCategory(e.target.value)} placeholder="e.g. Combos" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Product description..." />
              </div>
              <Button className="w-full" onClick={saveProduct}>{editingProduct ? "Save Changes" : "Add Product"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Store list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Stores</h2>
        <Button size="sm" onClick={() => openStoreDialog()}>
          <Plus className="h-4 w-4 mr-1" /> Add Store
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : stores.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No stores yet.</p>
      ) : (
        <div className="space-y-2">
          {stores.map((store) => (
            <div key={store.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
              <button onClick={() => setSelectedStoreId(store.id)} className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground">{store.category}</p>
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2 ml-2">
                <Switch checked={store.is_open} onCheckedChange={(v) => toggleStore.mutate({ id: store.id, is_open: v })} />
                <Badge variant={store.is_open ? "default" : "secondary"} className="text-xs w-14 justify-center">
                  {store.is_open ? "Open" : "Closed"}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openStoreDialog(store)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{store.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete this store and all its products.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteStore(store.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store dialog */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStore ? "Edit Store" : "Add Store"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. KFC" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={storeCategory} onValueChange={setStoreCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} placeholder="Brief description..." />
            </div>
            <Button className="w-full" onClick={saveStore}>{editingStore ? "Save Changes" : "Create Store"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStores;
