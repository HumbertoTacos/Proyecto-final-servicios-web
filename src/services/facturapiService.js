import axios from "axios";

const BASE_URL = "https://www.facturapi.io/v2";

export const facturapi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.FACTURAPI_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function createFacturapiProduct({ description, price, unit_key = "H87", product_key = "60131324", tax_included = true, taxes = [{ type: "IVA", rate: 0.16 }] }) {
  const { data } = await facturapi.post("/products", {
    description,
    price,
    unit_key,
    product_key,
    tax_included,
    taxes,
  });
  return data;
}

export async function listFacturapiProducts({ page = 1, q = "" } = {}) {
  const { data } = await facturapi.get("/products", { params: { page, q } });
  return data;
}
