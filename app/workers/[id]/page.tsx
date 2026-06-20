import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import WorkerProfile from '@/components/worker/WorkerProfile'
import { MOCK_WORKERS } from '@/lib/mock-data'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const worker = MOCK_WORKERS.find((w) => w.id === id)
  return {
    title: worker ? `${worker.name} — ${worker.category} in Guwahati — Vastoq` : 'Worker — Vastoq',
    description: worker ? `Hire ${worker.name}, verified ${worker.category} in Guwahati. ₹${worker.hourlyRate}/hr. ${worker.ratingAvg}★ rating.` : undefined,
  }
}

export default async function WorkerProfilePage({ params }: Props) {
  const { id } = await params
  const worker = MOCK_WORKERS.find((w) => w.id === id) ?? MOCK_WORKERS[0]

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
