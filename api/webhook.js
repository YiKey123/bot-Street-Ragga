import { botData } from './datos.js';

const { VERIFY_TOKEN, WHATSAPP_TOKEN, PHONE_NUMBER_ID } = process.env;

// Función para truncar textos según límites de Meta
const truncate = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) : text;
};

// Función para enviar mensajes a WhatsApp API
const sendWhatsAppMessage = async (data) => {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
};

export default async function handler(req, res) {
  // GET: Verificación de Webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Token de verificación inválido' });
    }
  }

  // POST: Manejo de Mensajes entrantes
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Número del usuario

        // Ignorar eventos de estado o tipos no soportados
        if (message.type !== 'text' && message.type !== 'interactive' && message.type !== 'image' && message.type !== 'document') {
           return res.status(200).send('EVENT_RECEIVED');
        }

        // Comprobantes
        if (message.type === 'image' || message.type === 'document') {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: botData.mensaje_comprobante }
          });
          return res.status(200).send('EVENT_RECEIVED');
        }

        let payload = "";
        
        if (message.type === 'interactive') {
            const interactive = message.interactive;
            if (interactive.type === 'button_reply') {
                payload = interactive.button_reply.id;
            } else if (interactive.type === 'list_reply') {
                payload = interactive.list_reply.id;
            }
        } else if (message.type === 'text') {
            // Cualquier texto va al menu principal
            payload = "menu_principal";
        }

        // Lógica de navegación
        if (payload === "menu_principal") {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "interactive",
            interactive: {
              type: "button",
              body: { text: botData.bienvenida },
              action: {
                buttons: [
                  { type: "reply", reply: { id: "menu_cursos", title: truncate("📚 Cursos y Horarios", 20) } },
                  { type: "reply", reply: { id: "menu_talleres", title: truncate("🔥 Talleres", 20) } },
                  { type: "reply", reply: { id: "menu_precios", title: truncate("💳 Precios e Inscr.", 20) } }
                ]
              }
            }
          });
        } 
        else if (payload === "menu_cursos") {
          const rows = Object.values(botData.cursos).map(curso => ({
            id: truncate(curso.id, 200),
            title: truncate(curso.nombre, 24),
            description: truncate(curso.descripcion, 72)
          }));

          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "interactive",
            interactive: {
              type: "list",
              body: { text: "Aquí tienes nuestra lista de cursos regulares. Selecciona uno para ver sus horarios:" },
              action: {
                button: truncate("Ver Cursos", 20),
                sections: [
                  {
                    title: truncate("Cursos Disponibles", 24),
                    rows: rows
                  }
                ]
              }
            }
          });
        }
        else if (payload.startsWith("curso_")) {
           const curso = botData.cursos[payload];
           if (curso) {
               const text = `*${curso.nombre}*\n\n🗓️ Horario: ${curso.horario}\n📊 Nivel: ${curso.nivel}`;
               await sendWhatsAppMessage({
                messaging_product: "whatsapp",
                to: from,
                type: "interactive",
                interactive: {
                  type: "button",
                  body: { text: text },
                  action: {
                    buttons: [
                      { type: "reply", reply: { id: "menu_precios", title: truncate("💳 Mensualidades", 20) } },
                      { type: "reply", reply: { id: "menu_cursos", title: truncate("📚 Otros cursos", 20) } },
                      { type: "reply", reply: { id: "menu_principal", title: truncate("🏠 Menú Principal", 20) } }
                    ]
                  }
                }
              });
           }
        }
        else if (payload === "menu_talleres") {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "interactive",
            interactive: {
              type: "button",
              body: { text: botData.talleres },
              action: {
                buttons: [
                  { type: "reply", reply: { id: "menu_precios", title: truncate("💳 Precios e Inscr.", 20) } },
                  { type: "reply", reply: { id: "menu_principal", title: truncate("🏠 Menú Principal", 20) } }
                ]
              }
            }
          });
        }
        else if (payload === "menu_precios") {
           await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "interactive",
            interactive: {
              type: "button",
              body: { text: botData.precios },
              action: {
                buttons: [
                  { type: "reply", reply: { id: "ver_ubicacion", title: truncate("📍 Ver Ubicación", 20) } },
                  { type: "reply", reply: { id: "menu_principal", title: truncate("🏠 Menú Principal", 20) } }
                ]
              }
            }
          });
        }
        else if (payload === "ver_ubicacion") {
          await sendWhatsAppMessage({
            messaging_product: "whatsapp",
            to: from,
            type: "location",
            location: {
              latitude: botData.ubicacion.lat,
              longitude: botData.ubicacion.lon,
              name: botData.ubicacion.nombre,
              address: botData.ubicacion.direccion
            }
          });
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.sendStatus(404);
    }
  }

  // Método no permitido
  return res.status(405).json({ error: "Método no permitido" });
}
