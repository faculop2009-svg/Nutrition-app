import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for meal photos (base64)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

import { EXPANDED_FOODS_DATABASE } from "./src/data/foods";

// Global Food Database (Curated Global Items + Barcodes)
const GLOBAL_FOODS_DB = EXPANDED_FOODS_DATABASE;

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY),
    service: "NutriScan Pro Enterprise Engine"
  });
});

// Barcode Lookup with Fallback to OpenFoodFacts
app.get("/api/barcode/:code", async (req, res) => {
  const { code } = req.params;
  
  // First check local high-fidelity database
  const localMatch = GLOBAL_FOODS_DB.find(
    (item) => item.barcode === code.trim()
  );
  if (localMatch) {
    return res.json({ source: "verified_cache", product: localMatch });
  }

  // Try OpenFoodFacts API for live international lookup
  try {
    const offResponse = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`,
      { headers: { "User-Agent": "NutriScanPro - WebApp - Version 1.0" } }
    );
    if (offResponse.ok) {
      const offData = await offResponse.json();
      if (offData.status === 1 && offData.product) {
        const p = offData.product;
        const n = p.nutriments || {};
        const parsedProduct = {
          barcode: code,
          name: p.product_name || p.product_name_es || "Alimento Registrado",
          brand: p.brands || "Marca Comercial",
          serving: p.serving_size || "100g",
          calories: Math.round(n["energy-kcal_100g"] || (n["energy_100g"] ? n["energy_100g"] / 4.184 : 120)),
          protein: Number((n.proteins_100g || 0).toFixed(1)),
          carbs: Number((n.carbohydrates_100g || 0).toFixed(1)),
          fat: Number((n.fat_100g || 0).toFixed(1)),
          fiber: Number((n.fiber_100g || 0).toFixed(1)),
          sugar: Number((n.sugars_100g || 0).toFixed(1)),
          sodium: Math.round((n.sodium_100g || 0) * 1000),
          potassium: Math.round((n.potassium_100g || 0) * 1000),
          calcium: Math.round((n.calcium_100g || 0) * 1000),
          iron: Number((n.iron_100g || 0).toFixed(2)),
          vitaminC: Number((n["vitamin-c_100g"] || 0).toFixed(1)),
          nutriScore: (p.nutrition_grades || "b").toUpperCase(),
          novaGroup: p.nova_group || 3,
          category: p.categories?.split(",")?.[0]?.trim() || "Alimento General",
          imageUrl: p.image_front_url || p.image_url || undefined,
          dietaryTags: [
            n.proteins_100g > 10 ? "Proteico" : null,
            n.fiber_100g > 4 ? "Alto en Fibra" : null,
            n.sugars_100g < 2 ? "Bajo Azúcar" : null
          ].filter(Boolean) as string[]
        };
        return res.json({ source: "open_food_facts", product: parsedProduct });
      }
    }
  } catch (err) {
    console.warn("OpenFoodFacts query error, falling back:", err);
  }

  // If not found in live API, generate realistic approximation or return 404
  return res.status(404).json({
    error: "Código de barras no encontrado en la base global",
    code
  });
});

// Search Food Database
app.get("/api/foods/search", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase().trim();
  const category = (req.query.category as string || "").trim();

  let results = GLOBAL_FOODS_DB;
  if (category && category !== "Todos") {
    results = results.filter((item) => item.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (query) {
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.barcode.includes(query) ||
        item.dietaryTags.some((t) => t.toLowerCase().includes(query))
    );
  }

  res.json({ items: results });
});

// AI Meal Photo Analysis
app.post("/api/analyze-meal", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", userNotes = "" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Se requiere la imagen del plato o comida" });
    }

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getGenAI();

    if (!ai) {
      // Fallback realistic response if GEMINI_API_KEY is not provisioned yet
      return res.json({
        success: true,
        data: generateSimulationFallback(userNotes),
        disclaimer: "Modo de simulación biométrica (Para análisis clínico real con visión computacional de Gemini, configure GEMINI_API_KEY en los secretos)."
      });
    }

    const prompt = `Actúa como un Nutricionista Clínico y Especialista en Visión Computacional de Alimentos.
Analiza la fotografía de la comida suministrada y cualquier nota del usuario ("${userNotes}").
Identifica con precisión:
1. Nombre del plato principal o combinación de alimentos (en español claro y profesional).
2. Descripción culinaria y evaluación nutricional.
3. Estimación realista de gramos o porción total (ej. "380g", "1 plato estándar").
4. Desglose calórico total y macronutrientes (Proteína en g, Carbohidratos en g, Grasas totales en g, Fibra dietética en g, Azúcares en g, Grasas Saturadas en g).
5. Micronutrientes clave (Sodio en mg, Potasio en mg, Calcio en mg, Hierro en mg, Vitamina C en mg, Colesterol en mg).
6. Lista de ingredientes o componentes individuales visibles con su peso estimado en g y calorías aproximadas.
7. Etiquetas nutricionales clínicas (ej. "Rico en Proteína", "Bajo Índice Glucémico", "Keto", "Antiinflamatorio", "Vegetariano", etc.).
8. Nivel de confianza de la estimación (0 a 100%).
9. Puntuación de calidad nutricional HealthScore (0 a 100) basada en densidad de nutrientes vs ultraprocesamiento.
10. Recomendación clínica o consejo dietético breve y fundamentado.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            description: { type: Type.STRING },
            portion: { type: Type.STRING },
            totalCalories: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            healthScore: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                sugar: { type: Type.NUMBER },
                saturatedFat: { type: Type.NUMBER },
              },
              required: ["protein", "carbs", "fat", "fiber", "sugar", "saturatedFat"],
            },
            micronutrients: {
              type: Type.OBJECT,
              properties: {
                sodium: { type: Type.NUMBER },
                potassium: { type: Type.NUMBER },
                calcium: { type: Type.NUMBER },
                iron: { type: Type.NUMBER },
                vitaminC: { type: Type.NUMBER },
                cholesterol: { type: Type.NUMBER },
              },
              required: ["sodium", "potassium", "calcium", "iron", "vitaminC", "cholesterol"],
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  portion: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                },
                required: ["name", "portion", "calories", "protein", "carbs", "fat"],
              },
            },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            clinicalNotes: { type: Type.STRING },
          },
          required: [
            "foodName",
            "description",
            "portion",
            "totalCalories",
            "confidence",
            "healthScore",
            "macros",
            "micronutrients",
            "items",
            "dietaryTags",
            "clinicalNotes",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("El modelo Gemini no devolvió respuesta de texto.");
    }

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      data: parsedData,
      source: "gemini-3.8-flash"
    });
  } catch (error: any) {
    console.error("Error analyzing meal image:", error);
    return res.status(500).json({
      error: "Error durante el análisis nutricional de la imagen",
      message: error?.message || "Detalles no disponibles"
    });
  }
});

