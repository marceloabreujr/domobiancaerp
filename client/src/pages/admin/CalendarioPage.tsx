import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Calendar, CheckCircle2, Circle, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  vencimento_contrato: "Vencimento de Contrato",
  renovacao_licenca: "Renovação de Licença",
  manutencao: "Manutenção",
  marco_projeto: "Marco de Projeto",
  reuniao: "Reunião",
  outro: "Outro",
};

const TYPE_COLORS: Record<string, string> = {
  vencimento_contrato: "bg-red-500/10 text-red-600 border-red-200",
  renovacao_licenca: "bg-amber-500/10 text-amber-600 border-amber-200",
  manutencao: "bg-blue-500/10 text-blue-600 border-blue-200",
  marco_projeto: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  reuniao: "bg-purple-500/10 text-purple-600 border-purple-200",
  outro: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function CalendarioPage() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.calendar.list.useQuery();
  const createEvent = trpc.calendar.create.useMutation({ onSuccess: () => { utils.calendar.list.invalidate(); toast.success("Evento criado."); setShowForm(false); } });
  const updateEvent = trpc.calendar.update.useMutation({ onSuccess: () => { utils.calendar.list.invalidate(); } });
  const deleteEvent = trpc.calendar.delete.useMutation({ onSuccess: () => { utils.calendar.list.invalidate(); toast.success("Evento removido."); } });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", eventType: "outro" as string, alertDaysBefore: 7 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = (events || []).filter((e) => !e.isCompleted && new Date(e.eventDate) >= today);
  const past = (events || []).filter((e) => e.isCompleted || new Date(e.eventDate) < today);

  const getDaysUntil = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / 86400000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{upcoming.length} evento(s) pendente(s)</p>
        <Button size="sm" onClick={() => { setForm({ title: "", description: "", eventDate: "", eventType: "outro", alertDaysBefore: 7 }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo Evento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum evento cadastrado</p>
          <p className="text-sm mt-1">Crie eventos para acompanhar prazos e compromissos.</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Próximos Eventos</h3>
              <div className="space-y-2">
                {upcoming.map((ev) => {
                  const days = getDaysUntil(ev.eventDate);
                  const isUrgent = days <= 7 && days >= 0;
                  return (
                    <div key={ev.id} className={`border rounded-xl p-4 flex items-start gap-3 transition-colors hover:bg-muted/20 ${isUrgent ? "border-amber-300 bg-amber-50/50" : "border-border"}`}>
                      <button onClick={() => updateEvent.mutate({ id: ev.id, isCompleted: true })} className="mt-0.5 shrink-0">
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">{ev.title}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[ev.eventType]}`}>
                            {TYPE_LABELS[ev.eventType]}
                          </span>
                        </div>
                        {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
                        <p className="text-xs mt-1.5">
                          <span className="text-muted-foreground">{new Date(ev.eventDate).toLocaleDateString("pt-BR")}</span>
                          {days === 0 && <span className="ml-2 text-red-600 font-medium">Hoje!</span>}
                          {days === 1 && <span className="ml-2 text-amber-600 font-medium">Amanhã</span>}
                          {days > 1 && days <= 7 && <span className="ml-2 text-amber-600">em {days} dias</span>}
                          {days > 7 && <span className="ml-2 text-muted-foreground">em {days} dias</span>}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => { if (confirm("Remover?")) deleteEvent.mutate({ id: ev.id }); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past / completed */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Concluídos / Passados</h3>
              <div className="space-y-2">
                {past.slice(0, 10).map((ev) => (
                  <div key={ev.id} className="border border-border rounded-xl p-4 flex items-start gap-3 opacity-60">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground line-through">{ev.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(ev.eventDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => deleteEvent.mutate({ id: ev.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Event Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Renovar alvará" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </div>
            <div>
              <Label>Alertar quantos dias antes?</Label>
              <Input type="number" value={form.alertDaysBefore} onChange={(e) => setForm({ ...form, alertDaysBefore: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.title.trim() || !form.eventDate) { toast.error("Título e data são obrigatórios."); return; }
              createEvent.mutate({ ...form, eventType: form.eventType as any });
            }} disabled={createEvent.isPending}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
