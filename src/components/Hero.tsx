import React from 'react';
import { ArrowRight, Sparkles, Headphones, Laptop, Watch } from 'lucide-react';
import type { Category } from '../types';

interface HeroProps {
  onExplore: () => void;
  onSelectCategory: (categorySlug: string) => void;
  categories: Category[];
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onSelectCategory, categories }) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'audio':
        return <Headphones className="h-5 w-5 text-emerald-400" />;
      case 'workspace':
        return <Laptop className="h-5 w-5 text-emerald-400" />;
      case 'wearables':
        return <Watch className="h-5 w-5 text-emerald-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-white/5">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Precision Engineering & Minimalist Design</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Curated Hardware for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Modern Creator</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Enterprise-grade e-commerce architecture engineered for AlphaCI validation. Discover reference acoustics, machined mechanical peripherals, and biometric wearables.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExplore}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#shop"
              onClick={(e) => {
                e.preventDefault();
                onExplore();
              }}
              className="rounded-lg border border-white/10 bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-zinc-800"
            >
              View All Products
            </a>
          </div>
        </div>

        {/* Bento Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 backdrop-blur-md flex flex-col justify-between min-h-[200px]"
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                  {getCategoryIcon(cat.slug)}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Browse Series &rarr;
                </span>
                <span className="text-[10px] uppercase font-mono text-zinc-400">
                  {cat.slug}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
