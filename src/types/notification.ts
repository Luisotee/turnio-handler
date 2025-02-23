export interface UserNotification {
  cpf: string;
  lastChecked: string;
  newEvent: boolean;
  eventType: "fire" | "rac" | null;
}

export interface NotificationCount {
  fires: number;
  racs: number;
}

export interface NotificationStatus {
  message: string; // Changed to return a formatted message
}
