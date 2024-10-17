import UserModel from "../models/User";
import ChatModel from "../models/Chat";
import { MessageMedia } from "whatsapp-web.js";
import { whatsappClients } from "..";

const getMessages = async (clientId: string, userId: string) => {
  try {
    let response;
    if (clientId && userId) {
      response = await UserModel.find({ clientId: clientId, userId: userId });
    } else if (clientId) {
      response = await UserModel.find({ clientId: clientId });
    } else {
      response = await UserModel.find();
    }

    return response;
  } catch (e: any) {
    console.log("ERROR -> ", e);
  }
};

const createMessages = async (
  clientId: string,
  remoteId: string,
  userId: string,
  message: string,
  mimeType?: string,
  media?: string,
  isTemplate?: boolean,
  template?: any
) => {
  try {
    let response;
    if (isTemplate && template) {
      const whatsapp = whatsappClients.get(clientId);
      //   response = await whatsapp.sendMessage(remoteId, template.text);
      console.log("RESPONSE MESSAGE -> ", response);
      // update counter
      response = await UserModel.findOneAndUpdate(
        {
          _id: userId,
          "templates._id": template._id, // Match the template within the array
        },
        {
          $inc: { "templates.$[elem].count": 1 }, // Increment count within the matched template
        },
        {
          returnOriginal: false, // To return the updated document
          arrayFilters: [{ "elem._id": template._id }], // Filter array element to update
        }
      );

      console.log("RESPONSE -> ", response);
    } else if (mimeType && media) {
      const messageMedia = new MessageMedia(mimeType, media);
      const whatsapp = whatsappClients.get(clientId);
      response = await whatsapp.sendMessage(userId, messageMedia);
    } else {
      const whatsapp = whatsappClients.get(clientId);
      response = await whatsapp.sendMessage(userId, message);
    }

    return response;
  } catch (e: any) {
    console.log("ERROR -> ", e);
  }
};

const deleteMessages = async (clientId: string, userId: string) => {
  try {
    let response;
    if (clientId && userId) {
      response = await UserModel.updateMany(
        { clientId: clientId, userId: userId },
        { messages: [] }
      );
    } else if (clientId) {
      response = await UserModel.updateMany(
        { clientId: clientId },
        { messages: [] }
      );
    } else {
      response = await UserModel.find();
    }

    return response;
  } catch (e: any) {
    console.log("ERROR -> ", e);
  }
};

const MessageService = {
  getMessages,
  deleteMessages,
  createMessages,
};

export default MessageService;
