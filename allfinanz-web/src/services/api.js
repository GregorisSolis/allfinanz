import axios from 'axios'

import { getToken } from './auth'

export const API = axios.create({ baseURL: 'http://localhost:8080' })

//ESTE CODIGO SE ENCARGA DE VERIFICAR SI EXISTE UN TOKEN Y PERMITIR LA AUTORIZACION
API.interceptors.request.use(async config => {
	const token = getToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})
