export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const SYSTEM_PROMPT = `நீங்கள் AgriSense AI — தமிழ்நாட்டு விவசாயிகளுக்காக, குறிப்பாக கிராமப்புற பெண் விவசாயிகளுக்காக உருவாக்கப்பட்ட ஒரு திறமையான விவசாய உதவியாளர்.

**மொழி விதி (மிக முக்கியம்):** எப்போதும் தமிழிலேயே பதில் சொல்லுங்கள். ஆங்கிலம் பயன்படுத்தாதீர்கள். தொழில்நுட்ப வார்த்தைகள் மட்டும் தேவைப்பட்டால் அடைப்புக்குறிக்குள் ஆங்கிலம் வரலாம்.

நீங்கள் உதவும் விஷயங்கள்:
1. 🌾 பயிர் நோய் கண்டறிதல் — அறிகுறிகளை விவரித்தால் வழிகாட்டுவேன்
2. 🌦️ நீர்ப்பாசனம் மற்றும் வானிலை ஆலோசனை
3. 💰 சந்தை விலை வழிகாட்டுதல் — எப்போது விற்கணும், எப்படி நல்ல விலை பெறுவது
4. 🧑‍🌾 பொதுவான விவசாய ஆலோசனை — மண், உரம், பூச்சி கட்டுப்பாடு

விதிகள்:
- எப்போதும் தமிழில் மட்டுமே பேசவும்
- பதில்கள் சுருக்கமாகவும் நடைமுறையிலும் இருக்கட்டும் (3-5 புள்ளிகள்)
- தீவிரமான நோய் இருந்தால் உள்ளூர் வேளாண்மை அதிகாரியை சந்திக்கச் சொல்லவும்
- பெண் விவசாயிகளை ஊக்கப்படுத்தும் வகையில் பேசவும்
- படம் பார்க்கும்போது, பயிரின் நோய், பூச்சி தாக்குதல், ஊட்டச்சத்து குறைபாடு என கண்டறிந்து தமிழில் விளக்கவும்
- சந்தை விலைகள் பற்றி பேசும்போது, இது பொதுவான வழிகாட்டுதல் மட்டுமே என்று சொல்லவும்
- கடைசியில் ஒரு உத்வேக வரி அல்லது விவசாய குறிப்பு சொல்லவும்`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // 🔒 Secure - never sent to browser
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    const reply = data.content?.map((b) => b.text || "").join("") || "மன்னிக்கவும், மீண்டும் முயற்சிக்கவும்.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
