import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Loader2, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function ClientesPage() {
  const utils = trpc.useUtils();
  const { data: clients, isLoading } = trpc.clients.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", cpfCnpj: "", email: "", phone: "", phone2: "", address: "", notes: "" });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); resetForm(); toast.success("Cliente cadastrado!"); },
  });
  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); resetForm(); toast.success("Cliente atualizado!"); },
  });
  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("Cliente excluído."); },
  });

  const resetForm = () => { setForm({ name: "", cpfCnpj: "", email: "", phone: "", phone2: "", address: "", notes: "" }); setShowForm(false); setEditingId(null); };
  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const startEdit = (c: any) => {
    setForm({ name: c.name || "", cpfCnpj: c.cpfCnpj || "", email: c.email || "", phone: c.phone || "", phone2: c.phone2 || "", address: c.address || "", notes: c.notes || "" });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Informe o nome."); return; }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5" />Clientes / Inquilinos</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <><X className="h-4 w-4 mr-1" />Cancelar</> : <><Plus className="h-4 w-4 mr-1" />Novo Cliente</>}
        </Button>
      </div>

      {showForm && (
        <div className="border border-border rounded-xl p-4 bg-card space-y-3">
          <h3 className="font-medium text-sm">{editingId ? "Editar Cliente" : "Novo Cliente"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome *</Label><Input className="h-9" value={form.name} onChange={e => set("name", e.target.value)} /></div>
            <div><Label className="text-xs">CPF/CNPJ</Label><Input className="h-9" value={form.cpfCnpj} onChange={e => set("cpfCnpj", e.target.value)} /></div>
            <div><Label className="text-xs">E-mail</Label><Input className="h-9" value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div><Label className="text-xs">Telefone</Label><Input className="h-9" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
            <div><Label className="text-xs">Telefone 2</Label><Input className="h-9" value={form.phone2} onChange={e => set("phone2", e.target.value)} /></div>
            <div><Label className="text-xs">Endereço</Label><Input className="h-9" value={form.address} onChange={e => set("address", e.target.value)} /></div>
            <div className="col-span-2"><Label className="text-xs">Observações</Label><Input className="h-9" value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {editingId ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : clients && clients.length > 0 ? (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">CPF/CNPJ</th>
                <th className="text-left p-3 font-medium">Telefone</th>
                <th className="text-left p-3 font-medium">E-mail</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.cpfCnpj || "-"}</td>
                  <td className="p-3 text-muted-foreground">{c.phone || "-"}</td>
                  <td className="p-3 text-muted-foreground">{c.email || "-"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7" onClick={() => startEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => { if (confirm("Excluir?")) deleteMutation.mutate({ id: c.id }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum cliente cadastrado.</p>
        </div>
      )}
    </div>
  );
}
