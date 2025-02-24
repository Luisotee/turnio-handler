export interface RacRequestBody {
  municipality: string;
  state: string;
  rac_type: string;
  users_involved: string;
  start_rac_date: string;
  start_rac_time: string;
  cpf: string;
  password: string;
}

export interface RacPayload {
  municipality: string;
  state: string;
  rac_type: string;
  users_involved: number;
  start_rac_date: string;
  start_rac_time: string;
}

export interface RacResponse {
  message: string;
}
