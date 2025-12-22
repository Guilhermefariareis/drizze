import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid";
import { Store, Star, Filter, Search, ExternalLink } from "lucide-react";

export function MarketplaceSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const marketplaceItems = [
    {
      id: 1,
      name: "Curso de Implantodontia Avançada",
      provider: "Instituto OdontoPro",
      category: "Educação",
      price: 1299.00,
      rating: 4.8,
      image: "/placeholder.svg",
      description: "Curso completo de implantodontia com certificação"
    },
    {
      id: 2,
      name: "Sistema de Gestão OdontoSoft",
      provider: "TechDental",
      category: "Software",
      price: 89.90,
      rating: 4.6,
      image: "/placeholder.svg",
      description: "Sistema completo para gestão de clínicas dentárias"
    },
    {
      id: 3,
      name: "Equipamento Raio-X Digital",
      provider: "EquipDental",
      category: "Equipamento",
      price: 15000.00,
      rating: 4.9,
      image: "/placeholder.svg",
      description: "Raio-X digital de última geração"
    },
    {
      id: 4,
      name: "Marketing Digital para Dentistas",
      provider: "MarketDental",
      category: "Serviço",
      price: 599.00,
      rating: 4.7,
      image: "/placeholder.svg",
      description: "Pacote completo de marketing digital"
    },
    {
      id: 5,
      name: "Consultoria em Gestão Clínica",
      provider: "ConsultDent",
      category: "Consultoria",
      price: 2500.00,
      rating: 4.8,
      image: "/placeholder.svg",
      description: "Consultoria especializada em gestão de clínicas"
    },
    {
      id: 6,
      name: "Kit Cirúrgico Premium",
      provider: "SurgDental",
      category: "Material",
      price: 3500.00,
      rating: 4.9,
      image: "/placeholder.svg",
      description: "Kit completo para cirurgias dentárias"
    }
  ];

  const categories = ["all", "Educação", "Software", "Equipamento", "Serviço", "Consultoria", "Material"];

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Marketplace Odontológico</h2>
        <Badge variant="outline" className="self-start sm:self-auto">
          <Store className="h-4 w-4 mr-1" />
          {filteredItems.length} produtos
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos e serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "Todas as categorias" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                <Store className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="mt-1">
                    por {item.provider}
                  </CardDescription>
                </div>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(item.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.rating}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {item.category === "Software" && (
                    <span className="text-sm text-muted-foreground block">
                      /mês
                    </span>
                  )}
                </div>
                <Button variant="gradient" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
}