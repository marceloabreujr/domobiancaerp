import { trpc } from "@/lib/trpc";
import { Bell, AlertTriangle, Clock, Loader2 } from "lucide-react";

export default function AlertasCobrancaPage() {
  const { data: alerts, isLoading } = trpc.rentalContracts.alerts.useQuery({ days: 30 });
  const { data: properties } = trpc.properties.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  const getPropertyTitle = (id: number) => properties?.find(p => p.id === id)?.title || `Imóvel #${id}`;
  const getTenantName = (id: number) => clients?.find(c => c.id === id)?.name || `Inquilino #${id}`;

  const typeLabels: Record<string, string> = {
    vencimento_aluguel: "Vencimento de Aluguel",
    reajuste_contrato: "Aniversário de Contrato (Reajuste)",
  };

  const getUrgencyClass = (days: number) => {
    if (days <= 3) return "border-red-300 bg-red-50";
    if (days <= 7) return "border-amber-300 bg-amber-50";
    return "border-blue-200 bg-blue-50";
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 3) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (days <= 7) return <Bell className="h-5 w-5 text-amber-500" />;
    return <Clock className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Bell className="h-5 w-5" />Alertas de Cobrança</h2>
      <p className="text-sm text-muted-foreground">Vencimentos e reajustes nos próximos 30 dias.</p>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue).map((alert, i) => (
            <div key={i} className={`border rounded-xl p-4 ${getUrgencyClass(alert.daysUntilDue)}`}>
              <div className="flex items-start gap-3">
                {getUrgencyIcon(alert.daysUntilDue)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{typeLabels[alert.type] || alert.type}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      alert.daysUntilDue <= 3 ? "bg-red-200 text-red-800" :
                      alert.daysUntilDue <= 7 ? "bg-amber-200 text-amber-800" :
                      "bg-blue-200 text-blue-800"
                    }`}>
                      {alert.daysUntilDue === 0 ? "HOJE" : alert.daysUntilDue === 1 ? "AMANHÃ" : `${alert.daysUntilDue} dias`}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{getPropertyTitle(alert.propertyId)}</span>
                    <span className="text-muted-foreground"> &mdash; {getTenantName(alert.tenantId)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Valor: <span className="font-medium text-foreground">R$ {parseFloat(alert.rentAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    {" "}&middot; Dia {alert.billingDay}
                  </p>
                  {alert.type === "reajuste_contrato" && (
                    <p className="text-xs text-amber-700 mt-1 font-medium">Verificar índice de reajuste aplicável (IGPM/IPCA/INPC)</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum alerta nos próximos 30 dias.</p>
        </div>
      )}
    </div>
  );
}
