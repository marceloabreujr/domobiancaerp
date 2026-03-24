import DashboardLayout from "@/components/DashboardLayout";
import ModulePlaceholder from "@/components/ModulePlaceholder";
import { ClipboardList } from "lucide-react";

export default function Administrativo() {
  return (
    <DashboardLayout>
      <ModulePlaceholder
        title="Administrativo"
        description="Documentos, contratos, equipe e arquivo geral."
        icon={ClipboardList}
      />
    </DashboardLayout>
  );
}
