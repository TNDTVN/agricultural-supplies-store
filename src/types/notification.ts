export interface Notification {
    notificationID: number;
    title: string;
    content: string;
    senderID: number;
    receiverID: number;
    createdDate: string; // ISO Date String
    isRead: boolean;
}
