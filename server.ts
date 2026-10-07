import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

// In-memory persistent database store initialized with initial data
import { INITIAL_HIT_SPOTS, INITIAL_REVIEWS, DEMO_USERS } from "./src/data/mockData.ts";
import { DirectMessage, PublicChatMessage, PublicChatState, UserProfile } from "./src/types.ts";

let hitSpots = [...INITIAL_HIT_SPOTS];
let reviews = [...INITIAL_REVIEWS];
let users: UserProfile[] = [...DEMO_USERS];

// Real-time Server-Sent Events (SSE) clients for instant multi-user sync
const sseClients = new Set<express.Response>();

function broadcastEvent(eventName: string, payload: any) {
  const dataString = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Direct Messages between members
let directMessages: DirectMessage[] = [
  {
    id: "dm-1",
    senderId: "user-2",
    senderName: "Έλενα Βασιλείου",
    senderAvatar: DEMO_USERS[1].avatarUrl,
    receiverId: "user-1",
    content: "Καλησπέρα Κώστα! Σκεφτόμαστε να κατέβουμε Χανιά το Σαββατοκύριακο, να κλείσουμε τραπέζι στο Χρυσόστομο;",
    createdAt: "18:20"
  },
  {
    id: "dm-2",
    senderId: "user-1",
    senderName: "Κώστας Παπαγεωργίου",
    senderAvatar: DEMO_USERS[0].avatarUrl,
    receiverId: "user-2",
    content: "Καλησπέρα Έλενα! Οπωσδήποτε, και να ζητήσετε το αρνάκι τσιγαριαστό και τη στάκα!",
    createdAt: "18:24"
  },
  {
    id: "dm-3",
    senderId: "user-3",
    senderName: "Μανώλης Κατσανεβάκης",
    senderAvatar: DEMO_USERS[2].avatarUrl,
    receiverId: "user-1",
    content: "Αδερφέ Κώστα, όταν κατέβεις Κρήτη στείλε μου μήνυμα να πάμε μαζί στα Λευκά Όρη!",
    createdAt: "19:10"
  }
];

// Public Live Discussion with Threaded Replies (0 = root, 1 = reply, 2 = 3rd-level nested reply)
let publicMessages: PublicChatMessage[] = [
  {
    id: "pub-1",
    userId: "user-1",
    firstName: "Κώστας",
    lastName: "Παπαγεωργίου",
    avatarUrl: DEMO_USERS[0].avatarUrl,
    title: "Καλωσήρθατε στην Αειφαριώτικη Κοινότητα! Ποιο είναι το αγαπημένο σας Spot;",
    content: "Καλησπέρα σε όλη την Αειφαριώτικη οικογένεια! Γράψτε από κάτω ποιο είναι το κορυφαίο σας food spot ή παραλία για σήμερα ώστε να ανταλλάξουμε προτάσεις!",
    categoryTag: "💬 Ανταλλαγή",
    pinned: true,
    likesCount: 28,
    thumbnailUrl: INITIAL_HIT_SPOTS[3].coverImageUrl,
    parentId: null,
    depth: 0,
    createdAt: "19:30"
  },
  {
    id: "pub-2",
    userId: "user-2",
    firstName: "Έλενα",
    lastName: "Βασιλείου",
    avatarUrl: DEMO_USERS[1].avatarUrl,
    content: "Καλησπέρα Κώστα! Μόλις δοκίμασα το φιστίκι Αιγίνης στο Σύνταγμα, απλά όνειρο!",
    likesCount: 12,
    parentId: "pub-1",
    depth: 1,
    createdAt: "19:32"
  },
  {
    id: "pub-3",
    userId: "user-3",
    firstName: "Μανώλης",
    lastName: "Κατσανεβάκης",
    avatarUrl: DEMO_USERS[2].avatarUrl,
    content: "Συμφωνώ απόλυτα Έλενα! Και το καϊμάκι με σαλέπι εκεί δεν παίζεται!",
    likesCount: 9,
    parentId: "pub-2",
    depth: 2,
    createdAt: "19:35"
  },
  {
    id: "pub-4",
    userId: "user-5",
    firstName: "Σοφία",
    lastName: "Νικολάου",
    avatarUrl: DEMO_USERS[4].avatarUrl,
    title: "Νέα Ανακάλυψη στα Ζαγοροχώρια & Προτάσεις Εβδομάδας",
    content: "Χαιρετίσματα από τα Ζαγοροχώρια! Η χειροποίητη αλευρόπιτα σήμερα βγήκε τραγανή από τον ξυλόφουρνο! Κάντε κλικ για να σχολιάσετε τις δικές σας ορεινές προτάσεις.",
    categoryTag: "🆕 Νέα & Προτάσεις",
    pinned: true,
    likesCount: 19,
    thumbnailUrl: INITIAL_HIT_SPOTS[2].coverImageUrl,
    parentId: null,
    depth: 0,
    createdAt: "19:40"
  }
];

function getPublicChatState(): PublicChatState {
  return {
    messages: publicMessages
  };
}

// SSE stream endpoint
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial state snapshot
  res.write(`event: init\ndata: ${JSON.stringify({
    users,
    spots: hitSpots,
    publicChat: getPublicChatState(),
    directMessages
  })}\n\n`);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", spotsCount: hitSpots.length, reviewsCount: reviews.length });
});

