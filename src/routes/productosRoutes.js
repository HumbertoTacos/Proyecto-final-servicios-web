import { Router } from "express";
import { getAll, create, update, remove, importar } from "../controllers/productosController.js";
import { verificarToken } from "../Middleware/auth.js";
import { esAdmin } from "../Middleware/admin.js";


const router = Router();
// Rutas protegidas para administración de productos
router.post("/", verificarToken, esAdmin, create);
router.put("/:id", verificarToken, esAdmin, update);
router.delete("/:id", verificarToken, esAdmin, remove);
router.post("/importar", verificarToken, esAdmin, importar); 
// Ruta pública para obtener todos los productos
router.get("/", getAll);
export default router;
