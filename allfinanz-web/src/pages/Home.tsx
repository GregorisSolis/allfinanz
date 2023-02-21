import { Navbar } from '../components/Navbar'
import { IsNotUser } from '../components/IsNotUser'


export function Home() {

	return (
		<>
			<Navbar location='home' />
			<IsNotUser />
		</>
	)
}