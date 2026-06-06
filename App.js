import { useState, useEffect, useRef } from "react";

const SUGGESTIONS = [
  "என் தக்காளி இலைகள் மஞ்சளாகின்றன 🍅",
  "நெல் பயிருக்கு எப்போது தண்ணீர் பாய்ச்சணும்? 🌾",
  "வெங்காயத்திற்கு நல்ல விலை எப்போது கிடைக்கும்? 🧅",
  "இயற்கையாக பூச்சி கட்டுப்படுத்துவது எப்படி? 🌿",
  "ஜூன் மாதம் என்ன பயிர் போடலாம்? ☀️",
  "என் வாழை மரம் தண்டு அழுகுகிறது 🍌",
];

const WELCOME = {
  role: "assistant",
  content: `வணக்கம்! 🌱 **AgriSense AI**-க்கு வரவேற்கிறோம்

நான் உங்கள் விவசாய உதவியாளர் — தமிழ்நாட்டு விவசாயிகளுக்காக, குறிப்பாக பெண் விவசாயிகளுக்காக உருவாக்கப்பட்டவன்.

நான் உதவுவேன்:
• 🌾 **பயிர் நோய் கண்டறிதல்** — அறிகுறிகள் சொல்லுங்கள் அல்லது படம் அனுப்புங்கள்
• 🌦️ **நீர்ப்பாசன ஆலோசனை** — பருவகாலத்திற்கு ஏற்ப வழிகாட்டுதல்
• 💰 **சந்தை விலை வழிகாட்டுதல்** — நியாயமான விலை பெற உதவுவேன்
• 🧑‍🌾 **விவசாய குறிப்புகள்** — மண், உரம், இயற்கை முறைகள்

உங்கள் விவசாயம் பற்றி சொல்லுங்கள்! என்ன பயிர் போட்டிருக்கீங்க? 🌿`,
};

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const [uploadedImage, setUploadedImage] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(iv);
  }, [loading]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(",")[1];
      setUploadedImage({ base64, previewUrl: dataUrl, mediaType: file.type || "image/jpeg" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if ((!userText && !uploadedImage) || loading) return;
    setInput("");

    const displayContent = userText || "படம் அனுப்பியுள்ளேன் — இந்த பயிரில் என்ன பிரச்சனை?";
    const userMsg = { role: "user", content: displayContent, imagePreview: uploadedImage?.previewUrl || null };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const imgToSend = uploadedImage;
    setUploadedImage(null);
    setLoading(true);

    try {
      // Build API messages - exclude welcome, handle images
      const apiMessages = newMessages
        .filter(m => m !== WELCOME)
        .map((m, idx, arr) => {
          const isLastUser = m.role === "user" && idx === arr.length - 1 && imgToSend;
          if (isLastUser) {
            return {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: imgToSend.mediaType, data: imgToSend.base64 } },
                { type: "text", text: m.content },
              ],
            };
          }
          return { role: m.role, content: m.content };
        });

      // 🔒 Call our secure backend — API key never leaves the server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ இணைப்பில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const canSend = (input.trim() || uploadedImage) && !loading;

  return (
    <div style={s.root}>
      <div style={s.bg1} /><div style={s.bg2} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logoArea}>
          <span style={s.logoIcon}>🌾</span>
          <div>
            <div style={s.logoTitle}>AgriSense AI</div>
            <div style={s.logoSub}>விவசாய உதவியாளர் · தமிழ்நாடு</div>
          </div>
        </div>
        <div style={s.badge}>🟢 இயங்குகிறது</div>
      </header>

      {/* Chat */}
      <div style={s.chat}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...s.row, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={s.av}>🌱</div>}
            <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="பயிர்" style={s.sentImg} />}
              <div style={msg.role === "user" ? s.userBubble : s.aiBubble} dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
            </div>
            {msg.role === "user" && <div style={s.uav}>👩‍🌾</div>}
          </div>
        ))}
        {loading && (
          <div style={{ ...s.row, justifyContent: "flex-start" }}>
            <div style={s.av}>🌱</div>
            <div style={s.aiBubble}><span style={s.thinking}>AgriSense யோசிக்கிறது{dots}</span></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 2 && (
        <div style={s.chipsWrap}>
          <div style={s.chipsRow}>
            {SUGGESTIONS.map((sg, i) => (
              <button key={i} style={s.chip} onClick={() => sendMessage(sg)}>{sg}</button>
            ))}
          </div>
        </div>
      )}

      {/* Image preview */}
      {uploadedImage && (
        <div style={s.previewBar}>
          <img src={uploadedImage.previewUrl} alt="preview" style={s.previewThumb} />
          <span style={s.previewLabel}>படம் தயார் — கேள்வி கேளுங்கள் அல்லது நேரடியாக அனுப்புங்கள்</span>
          <button onClick={() => setUploadedImage(null)} style={s.removeBtn}>✕</button>
        </div>
      )}

      {/* Input */}
      <div style={s.inputArea}>
        <div style={s.inputWrap}>
          <button style={s.uploadBtn} onClick={() => fileInputRef.current?.click()}>📷</button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <textarea
            style={s.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="உங்கள் பயிர், வானிலை, சந்தை விலை பற்றி கேளுங்கள்..."
            rows={1}
          />
          <button style={{ ...s.sendBtn, opacity: canSend ? 1 : 0.4 }} onClick={() => sendMessage()} disabled={!canSend}>➤</button>
        </div>
        <div style={s.footer}>AgriSense AI · தமிழ்நாடு விவசாயிகளுக்காக 🌾</div>
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Noto Sans Tamil', Latha, Georgia, serif", height: "100vh", display: "flex", flexDirection: "column", background: "#0a1a0e", color: "#e8f5e0", position: "relative", overflow: "hidden" },
  bg1: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(34,85,34,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(20,60,20,0.3) 0%, transparent 60%)", pointerEvents: "none" },
  bg2: { position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%2322aa44' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "rgba(10,30,12,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(100,200,80,0.2)", zIndex: 10 },
  logoArea: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 32 },
  logoTitle: { fontSize: 20, fontWeight: "bold", color: "#7ee87a", letterSpacing: "0.04em" },
  logoSub: { fontSize: 11, color: "#5a9954" },
  badge: { background: "rgba(50,120,40,0.3)", border: "1px solid rgba(100,200,80,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#7ee87a" },
  chat: { flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, zIndex: 1 },
  row: { display: "flex", alignItems: "flex-end", gap: 8 },
  av: { fontSize: 22, flexShrink: 0, background: "rgba(50,120,40,0.25)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(100,200,80,0.2)" },
  uav: { fontSize: 22, flexShrink: 0, background: "rgba(200,150,20,0.2)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(220,180,40,0.3)" },
  aiBubble: { background: "rgba(20,55,18,0.8)", border: "1px solid rgba(100,200,80,0.18)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", fontSize: 14, lineHeight: 1.8, color: "#d4f0cc", backdropFilter: "blur(6px)" },
  userBubble: { background: "linear-gradient(135deg, rgba(80,160,50,0.7), rgba(50,120,30,0.8))", border: "1px solid rgba(120,220,80,0.3)", borderRadius: "16px 16px 4px 16px", padding: "12px 16px", fontSize: 14, lineHeight: 1.8, color: "#e8ffe0" },
  sentImg: { maxWidth: 200, maxHeight: 160, borderRadius: 12, border: "2px solid rgba(120,220,80,0.4)", objectFit: "cover" },
  thinking: { color: "#7ee87a", fontStyle: "italic", fontSize: 13 },
  chipsWrap: { padding: "0 16px 8px", zIndex: 1 },
  chipsRow: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" },
  chip: { flexShrink: 0, background: "rgba(30,80,20,0.5)", border: "1px solid rgba(100,200,80,0.25)", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#9de88a", cursor: "pointer", whiteSpace: "nowrap" },
  previewBar: { display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(15,45,12,0.9)", borderTop: "1px solid rgba(100,200,80,0.15)", zIndex: 5 },
  previewThumb: { width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(120,220,80,0.4)", flexShrink: 0 },
  previewLabel: { flex: 1, fontSize: 12, color: "#9de88a", lineHeight: 1.4 },
  removeBtn: { background: "rgba(200,60,60,0.3)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "50%", width: 26, height: 26, color: "#ff9090", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  inputArea: { padding: "10px 16px 14px", background: "rgba(10,25,10,0.9)", borderTop: "1px solid rgba(100,200,80,0.15)", backdropFilter: "blur(12px)", zIndex: 10 },
  inputWrap: { display: "flex", alignItems: "flex-end", gap: 8, background: "rgba(20,55,18,0.6)", border: "1px solid rgba(100,200,80,0.25)", borderRadius: 14, padding: "8px 10px" },
  uploadBtn: { background: "rgba(40,100,30,0.4)", border: "1px solid rgba(100,200,80,0.2)", borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  textarea: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#e8f5e0", fontSize: 14, lineHeight: 1.5, fontFamily: "'Noto Sans Tamil', Latha, Georgia, serif", resize: "none", minHeight: 22, maxHeight: 100 },
  sendBtn: { background: "linear-gradient(135deg, #4caf30, #2d7a1a)", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 16, color: "#fff", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  footer: { textAlign: "center", fontSize: 10, color: "#3a6630", marginTop: 8 },
};
