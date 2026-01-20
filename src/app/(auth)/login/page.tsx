"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Loader2, CheckCircle, ArrowLeft, User, KeyRound } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const verify = searchParams.get("verify");
  const error = searchParams.get("error");

  // Magic link state
  const [email, setEmail] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // PIN login state
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const [pinError, setPinError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    try {
      await signIn("resend", { email, callbackUrl });
      setEmailSent(true);
    } catch {
      console.error("Error al enviar email");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handlePinSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setIsLoadingPin(true);

    try {
      const result = await signIn("credentials", {
        username,
        pin,
        redirect: false,
      });

      if (result?.error) {
        setPinError("Usuario o PIN incorrecto");
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch {
      setPinError("Error al iniciar sesión");
    } finally {
      setIsLoadingPin(false);
    }
  };

  if (verify || emailSent) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl stat-icon-green">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Revisa tu correo</CardTitle>
          <CardDescription className="text-base mt-2">
            Te hemos enviado un enlace de acceso a{" "}
            <span className="font-medium text-foreground">{email || "tu correo"}</span>.
            Haz clic en el enlace para iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => setEmailSent(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Usar otro método
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">Bienvenido</CardTitle>
        <CardDescription className="text-base">
          Inicia sesión para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 mb-4">
            {error === "OAuthAccountNotLinked"
              ? "Este correo ya está asociado a otro método de inicio de sesión."
              : error === "CredentialsSignin"
              ? "Usuario o PIN incorrecto"
              : "Ocurrió un error. Por favor intenta de nuevo."}
          </div>
        )}

        <Tabs defaultValue="pin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pin" className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Usuario y PIN
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Magic Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pin" className="space-y-4">
            <form onSubmit={handlePinSignIn} className="space-y-4">
              {pinError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                  {pinError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="tu_usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    disabled={isLoadingPin}
                    className="h-12 pl-10 rounded-xl border-border/50 focus:border-primary"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium">
                  PIN (4 dígitos)
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="****"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    required
                    disabled={isLoadingPin}
                    className="h-12 pl-10 rounded-xl border-border/50 focus:border-primary tracking-widest text-center text-lg"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold"
                disabled={isLoadingPin || pin.length !== 4}
              >
                {isLoadingPin ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4 mr-2" />
                )}
                Iniciar sesión
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center">
              Configura tu usuario y PIN en Ajustes → Seguridad
            </p>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoadingEmail}
                  className="h-12 rounded-xl border-border/50 focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold"
                disabled={isLoadingEmail}
              >
                {isLoadingEmail ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Enviar enlace de acceso
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center">
              Recibirás un enlace en tu correo para acceder
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LoginSkeleton() {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-2">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
        </div>
        <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
