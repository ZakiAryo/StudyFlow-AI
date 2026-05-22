import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-soft">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">StudyFlow AI</p>
          <h1 className="mt-2 text-2xl font-semibold">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masuk untuk mengelola tugas dan jadwal kuliah.</p>
        </div>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
