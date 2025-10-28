export function esAdmin(req, res, next) {

  if (req.usuario.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
}

export default esAdmin;