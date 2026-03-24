import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserPlus, CalendarDays, Search } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  ferias: "Férias",
  afastado: "Afastado",
  desligado: "Desligado",
};

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-emerald-500/10 text-emerald-600",
  ferias: "bg-blue-500/10 text-blue-600",
  afastado: "bg-amber-500/10 text-amber-600",
  desligado: "bg-red-500/10 text-red-600",
};

const TIMEOFF_LABELS: Record<string, string> = {
  ferias: "Férias",
  falta_justificada: "Falta justificada",
  falta_injustificada: "Falta injustificada",
  licenca: "Licença",
  outro: "Outro",
};

export default function RHPage() {
  const utils = trpc.useUtils();
  const { data: employees, isLoading } = trpc.employees.list.useQuery();
  const createEmployee = trpc.employees.create.useMutation({ onSuccess: () => { utils.employees.list.invalidate(); toast.success("Colaborador cadastrado."); setShowForm(false); } });
  const updateEmployee = trpc.employees.update.useMutation({ onSuccess: () => { utils.employees.list.invalidate(); toast.success("Colaborador atualizado."); setShowForm(false); } });
  const deleteEmployee = trpc.employees.delete.useMutation({ onSuccess: () => { utils.employees.list.invalidate(); toast.success("Colaborador removido."); } });

  const { data: allTimeOff } = trpc.timeOff.list.useQuery({});
  const createTimeOff = trpc.timeOff.create.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Registro criado."); setShowTimeOff(false); } });

  const [showForm, setShowForm] = useState(false);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [form, setForm] = useState({ name: "", cpf: "", email: "", phone: "", position: "", department: "", salary: "", hireDate: "", status: "ativo" as string, projectAllocation: "", notes: "" });
  const [toForm, setToForm] = useState({ employeeId: 0, type: "ferias" as string, startDate: "", endDate: "", reason: "" });

  const resetForm = () => setForm({ name: "", cpf: "", email: "", phone: "", position: "", department: "", salary: "", hireDate: "", status: "ativo", projectAllocation: "", notes: "" });

  const openEdit = (emp: any) => {
    setForm({
      name: emp.name || "",
      cpf: emp.cpf || "",
      email: emp.email || "",
      phone: emp.phone || "",
      position: emp.position || "",
      department: emp.department || "",
      salary: emp.salary || "",
      hireDate: emp.hireDate ? new Date(emp.hireDate).toISOString().split("T")[0] : "",
      status: emp.status || "ativo",
      projectAllocation: emp.projectAllocation || "",
      notes: emp.notes || "",
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório."); return; }
    const data = { ...form, salary: form.salary || undefined, hireDate: form.hireDate || undefined, status: form.status as any };
    if (editingId) {
      updateEmployee.mutate({ id: editingId, ...data });
    } else {
      createEmployee.mutate(data);
    }
  };

  const filtered = (employees || []).filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.position || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar colaborador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTimeOff(true)}>
            <CalendarDays className="h-4 w-4 mr-1.5" />Férias/Faltas
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
            <UserPlus className="h-4 w-4 mr-1.5" />Novo Colaborador
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum colaborador encontrado</p>
          <p className="text-sm mt-1">Cadastre o primeiro colaborador para começar.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Cargo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Departamento</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Alocação</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email || emp.phone || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{emp.position || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{emp.department || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[emp.status]}`}>
                        {STATUS_LABELS[emp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">{emp.projectAllocation || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover este colaborador?")) deleteEmployee.mutate({ id: emp.id }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Ex: Engenheiro" />
              </div>
              <div>
                <Label>Departamento</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ex: Obras" />
              </div>
              <div>
                <Label>Salário</Label>
                <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <Label>Data de Admissão</Label>
                <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Alocação (Projeto/Obra)</Label>
                <Input value={form.projectAllocation} onChange={(e) => setForm({ ...form, projectAllocation: e.target.value })} placeholder="Ex: Obra Residencial Centro" />
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionais..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createEmployee.isPending || updateEmployee.isPending}>
              {editingId ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TimeOff Dialog */}
      <Dialog open={showTimeOff} onOpenChange={setShowTimeOff}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Férias / Falta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Colaborador *</Label>
              <Select value={toForm.employeeId ? String(toForm.employeeId) : ""} onValueChange={(v) => setToForm({ ...toForm, employeeId: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {(employees || []).map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={toForm.type} onValueChange={(v) => setToForm({ ...toForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="falta_justificada">Falta justificada</SelectItem>
                  <SelectItem value="falta_injustificada">Falta injustificada</SelectItem>
                  <SelectItem value="licenca">Licença</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data Início *</Label>
                <Input type="date" value={toForm.startDate} onChange={(e) => setToForm({ ...toForm, startDate: e.target.value })} />
              </div>
              <div>
                <Label>Data Fim *</Label>
                <Input type="date" value={toForm.endDate} onChange={(e) => setToForm({ ...toForm, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Motivo</Label>
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={toForm.reason} onChange={(e) => setToForm({ ...toForm, reason: e.target.value })} />
            </div>
          </div>

          {/* Recent time off */}
          {allTimeOff && allTimeOff.length > 0 && (
            <div className="border-t pt-4 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Registros recentes</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {allTimeOff.slice(0, 5).map((t) => {
                  const emp = employees?.find((e) => e.id === t.employeeId);
                  return (
                    <div key={t.id} className="flex items-center justify-between text-xs bg-muted/40 rounded-lg px-3 py-2">
                      <div>
                        <span className="font-medium">{emp?.name || "—"}</span>
                        <span className="text-muted-foreground ml-2">{TIMEOFF_LABELS[t.type] || t.type}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString("pt-BR") : ""} — {t.endDate ? new Date(t.endDate).toLocaleDateString("pt-BR") : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeOff(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!toForm.employeeId || !toForm.startDate || !toForm.endDate) { toast.error("Preencha todos os campos obrigatórios."); return; }
              createTimeOff.mutate({ ...toForm, type: toForm.type as any });
            }} disabled={createTimeOff.isPending}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
