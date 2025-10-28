export function calcTotals(items) {
  // items: [{ price, quantity, taxRate }]  taxRate default 0.16
  let subtotal = 0;
  let iva = 0;
  for (const it of items) {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 0;
    const rate = (typeof it.taxRate === "number") ? it.taxRate : 0.16;
    const lineSubtotal = price * qty;
    const lineIva = lineSubtotal * rate;
    subtotal += lineSubtotal;
    iva += lineIva;
  }
  const total = subtotal + iva;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
