import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";
import { Package } from "lucide-react";

export default function Suprimentos() {
  return (
    <DashboardLayout>
      <ModulePlaceholder
        title="Suprimentos"
        description="Pedidos de compra, fornecedores e materiais."
        icon={Package}
      />
    </DashboardLayout>
  );
}
