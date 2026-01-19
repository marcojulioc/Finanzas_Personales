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
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import {
  getAccountsWithBalancesAction,
  createAccountAction,
  deleteAccountAction,
} from "@/server/actions/account.actions";
import { getCategoriesAction } from "@/server/actions/category.actions";
import type { FinanceAccount, Category } from "@prisma/client";

interface AccountWithBalance extends FinanceAccount {
  currentBalance: number;
}

interface CategoryWithSubs extends Category {
  subcategories: Category[];
}

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
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "CASH" as const,
    initialBalance: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [accountsData, categoriesData] = await Promise.all([
          getAccountsWithBalancesAction(),
          getCategoriesAction(),
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
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

    try {
      await createAccountAction(newAccount);
      toast.success("Cuenta creada");
      const updatedAccounts = await getAccountsWithBalancesAction();
      setAccounts(updatedAccounts);
      setShowAccountForm(false);
      setNewAccount({ name: "", type: "CASH", initialBalance: 0 });
    } catch (error) {
      toast.error("Error al crear cuenta");
      console.error(error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;

    try {
      await deleteAccountAction(accountId);
      toast.success("Cuenta eliminada");
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch (error) {
      toast.error("Error al eliminar cuenta");
      console.error(error);
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
          Administra tu perfil, cuentas y categorías
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
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
