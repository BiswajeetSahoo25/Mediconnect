import { api } from "./api";

export interface UserAddress {
  id: string;
  userId: string;
  addressId: string;
  addressType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  address: {
    id: string;
    addressLine1: string;
    addressLine2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export interface UserAddressesResponse {
  status: "success";
  data: UserAddress[];
}

export interface UserAddressResponse {
  status: "success";
  data: UserAddress;
}

export interface CreateUserAddressInput {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  addressType?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

export interface UpdateUserAddressInput {
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  addressType?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

export async function getAddresses(): Promise<UserAddressesResponse> {
  const response = await api.get<UserAddressesResponse>("/users/me/addresses/");

  return response.data;
}

export async function createAddress(
  data: CreateUserAddressInput,
): Promise<UserAddressResponse> {
  const response = await api.post<UserAddressResponse>(
    "/users/me/addresses/",
    data,
  );

  return response.data;
}

export async function updateAddress(
  id: string,
  data: UpdateUserAddressInput,
): Promise<UserAddressResponse> {
  const response = await api.patch<UserAddressResponse>(
    `/users/me/addresses/${encodeURIComponent(id)}`,
    data,
  );

  return response.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/users/me/addresses/${encodeURIComponent(id)}`);
}
