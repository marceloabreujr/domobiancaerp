import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, Plus, Loader2, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProprietariosPage() {
  const utils = trpc.useUtils();
  const { data: owners, isLoading } = trpc.owners.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", cpfCnpj: "", email: "", phone: "", phone2: "", address: "", bankName: "", bankAgency: "", bankAccount: "", pixKey: "", notes: "" });

  const createMutation = trpc.owners.create.useMutation({
    onSuccess: () => { utils.owners.list.invalidate(); resetForm(); toast.success("Proprietário cadastrado!"); },
  });
  const updateMutation = trpc.owners.update.useMutation({
    onSuccess: () => { utils.owners.list.invalidate(); resetForm(); toast.success("Proprietário atualizado!"); },
  });
  const deleteMutation = trpc.owners.delete.useMutation({
    onSuccess: () => { utils.owners.list.invalidate(); toast.success("Proprietário excluído."); },
  });

  const resetForm = () => { setForm({ name: "", cpfCnpj: "", email: "", phone: "", phone2: "", address: "", bankName: "", bankAgency: "", bankAccount: "", pixKey: "", notes: "" }); setShowForm(false); setEditingId(null); };
  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const startEdit = (o: any) => {
    setForm({ name: o.name || "", cpfCnpj: o.cpfCnpj || "", email: o.email || "", phone: o.phone || "", phone2: o.phone2 || "", address: o.address || "", bankName: o.bankName || "", bankAgency: o.bankAgency || "", bankAccount: o.bankAccount || "", pixKey: o.pixKey || "", notes: o.notes || "" });
    setEditingId(o.id);
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
        <h2 className="text-xl font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5" />Proprietários</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <><X className="h-4 w-4 mr-1" />Cancelar</> : <><Plus className="h-4 w-4 mr-1" />Novo Proprietário</>}
        </Button>
      </div>

      {showForm && (
        <div className="border border-border rounded-xl p-4 bg-card space-y-3">
          <h3 className="font-medium text-sm">{editingId ? "Editar Proprietário" : "Novo Proprietário"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome *</Label><Input className="h-9" value={form.name} onChange={e => set("name", e.target.value)} /></div>
            <div><Label className="text-xs">CPF/CNPJ</Label><Input className="h-9" value={form.cpfCnpj} onChange={e => set("cpfCnpj", e.target.value)} /></div>
            <div><Label className="text-xs">E-mail</Label><Input className="h-9" value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div><Label className="text-xs">Telefone</Label><Input className="h-9" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
            <div><Label className="text-xs">Telefone 2</Label><Input className="h-9" value={form.phone2} onChange={e => set("phone2", e.target.value)} /></div>
            <div><Label className="text-xs">Endereço</Label><Input className="h-9" value={form.address} onChange={e => set("address", e.target.value)} /></div>
          </div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">Dados Bancários</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Banco</Label><Input className="h-9" value={form.bankName} onChange={e => set("bankName", e.target.value)} /></div>
            <div><Label className="text-xs">Agência</Label><Input className="h-9" value={form.bankAgency} onChange={e => set("bankAgency", e.target.value)} /></div>
            <div><Label className="text-xs">Conta</Label><Input className="h-9" value={form.bankAccount} onChange={e => set("bankAccount", e.target.value)} /></div>
            <div><Label className="text-xs">Chave PIX</Label><Input className="h-9" value={form.pixKey} onChange={e => set("pixKey", e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">Observações</Label><Input className="h-9" value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {editingId ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : owners && owners.length > 0 ? (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">CPF/CNPJ</th>
                <th className="text-left p-3 font-medium">Telefone</th>
                <th className="text-left p-3 font-medium">Banco / PIX</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {owners.map(o => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 font-medium">{o.name}</td>
                  <td className="p-3 text-muted-foreground">{o.cpfCnpj || "-"}</td>
                  <td className="p-3 text-muted-foreground">{o.phone || "-"}</td>
                  <td className="p-3 text-muted-foreground">{o.pixKey ? `PIX: ${o.pixKey}` : o.bankName ? `${o.bankName} Ag ${o.bankAgency}` : "-"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7" onClick={() => startEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => { if (confirm("Excluir?")) deleteMutation.mutate({ id: o.id }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum proprietário cadastrado.</p>
        </div>
      )}
    </div>
  );
}
