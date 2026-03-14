import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a healthcare workforce marketplace account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