// Users & Member Registration API
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/register", (req, res) => {
  const { firstName, lastName, nickname, email, avatarUrl, bio, topFoods } = req.body;

  if (!firstName || !lastName || !bio) {
    return res.status(400).json({ error: "Παρακαλούμε συμπληρώστε όλα τα υποχρεωτικά πεδία εγγραφής." });
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    nickname: String(nickname || "Food Lover").trim(),
    email: String(email || `${Date.now()}@aeifaron.gr`).trim(),
    avatarUrl:
      avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: String(bio).trim(),
    topFoods:
      Array.isArray(topFoods) && topFoods.length === 3
        ? [String(topFoods[0]), String(topFoods[1]), String(topFoods[2])]
        : [
            "Αυθεντικό σουβλάκι στα κάρβουνα",
            "Παραδοσιακή πίτα στον ξυλόφουρνο",
            "Gelato Φιστίκι Αιγίνης ΠΟΠ"
          ],
    badge: "ΠΑΜΕ ΠΑΙΔΙΑ",
    role: "member",
    favoriteRegions: ["Athens & Attica"],
    spotsSubmittedCount: 1,
    reviewsCount: 0,
    joinedAt: new Date().toISOString().split("T")[0]
  };

  users.push(newUser);

  broadcastEvent("user:registered", { user: newUser, users, publicChat: getPublicChatState() });
  res.status(201).json({ user: newUser, users, publicChat: getPublicChatState() });
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  users[idx] = { ...users[idx], ...req.body };
  broadcastEvent("user:updated", { user: users[idx], users });
  res.json(users[idx]);
});

// Public Live Discussion Endpoints (All members simultaneously, threaded replies, 200 chars max)
app.get("/api/public-chat", (req, res) => {
  res.json(getPublicChatState());
});

app.post("/api/public-chat/message", (req, res) => {
  const { userId, content, parentId } = req.body;
  if (!userId || !content || typeof content !== "string") {
    return res.status(400).json({ error: "Απαιτείται μέλος και κείμενο μηνύματος." });
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return res.status(400).json({ error: "Το μήνυμα δεν μπορεί να είναι κενό." });
  }
  if (trimmed.length > 200) {
    return res.status(400).json({ error: "Το μήνυμα δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες." });
  }

  const sender = users.find((u) => u.id === userId) || users[0];

  let computedDepth = 0;
  let validParentId: string | null = null;
  if (parentId) {
    const parentMsg = publicMessages.find((m) => m.id === parentId);
    if (parentMsg) {
      validParentId = parentMsg.id;
      computedDepth = Math.min(2, (parentMsg.depth || 0) + 1);
    }
  }

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);

  const newMsg: PublicChatMessage = {
    id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: sender.id,
    firstName: sender.firstName,
    lastName: sender.lastName,
    avatarUrl: sender.avatarUrl,
    title: computedDepth === 0 ? `${trimmed.slice(0, 48)}${trimmed.length > 48 ? '...' : ''}` : undefined,
    content: trimmed,
    categoryTag: computedDepth === 0 ? "💬 Ανταλλαγή" : undefined,
    likesCount: 1,
    parentId: validParentId,
    depth: computedDepth,
    createdAt: timeStr
  };

  publicMessages.push(newMsg);
  if (publicMessages.length > 100) {
    publicMessages = publicMessages.slice(-100);
  }

  const updatedState = getPublicChatState();
  broadcastEvent("public-chat:updated", updatedState);

  res.status(201).json(updatedState);
});

// Direct Messages Endpoints (1-on-1 personal chat between members)
app.get("/api/direct-messages", (req, res) => {
  res.json(directMessages);
});

