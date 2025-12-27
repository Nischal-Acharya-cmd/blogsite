import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/admin/frontend/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichEditor from "@/admin/frontend/components/RichEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import api from "@/admin/frontend/api";
import { getFullUrl } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";

const AdminArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [existing, setExisting] = useState<any | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    coverImage: "",
    pdfUrl: "",
    author: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/articles/${id}`).then((d:any) => {
      setExisting(d);
      setForm({
        title: d.title || '',
        category: d.category || '',
        excerpt: d.excerpt || '',
        content: d.content || '',
        coverImage: d.coverImage || '',
        pdfUrl: d.pdfUrl || '',
        author: d.author || '',
      });
    }).catch(() => {});
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        // If cover/pdf are File objects (uploaded), send to upload endpoint first
        const payload: any = { ...form };
        // Log payload for debugging (content length etc.)
        try {
          // eslint-disable-next-line no-console
          console.log('Submitting article payload', { title: payload.title, contentLength: payload.content ? payload.content.length : 0, coverImage: payload.coverImage, pdfUrl: payload.pdfUrl });
        } catch (e) {}

        if (isEdit) {
          await api.put(`/api/articles/${id}`, payload);
        } else {
          await api.post('/api/articles', payload);
        }
        toast({ title: isEdit ? 'Article Updated' : 'Article Created', description: 'Your changes have been saved.' });
        navigate('/admin/articles');
      } catch (err:any) {
        toast({ title: 'Error', description: err?.error || 'Save failed', variant: 'destructive' });
      }
    })();
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/admin/articles")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
        </Button>
        <h1 className="font-display text-3xl font-bold mb-8">{isEdit ? "Edit Article" : "New Article"}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief description" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <RichEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} placeholder="Article content (HTML supported)" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/50 cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <input type="file" accept="image/*" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const fd = new FormData(); fd.append('file', f);
                  const res:any = await api.post('/api/upload', fd);
                  setForm({ ...form, coverImage: res.url });
                }} />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
                {form.coverImage && <div className="mt-2"><img src={getFullUrl(form.coverImage)} className="w-36 h-24 object-cover rounded" alt="cover"/></div>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>PDF File</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/50 cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <input type="file" accept="application/pdf" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const fd = new FormData(); fd.append('file', f);
                  const res:any = await api.post('/api/upload', fd);
                  setForm({ ...form, pdfUrl: res.url });
                }} />
                <p className="text-sm text-muted-foreground">Click to upload PDF</p>
                {form.pdfUrl && <div className="mt-2 text-xs text-muted-foreground">Uploaded: {form.pdfUrl}</div>}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" className="gradient-hero text-primary-foreground">{isEdit ? "Update Article" : "Create Article"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/articles")}>Cancel</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminArticleForm;
