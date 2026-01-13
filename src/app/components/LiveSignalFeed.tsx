import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { TrendingUp, TrendingDown, Eye, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Signal {
  id: string;
  eventId: string;
  eventName: string;
  sport: string;
  marketType: string;
  triggeredAt: number;
  signalScore: number;
  edge: number;
  confidence: "low" | "medium" | "high";
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
  trigger: string;
  explanation: string;
  whatChanged: string;
  riskLabel: "low" | "medium" | "high";
  oddsMovement: {
    from: number;
    to: number;
    timeWindow: string;
  };
  volatility: string;
  timeToStart: number;
}

interface LiveSignalFeedProps {
  onSignalClick: (signalId: string) => void;
  onMarketClick: (marketId: string) => void;
  apiUrl: string;
}

export function LiveSignalFeed({ onSignalClick, onMarketClick, apiUrl }: LiveSignalFeedProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");

  useEffect(() => {
    loadSignals();
    const interval = setInterval(loadSignals, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [sportFilter, confidenceFilter]);

  const loadSignals = async () => {
    try {
      const params = new URLSearchParams();
      if (sportFilter !== "all") params.append("sport", sportFilter);
      if (confidenceFilter !== "all") params.append("minConfidence", confidenceFilter);
      
      const response = await fetch(`${apiUrl}/signals?${params.toString()}`);
      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error("Error loading signals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 55) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: "bg-green-100 text-green-800 border-green-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[confidence as keyof typeof colors];
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Live Signal Feed</h1>
          <div className="flex gap-3 flex-wrap">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="NFL">NFL</SelectItem>
                <SelectItem value="NBA">NBA</SelectItem>
                <SelectItem value="MLB">MLB</SelectItem>
                <SelectItem value="NHL">NHL</SelectItem>
                <SelectItem value="NCAAF">NCAAF</SelectItem>
                <SelectItem value="NCAAB">NCAAB</SelectItem>
              </SelectContent>
            </Select>

            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High Only</SelectItem>
                <SelectItem value="medium">Medium+</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadSignals} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading signals...</div>
          ) : signals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No signals found</div>
          ) : (
            signals.map((signal) => (
              <Card
                key={signal.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onMarketClick(signal.eventId.replace('event-', 'market-'))}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{signal.sport}</Badge>
                        <Badge variant="outline">{signal.marketType}</Badge>
                        <Badge className={getConfidenceBadge(signal.confidence)}>
                          {signal.confidence.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{signal.eventName}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {signal.timeToStart} min to start
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{formatDistanceToNow(signal.triggeredAt, { addSuffix: true })}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white ${getScoreColor(signal.signalScore)}`}>
                        <span className="text-2xl font-bold">{signal.signalScore}</span>
                        <span className="text-xs">SCORE</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {signal.edge.toFixed(1)}% edge
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      {signal.oddsMovement.to > signal.oddsMovement.from ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{signal.trigger}</span>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">{signal.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Best Line</div>
                        <div className="font-semibold">{signal.bestLine.book}</div>
                        <div className="text-lg font-bold text-green-600">{signal.bestLine.price}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Consensus</div>
                        <div className="font-semibold">Market Avg</div>
                        <div className="text-lg font-bold">{signal.consensus.odds}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">AI Probability</div>
                        <div className="text-lg font-bold">{(signal.aiProbability * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Volatility</div>
                        <Badge variant={signal.volatility === "extreme" ? "destructive" : "outline"}>
                          {signal.volatility}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarketClick(signal.eventId.replace('event-', 'market-'));
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Market
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Watchlist feature would be implemented here");
                        }}
                      >
                        Add to Watchlist
                      </Button>
                    </div>

                    {signal.riskLabel === "high" && (
                      <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p className="text-xs text-amber-900">
                          High uncertainty market. Signal based on volatile data. Exercise additional caution.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="bg-white border-t p-3 text-center text-xs text-gray-500">
        For informational and entertainment purposes only. Not investment or gambling advice.
      </div>
    </div>
  );
}
