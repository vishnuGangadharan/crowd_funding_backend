
import mongoose from 'mongoose';

export interface chatTypes {
    senderId: mongoose.Types.ObjectId | string;
  receiverId:mongoose.Types.ObjectId | string;
  message: string;
  media?: string;  
  messageType: 'text' | 'image' | 'video';
  timestamp: Date;
}