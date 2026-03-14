import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Healthcare Workforce Marketplace</h1>
      <p className="text-base text-slate-700">
        MVP scaffold is initialized. Use authentication to enter role-based dashboards.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/login">
          Login
        </Link>
        <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900" href="/register">
          Register
        </Link>
      </div>
    </main>
  );
}
