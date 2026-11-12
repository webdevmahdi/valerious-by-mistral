import type { Product } from '../../types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products, columns = 4 }: { products: Product[]; columns?: 3 | 4 }) {
  return (
    <div className={`grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-7 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {products.map((p) => (
        <div key={p.id} className="reveal">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}
