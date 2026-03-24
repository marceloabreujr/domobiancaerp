import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft, Save, Briefcase } from "lucide-react";

const STEPS = [
  "Identificação",
  "Classificação",
  "Dados Técnicos",
  "Indicadores Financeiros",
  "Riscos e Próximos Passos",
];

export default function NovoNegocioPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const utils = trpc.useUtils();
  const { data: captadoresList } = trpc.captadores.list.useQuery();

  const [form, setForm] = useState({
    title: "",
    ownership: "proprio" as "proprio" | "terceiros",
    captadorId: undefined as number | undefined,
    address: "",
    city: "",
    state: "",
    phase: "prospeccao" as "prospeccao" | "analise" | "negociacao" | "due_diligence" | "aprovado" | "fechado" | "cancelado",
    operationType: "compra" as "compra" | "venda" | "permuta" | "incorporacao" | "loteamento" | "reforma" | "outro",
    priority: "media" as "baixa" | "media" | "alta" | "urgente",
    totalArea: "",
    usableArea: "",
    zoning: "",
    constructivePotential: "",
    opportunityCost: "",
    marketValue: "",
    maxInvestment: "",
    estimatedVGV: "",
    tirPercent: "",
    profitMarginPercent: "",
    documentationStatus: "",
    nextAction: "",
    nextActionPriority: "normal" as "normal" | "urgente",
    nextActionDate: "",
    notes: "",
  });

  const createMut = trpc.negocios.create.useMutation({
    onSuccess: () => {
      toast.success("Negócio criado com sucesso!");
      utils.negocios.list.invalidate();
      navigate("/negocios");
    },
    onError: (err) => toast.error(err.message),
  });

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Nome do negócio é obrigatório");
      return;
    }
    createMut.mutate({
      ...form,
      captadorId: form.captadorId || undefined,
      totalArea: form.totalArea || undefined,
      usableArea: form.usableArea || undefined,
      constructivePotential: form.constructivePotential || undefined,
      opportunityCost: form.opportunityCost || undefined,
      marketValue: form.marketValue || undefined,
      maxInvestment: form.maxInvestment || undefined,
      estimatedVGV: form.estimatedVGV || undefined,
      tirPercent: form.tirPercent || undefined,
      profitMarginPercent: form.profitMarginPercent || undefined,
      nextActionDate: form.nextActionDate || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Novo Negócio</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current/20">
              {i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        {/* SEÇÃO 1 - Identificação */}
        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold border-b border-border pb-2">1. Identificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome do Negócio *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Terreno Av. Brasil" />
              </div>
              <div>
                <Label>Titularidade</Label>
                <Select value={form.ownership} onValueChange={(v) => set("ownership", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proprio">Próprio</SelectItem>
                    <SelectItem value="terceiros">Terceiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Captador</Label>
                <Select value={form.captadorId?.toString() || "none"} onValueChange={(v) => set("captadorId", v === "none" ? undefined : parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {captadoresList?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Rua, número, bairro" />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} placeholder="UF" />
              </div>
            </div>
          </>
        )}

        {/* SEÇÃO 2 - Classificação */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold border-b border-border pb-2">2. Classificação e Estado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Fase</Label>
                <Select value={form.phase} onValueChange={(v) => set("phase", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospeccao">Prospecção</SelectItem>
                    <SelectItem value="analise">Análise</SelectItem>
                    <SelectItem value="negociacao">Negociação</SelectItem>
                    <SelectItem value="due_diligence">Due Diligence</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Operação</Label>
                <Select value={form.operationType} onValueChange={(v) => set("operationType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="permuta">Permuta</SelectItem>
                    <SelectItem value="incorporacao">Incorporação</SelectItem>
                    <SelectItem value="loteamento">Loteamento</SelectItem>
                    <SelectItem value="reforma">Reforma</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* SEÇÃO 3 - Dados Técnicos */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold border-b border-border pb-2">3. Dados Técnicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Área Total (m²)</Label>
                <Input type="number" value={form.totalArea} onChange={(e) => set("totalArea", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Área Útil (m²)</Label>
                <Input type="number" value={form.usableArea} onChange={(e) => set("usableArea", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Zoneamento</Label>
                <Input value={form.zoning} onChange={(e) => set("zoning", e.target.value)} placeholder="Ex: ZR-4, ZC-2" />
              </div>
              <div>
                <Label>Potencial Construtivo</Label>
                <Input type="number" value={form.constructivePotential} onChange={(e) => set("constructivePotential", e.target.value)} placeholder="Coeficiente" />
              </div>
            </div>
          </>
        )}

        {/* SEÇÃO 4 - Indicadores Financeiros */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold border-b border-border pb-2">4. Indicadores Financeiros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Custo de Oportunidade (R$)</Label>
                <Input type="number" value={form.opportunityCost} onChange={(e) => set("opportunityCost", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Valor de Mercado (R$)</Label>
                <Input type="number" value={form.marketValue} onChange={(e) => set("marketValue", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Investimento Máximo (R$)</Label>
                <Input type="number" value={form.maxInvestment} onChange={(e) => set("maxInvestment", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>VGV Estimado (R$)</Label>
                <Input type="number" value={form.estimatedVGV} onChange={(e) => set("estimatedVGV", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>TIR Estimada (%)</Label>
                <Input type="number" value={form.tirPercent} onChange={(e) => set("tirPercent", e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Margem de Lucro (%)</Label>
                <Input type="number" value={form.profitMarginPercent} onChange={(e) => set("profitMarginPercent", e.target.value)} placeholder="0.00" />
              </div>
            </div>
          </>
        )}

        {/* SEÇÃO 5 - Riscos e Próximos Passos */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold border-b border-border pb-2">5. Riscos e Próximos Passos</h2>
            <div className="space-y-4">
              <div>
                <Label>Status da Documentação</Label>
                <Textarea value={form.documentationStatus} onChange={(e) => set("documentationStatus", e.target.value)} placeholder="Descreva o estado atual da documentação..." rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Próxima Ação</Label>
                  <Input value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} placeholder="Ex: Agendar visita ao terreno" />
                </div>
                <div>
                  <Label>Prioridade da Ação</Label>
                  <Select value={form.nextActionPriority} onValueChange={(v) => set("nextActionPriority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data da Próxima Ação</Label>
                  <Input type="date" value={form.nextActionDate} onChange={(e) => set("nextActionDate", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Observações Gerais</Label>
                <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notas adicionais..." rows={3} />
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMut.isPending}>
              {createMut.isPending ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar Negócio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Loader2Icon(props: any) {
  return <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />;
}
