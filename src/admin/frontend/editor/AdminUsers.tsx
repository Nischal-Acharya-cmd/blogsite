import { useEffect, useState } from "react";
import AdminLayout from "@/admin/frontend/AdminLayout";
import { Mail } from "lucide-react";
import api from "@/admin/frontend/api";

const AdminUsersEditor = () => {
  const [me, setMe] = useState<any>(null);
  useEffect(() => { api.get('/api/me').then((m:any)=>setMe(m)).catch(()=>setMe(null)); }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Users</h1>
        <p className="text-muted-foreground">You do not have permission to manage admin users.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{me?.email || '—'}</div>
            <div className="text-xs text-muted-foreground">Role: {me?.role || '—'}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersEditor;
