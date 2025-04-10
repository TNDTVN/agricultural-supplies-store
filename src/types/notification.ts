export interface Notification {
    notificationID: number;
    title: string;
    content: string;
    senderID: number;
    receiverID?: number | null;
    createdDate: string;
    read: boolean;
    senderName?: string;
    receiverName?: string;
}
