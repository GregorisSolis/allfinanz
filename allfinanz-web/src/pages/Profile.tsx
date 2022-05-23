export function Profile(){
	return(
		<div className="w-full h-96 text-white flex">
			<div className="w-8/12 m-auto p-4">

				<div className="flex justify-between items-center">
					<div className="my-4 border-solid border-sky-900 h-52 bg-brand-200 w-52 border-8 rounded-full shadow-lg">
						<img src="" alt="photo profile"/>
					</div>

					<h1 className="text-5xl capitalize" >gregoris solos danes solos</h1>
				</div>

				<div className="m-4 w-full rounded flex justify-between items-center">
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Renda mensual</span>
						<p className="text-2xl font-bold">$ 1222.00</p>
					</div>					
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Dinero ahorrado</span>
						<p className="text-2xl font-bold">$ 1222.00</p>
					</div>					
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Transacciones</span>
						<p className="text-2xl font-bold">12</p>
					</div>					
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Nº Tarjetas</span>
						<p className="text-2xl font-bold">1</p>
					</div>
				</div>

				<div className="bg-brand-200 w-full p-4 m-4 rounded shadow-lg">

					<div className="my-5 mx-4 flex flex-col">
						<span className="text-sm">email:</span>
						<input className="my-1 text-xl w-2/5 text-white border-b-2 border-white border-solid bg-transparent outline-none p-1" placeholder="elpandagriego@gmail.com"/>
					</div>					

					<div className="my-5 mx-4 flex flex-col">
						<span className="text-sm">contraseña:</span>
						<input className="my-1 text-xl w-2/5 text-white border-b-2 border-white border-solid bg-transparent outline-none p-1" placeholder="12345232423"/>
					</div>				

					<div className="my-5 mx-4 flex justify-center items-center">
						<button className="bg-red-600 p-2 rounded hover:bg-red-500">Cancelar cuenta</button>
					</div>

				</div>

			</div>
		</div>
	)
}