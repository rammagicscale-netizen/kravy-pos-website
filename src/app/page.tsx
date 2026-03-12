import { redirect } from "next/navigation";
// import { getEffectiveClerkId } from "@/lib/auth-utils"; // TODO: create auth-utils

export default function Home() {
  redirect("/dashboard");
}
