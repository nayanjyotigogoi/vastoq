'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res = await fetch('/api/auth/me')

      if (!res.ok) return

      const json = await res.json()

      setForm({
        name: json.data.name ?? '',
        email: json.data.email ?? '',
        phone: json.data.phone ?? '',
        role: json.data.role ?? '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

    async function saveProfile() {
    try {
        setSaving(true)

        setSuccessMessage('')
        setErrorMessage('')

        const res = await fetch(
        '/api/auth/update-profile',
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            }),
        }
        )

        const json = await res.json()

        if (!res.ok) {
        setErrorMessage(
            json.message || 'Failed to save profile'
        )
        return
        }

        setSuccessMessage(
        'Profile updated successfully.'
        )

        await loadProfile()

    } catch (err) {

        console.error(err)

        setErrorMessage(
        'Something went wrong. Please try again.'
        )

    } finally {

        setSaving(false)

    }
    }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-[18px] border border-[#E5E0D5] shadow-vastoq-sm p-6">
          <h1 className="text-[24px] font-bold text-[#1A1814] mb-6">
            Edit Profile
          </h1>

          <div className="space-y-5">

            <div>
                <label
                htmlFor="name"
                className="block text-[13px] font-semibold mb-2"
                >
                Full Name
                </label>

                <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) =>
                    setForm({
                    ...form,
                    name: e.target.value,
                    })
                }
                className="w-full border border-[#E5E0D5] rounded-[12px] px-4 py-3 outline-none focus:border-[#1B2B6B]"
                />
            </div>

            <div>
            <label
            htmlFor="email"
            className="block text-[13px] font-semibold mb-2"
            >
            Email Address
            </label>

            <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) =>
                setForm({
                ...form,
                email: e.target.value,
                })
            }
            className="w-full border border-[#E5E0D5] rounded-[12px] px-4 py-3 outline-none focus:border-[#1B2B6B]"
            />
            </div>

            <div>
            <label
            htmlFor="phone"
            className="block text-[13px] font-semibold mb-2"
            >
            Phone Number
            </label>

            <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) =>
                setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                })
            }
            placeholder="10-digit mobile number"
            className="w-full border border-[#E5E0D5] rounded-[12px] px-4 py-3 outline-none focus:border-[#1B2B6B]"
            />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-[13px] font-semibold mb-2"
                >
                Role
                </label>

                <input
                id="role"
                type="text"
                value={form.role}
                disabled
                className="w-full border border-[#E5E0D5] rounded-[12px] px-4 py-3 bg-gray-100 cursor-not-allowed capitalize"
                />
            </div>
                {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[12px] text-sm">
                    {successMessage}
                </div>
                )}

                {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-sm">
                    {errorMessage}
                </div>
                )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-[#1B2B6B] text-white px-6 py-3 rounded-[12px] font-semibold hover:bg-[#243A8A] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={() => router.back()}
                className="border border-[#E5E0D5] px-6 py-3 rounded-[12px] font-semibold"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </div>
  )
}