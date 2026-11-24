

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST required" });
  }

  try {
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "OpenAI API key is not configured"
      });
    }

    const { image, mimeType, kind } = req.body || {};
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

    const prompt = kind === 'prosperity' ? `Analyze visible palm features for a Millionaire & Prosperity Reading, purely as folklore entertainment. Discuss traditional money triangle, sun and fate lines, ambition and entrepreneurial symbolism, and three reflective affirmations. If markings are unclear say so; never invent markings or infer actual financial ability, future wealth, income or investment outcomes. Use plain text headings, 250–350 words, and a disclaimer that palmistry cannot predict wealth.` : `Analyze this palm photograph using
traditional palmistry for entertainment.
Describe visible heart, head, life and fate lines.
If features are unclear, say so.
Do not predict health, lifespan or real events.
Give a concise personalized reading of 250 to 350 words total. Cover all four lines, even if some are unclear. Use plain text, no Markdown symbols. Put each line heading on its own line. Finish every section and explain that palmistry is not scientifically validated.`;
    const response = await fetch("https://api.openai.com/v1/responses",{
      method:"POST",signal:AbortSignal.timeout(45000),
      headers:{"Content-Type":"application/json",Authorization:"Bearer "+key.trim()},
      body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",store:false,max_output_tokens:1800,input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:"data:"+mimeType+";base64,"+base64,detail:"high"}]}]})
    });
    if(!response.ok){console.error("OpenAI status:",response.status);return res.status(502).json({error:response.status===429?"AI quota exceeded. Please try later.":"AI reading temporarily unavailable."});}
    const data=await response.json();
    const reading=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n").trim();
    if(!reading)return res.status(502).json({error:"No reading returned"});
    return res.status(200).json({reading});
  }catch(error){console.error("Scanner error:",error.name);return res.status(500).json({error:"Scanner unavailable"});}
}
