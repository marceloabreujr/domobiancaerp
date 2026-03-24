import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Users, Trash2, Edit, Eye, TrendingUp } from "lucide-react";

const partnerLabels: Record<string, string> = {
  corretor: "Corretor", advogado: "Advogado", investidor: "Investidor",
  permutario: "Permutário", outros: "Outros",
};

function formatCurrency(val: string | number | null | undefined) {
  if (!val) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(typeof val === "string" ? parseFloat(val) : val);
}

export default function CaptadoresPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [dashboardId, setDashboardId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", partnerType: "corretor" as string, phone: "", email: "", cpfCnpj: "", defaultCommission: "5.00", notes: "" });

  const { data: captadores, isLoading } = trpc.captadores.list.useQuery();
  const { data: dashboard } = trpc.captadores.dashboard.useQuery({ id: dashboardId! }, { enabled: !!dashboardId });
  const utils = trpc.useUtils();

  const createMut = trpc.captadores.create.useMutation({
    onSuccess: () => { toast.success("Captador criado!"); utils.captadores.list.invalidate(); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const updateMut = trpc.captadores.update.useMutation({
    onSuccess: () => { toast.success("Captador atualizado!"); utils.captadores.list.invalidate(); resetForm(); },
  });
  const deleteMut = trpc.captadores.delete.useMutation({
    onSuccess: () => { toast.success("Captador excluído!"); utils.captadores.list.invalidate(); },
  });

  const resetForm = () => {
    setForm({ name: "", partnerType: "corretor", phone: "", email: "", cpfCnpj: "", defaultCommission: "5.00", notes: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (c: any) => {
    setForm({
      name: c.name, partnerType: c.partnerType, phone: c.phone || "", email: c.email || "",
      cpfCnpj: c.cpfCnpj || "", defaultCommission: c.defaultCommission || "5.00", notes: c.notes || "",
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (editId) {
      updateMut.mutate({ id: editId, ...form, partnerType: form.partnerType as any });
    } else {
      createMut.mutate({ ...form, partnerType: form.partnerType as any });
    }
  };

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Captadores
        </h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Captador
        </Button>
      </div>

      {/* List */}
      {(captadores || []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum captador cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(captadores || []).map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{partnerLabels[c.partnerType] || c.partnerType}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {c.phone && <p>{c.phone}</p>}
                {c.email && <p>{c.email}</p>}
                <p>Comissão padrão: {c.defaultCommission}%</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setDashboardId(c.id)}>
                  <Eye className="h-3 w-3 mr-1" /> Ver
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                  <Edit className="h-3 w-3 mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { if (confirm("Excluir?")) deleteMut.mutate({ id: c.id }); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Captador" : "Novo Captador"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Tipo de Parceiro</Label>
                <Select value={form.partnerType} onValueChange={(v) => set("partnerType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corretor">Corretor</SelectItem>
                    <SelectItem value="advogado">Advogado</SelectItem>
                    <SelectItem value="investidor">Investidor</SelectItem>
                    <SelectItem value="permutario">Permutário</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Comissão Padrão (%)</Label>
                <Input type="number" value={form.defaultCommission} onChange={(e) => set("defaultCommission", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              <div><Label>E-mail</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            </div>
            <div><Label>CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={(e) => set("cpfCnpj", e.target.value)} /></div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dashboard Dialog */}
      <Dialog open={!!dashboardId} onOpenChange={(open) => !open && setDashboardId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Dashboard: {dashboard?.captador?.name}
            </DialogTitle>
          </DialogHeader>
          {dashboard && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{dashboard.deals.length}</p>
                  <p className="text-xs text-muted-foreground">Negócios</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(dashboard.totalVGV)}</p>
                  <p className="text-xs text-muted-foreground">VGV Total</p>
                </div>
              </div>
              {dashboard.deals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Negócios Vinculados</h4>
                  <div className="space-y-2">
                    {dashboard.deals.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between bg-muted/30 rounded p-2 text-sm">
                        <span className="font-medium">{d.title}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(d.estimatedVGV)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
