import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";
import { Wallet } from "lucide-react";

export default function Financeiro() {
  return (
    <DashboardLayout>
      <ModulePlaceholder
        title="Financeiro"
        description="Contas a pagar e receber, fluxo de caixa, DRE, cartões e folha salarial."
        icon={Wallet}
      />
    </DashboardLayout>
  );
}
