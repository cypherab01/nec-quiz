import { AuthCard } from "@/components/auth/auth-card";

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <AuthCard mode="signup" />
    </div>
  );
}
