import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  stakeholder: "/stakeholder",
  coordinator: "/coordinator",
};

const Index = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    navigate(ROLE_HOME[role] || "/admin", { replace: true });
  }, [navigate, role]);

  return null;
};

export default Index;
