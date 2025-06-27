import { Link } from 'react-router-dom'
import { isAuthenticated } from '../services/auth'
import { logout } from '../services/auth'
import { FiMenu, FiSearch, FiUser, FiX } from 'react-icons/fi'
import { useState } from 'react';

export function Navbar(){
	const [isOpen, setIsOpen] = useState(false);
	const [toggleMenu, setToggleMenu] = useState(false);

	return(
		<nav className="h-20 text-white bg-transparent">
			{(isAuthenticated()) ? (
			<div className="flex justify-between items-center h-full lg:w-[95%] md:w-full m-auto">

					<div className="text-4xl uppercase title mx-4">
						<button 
							onClick={() => setIsOpen(!isOpen)} 
							className="p-2 rounded hover:bg-slate-700"
							>
							{isOpen ? (
								<FiX className="w-6 h-6 text-slate-200" />
							) : (
								<FiMenu className="w-6 h-6 text-slate-200" />
							)}
						</button>
						<a className="link text-2xl font-thin p-2 mx-2" href="/dashboard">
							Allfinanz
						</a>
					</div>

					<div className="relative">
						<button
							onClick={() => setToggleMenu(!toggleMenu)}
							className="px-3 py-2 rounded hover:bg-slate-700"
							>
							<FiUser className="bg-slate-800 p-1 rounded-full w-10 h-10" />
						</button>

						{toggleMenu && (
						<div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded shadow-lg z-50">
							<a
							href="#"
							className="block px-4 py-2 hover:bg-slate-700"
							>
							Perfil
							</a>
							<a
							href="#"
							className="block px-4 py-2 hover:bg-slate-700"
							>
							Config
							</a>
							<hr className='m-auto w-4/5 border-gray-400'/>
							<Link to="/login"
								onClick={() => logout()}
								className="block px-4 py-2 hover:bg-slate-700"
							>
							Sair
							</Link>
						</div>
						)}
					</div>
				</div> ) :
				<div className="flex justify-between items-center h-full lg:w-[95%] md:w-full m-auto">

					<div className="text-4xl uppercase title mx-4">
						<Link className="link text-2xl font-thin p-2 mx-2" to={isAuthenticated() ? '/dashboard' : '/'}>
							Allfinanz
						</Link>
					</div>

				<div className="relative">
					<a className="link text-2xl font-thin p-2 mx-2" href="/login">
						Entrar
					</a>
				</div>
			</div>
			}
		</nav>
	)
}