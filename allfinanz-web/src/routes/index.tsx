import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Home } from '../pages/Home'
import { Dashboard } from '../pages/Dashboard'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ProfileComplete } from '../pages/Profilecomplete'
import { Extract } from '../pages/Extract'
import { Profile } from '../pages/Profile'
import { FormTransaction } from '../pages/FormTransaction'
import { PageNotFound } from "../pages/PageNotFound";
import { ForgotPassword } from "../pages/ForgotPassword";
import { CreateResetPassword } from '../pages/CreateResetPassword'
import Loading from '../components/Loading'
import { SideBar } from '../components/SideBar'
import { Reports } from '../pages/Reports'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ListCards } from "../pages/ListCards";
import { useUser } from "../contexts/UserContext";

const PrivateRoute = ({ children, redirectTo }: { children: React.ReactNode, redirectTo: string }) => {
  const { isAuthenticated, isLoadingUser } = useUser();

  if (isLoadingUser) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} />;
};

const AppShell = ({ children }: { children: React.ReactNode }) => (
	<div className="grid min-h-screen w-full grid-cols-[auto_minmax(0,1fr)] gap-4 px-0 text-slate-100 sm:px-0">
		<section className="hidden py-6 md:block">
			<SideBar />
		</section>
		<main className="min-w-0 h-screen overflow-y-auto py-5 md:py-6 md:pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600">
			{children}
		</main>
	</div>
);

const PrivatePage = ({ children }: { children: React.ReactNode }) => (
	<PrivateRoute redirectTo="/login">
		<AppShell>
			{children}
		</AppShell>
	</PrivateRoute>
);

export const Routers = () => (
	<BrowserRouter>
		<ToastContainer 
			toastClassName={() =>
				"bg-slate-800/90 backdrop-blur-md border border-slate-700 text-white p-4 rounded-xl shadow-md"
			}
			position="bottom-right" 
			autoClose={3000} 
			hideProgressBar={false}
			newestOnTop={false} 
			closeOnClick
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="dark"
		/>
		<Routes>
			<Route path="/" element={<Home />}/>
			<Route path="/login" element={<Login />}/>
			<Route path="/registrate" element={<Register />}/>
			<Route path="/dashboard/" element={ <PrivatePage> <Dashboard /> </PrivatePage>}/>
			
			<Route path="/perfil" element={ <PrivatePage> <Profile /> </PrivatePage>}/>
			<Route path="/perfil/completar/" element={ <PrivatePage> <ProfileComplete /> </PrivatePage>}/>
			
			<Route path="/gasto" element={ <PrivatePage> <FormTransaction /> </PrivatePage>}/>
			<Route path="/gasto/:id" element={ <PrivatePage> <FormTransaction /> </PrivatePage>}/>
			
			<Route path="/cartoes" element={ <PrivatePage> <ListCards /> </PrivatePage>}/>
			
			<Route path="/extrato" element={ <PrivatePage> <Extract /> </PrivatePage>}/>
			<Route path="/relatorios" element={ <PrivatePage> <Reports /> </PrivatePage>}/>

			<Route path="/recuperar-cuenta" element={<ForgotPassword />}/>
			<Route path="/reset-password/:token/:email" element={<CreateResetPassword />}/>
			<Route path="/*" element={<PageNotFound />}/>
		</Routes>
	</BrowserRouter>
)
