import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BudgetsContent } from "./budgets-content";

export default async function BudgetsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <BudgetsContent />;
}
