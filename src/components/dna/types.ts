export type ChartMethod = | ""
| "bpcontent"
| "sequence"
| "squiggle"
| "gates"
| "qi"
| "randic"
| "yau"
| "yau_bp"
| "yau_int";

export type Sequence = {
  description: string;
  sequence: string;
  type: "DNA" | "RNA"
  filename: string;
  hasAmbiguous: boolean;
  visualization: Record<string, unknown>;
  overview: Record<string, unknown>;
};

export type ParsedSequenceResult = {
  messages?: string[];
  parsedSequence?: ParsedSequence;
  success?: boolean;
};

export type ParsedSequence = {
  circular?: boolean;
  comments?: string[];
  extraLines?: string[];
  features?: string[];
  name?: string;
  sequence?: string;
  size?: number;
  type?: "DNA" | "RNA";
};

export type GeneBoardState = {
  sequences: Record<string, Sequence>;
  currentMethod:
    | "squiggle"
    | "yau"
    | "yau_bp"
    | "yau_int"
    | "randic"
    | "qi"
    | "gates";
  legendMode: "sequence" | string;
  useWasm: boolean;
  showSpinner: boolean;
};
