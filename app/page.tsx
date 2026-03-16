import Link from "next/link";
import { Calendar, ClipboardList, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Shift Management",
    description: "Post, browse, and apply to shifts with real-time availability tracking.",
  },
  {
    icon: ClipboardList,
    title: "Smart Assignments",
    description: "Match qualified workers to shifts with streamlined assignment workflows.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Communicate instantly between facilities and healthcare professionals.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center lg:py-32">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">CH</span>
        </div>
        <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight lg:text-5xl">
          Healthcare Workforce Marketplace
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Connect healthcare facilities with qualified professionals. Manage shifts, assignments, and communication in one place.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-center text-muted-foreground">
            A complete platform for healthcare staffing
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex flex-col items-center pt-6 text-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          Clipboard Health Marketplace
        </div>
      </footer>
    </main>
  );
}
