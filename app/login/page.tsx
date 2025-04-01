'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      await login(
        formData.get('email') as string,
        formData.get('password') as string
      )

      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') || '/'
      router.push(redirect)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  // Rest of your component...
}
