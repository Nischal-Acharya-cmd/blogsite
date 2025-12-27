import { useState, useEffect } from "react";
import AdminLayout from "@/admin/frontend/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/admin/frontend/api";

const AdminUsersMaster = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string>('editor');
  const [role, setRole] = useState<string | null>(null);

  const load = () => api.get('/api/admins').then((d:any) => setAdmins(d)).catch(() => setAdmins([]));
  useEffect(() => { load(); api.get('/api/me').then((m:any)=>setRole(m.role)).catch(()=>setRole(null)); }, []);

  const handleAdd = () => {
    if (!newEmail) return;
    const payload: any = { email: newEmail, role: newRole };
    if (newPassword) payload.password = newPassword;
    api.post('/api/admins', payload).then(() => {
      setNewEmail(''); setNewPassword(''); setNewRole('editor');
      toast({ title: 'Admin Added', description: `${newEmail} has been added as an admin.` });
      load();
    }).catch((err:any) => toast({ title: 'Error', description: err?.error || 'Could not add' }));
  };

  const handleDelete = (id: string) => {
    api.del(`/api/admins/${id}`).then(() => {
      toast({ title: 'Admin Removed' });
      load();
    }).catch(() => toast({ title: 'Error', description: 'Could not remove' }));
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Users</h1>
        <p className="text-muted-foreground">Manage who can access the admin panel</p>
      </div>
      {role === 'master' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-2xl">
          <Input placeholder="Email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Input placeholder="Password (optional)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <div className="flex gap-2">
            <select className="input" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="editor">Editor</option>
              <option value="master">Master</option>
            </select>
            <Button onClick={handleAdd} className="gradient-hero text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add</Button>
          </div>
        </div>
      )}
      {role !== 'master' && (
        <div className="mb-6 text-sm text-muted-foreground">Only the master admin can add other admins.</div>
      )}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {admins.map((admin) => (
          <div key={admin._id || admin.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{admin.email}</div>
                <div className="text-xs text-muted-foreground">Added {admin.createdAt}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(admin._id || admin.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersMaster;
