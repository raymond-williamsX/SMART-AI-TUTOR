import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage({
  searchParams,
}: Readonly<{
  searchParams?: {
    redirectTo?: string;
    error?: string;
  };
}>) {
  const redirectTo = searchParams?.redirectTo ?? "/dashboard";
  const initialErrorMessage = searchParams?.error;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue your tutoring workspace, review lessons, and prepare for future AI study sessions."
    >
      <LoginForm redirectTo={redirectTo} initialErrorMessage={initialErrorMessage} />
    </AuthShell>
  );
}
