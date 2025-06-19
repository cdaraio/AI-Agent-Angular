
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: Date;
  animation: string;
  data?: {
    rooms?: any[];
    map?: string;
  };
}
