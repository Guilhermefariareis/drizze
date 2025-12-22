import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  treatment: string | null;
  clinic: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback para dados estáticos em caso de erro
      setTestimonials([
        {
          id: 1,
          name: "Maria Silva",
          rating: 5,
          comment: "Excelente atendimento! Consegui parcelar meu tratamento ortodôntico sem complicações. A clínica é muito profissional.",
          treatment: "Ortodontia",
          clinic: "Odonto Center",
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Carregando depoimentos...</div>;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            O que nossos pacientes dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Milhares de pessoas já realizaram seus sonhos de ter um sorriso perfeito com nossa plataforma
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        className={index < testimonial.rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.comment}"
                </p>
                
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.treatment} - {testimonial.clinic}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;