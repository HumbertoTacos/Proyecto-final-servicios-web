# Tienda Backend (Express + Firebase Firestore + Facturapi)
Backend funcional para proyecto de tienda en línea (tipo Amazon/MercadoLibre).

## Requisitos
- Node 18+
- Firebase Service Account (JSON)
- Variables de entorno (crear `.env` en la raíz):

```
PORT=3000
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=tu_project_id
FACTURAPI_KEY=sk_test_XXXX   # Llave secreta de Facturapi
```

> Coloca tu archivo de credenciales de Firebase como `serviceAccountKey.json` en la raíz del proyecto.

## Instalar y ejecutar
```bash
npm install
npm run dev   # o npm start
```

## Endpoints principales

### Usuarios
- `GET /api/usuarios`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

### Productos
- `GET /api/productos`
- `POST /api/productos`  -> Crea producto en Facturapi y guarda en Firestore
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `POST /api/productos/importar` -> Trae catálogo paginado desde Facturapi y lo guarda en Firestore

### Carrito
- `GET /api/carrito`
- `POST /api/carrito` -> Calcula subtotal, IVA y total; referencia usuario/productos
- `PUT /api/carrito/:id`
- `DELETE /api/carrito/:id`

## Nota sobre Facturapi
Se consume `https://www.facturapi.io/v2/products` con autenticación `Bearer FACTURAPI_KEY`.
El precio puede incluir impuestos (`tax_included: true`) y, si no se especifica otro impuesto, se asume IVA 16%.
