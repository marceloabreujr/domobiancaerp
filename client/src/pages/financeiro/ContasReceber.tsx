import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Search, Check, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

const CATEGORIES = [
  { value: "aluguel", label: "Aluguel" },
  { value: "venda", label: "Venda" },
  { value: "comissao", label: "Comissão" },
  { value: "taxa_admin", label: "Taxa Administração" },
  { value: "outros", label: "Outros" },
];

const STATUS_COLORS: Record<string, string> = {
  aberto: "bg-blue-100 text-blue-800",
  pago: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-gray-100 text-gray-800",
  atrasado: "bg-red-100 text-red-800",
};

export default function ContasReceber() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [form, setForm] = useState({
    category: "aluguel",
    description: "",
    amount: "",
    dueDate: "",
    propertyId: "",
    costCenter: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.financial.entries.list.useQuery({ type: "entrada" });
  const { data: properties } = trpc.properties.list.useQuery();
  const { data: contracts } = trpc.rentalContracts.list.useQuery();

  const createMutation = trpc.financial.entries.create.useMutation({
    onSuccess: () => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success("Lançamento criado"); setShowDialog(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });

  const markPaidMutation = trpc.financial.entries.markPaid.useMutation({
    onSuccess: () => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success("Marcado como pago"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.financial.entries.delete.useMutation({
    onSuccess: () => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success("Lançamento removido"); },
    onError: (e) => toast.error(e.message),
  });

  const generateRentMutation = trpc.financial.rentInstallments.generate.useMutation({
    onSuccess: (data) => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success(`${data.generated} parcelas de aluguel geradas`); setShowGenDialog(false); },
    onError: (e) => toast.error(e.message),
  });

  const [genContractId, setGenContractId] = useState("");
  const [genMonths, setGenMonths] = useState("12");

  function resetForm() {
    setForm({ category: "aluguel", description: "", amount: "", dueDate: "", propertyId: "", costCenter: "", notes: "" });
  }

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [entries, search, statusFilter]);

  const totalAberto = useMemo(() => {
    return filtered.filter(e => e.status === "aberto" || e.status === "atrasado").reduce((acc, e) => acc + parseFloat(String(e.amount)), 0);
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Contas a Receber</h3>
          <p className="text-sm text-muted-foreground">Total em aberto: <span className="font-medium text-emerald-600">{formatCurrency(totalAberto)}</span></p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowGenDialog(true)}>
            <FileText className="h-3.5 w-3.5 mr-1" />
            Gerar Parcelas
          </Button>
          <Button size="sm" onClick={() => setShowDialog(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum lançamento a receber encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground bg-muted/30">
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 max-w-[250px] truncate">{entry.description}</td>
                      <td className="px-4 py-2.5 capitalize text-muted-foreground">{entry.category?.replace("_", " ")}</td>
                      <td className="px-4 py-2.5">{formatDate(entry.dueDate)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status] || ""}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-600">
                        {formatCurrency(parseFloat(String(entry.amount)))}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex gap-1 justify-end">
                          {entry.status === "aberto" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => markPaidMutation.mutate({ id: entry.id })}>
                              <Check className="h-3 w-3 mr-1" />Pago
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => { if (confirm("Remover este lançamento?")) deleteMutation.mutate({ id: entry.id }); }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Novo Lançamento */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lançamento a Receber</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descrição *</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Aluguel Apt 101 - Jan/2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valor (R$) *</label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Vencimento *</label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Imóvel (opcional)</label>
                <Select value={form.propertyId || "none"} onValueChange={(v) => setForm({ ...form, propertyId: v === "none" ? "" : v, costCenter: v === "none" ? "" : `imovel_${v}` })}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {properties?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.code} - {p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Observações</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.description || !form.amount || !form.dueDate) { toast.error("Preencha descrição, valor e vencimento"); return; }
              createMutation.mutate({
                type: "entrada",
                category: form.category as any,
                description: form.description,
                amount: form.amount,
                dueDate: form.dueDate,
                propertyId: form.propertyId ? parseInt(form.propertyId) : null,
                costCenter: form.costCenter || "administracao_central",
                notes: form.notes || undefined,
              });
            }} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Gerar Parcelas de Aluguel */}
      <Dialog open={showGenDialog} onOpenChange={setShowGenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Parcelas de Aluguel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contrato de Locação *</label>
              <Select value={genContractId || "none"} onValueChange={setGenContractId}>
                <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione...</SelectItem>
                  {contracts?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      #{c.id} - R$ {c.rentAmount}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quantidade de meses</label>
              <Input type="number" min="1" max="36" value={genMonths} onChange={(e) => setGenMonths(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenDialog(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!genContractId || genContractId === "none") { toast.error("Selecione um contrato"); return; }
              generateRentMutation.mutate({ contractId: parseInt(genContractId), months: parseInt(genMonths) || 12 });
            }} disabled={generateRentMutation.isPending}>
              {generateRentMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
              Gerar Parcelas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
