import { useState } from 'react';
import { Star, Filter, ThumbsUp, ThumbsDown, Calendar, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const mockReviews = [
  {
    id: 1,
    patientName: "Ana Costa",
    clinicName: "Clínica Dental doltorizze",
    service: "Limpeza",
    rating: 5,
    date: "2024-01-15",
    comment: "Excelente atendimento! A dentista foi muito cuidadosa e explicou todo o procedimento. Clínica moderna e limpa. Recomendo!",
    helpful: 12,
    verified: true,
    response: {
      text: "Muito obrigado pela avaliação, Ana! Ficamos felizes em poder cuidar do seu sorriso.",
      date: "2024-01-16"
    }
  },
  {
    id: 2,
    patientName: "Carlos Silva",
    clinicName: "Odonto Excellence",
    service: "Clareamento",
    rating: 4,
    date: "2024-01-10",
    comment: "Resultado muito bom do clareamento. Processo foi tranquilo, sem dor. Única observação é que a recepção demorou um pouco.",
    helpful: 8,
    verified: true,
    response: null
  },
  {
    id: 3,
    patientName: "Maria Santos",
    clinicName: "Sorriso Perfeito",
    service: "Implante",
    rating: 5,
    date: "2024-01-05",
    comment: "Melhor decisão que tomei! O Dr. João é excelente, muito técnico e humano. Todo o processo foi explicado detalhadamente.",
    helpful: 15,
    verified: true,
    response: {
      text: "Obrigado Maria! Foi um prazer cuidar do seu caso. Desejamos muita saúde!",
      date: "2024-01-06"
    }
  }
];

export default function ReviewsPage() {
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    clinic: '',
    service: ''
  });

  const filteredReviews = mockReviews.filter(review => 
    !selectedRating || review.rating.toString() === selectedRating
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      case 'recent':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: mockReviews.filter(r => r.rating === rating).length,
    percentage: (mockReviews.filter(r => r.rating === rating).length / mockReviews.length) * 100
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Avaliações e Comentários</h1>
            <p className="text-xl text-muted-foreground">
              Veja o que nossos pacientes falam sobre os tratamentos
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Stats */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Avaliação Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${
                            star <= Math.round(averageRating) 
                              ? 'text-warning fill-warning' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baseado em {mockReviews.length} avaliações
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="w-8">{rating}★</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-warning rounded-full h-2" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Write Review Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mb-6">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Escrever Avaliação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Avaliação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Clínica</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a clínica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinic1">Clínica Dental doltorizze</SelectItem>
                          <SelectItem value="clinic2">Odonto Excellence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Serviço</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cleaning">Limpeza</SelectItem>
                          <SelectItem value="whitening">Clareamento</SelectItem>
                          <SelectItem value="implant">Implante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Avaliação</Label>
                      <div className="flex gap-1 my-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Button
                            key={star}
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewReview({...newReview, rating: star})}
                          >
                            <Star 
                              className={`h-5 w-5 ${
                                star <= newReview.rating 
                                  ? 'text-warning fill-warning' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Comentário</Label>
                      <Textarea
                        placeholder="Conte sobre sua experiência..."
                        rows={4}
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      />
                    </div>
                    
                    <Button className="w-full">Enviar Avaliação</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Avaliação</Label>
                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        <SelectItem value="5">5 estrelas</SelectItem>
                        <SelectItem value="4">4 estrelas</SelectItem>
                        <SelectItem value="3">3 estrelas</SelectItem>
                        <SelectItem value="2">2 estrelas</SelectItem>
                        <SelectItem value="1">1 estrela</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Ordenar por</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Mais recentes</SelectItem>
                        <SelectItem value="rating">Melhor avaliação</SelectItem>
                        <SelectItem value="helpful">Mais úteis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {sortedReviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback>
                              {review.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{review.patientName}</h4>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.clinicName} • {review.service}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= review.rating 
                                    ? 'text-warning fill-warning' 
                                    : 'text-muted-foreground'
                                }`} 
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {review.comment}
                      </p>
                      
                      {review.response && (
                        <div className="bg-muted p-4 rounded-lg mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">Resposta da clínica</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.response.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm">{review.response.text}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Útil ({review.helpful})
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Não útil
                          </Button>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          Responder
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline">
                  Carregar mais avaliações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}