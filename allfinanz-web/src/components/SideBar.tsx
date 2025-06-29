import { useState } from "react";
import {
  FiPieChart,
  FiImage,
  FiGrid,
  FiClipboard,
  FiLayers,
  FiMap,
  FiTool,
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiFileText,
  FiBarChart2,
  FiCreditCard,
  FiUser,
  FiSettings,
  FiDollarSign,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export function SideBar() {
  const [open, setOpen] = useState({
    pages: false,
    components: false,
    forms: false,
    tables: false,
    maps: false,
  });

  const handleToggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="h-4/5 w-xs bg-gradient-to-b from-blue-500 to-blue-700 shadow-lg flex flex-col text-white rounded-xl overflow-y-auto">
      {/* Top logo e título */}
      <div className="flex items-center gap-3 px-6 py-6">
        <FiDollarSign className="w-10 h-10 text-white" />
        <span className="font-bold text-lg tracking-wide">Olá, Usuario</span>
      </div>
      <hr className="border-blue-300 mx-4 mb-2" />
      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">

          <li className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 rounded cursor-pointer">
            <FiHome className="w-6 h-6" />
            <Link to="/dashboard" className="text-sm">Dashboard</Link>
          </li>

          <li className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 rounded cursor-pointer">
            <FiFileText className="w-6 h-6" />
            <Link to="/extrato" className="text-sm">Extrato</Link>
          </li>

          <li className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 rounded cursor-pointer">
            <FiBarChart2 className="w-6 h-6" />
            <Link to="/relatorios" className="text-sm">Relatórios</Link>
          </li>

          <li className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 rounded cursor-pointer">
            <FiCreditCard className="w-6 h-6" />
            <Link to="/cartoes" className="text-sm">Cartões</Link>
          </li>

          {/* Profile */}
          <li className="flex items-center gap-3 px-4 py-2 hover:bg-blue-600 rounded cursor-pointer">
            <FiUser className="w-6 h-6" />
            <Link to="/perfil" className="text-sm">Perfil</Link>
          </li>

          
        </ul>
      </nav>
    </div>
  );
}
