export interface RacRequestBody {
  municipality: string;
  state: string;
  rac_type: string;
  users_involved: string;
  start_rac_date: string;
  start_rac_time: string;
  cpf: string;
  password: string;
  location: {
    type: "Point";
    coordinates: [string, string];
  };
}

export interface RacPayload {
  municipality: string;
  state: string;
  rac_type: string;
  users_involved: number;
  start_rac_date: string;
  start_rac_time: string;
  local_especification: string;
  commentary: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface RacResponse {
  message: string;
}
