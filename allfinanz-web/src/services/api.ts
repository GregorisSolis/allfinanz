import axios from 'axios'

import { getToken } from './auth'

export const API = axios.create({ baseURL: 'https://allfinanz-production.up.railway.app/' })

//ESTE CODIGO SE ENCARGA DE VERIFICAR SI EXISTE UN TOKEN Y PERMITIR LA AUTORIZACION
API.interceptors.request.use(async (config: any) => {
	const token = getToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})
