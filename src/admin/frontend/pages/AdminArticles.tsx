import { Link } from "react-router-dom";
import AdminLayout from "@/admin/frontend/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useEffect, useState } from "react";
import api from "@/admin/frontend/api";
import { getFullUrl } from '@/lib/utils';

const AdminArticles = () => {
  const [articles, setArticles] = useState<any[]>([]);

  const load = () => api.get('/api/articles').then((d:any) => setArticles(d)).catch(() => setArticles([]));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete article?')) return;
    await api.del(`/api/articles/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Manage your blog articles</p>
        </div>
        <Button asChild className="gradient-hero text-primary-foreground">
          <Link to="/admin/articles/new"><Plus className="h-4 w-4 mr-2" /> New Article</Link>
        </Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium">Article</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Date</th>
              <th className="text-right px-6 py-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => {
              const cat = CATEGORIES.find((c) => c.id === article.category);
              return (
                <tr key={article._id} className="hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getFullUrl(article.coverImage)} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="font-medium truncate max-w-xs">{article.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{cat?.icon} {cat?.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(article.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" asChild><Link to={`/admin/articles/edit/${article._id}`}><Edit className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(article._id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminArticles;
