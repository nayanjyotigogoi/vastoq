import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

let initialized = false
let loadedPromise: Promise<typeof google> | null = null

export function loadGoogleMaps(): Promise<typeof google> {
  if (loadedPromise) return loadedPromise

  if (!initialized) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      v: 'weekly',
      mapIds: [process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'],
    })
    initialized = true
  }

  loadedPromise = (async () => {
    // Load libraries we use in our application
    await importLibrary('maps')
    await importLibrary('marker')
    await importLibrary('geometry')
    return window.google
  })()

  return loadedPromise
}
