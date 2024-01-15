import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material";

import { Sequence } from "../types";
import { baseToColor, getBasepairCounts } from "../../../utils/sequenceUtils";

export type BasepairHistogramProps = {
  sequence?: Sequence | null;
  minBasePair?: number;
  maxBasePair?: number;
};

export function BasepairHistogram(props: BasepairHistogramProps) {
  const { sequence, minBasePair, maxBasePair } = props || {};

  const theme = useTheme();

  if (!sequence) {
    return null;
  }

  const bpCounts = getBasepairCounts(
    sequence!.sequence.substring(
      minBasePair || 0,
      (maxBasePair || sequence!.sequence.length) + 1
    )
  );

  const firstBar = bpCounts?.slice(0, 1);

  return (
    <Grid container>
      <Grid item>
        <BarChart
          width={500}
          height={300}
          data={bpCounts}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
        >
          <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
          <YAxis />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={(value) => `${value} bps`}
          />
          <Legend align="center" />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar
            dataKey="count"
            fill={baseToColor("A")}
            label={"# of basepairs"}
          />
        </BarChart>
      </Grid>
      <Grid item>
        <BarChart
          width={300}
          height={300}
          data={firstBar}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={50}
        >
          <XAxis dataKey="type" padding={{ left: 10, right: 10 }} />
          <YAxis domain={[0, sequence.sequence.length]} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={(value) => `${value} bps`}
          />
          <Legend align="center" />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="A" stackId="a" fill={baseToColor("A")} />
          <Bar dataKey="C" stackId="a" fill={baseToColor("C")} />
          <Bar dataKey="G" stackId="a" fill={baseToColor("G")} />
          {sequence.type === "DNA" && (
            <Bar dataKey="T" stackId="a" fill={baseToColor("T")} />
          )}
          {sequence.type === "RNA" && (
            <Bar dataKey="U" stackId="a" fill={baseToColor("U")} />
          )}
        </BarChart>
      </Grid>
      <Grid item>
        <RadarChart
          // cx="50%"
          // cy="50%"
          // outerRadius="80%"
          data={bpCounts.map((bpCount) => {
            return { name: bpCount.name, count: bpCount.count };
          })}
          height={500}
          width={500}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar
            name="count"
            dataKey="count"
            stroke="#000"
            fill={baseToColor("A")}
            fillOpacity={0.6}
          />
        </RadarChart>
      </Grid>
      <Grid item>
        <BarChart
          width={300}
          height={500}
          data={firstBar}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
        >
          <XAxis dataKey="GC %Label" padding={{ left: 10, right: 10 }} />
          <YAxis min={0} max={100} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={function (value) {
              return `${value}%`;
            }}
          />
          <Legend align="center" />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="GC %" stackId="a" fill={baseToColor("A")} />
        </BarChart>
      </Grid>
    </Grid>
  );
}
