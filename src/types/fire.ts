import { Coordinates } from "./index";

export interface FireRequestBody {
  lat: string;
  lon: string;
  municipality: string;
  state: string;
  address: string;
  fire_date: string;
  fire_type: string;
  fire_name: string;
  fire_status: string;
  imageId?: string;
  audioId?: string;
  description: string;
  cpf: string;
  password: string;
}

export interface AudioResponse {
  url: string;
  title: string;
}

export interface ImageResponse {
  url: string;
  thumb: string;
}

export type UploadResponse = ImageResponse | AudioResponse;

export interface MediaItem {
  url: string;
  thumb?: string;
  title?: string;
}

export interface FirePayload {
  municipality: string;
  state: string;
  fire_date: string;
  fire_name: string;
  fire_type: string;
  fire_status: number; // Changed from string to number
  address: string;
  description: string;
  area: number;
  group: string;
  priority: string;
  location_reference: string;
  location: Coordinates;
  images: MediaItem[];
  audios: MediaItem[];
}
