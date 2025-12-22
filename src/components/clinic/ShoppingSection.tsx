import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid";
import { ShoppingCart, Plus, Minus, Package } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function ShoppingSection() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    { id: 1, name: "Escova Dental Elétrica", price: 89.90, category: "Higiene", stock: 15 },
    { id: 2, name: "Fio Dental com Fluor", price: 12.50, category: "Higiene", stock: 30 },
    { id: 3, name: "Enxaguante Bucal", price: 18.90, category: "Higiene", stock: 25 },
    { id: 4, name: "Creme Dental Clareador", price: 15.90, category: "Higiene", stock: 40 },
    { id: 5, name: "Kit Limpeza Dental", price: 45.00, category: "Kit", stock: 10 },
    { id: 6, name: "Protetor Bucal", price: 35.00, category: "Acessório", stock: 8 },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Shopping de Produtos</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Badge variant="outline">
            <ShoppingCart className="h-4 w-4 mr-1" />
            {cart.length} itens
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products */}
        <div className="lg:col-span-2">
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 2 }}>
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <CardDescription>
                    Estoque: {product.stock} unidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <Button
                      onClick={() => addToCart(product)}
                      variant="gradient"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Cart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrinho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Carrinho vazio
                </p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold text-primary">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <Button className="w-full" variant="gradient">
                      <Package className="h-4 w-4 mr-2" />
                      Finalizar Pedido
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}