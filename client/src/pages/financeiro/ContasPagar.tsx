import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Search, Check, X, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { value: "condominio", label: "Condomínio" },
  { value: "iptu", label: "IPTU" },
  { value: "manutencao", label: "Manutenção" },
  { value: "seguro", label: "Seguro" },
  { value: "agua", label: "Água" },
  { value: "luz", label: "Luz" },
  { value: "gas", label: "Gás" },
  { value: "internet", label: "Internet" },
  { value: "material", label: "Material" },
  { value: "mao_de_obra", label: "Mão de Obra" },
  { value: "comissao", label: "Comissão" },
  { value: "outros", label: "Outros" },
];

const STATUS_COLORS: Record<string, string> = {
  aberto: "bg-blue-100 text-blue-800",
  pago: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-gray-100 text-gray-800",
  atrasado: "bg-red-100 text-red-800",
};

export default function ContasPagar() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    category: "condominio",
    description: "",
    amount: "",
    dueDate: "",
    propertyId: "",
    constructionId: "",
    costCenter: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.financial.entries.list.useQuery({ type: "saida" });
  const { data: properties } = trpc.properties.list.useQuery();
  const { data: constructions } = trpc.constructions.list.useQuery();

  const createMutation = trpc.financial.entries.create.useMutation({
    onSuccess: () => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success("Despesa criada"); setShowDialog(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });

  const markPaidMutation = trpc.financial.entries.markPaid.useMutation({
    onSuccess: () => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success("Marcado como pago"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.financial.entries.delete.useMutation({
    onSuccess: () => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success("Despesa removida"); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ category: "condominio", description: "", amount: "", dueDate: "", propertyId: "", constructionId: "", costCenter: "", notes: "" });
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
          <h3 className="text-base font-semibold">Contas a Pagar</h3>
          <p className="text-sm text-muted-foreground">Total em aberto: <span className="font-medium text-red-600">{formatCurrency(totalAberto)}</span></p>
        </div>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nova Despesa
        </Button>
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
              <p>Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground bg-muted/30">
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Centro de Custo</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 max-w-[200px] truncate">{entry.description}</td>
                      <td className="px-4 py-2.5 capitalize text-muted-foreground">{entry.category?.replace("_", " ")}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {entry.costCenter === "administracao_central" ? "Adm. Central" : entry.costCenter?.replace("imovel_", "Imóvel #")}
                      </td>
                      <td className="px-4 py-2.5">{formatDate(entry.dueDate)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.status] || ""}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-red-600">
                        {formatCurrency(parseFloat(String(entry.amount)))}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex gap-1 justify-end">
                          {entry.status === "aberto" && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => markPaidMutation.mutate({ id: entry.id })}>
                              <Check className="h-3 w-3 mr-1" />Pago
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => { if (confirm("Remover esta despesa?")) deleteMutation.mutate({ id: entry.id }); }}>
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

      {/* Dialog Nova Despesa */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descrição *</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: IPTU Apt 101 - Parcela 1/12" />
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
                <label className="text-xs font-medium text-muted-foreground">Imóvel (centro custo)</label>
                <Select value={form.propertyId || "none"} onValueChange={(v) => setForm({ ...form, propertyId: v === "none" ? "" : v, costCenter: v === "none" ? "administracao_central" : `imovel_${v}` })}>
                  <SelectTrigger><SelectValue placeholder="Adm. Central" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Adm. Central</SelectItem>
                    {properties?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.code} - {p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Obra (opcional)</label>
              <Select value={form.constructionId || "none"} onValueChange={(v) => setForm({ ...form, constructionId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {constructions?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
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
                type: "saida",
                category: form.category as any,
                description: form.description,
                amount: form.amount,
                dueDate: form.dueDate,
                propertyId: form.propertyId ? parseInt(form.propertyId) : null,
                constructionId: form.constructionId ? parseInt(form.constructionId) : null,
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
    </div>
  );
}
