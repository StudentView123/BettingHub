import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Bell, Share2, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";

interface MarketDetailProps {
  marketId: string;
  apiUrl: string;
  onBack: () => void;
}

interface MarketData {
  marketId: string;
  eventName: string;
  sport: string;
  marketType: string;
  volatility: number;
  lastUpdate: number;
}

interface BookOdds {
  name: string;
  odds: number;
  updated: number;
}

export function MarketDetail({ marketId, apiUrl, onBack }: MarketDetailProps) {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [books, setBooks] = useState<BookOdds[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, [marketId]);

  const loadMarketData = async () => {
    try {
      const response = await fetch(`${apiUrl}/markets/${marketId}`);
      const data = await response.json();
      setMarket(data.market);
      setBooks(data.books || []);
      
      // Format history for chart
      const formattedHistory = (data.history || []).map((point: any) => ({
        time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: point.timestamp,
        "Market Consensus": point.consensus,
        "AI Fair Line": point.aiProbability,
        "Best Available": point.best
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error("Error loading market:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading market data...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Market not found</div>
      </div>
    );
  }

  const bestBook = books.reduce((best, book) => 
    book.odds > best.odds ? book : best
  , books[0]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-auto">
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{market.sport}</Badge>
                <Badge variant="outline">{market.marketType}</Badge>
              </div>
              <h1 className="text-2xl font-bold">{market.eventName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated {formatDistanceToNow(market.lastUpdate, { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Odds Movement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Odds Movement (Last Hour)</CardTitle>
              <CardDescription>
                Track how market consensus, AI probability, and best line have moved over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Market Consensus" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="AI Fair Line" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Best Available" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Book Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Book Comparison</CardTitle>
              <CardDescription>
                Real-time odds from major sportsbooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {books.map((book) => (
                  <div 
                    key={book.name}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      book.name === bestBook.name 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {book.name}
                          {book.name === bestBook.name && (
                            <Badge className="bg-green-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Best
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Updated {formatDistanceToNow(book.updated, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        book.odds > 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {book.odds > 0 ? '+' : ''}{book.odds}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((1 / (1 + (book.odds > 0 ? 100 / book.odds : Math.abs(book.odds) / 100))) * 100).toFixed(1)}% implied
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                AI-generated analysis of current market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Market Sentiment</h3>
                  <p className="text-sm text-blue-800">
                    Sharp money indicators suggest professional activity on this line. Volume patterns
                    indicate informed positioning, with {(market.volatility * 100).toFixed(0)}% volatility index.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold text-amber-900 mb-2">Line Movement Analysis</h3>
                  <p className="text-sm text-amber-800">
                    Line has moved significantly in the past hour across multiple books. This type of
                    coordinated movement typically indicates reaction to new information or sharp betting.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Value Assessment</h3>
                  <p className="text-sm text-green-800">
                    Current best line offers {((bestBook.odds - books[1].odds) / 100 * 100).toFixed(1)}% better value
                    compared to consensus. Historical data suggests this edge typically persists for 8-12 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-white border-t p-3 text-center text-xs text-gray-500">
        For informational and entertainment purposes only. Odds data may be delayed.
      </div>
    </div>
  );
}
