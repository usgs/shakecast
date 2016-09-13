import { Subject } from "rxjs/Rx";
import { NotificationEvent } from "./notification-event";
import { Notification } from "./notification";
export declare class NotificationsService {
    private _emitter;
    set(notification: Notification, to: boolean): Notification;
    getChangeEmitter(): Subject<NotificationEvent>;
    success(title: string, content: string, override?: any): Notification;
    error(title: string, content: string, override?: any): Notification;
    alert(title: string, content: string, override?: any): Notification;
    info(title: string, content: string, override?: any): Notification;
    bare(title: string, content: string, override?: any): Notification;
    create(title: string, content: string, type: string, override?: any): Notification;
    html(html: any, type: string, override?: any): Notification;
    remove(id?: string): void;
}
