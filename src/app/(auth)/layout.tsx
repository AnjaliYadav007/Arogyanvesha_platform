// import { redirect } from "next/navigation";
// import { getServerSession } from "next-auth";
// import { AppShell } from "@/components/layout/AppShell";

// export default async function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await getServerSession();

//   // No session — redirect to login
//   if (!session) {
//     redirect("/login");
//   }

//   return <AppShell>{children}</AppShell>;
// }

import { AppShell } from "@/components/layout/AppShell";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession();
  // if (!session) redirect("/login");

  return <AppShell>{children}</AppShell>;
}