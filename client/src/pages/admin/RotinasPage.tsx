import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Package, Car, Wallet, Headphones, Trash2, AlertTriangle, Pencil } from "lucide-react";

type Section = "consumiveis" | "frota" | "fundo" | "chamados";

const sections = [
  { id: "consumiveis" as Section, label: "Consumíveis", icon: Package },
  { id: "frota" as Section, label: "Frota", icon: Car },
  { id: "fundo" as Section, label: "Fundo de Maneio", icon: Wallet },
  { id: "chamados" as Section, label: "Chamados", icon: Headphones },
];

export default function RotinasPage() {
  const [section, setSection] = useState<Section>("consumiveis");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              section === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />{s.label}
          </button>
        ))}
      </div>

      {section === "consumiveis" && <ConsumiveisSection />}
      {section === "frota" && <FrotaSection />}
      {section === "fundo" && <FundoSection />}
      {section === "chamados" && <ChamadosSection />}
    </div>
  );
}

// ─── CONSUMÍVEIS ────────────────────────────────────────────────────────────

function ConsumiveisSection() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.supplies.list.useQuery();
  const createItem = trpc.supplies.create.useMutation({ onSuccess: () => { utils.supplies.list.invalidate(); toast.success("Item cadastrado."); setShow(false); } });
  const updateItem = trpc.supplies.update.useMutation({ onSuccess: () => { utils.supplies.list.invalidate(); toast.success("Item atualizado."); setShow(false); } });
  const deleteItem = trpc.supplies.delete.useMutation({ onSuccess: () => { utils.supplies.list.invalidate(); toast.success("Item removido."); } });

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", category: "outro" as string, currentStock: 0, minStock: 5, unit: "un" });

  const lowStock = (items || []).filter((i) => (i.currentStock ?? 0) <= (i.minStock ?? 5));

  const CAT_LABELS: Record<string, string> = { escritorio: "Escritório", copa: "Copa", limpeza: "Limpeza", outro: "Outro" };

  return (
    <div className="space-y-4">
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Estoque baixo ({lowStock.length} itens)</span>
          </div>
          <div className="text-xs text-amber-700">{lowStock.map((i) => i.name).join(", ")}</div>
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setForm({ name: "", category: "outro", currentStock: 0, minStock: 5, unit: "un" }); setEditId(null); setShow(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo Item
        </Button>
      </div>

      {isLoading ? <div className="h-20 bg-muted animate-pulse rounded-lg" /> : (items || []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">Nenhum item cadastrado.</p></div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Item</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
              <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Estoque</th>
              <th className="text-center px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Mín.</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Ações</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {(items || []).map((item) => {
                const isLow = (item.currentStock ?? 0) <= (item.minStock ?? 5);
                return (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium">{item.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{CAT_LABELS[item.category] || item.category}</td>
                    <td className={`px-4 py-2.5 text-center font-medium ${isLow ? "text-red-600" : ""}`}>{item.currentStock ?? 0} {item.unit}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground hidden sm:table-cell">{item.minStock ?? 5}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm({ name: item.name, category: item.category, currentStock: item.currentStock ?? 0, minStock: item.minStock ?? 5, unit: item.unit ?? "un" }); setEditId(item.id); setShow(true); }}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remover?")) deleteItem.mutate({ id: item.id }); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Editar Item" : "Novo Item"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="escritorio">Escritório</SelectItem><SelectItem value="copa">Copa</SelectItem><SelectItem value="limpeza">Limpeza</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Estoque</Label><Input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} /></div>
              <div><Label>Mínimo</Label><Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
              <div><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.name.trim()) { toast.error("Nome obrigatório."); return; }
              if (editId) updateItem.mutate({ id: editId, ...form, category: form.category as any });
              else createItem.mutate({ ...form, category: form.category as any });
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FROTA ──────────────────────────────────────────────────────────────────

function FrotaSection() {
  const utils = trpc.useUtils();
  const { data: vehicles, isLoading } = trpc.fleet.list.useQuery();
  const createVehicle = trpc.fleet.create.useMutation({ onSuccess: () => { utils.fleet.list.invalidate(); toast.success("Veículo cadastrado."); setShow(false); } });
  const updateVehicle = trpc.fleet.update.useMutation({ onSuccess: () => { utils.fleet.list.invalidate(); toast.success("Veículo atualizado."); setShow(false); } });
  const deleteVehicle = trpc.fleet.delete.useMutation({ onSuccess: () => { utils.fleet.list.invalidate(); toast.success("Veículo removido."); } });

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ plate: "", model: "", year: new Date().getFullYear(), status: "disponivel" as string, assignedTo: "", km: 0, notes: "" });

  const STATUS_L: Record<string, string> = { disponivel: "Disponível", em_uso: "Em uso", manutencao: "Manutenção", inativo: "Inativo" };
  const STATUS_C: Record<string, string> = { disponivel: "bg-emerald-500/10 text-emerald-600", em_uso: "bg-blue-500/10 text-blue-600", manutencao: "bg-amber-500/10 text-amber-600", inativo: "bg-red-500/10 text-red-600" };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setForm({ plate: "", model: "", year: new Date().getFullYear(), status: "disponivel", assignedTo: "", km: 0, notes: "" }); setEditId(null); setShow(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo Veículo
        </Button>
      </div>

      {isLoading ? <div className="h-20 bg-muted animate-pulse rounded-lg" /> : (vehicles || []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Car className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">Nenhum veículo cadastrado.</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(vehicles || []).map((v) => (
            <div key={v.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{v.plate}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_C[v.status]}`}>{STATUS_L[v.status]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{v.model} {v.year ? `(${v.year})` : ""}</p>
                  {v.assignedTo && <p className="text-xs text-muted-foreground mt-1">Responsável: {v.assignedTo}</p>}
                  {v.km ? <p className="text-xs text-muted-foreground">{v.km.toLocaleString("pt-BR")} km</p> : null}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm({ plate: v.plate, model: v.model, year: v.year ?? new Date().getFullYear(), status: v.status, assignedTo: v.assignedTo ?? "", km: v.km ?? 0, notes: v.notes ?? "" }); setEditId(v.id); setShow(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remover?")) deleteVehicle.mutate({ id: v.id }); }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Editar Veículo" : "Novo Veículo"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Placa *</Label><Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="ABC-1234" /></div>
              <div><Label>Modelo *</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Fiat Uno" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Ano</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
              <div><Label>KM</Label><Input type="number" value={form.km} onChange={(e) => setForm({ ...form, km: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="disponivel">Disponível</SelectItem><SelectItem value="em_uso">Em uso</SelectItem><SelectItem value="manutencao">Manutenção</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Responsável</Label><Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.plate.trim() || !form.model.trim()) { toast.error("Placa e modelo são obrigatórios."); return; }
              if (editId) updateVehicle.mutate({ id: editId, ...form, status: form.status as any });
              else createVehicle.mutate({ ...form, status: form.status as any });
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FUNDO DE MANEIO ────────────────────────────────────────────────────────

function FundoSection() {
  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.pettyCash.list.useQuery();
  const { data: balance } = trpc.pettyCash.balance.useQuery();
  const createEntry = trpc.pettyCash.create.useMutation({ onSuccess: () => { utils.pettyCash.list.invalidate(); utils.pettyCash.balance.invalidate(); toast.success("Lançamento registrado."); setShow(false); } });
  const deleteEntry = trpc.pettyCash.delete.useMutation({ onSuccess: () => { utils.pettyCash.list.invalidate(); utils.pettyCash.balance.invalidate(); toast.success("Lançamento removido."); } });

  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", type: "saida" as string, category: "", date: new Date().toISOString().split("T")[0] });

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-4">
      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-lg font-semibold text-emerald-600">{fmt(balance?.entradas ?? 0)}</p>
        </div>
        <div className="border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-lg font-semibold text-red-600">{fmt(balance?.saidas ?? 0)}</p>
        </div>
        <div className="border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className={`text-lg font-semibold ${(balance?.saldo ?? 0) >= 0 ? "text-foreground" : "text-red-600"}`}>{fmt(balance?.saldo ?? 0)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setForm({ description: "", amount: "", type: "saida", category: "", date: new Date().toISOString().split("T")[0] }); setShow(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo Lançamento
        </Button>
      </div>

      {isLoading ? <div className="h-20 bg-muted animate-pulse rounded-lg" /> : (entries || []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Wallet className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">Nenhum lançamento.</p></div>
      ) : (
        <div className="space-y-2">
          {(entries || []).map((e) => (
            <div key={e.id} className="border border-border rounded-lg px-4 py-3 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${e.type === "entrada" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                {e.type === "entrada" ? "+" : "−"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.description}</p>
                <p className="text-xs text-muted-foreground">{e.date ? new Date(e.date).toLocaleDateString("pt-BR") : ""}{e.category ? ` · ${e.category}` : ""}</p>
              </div>
              <span className={`text-sm font-semibold ${e.type === "entrada" ? "text-emerald-600" : "text-red-600"}`}>
                {e.type === "entrada" ? "+" : "−"} {fmt(parseFloat(e.amount))}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => { if (confirm("Remover?")) deleteEntry.mutate({ id: e.id }); }}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label>Descrição *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Café para copa" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Valor (R$) *</Label><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Copa, Material" /></div>
            <div><Label>Data *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.description.trim() || !form.amount || !form.date) { toast.error("Preencha os campos obrigatórios."); return; }
              createEntry.mutate({ ...form, type: form.type as any });
            }}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── CHAMADOS ───────────────────────────────────────────────────────────────

function ChamadosSection() {
  const utils = trpc.useUtils();
  const { data: tickets, isLoading } = trpc.tickets.list.useQuery({});
  const createTicket = trpc.tickets.create.useMutation({ onSuccess: () => { utils.tickets.list.invalidate(); toast.success("Chamado aberto."); setShow(false); } });
  const updateTicket = trpc.tickets.update.useMutation({ onSuccess: () => { utils.tickets.list.invalidate(); toast.success("Chamado atualizado."); } });
  const deleteTicket = trpc.tickets.delete.useMutation({ onSuccess: () => { utils.tickets.list.invalidate(); toast.success("Chamado removido."); } });

  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "outro" as string, priority: "media" as string });

  const STATUS_L: Record<string, string> = { aberto: "Aberto", em_andamento: "Em andamento", resolvido: "Resolvido", fechado: "Fechado" };
  const STATUS_C: Record<string, string> = { aberto: "bg-blue-500/10 text-blue-600", em_andamento: "bg-amber-500/10 text-amber-600", resolvido: "bg-emerald-500/10 text-emerald-600", fechado: "bg-gray-500/10 text-gray-600" };
  const PRIO_L: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
  const PRIO_C: Record<string, string> = { baixa: "text-gray-500", media: "text-blue-500", alta: "text-amber-600", urgente: "text-red-600" };
  const CAT_L: Record<string, string> = { ti: "TI", manutencao: "Manutenção", limpeza: "Limpeza", seguranca: "Segurança", outro: "Outro" };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setForm({ title: "", description: "", category: "outro", priority: "media" }); setShow(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo Chamado
        </Button>
      </div>

      {isLoading ? <div className="h-20 bg-muted animate-pulse rounded-lg" /> : (tickets || []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Headphones className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">Nenhum chamado.</p></div>
      ) : (
        <div className="space-y-2">
          {(tickets || []).map((t) => (
            <div key={t.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">#{t.id} {t.title}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_C[t.status]}`}>{STATUS_L[t.status]}</span>
                    <span className={`text-[10px] font-medium ${PRIO_C[t.priority]}`}>{PRIO_L[t.priority]}</span>
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{CAT_L[t.category]} · {new Date(t.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {t.status === "aberto" && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updateTicket.mutate({ id: t.id, status: "em_andamento" })}>Iniciar</Button>
                  )}
                  {t.status === "em_andamento" && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updateTicket.mutate({ id: t.id, status: "resolvido" })}>Resolver</Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Remover?")) deleteTicket.mutate({ id: t.id }); }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Chamado</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Descreva o problema" /></div>
            <div><Label>Descrição</Label><textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ti">TI</SelectItem><SelectItem value="manutencao">Manutenção</SelectItem><SelectItem value="limpeza">Limpeza</SelectItem><SelectItem value="seguranca">Segurança</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem><SelectItem value="urgente">Urgente</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!form.title.trim()) { toast.error("Título obrigatório."); return; }
              createTicket.mutate({ ...form, category: form.category as any, priority: form.priority as any });
            }}>Abrir Chamado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
