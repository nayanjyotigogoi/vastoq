'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/nav/TopNav'
import MobileNav from '@/components/nav/MobileNav'
import Footer from '@/components/nav/Footer'
import { Upload, Check, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createListing } from '@/lib/services/listings.service'

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

const INITIAL: FormState = {
  title: '',
  propertyType: 'Flat',
  bhk: '2',
  furnishing: 'Semi-furnished',
  rent: '',
  deposit: '',
  areaSqft: '',
  floor: '',
  locality: '',
  city: 'Guwahati',
  pincode: '',
  address: '',
  latitude: '',
  longitude: '',
  ownerPhone: '',
  ownerEmail: '',
  genderPreference: 'any',
  description: '',
  amenities: [],
  isBroker: false,
}

type Step = 'basics' | 'details' | 'amenities' | 'photos' | 'success'

const GoogleMapPicker = dynamic(() => import('@/components/ui/GoogleMapPicker'), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full rounded-[12px] border border-[#D0C9BC] bg-[#FAFAF8]" />,
})

const STEPS: { id: Step; label: string }[] = [
  { id: 'basics', label: 'Property basics' },
  { id: 'details', label: 'Pricing & details' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'photos', label: 'Photos' },
]

export default function NewListingPage() {
  const [step, setStep] = useState<Step>('basics')
  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!form.latitude || !form.longitude) return
    const lat = Number(form.latitude)
    const lng = Number(form.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setForm((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }))
    }
  }, [form.latitude, form.longitude])

  const currentIndex = STEPS.findIndex((s) => s.id === step)

  const update = (key: keyof FormState, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleAmenity = (a: string) => {
    const has = form.amenities.includes(a)
    update('amenities', has ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])
  }

  const locateOnMap = async () => {
    try {
      setLocating(true)
      setError('')

      const query = [form.locality, form.city, form.pincode].filter(Boolean).join(', ')

      if (!query) {
        throw new Error('Enter a locality or city first to search the map location.')
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) throw new Error('Google Maps API key not configured.')

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=en&region=in`
      )

      if (!response.ok) {
        throw new Error('Could not resolve the location on the map.')
      }

      const data = await response.json()

      if (data.status !== 'OK' || !data.results?.length) {
        throw new Error('No map result found for this address. Try a more specific locality.')
      }

      const place = data.results[0]
      const loc   = place.geometry.location
      update('latitude',  String(loc.lat))
      update('longitude', String(loc.lng))
      update('address', form.address || place.formatted_address)
    } catch (err: any) {
      setError(err?.message || 'Failed to find the map location.')
    } finally {
      setLocating(false)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      return
    }

    setLocating(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        update('latitude', String(position.coords.latitude))
        update('longitude', String(position.coords.longitude))
        setLocating(false)
      },
      () => {
        setError('Unable to use your current location. You can enter the address manually instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const profileRes = await fetch('/api/auth/me')

      if (!profileRes.ok) {
        throw new Error('Unable to load user profile')
      }

      const profileJson = await profileRes.json()

      const user =
        profileJson.data?.user ??
        profileJson.data

      if (!user?.id) {
        throw new Error('Unable to determine logged in user')
      }

      const payload = {
        owner_id: user.id,

        title: form.title,

        description: form.description,

        bhk_type:
          ['PG', 'Room', 'Office', 'Shop', 'Warehouse'].includes(form.propertyType)
            ? 'other'
            : form.bhk === '1'
            ? '1bhk'
            : form.bhk === '2'
            ? '2bhk'
            : form.bhk === '3'
            ? '3bhk'
            : form.bhk === '4'
            ? '4bhk'
            : '5bhk',

        furnishing:
          form.furnishing === 'Furnished'
            ? 'fully_furnished'
            : form.furnishing === 'Semi-furnished'
            ? 'semi_furnished'
            : 'unfurnished',

        property_type:
          form.propertyType === 'Flat'
            ? 'flat'
            : form.propertyType === 'House'
            ? 'house'
            : form.propertyType === 'PG'
            ? 'pg'
            : form.propertyType === 'Room'
            ? 'room'
            : form.propertyType === 'Office'
            ? 'office'
            : form.propertyType === 'Shop'
            ? 'shop'
            : form.propertyType === 'Warehouse'
            ? 'warehouse'
            : 'shared_room',

        listing_class:
          form.propertyType === 'Office' || form.propertyType === 'Shop'
            ? 'commercial'
            : 'residential',

        locality: form.locality.trim(),
        city: form.city.trim() || 'Guwahati',
        pincode: form.pincode.trim(),
        address: form.address.trim() || form.locality.trim(),

        rent_per_month: Number(form.rent),
        deposit: Number(form.deposit || 0),
        amenities: form.amenities,
        photos: [],
        area_sqft: Number(form.areaSqft || 0),
        floor_number: Number(form.floor || 0),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        owner_phone: form.ownerPhone || user.phone || '',
        owner_email: form.ownerEmail || user.email || '',
        gender_preference: form.genderPreference.toLowerCase(),
        is_broker: Boolean(form.isBroker),
      }

      await createListing(payload)

      setStep('success')

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create listing'
      )

    } finally {

      setLoading(false)

    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 border border-[#E5E0D5] rounded-[10px] text-[14px] text-[#1A1814] placeholder:text-[#8A8480] focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]/30 focus:border-[#1B2B6B] transition-all'
  const labelClass = 'block text-[12px] font-semibold text-[#1A1814] mb-1.5'

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopNav />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {step === 'success' ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-[#1D9E75]" />
            </div>
            <h1 className="text-[26px] font-extrabold text-[#1A1814] mb-3">Listing submitted!</h1>
            <p className="text-[14px] text-[#4A4640] leading-relaxed mb-8 max-w-sm mx-auto">
              Your listing is under review. We will make it live within 24 hours and notify you by SMS.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/owner/dashboard"
                className="px-6 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
              >
                Go to dashboard
              </Link>
              <button
                onClick={() => { setForm(INITIAL); setStep('basics') }}
                className="px-6 py-3 border border-[#E5E0D5] text-[14px] font-semibold text-[#1B2B6B] rounded-[10px] hover:bg-[#E8ECF8] transition-colors"
              >
                Add another listing
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Back link */}
            <Link
              href="/owner/dashboard"
              className="flex items-center gap-1 text-[13px] text-[#4A4640] hover:text-[#1B2B6B] mb-6 transition-colors"
            >
              <ChevronLeft size={15} /> Owner dashboard
            </Link>

            <h1 className="text-[24px] font-extrabold text-[#1A1814] mb-2">Post a new listing</h1>
            <p className="text-[13px] text-[#8A8480] mb-8">Fill in the details below. Your listing goes live after a quick review.</p>

            {/* Progress steps */}
            <div className="flex items-center gap-0 mb-8">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-all ${
                        i < currentIndex
                          ? 'bg-[#1D9E75] text-white'
                          : i === currentIndex
                          ? 'bg-[#1B2B6B] text-white'
                          : 'bg-[#E5E0D5] text-[#8A8480]'
                      }`}
                    >
                      {i < currentIndex ? <Check size={13} /> : i + 1}
                    </div>
                    <span className="text-[10px] font-medium text-[#8A8480] mt-1 hidden sm:block text-center w-16 leading-tight">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${i < currentIndex ? 'bg-[#1D9E75]' : 'bg-[#E5E0D5]'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="bg-white rounded-[20px] border border-[#E5E0D5] shadow-vastoq-sm p-6 sm:p-8">
              {/* Step 1: Basics */}
              {step === 'basics' && (
                <div className="space-y-5">
                  <h2 className="text-[17px] font-bold text-[#1A1814] mb-1">Property basics</h2>

                  <div>
                    <label className={labelClass} htmlFor="title">Listing title <span className="text-[#D84040]">*</span></label>
                    <input id="title" type="text" placeholder='e.g. "2BHK Furnished Flat near GMCH"' value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} required />
                  </div>

                  <div>
                    <p className={labelClass}>Property type <span className="text-[#D84040]">*</span></p>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map((t) => (
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
                        {BHK_OPTIONS.map((b) => (
                          <button key={b} type="button" onClick={() => update('bhk', b)}
                            className={`w-12 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${form.bhk === b ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className={labelClass}>Furnishing status <span className="text-[#D84040]">*</span></p>
                    <div className="flex gap-2 flex-wrap">
                      {FURNISHING_TYPES.map((f) => (
                        <button key={f} type="button" onClick={() => update('furnishing', f)}
                          className={`px-3 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${form.furnishing === f ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="locality">Locality <span className="text-[#D84040]">*</span></label>
                    <input id="locality" type="text" placeholder='e.g. "Paltan Bazar"' value={form.locality} onChange={(e) => update('locality', e.target.value)} className={inputClass} required />
                  </div>

                  <div className="rounded-[14px] border border-[#E5E0D5] bg-[#FAFAF8] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className={labelClass}>Map location</p>
                        <p className="text-[12px] text-[#6F6A63]">Search the address, then auto-fill latitude/longitude for the listing pin.</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={locateOnMap} disabled={locating} className="px-3 py-2 rounded-[8px] border border-[#E5E0D5] text-[12px] font-semibold text-[#1B2B6B] hover:bg-[#E8ECF8] transition-colors disabled:opacity-60">{locating ? 'Searching…' : 'Find on map'}</button>
                        <button type="button" onClick={useCurrentLocation} disabled={locating} className="px-3 py-2 rounded-[8px] bg-[#1B2B6B] text-white text-[12px] font-semibold hover:bg-[#2D3E8C] transition-colors disabled:opacity-60">Use my location</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} htmlFor="latitude">Latitude</label>
                        <input id="latitude" type="text" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} className={inputClass} placeholder="26.1445" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="longitude">Longitude</label>
                        <input id="longitude" type="text" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} className={inputClass} placeholder="91.7362" />
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-[#D0C9BC] bg-white p-3 text-[12px] text-[#4A4640]">
                      {form.latitude && form.longitude
                        ? `Pinned location preview: ${Number(form.latitude).toFixed(5)}, ${Number(form.longitude).toFixed(5)}`
                        : 'Pin will appear here after you search or use your current location.'}
                    </div>
                    <div className="overflow-hidden rounded-[12px] border border-[#D0C9BC] bg-white">
                      <GoogleMapPicker
                        latitude={form.latitude ? Number(form.latitude) : 26.1445}
                        longitude={form.longitude ? Number(form.longitude) : 91.7362}
                        onPinSelect={(lat: number, lng: number) => {
                          update('latitude', String(lat))
                          update('longitude', String(lng))
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} htmlFor="city">City <span className="text-[#D84040]">*</span></label>
                      <input id="city" type="text" placeholder="Guwahati" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="pincode">Pincode</label>
                      <input id="pincode" type="text" placeholder="781001" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="address">Full address</label>
                      <input id="address" type="text" placeholder="House no., lane, landmark" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
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
                      <label className={labelClass} htmlFor="rent">Monthly rent (₹) <span className="text-[#D84040]">*</span></label>
                      <input id="rent" type="number" placeholder="e.g. 12000" value={form.rent} onChange={(e) => update('rent', e.target.value)} className={inputClass} min="0" required />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="deposit">Security deposit (₹) <span className="text-[#D84040]">*</span></label>
                      <input id="deposit" type="number" placeholder="e.g. 24000" value={form.deposit} onChange={(e) => update('deposit', e.target.value)} className={inputClass} min="0" required />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="area">Area (sqft)</label>
                      <input id="area" type="number" placeholder="e.g. 850" value={form.areaSqft} onChange={(e) => update('areaSqft', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="floor">Floor number</label>
                      <input id="floor" type="number" placeholder="0 = ground" value={form.floor} onChange={(e) => update('floor', e.target.value)} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="ownerPhone">Owner phone</label>
                      <input id="ownerPhone" type="tel" placeholder="10-digit number" value={form.ownerPhone} onChange={(e) => update('ownerPhone', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="ownerEmail">Owner email</label>
                      <input id="ownerEmail" type="email" placeholder="owner@example.com" value={form.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="genderPreference">Preferred tenant</label>
                      <select id="genderPreference" value={form.genderPreference} onChange={(e) => update('genderPreference', e.target.value)} className={inputClass}>
                        {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="desc">Description</label>
                    <textarea
                      id="desc"
                      rows={4}
                      placeholder="Describe the property — key highlights, nearby landmarks, rules for tenants..."
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      className={inputClass + ' resize-none'}
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-[10px] border border-[#E5E0D5] px-3.5 py-3 text-[13px] text-[#1A1814]">
                    <input
                      type="checkbox"
                      checked={form.isBroker}
                      onChange={(e) => setForm((prev) => ({ ...prev, isBroker: e.target.checked }))}
                      className="h-4 w-4 rounded border-[#D0C9BC] text-[#1B2B6B] focus:ring-[#1B2B6B]"
                    />
                    Mark this listing as broker-assisted
                  </label>
                </div>
              )}

              {/* Step 3: Amenities */}
              {step === 'amenities' && (
                <div>
                  <h2 className="text-[17px] font-bold text-[#1A1814] mb-1">Amenities</h2>
                  <p className="text-[12px] text-[#8A8480] mb-5">Select all that apply. This helps tenants filter their search.</p>
                  <div className="flex flex-wrap gap-2.5">
                    {AMENITY_OPTIONS.map((a) => {
                      const selected = form.amenities.includes(a)
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleAmenity(a)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] border text-[13px] font-semibold transition-colors ${
                            selected ? 'border-[#1B2B6B] bg-[#E8ECF8] text-[#1B2B6B]' : 'border-[#E5E0D5] text-[#4A4640] hover:border-[#1B2B6B]'
                          }`}
                        >
                          {selected && <Check size={13} />}
                          {a}
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
                  <p className="text-[12px] text-[#8A8480] mb-5">Listings with photos get 5x more unlocks. Add at least 3 good photos.</p>
                  <div className="border-2 border-dashed border-[#D0C9BC] rounded-[14px] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1B2B6B] hover:bg-[#E8ECF8]/30 transition-all">
                    <div className="w-14 h-14 rounded-full bg-[#E8ECF8] flex items-center justify-center mb-3">
                      <Upload size={22} className="text-[#1B2B6B]" />
                    </div>
                    <p className="text-[14px] font-semibold text-[#1A1814] mb-1">Click to upload photos</p>
                    <p className="text-[12px] text-[#8A8480]">JPG, PNG up to 10MB each · Max 12 photos</p>
                    <p className="text-[11px] text-[#D0C9BC] mt-3 italic">Photo upload available after backend integration</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {/* Nav buttons */}
              <div className="flex gap-3 mt-8">
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(STEPS[currentIndex - 1].id)}
                    className="flex-1 sm:flex-none px-5 py-3 border border-[#E5E0D5] text-[14px] font-semibold text-[#1B2B6B] rounded-[10px] hover:bg-[#E8ECF8] transition-colors"
                  >
                    Back
                  </button>
                )}
                {currentIndex < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(STEPS[currentIndex + 1].id)}
                    className="flex-1 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1B2B6B] text-white text-[14px] font-bold rounded-[10px] hover:bg-[#2D3E8C] transition-colors disabled:opacity-70"
                  >
                    {loading ? <><Loader2 size={17} className="animate-spin" /> Submitting...</> : 'Submit listing'}
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
