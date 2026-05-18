import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatPage() {
  return (
    <Card className="bg-white/[0.03]">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>AI Tutoring Chat</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChatContainer />
      </CardContent>
    </Card>
  );
}
