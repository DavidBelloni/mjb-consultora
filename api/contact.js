export default async function handler(req, res) {
  if (req.method === "POST") {
    // Log básico para confirmar que la función se ejecuta
    console.log("Función contact.js ejecutada");

    // Respuesta mínima en JSON
    res.status(200).json({ message: "Funciona!" });
  } else {
    // Si alguien hace GET u otro método
    res.status(405).json({ error: "Método no permitido" });
  }
}

