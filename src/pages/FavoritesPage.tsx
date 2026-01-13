import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Calendar, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/Footer';

const mockFavorites = [
  {
    id: 1,
    name: "Clínica Dental Sorriso",
    specialty: "Odontologia",
    city: "São Paulo",
    address: {
      street: "Rua das Flores, 123",
      neighborhood: "Vila Madalena",
      city: "São Paulo",
      state: "SP"
    },
    rating: 4.8,
    reviews: 245,
    services: ["Limpeza", "Clareamento", "Implantes", "Ortodontia"],
    nextAvailable: "Hoje às 14:30",
    price: "A partir de R$ 80",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20dental%20clinic%20interior%20with%20white%20chairs%20and%20equipment&image_size=landscape_4_3",
    addedDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Centro Médico Vida",
    specialty: "Clínica Geral",
    city: "Rio de Janeiro",
    address: {
      street: "Av. Copacabana, 456",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ"
    },
    rating: 4.6,
    reviews: 189,
    services: ["Consulta Geral", "Exames", "Cardiologia", "Dermatologia"],
    nextAvailable: "Amanhã às 09:00",
    price: "A partir de R$ 120",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20medical%20clinic%20reception%20area%20with%20comfortable%20seating&image_size=landscape_4_3",
    addedDate: "2024-01-10"
  },
  {
    id: 3,
    name: "Fisioterapia Movimento",
    specialty: "Fisioterapia",
    city: "Belo Horizonte",
    address: {
      street: "Rua da Saúde, 789",
      neighborhood: "Savassi",
      city: "Belo Horizonte",
      state: "MG"
    },
    rating: 4.9,
    reviews: 156,
    services: ["Fisioterapia", "RPG", "Pilates", "Acupuntura"],
    nextAvailable: "Segunda às 16:00",
    price: "A partir de R$ 90",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=physiotherapy%20clinic%20with%20exercise%20equipment%20and%20treatment%20tables&image_size=landscape_4_3",
    addedDate: "2024-01-05"
  }
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredFavorites = favorites.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeFavorite = (clinicId: number) => {
    setFavorites(favorites.filter(clinic => clinic.id !== clinicId));
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Minhas Clínicas Favoritas</h1>
              <p className="text-muted-foreground">
                Gerencie suas clínicas favoritas e agende rapidamente
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  placeholder="Buscar favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Badge variant="secondary" className="px-3 py-1">
                {filteredFavorites.length} favoritos
              </Badge>
            </div>
          </div>

          {filteredFavorites.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Nenhum favorito encontrado' : 'Nenhuma clínica favorita ainda'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? 'Tente buscar com outros termos'
                    : 'Adicione clínicas aos seus favoritos para acessá-las rapidamente'
                  }
                </p>
                <Button onClick={() => navigate('/search')}>
                  Buscar Clínicas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map(clinic => (
                <Card key={clinic.id} className="hover-lift relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeFavorite(clinic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={clinic.image}
                        alt={clinic.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-success text-success-foreground">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Favorito
                      </Badge>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold mb-1">{clinic.name}</h3>
                        <p className="text-sm text-primary font-medium">{clinic.specialty}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {clinic.address
                            ? (typeof clinic.address === 'object'
                              ? `${clinic.address.street || ''}, ${clinic.address.neighborhood || ''}`
                              : clinic.address)
                            : 'Endereço não informado'
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{clinic.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({clinic.reviews} avaliações)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {clinic.services.slice(0, 3).map(service => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {clinic.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{clinic.services.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <Calendar className="h-4 w-4 text-success" />
                        <span className="text-success font-medium">{clinic.nextAvailable}</span>
                      </div>

                      <div className="text-lg font-semibold text-primary mb-4">
                        {clinic.price}
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/booking/${clinic.id}`)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar Consulta
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/clinic/${clinic.id}`)}
                          >
                            Ver Perfil
                          </Button>

                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                        Adicionado em {new Date(clinic.addedDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredFavorites.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline">Comparar Preços</Button>
                  <Button variant="outline">Ver Disponibilidade</Button>
                  <Button variant="outline">Compartilhar Lista</Button>
                  <Button variant="outline">Exportar Favoritos</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recomendações Baseadas nos seus Favoritos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {['Clínica Nova Vista', 'Dental Care Plus', 'Sorriso Brilhante'].map((name, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                    <img
                      src="/api/placeholder/60/60"
                      alt={name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        4.{8 + index}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}