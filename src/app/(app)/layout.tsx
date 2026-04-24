import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "next-auth/react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const name = session.user.name || session.user.email || "User";

  return (
    <SessionProvider session={session}>
      <div className="md:flex min-h-screen">
        <Sidebar userName={name} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </SessionProvider>
  );
}
