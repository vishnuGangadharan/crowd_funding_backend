
import mongoose from 'mongoose';

export interface chatTypes {
    senderId: mongoose.Types.ObjectId;
  receiverId:mongoose.Types.ObjectId;
  message: string;
  media?: string;  
  messageType: 'text' | 'image' | 'video';
  timestamp: Date;
}