import fs from "fs/promises";
import path from "path";
import {
  NotificationCount,
  NotificationStatus,
  UserNotification,
} from "../types/notification";

const STORAGE_DIR = path.join(__dirname, "../../data/notifications");
const STORAGE_FILE = "user-notifications.json";

export class NotificationService {
  private storagePath: string;

  constructor() {
    this.storagePath = path.join(STORAGE_DIR, STORAGE_FILE);
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
      if (!(await this.exists())) {
        await this.saveNotifications({});
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  private async exists(): Promise<boolean> {
    try {
      await fs.access(this.storagePath);
      return true;
    } catch {
      return false;
    }
  }

  private async loadNotifications(): Promise<Record<string, UserNotification>> {
    const data = await fs.readFile(this.storagePath, "utf-8");
    return JSON.parse(data);
  }

  private async saveNotifications(data: Record<string, UserNotification>): Promise<void> {
    await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2));
  }

  async updateUserNotification(
    cpf: string,
    counts: NotificationCount
  ): Promise<NotificationStatus> {
    const notifications = await this.loadNotifications();
    const now = new Date().toISOString();
    const current = notifications[cpf];

    // Determine if there are new events
    const totalEvents = counts.fires + counts.racs;

    // Generate friendly message
    let message = "";
    if (totalEvents === 0) {
      message =
        "🌿 Tudo tranquilo por aqui! Não há novos focos de incêndio ou RACs para verificar.";
    } else {
      const parts = [];
      if (counts.fires > 0) {
        parts.push(
          `🔥 ${counts.fires} ${
            counts.fires === 1 ? "novo foco de incêndio" : "novos focos de incêndio"
          }`
        );
      }
      if (counts.racs > 0) {
        parts.push(`📝 ${counts.racs} ${counts.racs === 1 ? "novo RAC" : "novos RACs"}`);
      }
      message = `⚠️ Atenção! Você tem:\n${parts.join(
        "\n"
      )}\n\nPor favor, verifique o sistema para mais detalhes.`;
    }

    // Update storage
    notifications[cpf] = {
      cpf,
      lastChecked: now,
      newEvent: totalEvents > 0,
      eventType: totalEvents > 0 ? (counts.fires > counts.racs ? "fire" : "rac") : null,
    };
    await this.saveNotifications(notifications);

    return { message };
  }
}
