import { notFound } from 'next/navigation'
import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import WorkerProfile from '@/components/worker/WorkerProfile'
import type { Worker } from '@/components/worker/WorkerCard'

interface Props { params: Promise<{ id: string }> }

async function fetchWorker(id: string): Promise<Worker | null> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res  = await fetch(`${base}/api/workers/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const w    = json?.data?.data?.worker ?? json?.data?.worker ?? json?.data
    if (!w) return null
    return {
      id              : String(w.id),
      name            : w.name ?? '',
      avatar          : w.photo_url ?? undefined,
      category        : w.category ?? '',
      skills          : Array.isArray(w.skills) ? w.skills : [],
      localities      : Array.isArray(w.service_areas) && w.service_areas.length
                          ? w.service_areas
                          : w.locality ? [w.locality] : [],
      hourlyRate      : w.rate_per_day ?? 0,
      ratingAvg       : parseFloat(w.rating ?? 0),
      ratingCount     : w.review_count ?? 0,
      jobsCompleted   : w.jobs_completed ?? 0,
      isVerified      : w.is_verified ?? false,
      isAvailableToday: w.available_today ?? false,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const worker  = await fetchWorker(id)
  return {
    title: worker
      ? `${worker.name} — ${worker.category} — Vastoq`
      : 'Worker — Vastoq',
    description: worker
      ? `Hire ${worker.name}, verified ${worker.category}. ₹${worker.hourlyRate}/day. ${worker.ratingAvg}★ rating.`
      : undefined,
  }
}

export default async function WorkerProfilePage({ params }: Props) {
  const { id } = await params
  const worker  = await fetchWorker(id)
  if (!worker) notFound()

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main>
        <WorkerProfile worker={worker} />
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
