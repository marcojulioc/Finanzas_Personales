import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportContent } from "./import-content";

export default async function ImportPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <ImportContent />;
}
