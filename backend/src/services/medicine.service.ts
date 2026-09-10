import { env } from "../config/env.js";
import { NotFoundError, ServiceError } from "../errors/http-errors.js";
import type { MedicineDetail, MedicinePreview } from "../types/medicine.js";
import type { ListMedicinesQuery } from "../validators/medicine.validator.js";

const OPENFDA_BASE_URL = "https://api.fda.gov/drug/label.json";

interface OpenFDARawLabel {
  id?: string;
  set_id?: string;
  spl_id?: string;
  openfda?: {
    application_number?: string[];
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_ndc?: string[];
    product_type?: string[];
    route?: string[];
    dosage_form?: string[];
    substance_name?: string[];
    rxcui?: string[];
    spl_id?: string[];
    spl_set_id?: string[];
    pharm_class_moa?: string[];
    pharm_class_pe?: string[];
    pharm_class_cs?: string[];
    pharm_class_epc?: string[];
  };
  active_ingredient?: string[];
  inactive_ingredient?: string[];
  purpose?: string[];
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  storage_and_handling?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  contraindications?: string[];
  adverse_reactions?: string[];
  drug_interactions?: string[];
  description?: string[];
  proprietary_name?: string[];
  package_label_principal_display_panel?: string[];
  do_not_use?: string[];
  ask_doctor?: string[];
  ask_doctor_or_pharmacist?: string[];
  stop_use?: string[];
  pregnancy_or_breast_feeding?: string[];
  keep_out_of_reach_of_children?: string[];
}

interface OpenFDAPage {
  meta: {
    results: {
      total: number;
    };
  };
  results: OpenFDARawLabel[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MedicineService {
  private async fetchFromOpenFDA(url: string, retries = 3): Promise<OpenFDAPage> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const fetchOptions: RequestInit = {
          signal: controller.signal,
        };

        const urlObj = new URL(url);
        if (env.openfdaApiKey) {
          urlObj.searchParams.set("api_key", env.openfdaApiKey);
        }

        const response = await fetch(urlObj.toString(), fetchOptions);
        clearTimeout(timeoutId);

        console.log(`[MedicineService] openFDA request: ${urlObj.toString().replace(/api_key=.*/, 'api_key=REDACTED')}`);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error(`[MedicineService] openFDA auth error: ${response.status}`);
            throw new ServiceError(
              "Invalid openFDA API key or authentication failed.",
              500,
            );
          }

          if (response.status === 429) {
            const waitTime = Math.min(2 ** attempt * 1000, 10000);
            console.warn(`[MedicineService] openFDA rate limited, retrying in ${waitTime}ms`);
            await sleep(waitTime);
            continue;
          }

          if (response.status === 404) {
            throw new NotFoundError("Medicine not found");
          }

          throw new ServiceError(
            `openFDA API error: ${response.status} ${response.statusText}`,
            503,
          );
        }

        const data = (await response.json()) as OpenFDAPage;
        return data;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        lastError =
          error instanceof Error
            ? error
            : new Error("Unknown error fetching from openFDA");

        if (attempt === retries) {
          throw new ServiceError(
            "Unable to reach openFDA. Please try again later.",
            503,
            lastError,
          );
        }

