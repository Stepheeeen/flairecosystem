"use client"

import { useEffect, useState, use } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Preloader } from "@/components/preloader"
import { 
  BookOpen, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  User, 
  LayoutDashboard, 
  Settings, 
  PlusCircle, 
  Search,
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { getStoreUrl } from "@/lib/utils"

interface SectionProps {
  title: string
  icon: any
  children: React.ReactNode
}

const Section = ({ title, icon: Icon, children }: SectionProps) => (
  <div className="border border-border p-8 space-y-4">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-secondary/50 rounded-sm">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-light tracking-widest uppercase">{title}</h2>
    </div>
    <div className="space-y-4 text-muted-foreground font-light leading-relaxed">
      {children}
    </div>
  </div>
)

function HelpContent({ companySlug }: { companySlug: string }) {
  const [company, setCompany] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const compRes = await axios.get(`/api/companies/${companySlug}`)
        setCompany(compRes.data)
      } catch (error) {
        console.error("Failed to load store info:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompany()
  }, [companySlug])

  if (isLoading) return <Preloader text="LOADING" />

  const brandName = company?.name || "STOREFRONT"
  const primaryColor = company?.theme?.primaryColor || null

  return (
    <div style={primaryColor ? { '--theme-primary': primaryColor, '--primary': primaryColor } as React.CSSProperties : {}}>
      <Navbar companySlug={companySlug} companyName={company?.name} companyLogo={company?.logo} />
      
      <main className="min-h-screen bg-background pb-20">
        {/* Header */}
        <section className="bg-secondary/30 py-20 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-widest uppercase">Manual & Support</h1>
            <p className="text-muted-foreground text-lg font-light tracking-wide max-w-2xl mx-auto">
              Everything you need to know about navigating and managing your {brandName} experience.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* User Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-border flex-grow" />
                <h3 className="text-xs font-medium tracking-[0.3em] uppercase opacity-50">User Guide</h3>
                <div className="h-px bg-border flex-grow" />
              </div>

              <Section title="Browsing Products" icon={Search}>
                <p>Explore our curated collections by navigating to the <strong>Shop</strong> page. Use the category filters (Women, Men, Accessories) to narrow down your search.</p>
                <p>Click on any product image to view detailed descriptions, available sizes, and additional images.</p>
              </Section>

              <Section title="Shopping & Checkout" icon={ShoppingCart}>
                <p>Once you find an item you love, select your size and click <strong>Add to Cart</strong>. Your selections are saved locally so you can continue browsing.</p>
                <p>When ready, click the bag icon in the navigation bar to review your items and proceed to <strong>Checkout</strong>.</p>
              </Section>

              <Section title="Payments" icon={CreditCard}>
                <p>We use <strong>Paystack</strong> for secure payment processing. You can pay using your debit/credit card or bank transfer.</p>
                <p>All transactions are encrypted and processed through industry-standard security protocols to ensure your data is safe.</p>
              </Section>

              <Section title="Account & Orders" icon={User}>
                <p>Sign in to your account to view your order history and track current shipments. Once a payment is confirmed, your order status will be updated automatically.</p>
                <p>You can find your account settings and order details in the <strong>Account</strong> section of the main menu.</p>
              </Section>
            </div>

            {/* Admin Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-border flex-grow" />
                <h3 className="text-xs font-medium tracking-[0.3em] uppercase opacity-50">Administrator Guide</h3>
                <div className="h-px bg-border flex-grow" />
              </div>

              <Section title="Admin Dashboard" icon={LayoutDashboard}>
                <p>Access your store's backend by navigating to <code>/{companySlug}/admin</code>. Here you'll find real-time statistics on sales, orders, and customer activity.</p>
                <p>The dashboard provides a 30-day revenue chart to help you track your store's performance at a glance.</p>
              </Section>

              <Section title="Product Management" icon={PlusCircle}>
                <p>Manage your catalog in the <strong>Products</strong> section. You can add new items, update existing product details (pricing, images, stock), or remove products from the store.</p>
                <p>Ensure your images are high-quality to maintain the premium aesthetic of your storefront.</p>
              </Section>

              <Section title="Order Processing" icon={Package}>
                <p>View and manage customer purchases in the <strong>Orders</strong> section. Each order includes customer contact details, shipping address, and payment status.</p>
                <p>Update order statuses as they move from processing to shipped to keep your customers informed.</p>
              </Section>

              <Section title="Store Configuration" icon={Settings}>
                <p>In the <strong>Store Settings</strong>, you can update your brand name, SEO descriptions, and customize the primary colors of your storefront to match your brand identity.</p>
                <p>This is also where you can manage custom domains and subdomains for your store.</p>
              </Section>
            </div>

          </div>

          {/* Footer Support Call to Action */}
          <div className="mt-20 border border-border p-12 text-center bg-secondary/10">
            <HelpCircle className="h-12 w-12 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-light tracking-widest uppercase mb-4">Still need help?</h3>
            <p className="text-muted-foreground font-light max-w-xl mx-auto mb-8">
              Our support team is available to assist you with any technical issues or inquiries regarding your store management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" className="px-8 tracking-widest uppercase text-xs" asChild>
                <Link href={`/${companySlug}`}>Return to Store</Link>
              </Button>
              <Button className="px-8 tracking-widest uppercase text-xs">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Reusable mini-footer */}
      <footer className="py-8 border-t border-border px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-widest uppercase opacity-60">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href={getStoreUrl(companySlug, "/")} className="hover:text-primary">Home</Link>
            <Link href={getStoreUrl(companySlug, "/products")} className="hover:text-primary">Products</Link>
            <Link href={getStoreUrl(companySlug, "/help")} className="hover:text-primary">Manual</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function ManualPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const unwrappedParams = use(params)
  return <HelpContent companySlug={unwrappedParams.companySlug} />
}
