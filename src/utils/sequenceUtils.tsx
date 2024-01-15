import { anyToJson } from "bio-parsers";
import { ParsedSequenceResult, Sequence } from "../components/dna/types";

export function baseToColor(base: string): string {
  switch (base.toUpperCase()) {
    case "A":
      return "lightblue";
    case "T":
      return "lightyellow";
    case "G":
      return "lightgreen";
    case "C":
      return "lightpink";
    case "U":
      return "lightpurple";
    default:
      return "white";
  }
}

export function baseTo2bit(basePair: string): string {
  // .2Bit format is
  // T to 00, C to 01, A to 10, and G to 11
  // see https://genome.ucsc.edu/FAQ/FAQformat.html#format7
  /** @todo support other formats listed */
  switch (basePair) {
    case "T":
    case "U":
      return "00";
    case "C":
      return "01";
    case "A":
      return "10";
    case "G":
      return "11";
    default:
      return "";
  }
}

export function getBasepairCounts(seq: string) {
  let A = {
    name: "A",
    count: 0,
  };

  let C = {
    name: "C",
    count: 0,
  };

  let G = {
    name: "G",
    count: 0,
  };

  let T = {
    name: "T",
    count: 0,
  };

  let U = {
    name: "U",
    count: 0,
  };

  let counts = {
    A: 0,
    C: 0,
    G: 0,
    T: 0,
    U: 0,
    type: "basepair counts",
    "GC %": "0",
    "GC %Label": "GC %",
  };

  for (const bp of seq) {
    switch (bp) {
      case "A":
        A.count += 1;
        counts.A += 1;
        break;
      case "C":
        C.count += 1;
        counts.C += 1;
        break;
      case "G":
        G.count += 1;
        counts.G += 1;
        break;
      case "T":
        T.count += 1;
        counts.T += 1;
        break;
      case "U":
        U.count += 1;
        counts.U += 1;
        break;
      default:
        break;
    }
  }

  const bpCounts = [];

  counts["GC %"] = (((G.count + C.count) / (1.0 * seq.length)) * 100).toFixed(
    2
  );

  bpCounts.push({ ...A, ...counts }, { ...C, ...counts }, { ...G, ...counts });
  if (U.count > 0) {
    // only add U if it has a count
    bpCounts.push({ ...U, ...counts });
  } else {
    // otherwise we are DNA and use T
    bpCounts.push({ ...T, ...counts });
  }

  return bpCounts;
}

export async function parseSequence(
  unparsed: string,
  filename: string,
  onParseSuccess?: (parsedSequence: Sequence) => void
) {
  for (const sequenceResult of await anyToJson(unparsed)) {
    let hasAmbiguous = false;
    for (const base of sequenceResult.parsedSequence.sequence) {
      if (!["A", "T", "G", "C", "U", "a", "t", "g", "c", "u"].includes(base)) {
        hasAmbiguous = true;
        break;
      }
    }
    try {
      const parsedSequence: Sequence = transformSequence(
        sequenceResult.parsedSequence.description !== undefined
          ? sequenceResult.parsedSequence.name +
              " " +
              sequenceResult.parsedSequence.description
          : sequenceResult.parsedSequence.name,
        sequenceResult,
        filename,
        hasAmbiguous
      );
      onParseSuccess?.(parsedSequence);
    } catch (err) {
      debugger;
      // todo handle this
    }
  }
}

export function transformSequence(
  description: string,
  sequence: ParsedSequenceResult,
  filename: string,
  hasAmbiguous: boolean
): Sequence {
  return {
    description,
    sequence: sequence?.parsedSequence?.sequence?.toUpperCase() || "",
    filename,
    hasAmbiguous,
    visualization: {},
    overview: {},
    type: sequence?.parsedSequence?.type || "DNA",
  };
}

export function validBase(base: string): boolean {
  switch (base.toUpperCase()) {
    case "A":
    case "T":
    case "G":
    case "C":
    case "U":
      return true;
    default:
      return false;
  }
}
