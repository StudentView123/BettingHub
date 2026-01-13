// Signal generation and market analysis engine
import * as kv from "./kv_store.tsx";

export interface Signal {
  id: string;
  eventId: string;
  eventName: string;
  sport: string;
  marketType: string;
  triggeredAt: number;
  
  // Signal metadata
  signalScore: number; // 0-100
  edge: number; // percentage edge
  confidence: "low" | "medium" | "high";
  
  // Market data
  bestLine: {
    book: string;
    odds: number;
    price: string;
  };
  consensus: {
    implied: number;
    odds: number;
  };
  aiProbability: number;
  
  // Signal explanation
  trigger: string;
  explanation: string;
  whatChanged: string;
  riskLabel: "low" | "medium" | "high";
  
  // Movement data
  oddsMovement: {
    from: number;
    to: number;
    timeWindow: string;
  };
  
  volatility: "stable" | "normal" | "high" | "extreme";
  timeToStart: number; // minutes
}

export interface MarketState {
  marketId: string;
  eventId: string;
  eventName: string;
  sport: string;
  marketType: string;
  
  lastOdds: Record<string, number>;
  impliedProbability: number;
  volatility: number;
  momentum: number;
  lastUpdate: number;
  
  pollingCadence: number; // milliseconds
}

// Generate mock signal based on market conditions
export function generateSignal(marketState: MarketState): Signal | null {
  const now = Date.now();
  const timeSinceUpdate = now - marketState.lastUpdate;
  
  // Only generate signals for volatile markets
  if (marketState.volatility < 0.3) {
    return null;
  }
  
  const edge = Math.random() * 8 + 2; // 2-10% edge
  const signalScore = Math.min(100, Math.round(
    (marketState.volatility * 40) + 
    (edge * 5) + 
    (Math.random() * 20)
  ));
  
  const books = ["DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet"];
  const bestBook = books[Math.floor(Math.random() * books.length)];
  const bestOdds = -110 + Math.floor(Math.random() * 40);
  
  const aiProb = 0.5 + (Math.random() - 0.5) * 0.3;
  const consensus = 0.5 + (Math.random() - 0.5) * 0.2;
  
  const triggers = [
    "Odds movement over 15 points in 5 minutes",
    "AI probability divergence from market consensus exceeds 8%",
    "Cross-book arbitrage opportunity detected",
    "Sharp money indicators across 3+ books",
    "Historical pattern match with 73% win rate"
  ];
  
  const explanations = [
    "Market overreaction to public sentiment. Our AI model shows the line has moved too far.",
    "Early sharp action from known professional groups. This typically precedes additional movement.",
    "Weather conditions favor the under. Public is heavily on the over, creating value.",
    "Injury news not fully priced in by the market. Model adjusts for lineup impact.",
    "Historical matchup data suggests current line is inefficient by ~6%."
  ];
  
  return {
    id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventId: marketState.eventId,
    eventName: marketState.eventName,
    sport: marketState.sport,
    marketType: marketState.marketType,
    triggeredAt: now,
    
    signalScore,
    edge,
    confidence: signalScore > 75 ? "high" : signalScore > 55 ? "medium" : "low",
    
    bestLine: {
      book: bestBook,
      odds: bestOdds,
      price: bestOdds > 0 ? `+${bestOdds}` : `${bestOdds}`
    },
    consensus: {
      implied: consensus,
      odds: Math.round(-110 + (consensus - 0.5) * 100)
    },
    aiProbability: aiProb,
    
    trigger: triggers[Math.floor(Math.random() * triggers.length)],
    explanation: explanations[Math.floor(Math.random() * explanations.length)],
    whatChanged: `Line moved from ${bestOdds - 15} to ${bestOdds} across majority of books in last ${Math.floor(timeSinceUpdate / 60000)} minutes`,
    riskLabel: marketState.volatility > 0.7 ? "high" : marketState.volatility > 0.4 ? "medium" : "low",
    
    oddsMovement: {
      from: bestOdds - 15,
      to: bestOdds,
      timeWindow: "5m"
    },
    
    volatility: marketState.volatility > 0.7 ? "extreme" : marketState.volatility > 0.5 ? "high" : "normal",
    timeToStart: Math.floor(Math.random() * 180) + 30 // 30-210 minutes
  };
}

// Initialize some mock market states
export async function initializeMockMarkets() {
  const sports = ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB"];
  const marketTypes = ["Moneyline", "Spread", "Total", "Player Props"];
  
  const teams = {
    NFL: ["Chiefs", "Bills", "49ers", "Cowboys", "Eagles", "Ravens"],
    NBA: ["Lakers", "Celtics", "Warriors", "Nets", "Bucks", "Nuggets"],
    MLB: ["Yankees", "Dodgers", "Astros", "Braves", "Red Sox", "Mets"],
    NHL: ["Maple Leafs", "Lightning", "Avalanche", "Rangers", "Bruins", "Oilers"],
    NCAAF: ["Alabama", "Georgia", "Ohio State", "Michigan", "Texas", "USC"],
    NCAAB: ["Duke", "Kansas", "UNC", "Kentucky", "Gonzaga", "Villanova"]
  };
  
  const markets: MarketState[] = [];
  
  for (let i = 0; i < 25; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const sportTeams = teams[sport as keyof typeof teams];
    const team1 = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    let team2 = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    while (team2 === team1) {
      team2 = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    }
    
    const marketState: MarketState = {
      marketId: `market-${i}`,
      eventId: `event-${i}`,
      eventName: `${team1} @ ${team2}`,
      sport,
      marketType: marketTypes[Math.floor(Math.random() * marketTypes.length)],
      lastOdds: {
        "DraftKings": -110,
        "FanDuel": -108,
        "BetMGM": -112
      },
      impliedProbability: 0.5 + (Math.random() - 0.5) * 0.2,
      volatility: Math.random(),
      momentum: Math.random() * 2 - 1,
      lastUpdate: Date.now() - Math.floor(Math.random() * 300000),
      pollingCadence: 10000
    };
    
    markets.push(marketState);
    await kv.set(`market:${marketState.marketId}`, JSON.stringify(marketState));
  }
  
  return markets;
}

// Generate active signals
export async function generateActiveSignals(count: number = 10): Promise<Signal[]> {
  // Get all markets
  const marketKeys = await kv.getByPrefix("market:");
  const markets = marketKeys.map(k => JSON.parse(k.value as string) as MarketState);
  
  // Sort by volatility and generate signals
  const sortedMarkets = markets.sort((a, b) => b.volatility - a.volatility);
  const signals: Signal[] = [];
  
  for (let i = 0; i < Math.min(count, sortedMarkets.length); i++) {
    const signal = generateSignal(sortedMarkets[i]);
    if (signal) {
      signals.push(signal);
      await kv.set(`signal:${signal.id}`, JSON.stringify(signal));
    }
  }
  
  return signals;
}

// Compute signal score based on multiple factors
export function computeSignalScore(params: {
  edgeSize: number;
  speed: number;
  persistence: number;
  marketStability: number;
  historicalPerformance: number;
}): number {
  const {
    edgeSize,
    speed,
    persistence,
    marketStability,
    historicalPerformance
  } = params;
  
  // Weighted scoring
  const score = 
    (edgeSize * 0.3) +
    (speed * 0.2) +
    (persistence * 0.2) +
    (marketStability * 0.1) +
    (historicalPerformance * 0.2);
  
  return Math.min(100, Math.max(0, Math.round(score)));
}
