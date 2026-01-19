import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionsContent } from "./transactions-content";

export default async function TransactionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <TransactionsContent />;
}