// Helper for fallback simulation
function generateSimulationFallback(notes: string) {
  const sampleMeals = [
    {
      foodName: "Bowl de Salmón Noruego con Quinoa y Aguacate",
      description: "Filete de salmón a la plancha sobre lecho de quinoa perlada, medio aguacate hass, espinacas baby y semillas de sésamo tostadas.",
      portion: "380g",
      totalCalories: 585,
      confidence: 96,
      healthScore: 94,
      macros: {
        protein: 42.5,
        carbs: 38.0,
        fat: 26.5,
        fiber: 8.2,
        sugar: 3.1,
        saturatedFat: 4.2
      },
      micronutrients: {
        sodium: 420,
        potassium: 890,
        calcium: 95,
        iron: 3.8,
        vitaminC: 18.5,
        cholesterol: 78
      },
      items: [
        { name: "Salmón a la plancha", portion: "160g", calories: 330, protein: 34, carbs: 0, fat: 20 },
        { name: "Quinoa cocida", portion: "120g", calories: 145, protein: 5.2, carbs: 26, fat: 2.3 },
        { name: "Aguacate Hass", portion: "70g", calories: 110, protein: 1.4, carbs: 6, fat: 10 },
        { name: "Espinacas baby & aderezo cítrico", portion: "30g", calories: 0, protein: 1.9, carbs: 6, fat: 0.2 }
      ],
      dietaryTags: ["Rico en Omega-3", "Alta Densidad Proteica", "Antiinflamatorio", "Sin Gluten"],
      clinicalNotes: "Excelente equilibrio de ácidos grasos monoinsaturados y poliinsaturados. Aporte idóneo de fibra para saciedad prolongada e índice glucémico estable."
    },
    {
      foodName: "Pechuga de Pollo Asada con Batata y Brócoli al Vapor",
      description: "Pechuga magra grillada sazonada con hierbas finas, rodajas de batata horneada y floretes de brócoli al dente.",
      portion: "420g",
      totalCalories: 460,
      confidence: 94,
      healthScore: 96,
      macros: {
        protein: 48.0,
        carbs: 42.0,
        fat: 8.5,
        fiber: 7.5,
        sugar: 6.2,
        saturatedFat: 1.8
      },
      micronutrients: {
        sodium: 310,
        potassium: 940,
        calcium: 110,
        iron: 2.9,
        vitaminC: 75.0,
        cholesterol: 95
      },
      items: [
        { name: "Pechuga de pollo a la plancha", portion: "180g", calories: 230, protein: 44, carbs: 0, fat: 4.5 },
        { name: "Batata / Camote asado", portion: "140g", calories: 140, protein: 2.2, carbs: 32, fat: 0.5 },
        { name: "Brócoli al vapor con AOVE", portion: "100g", calories: 90, protein: 2.8, carbs: 10, fat: 3.5 }
      ],
      dietaryTags: ["Alto Rendimiento", "Bajo en Grasa", "Rico en Vitamina A y C", "Recuperación Muscular"],
      clinicalNotes: "Plato óptimo para síntesis proteica muscular post-entrenamiento con carbohidratos complejos de absorción gradual."
    }
  ];

  return sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
}

// Start Server with Vite Middleware
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NutriScan Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