app.post("/api/direct-messages", (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content || !String(content).trim()) {
    return res.status(400).json({ error: "Missing sender, receiver, or message content" });
  }

  const sender = users.find((u) => u.id === senderId) || users[0];
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);

  const newDm: DirectMessage = {
    id: `dm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    senderId: sender.id,
    senderName: `${sender.firstName} ${sender.lastName}`,
    senderAvatar: sender.avatarUrl,
    receiverId,
    content: String(content).trim(),
    createdAt: timeStr
  };

  directMessages.push(newDm);
  broadcastEvent("dm:created", newDm);
  res.status(201).json(newDm);
});

// Leaderboard Reward Suggestions Store & Endpoints
let rewardSuggestions = [
  {
    id: "rew-1",
    userId: "user-2",
    firstName: "Έλενα",
    avatarUrl: DEMO_USERS[1].avatarUrl,
    levelTarget: "ΜΑΣΤΕΡΜΑΙΝΤ (6+ Spots)",
    suggestion: "Κέρασμα για 2 άτομα στην αγαπημένη του ταβέρνα με ρεφενέ (προσωπική αποστολή χρημάτων μέσω IRIS) από την παρέα!",
    createdAt: "18:45"
  },
  {
    id: "rew-2",
    userId: "user-3",
    firstName: "Μανώλης",
    avatarUrl: DEMO_USERS[2].avatarUrl,
    levelTarget: "ΜΑΣΤΕΡ (5 Spots)",
    suggestion: "Ένα κουτί οικογενειακό χειροποίητο gelato ή μπουγάτσα πληρωμένο από την κοινότητα!",
    createdAt: "19:15"
  }
];

app.get("/api/reward-suggestions", (req, res) => {
  res.json(rewardSuggestions);
});

app.post("/api/reward-suggestions", (req, res) => {
  const { userId, levelTarget, suggestion } = req.body;
  if (!suggestion || !String(suggestion).trim()) {
    return res.status(400).json({ error: "Missing suggestion text" });
  }
  const sender = users.find((u) => u.id === userId) || users[0];
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);

  const newItem = {
    id: `rew-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: sender.id,
    firstName: sender.firstName,
    avatarUrl: sender.avatarUrl,
    levelTarget: String(levelTarget || "Όλα τα Επίπεδα").trim(),
    suggestion: String(suggestion).trim(),
    createdAt: timeStr
  };

  rewardSuggestions.unshift(newItem);
  res.status(201).json(rewardSuggestions);
});

// Get all spots
app.get("/api/spots", (req, res) => {
  res.json(hitSpots);
});

// Get single spot with its reviews
app.get("/api/spots/:id", (req, res) => {
  const spot = hitSpots.find((s) => s.id === req.params.id);
  if (!spot) {
    return res.status(404).json({ error: "Spot not found" });
  }
  const spotReviews = reviews.filter((r) => r.spotId === spot.id);
  res.json({ ...spot, reviews: spotReviews });
});

