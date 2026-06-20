const steps = [
  {
    num: '01',
    title: 'Search or browse',
    description: 'Find what you need — flats, PGs, workers, or furniture — using smart filters and live map view.',
    color: 'bg-[#E8ECF8]',
    numColor: 'text-[#1B2B6B]',
  },
  {
    num: '02',
    title: 'Unlock contact',
    description: 'Pay a small one-time fee or use a coupon code to get the exact address and phone number.',
    color: 'bg-[#E1F5EE]',
    numColor: 'text-[#1D9E75]',
  },
  {
    num: '03',
    title: 'Connect directly',
    description: 'Talk directly to the owner or worker. No middlemen, no brokers, no hidden charges.',
    color: 'bg-[#FEF3DC]',
    numColor: 'text-[#E8A020]',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-[#1B2B6B] py-20 px-4 sm:px-6 relative overflow-hidden" aria-labelledby="how-heading">
      <span className="city-watermark" aria-hidden="true">VASTOQ</span>

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-12">
          <p className="label-uppercase text-white/40 mb-2">Simple · Transparent</p>
          <h2 id="how-heading" className="text-[28px] font-bold text-white">How Vastoq works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-[18px] p-6">
              <div className={`w-12 h-12 rounded-[12px] ${step.color} flex items-center justify-center mb-5`}>
                <span className={`text-[18px] font-extrabold ${step.numColor}`}>{step.num}</span>
              </div>
              <h3 className="text-[17px] font-bold text-white mb-2">{step.title}</h3>
              <p className="text-[13px] text-white/60 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
