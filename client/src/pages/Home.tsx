import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import AlugueisKanban from "@/components/AlugueisKanban";
import { LayoutDashboard } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Usuário";

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="border-b border-border bg-background px-1 pb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Painel — Boletos de Aluguel
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Olá, {firstName}. Acompanhe os boletos do mês: a vencer, em atraso e em dia.
          </p>
        </div>
        <div className="pt-4">
          <AlugueisKanban />
        </div>
      </div>
    </DashboardLayout>
  );
}
