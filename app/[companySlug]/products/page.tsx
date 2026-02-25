"use client"
import { getStoreUrl } from "@/lib/utils"

import { useEffect, useState, Suspense, use } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Search, SlidersHorizontal } from "lucide-react"
import axios from "axios"

interface Product {
  id: string
  _id: string
  name: string
  price: number
  image: string
  category: string
}

interface Company {
  _id: string
  id: string
  name: string
  slug: string
}

function ProductsContent({ companySlug }: { companySlug: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSort, setSelectedSort] = useState<string>("featured")
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const categories = [
    { value: "", label: "All Products" },
    { value: "women", label: "Women" },
    { value: "men", label: "Men" },
    { value: "accessories", label: "Accessories" },
  ]

  // Load company and then products
  useEffect(() => {
    const fetchCompanyAndProducts = async () => {
      try {
        // Fetch company by slug
        const compRes = await axios.get(`/api/companies/${companySlug}`)
        const compData = compRes.data
        setCompany(compData)

        // Then fetch products restricted to this company
        const url = `/api/products?companyId=${compData._id || compData.id}`
        const response = await axios.get(url)
        const data = response.data

        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Failed to load storefront:", error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyAndProducts()
  }, [companySlug])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = products

    const categoryParam = searchParams.get("category")
    const searchParam = searchParams.get("search")

    if (categoryParam) {
      setSelectedCategory(categoryParam)
      filtered = filtered.filter((p) => p.category === categoryParam)
    } else {
      setSelectedCategory("")
    }

    if (searchParam) {
      setSearchQuery(searchParam)
      const lowerQuery = searchParam.toLowerCase()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      )
    } else {
      setSearchQuery("")
    }

    switch (selectedSort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedSort, searchParams])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      <Navbar companySlug={companySlug} companyName={company?.name} />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-light tracking-widest mb-2 uppercase">
              {company?.name || "COLLECTION"}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} items
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 mb-12">

            {/* Sidebar / Filters */}
            <div className="md:w-64 flex-shrink-0 space-y-8 pr-8 md:border-r border-border/50">

              {/* Search Bar */}
              <div>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </form>
              </div>

              {/* Category Filter */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-4 w-4" />
                  <h2 className="text-sm font-medium tracking-widest uppercase">
                    Categories
                  </h2>
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition-all duration-300 ${selectedCategory === cat.value
                          ? "bg-primary text-primary-foreground font-medium translate-x-1"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid Area */}
            <div className="flex-1">
              {/* Active Filters & Sorting Top Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-secondary/20 p-4 rounded-sm border border-border/30">
                <div className="flex flex-wrap items-center gap-2">
                  {searchParams.get("search") && (
                    <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-xs">
                      <span>Search: <strong>"{searchParams.get("search")}"</strong></span>
                      <button onClick={() => {
                        setSearchQuery("");
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('search');
                        router.push(`${pathname}?${params.toString()}`);
                      }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                    </div>
                  )}
                  {searchParams.get("category") && (
                    <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-xs">
                      <span>Category: <strong>{searchParams.get("category")}</strong></span>
                      <button onClick={() => handleCategoryChange("")} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground uppercase tracking-wider text-xs">Sort by</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="text-sm bg-transparent border-b border-border py-1 pr-6 focus:outline-none cursor-pointer appearance-none uppercase tracking-wide"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function ProductsPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const unwrappedParams = use(params)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent companySlug={unwrappedParams.companySlug} />
    </Suspense>
  )
}
