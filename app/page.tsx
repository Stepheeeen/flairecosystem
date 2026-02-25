import { redirect } from "next/navigation"

export default function Home() {
  // Since there is no longer a global platform landing page, 
  // root traffic is automatically routed to the Admin Dashboard login portal.
  redirect("/auth/signin")
}
