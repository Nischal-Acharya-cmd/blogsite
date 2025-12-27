import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: ReactNode | string;
  description: string;
  colorClass: string;
  articleCount?: number;
}

const CategoryCard = ({ name, slug, icon, description, colorClass, articleCount = 0 }: CategoryCardProps) => {
  const renderIcon = () => {
    // If the category provides a JSX icon (as in `CATEGORIES`), render it directly.
      if (typeof icon !== "string") {
        if (React.isValidElement(icon)) {
          const extra = "h-7 w-7 text-category group-hover:text-category-foreground group-hover:scale-110 transition-all duration-300";
          const existing = (icon.props && icon.props.className) ? `${icon.props.className} ${extra}` : extra;
          return React.cloneElement(icon, { className: existing });
        }
        return icon;
      }

      // Fallback: if a string key is provided, try to resolve to a known lucide icon.
      const iconKey = icon as string;
      const map: Record<string, any> = {};
      const Comp = map[iconKey];
      return Comp ? <Comp className="h-7 w-7 text-category group-hover:text-category-foreground group-hover:scale-110 transition-all duration-300" /> : null;
  };

  return (
    <Link
      to={`/category/${slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 bg-card border border-border",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        colorClass
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-category" />
      
      {/* Icon */}
      <div
        className={cn(
          "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4",
          "bg-category/10 group-hover:bg-category group-hover:shadow-category transition-all duration-300"
        )}
      >
        {renderIcon()}
      </div>

      {/* Content */}
      <h3 className="font-display text-xl font-bold mb-2 group-hover:text-category transition-colors">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {articleCount} articles
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-category opacity-0 group-hover:opacity-100 transition-opacity">
          Explore <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
