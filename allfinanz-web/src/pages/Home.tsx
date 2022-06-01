import { isAuthenticated } from '../services/auth'

import { Navbar } from '../components/Navbar'
import { ListCard } from '../components/ListCard'
import { ListFixedCost } from '../components/ListFixedCost'
import { ListTransactions } from '../components/ListTransactions'
import { SidebarInfoUser } from '../components/SidebarInfoUser'


export function Home(){

	document.title = 'Allfinanz'

	return(
		<>
		<Navbar />
		<div className="w-full h-96 text-white flex">
			{ isAuthenticated() ? 
				<div className="w-4/5 m-auto p-4">
		
					<div className="my-4">
						<span className="text-2xl">Tarjetas</span>
						<ListCard />
					</div>

					<div className="my-4">
						<span className="text-2xl">Gastos Fijos</span>
						<div className="flex">
							<ListFixedCost />
							<SidebarInfoUser />
						</div>
					</div>

					<div className="my-4">
						<span className="text-2xl">Ultimas compras</span>
						<ListTransactions />
					</div>

				</div>
			:
				<div>debes iniciar sesion</div>
			}
		</div>
		</>
	)
}