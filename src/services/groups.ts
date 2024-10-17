import GroupModel from "../models/Group";
import ChatModel from "../models/Chat";
import { Chat, GroupChat, MessageMedia } from "whatsapp-web.js";
import { whatsappClients } from "..";

const getGroups = async (clientId: string, remoteId: string) => {
    try {
        let response;
        if(clientId && remoteId) {
            // response = await GroupModel.find({ clientId: clientId, remoteId: remoteId });
            const whatsapp = whatsappClients.get(clientId);
            const groupObj = await whatsapp.getChatById(remoteId);
            response = groupObj as GroupChat;
        } else if(clientId) {
            // response = await GroupModel.find({ clientId: clientId });
            const whatsapp = whatsappClients.get(clientId);
            const chats = await whatsapp.getChats();
            const chatObjects = chats.filter((chat: any) => chat.isGroup);
            const groupChats = chatObjects.map((groupChat: any) => {
                const groupChatObj = groupChat as GroupChat;
                return groupChatObj;
            });
            response = groupChats;
        } else {
            response = await GroupModel.find();
        }
        
        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const createGroups = async (clientId: string, title: string, participants: Array<string>) => {
    try {
        let response;
        const whatsapp = whatsappClients.get(clientId);

        const formatedNumbers = await getFormattedNumbers(participants, whatsapp)
        console.log("PARTICIPANTS -> ", formatedNumbers)


        response = await whatsapp.createGroup(title, formatedNumbers);

        const groupId = response.gid._serialized;
        const groupObj = await whatsapp.getChatById(groupId);
        response = groupObj as GroupChat;

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
        throw e
    }
}

const getLabels = async (clientId: string, remoteId: string) => {
    try {
        let response;
        // const whatsapp = whatsappClients.get(clientId);
        // const groupObj = await whatsapp.getChatById(remoteId);
        // const group = groupObj as GroupChat;
        // response = await group.getLabels();
        response = await GroupModel.find({ clientId: clientId, remoteId: remoteId });

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const addLabels = async (clientId: string, remoteId: string, label: string) => {
    try {
        let response;
        // const whatsapp = whatsappClients.get(clientId);
        // const groupObj = await whatsapp.getChatById(remoteId);
        // const group = groupObj as GroupChat;
        response = await GroupModel.findOneAndUpdate(
            { clientId: clientId, remoteId: remoteId }, 
            { $push: { labels: label } },
            { upsert: true, new: true }
        );

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const deleteLabels = async (clientId: string, remoteId: string, label: string) => {
    try {
        let response;
        // const whatsapp = whatsappClients.get(clientId);
        // const groupObj = await whatsapp.getChatById(remoteId);
        // const group = groupObj as GroupChat;
        // response = await group.changeLabels([labelId]);
        response = await GroupModel.deleteOne(
            { clientId: clientId, remoteId: remoteId },
            { $pull: { labels: label } },
        );

        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const updateGroups = async (clientId: string, remoteId?: string, subject?: string, description?: string, mimeType?: string, media?: string, withLabel?: string, adminsOnly?: boolean) => {
    try {
        let response;
        if (clientId && remoteId) {
            const whatsapp = whatsappClients.get(clientId);
            const groupObj = await whatsapp.getChatById(remoteId);
            const group = groupObj as GroupChat;
            if (subject) {
                response = await group.setSubject(subject);
            }
            if (description) {
                response = await group.setDescription(description);
            }
            if (mimeType && media) {
                const pictureMedia = new MessageMedia(mimeType, media);
                response = await group.setPicture(pictureMedia);
            }
            if (adminsOnly) {
                response = await group.setInfoAdminsOnly();
                response = await group.setMessagesAdminsOnly();
            }
        } else if (clientId && withLabel) {
            const whatsapp = whatsappClients.get(clientId);
            const groupChatsWithLabel = await ChatModel.find(
                { 
                    clientId: clientId, 
                    labels: { $elemMatch: { $eq: withLabel } } 
                }
            );

            groupChatsWithLabel.forEach(async (document) => {
                const groupObj = await whatsapp.getChatById(document.remoteId);
                const group = groupObj as GroupChat;
                if (subject) {
                    response = await group.setSubject(subject);
                }
                if (description) {
                    response = await group.setDescription(description);
                }
                if (mimeType && media) {
                    const pictureMedia = new MessageMedia(mimeType, media);
                    response = await group.setPicture(pictureMedia);
                }
                if (adminsOnly) {
                    response = await group.setInfoAdminsOnly();
                    response = await group.setMessagesAdminsOnly();
                }
            });
        }
        return response;
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const getInvites = async (clientId: string, remoteId?: string, label?: string) => {
    try {
        let response;
        if (clientId && remoteId) {
            const whatsapp = whatsappClients.get(clientId);
            const groupObj = await whatsapp.getChatById(remoteId);
            const group = groupObj as GroupChat;
            response = await group.getInviteCode();

        } else if (clientId && label) {
            const whatsapp = whatsappClients.get(clientId);
            const groupChatsWithLabel = await ChatModel.find(
                { 
                    clientId: clientId, 
                    labels: { $elemMatch: { $eq: label } } 
                }
            );

            for (let index = 0; index < groupChatsWithLabel.length; index++) {
                const element = groupChatsWithLabel[index];
                const groupObj = await whatsapp.getChatById(element.remoteId);
                const group = groupObj as GroupChat;
                const participantsQuantity = group.participants.length;
                const MAX_PARTICIPANTS_ALLOWED = 1024;

                if (participantsQuantity < MAX_PARTICIPANTS_ALLOWED) {
                    response = await group.getInviteCode();
                    break;
                }
            }
        }
        return response;
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const deleteGroups = async (clientId: string, remoteId: string) => {
    try {
        let response;
        if(clientId && remoteId){
            const whatsapp = whatsappClients.get(clientId);
            const groupObj = await whatsapp.getChatById(remoteId);
            const group = groupObj as GroupChat;
            response = await group.leave();
            response = await group.delete();
            // response = await GroupModel.updateMany({ clientId: clientId, remoteId: remoteId }, { messages: [] });
        } else {
            response = await GroupModel.find();
        }
        
        return response;
   
    } catch (e: any) {
        console.log("ERROR -> ", e);
    }
}

const GroupService = {
    getGroups,
    createGroups,
    getLabels,
    addLabels,
    deleteLabels,
    updateGroups,
    getInvites,
    deleteGroups
}

export default GroupService;



async function getFormattedNumbers(remoteIds:Array<String>, whatsapp: any) {
    // Supondo que whatsapp.getNumberId(remoteId) retorne uma Promise com o número formatado
    const formattedNumbers = await Promise.all(remoteIds.map(async (remoteId: any) => {
        const formattedNumber = await whatsapp.getNumberId(remoteId);
        return formattedNumber._serialized;
    }));
    return formattedNumbers;
}