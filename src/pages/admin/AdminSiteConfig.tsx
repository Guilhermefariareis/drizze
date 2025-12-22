import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteConfigManager from "@/components/admin/SiteConfigManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import SupportTicketsManager from "@/components/admin/SupportTicketsManager";
import { Settings, MessageSquare, Users, CreditCard } from "lucide-react";

const AdminSiteConfig = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader hideSearch />
        
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                Configurações do Site
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                Gerencie as configurações gerais do site, depoimentos e conteúdo dinâmico
              </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-0.5 h-auto p-1">
                <TabsTrigger value="general" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm px-2 py-2 sm:py-3">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Config</span>
                  <span className="hidden sm:inline">Configurações</span>
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm px-2 py-2 sm:py-3">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Deptos</span>
                  <span className="hidden sm:inline">Depoimentos</span>
                </TabsTrigger>
                <TabsTrigger value="partnership" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm px-2 py-2 sm:py-3">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Parc</span>
                  <span className="hidden sm:inline">Parcerias</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm px-2 py-2 sm:py-3">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:hidden">Pag</span>
                  <span className="hidden sm:inline">Pagamentos</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <SiteConfigManager />
              </TabsContent>

              <TabsContent value="testimonials" className="space-y-6">
                <TestimonialsManager />
              </TabsContent>

              <TabsContent value="partnership" className="space-y-6">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Configurações de Parceria
                  </h3>
                  <p className="text-muted-foreground">
                    Em desenvolvimento - Gerenciamento de planos de parceria
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Configurações de Pagamento
                  </h3>
                  <p className="text-muted-foreground">
                    Em desenvolvimento - Configurações do sistema de pagamento
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSiteConfig;