import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";
import { Briefcase } from "lucide-react";

export default function Negocios() {
  return (
    <DashboardLayout>
      <ModulePlaceholder
        title="Gestão de Negócios"
        description="Pipeline de vendas, captadores, clientes e proprietários."
        icon={Briefcase}
      />
    </DashboardLayout>
  );
}
