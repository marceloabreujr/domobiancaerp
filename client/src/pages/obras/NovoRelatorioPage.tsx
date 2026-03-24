import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function NovoRelatorioPage() {
  const obras = trpc.constructions.list.useQuery({ archived: false });
  const allReports = trpc.constructionReports.listAll.useQuery();
  const createMut = trpc.constructionReports.create.useMutation({
    onSuccess: () => { allReports.refetch(); toast.success("Relatório criado!"); setForm(f => ({ ...f, title: "", content: "", author: "" })); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.constructionReports.delete.useMutation({
    onSuccess: () => { allReports.refetch(); toast.success("Relatório excluído!"); },
  });

  const [form, setForm] = useState({
    constructionId: "",
    title: "",
    content: "",
    author: "",
    reportDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.constructionId || !form.title.trim() || !form.content.trim()) {
      toast.error("Preencha obra, título e conteúdo"); return;
    }
    createMut.mutate({
      constructionId: Number(form.constructionId),
      title: form.title,
      content: form.content,
      author: form.author || undefined,
      reportDate: form.reportDate,
    });
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" /> Relatórios de Obra
      </h2>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 mb-6 space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Novo Relatório</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Obra *</Label>
            <Select value={form.constructionId} onValueChange={v => setForm(f => ({ ...f, constructionId: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar obra..." /></SelectTrigger>
              <SelectContent>
                {obras.data?.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={form.reportDate} onChange={e => setForm(f => ({ ...f, reportDate: e.target.value }))} />
          </div>
        </div>
        <div>
          <Label>Título *</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Acompanhamento semanal" />
        </div>
        <div>
          <Label>Autor</Label>
          <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Nome de quem escreveu" />
        </div>
        <div>
          <Label>Conteúdo *</Label>
          <textarea
            className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Descreva o que foi executado, materiais utilizados, observações..."
          />
        </div>
        <Button type="submit" disabled={createMut.isPending}>
          {createMut.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          Salvar Relatório
        </Button>
      </form>

      {/* Lista de relatórios */}
      <h3 className="font-medium mb-3">Relatórios Recentes</h3>
      {allReports.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-5 w-5" /></div>
      ) : (allReports.data ?? []).length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum relatório cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {(allReports.data ?? []).map(r => {
            const obraNome = obras.data?.find(o => o.id === r.constructionId)?.title ?? `Obra #${r.constructionId}`;
            return (
              <div key={r.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{r.title}</h4>
                    <p className="text-xs text-muted-foreground">{obraNome} · {new Date(r.reportDate).toLocaleDateString("pt-BR")}{r.author ? ` · ${r.author}` : ""}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: r.id })}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground">{r.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
