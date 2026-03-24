import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wrench, Plus, Trash2, Edit2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function EmpreiteirosPage() {
  const list = trpc.contractors.list.useQuery();
  const createMut = trpc.contractors.create.useMutation({
    onSuccess: () => { list.refetch(); toast.success("Empreiteiro cadastrado!"); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.contractors.update.useMutation({
    onSuccess: () => { list.refetch(); toast.success("Atualizado!"); setEditId(null); },
  });
  const deleteMut = trpc.contractors.delete.useMutation({
    onSuccess: () => { list.refetch(); toast.success("Excluído!"); },
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", cpfCnpj: "", specialty: "", notes: "" });

  const resetForm = () => { setForm({ name: "", phone: "", email: "", cpfCnpj: "", specialty: "", notes: "" }); setShowForm(false); };

  const startEdit = (c: any) => {
    setEditId(c.id);
    setForm({ name: c.name, phone: c.phone ?? "", email: c.email ?? "", cpfCnpj: c.cpfCnpj ?? "", specialty: c.specialty ?? "", notes: c.notes ?? "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (editId) {
      updateMut.mutate({ id: editId, ...form });
    } else {
      createMut.mutate(form);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5" /> Empreiteiros
        </h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); setEditId(null); }}>
          <Plus className="h-4 w-4 mr-1" /> Cadastrar
        </Button>
      </div>

      {(showForm || editId) && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 mb-6 space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">{editId ? "Editar Empreiteiro" : "Novo Empreiteiro"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>CPF/CNPJ</Label>
              <Input value={form.cpfCnpj} onChange={e => setForm(f => ({ ...f, cpfCnpj: e.target.value }))} />
            </div>
            <div>
              <Label>Especialidade</Label>
              <Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="Ex: Alvenaria, Elétrica..." />
            </div>
            <div>
              <Label>Observações</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
              <Save className="h-4 w-4 mr-1" /> {editId ? "Salvar" : "Cadastrar"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { resetForm(); setEditId(null); }}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          </div>
        </form>
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-5 w-5" /></div>
      ) : (list.data ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum empreiteiro cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {(list.data ?? []).map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{c.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {[c.specialty, c.phone, c.email].filter(Boolean).join(" · ") || "Sem detalhes"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(c)}><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: c.id })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
