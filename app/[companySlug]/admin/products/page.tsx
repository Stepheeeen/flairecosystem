"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Trash2, Edit, X } from "lucide-react"
import axios from "axios"

interface Product {
  id: string
  _id: string
  name: string
  price: number
  category: string
  description: string
  image: string
  images: string[]
  sizes: string[]
  colors: string[]
  stockCount: number
  discountCode?: string
  discountPercent?: number
}

const emptyForm = {
  name: "",
  price: "",
  category: "women",
  description: "",
  image: "",
  images: "",
  sizes: "",
  colors: "",
  stockCount: "0",
  discountCode: "",
  discountPercent: "",
}

export default function AdminProductsPage() {
  const params = useParams()
  const companySlug = params.companySlug as string
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products")
      setProducts(response.data)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price) return

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.image,
      images: formData.images ? formData.images.split(",").map((s) => s.trim()) : [],
      sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()) : [],
      colors: formData.colors ? formData.colors.split(",").map((s) => s.trim()) : [],
      stockCount: Number(formData.stockCount),
      discountCode: formData.discountCode || undefined,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
    }

    try {
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, payload)
      } else {
        await axios.post("/api/products", payload)
      }
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error("Failed to save product:", error)
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description || "",
      image: product.image || "",
      images: product.images?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      stockCount: product.stockCount?.toString() || "0",
      discountCode: product.discountCode || "",
      discountPercent: product.discountPercent?.toString() || "",
    })
    setEditingId(product._id || product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await axios.delete(`/api/products/${id}`)
      fetchProducts()
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link
              href={`/${companySlug}/admin`}
              className="flex items-center gap-2 text-sm hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-light tracking-widest">PRODUCTS</h1>
            <Button onClick={() => { showForm ? resetForm() : setShowForm(true) }}>
              {showForm ? "Cancel" : "+ Add Product"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Add/Edit Product Form */}
        {showForm && (
          <div className="border border-border p-8 mb-12 bg-muted">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={resetForm}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-background border-border"
                required
              />

              <Input
                type="number"
                name="price"
                placeholder="Price (₦)"
                value={formData.price}
                onChange={handleInputChange}
                className="bg-background border-border"
                required
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="accessories">Accessories</option>
              </select>

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none min-h-[80px]"
              />

              <Input
                type="text"
                name="image"
                placeholder="Image URL"
                value={formData.image}
                onChange={handleInputChange}
                className="bg-background border-border"
              />

              <Input
                type="text"
                name="sizes"
                placeholder="Sizes (comma separated, e.g. XS, S, M, L)"
                value={formData.sizes}
                onChange={handleInputChange}
                className="bg-background border-border"
              />

              <Input
                type="text"
                name="colors"
                placeholder="Colors (comma separated, e.g. Black, White)"
                value={formData.colors}
                onChange={handleInputChange}
                className="bg-background border-border"
              />

              {/* Advanced Inventory Fields */}
              <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Count</label>
                  <Input
                    type="number"
                    name="stockCount"
                    placeholder="Quantity in Stock"
                    value={formData.stockCount}
                    onChange={handleInputChange}
                    className="bg-background border-border"
                    min="0"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Available inventory. Will decrement automatically upon checkout.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Image Gallery URLs (comma separated)</label>
                  <Input
                    type="text"
                    name="images"
                    placeholder="e.g. https://url1.jpg, https://url2.jpg"
                    value={formData.images}
                    onChange={handleInputChange}
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Discount Code (Optional)</label>
                  <Input
                    type="text"
                    name="discountCode"
                    placeholder="e.g. SUMMER20"
                    value={formData.discountCode}
                    onChange={handleInputChange}
                    className="bg-background border-border uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Percent (%)</label>
                  <Input
                    type="number"
                    name="discountPercent"
                    placeholder="e.g. 20"
                    value={formData.discountPercent}
                    onChange={handleInputChange}
                    className="bg-background border-border"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                    No products found. Add your first product above.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id || product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-sm">
                      ₦{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.stockCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {product.stockCount} in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id || product.id)}
                        className="inline-flex items-center gap-1 text-destructive hover:underline text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
