import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'

interface Props {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-[28px] font-extrabold text-[#1A1814] mb-2">{title}</h1>
        <p className="text-[12px] text-[#8A8480] mb-10">Last updated: {lastUpdated}</p>

        <div
          className="
            text-[14px] text-[#4A4640] leading-relaxed
            [&>h2]:text-[17px] [&>h2]:font-bold [&>h2]:text-[#1A1814] [&>h2]:mt-9 [&>h2]:mb-3
            [&>h3]:text-[14px] [&>h3]:font-bold [&>h3]:text-[#1A1814] [&>h3]:mt-5 [&>h3]:mb-2
            [&>p]:mb-4
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul]:space-y-1.5
            [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol]:space-y-1.5
            [&_a]:text-[#1B2B6B] [&_a]:font-semibold [&_a]:hover:underline
            [&_strong]:text-[#1A1814] [&_strong]:font-semibold
          "
        >
          {children}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
