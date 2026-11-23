

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST required" });
  }

  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "Gemini API key is not configured"
      });
    }

    const { image, mimeType } = req.body || {};
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(mimeType) || typeof image !== "string") {
      return res.status(400).json({
        error: "Invalid palm image"
      });
    }

    const base64 = image.replace(
      /^data:image\/(?:jpeg|png|webp);base64,/,
      ""
    );

    if (
      !base64 ||
      base64.length > 5000000 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
    ) {
      return res.status(400).json({
        error: "Image too large or invalid"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this palm photograph using
traditional palmistry for entertainment.
Describe visible heart, head, life and fate lines.
If features are unclear, say so.
Do not predict health, lifespan or real events.
Give a personalized reading and explain that
palmistry is not scientifically validated.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini HTTP status:", response.status);
      return res.status(502).json({
        error: "Gemini request failed"
      });
    }

    const data = await response.json();

    const reading = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("\n")
      .trim();

    if (!reading) {
      return res.status(502).json({
        error: "No reading returned"
      });
    }

    return res.status(200).json({ reading });

  } catch (error) {
    console.error("Scanner error:", error);
    return res.status(500).json({
      error: "Scanner unavailable"
    });
  }
}

