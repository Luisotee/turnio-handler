interface State {
  value: string;
  text: string;
}

const states: State[] = [
  { value: "AC", text: "Acre" },
  { value: "AL", text: "Alagoas" },
  { value: "AP", text: "Amapá" },
  { value: "AM", text: "Amazonas" },
  { value: "BA", text: "Bahia" },
  { value: "CE", text: "Ceará" },
  { value: "DF", text: "Distrito Federal" },
  { value: "ES", text: "Espírito Santo" },
  { value: "GO", text: "Goiás" },
  { value: "MA", text: "Maranhão" },
  { value: "MT", text: "Mato Grosso" },
  { value: "MS", text: "Mato Grosso do Sul" },
  { value: "MG", text: "Minas Gerais" },
  { value: "PA", text: "Pará" },
  { value: "PB", text: "Paraíba" },
  { value: "PR", text: "Paraná" },
  { value: "PE", text: "Pernambuco" },
  { value: "PI", text: "Piauí" },
  { value: "RJ", text: "Rio de Janeiro" },
  { value: "RN", text: "Rio Grande do Norte" },
  { value: "RS", text: "Rio Grande do Sul" },
  { value: "RO", text: "Rondônia" },
  { value: "RR", text: "Roraima" },
  { value: "SC", text: "Santa Catarina" },
  { value: "SP", text: "São Paulo" },
  { value: "SE", text: "Sergipe" },
  { value: "TO", text: "Tocantins" },
];

const stateToUF: Record<string, string> = states.reduce(
  (acc, state) => ({
    ...acc,
    [state.text]: state.value,
  }),
  {}
);

const fireStatusToValue: Record<string, number> = {
  Detectado: 1,
  "Em combate": 2,
  Controlado: 3,
  Extinto: 4,
};

export function convertStateToUF(stateName: string): string {
  return stateToUF[stateName] || stateName;
}

export function getFireStatusValue(status: string): number {
  return fireStatusToValue[status] || 1;
}

export function parseDateToISO(dateStr: string): string {
  return new Date(dateStr).toISOString();
}
