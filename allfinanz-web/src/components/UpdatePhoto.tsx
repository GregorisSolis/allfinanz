import { FormEvent, useState } from 'react'
import { API } from '../services/api'

interface UpdatePhotoProps{
	idForRemove: string,
	reload: () => void,
	closeComponent: () => void
}

export function UpdatePhoto(props: UpdatePhotoProps){

	const ID_USER = localStorage.getItem('iden')
	let [imageFile, setImageFile] = useState([])
	let [message, setMessage] = useState('')
	let idForRemove = props.idForRemove

	function setPhotoProfile(event: FormEvent){
		event.preventDefault()
		let imageData: any = imageFile

		if(imageData){
			const data = new FormData();
			data.append("file", imageData, imageData.name);

			API.post('/auth/post', data)
			.then(res => {
				let imageUrl = res.data.post.url
				let imageID = res.data.post.key
				removePhotoFromAws()
				setUrlUserPhoto(imageUrl, imageID)
			})
			.catch(() => {
				setMessage('No se pudo cargar el archivo.')
			})
		}

	}

	//elimina la foto, para luego agregar una nueva
	function removePhotoFromAws(){
		API.delete(`/auth/remove-post/${idForRemove}`)
	}

	//agregar imageID y la imageURL al usuario
	function setUrlUserPhoto(imageUrl: string, imageID: string){
		API.put(`/auth/edit/${ID_USER}`, { imageUrl, imageID})
		.then(() => {
			props.closeComponent()
			props.reload()
		})
	}

	return(
		<div className="m-0 fixed bg-brand-100 inset-0 transition flex justify-center items-center z-20">
			<form className="text-white bg-brand-800 flex flex-col p-4 rounded text-center w-[35%]" onSubmit={setPhotoProfile}>
				<h1 className="text-2xl">Agregar nueva foto</h1>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" type="file" onChange={(e: any) => setImageFile(e.target.files[0])}/>
				<div className="m-4">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
				<p className='text-orange-500 normal-case transition h-12'>{message}</p>
			</form>
		</div>
	)
}