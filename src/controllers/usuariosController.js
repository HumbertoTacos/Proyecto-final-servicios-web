import { db } from "../config/firebase.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const collection = db.collection("usuarios");

const userSchema = Joi.object({
  user_id: Joi.string().required(),
  nombre: Joi.string().min(2).required(),
  contrasena: Joi.string().min(6).required(),
  correo: Joi.string().email().required(),
  rol: Joi.string().valid("admin", "cliente").default("cliente"),
  domicilio: Joi.string().allow(""),
  id_factori: Joi.string().allow(""),
});

const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  contrasena: Joi.string().min(6).required(),
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
    const body = await userSchema.validateAsync(req.body, { stripUnknown: true });
    
    
    const emailSnap = await collection.where('correo', '==', body.correo).limit(1).get();
    if (!emailSnap.empty) {
      return res.status(409).json({ error: "El correo electrónico ya está registrado." });
    }

    const hashed = await bcrypt.hash(body.contrasena, 10);
    const toSave = { ...body, contrasena: hashed, created_at: new Date().toISOString() };
    const ref = await collection.add(toSave);

    
    const token = jwt.sign(
      { id: ref.id, rol: toSave.rol }, 
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.status(201).json({ id: ref.id, ...toSave, token: token });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    
    const body = await loginSchema.validateAsync(req.body, { stripUnknown: true });

    
    const snap = await collection.where('correo', '==', body.correo).limit(1).get();

    if (snap.empty) {
      return res.status(404).json({ error: "Usuario o contraseña incorrectos" });
    }

    const userDoc = snap.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id; 

    
    const passValida = await bcrypt.compare(body.contrasena, user.contrasena);

    if (!passValida) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    
    const token = jwt.sign(
      { id: userId, rol: user.rol }, 
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    
    res.json({ 
      message: "Login exitoso",
      token: token,
      usuario: {
        id: userId,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const partialSchema = userSchema.fork(Object.keys(userSchema.describe().keys), (s) => s.optional());
    const data = await partialSchema.validateAsync(req.body, { stripUnknown: true });
    if (data.contrasena) data.contrasena = await bcrypt.hash(data.contrasena, 10);
    await collection.doc(id).set(data, { merge: true });
    res.json({ message: "Usuario actualizado" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    await collection.doc(id).delete();
    res.json({ message: "Usuario eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
