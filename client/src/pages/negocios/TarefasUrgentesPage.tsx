import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, Circle, Trash2 } from "lucide-react";

export default function TarefasUrgentesPage() {
  const { data: tasks, isLoading } = trpc.businessTasks.list.useQuery({ isUrgent: true, isCompleted: false });
  const { data: deals } = trpc.negocios.list.useQuery({ isArchived: false });
  const utils = trpc.useUtils();

  const updateMut = trpc.businessTasks.update.useMutation({
    onSuccess: () => { utils.businessTasks.list.invalidate(); toast.success("Tarefa atualizada"); },
  });
  const deleteMut = trpc.businessTasks.delete.useMutation({
    onSuccess: () => { utils.businessTasks.list.invalidate(); toast.success("Tarefa excluída"); },
  });

  const getDealName = (id: number | null) => {
    if (!id) return "";
    return deals?.find((d) => d.id === id)?.title || "";
  };

  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-500" /> Tarefas Urgentes
      </h1>

      {(tasks || []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400" />
          <p className="text-lg">Nenhuma tarefa urgente pendente!</p>
          <p className="text-sm">Todas as tarefas urgentes foram concluídas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(tasks || []).map((t) => {
            const isOverdue = t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] < today;
            return (
              <div key={t.id} className={`flex items-center gap-3 p-4 rounded-lg border-2 ${isOverdue ? "border-red-400 bg-red-50" : "border-orange-300 bg-orange-50"}`}>
                <button onClick={() => updateMut.mutate({ id: t.id, isCompleted: true })} className="shrink-0">
                  <Circle className={`h-6 w-6 ${isOverdue ? "text-red-500" : "text-orange-500"}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{t.title}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {t.dueDate && (
                      <span className={isOverdue ? "text-red-600 font-bold" : "text-orange-600"}>
                        {isOverdue ? "ATRASADA — " : ""}
                        {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    {t.negocioId && <span className="text-muted-foreground">• {getDealName(t.negocioId)}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => updateMut.mutate({ id: t.id, isCompleted: true })}>
                    Concluir
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: t.id })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
