export declare class PushNotificationsService {
    canActivate: boolean;
    activate(): {
        success: boolean;
        message?: string;
    };
}
export interface PushNotification {
    title: string;
    body: string;
}
