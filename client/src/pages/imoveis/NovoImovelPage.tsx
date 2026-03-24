import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Home, Tag } from "lucide-react";
import { toast } from "sonner";

interface Props {
  mode: "locacao" | "venda";
  onSuccess: () => void;
}

export default function NovoImovelPage({ mode, onSuccess }: Props) {
  const utils = trpc.useUtils();
  const { data: ownersList } = trpc.owners.list.useQuery();
  const { data: clientsList } = trpc.clients.list.useQuery();

  const createPropertyMutation = trpc.properties.create.useMutation({
    onSuccess: (result) => {
      utils.properties.list.invalidate();
      utils.properties.stats.invalidate();
      if (mode === "locacao" && wantContract) {
        // Criar contrato automaticamente
        createContractMutation.mutate({
          propertyId: result.id,
          tenantId: parseInt(contract.tenantId),
          occupantName: contract.occupantName || undefined,
          occupantCpf: contract.occupantCpf || undefined,
          startDate: contract.startDate,
          endDate: contract.endDate || undefined,
          leaseTerm: contract.leaseTerm as any,
          rentAmount: contract.rentAmount,
          condoIncluded: contract.condoIncluded,
          iptuIncluded: contract.iptuIncluded,
          isPackage: contract.isPackage,
          packageTotal: contract.packageTotal || undefined,
          adjustmentIndex: contract.adjustmentIndex as any,
          adjustmentValue: contract.adjustmentValue || undefined,
          nextAdjustmentDate: contract.nextAdjustmentDate || undefined,
          billingDay: parseInt(contract.billingDay) || 10,
          lateFeePercent: contract.lateFeePercent || "2.00",
          dailyInterestPercent: contract.dailyInterestPercent || "0.0333",
          notes: contract.notes || undefined,
        });
      } else {
        toast.success(`Imóvel cadastrado! Código: ${result.id}`);
        onSuccess();
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const createContractMutation = trpc.rentalContracts.create.useMutation({
    onSuccess: () => {
      utils.rentalContracts.list.invalidate();
      toast.success("Imóvel e contrato de locação cadastrados com sucesso!");
      onSuccess();
    },
    onError: (e) => toast.error("Imóvel criado, mas erro no contrato: " + e.message),
  });

  // ─── Estado do imóvel ─────────────────────────────────────────
  const [form, setForm] = useState({
    title: "", ownership: "domobianca", propertyType: "apartamento",
    ownerId: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "",
    area: "", bedrooms: "", bathrooms: "", parkingSpots: "", suites: "",
    rentValue: "", saleValue: "", condoFee: "", iptuValue: "", adminFeePercent: "", saleCommissionPercent: "",
    description: "", features: "",
  });

  // ─── Estado do contrato (só locação) ──────────────────────────
  const [wantContract, setWantContract] = useState(true);
  const [contract, setContract] = useState({
    tenantId: "", occupantName: "", occupantCpf: "",
    startDate: "", endDate: "", leaseTerm: "anual",
    rentAmount: "", condoIncluded: false, iptuIncluded: false,
    isPackage: false, packageTotal: "",
    adjustmentIndex: "igpm", adjustmentValue: "", nextAdjustmentDate: "",
    billingDay: "10", lateFeePercent: "2.00", dailyInterestPercent: "0.0333",
    notes: "",
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const setC = (field: string, value: string | boolean) => setContract(prev => ({ ...prev, [field]: value }));

  const isLocacao = mode === "locacao";
  const isPending = createPropertyMutation.isPending || createContractMutation.isPending;

  const handleSubmit = () => {
    if (!form.title) { toast.error("Informe o título do imóvel."); return; }
    if (isLocacao && wantContract) {
      if (!contract.tenantId) { toast.error("Selecione o inquilino."); return; }
      if (!contract.startDate) { toast.error("Informe a data de início do contrato."); return; }
      if (!contract.rentAmount) { toast.error("Informe o valor do aluguel."); return; }
    }
    if (!isLocacao && !form.saleValue) { toast.error("Informe o valor de venda."); return; }

    createPropertyMutation.mutate({
      title: form.title,
      ownership: form.ownership as any,
      propertyType: form.propertyType as any,
      status: isLocacao ? "disponivel_locacao" : "disponivel_venda",
      ownerId: form.ownerId ? parseInt(form.ownerId) : undefined,
      street: form.street || undefined,
      number: form.number || undefined,
      complement: form.complement || undefined,
      neighborhood: form.neighborhood || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zipCode: form.zipCode || undefined,
      area: form.area || undefined,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
      parkingSpots: form.parkingSpots ? parseInt(form.parkingSpots) : undefined,
      suites: form.suites ? parseInt(form.suites) : undefined,
      rentValue: isLocacao ? (contract.rentAmount || form.rentValue || undefined) : undefined,
      saleValue: !isLocacao ? form.saleValue : undefined,
      condoFee: form.condoFee || undefined,
      iptuValue: form.iptuValue || undefined,
      adminFeePercent: form.adminFeePercent || undefined,
      saleCommissionPercent: !isLocacao ? (form.saleCommissionPercent || undefined) : undefined,
      description: form.description || undefined,
      features: form.features || undefined,
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        {isLocacao ? <Home className="h-6 w-6 text-blue-600" /> : <Tag className="h-6 w-6 text-emerald-600" />}
        <div>
          <h2 className="text-xl font-semibold">{isLocacao ? "Novo Imóvel para Locação" : "Novo Imóvel para Venda"}</h2>
          <p className="text-sm text-muted-foreground">
            Código será gerado automaticamente: {isLocacao ? "LOC-XXX" : "VND-XXX"}
          </p>
        </div>
      </div>

      {/* ─── Identificação ─────────────────────────────────────── */}
      <section className="space-y-3 border border-border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Identificação</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Título / Nome do Imóvel *</Label>
            <Input className="h-9" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Apto 301 - Ed. Solar" />
          </div>
          <div>
            <Label className="text-xs">Posse</Label>
            <Select value={form.ownership} onValueChange={v => set("ownership", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="domobianca">Domobianca</SelectItem>
                <SelectItem value="terceiros">Terceiros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={form.propertyType} onValueChange={v => set("propertyType", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="cobertura">Cobertura</SelectItem>
                <SelectItem value="kitnet">Kitnet</SelectItem>
                <SelectItem value="sala_comercial">Sala Comercial</SelectItem>
                <SelectItem value="galpao">Galpão</SelectItem>
                <SelectItem value="lote">Lote</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.ownership === "terceiros" && (
            <div>
              <Label className="text-xs">Proprietário</Label>
              <Select value={form.ownerId} onValueChange={v => set("ownerId", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {ownersList?.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* ─── Endereço ──────────────────────────────────────────── */}
      <section className="space-y-3 border border-border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Endereço</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><Label className="text-xs">Rua</Label><Input className="h-9" value={form.street} onChange={e => set("street", e.target.value)} /></div>
          <div><Label className="text-xs">Número</Label><Input className="h-9" value={form.number} onChange={e => set("number", e.target.value)} /></div>
          <div><Label className="text-xs">Complemento</Label><Input className="h-9" value={form.complement} onChange={e => set("complement", e.target.value)} /></div>
          <div><Label className="text-xs">Bairro</Label><Input className="h-9" value={form.neighborhood} onChange={e => set("neighborhood", e.target.value)} /></div>
          <div><Label className="text-xs">Cidade</Label><Input className="h-9" value={form.city} onChange={e => set("city", e.target.value)} /></div>
          <div><Label className="text-xs">Estado</Label><Input className="h-9" value={form.state} onChange={e => set("state", e.target.value)} /></div>
          <div><Label className="text-xs">CEP</Label><Input className="h-9" value={form.zipCode} onChange={e => set("zipCode", e.target.value)} /></div>
        </div>
      </section>

      {/* ─── Características ───────────────────────────────────── */}
      <section className="space-y-3 border border-border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Características</h3>
        <div className="grid grid-cols-5 gap-3">
          <div><Label className="text-xs">Área (m²)</Label><Input className="h-9" value={form.area} onChange={e => set("area", e.target.value)} /></div>
          <div><Label className="text-xs">Quartos</Label><Input type="number" className="h-9" value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} /></div>
          <div><Label className="text-xs">Suítes</Label><Input type="number" className="h-9" value={form.suites} onChange={e => set("suites", e.target.value)} /></div>
          <div><Label className="text-xs">Banheiros</Label><Input type="number" className="h-9" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} /></div>
          <div><Label className="text-xs">Vagas</Label><Input type="number" className="h-9" value={form.parkingSpots} onChange={e => set("parkingSpots", e.target.value)} /></div>
        </div>
      </section>

      {/* ─── Valores do Imóvel ─────────────────────────────────── */}
      <section className="space-y-3 border border-border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {isLocacao ? "Valores Mensais" : "Valores de Venda"}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {!isLocacao && (
            <div><Label className="text-xs">Valor de Venda (R$) *</Label><Input className="h-9" value={form.saleValue} onChange={e => set("saleValue", e.target.value)} placeholder="350000.00" /></div>
          )}
          <div><Label className="text-xs">Condomínio (R$)</Label><Input className="h-9" value={form.condoFee} onChange={e => set("condoFee", e.target.value)} placeholder="500.00" /></div>
          <div><Label className="text-xs">IPTU (R$)</Label><Input className="h-9" value={form.iptuValue} onChange={e => set("iptuValue", e.target.value)} placeholder="200.00" /></div>
          {form.ownership === "terceiros" && (
            <div><Label className="text-xs">Taxa Admin (%)</Label><Input className="h-9" value={form.adminFeePercent} onChange={e => set("adminFeePercent", e.target.value)} placeholder="10" /></div>
          )}
          {!isLocacao && (
            <div><Label className="text-xs">Comissão Venda (%)</Label><Input className="h-9" value={form.saleCommissionPercent} onChange={e => set("saleCommissionPercent", e.target.value)} placeholder="6" /></div>
          )}
        </div>
      </section>

      {/* ─── Contrato de Locação (só para locação) ─────────────── */}
      {isLocacao && (
        <section className="space-y-4 border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wide">Contrato de Locação</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={wantContract} onChange={e => setWantContract(e.target.checked)} className="rounded" />
              <span className="text-muted-foreground">Criar contrato agora</span>
            </label>
          </div>

          {wantContract && (
            <div className="space-y-4">
              {/* Inquilino */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Inquilino (Responsável Financeiro) *</Label>
                  <Select value={contract.tenantId} onValueChange={v => setC("tenantId", v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {clientsList?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Morador/Ocupante (se diferente)</Label><Input className="h-9" value={contract.occupantName} onChange={e => setC("occupantName", e.target.value)} /></div>
              </div>

              {/* Datas e Prazo */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Início do Contrato *</Label>
                  <Input type="date" className="h-9" value={contract.startDate} onChange={e => setC("startDate", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Fim do Contrato</Label>
                  <Input type="date" className="h-9" value={contract.endDate} onChange={e => setC("endDate", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Prazo do Contrato</Label>
                  <Select value={contract.leaseTerm} onValueChange={v => setC("leaseTerm", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="2_anos">2 Anos</SelectItem>
                      <SelectItem value="3_anos">3 Anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Valor do Aluguel (R$) *</Label>
                  <Input className="h-9" value={contract.rentAmount} onChange={e => setC("rentAmount", e.target.value)} placeholder="1500.00" />
                </div>
                <div>
                  <Label className="text-xs">Dia de Vencimento</Label>
                  <Input type="number" className="h-9" value={contract.billingDay} onChange={e => setC("billingDay", e.target.value)} placeholder="10" />
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={contract.condoIncluded} onChange={e => setC("condoIncluded", e.target.checked)} className="rounded" />
                    Inclui Condomínio
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={contract.iptuIncluded} onChange={e => setC("iptuIncluded", e.target.checked)} className="rounded" />
                    Inclui IPTU
                  </label>
                </div>
              </div>

              {/* Pacote */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs pt-5">
                  <input type="checkbox" checked={contract.isPackage} onChange={e => setC("isPackage", e.target.checked)} className="rounded" />
                  Pacote de Locação (valor total fechado)
                </label>
                {contract.isPackage && (
                  <div><Label className="text-xs">Valor Total do Pacote (R$)</Label><Input className="h-9" value={contract.packageTotal} onChange={e => setC("packageTotal", e.target.value)} /></div>
                )}
              </div>

              {/* Reajuste Anual */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-3">Reajuste Anual</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Índice de Reajuste</Label>
                    <Select value={contract.adjustmentIndex} onValueChange={v => setC("adjustmentIndex", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="igpm">IGPM</SelectItem>
                        <SelectItem value="ipca">IPCA</SelectItem>
                        <SelectItem value="inpc">INPC</SelectItem>
                        <SelectItem value="nenhum">Sem Reajuste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Valor do Reajuste (R$)</Label>
                    <Input className="h-9" value={contract.adjustmentValue} onChange={e => setC("adjustmentValue", e.target.value)} placeholder="Ex: 150.00" />
                  </div>
                  <div>
                    <Label className="text-xs">Próximo Reajuste</Label>
                    <Input type="date" className="h-9" value={contract.nextAdjustmentDate} onChange={e => setC("nextAdjustmentDate", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Multa e Juros */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-3">Multa e Juros por Atraso</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Multa por Atraso (%)</Label><Input className="h-9" value={contract.lateFeePercent} onChange={e => setC("lateFeePercent", e.target.value)} /></div>
                  <div><Label className="text-xs">Juros Diários (%)</Label><Input className="h-9" value={contract.dailyInterestPercent} onChange={e => setC("dailyInterestPercent", e.target.value)} /></div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label className="text-xs">Observações do Contrato</Label>
                <textarea className="w-full border border-border rounded-lg p-3 text-sm min-h-[60px] bg-background" value={contract.notes} onChange={e => setC("notes", e.target.value)} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ─── Descrição ─────────────────────────────────────────── */}
      <section className="space-y-3 border border-border rounded-xl p-4 bg-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Descrição</h3>
        <textarea className="w-full border border-border rounded-lg p-3 text-sm min-h-[80px] bg-background" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descrição do imóvel..." />
        <div>
          <Label className="text-xs">Diferenciais (separados por vírgula)</Label>
          <Input className="h-9" value={form.features} onChange={e => set("features", e.target.value)} placeholder="Piscina, Churrasqueira, Academia" />
        </div>
      </section>

      <Button onClick={handleSubmit} disabled={isPending} className="w-full" size="lg">
        {isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Salvando...</> : isLocacao ? "Cadastrar Imóvel para Locação" : "Cadastrar Imóvel para Venda"}
      </Button>
    </div>
  );
}
