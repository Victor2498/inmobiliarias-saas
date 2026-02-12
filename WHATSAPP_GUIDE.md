# 📱 Guía de Configuración WhatsApp - Evolution API

Esta guía te ayudará a conectar tu sistema inmobiliario con WhatsApp utilizando **Evolution API**.

## 1. Requisitos Previos

Para que la integración funcione, necesitas tener acceso a una instancia de **Evolution API**.

Puedes usar:
1.  **SaaS Gestionado**: Si ya tienes una cuenta en un proveedor como `apievolution.agentech.ar` (configurado por defecto).
2.  **Self-Hosted**: Puedes desplegar tu propia instancia usando Docker o Easypanel.

### Variables de Entorno (.env)

Asegúrate de configurar estas variables en tu archivo `.env` del backend (y en Easypanel):

```env
# URL de la API de Evolution (sin barra al final)
EVOLUTION_API_URL=https://apievolution.agentech.ar

# Tu API Key global de Evolution (para autenticarte con el servicio)
EVOLUTION_API_TOKEN=tu_token_global_aqui
```

> **Nota**: El sistema utilizará internamente el token `admin123` para el control de la instancia específica de cada inmobiliaria.

---

## 2. Proceso de Conexión en el Sistema

Una vez configurado el backend, sigue estos pasos:

1.  **Inicia Sesión** en el sistema inmobiliario.
2.  Ve al menú lateral y haz clic en **WhatsApp**.
3.  Verás el panel de estado. Si dice "Desconectado" o "No Creado", haz clic en el botón de **Conectar / Generar QR**.
4.  El sistema pedirá a Evolution API que cree una nueva instancia para tu inmobiliaria.
5.  **Escanea el QR**: Aparecerá un código QR en pantalla. Escanéalo con tu aplicación de WhatsApp (Menú > Dispositivos vinculados > Vincular un dispositivo).
6.  Una vez escaneado, el estado debería cambiar a **Conectado**.

---

## 3. Solución de Problemas

### El QR no carga o da error
*   Verifica que `EVOLUTION_API_URL` sea accesible desde el servidor donde corre el backend.
*   Verifica que `EVOLUTION_API_TOKEN` sea correcto.

### Estado "Desconectado" tras escanear
*   Dale unos segundos (10-30s) y recarga la página. La sincronización no es instantánea.
*   Revisa los logs del backend para ver si hay errores de conexión con la API.

### ¿Cómo cambio de número?
1.  En el panel de WhatsApp, haz clic en **Cerrar Sesión** (Logout).
2.  Esto eliminará la sesión en el servidor.
3.  Vuelve a generar el QR y escanea con el nuevo número.

---

## 4. Uso de la API (Para Desarrolladores)

El sistema expone los siguientes endpoints internamente:
*   `GET /api/v1/whatsapp/status`: Verifica estado.
*   `POST /api/v1/whatsapp/connect`: Crea instancia y devuelve QR.
*   `POST /api/v1/whatsapp/logout`: Cierra sesión.

---

## 5. Webhooks (Avanzado)

Para recibir mensajes entrantes, asegúrate de configurar la URL de tu backend en Evolution API apuntando a:
`https://tu-dominio-backend.com/api/v1/webhooks/whatsapp`

Esto suele configurarse automáticamente o globalmente en Evolution API.
