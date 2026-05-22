import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-soft">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">StudyFlow AI</p>
          <h1 className="mt-2 text-2xl font-semibold">Register</h1>
          <p className="mt-2 text-sm text-muted-foreground">Buat akun baru untuk mulai merapikan alur belajar.</p>
        </div>
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
