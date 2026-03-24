import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, RefreshCw, Trash2, Play, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const CATEGORIES = [
  { value: "iptu", label: "IPTU" },
  { value: "condominio", label: "Condomínio" },
  { value: "seguro", label: "Seguro" },
  { value: "agua", label: "Água" },
  { value: "luz", label: "Luz" },
  { value: "gas", label: "Gás" },
  { value: "internet", label: "Internet" },
  { value: "outros", label: "Outros" },
];

const FREQUENCIES = [
  { value: "mensal", label: "Mensal" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

export default function ContasRecorrentes() {
  const [showDialog, setShowDialog] = useState(false);
  const [showGenDialog, setShowGenDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<number | null>(null);
  const [genYear, setGenYear] = useState(String(new Date().getFullYear()));
  const [genMonths, setGenMonths] = useState("12");
  const [form, setForm] = useState({
    title: "",
    category: "iptu",
    type: "saida",
    amount: "",
    propertyId: "",
    costCenter: "",
    inscricaoImobiliaria: "",
    frequency: "mensal",
    billingDay: "10",
    startDate: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: bills, isLoading } = trpc.financial.recurring.list.useQuery({});
  const { data: properties } = trpc.properties.list.useQuery();

  const createMutation = trpc.financial.recurring.create.useMutation({
    onSuccess: () => { utils.financial.recurring.list.invalidate(); toast.success("Conta recorrente criada"); setShowDialog(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.financial.recurring.delete.useMutation({
    onSuccess: () => { utils.financial.recurring.list.invalidate(); toast.success("Conta removida"); },
    onError: (e) => toast.error(e.message),
  });

  const toggleActiveMutation = trpc.financial.recurring.update.useMutation({
    onSuccess: () => { utils.financial.recurring.list.invalidate(); toast.success("Status atualizado"); },
    onError: (e) => toast.error(e.message),
  });

  const generateIPTUMutation = trpc.financial.recurring.generateIPTU.useMutation({
    onSuccess: (data) => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success(`${data.generated} parcelas de IPTU geradas`); setShowGenDialog(false); },
    onError: (e) => toast.error(e.message),
  });

  const generateEntriesMutation = trpc.financial.recurring.generateEntries.useMutation({
    onSuccess: (data) => { utils.financial.entries.list.invalidate(); utils.financial.summary.invalidate(); toast.success(`${data.generated} lançamentos gerados`); setShowGenDialog(false); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", category: "iptu", type: "saida", amount: "", propertyId: "", costCenter: "", inscricaoImobiliaria: "", frequency: "mensal", billingDay: "10", startDate: "", notes: "" });
  }

  function handleGenerate() {
    if (!selectedBill) return;
    const bill = bills?.find(b => b.id === selectedBill);
    if (!bill) return;
    if (bill.category === "iptu") {
      generateIPTUMutation.mutate({ recurringBillId: selectedBill, year: parseInt(genYear) });
    } else {
      generateEntriesMutation.mutate({ recurringBillId: selectedBill, months: parseInt(genMonths) || 12 });
    }
  }

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
          <h3 className="text-base font-semibold">Contas Recorrentes</h3>
          <p className="text-sm text-muted-foreground">IPTU, condomínio e outras contas fixas com geração automática de lançamentos</p>
        </div>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nova Conta Recorrente
        </Button>
      </div>

      {/* Lista de contas recorrentes */}
      {(!bills || bills.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma conta recorrente cadastrada</p>
            <p className="text-xs mt-1">Cadastre IPTU, condomínio e outras contas fixas para gerar lançamentos automaticamente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {bills.map((bill) => (
            <Card key={bill.id} className={!bill.isActive ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{bill.title}</h4>
                      <Badge variant={bill.isActive ? "default" : "secondary"} className="text-xs">
                        {bill.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{bill.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{bill.frequency}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Valor: <span className="font-medium text-foreground">{formatCurrency(parseFloat(String(bill.amount)))}</span></span>
                      <span>Dia: {bill.billingDay}</span>
                      {bill.inscricaoImobiliaria && <span>Inscrição: {bill.inscricaoImobiliaria}</span>}
                      {bill.costCenter && <span>Centro: {bill.costCenter === "administracao_central" ? "Adm. Central" : bill.costCenter.replace("imovel_", "Imóvel #")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setSelectedBill(bill.id); setShowGenDialog(true); }}>
                      <Play className="h-3 w-3 mr-1" />
                      Gerar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => toggleActiveMutation.mutate({ id: bill.id, isActive: !bill.isActive })}>
                      {bill.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-red-500" onClick={() => { if (confirm("Remover esta conta recorrente?")) deleteMutation.mutate({ id: bill.id }); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Nova Conta Recorrente */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Conta Recorrente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: IPTU Apt 101" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saida">Despesa (Pagar)</SelectItem>
                    <SelectItem value="entrada">Receita (Receber)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valor (R$) *</label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Frequência</label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Dia Venc.</label>
                <Input type="number" min="1" max="28" value={form.billingDay} onChange={(e) => setForm({ ...form, billingDay: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Data Início *</label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Imóvel</label>
                <Select value={form.propertyId || "none"} onValueChange={(v) => setForm({ ...form, propertyId: v === "none" ? "" : v, costCenter: v === "none" ? "administracao_central" : `imovel_${v}` })}>
                  <SelectTrigger><SelectValue placeholder="Adm. Central" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Adm. Central</SelectItem>
                    {properties?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.code} - {p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.category === "iptu" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Inscrição Imobiliária (SQL)</label>
                <Input value={form.inscricaoImobiliaria} onChange={(e) => setForm({ ...form, inscricaoImobiliaria: e.target.value })} placeholder="Ex: 123.456.789-0" />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Observações</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.title || !form.amount || !form.startDate) { toast.error("Preencha título, valor e data de início"); return; }
              createMutation.mutate({
                title: form.title,
                category: form.category as any,
                type: form.type as any,
                amount: form.amount,
                propertyId: form.propertyId ? parseInt(form.propertyId) : null,
                costCenter: form.costCenter || "administracao_central",
                inscricaoImobiliaria: form.inscricaoImobiliaria || undefined,
                frequency: form.frequency as any,
                billingDay: parseInt(form.billingDay) || 10,
                startDate: form.startDate,
                notes: form.notes || undefined,
              });
            }} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Gerar Lançamentos */}
      <Dialog open={showGenDialog} onOpenChange={setShowGenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Lançamentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {bills?.find(b => b.id === selectedBill)?.category === "iptu" ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ano para gerar 12 parcelas de IPTU</label>
                <Input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Quantidade de meses para gerar</label>
                <Input type="number" min="1" max="36" value={genMonths} onChange={(e) => setGenMonths(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenDialog(false)}>Cancelar</Button>
            <Button onClick={handleGenerate} disabled={generateIPTUMutation.isPending || generateEntriesMutation.isPending}>
              {(generateIPTUMutation.isPending || generateEntriesMutation.isPending) ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
