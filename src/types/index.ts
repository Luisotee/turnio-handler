export interface LoginCredentials {
  cpf: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Coordinates {
  type: "Point";
  coordinates: [number, number];
}
