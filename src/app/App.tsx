import { useState, useEffect } from "react";
import { LiveSignalFeed } from "@/app/components/LiveSignalFeed";
import { MarketDetail } from "@/app/components/MarketDetail";
import { Analytics } from "@/app/components/Analytics";
import { Button } from "@/app/components/ui/button";
import { Home, BarChart3, Bell, User, Activity } from "lucide-react";
import { Toaster, toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

type View = "feed" | "market" | "analytics" | "alerts" | "profile";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("feed");
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-fc3822ec`;

  // Initialize the app with mock data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const response = await fetch(`${apiUrl}/init`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInitialized(true);
        toast.success(`Initialized with ${data.signals} active signals`);
      }
    } catch (error) {
      console.error("Error initializing app:", error);
      toast.error("Failed to initialize. Please refresh the page.");
    }
  };

  const handleMarketClick = (marketId: string) => {
    setSelectedMarketId(marketId);
    setCurrentView("market");
  };

  const handleBackToFeed = () => {
    setCurrentView("feed");
    setSelectedMarketId(null);
  };

  if (!initialized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 text-indigo-600 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Signalry</h2>
          <p className="text-gray-600">Loading sports intelligence platform...</p>
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              Signalry
            </h1>
          </div>
        </div>

        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <div className="md:w-64 bg-gray-900 text-white flex md:flex-col order-last md:order-first">
          <div className="hidden md:block p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-8">
              <Activity className="w-8 h-8 text-indigo-400" />
              Signalry
            </h1>
            <nav className="space-y-2">
              <Button
                variant={currentView === "feed" ? "secondary" : "ghost"}
                className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                onClick={() => setCurrentView("feed")}
              >
                <Home className="w-4 h-4 mr-3" />
                Live Signals
              </Button>
              <Button
                variant={currentView === "analytics" ? "secondary" : "ghost"}
                className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                onClick={() => setCurrentView("analytics")}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Analytics
              </Button>
              <Button
                variant={currentView === "alerts" ? "secondary" : "ghost"}
                className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                onClick={() => {
                  setCurrentView("alerts");
                  toast.info("Alerts Center - Coming soon!");
                }}
              >
                <Bell className="w-4 h-4 mr-3" />
                Alerts
              </Button>
              <Button
                variant={currentView === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                onClick={() => {
                  setCurrentView("profile");
                  toast.info("Profile & Settings - Coming soon!");
                }}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Button>
            </nav>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden flex w-full border-t">
            <Button
              variant="ghost"
              className={`flex-1 flex-col h-16 rounded-none ${
                currentView === "feed" ? "bg-gray-800" : ""
              }`}
              onClick={() => setCurrentView("feed")}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Signals</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 flex-col h-16 rounded-none ${
                currentView === "analytics" ? "bg-gray-800" : ""
              }`}
              onClick={() => setCurrentView("analytics")}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs mt-1">Analytics</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 flex-col h-16 rounded-none ${
                currentView === "alerts" ? "bg-gray-800" : ""
              }`}
              onClick={() => {
                setCurrentView("alerts");
                toast.info("Alerts Center - Coming soon!");
              }}
            >
              <Bell className="w-5 h-5" />
              <span className="text-xs mt-1">Alerts</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 flex-col h-16 rounded-none ${
                currentView === "profile" ? "bg-gray-800" : ""
              }`}
              onClick={() => {
                setCurrentView("profile");
                toast.info("Profile & Settings - Coming soon!");
              }}
            >
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profile</span>
            </Button>
          </div>

          {/* Desktop Footer */}
          <div className="hidden md:block mt-auto p-6 border-t border-gray-800">
            <p className="text-xs text-gray-400">
              © 2026 Signalry
            </p>
            <p className="text-xs text-gray-500 mt-2">
              For informational purposes only
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === "feed" && (
            <LiveSignalFeed
              apiUrl={apiUrl}
              onSignalClick={(id) => console.log("Signal clicked:", id)}
              onMarketClick={handleMarketClick}
            />
          )}
          
          {currentView === "market" && selectedMarketId && (
            <MarketDetail
              marketId={selectedMarketId}
              apiUrl={apiUrl}
              onBack={handleBackToFeed}
            />
          )}
          
          {currentView === "analytics" && (
            <Analytics apiUrl={apiUrl} />
          )}
          
          {currentView === "alerts" && (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-3">
                <Bell className="w-16 h-16 text-gray-400 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Alerts Center</h2>
                <p className="text-gray-600 max-w-md">
                  Create custom alert rules based on signal score, sport, market type, and more.
                  Get notified when high-value opportunities match your criteria.
                </p>
                <Button onClick={() => toast.info("Feature coming soon!")}>
                  Create Alert Rule
                </Button>
              </div>
            </div>
          )}
          
          {currentView === "profile" && (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-3">
                <User className="w-16 h-16 text-gray-400 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Profile & Preferences</h2>
                <p className="text-gray-600 max-w-md">
                  Customize your experience with favorite sports, risk tolerance settings,
                  notification preferences, and more.
                </p>
                <Button onClick={() => toast.info("Feature coming soon!")}>
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Toaster position="top-right" richColors />
    </>
  );
}
