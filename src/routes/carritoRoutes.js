import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/carritoController.js";
import { verificarToken } from "../Middleware/auth.js"; 
const router = Router();
router.get("/", verificarToken, getAll);
router.post("/", verificarToken, create);
router.put("/:id", verificarToken, update);
router.delete("/:id", verificarToken, remove);
export default router;
