import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Plus, Check, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const taskTypeLabels: Record<string, string> = {
  marco: "Marco",
  prazo_entrega: "Prazo de Entrega",
  vistoria: "Vistoria",
  reuniao: "Reunião",
  outro: "Outro",
};

export default function CalendarioObrasPage() {
  const obras = trpc.constructions.list.useQuery({ archived: false });
  const tasks = trpc.constructionTasks.list.useQuery();
  const createMut = trpc.constructionTasks.create.useMutation({
    onSuccess: () => { tasks.refetch(); toast.success("Tarefa criada!"); setForm(f => ({ ...f, title: "", description: "" })); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.constructionTasks.update.useMutation({
    onSuccess: () => { tasks.refetch(); },
  });
  const deleteMut = trpc.constructionTasks.delete.useMutation({
    onSuccess: () => { tasks.refetch(); toast.success("Tarefa excluída!"); },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    constructionId: "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    taskType: "outro" as string,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) { toast.error("Preencha título e data"); return; }
    createMut.mutate({
      constructionId: form.constructionId ? Number(form.constructionId) : undefined,
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate,
      taskType: form.taskType as any,
    });
  };

  const now = new Date();
  const sortedTasks = [...(tasks.data ?? [])].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const pending = sortedTasks.filter(t => !t.isCompleted);
  const completed = sortedTasks.filter(t => t.isCompleted);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Calendário de Tarefas
        </h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Obra (opcional)</Label>
              <Select value={form.constructionId} onValueChange={v => setForm(f => ({ ...f, constructionId: v }))}>
                <SelectTrigger><SelectValue placeholder="Geral" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geral</SelectItem>
                  {obras.data?.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.taskType} onValueChange={v => setForm(f => ({ ...f, taskType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marco">Marco</SelectItem>
                  <SelectItem value="prazo_entrega">Prazo de Entrega</SelectItem>
                  <SelectItem value="vistoria">Vistoria</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Entrega da fundação" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createMut.isPending}>
              {createMut.isPending && <Loader2 className="animate-spin h-4 w-4 mr-1" />} Salvar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {tasks.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-5 w-5" /></div>
      ) : (
        <div className="space-y-6">
          {/* Pendentes */}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Pendentes ({pending.length})</h3>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa pendente.</p>
            ) : (
              <div className="space-y-2">
                {pending.map(t => {
                  const due = new Date(t.dueDate);
                  const isOverdue = due < now;
                  const obraNome = t.constructionId ? obras.data?.find(o => o.id === t.constructionId)?.title : "Geral";
                  return (
                    <div key={t.id} className={`flex items-center gap-3 bg-card border rounded-lg p-3 ${isOverdue ? "border-red-300 bg-red-50/50" : "border-border"}`}>
                      <button
                        onClick={() => updateMut.mutate({ id: t.id, isCompleted: true })}
                        className="h-5 w-5 rounded border-2 border-muted-foreground/30 hover:border-primary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{t.title}</span>
                          {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {obraNome} · {taskTypeLabels[t.taskType ?? "outro"]} · {due.toLocaleDateString("pt-BR")}
                          {isOverdue && <span className="text-red-500 font-medium ml-1">Atrasada</span>}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: t.id })}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Concluídas */}
          {completed.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Concluídas ({completed.length})</h3>
              <div className="space-y-2">
                {completed.map(t => {
                  const obraNome = t.constructionId ? obras.data?.find(o => o.id === t.constructionId)?.title : "Geral";
                  return (
                    <div key={t.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 opacity-60">
                      <div className="h-5 w-5 rounded bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm line-through">{t.title}</span>
                        <p className="text-xs text-muted-foreground">{obraNome} · {new Date(t.dueDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: t.id })}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
