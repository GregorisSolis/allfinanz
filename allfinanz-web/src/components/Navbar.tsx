import { Link } from 'react-router-dom'
import { isAuthenticated } from '../services/auth'
import { logout } from '../services/auth'

export function Navbar(){
	return(
		<nav className="h-20 text-white shadow-md">
			<div className="flex justify-between items-center h-full w-10/12 m-auto">

				<div className="text-4xl uppercase">allfinanz</div>

				{isAuthenticated() ? 
				<div className=" h-full w-80 text-2xl flex justify-around items-center">
					<Link className="h-full flex items-center hover:text-sky-500 transition" to="/">Home</Link>
					<Link className="h-full flex items-center hover:text-sky-500 transition" to="/extracto">Extracto</Link>
					<Link className="h-full flex items-center hover:text-sky-500 transition" to="/Perfil">Perfil</Link>
					<a className="h-full flex items-center hover:text-sky-500 transition" onClick={() => logout()} href="/">Salir</a>
				</div>
				:
				<div className=" h-full w-80 text-2xl flex justify-end items-center">
					<Link className="h-full flex items-center hover:text-sky-500 transition" to="/login">Entrar</Link>
				</div>
				}
			</div>
		</nav>
	)
}