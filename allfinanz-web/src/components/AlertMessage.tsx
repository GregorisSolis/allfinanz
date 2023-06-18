import { useEffect, useState } from 'react'
import { API } from '../services/api'

interface AlertMessageProps {
	type: '',
	title: '',
    message: '',
}

export function AlertMessage(props: AlertMessageProps) {

	return (
		<div className="flex overflow-y-hidden scrollbar scrollbar-thumb-zinc-700 scrollbar-thin">

        </div>
	)
}