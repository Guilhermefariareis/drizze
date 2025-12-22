import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid";
import { 
  Globe, Eye, Edit, Share2, Settings, Image, 
  MapPin, Phone, Mail, Clock, Star,
  Instagram, Facebook, Youtube 
} from "lucide-react";

export function DigitalShowcaseSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [showcaseData, setShowcaseData] = useState({
    clinicName: "Clínica Sorrir Sempre",
    description: "Clínica especializada em tratamentos dentários com tecnologia de ponta e atendimento humanizado.",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    phone: "(11) 3333-4444",
    email: "contato@sorrirsempre.com.br",
    website: "www.sorrirsempre.com.br",
    workingHours: "Segunda a Sexta: 8h às 18h\nSábado: 8h às 12h",
    services: [
      "Clareamento Dental",
      "Implantes",
      "Ortodontia",
      "Limpeza Dental",
      "Cirurgia Oral"
    ],
    socialMedia: {
      instagram: "@clinicasorrirsempre",
      facebook: "Clínica Sorrir Sempre",
      youtube: "Clínica Sorrir Sempre"
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setShowcaseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setShowcaseData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Vitrine Digital</h2>
          <p className="text-muted-foreground">
            Gerencie a presença online da sua clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </>
            )}
          </Button>
          <Button variant="gradient">
            <Share2 className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Visualização da Vitrine
              </CardTitle>
              <CardDescription>
                Como os pacientes verão sua clínica online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  {showcaseData.clinicName.charAt(0)}
                </div>
                <h3 className="text-xl font-bold">{showcaseData.clinicName}</h3>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">4.8</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-center text-muted-foreground">
                {showcaseData.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{showcaseData.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{showcaseData.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{showcaseData.email}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="text-sm">
                    {showcaseData.workingHours.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-medium mb-2">Serviços</h4>
                <div className="flex flex-wrap gap-2">
                  {showcaseData.services.map((service, index) => (
                    <Badge key={index} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-medium mb-2">Redes Sociais</h4>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">{showcaseData.socialMedia.instagram}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Facebook className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{showcaseData.socialMedia.facebook}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{showcaseData.socialMedia.youtube}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="gradient">
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="space-y-6">
          {isEditing ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Nome da Clínica</Label>
                    <Input
                      id="clinicName"
                      value={showcaseData.clinicName}
                      onChange={(e) => handleInputChange("clinicName", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={showcaseData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={showcaseData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  
                  <ResponsiveGrid cols={{ default: 1, sm: 2 }}>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={showcaseData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        value={showcaseData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                  </ResponsiveGrid>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Horário de Funcionamento</Label>
                    <Textarea
                      id="workingHours"
                      value={showcaseData.workingHours}
                      onChange={(e) => handleInputChange("workingHours", e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={showcaseData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                      placeholder="@usuario"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={showcaseData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                      placeholder="Nome da página"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={showcaseData.socialMedia.youtube}
                      onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                      placeholder="Nome do canal"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">SEO e Busca</p>
                      <p className="text-sm text-muted-foreground">
                        Otimize sua presença nos resultados de busca
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Galeria de Fotos</p>
                      <p className="text-sm text-muted-foreground">
                        Adicione fotos da clínica e trabalhos realizados
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-1" />
                      Gerenciar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Avaliações</p>
                      <p className="text-sm text-muted-foreground">
                        Gerencie e responda avaliações de pacientes
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Todas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}