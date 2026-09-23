import { api } from "../../../services/api";
import type { MedicineDetail, MedicineListResponse } from "../types";

export async function getMedicines(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const response = await api.get<MedicineListResponse>("/medicines", {
    params,
  });

  return response.data;
}

export async function getMedicineById(id: string) {
  const response = await api.get<{
    success: boolean;
    data: MedicineDetail;
  }>(`/medicines/${encodeURIComponent(id)}`);

  return response.data;
}
