
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles } from "lucide-react";

interface Message {
  content: string;
  role: "user" | "assistant";
  model: "creative" | "analytical" | "ethical";
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"creative" | "analytical" | "ethical">("creative");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      content: input,
      role: "user",
      model: selectedModel
    };
    
    setMessages([...messages, newMessage]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        content: `AI response using ${selectedModel} model...`,
        role: "assistant",
        model: selectedModel
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-2rem)] m-4 overflow-hidden glass">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">OmniMind Chat</h2>
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
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg animation-fade ${
                message.role === "user"
                  ? "bg-primary text-white"
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
          />
          <Button onClick={handleSend} className="animation-scale">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
