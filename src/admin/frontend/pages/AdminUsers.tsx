import { useEffect, useState } from "react";
import api from "@/admin/frontend/api";
import AdminUsersMaster from "@/admin/frontend/master/AdminUsers";
import AdminUsersEditor from "@/admin/frontend/editor/AdminUsers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/me')
      .then((m:any) => setRole(m.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  const { toast } = useToast();

  const handleEnsureSeed = async () => {
    const token = window.prompt('Enter ADMIN_SETUP_TOKEN to promote/create seeded admin');
    if (!token) return;
    try {
      const res = await api.post('/api/admins/ensure-seed', { setupToken: token });
      toast({ title: 'Seed result', description: JSON.stringify(res) });
      // refresh role so UI updates if needed
      api.get('/api/me').then((m:any)=>setRole(m.role)).catch(()=>{});
    } catch (err:any) {
      toast({ title: 'Error', description: err?.error || 'Request failed', variant: 'destructive' });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div>
      <div className="flex justify-end p-4">
        <Button variant="outline" size="sm" onClick={handleEnsureSeed}>Ensure Seeded Admin</Button>
      </div>
      {role === 'master' ? <AdminUsersMaster /> : <AdminUsersEditor />}
    </div>
  );
};

export default AdminUsers;
