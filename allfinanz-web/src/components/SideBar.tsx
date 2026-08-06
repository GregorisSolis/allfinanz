import { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiLogIn,
  FiLogOut,
  FiHome,
  FiFileText,
  FiBarChart2,
  FiCreditCard,
  FiUser,
  FiDollarSign,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { logout } from "../services/auth";

export function SideBar() {
  const { user, clearUser, isAuthenticated, setIsAuthenticated } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("allfinanz-sidebar-collapsed") === "true";
  });

  const privateMenuItems = [
    { label: "Dashboard", to: "/dashboard", icon: FiHome },
    { label: "Extrato", to: "/extrato", icon: FiFileText },
    { label: "Relatórios", to: "/relatorios", icon: FiBarChart2 },
    { label: "Cartões", to: "/cartoes", icon: FiCreditCard },
    { label: "Perfil", to: "/perfil", icon: FiUser },
  ];

  const publicMenuItems = [
    { label: "Início", to: "/", icon: FiHome },
    { label: "Entrar", to: "/login", icon: FiLogIn },
    { label: "Criar conta", to: "/registrate", icon: FiUser },
  ];

  const menuItems = isAuthenticated ? privateMenuItems : publicMenuItems;

  function toggleSidebar() {
    const nextValue = !isCollapsed;
    setIsCollapsed(nextValue);
    localStorage.setItem("allfinanz-sidebar-collapsed", String(nextValue));
  }

  async function actionLogout() {
    await logout();
    clearUser();
    setIsAuthenticated(false);
    navigate('/login');
  }

  return (
    <aside className={[
      "sticky top-6 h-[calc(100vh-3rem)] rounded-lg border border-white/10 bg-[#0d1117]",
      "shadow-[0_20px_60px_-36px_rgba(0,0,0,0.9)] flex flex-col text-white overflow-hidden",
      "transition-[width] duration-300 ease-out",
      isCollapsed ? "w-[72px]" : "w-[260px]",
    ].join(" ")}>
      <div className={["flex items-center gap-3 px-4 py-5", isCollapsed ? "justify-center" : ""].join(" ")}>
        {isAuthenticated && user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
            <FiDollarSign className="w-5 h-5" />
          </div>
        )}
        {!isCollapsed && <div className="min-w-0">
          <p className="text-xs uppercase text-slate-500">Allfinanz</p>
          <span className="block truncate text-sm font-semibold tracking-wide">
            {isAuthenticated ? `Olá, ${user?.name || 'usuário'}` : 'Finanças pessoais'}
          </span>
        </div>}
      </div>
      <hr className="border-white/10 mx-4 mb-2" />
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {menuItems.map(({ label, to, icon: Icon }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

            return (
              <li key={to}>
                <Link
                  to={to}
                  title={isCollapsed ? label : undefined}
                  className={[
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                    isCollapsed ? "justify-center px-0" : "",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-2">
        {isAuthenticated && (
          <button
            type="button"
            onClick={actionLogout}
            className="mb-1 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-slate-300 transition hover:bg-rose-400/10 hover:text-rose-200"
            title="Sair"
          >
            <FiLogOut size={18} />
            {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          title={isCollapsed ? "Expandir menu" : "Minimizar menu"}
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          {!isCollapsed && <span className="text-sm font-medium">Minimizar</span>}
        </button>
      </div>
    </aside>
  );
}
