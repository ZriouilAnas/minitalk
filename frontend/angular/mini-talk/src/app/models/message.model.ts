export interface Message {
  id: string;
  pseudo: string;
  content: string;
  type: 'normal' | 'important' | 'urgent';
  timestamp: string | Date;
  senderId: string;
}
