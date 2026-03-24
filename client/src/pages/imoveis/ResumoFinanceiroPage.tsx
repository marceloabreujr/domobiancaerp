import { trpc } from "@/lib/trpc";
import { BarChart3, Loader2, Building2, DollarSign, Percent, FileText } from "lucide-react";

export default function ResumoFinanceiroPage() {
  const { data: summary, isLoading: loadingSummary } = trpc.rentalContracts.financialSummary.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.properties.stats.useQuery();

  const isLoading = loadingSummary || loadingStats;

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" />Resumo Financeiro</h2>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          {/* Cards de receita */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-emerald-100"><DollarSign className="h-4 w-4 text-emerald-600" /></div>
                <span className="text-sm text-muted-foreground">Receita Aluguéis</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(summary?.totalRentIncome ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">mensal</p>
            </div>

            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-100"><Building2 className="h-4 w-4 text-blue-600" /></div>
                <span className="text-sm text-muted-foreground">Condomínios</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(summary?.totalCondoIncome ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">recebido de inquilinos</p>
            </div>

            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-purple-100"><Percent className="h-4 w-4 text-purple-600" /></div>
                <span className="text-sm text-muted-foreground">Taxas Admin</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(summary?.totalAdminFees ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">de imóveis de terceiros</p>
            </div>

            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-amber-100"><FileText className="h-4 w-4 text-amber-600" /></div>
                <span className="text-sm text-muted-foreground">Contratos Ativos</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{summary?.activeContracts ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">em vigência</p>
            </div>
          </div>

          {/* Estatísticas de imóveis */}
          <div className="border border-border rounded-xl p-5 bg-card">
            <h3 className="font-semibold mb-4">Distribuição de Imóveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total", value: stats?.total ?? 0, color: "text-foreground" },
                { label: "Disponíveis", value: stats?.disponivel ?? 0, color: "text-emerald-600" },
                { label: "Alugados", value: stats?.alugado ?? 0, color: "text-blue-600" },
                { label: "À Venda", value: stats?.a_venda ?? 0, color: "text-amber-600" },
                { label: "Arquivados", value: stats?.arquivado ?? 0, color: "text-gray-500" },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
