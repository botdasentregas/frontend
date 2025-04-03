import { Link, useLocation } from "react-router-dom";
import { CreditCard, Bot, Users, QrCode } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const BottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Não mostrar a navegação nas páginas de login, registro e página em branco
  if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/blank") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10 h-16">
      <div className="flex justify-evenly items-center h-full max-w-md mx-auto">
        <NavItem
          to="/assistant"
          icon={<Bot size={isMobile ? 18 : 20} />}
          label="Assistente"
          isActive={location.pathname === "/assistant"}
        />
        <NavItem
          to="/connect"
          icon={<QrCode size={isMobile ? 18 : 20} />}
          label="Conectar"
          isActive={location.pathname === "/connect"}
        />
        <NavItem
          to="/payment"
          icon={<CreditCard size={isMobile ? 18 : 20} />}
          label="Pagamento"
          isActive={location.pathname === "/payment"}
        />
        <NavItem
          to="/commission"
          icon={<Users size={isMobile ? 18 : 20} />}
          label="Indicações"
          isActive={location.pathname === "/commission"}
        />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, isActive }) => {
  const isMobile = useIsMobile();
  
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center w-full ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <div className={`flex justify-center items-center mb-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
        {icon}
      </div>
      <span className={`text-center text-[10px] ${isMobile ? "text-[9px]" : "text-[10px]"}`}>
        {label}
      </span>
    </Link>
  );
};

export default BottomNavigation;
