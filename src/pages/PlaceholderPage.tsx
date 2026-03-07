import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-6 space-y-4 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="panel flex flex-col items-center justify-center py-20 text-center space-y-3">
        <Construction className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">This module is under development</p>
      </div>
    </div>
  );
}
