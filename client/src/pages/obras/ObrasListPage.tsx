import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, HardHat, MapPin, Key, KeyRound, Archive, RotateCcw, Eye, Wrench, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const progressLabels: Record<string, { label: string; color: string }> = {
  avancada: { label: "Avançada", color: "bg-green-500 text-white" },
  em_dia: { label: "Em Dia", color: "bg-yellow-500 text-white" },
  atrasada: { label: "Atrasada", color: "bg-orange-500 text-white" },
  totalmente_atrasada: { label: "Tot. Atrasada", color: "bg-red-500 text-white" },
};

const statusLabels: Record<string, string> = {
  em_andamento: "Em Andamento",
  paralisada: "Paralisada",
  concluida: "Concluída",
};

const typeLabels: Record<string, string> = {
  residencial: "Residencial",
  comercial: "Comercial",
  reforma: "Reforma",
  galpao: "Galpão",
  loteamento: "Loteamento",
  outro: "Outro",
};

export default function ObrasListPage({ archived }: { archived: boolean }) {
  const obras = trpc.constructions.list.useQuery({ archived });
  const contractors = trpc.contractors.list.useQuery();
  const architects = trpc.architects.list.useQuery();
  const updateMut = trpc.constructions.update.useMutation({
    onSuccess: () => { obras.refetch(); toast.success("Obra atualizada!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.constructions.delete.useMutation({
    onSuccess: () => { obras.refetch(); toast.success("Obra excluída!"); },
  });

  const [detailId, setDetailId] = useState<number | null>(null);
  const detailObra = obras.data?.find(o => o.id === detailId);

  if (obras.isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6" /></div>;

  const list = obras.data ?? [];

  const getContractorName = (id: number | null) => contractors.data?.find(c => c.id === id)?.name ?? "—";
  const getArchitectName = (id: number | null) => architects.data?.find(a => a.id === id)?.name ?? "—";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{archived ? "Obras Arquivadas" : "Obras em Andamento"}</h2>

      {list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HardHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{archived ? "Nenhuma obra arquivada." : "Nenhuma obra em andamento."}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map(obra => {
            const prog = progressLabels[obra.progress] ?? { label: obra.progress, color: "bg-muted" };
            return (
              <div key={obra.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{obra.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {typeLabels[obra.constructionType] ?? obra.constructionType} · {statusLabels[obra.status] ?? obra.status}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${prog.color}`}>{prog.label}</span>
                </div>

                {obra.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{obra.address}{obra.city ? `, ${obra.city}` : ""}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    {obra.hasKey ? <Key className="h-3.5 w-3.5 text-green-600" /> : <KeyRound className="h-3.5 w-3.5 text-red-500" />}
                    {obra.hasKey ? "Temos chave" : "Sem chave"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {obra.contractorId && (
                    <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{getContractorName(obra.contractorId)}</span>
                  )}
                  {obra.architectId && (
                    <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{getArchitectName(obra.architectId)}</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setDetailId(obra.id)}>
                    <Eye className="h-3 w-3 mr-1" /> Detalhes
                  </Button>
                  {!archived ? (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => updateMut.mutate({ id: obra.id, isArchived: true })}>
                      <Archive className="h-3 w-3 mr-1" /> Arquivar
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => updateMut.mutate({ id: obra.id, isArchived: false })}>
                      <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog de detalhes */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailObra?.title}</DialogTitle>
          </DialogHeader>
          {detailObra && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Tipo:</span> {typeLabels[detailObra.constructionType]}</div>
                <div><span className="text-muted-foreground">Status:</span> {statusLabels[detailObra.status]}</div>
                <div><span className="text-muted-foreground">Andamento:</span> {progressLabels[detailObra.progress]?.label}</div>
                <div><span className="text-muted-foreground">Chave:</span> {detailObra.hasKey ? "Sim" : "Não"}</div>
              </div>
              {detailObra.address && <div><span className="text-muted-foreground">Endereço:</span> {detailObra.address}{detailObra.city ? `, ${detailObra.city}` : ""}{detailObra.state ? ` - ${detailObra.state}` : ""}</div>}
              {detailObra.contractorId && <div><span className="text-muted-foreground">Empreiteiro:</span> {getContractorName(detailObra.contractorId)}</div>}
              {detailObra.architectId && <div><span className="text-muted-foreground">Arquiteta:</span> {getArchitectName(detailObra.architectId)}</div>}
              {detailObra.startDate && <div><span className="text-muted-foreground">Início:</span> {new Date(detailObra.startDate).toLocaleDateString("pt-BR")}</div>}
              {detailObra.expectedEndDate && <div><span className="text-muted-foreground">Previsão:</span> {new Date(detailObra.expectedEndDate).toLocaleDateString("pt-BR")}</div>}
              {detailObra.description && <div><span className="text-muted-foreground">Descrição:</span> {detailObra.description}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
