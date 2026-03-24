import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, FileSearch, FileText, MessageSquare, Send, Loader2, Upload, Copy } from "lucide-react";

type Tool = "ocr" | "resumo" | "comunicado" | "assistente";

const tools = [
  { id: "ocr" as Tool, label: "OCR Faturas", icon: FileSearch, desc: "Leia faturas e recibos automaticamente" },
  { id: "resumo" as Tool, label: "Resumo Contratos", icon: FileText, desc: "Resuma contratos complexos" },
  { id: "comunicado" as Tool, label: "Comunicados", icon: MessageSquare, desc: "Gere rascunhos de comunicados" },
  { id: "assistente" as Tool, label: "Assistente", icon: Sparkles, desc: "Pergunte qualquer coisa sobre gestão" },
];

export default function IAPage() {
  const [activeTool, setActiveTool] = useState<Tool>("assistente");

  return (
    <div className="space-y-6">
      {/* Tool selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTool === t.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/30 hover:bg-muted/30"
            }`}
          >
            <t.icon className={`h-5 w-5 mb-2 ${activeTool === t.id ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium text-foreground">{t.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Tool content */}
      <div className="border border-border rounded-xl p-6">
        {activeTool === "ocr" && <OCRTool />}
        {activeTool === "resumo" && <ResumoTool />}
        {activeTool === "comunicado" && <ComunicadoTool />}
        {activeTool === "assistente" && <AssistenteTool />}
      </div>
    </div>
  );
}

// ─── OCR FATURAS ────────────────────────────────────────────────────────────

function OCRTool() {
  const ocrMutation = trpc.ai.ocrInvoice.useMutation();
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande (máx. 10MB)."); return; }
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    setPreview(`data:${file.type};base64,${base64}`);
    ocrMutation.mutate({ imageBase64: base64, mimeType: file.type });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground mb-1">Leitura de Faturas por OCR</h3>
        <p className="text-sm text-muted-foreground">Envie uma foto ou scan de fatura/recibo e a IA extrairá os dados automaticamente.</p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <Button variant="outline" className="w-full h-24 border-dashed" onClick={() => fileRef.current?.click()}>
        <div className="flex flex-col items-center gap-1">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Clique para enviar imagem</span>
        </div>
      </Button>

      {preview && (
        <div className="border border-border rounded-lg overflow-hidden max-h-48">
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
        </div>
      )}

      {ocrMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />Analisando imagem...
        </div>
      )}

      {ocrMutation.data?.data && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-sm">Dados Extraídos</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Fornecedor:</span> <span className="font-medium">{ocrMutation.data.data.fornecedor}</span></div>
            <div><span className="text-muted-foreground">CNPJ:</span> <span className="font-medium">{ocrMutation.data.data.cnpj}</span></div>
            <div><span className="text-muted-foreground">Data:</span> <span className="font-medium">{ocrMutation.data.data.data}</span></div>
            <div><span className="text-muted-foreground">Total:</span> <span className="font-semibold text-foreground">{ocrMutation.data.data.total}</span></div>
          </div>
          {ocrMutation.data.data.itens && ocrMutation.data.data.itens.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Itens:</p>
              <div className="space-y-1">
                {ocrMutation.data.data.itens.map((item: any, i: number) => (
                  <div key={i} className="text-xs flex justify-between bg-background rounded px-2 py-1">
                    <span>{item.descricao}</span>
                    <span className="font-medium">{item.valorTotal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RESUMO DE CONTRATOS ────────────────────────────────────────────────────

function ResumoTool() {
  const summarize = trpc.ai.summarizeContract.useMutation();
  const [text, setText] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground mb-1">Resumo de Contratos</h3>
        <p className="text-sm text-muted-foreground">Cole o texto do contrato e a IA gerará um resumo com os pontos principais.</p>
      </div>
      <textarea
        className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="Cole o texto do contrato aqui..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={() => {
        if (text.trim().length < 10) { toast.error("Texto muito curto."); return; }
        summarize.mutate({ text });
      }} disabled={summarize.isPending}>
        {summarize.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Analisando...</> : <><Sparkles className="h-4 w-4 mr-1.5" />Resumir</>}
      </Button>

      {summarize.data?.summary && (
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Resumo</h4>
            <Button variant="ghost" size="sm" className="h-7" onClick={() => { navigator.clipboard.writeText(String(summarize.data!.summary)); toast.success("Copiado!"); }}>
              <Copy className="h-3.5 w-3.5 mr-1" />Copiar
            </Button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{String(summarize.data.summary)}</p>
        </div>
      )}
    </div>
  );
}

// ─── COMUNICADOS ────────────────────────────────────────────────────────────

function ComunicadoTool() {
  const draft = trpc.ai.draftMemo.useMutation();
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<string>("formal");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground mb-1">Gerar Comunicado Interno</h3>
        <p className="text-sm text-muted-foreground">Descreva o assunto e a IA criará um rascunho profissional.</p>
      </div>
      <div>
        <Label>Assunto *</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Mudança de horário de expediente" />
      </div>
      <div>
        <Label>Detalhes adicionais</Label>
        <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Informações extras para incluir no comunicado..." />
      </div>
      <div>
        <Label>Tom</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="informal">Informal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => {
        if (subject.trim().length < 3) { toast.error("Assunto muito curto."); return; }
        draft.mutate({ subject, details: details || undefined, tone: tone as any });
      }} disabled={draft.isPending}>
        {draft.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Gerando...</> : <><MessageSquare className="h-4 w-4 mr-1.5" />Gerar Rascunho</>}
      </Button>

      {draft.data?.draft && (
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Rascunho</h4>
            <Button variant="ghost" size="sm" className="h-7" onClick={() => { navigator.clipboard.writeText(String(draft.data!.draft)); toast.success("Copiado!"); }}>
              <Copy className="h-3.5 w-3.5 mr-1" />Copiar
            </Button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{String(draft.data.draft)}</p>
        </div>
      )}
    </div>
  );
}

// ─── ASSISTENTE VIRTUAL ─────────────────────────────────────────────────────

function AssistenteTool() {
  const askAI = trpc.ai.assistant.useMutation();
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Array<{ q: string; a: string }>>([]);

  const handleAsk = () => {
    if (question.trim().length < 3) { toast.error("Pergunta muito curta."); return; }
    const q = question;
    setQuestion("");
    askAI.mutate({ question: q }, {
      onSuccess: (data) => {
        const answer = typeof data.answer === "string" ? data.answer : JSON.stringify(data.answer);
        setHistory((prev) => [{ q, a: answer }, ...prev]);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground mb-1">Assistente Virtual</h3>
        <p className="text-sm text-muted-foreground">Pergunte sobre gestão, obras, imóveis, finanças ou qualquer tema administrativo.</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Faça sua pergunta..."
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
        />
        <Button onClick={handleAsk} disabled={askAI.isPending} size="icon" className="shrink-0">
          {askAI.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {askAI.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />Pensando...
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm">
                  {h.q}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-xl rounded-tl-sm px-4 py-2 max-w-[80%] text-sm text-foreground whitespace-pre-wrap">
                  {h.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
