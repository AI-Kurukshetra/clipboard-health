import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-4 lg:px-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10">
            <span className="text-lg font-bold text-primary-foreground">CH</span>
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">Clipboard Health</h2>
          <p className="max-w-sm text-center text-sm text-primary-foreground/70">
            The modern healthcare workforce marketplace. Connect facilities with qualified professionals seamlessly.
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </main>
  );
}
