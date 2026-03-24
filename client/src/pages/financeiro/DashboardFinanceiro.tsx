import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

export default function DashboardFinanceiro() {
  const { data: summary, isLoading: loadingSummary } = trpc.financial.summary.useQuery({});
  const { data: overdue, isLoading: loadingOverdue } = trpc.financial.overdue.useQuery();
  const { data: byProperty, isLoading: loadingByProp } = trpc.financial.byProperty.useQuery();

  if (loadingSummary) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const s = summary || { totalReceitas: 0, totalDespesas: 0, saldo: 0, aReceber: 0, aPagar: 0, atrasados: 0 };

  // Agrupar por property para resumo por centro de custo
  const costCenterMap = new Map<string, { entradas: number; saidas: number }>();
  if (byProperty) {
    for (const row of byProperty) {
      const key = row.costCenter || `imovel_${row.propertyId}` || "administracao_central";
      if (!costCenterMap.has(key)) costCenterMap.set(key, { entradas: 0, saidas: 0 });
      const entry = costCenterMap.get(key)!;
      const total = parseFloat(row.totalAmount || "0");
      if (row.type === "entrada") entry.entradas += total;
      else entry.saidas += total;
    }
  }

  const costCenters = Array.from(costCenterMap.entries()).map(([key, val]) => ({
    name: key === "administracao_central" ? "Administração Central" : key.replace("imovel_", "Imóvel #"),
    entradas: val.entradas,
    saidas: val.saidas,
    saldo: val.entradas - val.saidas,
  })).sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Receitas Pagas</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(s.totalReceitas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Despesas Pagas</span>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(s.totalDespesas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Saldo</span>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <p className={`text-lg font-bold ${s.saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(s.saldo)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">A Receber</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(s.aReceber)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">A Pagar</span>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(s.aPagar)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Atrasados</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(s.atrasados)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Atrasados */}
      {overdue && overdue.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Lançamentos Atrasados ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Descrição</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium">Categoria</th>
                    <th className="pb-2 font-medium">Vencimento</th>
                    <th className="pb-2 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 max-w-[200px] truncate">{entry.description}</td>
                      <td className="py-2">
                        <Badge variant={entry.type === "entrada" ? "default" : "destructive"} className="text-xs">
                          {entry.type === "entrada" ? "Receber" : "Pagar"}
                        </Badge>
                      </td>
                      <td className="py-2 capitalize text-muted-foreground">{entry.category?.replace("_", " ")}</td>
                      <td className="py-2 text-red-600 font-medium">{formatDate(entry.dueDate)}</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(parseFloat(String(entry.amount)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo por Centro de Custo */}
      {costCenters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo por Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Centro de Custo</th>
                    <th className="pb-2 font-medium text-right">Entradas</th>
                    <th className="pb-2 font-medium text-right">Saídas</th>
                    <th className="pb-2 font-medium text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {costCenters.map((cc) => (
                    <tr key={cc.name} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 font-medium">{cc.name}</td>
                      <td className="py-2 text-right text-emerald-600">{formatCurrency(cc.entradas)}</td>
                      <td className="py-2 text-right text-red-600">{formatCurrency(cc.saidas)}</td>
                      <td className={`py-2 text-right font-medium ${cc.saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatCurrency(cc.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {(!overdue || overdue.length === 0) && costCenters.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum lançamento financeiro</h3>
            <p className="text-sm text-muted-foreground">
              Comece adicionando lançamentos em "Contas a Receber" ou "Contas a Pagar", ou importe um extrato bancário na aba "Conciliação".
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
