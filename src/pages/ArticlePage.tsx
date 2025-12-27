import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Download, Share2, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/blog/ArticleCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { cn, getFullUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [article, setArticle] = useState<any | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/articles/slug/${encodeURIComponent(slug)}`);
        if (!res.ok) return setArticle(null);
        const data = await res.json();
        setArticle(data);
        // load related articles
        const allRes = await fetch(`${BASE}/api/articles`);
        if (allRes.ok) {
          const all = await allRes.json();
          const related = all.filter((a:any) => a.category === data.category && a._id !== data._id).slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (err) {
        setArticle(null);
      }
    })();
  }, [slug]);

  const category = article ? CATEGORIES.find((c) => c.id === article.category) : null;

  const handleDownload = () => {
    if (article && article.pdfUrl) {
      const url = getFullUrl(article.pdfUrl);
      // open PDF in new tab for download/view
      window.open(url, '_blank');
      return;
    }
    toast({
      title: "No PDF",
      description: "No PDF available for this article.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied', description: 'Article link has been copied to clipboard.' });
      } catch (e) {
        toast({ title: 'Copy Failed', description: 'Could not copy link to clipboard.' });
      }
      // Open Twitter share as fallback to allow quick sharing
      try {
        const text = encodeURIComponent(article?.title || '');
        const url = encodeURIComponent(window.location.href);
        const twitter = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(twitter, '_blank', 'noopener');
      } catch (e) {
        // ignore
      }
    }
  };

  if (!article || !category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been removed.
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

  // Mock rich content for demo
  const articleContent = `
    <p class="lead">Starting your day with a healthy breakfast sets the tone for the entire day. A nutritious morning meal provides the energy and nutrients your body needs to function at its best.</p>

    <h2>Why Breakfast Matters</h2>
    <p>After a night of fasting, your body needs fuel to kickstart your metabolism and provide energy for the day ahead. Studies have shown that people who eat a healthy breakfast tend to have better concentration, improved memory, and more stable energy levels throughout the day.</p>

    <h2>Quick & Nutritious Ideas</h2>
    <p>Here are some breakfast ideas that take less than 15 minutes to prepare:</p>
    <ul>
      <li><strong>Overnight Oats:</strong> Prepare the night before with oats, milk, chia seeds, and your favorite toppings.</li>
      <li><strong>Smoothie Bowls:</strong> Blend frozen fruits with yogurt and top with granola and fresh berries.</li>
      <li><strong>Avocado Toast:</strong> Whole grain bread topped with mashed avocado, eggs, and a sprinkle of seeds.</li>
      <li><strong>Greek Yogurt Parfait:</strong> Layer yogurt with honey, nuts, and seasonal fruits.</li>
      <li><strong>Veggie Scramble:</strong> Quick scrambled eggs with spinach, tomatoes, and cheese.</li>
    </ul>

    <h2>Tips for Success</h2>
    <p>To make healthy breakfasts a habit:</p>
    <ol>
      <li>Prep ingredients the night before</li>
      <li>Keep healthy staples stocked in your kitchen</li>
      <li>Start with simple recipes and gradually expand</li>
      <li>Listen to your body's hunger cues</li>
    </ol>

    <blockquote>
      <p>"Eat breakfast like a king, lunch like a prince, and dinner like a pauper."</p>
      <cite>— Adelle Davis</cite>
    </blockquote>

    <h2>Conclusion</h2>
    <p>A healthy breakfast doesn't have to be complicated or time-consuming. With a little planning and the right ingredients, you can enjoy nutritious morning meals that fuel your body and mind for whatever the day brings.</p>
  `;

  return (
    <Layout>
      {/* Article Header */}
      <article>
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
          <img
            src={getFullUrl(article?.coverImage)}
            alt={article?.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0">
            <div className="container pb-8 md:pb-12">
              <Link
                to={`/category/${category.slug}`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4",
                  category.colorClass,
                  "bg-category text-primary-foreground hover:opacity-90 transition-opacity"
                )}
              >
                {category.icon} {category.name}
              </Link>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold max-w-4xl">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Article Meta & Content */}
        <div className="container py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-border">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" onClick={handleDownload} className="gradient-hero text-primary-foreground">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none 
                prose-headings:font-display prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary
                prose-blockquote:border-l-primary prose-blockquote:bg-secondary/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-blockquote:text-foreground
                [&_.lead]:text-xl [&_.lead]:text-foreground [&_.lead]:leading-relaxed [&_.lead]:mb-6
              "
              dangerouslySetInnerHTML={{ __html: article.content || articleContent }}
            />

            {/* Download CTA */}
            <div className="mt-12 p-6 md:p-8 rounded-2xl bg-secondary/50 border border-border text-center">
              <h3 className="font-display text-xl font-bold mb-2">
                Want to save this article?
              </h3>
              <p className="text-muted-foreground mb-4">
                Download the PDF version to read offline anytime.
              </p>
              <Button size="lg" onClick={handleDownload} className="gradient-hero text-primary-foreground">
                <Download className="h-5 w-5 mr-2" />
                Download Free PDF
              </Button>
            </div>

            {/* Back Link */}
            <div className="mt-12 pt-8 border-t border-border">
              <Link
                to={`/category/${category.slug}`}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to {category.name}
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relArticle) => (
                <ArticleCard key={relArticle.id} {...relArticle} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ArticlePage;
