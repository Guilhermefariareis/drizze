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
    <footer className="relative bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Seção 1: Informações da Empresa */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-2 mb-4">
              Informações da Empresa
            </h3>
            <div className="space-y-2">
              <p className="text-white font-semibold text-base">
                DOUTORIZZE TECNOLOGIA E SERVIÇOS LTDA
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">CNPJ:</span> 52.676.929/0001-39
              </p>
            </div>
          </div>

          {/* Seção 2: Endereço */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-2 mb-4">
              Endereço
            </h3>
            <div className="text-gray-300 text-sm space-y-1">
              <p><span className="font-medium">Logradouro:</span> R DOM PEDRO II, 112</p>
              <p><span className="font-medium">Complemento:</span> QUADRA 07 LOTE 01 APT 04</p>
              <p><span className="font-medium">Bairro:</span> VILA JARDIM SALVADOR</p>
              <p><span className="font-medium">Cidade/UF:</span> Goiás</p>
              <p><span className="font-medium">CEP:</span> 75.388-451</p>
            </div>
          </div>

          {/* Seção 3: Suporte */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-2 mb-4">
              Suporte
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Fale Conosco
              </button>
              <div className="flex flex-col space-y-2">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Política de Privacidade
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Termos de Serviço
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4: Sobre nossos serviços */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h3 className="text-white font-bold text-lg mb-4">
            Sobre nossos serviços
          </h3>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">
              Os serviços prestados pela Doutorizze compreendem as atividades de recepção e encaminhamento de propostas de operações de crédito 
              consignado e crédito direto ao consumidor, não podendo ser, em nenhuma circunstância, confundidas com as atividades desempenhadas 
              por instituições financeiras, nos termos do artigo 17º da Lei Federal 4.595/64, de 31 de dezembro de 1964. As operações de crédito 
              intermediadas pela Crédito Odonto, nos termos do artigo 2º da resolução nº 3.954 do BCB, são de exclusiva responsabilidade da instituição financeira de crédito.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Doutorizze. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;