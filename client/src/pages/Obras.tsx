import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";
import { HardHat } from "lucide-react";

export default function Obras() {
  return (
    <DashboardLayout>
      <ModulePlaceholder
        title="Gestão de Obras"
        description="Cadastro de obras, relatórios, fotos, tarefas e empreiteiros."
        icon={HardHat}
      />
    </DashboardLayout>
  );
}
