'use client'

import { useEffect, useState } from 'react'
import {
ArrowRight,
X,
Check,
Loader2,
Calendar,
MapPin,
} from 'lucide-react'

import {
getFurnitureItems,
createFurnitureEnquiry,
FurnitureItem,
} from '@/lib/services/furniture.service'

const DURATIONS = [
{ value: 1, label: '1 month' },
{ value: 3, label: '3 months' },
{ value: 6, label: '6 months' },
{ value: 12, label: '12 months' },
]

function EnquiryModal({
item,
onClose,
}: {
item: FurnitureItem
onClose: () => void
}) {
const [form, setForm] = useState({
name: '',
phone: '',
locality: '',
duration: 1,
date: '',
notes: '',
})

const [submitted, setSubmitted] = useState(false)
const [loading, setLoading] = useState(false)

const handleSubmit = async (
e: React.FormEvent
) => {
e.preventDefault()


try {
  setLoading(true)

  await createFurnitureEnquiry({
    furniture_id: item.id,
    name: form.name,
    phone: form.phone,
    locality: form.locality,
    message: form.notes,
  })

  setSubmitted(true)
} catch (error) {
  console.error(error)
  alert(
    'Failed to submit enquiry. Please try again.'
  )
} finally {
  setLoading(false)
}


}

return ( <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"> <div className="bg-white w-full sm:max-w-md rounded-t-[20px] sm:rounded-[18px] shadow-vastoq-lg max-h-[90vh] overflow-y-auto"> <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F0E8]"> <div> <h2 className="text-[16px] font-bold text-[#1A1814]">
Enquire to rent </h2> <p className="text-[12px] text-[#8A8480]">
{item.name} </p> </div>


      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-[#F5F0E8]"
      >
        <X size={18} />
      </button>
    </div>

    {submitted ? (
      <div className="px-5 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <Check
            size={28}
            className="text-[#1D9E75]"
          />
        </div>

        <h3 className="text-[18px] font-bold">
          Enquiry sent!
        </h3>

        <p className="text-[13px] text-[#4A4640] mt-2">
          We'll call you shortly.
        </p>

        <button
          onClick={onClose}
          className="mt-5 px-6 py-2.5 bg-[#1B2B6B] text-white rounded-[10px]"
        >
          Done
        </button>
      </div>
    ) : (
      <form
        onSubmit={handleSubmit}
        className="px-5 py-5 space-y-4"
      >
        <input
          type="text"
          placeholder="Your name"
          required
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5"
        />

        <input
          type="tel"
          placeholder="Phone number"
          required
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
          className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5"
        />

        <div className="relative">
          <MapPin
            size={14}
            className="absolute left-3 top-3 text-[#8A8480]"
          />

          <input
            type="text"
            placeholder="Locality"
            required
            value={form.locality}
            onChange={(e) =>
              setForm({
                ...form,
                locality: e.target.value,
              })
            }
            className="w-full pl-9 border border-[#E5E0D5] rounded-[8px] px-3 py-2.5"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  duration: d.value,
                })
              }
              className={`py-2 rounded-[8px] border text-xs ${
                form.duration === d.value
                  ? 'bg-[#E8ECF8] border-[#1B2B6B]'
                  : 'border-[#E5E0D5]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Calendar
            size={14}
            className="absolute left-3 top-3 text-[#8A8480]"
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            className="w-full pl-9 border border-[#E5E0D5] rounded-[8px] px-3 py-2.5"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Additional notes"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
          className="w-full border border-[#E5E0D5] rounded-[8px] px-3 py-2.5"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B2B6B] text-white py-3 rounded-[10px]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Sending...
            </span>
          ) : (
            'Send enquiry'
          )}
        </button>
      </form>
    )}
  </div>
</div>

)
}

export default function FurniturePage() {
const [items, setItems] = useState<FurnitureItem[]>([])
const [loadingItems, setLoadingItems] =
useState(true)

const [enquiryItem, setEnquiryItem] =
useState<FurnitureItem | null>(null)

useEffect(() => {
loadFurniture()
}, [])

const loadFurniture = async () => {
try {
const data = await getFurnitureItems()
setItems(data)
} catch (error) {
console.error(error)
} finally {
setLoadingItems(false)
}
}

if (loadingItems) {
return ( <div className="max-w-7xl mx-auto px-4 py-20 text-center">
Loading furniture... </div>
)
}

return ( <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"> <div className="bg-[#1B2B6B] rounded-[20px] p-8 sm:p-12 text-center mb-12"> <h1 className="text-[28px] sm:text-[36px] font-extrabold text-white mb-3">
Furnish your new home </h1>

    <p className="text-[15px] text-white/70">
      Quality furniture delivered to your door.
    </p>
  </div>

  <h2 className="text-[20px] font-bold text-[#1A1814] mb-6">
    Browse furniture
  </h2>

  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
    {items.map((item) => (
      <div
        key={item.id}
        className="group bg-white rounded-[16px] border border-[#E5E0D5] overflow-hidden"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={
              item.image_url ||
              'https://placehold.co/600x600?text=Furniture'
            }
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold">
            {item.name}
          </h3>

          <p className="text-sm text-[#8A8480] capitalize">
            {item.category.replaceAll('_', ' ')}
          </p>

          <p className="mt-2 font-semibold text-[#1B2B6B]">
            ₹{item.price_per_month}/month
          </p>

          <button
            onClick={() =>
              setEnquiryItem(item)
            }
            className="w-full mt-3 bg-[#1B2B6B] text-white py-2.5 rounded-[8px] flex items-center justify-center gap-2"
          >
            Enquire to rent
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    ))}
  </div>

  {enquiryItem && (
    <EnquiryModal
      item={enquiryItem}
      onClose={() =>
        setEnquiryItem(null)
      }
    />
  )}
</div>

)
}
