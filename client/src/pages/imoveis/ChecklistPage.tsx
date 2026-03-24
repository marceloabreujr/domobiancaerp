import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarCheck, Plus, Loader2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function ChecklistPage() {
  const now = new Date();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [newItem, setNewItem] = useState("");
  const utils = trpc.useUtils();

  const { data: properties } = trpc.properties.list.useQuery();
  const propId = selectedPropertyId ? parseInt(selectedPropertyId) : 0;

  const { data: checklist, isLoading } = trpc.propertyChecklists.list.useQuery(
    { propertyId: propId, month, year },
    { enabled: propId > 0 }
  );

  const createMutation = trpc.propertyChecklists.create.useMutation({
    onSuccess: () => { utils.propertyChecklists.list.invalidate(); setNewItem(""); toast.success("Item adicionado!"); },
  });

  const updateMutation = trpc.propertyChecklists.update.useMutation({
    onSuccess: () => utils.propertyChecklists.list.invalidate(),
  });

  const completed = checklist?.filter(c => c.isChecked).length ?? 0;
  const total = checklist?.length ?? 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Checklist Mensal</h2>

      <div className="flex items-center gap-3">
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger className="w-[250px] h-9"><SelectValue placeholder="Selecione um imóvel..." /></SelectTrigger>
          <SelectContent>
            {properties?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(month)} onValueChange={v => setMonth(parseInt(v))}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="number" className="w-[90px] h-9" value={year} onChange={e => setYear(parseInt(e.target.value) || now.getFullYear())} />
      </div>

      {propId > 0 && (
        <>
          {total > 0 && (
            <div className="text-sm text-muted-foreground">
              Progresso: <span className="font-medium text-foreground">{completed}/{total}</span> itens concluídos
              <div className="mt-1 w-full bg-muted rounded-full h-2">
                <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input className="h-9 flex-1" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Adicionar item ao checklist..." onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) createMutation.mutate({ propertyId: propId, month, year, item: newItem.trim() }); }} />
            <Button size="sm" disabled={!newItem.trim() || createMutation.isPending} onClick={() => { if (newItem.trim()) createMutation.mutate({ propertyId: propId, month, year, item: newItem.trim() }); }}>
              <Plus className="h-4 w-4 mr-1" />Adicionar
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : checklist && checklist.length > 0 ? (
            <div className="space-y-1">
              {checklist.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border border-border transition-colors ${item.isChecked ? "bg-muted/30" : "bg-card"}`}>
                  <button onClick={() => updateMutation.mutate({ id: item.id, isChecked: !item.isChecked })} className="shrink-0">
                    {item.isChecked ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.isChecked ? "line-through text-muted-foreground" : ""}`}>{item.item}</span>
                  {item.checkedAt && <span className="text-xs text-muted-foreground">{new Date(item.checkedAt).toLocaleDateString("pt-BR")}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum item no checklist. Adicione o primeiro!</p>
          )}
        </>
      )}

      {!propId && <p className="text-center text-sm text-muted-foreground py-12">Selecione um imóvel para ver o checklist mensal.</p>}
    </div>
  );
}
