"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, ShieldCheck, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30 selection:text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Flair Eco System"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-medium tracking-tight">Flair Eco System</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Button asChild variant="default" size="sm" className="rounded-full px-6">
              <Link href="/super-admin">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
          {/* <div className="absolute inset-0 -z-10">
            <Image
              src="/hero-management.png"
              alt="Management Hero"
              fill
              className="object-cover opacity-20 transition-opacity duration-1000 group-hover:opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
          </div> */}

          <div className="container relative mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="animate-slide-up-fade text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl mb-8 leading-[1.1]">
                Master Your Fashion <br />
                <span className="text-accent italic font-serif">Empire</span> in One Place
              </h1>
              <p className="mx-auto max-w-2xl animate-slide-up-fade [animation-delay:200ms] text-lg text-muted-foreground sm:text-xl mb-12 leading-relaxed">
                The ultimate multi-tenant platform for luxury fashion retail. Manage subaccounts, monitor revenue splits, and scale your ecosystem with ease.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-fade [animation-delay:400ms]">
                <Button asChild size="lg" className="h-14 rounded-full px-10 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Link href="/super-admin">
                    Enter Management Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 rounded-full px-10 text-base transition-all">
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Globe className="h-8 w-8" />,
                  title: "Multi-Tenancy",
                  description: "Manage multiple fashion brands under a single unified ecosystem."
                },
                {
                  icon: <ShieldCheck className="h-8 w-8" />,
                  title: "Admin Control",
                  description: "Robust role-based access control for managing platform integrity."
                },
                {
                  icon: <BarChart3 className="h-8 w-8" />,
                  title: "Revenue Tracking",
                  description: "Automated commission splits and real-time financial reporting."
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Vendor Management",
                  description: "Onboard and monitor merchants with dedicated subaccounts."
                }
              ].map((feature, i) => (
                <Card key={i} className="group border-none bg-background/50 backdrop-blur-lg transition-all hover:bg-background hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="about" className="py-24 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold tracking-tight mb-6 sm:text-4xl">
                  Built for the next generation of luxury retail
                </h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Flair Eco System provides the infrastructure needed to manage complex fashion logistics, from subaccount billing to inventory federation across multiple storefronts.
                  </p>
                  <p>
                    Our platform ensures that as your ecosystem grows, your management overhead stays lean through intelligent automation and unified dashboards.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                {[
                  { label: "Uptime", value: "99.9%" },
                  { label: "Vendors", value: "500+" },
                  { label: "Daily Orders", value: "10k+" },
                  { label: "Revenue Split", value: "3.0%" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Flair Eco System"
              width={24}
              height={24}
              className="h-6 w-auto object-contain brightness-0 invert"
            />
            <span className="text-sm font-semibold tracking-tight">Flair Eco System Management</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Flair Eco System. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>

      {/* Styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up-fade {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-slide-up-fade {
          opacity: 0;
          animation: slide-up-fade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  )
}