        const waitTime = Math.min(2 ** attempt * 1000, 5000);
        await sleep(waitTime);
      }
    }

    throw lastError ?? new ServiceError("Unknown error", 503);
  }

  private hasValidName(raw: OpenFDARawLabel): boolean {
    const openfda = raw.openfda ?? {};

    const brandName = openfda.brand_name?.[0]?.trim();
    const genericName = openfda.generic_name?.[0]?.trim();

    return !!(brandName || genericName);
  }

  private mapToMedicinePreview(raw: OpenFDARawLabel): MedicinePreview {
    const openfda = raw.openfda ?? {};

    const brandName = openfda.brand_name?.[0]?.trim();
    const genericName = openfda.generic_name?.[0]?.trim();

    const name = brandName ?? genericName;

    return {
      id: raw.id ?? "",
      name,
      genericName: genericName ?? undefined,
      manufacturer: openfda.manufacturer_name?.[0]?.trim() ?? undefined,
      dosageForm: openfda.dosage_form?.[0]?.trim() ?? undefined,
      route: openfda.route?.[0]?.trim() ?? undefined,
      source: "FDA",
    };
  }

  private extractText(field: string[] | undefined): string | undefined {
    if (!field || field.length === 0) return undefined;
    return field.map((s) => s.trim()).filter((s) => s.length > 0).join("\n\n");
  }

  private extractIngredients(raw: OpenFDARawLabel): string[] {
    const openfda = raw.openfda ?? {};
    const ingredients: string[] = [];

    const substanceNames = openfda.substance_name ?? [];
    const activeIngredients = raw.active_ingredient ?? [];

    for (const name of substanceNames) {
      const trimmed = name.trim();
      if (trimmed && !ingredients.includes(trimmed)) {
        ingredients.push(trimmed);
      }
    }

    for (const item of activeIngredients) {
      const trimmed = item.trim();
      if (trimmed && !ingredients.includes(trimmed)) {
        ingredients.push(trimmed);
      }
    }

    if (ingredients.length === 0) {
      if (openfda.generic_name?.length) {
        ingredients.push(...openfda.generic_name);
      }
      if (openfda.brand_name?.length) {
        const brandName = openfda.brand_name[0] ?? "";
        if (brandName && !ingredients.includes(brandName)) {
          ingredients.push(brandName);
        }
      }
    }

    return ingredients.slice(0, 10);
  }

  async searchMedicines(query: ListMedicinesQuery): Promise<{
    data: MedicinePreview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const url = new URL(OPENFDA_BASE_URL);
    url.searchParams.set("limit", String(limit + 1));
    url.searchParams.set("skip", String(skip));

    if (search && search.trim()) {
      const searchTerm = search.trim().replace(/\s+/g, " ");
      const encodedTerm = encodeURIComponent(searchTerm);
      const searchExpression = `(openfda.brand_name:"${encodedTerm}" OR openfda.generic_name:"${encodedTerm}")`;
      url.searchParams.set("search", searchExpression);
    }

    const data = await this.fetchFromOpenFDA(url.toString());

    const filteredResults = data.results.filter((raw) => this.hasValidName(raw));

    const hasMore = filteredResults.length > limit;
    const results = hasMore ? filteredResults.slice(0, limit) : filteredResults;

    const medicines: MedicinePreview[] = results.map((raw) =>
      this.mapToMedicinePreview(raw),
    );

    const total = data.meta.results.total;
    const effectiveTotal = Math.max(total, filteredResults.length);
    const totalPages = Math.ceil(effectiveTotal / limit);

    return {
      data: medicines,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getMedicineById(id: string): Promise<MedicineDetail> {
    const url = new URL(OPENFDA_BASE_URL);
    url.searchParams.set("search", `id:"${encodeURIComponent(id)}"`);
    url.searchParams.set("limit", "1");

    const data = await this.fetchFromOpenFDA(url.toString());

    if (data.results.length === 0) {
      throw new NotFoundError("Medicine not found");
    }

    const raw = data.results[0];

    if (!raw || !this.hasValidName(raw)) {
      throw new NotFoundError("Medicine not found");
    }

    const openfda = raw.openfda ?? {};

    return {
      id: raw.id ?? "",
      name: raw.proprietary_name?.[0]?.trim() ?? openfda.brand_name?.[0]?.trim() ?? openfda.generic_name?.[0]?.trim() ?? "",
      genericName: openfda.generic_name?.[0] ?? undefined,
      brandName: openfda.brand_name?.[0] ?? undefined,
      manufacturer: openfda.manufacturer_name?.[0] ?? undefined,
      dosageForm: openfda.dosage_form?.[0] ?? undefined,
      route: openfda.route?.[0] ?? undefined,
      activeIngredients: this.extractIngredients(raw),
      indications: this.extractText(raw.indications_and_usage ?? raw.purpose),
      dosageAndAdministration: this.extractText(raw.dosage_and_administration),
      warnings: this.extractText(
        raw.warnings ?? raw.warnings_and_cautions,
      ),
      contraindications: this.extractText(raw.contraindications),
      adverseReactions: this.extractText(raw.adverse_reactions),
      drugInteractions: this.extractText(raw.drug_interactions),

      storageAndHandling: this.extractText(raw.storage_and_handling),
      inactiveIngredients: raw.inactive_ingredient?.map((s) => s.trim()).filter(Boolean),
      productNdc: openfda.product_ndc?.[0] ?? undefined,
      splId: openfda.spl_id?.[0] ?? undefined,
      splSetId: openfda.spl_set_id?.[0] ?? undefined,
      pharmClassMoa: openfda.pharm_class_moa?.join(", "),
      pharmClassPe: openfda.pharm_class_pe?.join(", "),
      pharmClassCs: openfda.pharm_class_cs?.join(", "),
      productType: openfda.product_type?.[0] ?? undefined,
      principalDisplayPanel: this.extractText(raw.package_label_principal_display_panel),
      source: "FDA",
    };
  }
}

export default new MedicineService();
