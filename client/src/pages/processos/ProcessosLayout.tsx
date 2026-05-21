import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Gavel, Loader2 } from "lucide-react";
import CreditosKanban from "./CreditosKanban";

export default function ProcessosLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="border-b border-border bg-background px-4 pt-4 pb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Processos
          </h2>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <CreditosKanban />
        </main>
      </div>
    </DashboardLayout>
  );
}
