import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from "recharts";
import { squiggle } from "dnaviz";

import { Sequence } from "../types";

export type SquiggleChartProps = {
  activeSequence?: Sequence | null;
  bpRange?: number[] | null;
};

export function SquiggleChart({ activeSequence, bpRange }: SquiggleChartProps) {
  const theme = useTheme();

  const data: Record<"x" | "y", number>[] = [];

  const [xx, yy] = squiggle(
    activeSequence?.sequence.substring(
      bpRange?.[0] || 0,
      bpRange?.[1] || activeSequence.sequence.length
    ) || ""
  );
  xx.forEach((x, index) => data.push({ x, y: yy[index] }));

  return (
    <ResponsiveContainer minHeight={600}>
      <LineChart
        data={data}
        margin={{
          top: 16,
          right: 16,
          bottom: 24,
          left: 24,
        }}
        height={500}
        width={500}
      >
        <XAxis
          dataKey="x"
          stroke={theme.palette.text.secondary}
          style={theme.typography.body2}
        >
          <Label
            angle={0}
            position="centerBottom"
            style={{
              textAnchor: "middle",
              fill: theme.palette.text.primary,
              ...theme.typography.body1,
            }}
          >
            # of basepairs
          </Label>
        </XAxis>
        <YAxis
          stroke={theme.palette.text.secondary}
          style={theme.typography.body2}
        >
          <Label
            angle={270}
            position="left"
            style={{
              textAnchor: "middle",
              fill: theme.palette.text.primary,
              ...theme.typography.body1,
            }}
          >
            Score
          </Label>
        </YAxis>
        <Line
          isAnimationActive={false}
          type="monotone"
          dataKey="y"
          stroke={theme.palette.primary.main}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
