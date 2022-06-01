import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from '../services/auth'

import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ProfileComplete } from '../pages/ProfileComplete'
import { Extract } from '../pages/Extract'
import { Profile } from '../pages/Profile'
import { ModifyCard } from '../pages/ModifyCard'
import { FormTransaction } from '../pages/FormTransaction'

const PrivateRoute = ({ children, redirectTo }) => {
  return isAuthenticated() ? children : <Navigate to={redirectTo} />;
};

export const Routers = () => (
	<BrowserRouter>
		<Routes>
			<Route exact path="/" element={<Home />}/>
			<Route exact path="/login" element={<Login />}/>
			<Route exact path="/registrate" element={<Register />}/>
			<Route path="/perfil/completar/" element={ <PrivateRoute redirectTo="/login"> <ProfileComplete /> </PrivateRoute>}/>
			<Route path="/extracto" element={ <PrivateRoute redirectTo="/login"> <Extract /> </PrivateRoute>}/>
			<Route path="/perfil" element={ <PrivateRoute redirectTo="/login"> <Profile /> </PrivateRoute>}/>
			<Route path="/modificar/card/:nameCard" element={ <PrivateRoute redirectTo="/login"> <ModifyCard /> </PrivateRoute>}/>
			<Route path="/transaccion/nueva" element={ <PrivateRoute redirectTo="/login"> <FormTransaction /> </PrivateRoute>}/>
		</Routes>
	</BrowserRouter>
)