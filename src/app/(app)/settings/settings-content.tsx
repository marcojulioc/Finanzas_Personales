"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Wallet,
  Building,
  CreditCard,
  Shield,
  KeyRound,
  User,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import {
  getAccountsWithBalancesAction,
  createAccountAction,
  deleteAccountAction,
} from "@/server/actions/account.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import {
  setupCredentialsAction,
  changePinAction,
  getCredentialsStatusAction,
} from "@/server/actions/auth.actions";
import type { AccountWithBalance, CategoryWithSubcategories } from "@/types";

const accountTypeIcons = {
  CASH: Wallet,
  BANK: Building,
  CREDIT_CARD: CreditCard,
};

const accountTypeLabels = {
  CASH: "Efectivo",
  BANK: "Banco",
  CREDIT_CARD: "Tarjeta de Crédito",
};

export function SettingsContent() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState<{
    name: string;
    type: "CASH" | "BANK" | "CREDIT_CARD";
    initialBalance: number;
    creditLimit?: number;
    cutoffDay?: number;
    paymentDueDay?: number;
  }>({
    name: "",
    type: "CASH",
    initialBalance: 0,
  });

  // Security state
  const [hasCredentials, setHasCredentials] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [securityForm, setSecurityForm] = useState({
    username: "",
    pin: "",
    confirmPin: "",
  });
  const [changePinForm, setChangePinForm] = useState({
    currentPin: "",
    newPin: "",
    confirmNewPin: "",
  });
  const [isSettingUpCredentials, setIsSettingUpCredentials] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [accountsResult, categoriesResult, credentialsStatus] = await Promise.all([
          getAccountsWithBalancesAction(undefined),
          getCategoriesAction(undefined),
          getCredentialsStatusAction(),
        ]);
        if (accountsResult.success && accountsResult.data) setAccounts(accountsResult.data);
        if (categoriesResult.success && categoriesResult.data) setCategories(categoriesResult.data);
        setHasCredentials(credentialsStatus.hasCredentials);
        setCurrentUsername(credentialsStatus.username);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim()) {
      toast.error("Nombre de cuenta requerido");
      return;
    }

    // Validar campos de tarjeta de crédito
    if (newAccount.type === "CREDIT_CARD") {
      if (!newAccount.creditLimit || newAccount.creditLimit <= 0) {
        toast.error("Límite de crédito requerido para tarjetas");
        return;
      }
    }

    try {
      const result = await createAccountAction(newAccount);
      if (result.success) {
        toast.success("Cuenta creada");
        const updatedResult = await getAccountsWithBalancesAction(undefined);
        if (updatedResult.success && updatedResult.data) setAccounts(updatedResult.data);
        setShowAccountForm(false);
        setNewAccount({ name: "", type: "CASH", initialBalance: 0 });
      } else {
        toast.error(result.error || "Error al crear cuenta");
      }
    } catch (error) {
      toast.error("Error al crear cuenta");
      console.error(error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;

    try {
      const result = await deleteAccountAction(accountId);
      if (result.success) {
        toast.success("Cuenta eliminada");
        setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      } else {
        toast.error(result.error || "Error al eliminar cuenta");
      }
    } catch (error) {
      toast.error("Error al eliminar cuenta");
      console.error(error);
    }
  };

  const handleSetupCredentials = async () => {
    if (securityForm.pin !== securityForm.confirmPin) {
      toast.error("Los PINs no coinciden");
      return;
    }
    if (securityForm.pin.length !== 4 || !/^\d{4}$/.test(securityForm.pin)) {
      toast.error("El PIN debe ser de 4 dígitos numéricos");
      return;
    }
    if (securityForm.username.length < 3) {
      toast.error("El usuario debe tener al menos 3 caracteres");
      return;
    }

    setIsSettingUpCredentials(true);
    try {
      const result = await setupCredentialsAction({
        username: securityForm.username,
        pin: securityForm.pin,
        confirmPin: securityForm.confirmPin,
      });
      if (result.success) {
        toast.success(result.message);
        setHasCredentials(true);
        setCurrentUsername(securityForm.username);
        setSecurityForm({ username: "", pin: "", confirmPin: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al configurar credenciales");
      console.error(error);
    } finally {
      setIsSettingUpCredentials(false);
    }
  };

  const handleChangePin = async () => {
    if (changePinForm.newPin !== changePinForm.confirmNewPin) {
      toast.error("Los PINs no coinciden");
      return;
    }
    if (changePinForm.newPin.length !== 4 || !/^\d{4}$/.test(changePinForm.newPin)) {
      toast.error("El PIN debe ser de 4 dígitos numéricos");
      return;
    }

    setIsChangingPin(true);
    try {
      const result = await changePinAction({
        currentPin: changePinForm.currentPin,
        newPin: changePinForm.newPin,
        confirmNewPin: changePinForm.confirmNewPin,
      });
      if (result.success) {
        toast.success(result.message);
        setChangePinForm({ currentPin: "", newPin: "", confirmNewPin: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al cambiar PIN");
      console.error(error);
    } finally {
      setIsChangingPin(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu perfil, cuentas, categorías y seguridad
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>
                Tu información personal y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={session?.user?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input value={session?.user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Moneda por defecto</Label>
                <Select defaultValue="RD$">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RD$">RD$ - Peso Dominicano</SelectItem>
                    <SelectItem value="USD">USD - Dólar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Mis Cuentas</h2>
            <Button onClick={() => setShowAccountForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cuenta
            </Button>
          </div>

          {showAccountForm && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de la cuenta</Label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ej: Banco Popular"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de cuenta</Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        type: value as "CASH" | "BANK" | "CREDIT_CARD",
                        // Reset credit card fields when type changes
                        creditLimit: value === "CREDIT_CARD" ? prev.creditLimit : undefined,
                        cutoffDay: value === "CREDIT_CARD" ? prev.cutoffDay : undefined,
                        paymentDueDay: value === "CREDIT_CARD" ? prev.paymentDueDay : undefined,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Efectivo</SelectItem>
                      <SelectItem value="BANK">Banco</SelectItem>
                      <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Balance inicial</Label>
                  <Input
                    type="number"
                    value={newAccount.initialBalance}
                    onChange={(e) =>
                      setNewAccount((prev) => ({
                        ...prev,
                        initialBalance: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>

                {/* Credit Card specific fields */}
                {newAccount.type === "CREDIT_CARD" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-4">
                        Información de Tarjeta de Crédito
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <Label>Límite de crédito *</Label>
                      <Input
                        type="number"
                        value={newAccount.creditLimit || ""}
                        onChange={(e) =>
                          setNewAccount((prev) => ({
                            ...prev,
                            creditLimit: parseFloat(e.target.value) || undefined,
                          }))
                        }
                        placeholder="50000.00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Día de corte</Label>
                        <Select
                          value={newAccount.cutoffDay?.toString() || ""}
                          onValueChange={(value) =>
                            setNewAccount((prev) => ({
                              ...prev,
                              cutoffDay: value ? parseInt(value) : undefined,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Día de pago</Label>
                        <Select
                          value={newAccount.paymentDueDay?.toString() || ""}
                          onValueChange={(value) =>
                            setNewAccount((prev) => ({
                              ...prev,
                              paymentDueDay: value ? parseInt(value) : undefined,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAccountForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAccount}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {accounts.map((account) => {
              const Icon = accountTypeIcons[account.type];
              return (
                <Card key={account.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: account.color
                            ? `${account.color}20`
                            : "#6366f120",
                        }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: account.color || "#6366f1" }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {accountTypeLabels[account.type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-semibold ${
                          account.currentBalance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatMoney(account.currentBalance)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Categorías</h2>
          </div>

          <div className="space-y-6">
            {/* Expense Categories */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Gastos
              </h3>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.type === "EXPENSE")
                  .map((category) => (
                    <Card key={category.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: category.color || "#6366f1",
                            }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        {category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 ml-5">
                            {category.subcategories.map((sub) => (
                              <Badge key={sub.id} variant="secondary">
                                {sub.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Ingresos
              </h3>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.type === "INCOME")
                  .map((category) => (
                    <Card key={category.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: category.color || "#22c55e",
                            }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        {category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 ml-5">
                            {category.subcategories.map((sub) => (
                              <Badge key={sub.id} variant="secondary">
                                {sub.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Acceso Rápido con PIN
              </CardTitle>
              <CardDescription>
                Configura un usuario y PIN de 4 dígitos para acceder rápidamente sin correo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasCredentials ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">
                        Acceso rápido configurado
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Usuario: <span className="font-mono">{currentUsername}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Cambiar PIN</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>PIN actual</Label>
                        <Input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={changePinForm.currentPin}
                          onChange={(e) =>
                            setChangePinForm((prev) => ({
                              ...prev,
                              currentPin: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="****"
                          className="tracking-widest text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nuevo PIN</Label>
                        <Input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={changePinForm.newPin}
                          onChange={(e) =>
                            setChangePinForm((prev) => ({
                              ...prev,
                              newPin: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="****"
                          className="tracking-widest text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar nuevo PIN</Label>
                        <Input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={changePinForm.confirmNewPin}
                          onChange={(e) =>
                            setChangePinForm((prev) => ({
                              ...prev,
                              confirmNewPin: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="****"
                          className="tracking-widest text-center"
                        />
                      </div>
                      <Button
                        onClick={handleChangePin}
                        disabled={isChangingPin || changePinForm.newPin.length !== 4}
                      >
                        {isChangingPin && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Cambiar PIN
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de usuario</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={securityForm.username}
                        onChange={(e) =>
                          setSecurityForm((prev) => ({
                            ...prev,
                            username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                          }))
                        }
                        placeholder="tu_usuario"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Solo letras minúsculas, números y guion bajo
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>PIN (4 dígitos)</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={securityForm.pin}
                      onChange={(e) =>
                        setSecurityForm((prev) => ({
                          ...prev,
                          pin: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="****"
                      className="tracking-widest text-center text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar PIN</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={securityForm.confirmPin}
                      onChange={(e) =>
                        setSecurityForm((prev) => ({
                          ...prev,
                          confirmPin: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="****"
                      className="tracking-widest text-center text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleSetupCredentials}
                    disabled={
                      isSettingUpCredentials ||
                      securityForm.pin.length !== 4 ||
                      securityForm.username.length < 3
                    }
                    className="w-full"
                  >
                    {isSettingUpCredentials && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Configurar Acceso Rápido
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
