import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.status(401).json({ error: 'Acceso denegado. Se necesita token.' });
  }try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; 
    next(); 
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

export default verificarToken;