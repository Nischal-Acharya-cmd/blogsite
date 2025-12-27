import AdminLayout from "@/admin/frontend/AdminLayout";
import { FileText, Eye, TrendingUp } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useEffect, useState } from "react";
import api from "@/admin/frontend/api";
import { getFullUrl } from '@/lib/utils';

const AdminDashboardEditor = () => {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/articles').then((d: any) => setArticles(d)).catch(() => setArticles([]));
  }, []);

  const stats = [
    { label: 'Total Articles', value: articles.length, icon: FileText, color: 'text-primary' },
    { label: 'Categories', value: CATEGORIES.length, icon: TrendingUp, color: 'text-category-fitness' },
    { label: 'Total Views', value: '12.5K', icon: Eye, color: 'text-category-travel' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Editor Panel</h1>
        <p className="text-muted-foreground">You can create and manage articles from here.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="font-display text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
        <h2 className="font-display text-xl font-bold mb-4">Recent Articles</h2>
        <div className="space-y-3">
          {articles.slice(0, 5).map((article) => (
            <div key={article._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50">
              <img src={getFullUrl(article.coverImage)} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{article.title}</div>
                <div className="text-xs text-muted-foreground">{article.category} • {new Date(article.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardEditor;
