import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Title from "./Title";
import { Sequence } from "./types";
import { BasepairHistogram } from "./charts";

export type SequenceTalliesProps = {
  activeSequence?: Sequence | null;
  sequences?: Record<string, Sequence>;
  minBasePair?: number;
  maxBasePair?: number;
  onViewSequenceClick?: () => void;
};

export default function SequenceTallies({
  activeSequence,
  sequences = {},
  minBasePair,
  maxBasePair,
  onViewSequenceClick,
}: SequenceTalliesProps) {
  let totalBPs = 0;

  for (const k of Object.keys(sequences)) {
    const seq = sequences[k];
    totalBPs += seq?.sequence?.length || 0;
  }

  return (
    <React.Fragment>
      <Title># of Sequences</Title>
      <Typography component="p" variant="h4">
        {Object.keys(sequences).length}
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        Total basepairs: {totalBPs}bps
      </Typography>

      {activeSequence && (
        <div>
          <Title>Active Sequence</Title>
          <Typography color="text.secondary" sx={{ flex: 1 }}>
            {activeSequence?.description}
          </Typography>
          <Typography color="text.secondary" sx={{ flex: 1 }}>
            {activeSequence?.sequence.length} bps
          </Typography>
          <Link
            color="primary"
            href="#"
            onClick={() => onViewSequenceClick?.()}
          >
            View
          </Link>
        </div>
      )}
    </React.Fragment>
  );
}
