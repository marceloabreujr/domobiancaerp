import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTodo, Plus, Loader2, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const priorityColors: Record<string, string> = { baixa: "text-blue-500", media: "text-amber-500", alta: "text-red-500" };
const priorityLabels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta" };

export default function TodosPage() {
  const utils = trpc.useUtils();
  const { data: todos, isLoading } = trpc.propertyTodos.list.useQuery();
  const { data: properties } = trpc.properties.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", propertyId: "", dueDate: "", priority: "media" });

  const createMutation = trpc.propertyTodos.create.useMutation({
    onSuccess: () => { utils.propertyTodos.list.invalidate(); setForm({ title: "", description: "", propertyId: "", dueDate: "", priority: "media" }); setShowForm(false); toast.success("Tarefa criada!"); },
  });
  const updateMutation = trpc.propertyTodos.update.useMutation({
    onSuccess: () => utils.propertyTodos.list.invalidate(),
  });
  const deleteMutation = trpc.propertyTodos.delete.useMutation({
    onSuccess: () => { utils.propertyTodos.list.invalidate(); toast.success("Tarefa excluída."); },
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const pending = todos?.filter(t => !t.isCompleted) ?? [];
  const completed = todos?.filter(t => t.isCompleted) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><ListTodo className="h-5 w-5" />To-Do List</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />{showForm ? "Cancelar" : "Nova Tarefa"}
        </Button>
      </div>

      {showForm && (
        <div className="border border-border rounded-xl p-4 bg-card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">Título *</Label><Input className="h-9" value={form.title} onChange={e => set("title", e.target.value)} placeholder="O que precisa ser feito?" /></div>
            <div><Label className="text-xs">Imóvel (opcional)</Label>
              <Select value={form.propertyId} onValueChange={v => set("propertyId", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {properties?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Prioridade</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Prazo</Label><Input type="date" className="h-9" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} /></div>
            <div><Label className="text-xs">Descrição</Label><Input className="h-9" value={form.description} onChange={e => set("description", e.target.value)} /></div>
          </div>
          <Button onClick={() => {
            if (!form.title.trim()) { toast.error("Informe o título."); return; }
            createMutation.mutate({
              title: form.title,
              description: form.description || undefined,
              propertyId: form.propertyId && form.propertyId !== "none" ? parseInt(form.propertyId) : undefined,
              dueDate: form.dueDate || undefined,
              priority: form.priority as any,
            });
          }} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}Criar Tarefa
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Pendentes ({pending.length})</h3>
              {pending.map(t => {
                const prop = properties?.find(p => p.id === t.propertyId);
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <button onClick={() => updateMutation.mutate({ id: t.id, isCompleted: true })} className="shrink-0">
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {prop && <span>{prop.title}</span>}
                        {t.dueDate && <span>Prazo: {new Date(t.dueDate).toLocaleDateString("pt-BR")}</span>}
                        <span className={priorityColors[t.priority]}>{priorityLabels[t.priority]}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => deleteMutation.mutate({ id: t.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                );
              })}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Concluídas ({completed.length})</h3>
              {completed.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <button onClick={() => updateMutation.mutate({ id: t.id, isCompleted: false })} className="shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </button>
                  <span className="text-sm line-through text-muted-foreground flex-1">{t.title}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => deleteMutation.mutate({ id: t.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}

          {pending.length === 0 && completed.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma tarefa. Crie a primeira!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
