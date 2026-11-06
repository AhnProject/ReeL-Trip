import { useLocalSearchParams } from "expo-router";
import { ChatScreen } from "@/features/chat/ChatScreen";

export default function ChatRoute() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  return <ChatScreen spaceId={Number(spaceId)} />;
}
