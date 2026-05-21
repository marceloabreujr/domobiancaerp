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
import { FileText, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ImovelRetomado } from "../../../../drizzle/schema";

const emptyForm = {
  title: "",
  processNumber: "",
  address: "",
  value: "",
  notes: "",
};

function formatBRL(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ImoveisRetomadosKanban() {
  const list = trpc.imoveisRetomados.list.useQuery();

  const createMut = trpc.imoveisRetomados.create.useMutation({
    onSuccess: () => {
      list.refetch();
      toast.success("Imóvel adicionado!");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.imoveisRetomados.update.useMutation({
    onSuccess: () => {
      list.refetch();
      toast.success("Imóvel atualizado!");
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.imoveisRetomados.delete.useMutation({
    onSuccess: () => {
      list.refetch();
      toast.success("Imóvel removido.");
    },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ImovelRetomado | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (im: ImovelRetomado) => {
    setEditing(im);
    setForm({
      title: im.title,
      processNumber: im.processNumber ?? "",
      address: im.address ?? "",
      value: im.value ?? "",
      notes: im.notes ?? "",
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Informe o título do imóvel.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      processNumber: form.processNumber.trim() || undefined,
      address: form.address.trim() || undefined,
      value: form.value.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const items = list.data ?? [];

  const renderCard = (card: ImovelRetomado) => {
    const brl = formatBRL(card.value);
    return (
      <div
        key={card.id}
        className="rounded-md border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
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
                if (confirm(`Remover o imóvel "${card.title}"?`)) {
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
          <p className="mt-1.5 line-clamp-3 text-xs text-muted-foreground">{card.notes}</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Imóveis Retomados</h2>
          <p className="text-sm text-muted-foreground">
            Cadastro dos imóveis retomados.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Imóvel
        </Button>
      </div>

      {list.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="max-w-sm">
          <div className="flex flex-col rounded-lg border border-border bg-background/60">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-medium">Imóvel Retomado</span>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="min-h-[140px] space-y-2 p-2">
              {items.map(renderCard)}
              {items.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground/60">
                  Nenhum imóvel cadastrado
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Imóvel" : "Novo Imóvel Retomado"}
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
              <Label>Valor (R$)</Label>
              <Input
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Ex: 150000.00"
                inputMode="decimal"
              />
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
