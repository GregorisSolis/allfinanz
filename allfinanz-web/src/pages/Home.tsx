import homeImg from '../assets/home.png';

export function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-slate-900">
			{/* Banner principal */}
			<section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 max-w-6xl mx-auto">
				<div className="flex-1 mb-8 md:mb-0">
					<h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-4">Controle suas <span className="text-blue-400">Finanças</span></h1>
					<h2 className="text-xl md:text-2xl text-slate-300 font-medium">Organize, acompanhe e cresça seu patrimônio.</h2>
				</div>
				<img src={homeImg} alt="Finanças pessoais" className="w-80 md:w-96 rounded-xl shadow-lg border-4 border-slate-800" />
			</section>

			{/* Seção de características */}
			<section className="bg-slate-800 py-12 px-4 shadow-inner">
				<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="flex flex-col items-center">
						<div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
							<i className="text-3xl text-blue-400">💳</i>
						</div>
						<h3 className="font-semibold text-slate-100 mb-2">Cartões e Contas</h3>
						<div className="h-2 w-8 bg-blue-900 rounded mb-2" />
					</div>
					<div className="flex flex-col items-center">
						<div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
							<span className="text-3xl text-blue-400">📊</span>
						</div>
						<h3 className="font-semibold text-slate-100 mb-2">Relatórios Visuais</h3>
						<div className="h-2 w-8 bg-blue-900 rounded mb-2" />
					</div>
					<div className="flex flex-col items-center">
						<div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
							<span className="text-3xl text-blue-400">🔒</span>
						</div>
						<h3 className="font-semibold text-slate-100 mb-2">Segurança</h3>
						<div className="h-2 w-8 bg-blue-900 rounded mb-2" />
					</div>
				</div>
			</section>

			{/* Rodapé */}
			<footer className="mt-auto py-6 text-center text-slate-400 text-sm bg-slate-900">
				&copy; {new Date().getFullYear()} Finanzas Pessoais
			</footer>
		</div>
	);
}