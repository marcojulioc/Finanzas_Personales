import { TrendingUp } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Finanzas</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Toma el control de
              <br />
              tus finanzas personales
            </h1>
            <p className="text-lg text-slate-300 max-w-md">
              Gestiona tus ingresos, gastos y presupuestos de manera inteligente.
              Visualiza tu progreso financiero en tiempo real.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm text-slate-400">Privado y seguro</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-slate-400">Acceso total</p>
              </div>
              <div>
                <p className="text-3xl font-bold">RD$</p>
                <p className="text-sm text-slate-400">Moneda local</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Desarrollado con Next.js y React
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Finanzas</span>
            </div>
            <p className="text-muted-foreground text-center">
              Controla tus gastos e ingresos de forma simple
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
