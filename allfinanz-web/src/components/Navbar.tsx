import { Link } from 'react-router-dom'
import { isAuthenticated } from '../services/auth'
import { logout } from '../services/auth'

export function Navbar(props: {location: string}){
	let location = props.location
	return(
		<nav className="h-20 text-white shadow-xl">
			<div className="flex justify-between items-center h-full lg:w-10/12 md:w-full m-auto">

				<div className="text-4xl uppercase title mx-4">allfinanz</div>

				{isAuthenticated() ? 
				<div className=" h-full w-80 text-2xl flex justify-around items-center nav_responsive">
					<Link className={location === 'home' ? 'link text-sky-600' : 'link'} to="/">Home</Link>
					<Link className={location === 'extract' ? 'link text-sky-600' : 'link'} to="/extracto">Extracto</Link>
					<Link className={location === 'profile' ? 'link text-sky-600' : 'link'} to="/Perfil">Perfil</Link>
					<a className="link" onClick={() => logout()} href="/">Salir</a>
				</div>
				:
				<div className=" h-full w-80 text-2xl flex justify-end items-center mx-4">
					<Link className="link" to="/login">Entrar</Link>
				</div>
				}
			</div>
		</nav>
	)
}