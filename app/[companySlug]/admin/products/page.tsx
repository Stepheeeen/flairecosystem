"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Trash2, Edit, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

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
    setMainImageFile(null)
    setGalleryFiles([])
    setIsUploading(false)
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || (!formData.image && !mainImageFile)) return

    setIsUploading(true)

    const uploadToCloudinary = async (file: File) => {
      const data = new FormData()
      data.append("file", file)
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "vellion_products")
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        data
      )
      return res.data.secure_url
    }

    try {
      let uploadedMainImage = formData.image
      if (mainImageFile) {
        uploadedMainImage = await uploadToCloudinary(mainImageFile)
      }

      let finalGalleryImages = formData.images ? formData.images.split(",").map((s) => s.trim()).filter(Boolean) : []
      if (galleryFiles.length > 0) {
        const uploadedGallery = await Promise.all(galleryFiles.map(file => uploadToCloudinary(file)))
        finalGalleryImages = [...finalGalleryImages, ...uploadedGallery]
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        image: uploadedMainImage,
        images: finalGalleryImages,
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(",").map((s) => s.trim()) : [],
        stockCount: Number(formData.stockCount),
        discountCode: formData.discountCode || undefined,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
      }

      if (editingId) {
        await axios.put(`/api/products/${editingId}`, payload)
      } else {
        await axios.post("/api/products", payload)
      }
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error("Failed to save product:", error)
    } finally {
      setIsUploading(false)
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

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    else setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Products" backLink={`/${companySlug}/admin`} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-end mb-6">
          <Button onClick={() => { showForm ? resetForm() : setShowForm(true) }}>
            {showForm ? "Cancel" : "+ Add Product"}
          </Button>
        </div>
        {/* Add/Edit Product Form Slider */}
        <Sheet open={showForm} onOpenChange={handleOpenChange}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto px-4 pb-4">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-light">
                {editingId ? "Edit Product" : "Add New Product"}
              </SheetTitle>
            </SheetHeader>
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

              <div>
                <label className="block text-sm font-medium mb-1">Main Product Image <span className="text-muted-foreground font-normal">(Required)</span></label>
                {(formData.image || mainImageFile) ? (
                  <div className="relative inline-block mt-2">
                    <img src={mainImageFile ? URL.createObjectURL(mainImageFile) : formData.image} alt="Main" className="h-32 w-32 object-cover border border-border rounded-sm" />
                    <button
                      type="button"
                      onClick={() => {
                        setMainImageFile(null)
                        setFormData({ ...formData, image: "" })
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-border rounded-sm flex items-center justify-center flex-col text-muted-foreground hover:bg-secondary/50 hover:border-primary transition-colors hover:text-primary cursor-pointer">
                    <span className="text-sm font-medium">Click to select Main Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setMainImageFile(e.target.files[0])
                      }
                    }} />
                  </label>
                )}
              </div>

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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Additional Image Gallery <span className="text-muted-foreground font-normal">(Optional)</span></label>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* Cloud URLs */}
                    {formData.images.split(",").filter(Boolean).map((imgUrl, idx) => (
                      <div key={`cloud-${idx}`} className="relative inline-block">
                        <img src={imgUrl.trim()} alt={`Gallery ${idx}`} className="h-24 w-24 object-cover border border-border rounded-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            const arr = formData.images.split(",").map(s => s.trim()).filter(Boolean)
                            arr.splice(idx, 1)
                            setFormData({ ...formData, images: arr.join(", ") })
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Local Files Preview */}
                    {galleryFiles.map((file, idx) => (
                      <div key={`local-${idx}`} className="relative inline-block">
                        <img src={URL.createObjectURL(file)} alt={`New Gallery ${idx}`} className="h-24 w-24 object-cover border border-border rounded-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = [...galleryFiles]
                            newFiles.splice(idx, 1)
                            setGalleryFiles(newFiles)
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    <label className="h-24 w-24 border-2 border-dashed border-border rounded-sm flex items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:border-primary transition-colors hover:text-primary cursor-pointer">
                      <span className="text-2xl font-light">+</span>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                        if (e.target.files) {
                          setGalleryFiles(prev => [...prev, ...Array.from(e.target.files as FileList)])
                        }
                      }} />
                    </label>
                  </div>
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

              <Button type="submit" className="w-full mt-8" disabled={isUploading}>
                {isUploading ? "Uploading & Saving..." : (editingId ? "Update Product" : "Add Product")}
              </Button>
            </form>
          </SheetContent>
        </Sheet>

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
