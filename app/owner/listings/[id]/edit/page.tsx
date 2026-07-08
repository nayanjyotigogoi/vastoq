'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import { Upload, Check, Loader2, ChevronLeft, X, Navigation } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { resolveImageUrl } from '@/lib/utils'

type FormState = {
  title: string
  propertyType: string
  bhk: string
  furnishing: string
  rent: string
  deposit: string
  areaSqft: string
  floor: string
  locality: string
  city: string
  pincode: string
  address: string
  latitude: string
  longitude: string
  ownerPhone: string
  ownerEmail: string
  genderPreference: string
  description: string
  amenities: string[]
  isBroker: boolean
}

const PROPERTY_TYPES = ['Flat', 'PG', 'Room', 'House', 'Office', 'Shop', 'Warehouse']
const FURNISHING_TYPES = ['Furnished', 'Semi-furnished', 'Unfurnished']
const BHK_OPTIONS = ['1', '2', '3', '4', '5+']
const GENDER_OPTIONS = ['any', 'male', 'female', 'family']
const AMENITY_OPTIONS = ['WiFi', 'AC', 'Generator', 'Parking', 'Water 24hr', 'Meals included', 'Security', 'Elevator', 'CCTV', 'Geyser']

type Step = 'basics' | 'details' | 'amenities' | 'photos'
const STEPS: { id: Step; label: string }[] = [
  { id: 'basics',    label: 'Property basics' },
  { id: 'details',   label: 'Pricing & details' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'photos',    label: 'Photos' },
]

// ── reverse-map API values → form display values ───────────────────────────
function toPropertyType(v: string) {
  const map: Record<string, string> = { flat: 'Flat', house: 'House', pg: 'PG', room: 'Room', shared_room: 'Room', office: 'Office', shop: 'Shop', warehouse: 'Warehouse' }
  return map[v] ?? 'Flat'
}
function toBhk(v: string) {
  const map: Record<string, string> = { '1bhk': '1', '2bhk': '2', '3bhk': '3', '4bhk': '4', '5bhk': '5+' }
  return map[v] ?? '2'
}
function toFurnishing(v: string) {
  const map: Record<string, string> = { fully_furnished: 'Furnished', semi_furnished: 'Semi-furnished', unfurnished: 'Unfurnished' }
  return map[v] ?? 'Semi-furnished'
}
function toAmenities(raw: string[]): string[] {
  const map: Record<string, string> = { wifi: 'WiFi', ac: 'AC', generator: 'Generator', parking: 'Parking', water_24hr: 'Water 24hr', meals: 'Meals included', security: 'Security', elevator: 'Elevator', cctv: 'CCTV', geyser: 'Geyser' }
  return raw.map(a => map[a] ?? a)
}

const GoogleMapPicker = dynamic(() => import('@/components/ui/GoogleMapPicker'), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full rounded-[12px] border border-[#D0C9BC] bg-[#FAFAF8]" />,
})

