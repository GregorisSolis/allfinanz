import { Link } from 'react-router-dom'
import { isAuthenticated, logout } from '../services/auth'
import { FiUser } from 'react-icons/fi'
import { useEffect, useState } from 'react';

export function Navbar(){

	const [toggleMenu, setToggleMenu] = useState(false);
	const [auth, setAuth] = useState(false);

	useEffect(() => {
		// Checa autenticação ao montar o componente
		const checkAuth = async () => {
			const result = await isAuthenticated();
			setAuth(result);
		};
		checkAuth();
	}, []);

	async function actionLogout(){
		await logout();
		setAuth(false);
		setToggleMenu(false);
	}

	return(
		<nav className="h-20 text-white bg-transparent">
			{auth ? (
			<div className="flex justify-between items-center h-full lg:w-[95%] md:w-full m-auto">

					<div className="text-4xl uppercase title mx-4">
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
							<Link to="/perfil"
								className="block px-4 py-2 hover:bg-slate-700"
							>
								Perfil
							</Link>
							<a
								href="#"
								className="block px-4 py-2 hover:bg-slate-700"
							>
								Config
							</a>
							<hr className='m-auto w-4/5 border-gray-400'/>
							<Link to="/login"
								onClick={actionLogout}
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
						<Link className="link text-2xl font-thin p-2 mx-2" to={auth ? '/dashboard' : '/'}>
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