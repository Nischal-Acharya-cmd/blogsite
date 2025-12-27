import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { cn, getFullUrl } from "@/lib/utils";

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  author: string;
  variant?: "default" | "featured" | "horizontal";
}

const ArticleCard = ({
  title,
  slug,
  category,
  excerpt,
  coverImage,
  createdAt,
  author,
  variant = "default",
}: ArticleCardProps) => {
  const categoryData = CATEGORIES.find((c) => c.id === category);

  if (variant === "featured") {
    return (
      <Link
        to={`/article/${slug}`}
        className="group relative overflow-hidden rounded-2xl bg-card border border-border max-w-6xl mx-auto"
      >
        <div className="aspect-[16/9] overflow-hidden max-h-[520px]">
          <img
            src={getFullUrl(coverImage)}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3",
              categoryData?.colorClass,
              "bg-category text-primary-foreground"
            )}
          >
            {categoryData?.icon} {categoryData?.name}
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h2>
          <p className="text-sm text-primary-foreground/80 line-clamp-2 mb-4 max-w-2xl">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-primary-foreground/70">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        to={`/article/${slug}`}
        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300"
      >
        <div className="w-full h-48 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={getFullUrl(coverImage)}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium mb-1.5",
              categoryData?.colorClass,
              "text-category"
            )}
          >
            {categoryData?.icon} {categoryData?.name}
          </span>
          <h3 className="font-display font-bold text-base md:text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
            {excerpt}
          </p>
          <span className="text-xs text-muted-foreground mt-2">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={getFullUrl(coverImage)}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-1 p-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium mb-2",
            categoryData?.colorClass,
            "text-category"
          )}
        >
          {categoryData?.icon} {categoryData?.name}
        </span>
        <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
