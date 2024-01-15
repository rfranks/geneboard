import * as React from "react";
import { useTheme } from "@mui/material/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from "recharts";
import { qi } from "dnaviz";

import { Sequence } from "../types";
import Title from "../Title";

export type QiChartProps = {
  activeSequence?: Sequence | null;
};

export function QiChart({ activeSequence }: QiChartProps) {
  const theme = useTheme();

  const data: Record<"x" | "y", number>[] = [];

  const [xx, yy] = qi(activeSequence?.sequence || "");
  xx.forEach((x, index) => data.push({ x, y: yy[index] }));

  return (
    <React.Fragment>
      <Title>
        Qi
        {`${
          activeSequence?.description
            ? " for " + activeSequence?.description
            : ""
        }`}
      </Title>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 24,
            left: 24,
          }}
        >
          <XAxis
            dataKey="x"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
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
    </React.Fragment>
  );
}
