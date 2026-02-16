import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    toast.success("Order placed! A runner will pick it up soon.");
    clearCart();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/stores" className="flex items-center gap-2 text-secondary-foreground/70 hover:text-secondary-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Continue Shopping</span>
          </Link>
          <span className="font-display font-bold text-secondary-foreground">Cart ({itemCount})</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/stores">
              <Button variant="outline">Browse Stores</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  {(product.cover_image || product.logo) ? (
                    <img src={product.cover_image || product.logo || ""} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-sm text-card-foreground truncate">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">${product.price} {product.unit ? `/ ${product.unit}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display font-bold text-foreground">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full" onClick={handleCheckout}>
                Place Order — ${total.toFixed(2)}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Cart;
