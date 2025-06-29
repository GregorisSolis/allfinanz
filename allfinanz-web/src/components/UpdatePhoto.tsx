import { FormEvent, useState } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'

interface UpdatePhotoProps {
	idForRemove: string,
	reload: () => void,
	closeComponent: () => void
}

export function UpdatePhoto(props: UpdatePhotoProps) {
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	function setPhotoProfile(event: FormEvent) {
		event.preventDefault()
		if (!imageFile) {
			toast.error('Por favor, selecione uma imagem.')
			return
		}
		setIsLoading(true)
		const data = new FormData()
		data.append('file', imageFile, imageFile.name)
		API.post('/user/post', data, { withCredentials: true })
			.then(res => {
				let imageUrl = res.data.post.url
				let imageID = res.data.post.key
				removePhotoFromAws()
				setUrlUserPhoto(imageUrl, imageID)
			})
			.catch(() => {
				toast.error('Não foi possível carregar o arquivo.')
			})
			.finally(() => setIsLoading(false))
	}

	//elimina a foto antiga
	function removePhotoFromAws() {
		API.delete(`/user/remove-post/${props.idForRemove}`, { withCredentials: true })
	}

	//adiciona imageID e imageURL ao usuário
	function setUrlUserPhoto(imageUrl: string, imageID: string) {
		API.put('/user/edit', { imageUrl, imageID }, { withCredentials: true })
			.then(() => {
				toast.success('Foto atualizada com sucesso!')
				props.closeComponent()
				props.reload()
			})
	}

	return (
		<>
			<div className="bg-black/50 backdrop-blur-sm fixed inset-0 animate-fadeIn z-40" />
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-700 rounded-xl p-6 w-[90vw] max-w-sm shadow-lg z-50">
				<form className="flex flex-col text-center" onSubmit={setPhotoProfile}>
					<h1 className="text-lg font-semibold mb-4 text-white">Adicionar nova foto</h1>
					<input
						className="mb-6 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500 text-white placeholder-white"
						type="file"
						accept="image/*"
						onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
					/>
					<div className="flex justify-end gap-4 mt-2">
						<button
							className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-gray-800 bg-white"
							type="button"
							onClick={() => props.closeComponent()}
							disabled={isLoading}
						>
							Cancelar
						</button>
						<button
							className="px-4 py-2 rounded text-white bg-sky-600 hover:bg-sky-700"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? 'Enviando...' : 'Confirmar'}
						</button>
					</div>
				</form>
			</div>
		</>
	)
}