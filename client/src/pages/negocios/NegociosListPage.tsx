import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Search, Archive, ArchiveRestore, Trash2, Eye, TrendingUp, MapPin } from "lucide-react";

const phaseLabels: Record<string, string> = {
  prospeccao: "Prospecção", analise: "Análise", negociacao: "Negociação",
  due_diligence: "Due Diligence", aprovado: "Aprovado", fechado: "Fechado", cancelado: "Cancelado",
};
const phaseColors: Record<string, string> = {
  prospeccao: "bg-blue-100 text-blue-700", analise: "bg-yellow-100 text-yellow-700",
  negociacao: "bg-orange-100 text-orange-700", due_diligence: "bg-purple-100 text-purple-700",
  aprovado: "bg-green-100 text-green-700", fechado: "bg-gray-100 text-gray-700",
  cancelado: "bg-red-100 text-red-700",
};
const opLabels: Record<string, string> = {
  compra: "Compra", venda: "Venda", permuta: "Permuta", incorporacao: "Incorporação",
  loteamento: "Loteamento", reforma: "Reforma", outro: "Outro",
};
const prioLabels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
const prioColors: Record<string, string> = {
  baixa: "text-gray-500", media: "text-blue-500", alta: "text-orange-500", urgente: "text-red-600 font-bold",
};

function formatCurrency(val: string | null | undefined) {
  if (!val) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(val));
}

