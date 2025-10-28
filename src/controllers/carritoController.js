import { db } from "../config/firebase.js";
import Joi from "joi";
import { calcTotals } from "../utils/calc.js";

const collection = db.collection("carrito");
const productosCol = db.collection("productos");
const usuariosCol = db.collection("usuarios");

const cartSchema = Joi.object({
  usuarioId: Joi.string().required(),
  productos: Joi.array().items(Joi.object({
    productoId: Joi.string().required(),
    cantidad: Joi.number().integer().min(1).default(1),
  })).min(1).required(),
  pagado: Joi.boolean().default(false),
  id_stripe: Joi.string().allow(""),
  id_factori: Joi.string().allow(""),
});

async function loadItems(productos) {
  const items = [];
  for (const it of productos) {
    const snap = await productosCol.doc(it.productoId).get();
    if (!snap.exists) continue;
    const prod = snap.data();
    items.push({
      productId: it.productoId,
      name: prod.nombre,
      price: Number(prod.precio) || 0,
      quantity: it.cantidad,
      taxRate: Array.isArray(prod.taxes) && prod.taxes[0]?.rate != null ? Number(prod.taxes[0].rate) : 0.16,
    });
  }
  return items;
}

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
    const body = await cartSchema.validateAsync(req.body, { stripUnknown: true });

    // validar usuario existe
    const user = await usuariosCol.doc(body.usuarioId).get();
    if (!user.exists) return res.status(400).json({ error: "Usuario no encontrado" });

    // cargar productos con precio e IVA
    const items = await loadItems(body.productos);
    if (!items.length) return res.status(400).json({ error: "Productos no válidos" });

    const totals = calcTotals(items.map(x => ({ price: x.price, quantity: x.quantity, taxRate: x.taxRate })));

    const toSave = {
      ...body,
      items,
      subtotal: totals.subtotal,
      iva: totals.iva,
      total: totals.total,
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
    const partial = await cartSchema.fork(Object.keys(cartSchema.describe().keys), (s)=>s.optional()).validateAsync(req.body, { stripUnknown: true });
    // Recomputa si cambiaron productos
    let recompute = false;
    if (partial.productos) recompute = true;

    let extra = {};
    if (recompute) {
      const items = await loadItems(partial.productos);
      const totals = calcTotals(items.map(x => ({ price: x.price, quantity: x.quantity, taxRate: x.taxRate })));
      extra = { items, subtotal: totals.subtotal, iva: totals.iva, total: totals.total };
    }
    await collection.doc(id).set({ ...partial, ...extra, updated_at: new Date().toISOString() }, { merge: true });
    res.json({ message: "Carrito actualizado" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    await collection.doc(id).delete();
    res.json({ message: "Carrito eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
