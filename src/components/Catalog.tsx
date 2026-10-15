import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, ShoppingCart, AlertTriangle, XCircle, SlidersHorizontal, Check } from 'lucide-react';
import type { Category, Product } from '../types';
import { useCartStore } from '../stores/useCartStore';

interface CatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  onShowToast: (message: string) => void;
  initialSort?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  initialSearch?: string;
}

export const Catalog: React.FC<CatalogProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onShowToast,
  initialSort = 'featured',
  initialSearch = '',
}) => {
  const { addItem } = useCartStore();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>(initialSort);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // 300ms debounce for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          !selectedCategory ||
          selectedCategory === 'all' ||
          p.categorySlug === selectedCategory ||
          p.categoryName?.toLowerCase() === selectedCategory.toLowerCase();

        const query = debouncedSearch.trim().toLowerCase();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default featured: featured first, then name
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [products, selectedCategory, debouncedSearch, sortBy]);

  const handleAddToCart = async (product: Product) => {
    if (product.stockQuantity <= 0) return;
    await addItem(product, 1);
    setRecentlyAddedId(product.id);
    onShowToast(`Added "${product.name}" to cart`);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1500);
  };

  return (
    <section id="shop" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 block mb-2">
            Catalog & Inventory Studio
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Engineered Hardware Collection
          </h2>
        </div>

        {/* Controls: Search and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <input
              type="text"
              aria-label="Search catalog"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2 pl-9 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
            <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')}
              aria-label="Sort products"
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-zinc-900 text-white">Featured First</option>
              <option value="price-asc" className="bg-zinc-900 text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-zinc-900 text-white">Price: High to Low</option>
              <option value="rating" className="bg-zinc-900 text-white">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-6 no-scrollbar" role="tablist" aria-label="Category filter">
        <button
          role="tab"
          aria-selected={selectedCategory === 'all' || !selectedCategory}
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            selectedCategory === 'all' || !selectedCategory
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/20'
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const count = products.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-white/5 bg-zinc-900/40">
          <p className="text-base text-zinc-400 mb-2">No matching products found.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
            const isSoldOut = product.stockQuantity === 0;

            return (
              <div
                key={product.id}
                data-testid="product-card"
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                {/* Media Container (Aspect Locked) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-950 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Badges Stack */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {product.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30 backdrop-blur-md">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Featured
                      </span>
                    )}
                    {isLowStock && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30 backdrop-blur-md">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock ({product.stockQuantity})
                      </span>
                    )}
                    {isSoldOut && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/30 backdrop-blur-md">
                        <XCircle className="h-3 w-3" />
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300 backdrop-blur-md border border-white/5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                    {product.categoryName || 'General'}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed flex-1">
                    {product.description}
                  </p>

                  {/* Footer: Price & Add to Cart button */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 mt-auto">
                    <div>
                      <span className="text-xs text-zinc-400 block leading-tight">Price</span>
                      <span className="text-lg font-bold font-mono text-white tabular-nums">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isSoldOut}
                      aria-label={isSoldOut ? `Out of Stock - ${product.name}` : recentlyAddedId === product.id ? `Added ${product.name}` : `Add to Cart - ${product.name}`}
                      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all min-h-[44px] ${
                        isSoldOut
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                          : recentlyAddedId === product.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-95 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {recentlyAddedId === product.id ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Added</span>
                        </>
                      ) : isSoldOut ? (
                        <span>Out of Stock</span>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
