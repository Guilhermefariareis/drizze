import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const Footer = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5561992061297"; // 61 9206-1297
    const message = "Olá! Preciso de suporte.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };



  return (
    <footer className="relative bg-[#0F0F23] border-t border-white/[0.06] mt-20">
      {/* Glow Effect */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#E94560]/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E94560] to-[#FB923C] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#E94560]/20">D</div>
              <span className="text-white font-black text-2xl tracking-tight">Doutorizze</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Elevando a odontologia através de tecnologia, crédito inteligente e conexões premium entre profissionais e pacientes.
            </p>
          </div>

          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">Empresa</h3>
            <div className="space-y-3">
              <p className="text-white font-bold text-sm">DOUTORIZZE TECNOLOGIA LTDA</p>
              <p className="text-white/40 text-xs">CNPJ: 52.676.929/0001-39</p>
              <div className="text-white/40 text-xs space-y-1">
                <p>R DOM PEDRO II, 112</p>
                <p>Goiás - CEP: 75.388-451</p>
              </div>
            </div>
          </div>

          {/* Support & Links */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">Suporte</h3>
            <div className="flex flex-col gap-3">
              <Link to="/privacy" className="text-white/40 hover:text-[#E94560] transition-colors text-sm">Política de Privacidade</Link>
              <Link to="/terms" className="text-white/40 hover:text-[#E94560] transition-colors text-sm">Termos de Serviço</Link>
              <Link to="/cookies" className="text-white/40 hover:text-[#E94560] transition-colors text-sm">Cookies</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-6 text-center lg:text-left">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">Contato</h3>
            <Button
              variant="v2-success"
              onClick={handleWhatsAppClick}
              className="w-full h-12 shadow-lg shadow-[#4ADE80]/10"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Fale Conosco
            </Button>
          </div>
        </div>

        {/* Institutional Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2rem] p-8 mb-12">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E94560]"></span>
            Nota Institucional
          </h4>
          <p className="text-white/30 text-xs leading-relaxed">
            Os serviços prestados pela Doutorizze compreendem as atividades de recepção e encaminhamento de propostas de operações de crédito
            consignado e crédito direto ao consumidor, não podendo ser, em nenhuma circunstância, confundidas com as atividades desempenhadas
            por instituições financeiras. As operações de crédito intermediadas, nos termos do artigo 2º da resolução nº 3.954 do BCB,
            são de exclusiva responsabilidade da instituição financeira de crédito.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-xs">
          <p>© 2025 Doutorizze. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]"></div>
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;