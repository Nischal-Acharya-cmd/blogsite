import { useEffect, useState } from "react";
import api from "@/admin/frontend/api";
import AdminDashboardMaster from "@/admin/frontend/master/AdminDashboard";
import AdminDashboardEditor from "@/admin/frontend/editor/AdminDashboard";

const AdminIndex = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/me')
      .then((m:any) => setRole(m.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (role === 'master') return <AdminDashboardMaster />;
  return <AdminDashboardEditor />;
};

export default AdminIndex;
