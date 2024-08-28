
import mongoose from 'mongoose';

export interface chatTypes {
    senderId?: mongoose.Types.ObjectId | string;
    recipientId?:mongoose.Types.ObjectId | string;
  message?: string;
  media?: string;  
  messageType?: 'text'| 'image' | 'video' | 'audio' | 'file';
  timestamp?: Date;
  status? : number;
  mediaUrl?: string | undefined;
  read?: boolean;
}


export interface PopulatedUser {
  _id?: string;
  name?: string;
}

export interface PopulatedChat {
  senderId?: PopulatedUser;
  recipientId?: PopulatedUser;
}
