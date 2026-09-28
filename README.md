# Bot de WhatsApp para Street Ragga

Este es un chatbot automatizado (Serverless) para WhatsApp Cloud API, diseñado para desplegarse gratuitamente en Vercel. Todo el contenido y configuración se edita de manera sencilla en GitHub.

## Cómo editar horarios y datos desde el celular
1. Abre este repositorio en GitHub desde tu celular.
2. Navega al archivo `api/datos.js`.
3. Haz clic en el ícono del lápiz (✏️) para editar.
4. Modifica los horarios, precios o textos respetando las comillas.
5. Guarda los cambios haciendo clic en "Commit changes...". ¡Vercel actualizará el bot automáticamente en unos segundos!

## Despliegue en Vercel
1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Añade un nuevo proyecto e importa este repositorio.
3. En Environment Variables (Variables de Entorno), añade:
   - `VERIFY_TOKEN`: Un token inventado por ti (ej. `mi_token_secreto_123`).
   - `WHATSAPP_TOKEN`: El token de acceso temporal o permanente de Meta for Developers.
   - `PHONE_NUMBER_ID`: El ID del número de teléfono en Meta.
4. Haz clic en Deploy.

## Configuración en Meta for Developers
1. Ve a tu app en [Meta for Developers](https://developers.facebook.com/).
2. En la configuración de WhatsApp > Configuración, edita el Webhook.
3. **URL de devolución de llamada:** Usa la URL de tu proyecto Vercel añadiendo `/api/webhook` al final. (Ej. `https://tu-proyecto.vercel.app/api/webhook`).
4. **Token de verificación:** El mismo `VERIFY_TOKEN` que pusiste en Vercel.
5. Suscríbete a los eventos `messages`.
