import { db } from "../config/firebase.js";
import Joi from "joi";
import { createFacturapiProduct, listFacturapiProducts } from "../services/facturapiService.js";

const collection = db.collection("productos");

const productoSchema = Joi.object({
  nombre: Joi.string().required(),
  marca: Joi.string().allow(""),
  stock: Joi.number().integer().min(0).default(0),
  precio: Joi.number().min(0).required(),
  id: Joi.string().allow(""),
  categoria: Joi.string().allow(""),
  url_img: Joi.string().uri().allow(""),
  codesay: Joi.string().allow(""),
  // opciones de facturapi
  product_key: Joi.string().default("60131324"),
  unit_key: Joi.string().default("H87"),
  tax_included: Joi.boolean().default(true),
  tax_rate: Joi.number().valid(0, 0.08, 0.16).default(0.16),
});

export async function getAll(req, res) {
  try {
    const snap = await collection.get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const body = await productoSchema.validateAsync(req.body, { stripUnknown: true });
    // Crea producto en Facturapi
    const facturi = await createFacturapiProduct({
      description: body.nombre,
      price: body.precio,
      unit_key: body.unit_key,
      product_key: body.product_key,
      tax_included: body.tax_included,
      taxes: body.tax_rate ? [{ type: "IVA", rate: body.tax_rate }] : [{ type: "IVA", rate: 0.16 }],
    });

    const toSave = {
      ...body,
      id_factori: facturi.id, // ID de Facturapi
      taxes: facturi.taxes || [{ type: "IVA", rate: body.tax_rate ?? 0.16 }],
      created_at: new Date().toISOString(),
    };
    const ref = await collection.add(toSave);
    res.status(201).json({ id: ref.id, ...toSave });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const partial = await productoSchema.fork(Object.keys(productoSchema.describe().keys), (s)=>s.optional()).validateAsync(req.body, { stripUnknown: true });
    await collection.doc(id).set(partial, { merge: true });
    res.json({ message: "Producto actualizado" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    await collection.doc(id).delete();
    res.json({ message: "Producto eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function importar(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const data = await listFacturapiProducts({ page });
    const batch = db.batch();
    (data.data || []).forEach(p => {
      const ref = collection.doc(p.id);
      batch.set(ref, {
        id_factori: p.id,
        nombre: p.description,
        precio: p.price,
        taxes: p.taxes,
        product_key: p.product_key,
        unit_key: p.unit_key,
        tax_included: p.tax_included,
        created_from: "facturapi",
        updated_at: new Date().toISOString(),
      }, { merge: true });
    });
    await batch.commit();
    res.json({ imported: (data.data || []).length, page });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
