
import { useEffect } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const Index = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">OmniMind AI</h1>
          </div>
          {session ? (
            <Button onClick={handleLogout} variant="outline">
              Sign Out
            </Button>
          ) : (
            <Button onClick={handleLogin} className="animation-scale">
              Sign In with GitHub
            </Button>
          )}
        </div>
        {session ? (
          <ChatInterface user={session.user} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to OmniMind AI</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Sign in to start chatting with our AI assistant and unlock the full potential of OmniMind.
            </p>
            <Button onClick={handleLogin} size="lg" className="animation-scale">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
