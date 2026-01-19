import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Finanzas Personales</h1>
          <p className="text-muted-foreground text-center">
            Controla tus gastos e ingresos de forma simple
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
