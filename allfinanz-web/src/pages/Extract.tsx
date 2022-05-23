import { CalendarContent } from '../components/CalendarContent'
import { ListCard } from '../components/ListCard'
import { ListTransactions } from '../components/ListTransactions'
import { SidebarInfoUser } from '../components/SidebarInfoUser'

export function Extract(){

	return(
		<div className="w-full h-96 text-white flex">
			<div className="w-4/5 m-auto p-4">

				<div className="flex">
					<CalendarContent />
				</div>

				<div className="my-4">
					<span className="text-2xl">Gastos del mes</span>
					<div className="flex">
						<ListTransactions />
						<SidebarInfoUser />
					</div>
				</div>

				<div className="my-4">
					<span className="text-2xl">Tarjetas</span>
					<ListCard />
				</div>

			</div>
		</div>
	)
}