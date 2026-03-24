import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NovoImovelPage({ onSuccess }: { onSuccess: () => void }) {
  const utils = trpc.useUtils();
  const { data: ownersList } = trpc.owners.list.useQuery();
  const createMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      utils.properties.stats.invalidate();
      toast.success("Imóvel cadastrado com sucesso!");
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    title: "", code: "", ownership: "domobianca", propertyType: "apartamento", status: "disponivel",
    ownerId: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "",
    area: "", bedrooms: "", bathrooms: "", parkingSpots: "", suites: "",
    rentValue: "", saleValue: "", condoFee: "", iptuValue: "", adminFeePercent: "", saleCommissionPercent: "",
    description: "", features: "",
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.title) { toast.error("Informe o título do imóvel."); return; }
    createMutation.mutate({
      title: form.title,
      code: form.code || undefined,
      ownership: form.ownership as any,
      propertyType: form.propertyType as any,
      status: form.status as any,
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
      rentValue: form.rentValue || undefined,
      saleValue: form.saleValue || undefined,
      condoFee: form.condoFee || undefined,
      iptuValue: form.iptuValue || undefined,
      adminFeePercent: form.adminFeePercent || undefined,
      saleCommissionPercent: form.saleCommissionPercent || undefined,
      description: form.description || undefined,
      features: form.features || undefined,
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold">Novo Imóvel</h2>

      {/* Identificação */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Identificação</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Título / Nome do Imóvel *</Label>
            <Input className="h-9" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Apto 301 - Ed. Solar" />
          </div>
          <div>
            <Label className="text-xs">Código</Label>
            <Input className="h-9" value={form.code} onChange={e => set("code", e.target.value)} placeholder="IMV-001" />
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
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="alugado">Alugado</SelectItem>
                <SelectItem value="a_venda">À Venda</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
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

      {/* Endereço */}
      <section className="space-y-3">
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

      {/* Características */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Características</h3>
        <div className="grid grid-cols-5 gap-3">
          <div><Label className="text-xs">Área (m²)</Label><Input className="h-9" value={form.area} onChange={e => set("area", e.target.value)} /></div>
          <div><Label className="text-xs">Quartos</Label><Input type="number" className="h-9" value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} /></div>
          <div><Label className="text-xs">Suítes</Label><Input type="number" className="h-9" value={form.suites} onChange={e => set("suites", e.target.value)} /></div>
          <div><Label className="text-xs">Banheiros</Label><Input type="number" className="h-9" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} /></div>
          <div><Label className="text-xs">Vagas</Label><Input type="number" className="h-9" value={form.parkingSpots} onChange={e => set("parkingSpots", e.target.value)} /></div>
        </div>
      </section>

      {/* Valores */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Valores</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Aluguel (R$)</Label><Input className="h-9" value={form.rentValue} onChange={e => set("rentValue", e.target.value)} placeholder="1500.00" /></div>
          <div><Label className="text-xs">Venda (R$)</Label><Input className="h-9" value={form.saleValue} onChange={e => set("saleValue", e.target.value)} placeholder="350000.00" /></div>
          <div><Label className="text-xs">Condomínio (R$)</Label><Input className="h-9" value={form.condoFee} onChange={e => set("condoFee", e.target.value)} placeholder="500.00" /></div>
          <div><Label className="text-xs">IPTU (R$)</Label><Input className="h-9" value={form.iptuValue} onChange={e => set("iptuValue", e.target.value)} placeholder="200.00" /></div>
          <div><Label className="text-xs">Taxa Admin (%)</Label><Input className="h-9" value={form.adminFeePercent} onChange={e => set("adminFeePercent", e.target.value)} placeholder="10" /></div>
          <div><Label className="text-xs">Comissão Venda (%)</Label><Input className="h-9" value={form.saleCommissionPercent} onChange={e => set("saleCommissionPercent", e.target.value)} placeholder="6" /></div>
        </div>
      </section>

      {/* Descrição */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Descrição</h3>
        <textarea className="w-full border border-border rounded-lg p-3 text-sm min-h-[80px] bg-background" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descrição do imóvel..." />
        <div>
          <Label className="text-xs">Diferenciais (separados por vírgula)</Label>
          <Input className="h-9" value={form.features} onChange={e => set("features", e.target.value)} placeholder="Piscina, Churrasqueira, Academia" />
        </div>
      </section>

      <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full">
        {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Salvando...</> : "Cadastrar Imóvel"}
      </Button>
    </div>
  );
}
