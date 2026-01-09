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
    <section className="py-24 bg-[#0F0F23] relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-6">
            O que nossos <span className="text-[#E94560]">pacientes</span> dizem
          </h2>
          <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
            Milhares de pessoas já realizaram seus sonhos de ter um sorriso perfeito com nossa plataforma segura e inovadora.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white/[0.03] border-white/[0.06] hover:border-[#E94560]/30 transition-all duration-500 rounded-[2rem] overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={18}
                        className={index < testimonial.rating
                          ? "fill-[#F9B500] text-[#F9B500]"
                          : "text-white/10"
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="text-white/60 mb-8 leading-relaxed italic text-lg">
                  "{testimonial.comment}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E94560] to-[#FB923C] flex items-center justify-center text-white font-black text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-lg leading-none">{testimonial.name}</p>
                    <p className="text-sm text-white/30 font-medium">
                      {testimonial.treatment} • {testimonial.clinic}
                    </p>
                  </div>
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