import { isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm />;
}
