import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Image, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdicionarImagemPage() {
  const obras = trpc.constructions.list.useQuery({ archived: false });
  const allImages = trpc.constructionImages.listAll.useQuery();
  const uploadMut = trpc.constructionImages.upload.useMutation({
    onSuccess: () => { allImages.refetch(); toast.success("Imagem adicionada!"); setCaption(""); setFile(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.constructionImages.delete.useMutation({
    onSuccess: () => { allImages.refetch(); toast.success("Imagem excluída!"); },
  });

  const [selectedObra, setSelectedObra] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedObra || !file) { toast.error("Selecione uma obra e uma imagem"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande (máx. 5MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMut.mutate({
        constructionId: Number(selectedObra),
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
        caption: caption || undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  // Filter images by selected obra
  const [filterObra, setFilterObra] = useState("");
  const images = (allImages.data ?? []).filter(img => !filterObra || img.constructionId === Number(filterObra));

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Image className="h-5 w-5" /> Galeria de Imagens
      </h2>

      {/* Upload */}
      <div className="bg-card border border-border rounded-lg p-5 mb-6 space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Adicionar Imagem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Obra *</Label>
            <Select value={selectedObra} onValueChange={setSelectedObra}>
              <SelectTrigger><SelectValue placeholder="Selecionar obra..." /></SelectTrigger>
              <SelectContent>
                {obras.data?.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Legenda</Label>
            <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Descrição da foto" />
          </div>
        </div>
        <div>
          <Label>Arquivo *</Label>
          <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button onClick={handleUpload} disabled={uploadMut.isPending || !file || !selectedObra}>
          {uploadMut.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Enviar Imagem
        </Button>
      </div>

      {/* Filtro */}
      <div className="flex items-center gap-3 mb-4">
        <Label className="text-sm">Filtrar por obra:</Label>
        <Select value={filterObra} onValueChange={setFilterObra}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {obras.data?.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Galeria */}
      {allImages.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-5 w-5" /></div>
      ) : images.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhuma imagem cadastrada.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map(img => {
            const obraNome = obras.data?.find(o => o.id === img.constructionId)?.title ?? "";
            return (
              <div key={img.id} className="relative group bg-card border border-border rounded-lg overflow-hidden">
                <img src={img.imageUrl} alt={img.caption ?? ""} className="w-full h-32 object-cover" />
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{img.caption || "Sem legenda"}</p>
                  <p className="text-xs text-muted-foreground">{obraNome}</p>
                  <p className="text-xs text-muted-foreground">{new Date(img.uploadedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                  onClick={() => deleteMut.mutate({ id: img.id })}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
