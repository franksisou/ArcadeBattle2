# 🎮 ArcadeBattle2 - Deploy en Render

## 📋 Pasos para hacer deploy GRATIS en Render

### 1. **Subir el código a GitHub**

```bash
git add .
git commit -m "Preparar proyecto para deploy en Render"
git push origin main
```

### 2. **Crear cuenta en Render**

- Ve a https://render.com
- Crea una cuenta (puedes usar GitHub)

### 3. **Crear base de datos MySQL gratis**

**Opción A: Usar FreeSQLDatabase.com**

1. Ve a https://www.freesqldatabase.com
2. Crea una base de datos gratuita
3. Guarda las credenciales:
   - Host
   - Database Name
   - Username
   - Password
   - Port

**Opción B: Usar db4free.net**

1. Ve a https://db4free.net
2. Regístrate y crea una base de datos
3. Guarda las credenciales

**Opción C: Usar Aiven (Recomendado - 1GB gratis)**

1. Ve a https://aiven.io
2. Crea cuenta gratuita
3. Crear servicio MySQL (plan gratuito)

### 4. **Importar la base de datos**

Conéctate a tu base de datos remota y ejecuta el archivo `database_complete.sql`:

```bash
mysql -h TU_HOST -u TU_USER -p TU_DATABASE < database_complete.sql
```

O usa **MySQL Workbench** o **phpMyAdmin** si están disponibles.

### 5. **Deploy del Backend en Render**

1. En Render Dashboard, click **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:

   - **Name:** `arcadebattle-backend`
   - **Region:** Oregon (Free)
   - **Branch:** main
   - **Root Directory:** Dejar vacío
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`
   - **Plan:** Free

4. Agregar **Environment Variables**:

   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=tu_clave_secreta_super_segura_aqui_12345
   DB_HOST=tu_host_mysql
   DB_PORT=3306
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   DB_NAME=arcade_battle
   ```

5. Click **"Create Web Service"**

6. Espera a que termine el deploy (5-10 min)

7. **Copia la URL** del backend (ejemplo: `https://arcadebattle-backend.onrender.com`)

### 6. **Deploy del Frontend en Render**

1. Click **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio
3. Configura:

   - **Name:** `arcadebattle-frontend`
   - **Branch:** main
   - **Root Directory:** Dejar vacío
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`

4. Agregar **Environment Variable**:

   ```
   REACT_APP_API_URL=https://TU-BACKEND-URL.onrender.com
   ```

   (Reemplaza con la URL que copiaste del backend)

5. Click **"Create Static Site"**

6. Espera a que termine el deploy

### 7. **¡Listo! 🎉**

Tu aplicación estará disponible en:

- **Frontend:** `https://arcadebattle-frontend.onrender.com`
- **Backend:** `https://arcadebattle-backend.onrender.com`

---

## ⚠️ Limitaciones del plan gratuito de Render:

- El backend se "duerme" después de 15 minutos de inactividad
- Tarda ~30 segundos en "despertar" en la primera petición
- 750 horas gratis al mes (suficiente para un proyecto personal)

---

## 🔧 Troubleshooting

### Si el frontend no conecta con el backend:

1. Verifica que la variable `REACT_APP_API_URL` esté correcta
2. Asegúrate de que el backend esté corriendo (visita la URL del backend)
3. Revisa los logs en Render Dashboard

### Si hay errores de base de datos:

1. Verifica las credenciales en las variables de entorno
2. Asegúrate de haber ejecutado `database_complete.sql`
3. Verifica que la base de datos permita conexiones externas

---

## 📱 Actualizar el proyecto

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Render detectará los cambios y hará el deploy automáticamente.

---

## 🌐 Alternativas gratuitas:

### Para el Frontend:

- **Vercel:** https://vercel.com (Recomendado)
- **Netlify:** https://netlify.com
- **GitHub Pages:** https://pages.github.com

### Para el Backend + DB:

- **Cyclic:** https://cyclic.sh
- **Glitch:** https://glitch.com

---

## 📞 Soporte

Si tienes problemas, revisa:

1. Logs en Render Dashboard
2. Consola del navegador (F12)
3. Variables de entorno correctas
