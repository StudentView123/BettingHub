import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as signals from "./signals.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-fc3822ec/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize mock data
app.post("/make-server-fc3822ec/init", async (c) => {
  try {
    await signals.initializeMockMarkets();
    const activeSignals = await signals.generateActiveSignals(15);
    return c.json({ 
      success: true, 
      markets: 25,
      signals: activeSignals.length 
    });
  } catch (error) {
    console.log("Error initializing data:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get active signals with filters
app.get("/make-server-fc3822ec/signals", async (c) => {
  try {
    const sport = c.req.query("sport");
    const marketType = c.req.query("marketType");
    const minConfidence = c.req.query("minConfidence");
    
    const signalKeys = await kv.getByPrefix("signal:");
    let allSignals = signalKeys.map(k => JSON.parse(k.value as string) as signals.Signal);
    
    // Apply filters
    if (sport) {
      allSignals = allSignals.filter(s => s.sport === sport);
    }
    if (marketType) {
      allSignals = allSignals.filter(s => s.marketType === marketType);
    }
    if (minConfidence) {
      const minScore = minConfidence === "high" ? 75 : minConfidence === "medium" ? 55 : 0;
      allSignals = allSignals.filter(s => s.signalScore >= minScore);
    }
    
    // Sort by score desc, then time
    allSignals.sort((a, b) => {
      if (b.signalScore !== a.signalScore) {
        return b.signalScore - a.signalScore;
      }
      return b.triggeredAt - a.triggeredAt;
    });
    
    return c.json({ signals: allSignals });
  } catch (error) {
    console.log("Error fetching signals:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single signal by ID
app.get("/make-server-fc3822ec/signals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const signalData = await kv.get(`signal:${id}`);
    
    if (!signalData) {
      return c.json({ error: "Signal not found" }, 404);
    }
    
    const signal = JSON.parse(signalData as string);
    return c.json({ signal });
  } catch (error) {
    console.log("Error fetching signal:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get market detail
app.get("/make-server-fc3822ec/markets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const marketData = await kv.get(`market:${id}`);
    
    if (!marketData) {
      return c.json({ error: "Market not found" }, 404);
    }
    
    const market = JSON.parse(marketData as string);
    
    // Generate historical odds data for chart
    const history = [];
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      history.push({
        timestamp: now - (i * 60000),
        consensus: -110 + Math.sin(i / 10) * 5 + (Math.random() - 0.5) * 2,
        aiProbability: -108 + Math.cos(i / 8) * 4 + (Math.random() - 0.5) * 2,
        best: -112 + Math.sin(i / 12) * 6 + (Math.random() - 0.5) * 2
      });
    }
    
    return c.json({ 
      market,
      history,
      books: [
        { name: "DraftKings", odds: -110, updated: now - 120000 },
        { name: "FanDuel", odds: -108, updated: now - 90000 },
        { name: "BetMGM", odds: -112, updated: now - 180000 },
        { name: "Caesars", odds: -109, updated: now - 150000 },
        { name: "PointsBet", odds: -115, updated: now - 240000 }
      ]
    });
  } catch (error) {
    console.log("Error fetching market:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Generate new signals (simulates real-time polling)
app.post("/make-server-fc3822ec/signals/generate", async (c) => {
  try {
    const count = Number(c.req.query("count")) || 5;
    const newSignals = await signals.generateActiveSignals(count);
    return c.json({ signals: newSignals });
  } catch (error) {
    console.log("Error generating signals:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// User alert rules
app.get("/make-server-fc3822ec/alerts/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const alertsData = await kv.get(`user:${userId}:alerts`);
    const alerts = alertsData ? JSON.parse(alertsData as string) : [];
    return c.json({ alerts });
  } catch (error) {
    console.log("Error fetching alerts:", error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post("/make-server-fc3822ec/alerts/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    
    const alertsData = await kv.get(`user:${userId}:alerts`);
    const alerts = alertsData ? JSON.parse(alertsData as string) : [];
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      ...body,
      createdAt: Date.now()
    };
    
    alerts.push(newAlert);
    await kv.set(`user:${userId}:alerts`, JSON.stringify(alerts));
    
    return c.json({ alert: newAlert });
  } catch (error) {
    console.log("Error creating alert:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Analytics endpoint
app.get("/make-server-fc3822ec/analytics", async (c) => {
  try {
    // Mock analytics data
    const signalKeys = await kv.getByPrefix("signal:");
    const allSignals = signalKeys.map(k => JSON.parse(k.value as string) as signals.Signal);
    
    const bySport = allSignals.reduce((acc, signal) => {
      acc[signal.sport] = (acc[signal.sport] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byConfidence = {
      high: allSignals.filter(s => s.confidence === "high").length,
      medium: allSignals.filter(s => s.confidence === "medium").length,
      low: allSignals.filter(s => s.confidence === "low").length
    };
    
    // Generate mock performance data
    const performanceHistory = [];
    for (let i = 30; i >= 0; i--) {
      performanceHistory.push({
        date: Date.now() - (i * 86400000),
        winRate: 0.55 + Math.random() * 0.15,
        avgCLV: 2 + Math.random() * 3,
        signalCount: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return c.json({
      totalSignals: allSignals.length,
      bySport,
      byConfidence,
      performanceHistory,
      avgSignalScore: allSignals.reduce((sum, s) => sum + s.signalScore, 0) / allSignals.length,
      winRate: 0.582,
      avgCLV: 3.2,
      roi: 8.7
    });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);