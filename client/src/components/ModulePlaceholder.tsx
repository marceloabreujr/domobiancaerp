import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/60 px-4 py-2 rounded-full">
        <Construction className="h-4 w-4" />
        <span>Em desenvolvimento</span>
      </div>
    </div>
  );
}
