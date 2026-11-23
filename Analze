
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "Gemini API key is not configured"
      });
    }

    const { image, mimeType } = req.body || {};

    if (!image || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return res.status(400).json({
        error: "Upload a JPEG, PNG or WebP palm photo"
      });
    }

    const base64 = image.replace(
      /^data:image\/(?:jpeg|png|webp);base64,/,
      ""
    );

    if (base64.length > 5_000_000 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
      return res.status(400).json({
        error: "Invalid or oversized image"
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
                text: `You are PalmMystic, a palmistry-inspired
entertainment reader. Examine this palm photograph.
Describe only features you can actually see.
Discuss the heart, head, life and fate lines
using traditional palmistry interpretations.
If a line is unclear, say so.
Do not invent visible details or predict actual
health, lifespan, wealth or future events.
Write a warm, personalized reading with headings.
State that palmistry is for entertainment
and reflection, not scientific prediction.`
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
            temperature: 0.6,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", response.status);
      return res.status(502).json({
        error: "Palm analysis service unavailable"
      });
    }

    const reading = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

    if (!reading) {
      return res.status(502).json({
        error: "No reading returned"
      });
    }

    return res.status(200).json({ reading });

  } catch (error) {
    console.error("Scanner failure:", error.message);
    return res.status(500).json({
      error: "Unable to analyze palm"
    });
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "Gemini API key is not configured"
      });
    }

    const { image, mimeType } = req.body || {};

    if (!image || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return res.status(400).json({
        error: "Upload a JPEG, PNG or WebP palm photo"
      });
    }

    const base64 = image.replace(
      /^data:image\/(?:jpeg|png|webp);base64,/,
      ""
    );

    if (base64.length > 5_000_000 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
      return res.status(400).json({
        error: "Invalid or oversized image"
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
                text: `You are PalmMystic, a palmistry-inspired
entertainment reader. Examine this palm photograph.
Describe only features you can actually see.
Discuss the heart, head, life and fate lines
using traditional palmistry interpretations.
If a line is unclear, say so.
Do not invent visible details or predict actual
health, lifespan, wealth or future events.
Write a warm, personalized reading with headings.
State that palmistry is for entertainment
and reflection, not scientific prediction.`
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
            temperature: 0.6,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", response.status);
      return res.status(502).json({
        error: "Palm analysis service unavailable"
      });
    }

    const reading = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

    if (!reading) {
      return res.status(502).json({
        error: "No reading returned"
      });
    }

    return res.status(200).json({ reading });

  } catch (error) {
    console.error("Scanner failure:", error.message);
    return res.status(500).json({
      error: "Unable to analyze palm"
    });
  }
}
