
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  model: "creative" | "analytical" | "ethical";
  user_id: string;
  created_at: string;
}

interface ChatInterfaceProps {
  user: User;
}

export const ChatInterface = ({ user }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"creative" | "analytical" | "ethical">("creative");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newMessage = {
      content: input,
      role: "user" as const,
      model: selectedModel,
      user_id: user.id,
    };

    try {
      // Insert the user message
      const { error: insertError } = await supabase
        .from('messages')
        .insert([newMessage]);

      if (insertError) throw insertError;

      setInput("");

      // Simulate AI response
      setTimeout(async () => {
        const aiResponse = {
          content: `AI response using ${selectedModel} model...`,
          role: "assistant" as const,
          model: selectedModel,
          user_id: user.id,
        };

        const { error: aiError } = await supabase
          .from('messages')
          .insert([aiResponse]);

        if (aiError) throw aiError;
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden glass">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Chat with OmniMind</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedModel === "creative" ? "default" : "outline"}
            onClick={() => setSelectedModel("creative")}
            className="animation-scale"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Creative
          </Button>
          <Button
            variant={selectedModel === "analytical" ? "default" : "outline"}
            onClick={() => setSelectedModel("analytical")}
            className="animation-scale"
          >
            <Bot className="w-4 h-4 mr-2" />
            Analytical
          </Button>
          <Button
            variant={selectedModel === "ethical" ? "default" : "outline"}
            onClick={() => setSelectedModel("ethical")}
            className="animation-scale"
          >
            <Bot className="w-4 h-4 mr-2" />
            Ethical
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg animation-fade ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            className="animation-scale"
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
