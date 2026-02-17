import { ReactNode, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CheckoutDialog from "./CheckoutDialog";

const CartSheet = ({ children }: { children: ReactNode }) => {
  const { items, total, clearCart, updateQuantity, removeItem, storeName } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const handleCheckoutComplete = () => {
    setSheetOpen(false);
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">Your Cart</SheetTitle>
            {storeName && <p className="text-sm text-muted-foreground">From {storeName}</p>}
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Add items from a restaurant to get started</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-primary font-display font-bold text-sm">
                        {formatPrice(item.price * item.quantity)} <span className="text-xs font-normal text-muted-foreground">GYD</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <Button size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-lg text-primary">
                    {formatPrice(total)} <span className="text-sm font-normal text-muted-foreground">GYD</span>
                  </span>
                </div>
                <Button className="w-full h-12 rounded-full text-base font-bold" onClick={() => setCheckoutOpen(true)}>
                  Proceed to Checkout
                </Button>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} onOrderPlaced={handleCheckoutComplete} />
    </>
  );
};

export default CartSheet;
