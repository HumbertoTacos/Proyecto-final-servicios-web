import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import productosRoutes from "./routes/productosRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, service: "tienda-backend" }));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en http://localhost:" + PORT));
