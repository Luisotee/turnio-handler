import { Coordinates } from "./index";
import { MediaItem } from "./fire";

export interface AlertRequestBody {
  lat: string;
  lon: string;
  municipality: string;
  state: string;
  local_especification: string;
  location: Coordinates;
  commentary: string;
  imageId?: string;
  audioId?: string;
  cpf: string;
  password: string;
}

export interface AlertPayload {
  municipality: string;
  state: string;
  alert_date: string;
  local_especification: string;
  location: Coordinates;
  commentary: string;
  images: MediaItem[];
  audios: MediaItem[];
  alert_seq: string;
  false_alert: boolean;
  false_alert_commentary: string;
  nasa_api: Record<string, unknown>;
  fire: null;
}