// Create new spot (Instant bilingual sync EL/EN via SSE)
app.post("/api/spots", async (req, res) => {
  const {
    title,
    titleEl,
    category,
    region,
    address,
    googleMapsUrl,
    whyIsItSpecial,
    whyIsItSpecialEl,
    signatureDishes,
    signatureDishesEl,
    priceLevel,
    coverImageUrl,
    galleryUrls,
    authorId,
    insiderTips,
    coordinates,
    tags
  } = req.body;

  const finalTitle = title || titleEl;
  const finalWhy = whyIsItSpecial || whyIsItSpecialEl;

  if (!finalTitle || !category || !region || !address || !finalWhy) {
    return res.status(400).json({ error: "Missing required fields for food spot" });
  }

  let syncedTitleEn = title || finalTitle;
  let syncedTitleEl = titleEl || finalTitle;
  let syncedWhyEn = whyIsItSpecial || finalWhy;
  let syncedWhyEl = whyIsItSpecialEl || finalWhy;

  // Optional fast AI translation if user submitted identical text in only one language
  const ai = getAi();
  if (ai && syncedWhyEn === syncedWhyEl) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate this Greek/English food spot title and description into both English and Greek so both languages are natural and accurate.
Title: "${finalTitle}"
Description: "${finalWhy}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleEn: { type: Type.STRING },
              titleEl: { type: Type.STRING },
              whyEn: { type: Type.STRING },
              whyEl: { type: Type.STRING }
            },
            required: ["titleEn", "titleEl", "whyEn", "whyEl"]
          }
        }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.titleEn) syncedTitleEn = parsed.titleEn;
        if (parsed.titleEl) syncedTitleEl = parsed.titleEl;
        if (parsed.whyEn) syncedWhyEn = parsed.whyEn;
        if (parsed.whyEl) syncedWhyEl = parsed.whyEl;
      }
    } catch (err) {
      // Fallback to direct sync
    }
  }

  const author = users.find((u) => u.id === authorId) || users[0];

  const dishesArr = Array.isArray(signatureDishes)
    ? signatureDishes
    : signatureDishes
    ? [signatureDishes]
    : ["Signature Special"];
  const dishesElArr = Array.isArray(signatureDishesEl)
    ? signatureDishesEl
    : signatureDishesEl
    ? [signatureDishesEl]
    : dishesArr;

  const defaultCover =
    coverImageUrl ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80";

  const newSpot = {
    id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    authorId: author.id,
    author,
    title: syncedTitleEn,
    titleEl: syncedTitleEl,
    category,
    region,
    address,
    googleMapsUrl: googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(finalTitle + " " + address)}`,
    coordinates: coordinates || { lat: 37.9753, lng: 23.7335 },
    whyIsItSpecial: syncedWhyEn,
    whyIsItSpecialEl: syncedWhyEl,
    signatureDishes: dishesArr,
    signatureDishesEl: dishesElArr,
    priceLevel: priceLevel || "10-15€",
    coverImageUrl: defaultCover,
    galleryUrls: Array.isArray(galleryUrls) && galleryUrls.length > 0 ? galleryUrls : [defaultCover],
    rating: 5.0,
    reviewsCount: 1,
    createdAt: new Date().toISOString(),
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [category, region.split(" ")[0]],
    insiderTips: insiderTips || "",
    verifiedSpot: true
  };

  hitSpots.unshift(newSpot);

  // Update user stats
  author.spotsSubmittedCount += 1;

  // Broadcast instant sync to all connected users regardless of language
  broadcastEvent("spot:created", { spot: newSpot, spots: hitSpots, users });

  res.status(201).json(newSpot);
});

// Rule-based heuristic fallback check for culinary relevance
function fallbackModeration(content: string, spotName?: string) {
  const text = content.toLowerCase();
  
  const spamPatterns = [
    "crypto", "bitcoin", "forex", "casino", "poker", "loan", "weight loss", "viagra", 
    "whatsapp", "click here", "buy now", "discount code", "promo", "politics", "election",
    "f***"
  ];

  for (const pattern of spamPatterns) {
    if (text.includes(pattern)) {
      return {
        approved: false,
        reason: "Your comment contains off-topic or prohibited promotional content.",
        reasonEl: "Το σχόλιό σας περιέχει διαφημιστικό περιεχόμενο ή εκτός θέματος αναφορές.",
        confidenceScore: 0.95
      };
    }
  }

  const culinaryKeywords = [
    "food", "taste", "flavor", "delicious", "dish", "meat", "pork", "beef", "lamb", "goat", "fish",
    "seafood", "fresh", "bread", "sourdough", "bakery", "gelato", "ice cream", "pistachio", "sauce",
    "pita", "souvlaki", "gyros", "cheese", "feta", "olive oil", "wine", "tsipouro", "meze", "taverna",
    "restaurant", "chef", "cook", "portion", "crispy", "juicy", "sweet", "dessert", "bougatsa",
    "service", "wait", "queue", "price", "table", "baked", "grilled", "charcoal", "crust", "cream",
    "φαγητό", "γεύση", "νοστιμο", "νόστιμο", "πιάτο", "κρέας", "χοιρινό", "μοσχάρι", "αρνί", "κατσίκι",
    "ψάρι", "θαλασσινά", "φρέσκο", "ψωμί", "προζύμι", "φούρνος", "παγωτό", "τζελάτο", "φιστίκι", "σάλτσα",
    "πίτα", "σουβλάκι", "γύρος", "τυρί", "φέτα", "ελαιόλαδο", "λάδι", "κρασί", "τσίπουρο", "μεζές", "ταβέρνα",
    "εστιατόριο", "σεφ", "μαγείρεμα", "μερίδα", "τραγανό", "ζουμερό", "γλυκό", "επιδόρπιο", "μπουγάτσα",
    "εξυπηρέτηση", "αναμονή", "ουρά", "τιμή", "τραπέζι", "ψητό", "κάρβουνα", "κρούστα", "κρέμα", "υλικά"
  ];

  const hasCulinaryContext = culinaryKeywords.some((kw) => text.includes(kw));

  if (content.trim().length < 8) {
    return {
      approved: false,
      reason: "Your review is too short. Please describe specific dishes, ingredients, or taste impressions.",
      reasonEl: "Το σχόλιό σας είναι πολύ σύντομο. Παρακαλούμε περιγράψτε συγκεκριμένα πιάτα, υλικά ή γευστικές εντυπώσεις.",
      confidenceScore: 0.8
    };
  }

  if (hasCulinaryContext) {
    return {
      approved: true,
      reason: "Review is verified as culinary-relevant.",
      reasonEl: "Το σχόλιο εγκρίθηκε ως γαστρονομικά έγκυρο.",
      confidenceScore: 0.9
    };
  }

  return {
    approved: false,
    reason: "Your comment must be directly related to the food, ingredients, or dining experience at this specific spot.",
    reasonEl: "Το σχόλιό σας πρέπει να σχετίζεται άμεσα με το φαγητό, τα υλικά ή την εμπειρία στο συγκεκριμένο spot.",
    confidenceScore: 0.75
  };
}

// AI Content Moderation Endpoint
app.post("/api/moderate-comment", async (req, res) => {
  const { content, spotTitle, category } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Content is required" });
  }

  const ai = getAi();

  if (!ai) {
    const result = fallbackModeration(content, spotTitle);
    return res.json(result);
  }

  try {
    const prompt = `You are a strict Culinary Moderation Engine for an exclusive Greek Food Hit Spots community app.
