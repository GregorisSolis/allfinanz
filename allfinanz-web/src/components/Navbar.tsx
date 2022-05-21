export function Navbar(){
	return(
		<nav className="h-20 text-white shadow-md">
			<div className="flex justify-between items-center h-full w-10/12 m-auto">

				<div className="text-4xl uppercase">allfinanz</div>

				<div className=" h-full w-80 text-2xl flex justify-around items-center">
					<a className="h-full flex items-center hover:text-sky-500 transition" href="#">Home</a>
					<a className="h-full flex items-center hover:text-sky-500 transition" href="#">Perfil</a>
					<a className="h-full flex items-center hover:text-sky-500 transition" href="#">Entrar</a>
				</div>
			</div>
		</nav>
	)
}