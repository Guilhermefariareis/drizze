import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Scissors, 
  Zap, 
  Heart, 
  Shield, 
  Clock,
  Star,
  ArrowRight,
  Filter
} from "lucide-react";

const services = [
  {
    id: 1,
    icon: Sparkles,
    title: "Limpeza Dental",
    description: "Profilaxia completa com remoção de tártaro e polimento",
    price: "A partir de R$ 80",
    duration: "45 min",
    rating: 4.9,
    popular: true,
    color: "text-blue-500"
  },
  {
    id: 2,
    icon: Zap,
    title: "Clareamento",
    description: "Clareamento dental profissional com resultados imediatos",
    price: "A partir de R$ 350",
    duration: "60 min",
    rating: 4.8,
    popular: true,
    color: "text-yellow-500"
  },
  {
    id: 3,
    icon: Heart,
    title: "Implantes",
    description: "Implantes dentários com tecnologia de ponta",
    price: "A partir de R$ 1.800",
    duration: "90 min",
    rating: 4.9,
    popular: true,
    color: "text-red-500"
  },
  {
    id: 4,
    icon: Shield,
    title: "Aparelho Ortodôntico",
    description: "Correção dentária com aparelhos tradicionais ou invisível",
    price: "A partir de R$ 250/mês",
    duration: "30 min",
    rating: 4.7,
    popular: true,
    color: "text-green-500"
  },
  {
    id: 5,
    icon: Scissors,
    title: "Tratamento de Canal",
    description: "Endodontia com técnicas modernas e menos dor",
    price: "A partir de R$ 400",
    duration: "75 min",
    rating: 4.6,
    popular: true,
    color: "text-purple-500"
  },
  {
    id: 6,
    icon: Clock,
    title: "Urgência 24h",
    description: "Atendimento de emergência disponível",
    price: "A partir de R$ 150",
    duration: "Imediato",
    rating: 4.5,
    popular: false,
    color: "text-orange-500"
  }
];

interface ServicesSectionProps {
  clinicId: string;
  isMaster: boolean;
}

const ServicesSection = ({ clinicId, isMaster }: ServicesSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const categories = [
    { id: "all", name: "Todos", count: services.length },
    { id: "popular", name: "Populares", count: services.filter(s => s.popular).length },
    { id: "preventivo", name: "Preventivo", count: services.filter(s => s.title.includes("Limpeza")).length },
    { id: "estetico", name: "Estético", count: services.filter(s => s.title.includes("Clareamento")).length },
    { id: "cirurgico", name: "Cirúrgico", count: services.filter(s => s.title.includes("Implante")).length },
    { id: "emergencia", name: "Emergência", count: services.filter(s => s.title.includes("Urgência")).length }
  ];

  const filteredServices = selectedCategory === "all" 
    ? services
    : selectedCategory === "popular" 
      ? services.filter(s => s.popular)
      : services.filter(s => {
          switch (selectedCategory) {
            case "preventivo": return s.title.includes("Limpeza");
            case "estetico": return s.title.includes("Clareamento");
            case "cirurgico": return s.title.includes("Implante");
            case "emergencia": return s.title.includes("Urgência");
            default: return true;
          }
        });
  return (
    <section id="services" className="w-full">
      <div className="w-full">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
            Nossos Serviços
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Tratamentos Odontológicos Completos
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Oferecemos uma ampla gama de serviços dentários com profissionais qualificados 
            e tecnologia de ponta para cuidar do seu sorriso.
          </p>
        </div>

        {/* Filtros por Categoria */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2 font-medium"
            >
              <Filter className="w-4 h-4" />
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredServices.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={service.id} 
                className="relative group hover:shadow-large transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-primary/20 bg-gradient-card"
              >
                {service.popular && (
                  <Badge className="absolute -top-3 left-4 bg-gradient-primary text-white">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-white shadow-soft ${service.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {service.rating}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">{service.price}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    Ver Especialistas
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="gradient" size="lg" className="font-semibold">
            Ver Todos os Serviços
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;