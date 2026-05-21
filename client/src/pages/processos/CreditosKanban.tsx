import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { CreditoJudicial } from "../../../../drizzle/schema";

type Stage = CreditoJudicial["stage"];
type Group = "sem_registro" | "com_registro";

const STAGES: { id: Stage; label: string; group: Group }[] = [
  { id: "registro_em_andamento", label: "Registro em Andamento", group: "sem_registro" },
  { id: "desocupado", label: "Desocupado", group: "com_registro" },
  { id: "sem_acao_judicial", label: "Sem Ação Judicial", group: "com_registro" },
  { id: "acao_judicial_ordinaria", label: "Ação Judicial Ordinária", group: "com_registro" },
  { id: "execucao", label: "Execução", group: "com_registro" },
  { id: "com_pedido_desocupacao", label: "Com Pedido de Desocupação", group: "com_registro" },
];

// Coluna onde um crédito passa a estar quando o registro em cartório é finalizado
const FIRST_COM_REGISTRO: Stage = "sem_acao_judicial";

const emptyForm = {
  title: "",
  processNumber: "",
  address: "",
  value: "",
  stage: "registro_em_andamento" as Stage,
  notes: "",
};

function formatBRL(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function GroupPanel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "amber" | "green";
  children: React.ReactNode;
}) {
  const header =
    accent === "amber"
      ? "border-amber-300 bg-amber-100/70 text-amber-800"
      : "border-emerald-300 bg-emerald-100/70 text-emerald-800";
  const body =
    accent === "amber"
      ? "border-amber-200 bg-amber-50/40"
      : "border-emerald-200 bg-emerald-50/40";
  return (
    <div className="shrink-0">
      <div className={`rounded-t-lg border-x border-t px-3 py-2 ${header}`}>
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <div className={`flex gap-3 rounded-b-lg border p-3 ${body}`}>{children}</div>
    </div>
  );
}

export default function CreditosKanban() {
  const list = trpc.creditosJudiciais.list.useQuery();

  const createMut = trpc.creditosJudiciais.create.useMutation({
    onSuccess: () => {
      list.refetch();
      toast.success("Crédito criado!");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.creditosJudiciais.update.useMutation({
    onSuccess: () => list.refetch(),
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.creditosJudiciais.delete.useMutation({
    onSuccess: () => {
      list.refetch();
      toast.success("Crédito removido.");
    },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CreditoJudicial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  const openNew = (stage: Stage = "registro_em_andamento") => {
    setEditing(null);
    setForm({ ...emptyForm, stage });
    setDialogOpen(true);
  };

  const openEdit = (c: CreditoJudicial) => {
    setEditing(c);
    setForm({
      title: c.title,
      processNumber: c.processNumber ?? "",
      address: c.address ?? "",
      value: c.value ?? "",
      stage: c.stage,
      notes: c.notes ?? "",
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Informe o título do crédito.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      processNumber: form.processNumber.trim() || undefined,
      address: form.address.trim() || undefined,
      value: form.value.trim() || undefined,
      stage: form.stage,
      notes: form.notes.trim() || undefined,
    };
    if (editing) {
      updateMut.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            list.refetch();
            toast.success("Crédito atualizado!");
            setDialogOpen(false);
          },
        },
      );
    } else {
      createMut.mutate(payload);
    }
  };

  const moveTo = (id: number, stage: Stage) => {
    const card = (list.data ?? []).find((c) => c.id === id);
    if (!card || card.stage === stage) return;
    updateMut.mutate({ id, stage });
  };

  const items = list.data ?? [];

  const renderCard = (card: CreditoJudicial) => {
    const brl = formatBRL(card.value);
    return (
      <div
        key={card.id}
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", String(card.id))}
        className="cursor-grab rounded-md border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="flex-1 text-sm font-medium leading-tight">{card.title}</h4>
          <div className="flex shrink-0 gap-0.5">
            <button
              type="button"
              onClick={() => openEdit(card)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remover o crédito "${card.title}"?`)) {
                  deleteMut.mutate({ id: card.id });
                }
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              aria-label="Remover"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {card.processNumber && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span className="truncate">{card.processNumber}</span>
          </div>
        )}
        {card.address && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{card.address}</span>
          </div>
        )}
        {brl && <div className="mt-1.5 text-xs font-semibold text-emerald-600">{brl}</div>}
        {card.notes && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{card.notes}</p>
        )}

        {card.stage === "registro_em_andamento" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 h-7 w-full text-xs"
            onClick={() => moveTo(card.id, FIRST_COM_REGISTRO)}
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Registro finalizado
          </Button>
        )}
      </div>
    );
  };

  const renderColumn = (stage: { id: Stage; label: string }) => {
    const cards = items.filter((c) => c.stage === stage.id);
    const isOver = dragOverStage === stage.id;
    return (
      <div
        key={stage.id}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverStage(stage.id);
        }}
        onDragLeave={() =>
          setDragOverStage((s) => (s === stage.id ? null : s))
        }
        onDrop={(e) => {
          e.preventDefault();
          setDragOverStage(null);
          const id = Number(e.dataTransfer.getData("text/plain"));
          if (id) moveTo(id, stage.id);
        }}
        className={`flex w-64 shrink-0 flex-col rounded-lg border transition-colors ${
          isOver ? "border-primary bg-primary/5" : "border-border bg-background/60"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium">{stage.label}</span>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <div className="min-h-[140px] space-y-2 p-2">
          {cards.map(renderCard)}
          {cards.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground/60">
              Arraste cartões para cá
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Créditos Judiciais</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe o registro em cartório e a situação judicial de cada crédito.
            Arraste os cartões entre as colunas para atualizar o estado.
          </p>
        </div>
        <Button onClick={() => openNew()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Crédito
        </Button>
      </div>

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          <GroupPanel title="Sem Registro Cartório" accent="amber">
            {STAGES.filter((s) => s.group === "sem_registro").map(renderColumn)}
          </GroupPanel>
          <GroupPanel title="Com Registro Cartório" accent="green">
            {STAGES.filter((s) => s.group === "com_registro").map(renderColumn)}
          </GroupPanel>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Crédito" : "Novo Crédito Judicial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Apt. 304 - Ed. Aurora"
              />
            </div>
            <div>
              <Label>Nº do Processo</Label>
              <Input
                value={form.processNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, processNumber: e.target.value }))
                }
                placeholder="0000000-00.0000.0.00.0000"
              />
            </div>
            <div>
              <Label>Endereço / Imóvel</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <Label>Valor do Crédito (R$)</Label>
              <Input
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Ex: 150000.00"
                inputMode="decimal"
              />
            </div>
            <div>
              <Label>Coluna</Label>
              <Select
                value={form.stage}
                onValueChange={(v) => setForm((f) => ({ ...f, stage: v as Stage }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <textarea
                className="min-h-[70px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submit}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {(createMut.isPending || updateMut.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
