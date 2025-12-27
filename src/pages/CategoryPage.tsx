import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/blog/ArticleCard";
import { CATEGORIES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    fetch(`${BASE}/api/articles`).then((r) => r.json()).then((d) => {
      setArticles(d.filter((a:any) => a.category === slug));
    }).catch(() => setArticles([]));
  }, [slug]);

  if (!category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Category Header */}
      <section className={cn("relative py-16 md:py-24 overflow-hidden", category.colorClass)}>
        <div className="absolute inset-0 bg-category opacity-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-category opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-category opacity-10 rounded-full blur-3xl" />

        <div className="container relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-category text-4xl shadow-category">
              {category.icon}
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {articles.length} article{articles.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mt-4">
            {category.description}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h2 className="text-2xl font-bold mb-2">No articles yet</h2>
              <p className="text-muted-foreground">
                We're working on creating amazing content for this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-6">
            Explore Other Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.filter((c) => c.slug !== slug).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card",
                  "hover:border-category hover:shadow-md transition-all duration-200",
                  cat.colorClass
                )}
              >
                <span>{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
