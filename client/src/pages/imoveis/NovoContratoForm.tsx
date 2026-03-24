import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Client = { id: number; name: string };

export default function NovoContratoForm({ propertyId, clients, onSuccess }: { propertyId: number; clients: Client[]; onSuccess: () => void }) {
  const utils = trpc.useUtils();
  const createMutation = trpc.rentalContracts.create.useMutation({
    onSuccess: () => {
      utils.rentalContracts.list.invalidate();
      toast.success("Contrato criado com sucesso!");
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    tenantId: "",
    occupantName: "",
    occupantCpf: "",
    startDate: "",
    endDate: "",
    leaseTerm: "anual",
    rentAmount: "",
    condoIncluded: false,
    iptuIncluded: false,
    isPackage: false,
    packageTotal: "",
    adjustmentIndex: "igpm",
    billingDay: "10",
    lateFeePercent: "2.00",
    dailyInterestPercent: "0.0333",
  });

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.tenantId || !form.startDate || !form.rentAmount) {
      toast.error("Preencha inquilino, data de início e valor do aluguel.");
      return;
    }
    createMutation.mutate({
      propertyId,
      tenantId: parseInt(form.tenantId),
      occupantName: form.occupantName || undefined,
      occupantCpf: form.occupantCpf || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      leaseTerm: form.leaseTerm as any,
      rentAmount: form.rentAmount,
      condoIncluded: form.condoIncluded,
      iptuIncluded: form.iptuIncluded,
      isPackage: form.isPackage,
      packageTotal: form.isPackage ? form.packageTotal : undefined,
      adjustmentIndex: form.adjustmentIndex as any,
      billingDay: parseInt(form.billingDay) || 10,
      lateFeePercent: form.lateFeePercent,
      dailyInterestPercent: form.dailyInterestPercent,
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Novo Contrato</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Inquilino *</Label>
          <Select value={form.tenantId} onValueChange={(v) => set("tenantId", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Prazo</Label>
          <Select value={form.leaseTerm} onValueChange={(v) => set("leaseTerm", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="2_anos">2 Anos</SelectItem>
              <SelectItem value="3_anos">3 Anos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Data Início *</Label>
          <Input type="date" className="h-9" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Data Fim</Label>
          <Input type="date" className="h-9" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Valor Aluguel (R$) *</Label>
          <Input className="h-9" value={form.rentAmount} onChange={e => set("rentAmount", e.target.value)} placeholder="1500.00" />
        </div>
        <div>
          <Label className="text-xs">Dia Vencimento</Label>
          <Input type="number" className="h-9" value={form.billingDay} onChange={e => set("billingDay", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Índice Reajuste</Label>
          <Select value={form.adjustmentIndex} onValueChange={(v) => set("adjustmentIndex", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="igpm">IGPM</SelectItem>
              <SelectItem value="ipca">IPCA</SelectItem>
              <SelectItem value="inpc">INPC</SelectItem>
              <SelectItem value="nenhum">Nenhum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Multa Atraso (%)</Label>
          <Input className="h-9" value={form.lateFeePercent} onChange={e => set("lateFeePercent", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={form.condoIncluded} onChange={e => set("condoIncluded", e.target.checked)} className="rounded" />
          Inclui Condomínio
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={form.iptuIncluded} onChange={e => set("iptuIncluded", e.target.checked)} className="rounded" />
          Inclui IPTU
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={form.isPackage} onChange={e => set("isPackage", e.target.checked)} className="rounded" />
          Pacote de Locação
        </label>
      </div>

      {form.isPackage && (
        <div>
          <Label className="text-xs">Valor Total do Pacote (R$)</Label>
          <Input className="h-9 w-48" value={form.packageTotal} onChange={e => set("packageTotal", e.target.value)} placeholder="2000.00" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Morador/Ocupante (se diferente)</Label>
          <Input className="h-9" value={form.occupantName} onChange={e => set("occupantName", e.target.value)} placeholder="Nome do morador" />
        </div>
        <div>
          <Label className="text-xs">CPF do Ocupante</Label>
          <Input className="h-9" value={form.occupantCpf} onChange={e => set("occupantCpf", e.target.value)} placeholder="000.000.000-00" />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full">
        {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Salvando...</> : "Criar Contrato"}
      </Button>
    </div>
  );
}
