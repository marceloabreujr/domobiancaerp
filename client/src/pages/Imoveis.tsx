import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";
import { Building2 } from "lucide-react";

export default function Imoveis() {
  return (
    <DashboardLayout>
      <ModulePlaceholder
        title="Gestão de Imóveis"
        description="Cadastro de imóveis, contratos, locatários, boletos e alertas."
        icon={Building2}
      />
    </DashboardLayout>
  );
}
