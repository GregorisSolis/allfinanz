import { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiX,
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

export function SideBar() {
  const { user, clearUser, isAuthenticated, setIsAuthenticated } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("allfinanz-sidebar-collapsed") === "true";
  });

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

export function MobileFloatingMenu() {
  const { user, clearUser, isAuthenticated, setIsAuthenticated } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = isAuthenticated ? privateMenuItems : publicMenuItems;

  async function actionLogout() {
    await logout();
    clearUser();
    setIsAuthenticated(false);
    setIsOpen(false);
    navigate('/login');
  }

  return (
    <div className="md:hidden">
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-5 left-4 z-50">
        {isOpen && (
          <div className="mb-3 w-[min(calc(100vw-2rem),320px)] overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] text-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
              {isAuthenticated && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                  <FiDollarSign className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs uppercase text-slate-500">Allfinanz</p>
                <span className="block truncate text-sm font-semibold">
                  {isAuthenticated ? `Olá, ${user?.name || 'usuário'}` : 'Finanças pessoais'}
                </span>
              </div>
            </div>

            <nav className="p-2">
              <ul className="space-y-1">
                {menuItems.map(({ label, to, icon: Icon }) => {
                  const isActive = to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to);

                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={() => setIsOpen(false)}
                        className={[
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                          isActive
                            ? "bg-white/[0.08] text-white"
                            : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {isAuthenticated && (
              <div className="border-t border-white/10 p-2">
                <button
                  type="button"
                  onClick={actionLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-rose-400/10 hover:text-rose-200"
                >
                  <FiLogOut className="h-5 w-5 shrink-0" />
                  Sair
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#0d1117]/95 text-white shadow-xl backdrop-blur transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E2127]"
        >
          {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
