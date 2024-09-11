import { create } from "domain";
import { chatTypes, PopulatedChat } from "../../domain/chatMessage";
import ChatRepo from "../../useCase/interface/chatRepo";
import messageModel from "../database/chatModel";
import UserModel from "../database/userModel";
import User from "../../domain/users";


class ChatRepository implements ChatRepo {


  // sendMessage(data: chatTypes){
  //     const newMessage = new messageModel(data)
  //     const saveMessage = newMessage.save();
  //     console.log('saved');

  // }
  async sendMessage(data: chatTypes): Promise<string> {
    const newMessage = new messageModel(data);
    await newMessage.save();
    console.log('saved');
    return "saved";
  }

  async getMessages(senderId: string, receiverId: string): Promise<chatTypes[] | null> {
    const messages = await messageModel.find({
      $or: [
        { senderId: senderId, recipientId: receiverId },
        { senderId: receiverId, recipientId: senderId }
      ]
    }).sort({ createdAt: 1 })
    return messages;
  }

  async chattedUsers(senderId: string): Promise<{ _id: string; name: string; profilePicture: string }[] | null> {
    try {
      const chats = await messageModel.find({
        $or: [
          { senderId: senderId },
          { recipientId: senderId },
        ],
      })
        .populate('senderId', 'name profilePicture')
        .populate('recipientId', 'name profilePicture')
        .sort({ createdAt: -1 });


      const users = new Map<string, { _id: string; name: string; profilePicture: string }>();

      chats.forEach(chat => {
        const sender = chat.senderId as unknown as { _id: string; name: string; profilePicture: string };
        const recipient = chat.recipientId as unknown as { _id: string; name: string; profilePicture: string };

        if (sender && sender._id !== senderId) {
          users.set(sender._id.toString(), { _id: sender._id.toString(), name: sender.name, profilePicture: sender.profilePicture });
        }

        if (recipient && recipient._id !== senderId) {
          users.set(recipient._id.toString(), { _id: recipient._id.toString(), name: recipient.name, profilePicture: recipient.profilePicture });
        }
      });

      return Array.from(users.values());

    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateLastSeen(userId: string): Promise<void> {
    const update = await UserModel.findOneAndUpdate(
      { _id: userId },
      { lastSeen: new Date() }
    )
  }

  async lastSeen(): Promise<User[] | null> {
    const lastSeen = await UserModel.find({}, { _id: 1, lastSeen: 1 }).lean();

    console.log('lastSeen', lastSeen);

    return lastSeen;
  }

}

export default ChatRepository;