Spot: "${spotTitle || 'Greek Food Hit Spot'}" (Category: "${category || 'Gastronomy'}")
Submitted Member Comment: "${content}"

Output JSON ONLY:
{
  "approved": boolean,
  "reason": "English explanation",
  "reasonEl": "Greek explanation",
  "confidenceScore": number,
  "culinaryKeywordsDetected": string[]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            reasonEl: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            culinaryKeywordsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["approved", "reason", "reasonEl"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    const result = fallbackModeration(content, spotTitle);
    return res.json(result);
  }
});

// Post review with automatic AI moderation
app.post("/api/spots/:id/reviews", async (req, res) => {
  const spotId = req.params.id;
  const { content, rating, signatureOrdered, visitDate, authorId } = req.body;

  const spot = hitSpots.find((s) => s.id === spotId);
  if (!spot) {
    return res.status(404).json({ error: "Spot not found" });
  }

  if (!content || !rating) {
    return res.status(400).json({ error: "Content and rating are required" });
  }

  let moderationResult = { approved: true, reason: "", reasonEl: "" };
  const ai = getAi();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Evaluate if this review for "${spot.title}" is genuine food/dining feedback: "${content}". Reject non-food / spam / insults. Output JSON with { approved: boolean, reason: string, reasonEl: string }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              approved: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              reasonEl: { type: Type.STRING }
            },
            required: ["approved", "reason", "reasonEl"]
          }
        }
      });
      moderationResult = JSON.parse(response.text || "{}");
    } catch (e) {
      moderationResult = fallbackModeration(content, spot.title);
    }
  } else {
    moderationResult = fallbackModeration(content, spot.title);
  }

  if (!moderationResult.approved) {
    return res.status(422).json({
      error: "Moderation rejection",
      moderation: moderationResult
    });
  }

  const author = users.find((u) => u.id === authorId) || users[0];

  const newReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    spotId,
    author,
    rating: Number(rating),
    content,
    visitDate: visitDate || new Date().toISOString().split("T")[0],
    signatureOrdered: signatureOrdered || "",
    isApproved: true,
    likesCount: 0,
    createdAt: new Date().toISOString(),
    replies: []
  };

  reviews.push(newReview);

  const spotReviews = reviews.filter((r) => r.spotId === spotId && r.isApproved);
  const totalRating = spotReviews.reduce((sum, r) => sum + r.rating, 0);
  spot.rating = Number((totalRating / spotReviews.length).toFixed(2));
  spot.reviewsCount = spotReviews.length;

  author.reviewsCount += 1;

  res.status(201).json({ review: newReview, moderation: moderationResult, spotUpdatedRating: spot.rating });
});

// Post reply to review
app.post("/api/reviews/:id/replies", async (req, res) => {
  const reviewId = req.params.id;
  const { content, authorId } = req.body;

  const review = reviews.find((r) => r.id === reviewId);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const moderationResult = fallbackModeration(content);
  if (!moderationResult.approved) {
    return res.status(422).json({
      error: "Moderation rejection",
      moderation: moderationResult
    });
  }

  const author = users.find((u) => u.id === authorId) || users[0];

  const newReply = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    reviewId,
    author,
    content,
    createdAt: new Date().toISOString(),
    isApproved: true
  };

  if (!review.replies) review.replies = [];
  review.replies.push(newReply);

  res.status(201).json(newReply);
});

// User Saved Keywords for "Εξερεύνηση για Spots"
let userSavedKeywords: string[] = [
  "λουκάνικο χωριάτικο",
  "παγωτό με πρόβειο γάλα",
  "σουβλάκι αλάδωτο",
  "προζυμένιο ψωμί ξυλόφουρνου",
  "φρέσκο ψάρι στα κάρβουνα",
  "χειροποίητη μπουγάτσα"
];

app.get("/api/user-keywords", (req, res) => {
  res.json(userSavedKeywords);
});

app.post("/api/user-keywords", (req, res) => {
  const { keyword } = req.body;
  if (!keyword || !String(keyword).trim()) {
    return res.status(400).json({ error: "Missing keyword" });
  }
  const clean = String(keyword).trim();
  if (!userSavedKeywords.some((k) => k.toLowerCase() === clean.toLowerCase())) {
    userSavedKeywords.unshift(clean);
  }
  res.status(201).json(userSavedKeywords);
});

app.delete("/api/user-keywords", (req, res) => {
  const { keyword } = req.body;
  if (keyword) {
    userSavedKeywords = userSavedKeywords.filter(
      (k) => k.toLowerCase() !== String(keyword).trim().toLowerCase()
    );
  }
  res.json(userSavedKeywords);
});