export default function EditListingPage() {
  const params   = useParams()
  const router   = useRouter()
  const id       = params.id as string

  const [step, setStep]                   = useState<Step>('basics')
  const [form, setForm]                   = useState<FormState | null>(null)
  const [photoUrls, setPhotoUrls]         = useState<string[]>([])
  const [loading, setLoading]             = useState(false)
  const [fetching, setFetching]           = useState(true)
  const [locating, setLocating]           = useState(false)
  const [error, setError]                 = useState('')
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photoError, setPhotoError]       = useState('')
  const [success, setSuccess]             = useState(false)

  // Load listing + user profile in parallel
  useEffect(() => {
    Promise.all([
      fetch(`/api/listings/${id}`, { credentials: 'include' }).then(r => r.json()),
      fetch('/api/auth/me',        { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([listingJson, meJson]) => {
        const l = listingJson.data?.data ?? listingJson.data ?? listingJson
        const u = meJson.data ?? {}
        setForm({
          title:            l.title ?? '',
          propertyType:     toPropertyType(l.property_type ?? ''),
          bhk:              toBhk(l.bhk_type ?? ''),
          furnishing:       toFurnishing(l.furnishing ?? ''),
          rent:             String(l.rent_per_month ?? ''),
          deposit:          String(l.deposit ?? ''),
          areaSqft:         String(l.area_sqft ?? ''),
          floor:            String(l.floor_number ?? ''),
          locality:         l.locality ?? '',
          city:             l.city ?? 'Guwahati',
          pincode:          l.pincode ?? '',
          address:          l.address ?? '',
          latitude:         String(l.latitude ?? ''),
          longitude:        String(l.longitude ?? ''),
          ownerPhone:       u.phone ?? l.owner_phone ?? '',
          ownerEmail:       u.email ?? l.owner_email ?? '',
          genderPreference: l.gender_preference ?? 'any',
          description:      l.description ?? '',
          amenities:        toAmenities(l.amenities ?? []),
          isBroker:         !!l.is_broker,
        })
        setPhotoUrls(l.photos ?? [])
      })
      .catch(() => setError('Failed to load listing.'))
      .finally(() => setFetching(false))
  }, [id])

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    if (photoUrls.length + files.length > 6) { setPhotoError('Max 6 photos per listing.'); return }
    setPhotoError('')
    setUploadingPhotos(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('photos', f))
      const res  = await fetch('/api/uploads/listing-photos', { method: 'POST', credentials: 'include', body: fd })
      const json = await res.json()
      if (!res.ok) { setPhotoError(json?.error?.message ?? 'Upload failed'); return }
      setPhotoUrls(prev => [...prev, ...(json.data?.urls ?? [])])
    } catch { setPhotoError('Network error. Try again.') }
    finally { setUploadingPhotos(false) }
  }

  const update = (key: keyof FormState, value: string | string[] | boolean) =>
    setForm(prev => prev ? { ...prev, [key]: value } : prev)

  const toggleAmenity = (a: string) => {
    if (!form) return
    const has = form.amenities.includes(a)
    update('amenities', has ? form.amenities.filter(x => x !== a) : [...form.amenities, a])
  }

  const locateOnMap = async () => {
    if (!form) return
    setLocating(true); setError('')
    try {
      const query = [form.locality, form.city, form.pincode].filter(Boolean).join(', ')
      if (!query) throw new Error('Enter locality or city first.')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) throw new Error('Google Maps API key not configured.')
      const r    = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=en&region=in`)
      const data = await r.json()
      if (data.status !== 'OK' || !data.results?.length) throw new Error('No map result found.')
      const loc = data.results[0].geometry.location
      update('latitude', String(loc.lat)); update('longitude', String(loc.lng))
    } catch (e: any) { setError(e?.message ?? 'Failed to find location.') }
    finally { setLocating(false) }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Your browser does not support location detection.'); return }
    setLocating(true); setError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        update('latitude', String(pos.coords.latitude))
        update('longitude', String(pos.coords.longitude))
        setLocating(false)
      },
      () => { setError('Unable to get your location. You can drag the map pin manually instead.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const handleSubmit = async () => {
    if (!form) return
    setLoading(true); setError('')
    try {
      const payload = {
        title:            form.title,
        description:      form.description,
        bhk_type:         ['PG','Room','Office','Shop','Warehouse'].includes(form.propertyType) ? 'na'
                          : form.bhk === '1' ? '1bhk' : form.bhk === '2' ? '2bhk'
                          : form.bhk === '3' ? '3bhk' : form.bhk === '4' ? '4bhk' : '5bhk',
        furnishing:       form.furnishing === 'Furnished' ? 'fully_furnished'
                          : form.furnishing === 'Semi-furnished' ? 'semi_furnished' : 'unfurnished',
        property_type:    form.propertyType === 'Flat' ? 'flat' : form.propertyType === 'House' ? 'house'
                          : form.propertyType === 'PG' ? 'pg' : form.propertyType === 'Room' ? 'room'
                          : form.propertyType === 'Office' ? 'office' : form.propertyType === 'Shop' ? 'shop'
                          : form.propertyType === 'Warehouse' ? 'warehouse' : 'shared_room',
        listing_class:    ['Office','Shop'].includes(form.propertyType) ? 'commercial' : 'residential',
        locality:         form.locality.trim(),
        city:             form.city.trim() || 'Guwahati',
        pincode:          form.pincode.trim(),
        address:          form.address.trim() || form.locality.trim(),
        rent_per_month:   Number(form.rent),
        deposit:          Number(form.deposit || 0),
        amenities:        form.amenities,
        photos:           photoUrls,
        area_sqft:        Number(form.areaSqft || 0),
        floor_number:     Number(form.floor || 0),
        latitude:         form.latitude ? Number(form.latitude) : undefined,
        longitude:        form.longitude ? Number(form.longitude) : undefined,
        owner_phone:      form.ownerPhone,
        owner_email:      form.ownerEmail,
        gender_preference: form.genderPreference,
        is_broker:        form.isBroker,
      }
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? 'Failed to update listing')
      setSuccess(true)
    } catch (e: any) { setError(e?.message ?? 'Failed to update listing') }
    finally { setLoading(false) }
  }

  const inputClass = 'w-full px-3.5 py-2.5 border border-[#E5E0D5] rounded-[10px] text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-[#1B2B6B] transition-all'
  const labelClass = 'block text-[12px] font-semibold text-[#1A1814] mb-1.5'
  const currentIndex = STEPS.findIndex(s => s.id === step)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {success ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-[#1D9E75]" />
            </div>
            <h1 className="text-[26px] font-extrabold text-[#1A1814] mb-3">Listing updated!</h1>
            <p className="text-[14px] text-[#4A4640] mb-8 max-w-sm mx-auto">
              Your changes have been saved. The listing is live with the updated details.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/owner/dashboard" className="px-6 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors">
                Back to dashboard
              </Link>
              <Link href={`/rentals/${id}`} className="px-6 py-3 border border-[#E5E0D5] text-[14px] font-semibold text-[#1B2B6B] rounded-[10px] hover:bg-[#E8ECF8] transition-colors">
                View listing
              </Link>
            </div>
          </div>
        ) : fetching ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-[#1B2B6B]" />
          </div>
        ) : !form ? (
          <div className="text-center py-16 text-[#D84040]">{error || 'Listing not found.'}</div>
        ) : (
          <>
            <Link href="/owner/dashboard" className="flex items-center gap-1 text-[13px] text-[#4A4640] hover:text-[#1B2B6B] mb-6 transition-colors">
              <ChevronLeft size={15} /> Owner dashboard
            </Link>

            <h1 className="text-[24px] font-extrabold text-[#1A1814] mb-2">Edit listing</h1>
            <p className="text-[13px] text-[#8A8480] mb-8">Update your listing details. Changes are saved immediately.</p>

            {/* Progress steps */}
            <div className="flex items-center gap-0 mb-8">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => setStep(s.id)}
                      className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${
                        i < currentIndex ? 'bg-[#1D9E75] text-white' : i === currentIndex ? 'bg-[#1B2B6B] text-white' : 'bg-[#E5E0D5] text-[#8A8480]'
                      }`}
                    >
                      {i < currentIndex ? <Check size={13} /> : i + 1}
                    </button>
                    <span className="text-[10px] font-medium text-[#8A8480] mt-1 hidden sm:block text-center w-16 leading-tight">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${i < currentIndex ? 'bg-[#1D9E75]' : 'bg-[#E5E0D5]'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-sm p-6 sm:p-8">
              {/* Step 1: Basics */}
              {step === 'basics' && (
                <div className="space-y-5">
                  <h2 className="text-[17px] font-bold text-[#1A1814] mb-1">Property basics</h2>
                  <div>
                    <label className={labelClass}>Listing title</label>
                    <input type="text" value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <p className={labelClass}>Property type</p>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map(t => (
                        <button key={t} type="button" onClick={() => update('propertyType', t)}
                          className={`px-3 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${form.propertyType === t ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {['Flat', 'House'].includes(form.propertyType) && (
                    <div>
                      <p className={labelClass}>BHK</p>
                      <div className="flex gap-2">
                        {BHK_OPTIONS.map(b => (
                          <button key={b} type="button" onClick={() => update('bhk', b)}
                            className={`w-12 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${form.bhk === b ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className={labelClass}>Furnishing status</p>
                    <div className="flex gap-2 flex-wrap">
                      {FURNISHING_TYPES.map(f => (
                        <button key={f} type="button" onClick={() => update('furnishing', f)}
                          className={`px-3 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${form.furnishing === f ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Locality</label>
                    <input type="text" value={form.locality} onChange={e => update('locality', e.target.value)} className={inputClass} />
                  </div>
                  <div className="rounded-[14px] border border-[#E5E0D5] bg-[#FAFAF8] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className={labelClass}>Map location</p>
                        <p className="text-[12px] text-[#6F6A63]">Update the pin for this listing.</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={locateOnMap} disabled={locating} className="px-3 py-2 rounded-[8px] border border-[#E5E0D5] text-[12px] font-semibold text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors disabled:opacity-60">
                          {locating ? 'Searching…' : 'Find on map'}
                        </button>
                        <button type="button" onClick={useCurrentLocation} disabled={locating} className="flex items-center gap-1 px-3 py-2 rounded-[8px] bg-[#1B2B6B] text-white text-[12px] font-semibold hover:bg-[#2D3E8C] transition-colors disabled:opacity-60">
                          <Navigation size={12} /> Use my GPS
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Latitude</label>
                        <input type="text" value={form.latitude} onChange={e => update('latitude', e.target.value)} className={inputClass} placeholder="26.1445" />
                      </div>
                      <div>
                        <label className={labelClass}>Longitude</label>
                        <input type="text" value={form.longitude} onChange={e => update('longitude', e.target.value)} className={inputClass} placeholder="91.7362" />
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[12px] border border-[#D0C9BC] bg-white">
                      <GoogleMapPicker
                        latitude={form.latitude ? Number(form.latitude) : 26.1445}
                        longitude={form.longitude ? Number(form.longitude) : 91.7362}
                        onPinSelect={(lat: number, lng: number) => { update('latitude', String(lat)); update('longitude', String(lng)) }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Full address</label>
                      <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Pricing */}
              {step === 'details' && (
                <div className="space-y-5">
                  <h2 className="text-[17px] font-bold text-[#1A1814] mb-1">Pricing & details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Monthly rent (₹)</label>
                      <input type="number" value={form.rent} onChange={e => update('rent', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Security deposit (₹)</label>
                      <input type="number" value={form.deposit} onChange={e => update('deposit', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Area (sqft)</label>
                      <input type="number" value={form.areaSqft} onChange={e => update('areaSqft', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Floor number</label>
                      <input type="number" value={form.floor} onChange={e => update('floor', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Owner phone</label>
                      <input type="tel" value={form.ownerPhone} readOnly className={inputClass + ' bg-[#F5F3EF] cursor-not-allowed text-[#8A8480]'} />
                      <p className="text-[11px] text-[#8A8480] mt-1">Linked to your account — edit in profile settings.</p>
                    </div>
                    <div>
                      <label className={labelClass}>Contact email</label>
                      <input type="email" value={form.ownerEmail} onChange={e => update('ownerEmail', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Preferred tenant</label>
                      <select value={form.genderPreference} onChange={e => update('genderPreference', e.target.value)} className={inputClass}>
                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows={4} value={form.description} onChange={e => update('description', e.target.value)} className={inputClass + ' resize-none'} />
                  </div>
                  <label className="flex items-center gap-3 rounded-[10px] border border-[#E5E0D5] px-3.5 py-3 text-[13px] text-[#1A1814]">
                    <input type="checkbox" checked={form.isBroker} onChange={e => update('isBroker', e.target.checked)} className="h-4 w-4 rounded border-[#D0C9BC] text-[#1B2B6B]" />
                    Mark this listing as broker-assisted
                  </label>
                </div>
              )}

              {/* Step 3: Amenities */}
              {step === 'amenities' && (
                <div>
                  <h2 className="text-[17px] font-bold text-[#1A1814] mb-1">Amenities</h2>
                  <p className="text-[12px] text-[#8A8480] mb-5">Select all that apply.</p>
                  <div className="flex flex-wrap gap-2.5">
                    {AMENITY_OPTIONS.map(a => {
                      const selected = form.amenities.includes(a)
                      return (
                        <button key={a} type="button" onClick={() => toggleAmenity(a)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] border text-[13px] font-semibold transition-colors ${selected ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'}`}>
                          {selected && <Check size={13} />}{a}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Photos */}
              {step === 'photos' && (
                <div>
                  <h2 className="text-[17px] font-bold text-[#1A1814] mb-1">Photos</h2>
                  <p className="text-[12px] text-[#8A8480] mb-5">Remove unwanted photos or upload new ones. Max 6 total.</p>

                  {photoUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {photoUrls.map(url => (
                        <div key={url} className="relative group rounded-[10px] overflow-hidden border border-[#E5E0D5] aspect-square">
                          <img src={resolveImageUrl(url)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotoUrls(prev => prev.filter(u => u !== url))}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photoUrls.length < 6 && (
                    <label htmlFor="photo-upload-edit"
                      className={`border-2 border-dashed rounded-[14px] p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${uploadingPhotos ? 'border-[#D0C9BC] opacity-60 cursor-wait' : 'border-[#D0C9BC] hover:border-[#1B2B6B] hover:bg-[#E8ECF8]/30'}`}>
                      <input id="photo-upload-edit" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={uploadingPhotos} onChange={handlePhotoSelect} />
                      <div className="w-12 h-12 rounded-full bg-[#E8ECF8] flex items-center justify-center mb-3">
                        {uploadingPhotos ? <Loader2 size={20} className="text-[#1B2B6B] animate-spin" /> : <Upload size={20} className="text-[#1B2B6B]" />}
                      </div>
                      <p className="text-[14px] font-semibold text-[#1A1814]">{uploadingPhotos ? 'Uploading…' : 'Add more photos'}</p>
                      <p className="text-[12px] text-[#8A8480]">JPG, PNG, WebP · Max ~1.9MB each</p>
                    </label>
                  )}

                  {photoError && <p className="text-[12px] text-red-600 mt-2">{photoError}</p>}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {/* Nav buttons */}
              <div className="flex gap-3 mt-8">
                {currentIndex > 0 && (
                  <button type="button" onClick={() => setStep(STEPS[currentIndex - 1].id)}
                    className="flex-1 sm:flex-none px-5 py-3 border border-[#E5E0D5] text-[14px] font-semibold text-[#1B2B6B] rounded-[10px] hover:bg-[#E8ECF8] transition-colors">
                    Back
                  </button>
                )}
                {currentIndex < STEPS.length - 1 ? (
                  <button type="button" onClick={() => setStep(STEPS[currentIndex + 1].id)}
                    className="flex-1 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors">
                    Continue
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1D9E75] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#178a64] transition-colors disabled:opacity-70">
                    {loading ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : 'Save changes'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  )
}
