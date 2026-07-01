import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
}

export interface ListingFilters {
  search?: string

  city?: string
  locality?: string

  property_type?: string
  bhk_type?: string
  furnishing?: string

  gender_preference?: string

  verified_only?: string | boolean

  sort?: string

  min_rent?: number
  max_rent?: number

  page?: number
  per_page?: number

  user_id?: string
}

export async function listListings(
  filters: ListingFilters = {}
) {
  const response = await axios.get(
    `${API_URL}/listings`,
    {
      params: filters,
    }
  );

  return response.data;
}

export async function getListing(
  id: number | string
) {
  const response = await axios.get(
    `${API_URL}/listings/${id}`
  );

  return response.data;
}

export async function createListing(
  payload: any
) {
  const response = await axios.post(
    `${API_URL}/listings`,
    payload,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

export async function updateListing(
  id: number | string,
  payload: any,
  token?: string
) {
  const response = await axios.put(
    `${API_URL}/listings/${id}`,
    payload,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
}

export async function deleteListing(
  id: number | string,
  token?: string
) {
  const response = await axios.delete(
    `${API_URL}/listings/${id}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
}

export async function getMyListings(
  ownerId: string
) {
  const response = await axios.get(
    `${API_URL}/listings/my-listings`,
    {
      params: {
        owner_id: ownerId,
      },
    }
  )

  return response.data
}

export const getOwnerListings = getMyListings;

export async function unlockListing(
  id: number | string,
  payload: {
    coupon_code?: string;
    payment_id?: string;
  },
  token?: string
) {
  const response = await axios.post(
    `${API_URL}/listings/${id}/unlock`,
    payload,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
}
