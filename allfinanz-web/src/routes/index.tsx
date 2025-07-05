import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from '../services/auth'

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
import { Navbar } from '../components/Navbar'
import Loading from '../components/Loading'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ListCards } from "../pages/ListCards";

const PrivateRoute = ({ children, redirectTo }: { children: React.ReactNode, redirectTo: string }) => {
  const [auth, setAuth] = useState<null | boolean>(null);

  useEffect(() => {
    const checkAuth = async () => {
		const result = await isAuthenticated();
		setAuth(result);
    };
    checkAuth();
  }, []);

  if (auth === null) {
    return <Loading />;
  }

  return auth ? children : <Navigate to={redirectTo} />;
};

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
		<Navbar />
		<Routes>
			<Route path="/" element={<Home />}/>
			<Route path="/login" element={<Login />}/>
			<Route path="/registrate" element={<Register />}/>
			<Route path="/dashboard/" element={ <PrivateRoute redirectTo="/login"> <Dashboard /> </PrivateRoute>}/>
			
			<Route path="/perfil" element={ <PrivateRoute redirectTo="/login"> <Profile /> </PrivateRoute>}/>
			<Route path="/perfil/completar/" element={ <PrivateRoute redirectTo="/login"> <ProfileComplete /> </PrivateRoute>}/>
			
			<Route path="/gasto" element={ <PrivateRoute redirectTo="/login"> <FormTransaction /> </PrivateRoute>}/>
			<Route path="/gasto/:id" element={ <PrivateRoute redirectTo="/login"> <FormTransaction /> </PrivateRoute>}/>
			
			<Route path="/cartoes" element={ <PrivateRoute redirectTo="/login"> <ListCards /> </PrivateRoute>}/>
			
			<Route path="/extrato" element={ <PrivateRoute redirectTo="/login"> <Extract /> </PrivateRoute>}/>

			<Route path="/recuperar-cuenta" element={<ForgotPassword />}/>
			<Route path="/reset-password/:token/:email" element={<CreateResetPassword />}/>
			<Route path="/*" element={<PageNotFound />}/>
		</Routes>
	</BrowserRouter>
)