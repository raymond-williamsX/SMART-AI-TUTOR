import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage({
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
      title="Create your tutoring workspace"
      description="Set up a premium study environment for document tutoring, adaptive learning, and AI-generated revision tools."
    >
      <SignupForm redirectTo={redirectTo} initialErrorMessage={initialErrorMessage} />
    </AuthShell>
  );
}
