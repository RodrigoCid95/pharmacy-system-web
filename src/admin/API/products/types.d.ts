export type Product = {
  id?: string
  name: string
  description: string
  sku: string
  thumbnail: string
  price: number
  stock: number
}
export type ProductsAPI = {
  create: (product: Product) => Promise<void>
  read: () => Promise<Product[]>
  update: (product: Product) => Promise<void>
  delete: (product: Product) => Promise<void>
  selectImage: (callback: (data: string) => void) => void
  updateThumbnail: (product: Product, newThumbnail: string) => Promise<string>
}