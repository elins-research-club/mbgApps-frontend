import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function SignUpForm({
  className,
  ...props
}) {
  const [fullName, setFullName]           = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError]                 = useState(null)
  const [isLoading, setIsLoading]         = useState(false)
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Password tidak cocok')
      setIsLoading(false)
      return
    }

    try {
      console.log('📝 [SIGNUP] Creating user via backend API...')
      
      // Use backend API to create user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      console.log('✅ [SIGNUP] User created successfully:', data)
      console.log('   User ID:', data.userId)
      console.log('   Has Organization:', data.hasOrganization)

      // Auto-login after signup (user is already confirmed)
      console.log('🔐 [SIGNUP] Auto-login...')
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.error('❌ [SIGNUP] Auto-login failed:', loginError)
        throw loginError
      }

      console.log('✅ [SIGNUP] Auto-login successful')

      if (data.hasOrganization) {
        console.log('🏠 [SIGNUP] Redirecting through home...')
        router.replace('/')
        return
      }

      // New users without an org land on onboarding with create/join options.
      console.log('🏠 [SIGNUP] Redirecting to organization onboarding...')
      router.replace('/organization/create')
    } catch (err) {
      console.error('❌ [SIGNUP] Error:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daftar Akun</CardTitle>
          <CardDescription>Buat akun baru untuk menggunakan MBG Calc</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Nama Lengkap</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Ulangi Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Membuat akun...' : 'Daftar'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
