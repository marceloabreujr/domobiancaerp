import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Calendar, CheckCircle2, Circle, Trash2 } from "lucide-react";

export default function CalendarioTarefasPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "normal" as "normal" | "urgente", negocioId: undefined as number | undefined });

  const { data: tasks, isLoading } = trpc.businessTasks.list.useQuery({});
  const { data: deals } = trpc.negocios.list.useQuery({ isArchived: false });
  const utils = trpc.useUtils();

  const createMut = trpc.businessTasks.create.useMutation({
    onSuccess: () => { toast.success("Tarefa criada!"); utils.businessTasks.list.invalidate(); setShowForm(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMut = trpc.businessTasks.update.useMutation({
    onSuccess: () => { utils.businessTasks.list.invalidate(); },
  });
  const deleteMut = trpc.businessTasks.delete.useMutation({
    onSuccess: () => { toast.success("Tarefa excluída"); utils.businessTasks.list.invalidate(); },
  });

  const toggleComplete = (id: number, current: boolean | null) => {
    updateMut.mutate({ id, isCompleted: !current });
  };

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const today = new Date().toISOString().split("T")[0];
  const pending = (tasks || []).filter((t) => !t.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const completed = (tasks || []).filter((t) => t.isCompleted);

  const getDealName = (id: number | null) => {
    if (!id) return "";
    return deals?.find((d) => d.id === id)?.title || "";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> Calendário de Tarefas
        </h1>
        <Button onClick={() => { setForm({ title: "", description: "", dueDate: "", priority: "normal", negocioId: undefined }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
        </Button>
      </div>

      {/* Pending tasks */}
      <h2 className="font-semibold text-lg mb-3">Pendentes ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-6">Nenhuma tarefa pendente</p>
      ) : (
        <div className="space-y-2 mb-6">
          {pending.map((t) => {
            const isOverdue = t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] < today;
            const isUrgent = t.priority === "urgente";
            return (
              <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isOverdue ? "border-red-300 bg-red-50" : isUrgent ? "border-orange-300 bg-orange-50" : "border-border bg-card"}`}>
                <button onClick={() => toggleComplete(t.id, t.isCompleted)} className="shrink-0">
                  <Circle className={`h-5 w-5 ${isOverdue ? "text-red-400" : "text-muted-foreground"}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{t.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {t.dueDate && <span className={isOverdue ? "text-red-600 font-bold" : ""}>{new Date(t.dueDate).toLocaleDateString("pt-BR")}</span>}
                    {isUrgent && <span className="text-orange-600 font-bold">URGENTE</span>}
                    {t.negocioId && <span>• {getDealName(t.negocioId)}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: t.id })}>
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <>
          <h2 className="font-semibold text-lg mb-3 text-muted-foreground">Concluídas ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 opacity-60">
                <button onClick={() => toggleComplete(t.id, t.isCompleted)} className="shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </button>
                <div className="flex-1">
                  <p className="font-medium text-sm line-through">{t.title}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: t.id })}>
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New task dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div><Label>Descrição</Label><Input value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Data *</Label><Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></div>
              <div>
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Negócio Vinculado</Label>
              <Select value={form.negocioId?.toString() || "none"} onValueChange={(v) => set("negocioId", v === "none" ? undefined : parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(deals || []).map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={() => {
                if (!form.title.trim() || !form.dueDate) { toast.error("Título e data são obrigatórios"); return; }
                createMut.mutate({ ...form, negocioId: form.negocioId || undefined, description: form.description || undefined });
              }} disabled={createMut.isPending}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
