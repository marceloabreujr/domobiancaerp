import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, HardHat } from "lucide-react";
import { toast } from "sonner";

const progressOptions = [
  { value: "avancada", label: "Avançada", color: "bg-green-500" },
  { value: "em_dia", label: "Em Dia", color: "bg-yellow-500" },
  { value: "atrasada", label: "Atrasada", color: "bg-orange-500" },
  { value: "totalmente_atrasada", label: "Totalmente Atrasada", color: "bg-red-500" },
] as const;

export default function NovaObraPage({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    hasKey: false,
    contractorId: undefined as number | undefined,
    architectId: undefined as number | undefined,
    constructionType: "residencial" as string,
    status: "em_andamento" as string,
    progress: "em_dia" as string,
    description: "",
    startDate: "",
    expectedEndDate: "",
  });

  const contractors = trpc.contractors.list.useQuery();
  const architects = trpc.architects.list.useQuery();
  const createMut = trpc.constructions.create.useMutation({
    onSuccess: () => {
      toast.success("Obra cadastrada com sucesso!");
      onSuccess?.();
    },
    onError: (e) => toast.error(e.message),
  });

  // Quick-add modals
  const [showNewContractor, setShowNewContractor] = useState(false);
  const [newContractorName, setNewContractorName] = useState("");
  const createContractor = trpc.contractors.create.useMutation({
    onSuccess: () => { contractors.refetch(); setShowNewContractor(false); setNewContractorName(""); toast.success("Empreiteiro cadastrado!"); },
  });

  const [showNewArchitect, setShowNewArchitect] = useState(false);
  const [newArchitectName, setNewArchitectName] = useState("");
  const createArchitect = trpc.architects.create.useMutation({
    onSuccess: () => { architects.refetch(); setShowNewArchitect(false); setNewArchitectName(""); toast.success("Arquiteta cadastrada!"); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Título é obrigatório"); return; }
    createMut.mutate({
      ...form,
      contractorId: form.contractorId || undefined,
      architectId: form.architectId || undefined,
      startDate: form.startDate || undefined,
      expectedEndDate: form.expectedEndDate || undefined,
    } as any);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <HardHat className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Nova Obra</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção 1 - Informações Básicas */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-medium text-base mb-4 text-foreground">1. Informações Básicas e Localização</h3>
          <div className="space-y-4">
            <div>
              <Label>Título da Obra *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Reforma Apt. 302 - Ed. Solar" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Switch checked={form.hasKey} onCheckedChange={v => setForm(f => ({ ...f, hasKey: v }))} />
              <span className="text-sm">{form.hasKey ? "Temos a chave" : "Não temos a chave"}</span>
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cidade</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="UF" maxLength={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data de Início</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <Label>Previsão de Término</Label>
                <Input type="date" value={form.expectedEndDate} onChange={e => setForm(f => ({ ...f, expectedEndDate: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 - Profissionais */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-medium text-base mb-4 text-foreground">2. Gestão de Profissionais</h3>
          <div className="space-y-4">
            {/* Empreiteiro */}
            <div>
              <Label>Empreiteiro Responsável</Label>
              <div className="flex gap-2">
                <Select value={form.contractorId?.toString() ?? "none"} onValueChange={v => setForm(f => ({ ...f, contractorId: v === "none" ? undefined : Number(v) }))}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {contractors.data?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewContractor(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewContractor && (
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Nome do empreiteiro" value={newContractorName} onChange={e => setNewContractorName(e.target.value)} />
                  <Button type="button" size="sm" onClick={() => createContractor.mutate({ name: newContractorName })} disabled={!newContractorName.trim()}>
                    Salvar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewContractor(false)}>Cancelar</Button>
                </div>
              )}
            </div>
            {/* Arquiteta */}
            <div>
              <Label>Arquiteta Responsável</Label>
              <div className="flex gap-2">
                <Select value={form.architectId?.toString() ?? "none"} onValueChange={v => setForm(f => ({ ...f, architectId: v === "none" ? undefined : Number(v) }))}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {architects.data?.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewArchitect(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showNewArchitect && (
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Nome da arquiteta" value={newArchitectName} onChange={e => setNewArchitectName(e.target.value)} />
                  <Button type="button" size="sm" onClick={() => createArchitect.mutate({ name: newArchitectName })} disabled={!newArchitectName.trim()}>
                    Salvar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewArchitect(false)}>Cancelar</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 3 - Características */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-medium text-base mb-4 text-foreground">3. Características da Obra</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo de Obra</Label>
                <Select value={form.constructionType} onValueChange={v => setForm(f => ({ ...f, constructionType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="reforma">Reforma</SelectItem>
                    <SelectItem value="galpao">Galpão</SelectItem>
                    <SelectItem value="loteamento">Loteamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="paralisada">Paralisada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Andamento visual */}
            <div>
              <Label className="mb-2 block">Andamento da Obra</Label>
              <div className="flex gap-2 flex-wrap">
                {progressOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, progress: opt.value }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.progress === opt.value
                        ? `${opt.color} text-white shadow-md scale-105`
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Descrição / Observações</Label>
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detalhes adicionais sobre a obra..."
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={createMut.isPending} className="w-full">
          {createMut.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
          Cadastrar Obra
        </Button>
      </form>
    </div>
  );
}
