
import mongoose from 'mongoose';

export interface chatTypes {
    senderId?: mongoose.Types.ObjectId | string;
    recipientId?:mongoose.Types.ObjectId | string;
  message?: string;
  media?: string;  
  messageType?: 'text' | 'image' | 'video';
  timestamp?: Date;
  status? : number
}


export interface PopulatedUser {
  _id?: string;
  name?: string;
}

export interface PopulatedChat {
  senderId?: PopulatedUser;
  recipientId?: PopulatedUser;
}
