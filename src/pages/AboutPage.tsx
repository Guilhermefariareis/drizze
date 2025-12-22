import { Shield, Heart, Users, Award, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const stats = [
    { number: "50k+", label: "Pacientes Atendidos", icon: Users },
    { number: "500+", label: "Clínicas Parceiras", icon: Award },
    { number: "15", label: "Estados Atendidos", icon: MapPin },
    { number: "4.9/5", label: "Avaliação Média", icon: Heart }
  ];

  const values = [
    {
      icon: Shield,
      title: "Segurança",
      description: "Todas as clínicas são verificadas e seguem rigorosos padrões de qualidade."
    },
    {
      icon: Heart,
      title: "Cuidado",
      description: "Priorizamos o bem-estar e satisfação de cada paciente em nossa plataforma."
    },
    {
      icon: Users,
      title: "Conexão",
      description: "Conectamos pessoas aos melhores profissionais de odontologia do Brasil."
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Buscamos sempre a excelência em nossos serviços e parcerias."
    }
  ];

  const team = [
    {
      name: "Dr. Carlos Silva",
      role: "CEO & Fundador",
      description: "Dentista com 20 anos de experiência, visionário da democratização do acesso à saúde bucal.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Ana Costa",
      role: "CTO",
      description: "Especialista em tecnologia da saúde, responsável pela inovação da plataforma.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Maria Santos",
      role: "Diretora Médica",
      description: "Supervisiona a qualidade dos serviços e o credenciamento das clínicas parceiras.",
      image: "/api/placeholder/150/150"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 pt-32"> {/* Adiciona pt-32 para compensar navbar fixa */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30">
              Sobre a Doutorizze
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transformando sorrisos,
              <span className="text-accent block">conectando vidas</span>
            </h1>
            
            <p className="text-xl mb-8 leading-relaxed opacity-90">
              Somos a maior plataforma de agendamento odontológico do Brasil, 
              conectando pacientes aos melhores dentistas com segurança e praticidade.
            </p>
            
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Conheça Nossa História
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Nossa Missão</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Democratizar o acesso à saúde bucal de qualidade no Brasil, conectando 
                  pacientes aos melhores profissionais através de uma plataforma segura, 
                  transparente e fácil de usar.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Acreditamos que todo brasileiro merece um sorriso saudável e bonito, 
                  e trabalhamos todos os dias para tornar isso realidade.
                </p>
                <Button>Faça Parte da Nossa Missão</Button>
              </div>
              
              <div className="relative">
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Missão Doutorizze" 
                  className="rounded-2xl shadow-elegant"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">+50.000</div>
                      <div className="text-xs text-muted-foreground">Sorrisos Transformados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nossos Valores</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Os princípios que guiam cada decisão e ação em nossa jornada 
                para transformar a saúde bucal no Brasil.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <Card key={value.title} className="text-center hover-lift">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nossa Equipe</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conheça as pessoas que trabalham incansavelmente para 
                transformar a experiência odontológica no Brasil.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member) => (
                <Card key={member.name} className="text-center hover-lift">
                  <CardContent className="p-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Nossa Jornada</h2>
              <p className="text-lg text-muted-foreground">
                A evolução da Doutorizze ao longo dos anos
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <div className="w-px h-16 bg-border"></div>
                </div>
                <div>
                  <div className="text-sm text-primary font-semibold mb-1">2020</div>
                  <h4 className="font-semibold mb-2">Fundação da Doutorizze</h4>
                  <p className="text-muted-foreground">
                    Início da jornada com o objetivo de democratizar o acesso à saúde bucal.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <div className="w-px h-16 bg-border"></div>
                </div>
                <div>
                  <div className="text-sm text-primary font-semibold mb-1">2021</div>
                  <h4 className="font-semibold mb-2">Primeira Expansão</h4>
                  <p className="text-muted-foreground">
                    Chegamos a 5000 pacientes atendidos e 50 clínicas parceiras.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <div className="w-px h-16 bg-border"></div>
                </div>
                <div>
                  <div className="text-sm text-primary font-semibold mb-1">2022</div>
                  <h4 className="font-semibold mb-2">Crescimento Nacional</h4>
                  <p className="text-muted-foreground">
                    Expansão para 10 estados e implementação de novos recursos.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
                <div>
                  <div className="text-sm text-primary font-semibold mb-1">2024</div>
                  <h4 className="font-semibold mb-2">Liderança no Mercado</h4>
                  <p className="text-muted-foreground">
                    Mais de 50.000 pacientes atendidos e presença em 15 estados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Transformar seu Sorriso?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se aos milhares de brasileiros que já encontraram 
              o dentista ideal através da nossa plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Encontrar Dentista
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Phone className="h-4 w-4 mr-2" />
                Falar Conosco
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}