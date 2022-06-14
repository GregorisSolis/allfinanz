import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from '../services/auth'

import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ProfileComplete } from '../pages/Profilecomplete'
import { Extract } from '../pages/Extract'
import { Profile } from '../pages/Profile'
import { ModifyCard } from '../pages/ModifyCard'
import { FormTransaction } from '../pages/FormTransaction'
import { PageNotFound } from "../pages/PageNotFound";
import { ForgotPassword } from "../pages/ForgotPassword";
import { CreateResetPassword } from '../pages/CreateResetPassword'

// @ts-ignore
const PrivateRoute = ({ children, redirectTo }) => {
  return isAuthenticated() ? children : <Navigate to={redirectTo} />;
};

export const Routers = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />}/>
			<Route path="/login" element={<Login />}/>
			<Route path="/registrate" element={<Register />}/>
			<Route path="/perfil/completar/" element={ <PrivateRoute redirectTo="/login"> <ProfileComplete /> </PrivateRoute>}/>
			<Route path="/extracto/" element={ <PrivateRoute redirectTo="/login"> <Extract /> </PrivateRoute>}/>
			<Route path="/perfil" element={ <PrivateRoute redirectTo="/login"> <Profile /> </PrivateRoute>}/>
			<Route path="/modificar/card/:nameCard" element={ <PrivateRoute redirectTo="/login"> <ModifyCard /> </PrivateRoute>}/>
			<Route path="/nueva/transaccion" element={ <PrivateRoute redirectTo="/login"> <FormTransaction /> </PrivateRoute>}/>
			<Route path="/recuperar-cuenta" element={<ForgotPassword />}/>
			<Route path="/reset-password/:token/:email" element={<CreateResetPassword />}/>
			<Route path="/*" element={<PageNotFound />}/>
		</Routes>
	</BrowserRouter>
)