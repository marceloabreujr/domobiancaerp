import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, FileText, Download, Trash2, AlertTriangle, Search, Upload } from "lucide-react";

const CAT_LABELS: Record<string, string> = {
  contrato: "Contrato", alvara: "Alvará", certidao: "Certidão", planta: "Planta",
  foto: "Foto", fatura: "Fatura", recibo: "Recibo", outro: "Outro",
};

const CAT_COLORS: Record<string, string> = {
  contrato: "bg-blue-500/10 text-blue-600", alvara: "bg-emerald-500/10 text-emerald-600",
  certidao: "bg-purple-500/10 text-purple-600", planta: "bg-amber-500/10 text-amber-600",
  foto: "bg-pink-500/10 text-pink-600", fatura: "bg-orange-500/10 text-orange-600",
  recibo: "bg-teal-500/10 text-teal-600", outro: "bg-gray-500/10 text-gray-600",
};

export default function DocumentosPage() {
  const utils = trpc.useUtils();
  const [catFilter, setCatFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: docs, isLoading } = trpc.documents.list.useQuery(catFilter !== "all" ? { category: catFilter } : {});
  const { data: expiring } = trpc.documents.expiring.useQuery({ days: 30 });
  const createDoc = trpc.documents.create.useMutation({ onSuccess: () => { utils.documents.list.invalidate(); utils.documents.expiring.invalidate(); toast.success("Documento cadastrado."); setShowForm(false); } });
  const deleteDoc = trpc.documents.delete.useMutation({ onSuccess: () => { utils.documents.list.invalidate(); utils.documents.expiring.invalidate(); toast.success("Documento removido."); } });

  const [form, setForm] = useState({ title: "", category: "outro" as string, description: "", expiryDate: "" });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Título é obrigatório."); return; }
    let fileBase64: string | undefined;
    let fileName: string | undefined;
    let mimeType: string | undefined;
    if (file) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      fileBase64 = btoa(binary);
      fileName = file.name;
      mimeType = file.type;
    }
    createDoc.mutate({
      ...form,
      category: form.category as any,
      expiryDate: form.expiryDate || undefined,
      fileBase64,
      fileName,
      mimeType,
    });
  };

  const filtered = (docs || []).filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const isExpiringSoon = (dateStr: string | Date | null) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const diff = (d.getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 30;
  };

  const isExpired = (dateStr: string | Date | null) => {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  };

  return (
    <div className="space-y-6">
      {/* Alertas de vencimento */}
      {expiring && expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Documentos vencendo nos próximos 30 dias</span>
          </div>
          <div className="space-y-1">
            {expiring.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-xs text-amber-700">
                <span>{d.title} ({CAT_LABELS[d.category]})</span>
                <span>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString("pt-BR") : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar documento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(CAT_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setForm({ title: "", category: "outro", description: "", expiryDate: "" }); setFile(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />Novo Documento
        </Button>
      </div>

      {/* Documents list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum documento encontrado</p>
          <p className="text-sm mt-1">Faça upload do primeiro documento.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((doc) => (
            <div key={doc.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[doc.category]}`}>
                    {CAT_LABELS[doc.category]}
                  </span>
                  {doc.expiryDate && isExpired(doc.expiryDate) && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">Vencido</span>
                  )}
                  {doc.expiryDate && isExpiringSoon(doc.expiryDate) && !isExpired(doc.expiryDate) && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">Vence em breve</span>
                  )}
                </div>
                {doc.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doc.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {doc.fileName && <span>{doc.fileName}</span>}
                  {doc.expiryDate && <span>Vence: {new Date(doc.expiryDate).toLocaleDateString("pt-BR")}</span>}
                  <span>Criado: {new Date(doc.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {doc.fileUrl && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(doc.fileUrl!, "_blank")}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover este documento?")) deleteDoc.mutate({ id: doc.id }); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Documento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome do documento" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CAT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Data de Validade</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div>
              <Label>Arquivo</Label>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button variant="outline" className="w-full justify-start" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : "Selecionar arquivo..."}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createDoc.isPending}>
              {createDoc.isPending ? "Enviando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
