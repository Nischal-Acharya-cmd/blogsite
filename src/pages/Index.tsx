import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/blog/HeroSection";
import CategoryCard from "@/components/blog/CategoryCard";
import ArticleCard from "@/components/blog/ArticleCard";
import { CATEGORIES } from "@/lib/constants";
import { useEffect, useState } from "react";

const Index = () => {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    fetch(`${BASE}/api/articles`).then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) {
        // ensure articles sorted by createdAt desc on client as well
        d.sort((a:any,b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setArticles(d);
      } else {
        setArticles([]);
      }
    }).catch(() => setArticles([]));
  }, []);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const latestArticles = articles.length > 1 ? articles.slice(1, 7) : [];

  // Count articles per category
  const getCategoryCount = (categoryId: string) => articles.filter((a) => a.category === categoryId).length;

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Explore Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive into topics that matter to you. Each category is filled with expert insights and practical advice.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                articleCount={getCategoryCount(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 md:py-20">
          <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Featured Article
            </h2>
          </div>
          {featuredArticle ? (
            <ArticleCard {...featuredArticle} variant="featured" />
          ) : (
            <div className="text-muted-foreground">No articles yet.</div>
          )}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Latest Articles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article._id || article.id} {...article} />
            ))}
          </div>
        </div>
      </section>

      
    </Layout>
  );
};

export default Index;