// Normalize Greek strings (remove accents/diacritics for accurate stem/fuzzy matching)
function normalizeGreek(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Live AI & Semantic Search for Spots matching user keywords or closely related terms in order
app.post("/api/ai/search-spots", async (req, res) => {
  const { query } = req.body;
  const qRaw = (query || "").trim();
  const qNorm = normalizeGreek(qRaw);

  // Culinary synonym clusters so "λουκάνικο χωριάτικο" or "παγωτό με πρόβειο γάλα" also match closely related spots in order
  const synonymGroups: string[][] = [
    ["λουκανικο", "χωριατικο", "κρεας", "χοιρινο", "καλαμακι", "σουβλακι", "μπιφτεκακι", "καρβουνα", "ταβερνα", "κατσικακι", "τσιγαριαστο", "σχαρα"],
    ["παγωτο", "προβειο", "γαλα", "κατσικισιο", "gelato", "καϊμακι", "σαλεπι", "φιστικι", "κρεμα", "γλυκο"],
    ["ψαρι", "θαλασσινα", "φαγκρι", "μπαρμπουνι", "αχινος", "κακαβια", "ψαροταβερνα", "θαλασσα"],
    ["μπουγατσα", "φυλλο", "πιτα", "τυρι", "κιμα", "ξυλοφουρνος", "προζυμι", "ψωμι", "φουρνος"],
    ["παραλια", "θαλασσα", "αμμος", "κεδροδασος", "ελαφονησι", "κρητη", "νησι"]
  ];

  const computeOrderedMatches = () => {
    const words = qNorm.split(/\s+/).filter((w) => w.length >= 2);

    // Find related terms from synonym groups
    const relatedTerms = new Set<string>();
    for (const w of words) {
      const stem = w.length > 4 ? w.slice(0, -1) : w;
      for (const grp of synonymGroups) {
        if (grp.some((term) => term.includes(stem) || stem.includes(term))) {
          grp.forEach((t) => relatedTerms.add(t));
        }
      }
    }

    const scored = hitSpots.map((spot) => {
      const hayRaw = `${spot.title} ${spot.titleEl || ""} ${spot.category} ${spot.region} ${spot.address} ${spot.whyIsItSpecial} ${spot.whyIsItSpecialEl || ""} ${(spot.signatureDishes || []).join(" ")} ${(spot.signatureDishesEl || []).join(" ")} ${(spot.tags || []).join(" ")}`;
      const hayNorm = normalizeGreek(hayRaw);

      let exactPhraseMatch = qNorm.length > 0 && hayNorm.includes(qNorm);
      let matchedWordsCount = 0;
      let stemMatchesCount = 0;
      let relatedMatchesCount = 0;

      for (const w of words) {
        const stem = w.length > 4 ? w.slice(0, -2) : w;
        if (hayNorm.includes(w)) {
          matchedWordsCount += 1;
        } else if (stem.length >= 3 && hayNorm.includes(stem)) {
          stemMatchesCount += 1;
        }
      }

      for (const rel of relatedTerms) {
        if (hayNorm.includes(rel)) {
          relatedMatchesCount += 1;
        }
      }

      let score = spot.rating * 5;
      let matchType: "exact" | "close" | "general" = "general";
      let aiReasonEl = `Κορυφαία πρόταση στον χάρτη • Αξιολόγηση ★ ${spot.rating.toFixed(2)}`;

      if (!qNorm) {
        score += spot.rating * 10;
      } else if (exactPhraseMatch || (words.length > 0 && matchedWordsCount === words.length)) {
        score += 500 + matchedWordsCount * 80;
        matchType = "exact";
        aiReasonEl = `Περιλαμβάνει ακριβώς τον όρο «${qRaw}» • ★ ${spot.rating.toFixed(2)}`;
      } else if (matchedWordsCount > 0 || stemMatchesCount > 0) {
        score += 250 + matchedWordsCount * 70 + stemMatchesCount * 45 + relatedMatchesCount * 15;
        matchType = "exact";
        aiReasonEl = `Περιλαμβάνει λέξεις από το «${qRaw}» • ★ ${spot.rating.toFixed(2)}`;
      } else if (relatedMatchesCount > 0) {
        score += 100 + relatedMatchesCount * 25;
        matchType = "close";
        aiReasonEl = `Πολύ κοντά στον όρο «${qRaw}» (παρεμφερή πιάτα/γεύσεις) • ★ ${spot.rating.toFixed(2)}`;
      }

      return {
        spot,
        score,
        matchType,
        aiReasonEl
      };
    });

    scored.sort((a, b) => b.score - a.score || b.spot.rating - a.spot.rating);

    // If user searched a specific term, prioritize exact & closely related matches first in order
    const matchingOrClose = qNorm
      ? scored.filter((item) => item.matchType === "exact" || item.matchType === "close")
      : scored;

    const finalList = matchingOrClose.length > 0 ? matchingOrClose : scored.slice(0, 5);

    return finalList.map((item) => ({
      ...item.spot,
      matchType: item.matchType,
      aiMatchReason: item.aiReasonEl
    }));
  };

  const localOrdered = computeOrderedMatches();
  const ai = getAi();

  // Fallback curated live web & Google Maps places if Gemini API key is not configured
  const buildFallbackWebAndMaps = (kw: string) => {
    const encoded = encodeURIComponent(`${kw} Ελλάδα φαγητό`);
    return {
      summaryText: `Ζωντανή αναζήτηση στο διαδίκτυο και στο Google Maps για «${kw}»: Βρέθηκαν προτάσεις στην κοινότητα καθώς και απευθείας σύνδεσμοι εξερεύνησης στο Google Maps και στον Ιστό.`,
      mapsPlaces: [
        {
          title: `Google Maps: Κορυφαία μέρη για «${kw}» στην Ελλάδα`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
          snippet: `Δείτε στον χάρτη όλα τα καταστήματα, ταβέρνες και σημεία που σερβίρουν ή σχετίζονται με «${kw}».`
        },
        {
          title: `Google Maps: «${kw}» σε Αθήνα & Αττική`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kw + " Αθήνα")}`,
          snippet: `Ανακαλύψτε επιλεγμένα στέκια στην Αθήνα για «${kw}».`
        },
        {
          title: `Google Maps: «${kw}» σε Θεσσαλονίκη & Κρήτη`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kw + " Θεσσαλονίκη Κρήτη")}`,
          snippet: `Εξερευνήστε αυθεντικές γαστρονομικές επιλογές για «${kw}».`
        }
      ],
      webLinks: [
        {
          title: `Αναζήτηση Google Web: Κορυφαίες προτάσεις για «${kw}»`,
          uri: `https://www.google.com/search?q=${encoded}`,
          snippet: `Άρθρα, κριτικές και γαστρονομικοί οδηγοί στο διαδίκτυο για «${kw}».`
        }
      ]
    };
  };

  if (!ai || !qNorm) {
    return res.json({
      results: localOrdered,
      liveDiscovery: qNorm ? buildFallbackWebAndMaps(qRaw) : null
    });
  }

  try {
    const { lat, lng } = req.body;
    const catalog = hitSpots.map((s) => ({
      id: s.id,
      title: s.titleEl || s.title,
      category: s.category,
      region: s.region,
      address: s.address,
      rating: s.rating,
      dishes: s.signatureDishesEl || s.signatureDishes,
      secretSauce: s.whyIsItSpecialEl || s.whyIsItSpecial
    }));

    const catalogPrompt = `You are the AI Spot Finder for AEIFARON SPOTS.
The user searched for the keyword/phrase: "${qRaw}".
Here are the available spots:
${JSON.stringify(catalog)}

Find all spots that either directly include the term "${qRaw}" OR offer something very close/similar in taste, ingredients, or style.
Order them strictly from closest/exact match first to closely related matches next.
Output JSON ONLY:
{
  "matches": [
    { "id": "spot-id", "matchType": "exact", "aiMatchReason": "Greek explanation of why it matches or is very close to the term" }
  ]
}`;

    // Run 3 parallel requests:
    // 1. Catalog semantic matching
    // 2. Live Google Maps Grounding (real places in Greece for the keyword)
    // 3. Live Google Search Grounding (real web articles/spots in Greece for the keyword)
    const mapsConfig: any = {
      tools: [{ googleMaps: {} }]
    };
    if (typeof lat === "number" && typeof lng === "number") {
      mapsConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      };
    } else {
      mapsConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: 37.9755,
            longitude: 23.7348
          }
        }
      };
    }

    const [catalogRes, mapsRes, webRes] = await Promise.allSettled([
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: catalogPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    matchType: { type: Type.STRING },
                    aiMatchReason: { type: Type.STRING }
                  },
                  required: ["id", "aiMatchReason"]
                }
              }
            },
            required: ["matches"]
          }
        }
      }),
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Βρες 4-5 πραγματικά, αυθεντικά και κορυφαία καταστήματα εστίασης, ταβέρνες, ζαχαροπλαστεία ή τοποθεσίες στην Ελλάδα στο Google Maps που φημίζονται για: "${qRaw}". Γράψε στα Ελληνικά σύντομη περιγραφή για το καθένα (όνομα, περιοχή και γιατί ξεχωρίζει για "${qRaw}").`,
        config: mapsConfig
      }),
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Κάνε ζωντανή αναζήτηση στο διαδίκτυο για τα καλύτερα spots, στέκια ή μέρη στην Ελλάδα για: "${qRaw}". Δώσε 3-4 κορυφαίες προτάσεις στα Ελληνικά με σύντομη επεξήγηση.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      })
    ]);

    // 1. Process community catalog matches
    let finalCatalogResults = localOrdered;
    if (catalogRes.status === "fulfilled" && catalogRes.value.text) {
      try {
        const parsed = JSON.parse(catalogRes.value.text || "{}");
        if (Array.isArray(parsed.matches) && parsed.matches.length > 0) {
          const matchedList: any[] = [];
          for (const m of parsed.matches) {
            const found = hitSpots.find((s) => s.id === m.id);
            if (found && !matchedList.some((r) => r.id === found.id)) {
              matchedList.push({
                ...found,
                matchType: m.matchType === "exact" ? "exact" : "close",
                aiMatchReason: m.aiMatchReason
              });
            }
          }
          if (matchedList.length > 0) {
            finalCatalogResults = matchedList;
          }
        }
      } catch {}
    }

    // 2. Process Google Maps Grounding results & groundingChunks
    const mapsPlaces: { title: string; uri: string; snippet?: string }[] = [];
    let summaryText = "";

    if (mapsRes.status === "fulfilled") {
      if (mapsRes.value.text) {
        summaryText = mapsRes.value.text.trim();
      }
      const chunks = mapsRes.value.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const chunk of chunks as any[]) {
        if (chunk.maps && chunk.maps.uri) {
          const snippets: string[] = [];
          if (Array.isArray(chunk.maps.placeAnswerSources?.reviewSnippets)) {
            for (const rs of chunk.maps.placeAnswerSources.reviewSnippets) {
              if (rs.text) snippets.push(rs.text);
            }
          }
          if (!mapsPlaces.some((p) => p.uri === chunk.maps.uri)) {
            mapsPlaces.push({
              title: chunk.maps.title || `Google Maps Spot για «${qRaw}»`,
              uri: chunk.maps.uri,
              snippet: snippets[0] || `Επαληθευμένο σημείο στο Google Maps για «${qRaw}»`
            });
          }
        }
      }
    }

    // 3. Process Google Search Grounding results & groundingChunks
    const webLinks: { title: string; uri: string; snippet?: string }[] = [];
    if (webRes.status === "fulfilled") {
      if (!summaryText && webRes.value.text) {
        summaryText = webRes.value.text.trim();
      } else if (webRes.value.text) {
        summaryText = `${summaryText}\n\n${webRes.value.text.trim()}`;
      }
      const wChunks = webRes.value.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const chunk of wChunks as any[]) {
        if (chunk.web && chunk.web.uri) {
          if (!webLinks.some((w) => w.uri === chunk.web.uri)) {
            webLinks.push({
              title: chunk.web.title || `Πρόταση Ιστού για «${qRaw}»`,
              uri: chunk.web.uri,
              snippet: `Πηγή διαδικτύου από τη ζωντανή αναζήτηση Google Search`
            });
          }
        }
      }
    }

    const fallbackInfo = buildFallbackWebAndMaps(qRaw);
    if (mapsPlaces.length === 0) {
      mapsPlaces.push(...fallbackInfo.mapsPlaces);
    }
    if (webLinks.length === 0) {
      webLinks.push(...fallbackInfo.webLinks);
    }
    if (!summaryText) {
      summaryText = fallbackInfo.summaryText;
    }

    return res.json({
      results: finalCatalogResults,
      liveDiscovery: {
        summaryText,
        mapsPlaces,
        webLinks
      }
    });
  } catch (e) {
    return res.json({
      results: localOrdered,
      liveDiscovery: buildFallbackWebAndMaps(qRaw)
    });
  }
});

// App Improvement Feedback Endpoint
interface AppFeedbackEntry {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
}

const appFeedbackList: AppFeedbackEntry[] = [
  {
    id: "fb-1",
    name: "Κώστας Παπαγεωργίου",
    comment: "Πολύ εύχρηστη η αναζήτηση με λέξεις-κλειδιά! Θα ήταν ωραίο να μπορούμε να φιλτράρουμε και ανά εποχή (π.χ. χειμερινά ορεινά στέκια).",
    createdAt: "2026-03-15T10:30:00.000Z"
  }
];

app.get("/api/feedback", (_req, res) => {
  res.json(appFeedbackList);
});

app.post("/api/feedback", (req, res) => {
  const { name, comment } = req.body;
  const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : "";
  const cleanComment = typeof comment === "string" ? comment.trim().slice(0, 1500) : "";
  if (!cleanName || !cleanComment) {
    return res.status(400).json({ error: "Απαιτείται όνομα και σχόλιο βελτίωσης." });
  }
  const entry: AppFeedbackEntry = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    comment: cleanComment,
    createdAt: new Date().toISOString()
  };
  appFeedbackList.unshift(entry);
  res.status(201).json(entry);
});

// Profile Voice-Over TTS Endpoint using gemini-3.8-flash-lite-tts
app.post("/api/tts/profile", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing text for voice over" });
  }

  const ai = getAi();
  if (!ai) {
    return res.status(200).json({ fallback: true });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text
            }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/wav";
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, mimeType });
    }
    return res.json({ fallback: true });
  } catch (err) {
    console.warn("Gemini TTS error, falling back to browser SpeechSynthesis:", err);
    return res.json({ fallback: true });
  }
});

// Vite Middleware for Dev and Static serve for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Food Hit Spots Greece server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