export default function NegociosListPage(props: { archived?: boolean } & Record<string, any>) {
  const archived = props.archived ?? false;
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: deals, isLoading } = trpc.negocios.list.useQuery({ isArchived: archived });
  const { data: detail } = trpc.negocios.get.useQuery({ id: selectedId! }, { enabled: !!selectedId });
  const { data: viab } = trpc.viabilidade.get.useQuery({ negocioId: selectedId! }, { enabled: !!selectedId });
  const { data: captadoresList } = trpc.captadores.list.useQuery();
  const utils = trpc.useUtils();

  const archiveMut = trpc.negocios.archive.useMutation({
    onSuccess: () => { toast.success("Negócio arquivado"); utils.negocios.list.invalidate(); setSelectedId(null); },
  });
  const unarchiveMut = trpc.negocios.unarchive.useMutation({
    onSuccess: () => { toast.success("Negócio restaurado"); utils.negocios.list.invalidate(); setSelectedId(null); },
  });
  const deleteMut = trpc.negocios.delete.useMutation({
    onSuccess: () => { toast.success("Negócio excluído"); utils.negocios.list.invalidate(); setSelectedId(null); },
  });
  const updateMut = trpc.negocios.update.useMutation({
    onSuccess: () => { toast.success("Fase atualizada"); utils.negocios.list.invalidate(); utils.negocios.get.invalidate(); },
  });

  const filtered = (deals || []).filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.address || "").toLowerCase().includes(search.toLowerCase());
    const matchPhase = phaseFilter === "all" || d.phase === phaseFilter;
    return matchSearch && matchPhase;
  });

  const getCaptadorName = (id: number | null) => {
    if (!id) return "—";
    return captadoresList?.find((c) => c.id === id)?.name || "—";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {archived ? "Negócios Arquivados" : "Negócios Ativos"}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome ou endereço..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Fase" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Fases</SelectItem>
            {Object.entries(phaseLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">Nenhum negócio encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((deal) => (
            <div key={deal.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedId(deal.id)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground truncate flex-1">{deal.title}</h3>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${phaseColors[deal.phase] || "bg-gray-100 text-gray-700"}`}>
                  {phaseLabels[deal.phase] || deal.phase}
                </span>
              </div>
              {deal.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{deal.address}{deal.city ? `, ${deal.city}` : ""}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{opLabels[deal.operationType] || deal.operationType}</span>
                <span className={prioColors[deal.priority] || ""}>{prioLabels[deal.priority] || deal.priority}</span>
              </div>
              {deal.estimatedVGV && (
                <div className="mt-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">VGV Estimado: </span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.estimatedVGV)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.title || "Detalhes do Negócio"}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              {/* Phase update */}
              <div className="flex items-center gap-3">
                <Label className="shrink-0">Fase:</Label>
                <Select
                  value={detail.phase}
                  onValueChange={(v) => updateMut.mutate({ id: detail.id, phase: v as any })}
                >
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(phaseLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Titularidade:</span> <span className="font-medium">{detail.ownership === "proprio" ? "Próprio" : "Terceiros"}</span></div>
                <div><span className="text-muted-foreground">Operação:</span> <span className="font-medium">{opLabels[detail.operationType] || detail.operationType}</span></div>
                <div><span className="text-muted-foreground">Prioridade:</span> <span className={`font-medium ${prioColors[detail.priority]}`}>{prioLabels[detail.priority]}</span></div>
                <div><span className="text-muted-foreground">Captador:</span> <span className="font-medium">{getCaptadorName(detail.captadorId)}</span></div>
                {detail.address && <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span> <span className="font-medium">{detail.address}{detail.city ? `, ${detail.city}` : ""}{detail.state ? ` - ${detail.state}` : ""}</span></div>}
              </div>

              {/* Technical data */}
              {(detail.totalArea || detail.usableArea || detail.zoning) && (
                <div className="border-t border-border pt-3">
                  <h4 className="font-semibold text-sm mb-2">Dados Técnicos</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {detail.totalArea && <div><span className="text-muted-foreground">Área Total:</span> {detail.totalArea} m²</div>}
                    {detail.usableArea && <div><span className="text-muted-foreground">Área Útil:</span> {detail.usableArea} m²</div>}
                    {detail.zoning && <div><span className="text-muted-foreground">Zoneamento:</span> {detail.zoning}</div>}
                    {detail.constructivePotential && <div><span className="text-muted-foreground">Pot. Construtivo:</span> {detail.constructivePotential}</div>}
                  </div>
                </div>
              )}

              {/* Financial indicators */}
              <div className="border-t border-border pt-3">
                <h4 className="font-semibold text-sm mb-2">Indicadores Financeiros</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Custo Oportunidade:</span> {formatCurrency(detail.opportunityCost)}</div>
                  <div><span className="text-muted-foreground">Valor de Mercado:</span> {formatCurrency(detail.marketValue)}</div>
                  <div><span className="text-muted-foreground">Investimento Máx:</span> {formatCurrency(detail.maxInvestment)}</div>
                  <div><span className="text-muted-foreground">VGV Estimado:</span> {formatCurrency(detail.estimatedVGV)}</div>
                  {detail.tirPercent && <div><span className="text-muted-foreground">TIR:</span> {detail.tirPercent}%</div>}
                  {detail.profitMarginPercent && <div><span className="text-muted-foreground">Margem:</span> {detail.profitMarginPercent}%</div>}
                </div>
              </div>

              {/* Viabilidade EVE */}
              {viab && (
                <div className="border-t border-border pt-3">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    Motor de Viabilidade (EVE)
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      viab.viabilityStatus === "verde" ? "bg-green-100 text-green-700" :
                      viab.viabilityStatus === "amarelo" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {viab.viabilityStatus === "verde" ? "VIÁVEL" : viab.viabilityStatus === "amarelo" ? "ATENÇÃO" : "INVIÁVEL"}
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Custo Total:</span> {formatCurrency(viab.totalCost)}</div>
                    <div><span className="text-muted-foreground">Lucro Líquido:</span> {formatCurrency(viab.netProfit)}</div>
                    <div><span className="text-muted-foreground">Margem:</span> {viab.profitMargin}%</div>
                    <div><span className="text-muted-foreground">ROI:</span> {viab.roi}%</div>
                    <div><span className="text-muted-foreground">TIR:</span> {viab.tir}%</div>
                  </div>
                </div>
              )}

              {/* Next action */}
              {detail.nextAction && (
                <div className="border-t border-border pt-3">
                  <h4 className="font-semibold text-sm mb-1">Próxima Ação</h4>
                  <p className="text-sm">{detail.nextAction}</p>
                  {detail.nextActionDate && <p className="text-xs text-muted-foreground mt-1">Data: {new Date(detail.nextActionDate).toLocaleDateString("pt-BR")}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                {archived ? (
                  <Button variant="outline" size="sm" onClick={() => unarchiveMut.mutate({ id: detail.id })}>
                    <ArchiveRestore className="h-4 w-4 mr-1" /> Restaurar
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => archiveMut.mutate({ id: detail.id })}>
                    <Archive className="h-4 w-4 mr-1" /> Arquivar
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => { if (confirm("Excluir este negócio?")) deleteMut.mutate({ id: detail.id }); }}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
