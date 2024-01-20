import Paper from "@mui/material/Paper";
import SequenceDisplay from "./SequenceDisplay";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Slider from "@mui/material/Slider";

import {
  Brush,
  ChatBubble,
  ContentPaste,
  FontDownload,
  FontDownloadOff,
  Numbers,
} from "@mui/icons-material";

import {
  BasepairHistogram,
  GatesChart,
  QiChart,
  RandicChart,
  SquiggleChart,
} from "./charts";
import Title from "./Title";
import ButtonGroup from "@mui/material/ButtonGroup";
import { ChartMethod, Sequence } from "./types";
import Box from "@mui/material/Box";
import { useState } from "react";

export type SequenceVisualizationsProps = {
  activeSequence?: Sequence | null;
  bpRange?: number[] | null;
  onBpRangeUpdate?: (bpRange: number[]) => void;
  chartMethod?: ChartMethod | null;
  onChartMethodUpdate?: (chartMethod: ChartMethod) => void;
};

export default function SequenceVisualizations({
  activeSequence,
  bpRange = [],
  chartMethod = "sequence",
  onBpRangeUpdate,
  onChartMethodUpdate,
}: SequenceVisualizationsProps) {
  const minBasePair = bpRange?.[0] || 1;
  const maxBasePair = bpRange?.[1] || activeSequence?.sequence.length || 1;

  const [colorizeSequence, setColorizeSequence] = useState<boolean>(true);
  const [displaySequenceText, setDisplaySequenceText] = useState<boolean>(true);
  const [displayTooltip, setDisplayTooltip] = useState<boolean>(true);
  const [displayBinary, setDisplayBinary] = useState<boolean>(false);

  const getChartMethodTitle = (chartMethod?: ChartMethod | null): string => {
    switch (chartMethod) {
      case "bpcontent":
        return "Basepair Content Histograms";
      case "squiggle":
        return "Squiggle Chart";
      case "gates":
        return "Gates Chart";
      case "qi":
        return "Qi Chart";
      case "sequence":
        return "Sequence";
      case "randic":
        return "Randic Chart";
      default:
        return "";
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
      }}
    >
      <Grid container>
        <Grid item flexGrow={1}>
          <Box sx={{ pt: 1 }}>
            <Title>
              {getChartMethodTitle(chartMethod)}
              {`${
                activeSequence?.description
                  ? (chartMethod !== "" ? " for " : "") +
                    activeSequence?.description
                  : ""
              }`}
            </Title>
          </Box>
        </Grid>
        <Grid item sx={{ textAlign: "right" }}>
          <FormControl
            sx={{
              m: 1,
              minWidth: 120,
              maxWidth: 360,
            }}
            size="small"
          >
            <InputLabel id="chart-select-label">Visualization</InputLabel>
            <Select
              labelId="chart-select-label"
              id="chart-select"
              value={chartMethod || ""}
              label="Chart Method"
              onChange={(e: SelectChangeEvent) =>
                onChartMethodUpdate?.(e.target.value as ChartMethod)
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"bpcontent"}>basepair content</MenuItem>
              <MenuItem value={"sequence"}>sequence</MenuItem>
              <MenuItem value={"squiggle"}>squiggle</MenuItem>
              <MenuItem value={"gates"}>gates</MenuItem>
              <MenuItem value={"qi"}>qi</MenuItem>
              <MenuItem value={"randic"}>randic</MenuItem>
              <MenuItem value={"yau"}>yau</MenuItem>
              <MenuItem value={"yau_bp"}>yau_bp</MenuItem>
              <MenuItem value={"yau_int"}>yau_int</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ p: 2, pl: 1, width: "100%" }}>
            <Slider
              min={1}
              max={activeSequence?.sequence.length || 1}
              getAriaLabel={() => "basepair(bp) range"}
              value={bpRange || []}
              onChange={(_, newValue: number | number[]) =>
                onBpRangeUpdate?.(newValue as number[])
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(value: number) =>
                `bp# ${value}/${activeSequence?.sequence.length}`
              }
              getAriaValueText={(value: number) =>
                `bp# ${value}/${activeSequence?.sequence.length}`
              }
            />
          </Box>
        </Grid>
      </Grid>
      {chartMethod === "bpcontent" && (
        <BasepairHistogram
          sequence={activeSequence}
          minBasePair={minBasePair}
          maxBasePair={maxBasePair}
        />
      )}
      {chartMethod === "squiggle" && (
        <SquiggleChart activeSequence={activeSequence} bpRange={bpRange} />
      )}
      {chartMethod === "gates" && (
        <GatesChart activeSequence={activeSequence} bpRange={bpRange} />
      )}
      {chartMethod === "qi" && <QiChart activeSequence={activeSequence} />}
      {chartMethod === "randic" && (
        <RandicChart activeSequence={activeSequence} />
      )}
      {chartMethod === "sequence" && (
        <Grid container>
          <Grid item>
            <Typography sx={{ px: 2, display: "inline-block" }}>
              {activeSequence?.sequence.trim().length || 0} bps
            </Typography>
            {(bpRange?.[0] || 1) !== 1 ||
            bpRange?.[1] !== activeSequence?.sequence.trim().length ? (
              <Typography
                sx={{
                  display: "inline-block",
                  fontSize: "12px",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                {`showing only ${bpRange![1] - bpRange![0] + 1} basepairs`}
              </Typography>
            ) : null}
          </Grid>
          <Grid item sx={{ flexGrow: 1, textAlign: "right" }}>
            <ButtonGroup
              variant="outlined"
              size="large"
              aria-label="display options"
              sx={{
                border: "1px solid #fff",
                position: "relative",
                top: "8px",
                "& .MuiButtonBase-root": {
                  border: "1px solid #fff",
                  borderRadius: 0,
                  ml: 0,
                },
              }}
            >
              <Tooltip title="display the sequence as binary" arrow>
                <IconButton
                  aria-label="display the sequence as binary"
                  color={displayBinary ? "primary" : "default"}
                  sx={{ ml: 2 }}
                  onClick={() => setDisplayBinary(!displayBinary)}
                >
                  <Numbers />
                </IconButton>
              </Tooltip>
              <Tooltip title="display the info tooltip" arrow>
                <IconButton
                  aria-label="display the info tooltip"
                  color={displayTooltip ? "primary" : "default"}
                  sx={{ ml: 2 }}
                  onClick={() => setDisplayTooltip(!displayTooltip)}
                >
                  <ChatBubble />
                </IconButton>
              </Tooltip>
              <Tooltip title="display the sequence" arrow>
                <IconButton
                  aria-label="display the sequence"
                  color={displaySequenceText ? "primary" : "default"}
                  sx={{ ml: 2 }}
                  onClick={() => setDisplaySequenceText(!displaySequenceText)}
                >
                  {displaySequenceText ? <FontDownload /> : <FontDownloadOff />}
                </IconButton>
              </Tooltip>
            </ButtonGroup>
            <Tooltip title="colorize the sequence" arrow>
              <IconButton
                aria-label="colorize the sequence"
                color={colorizeSequence ? "primary" : "default"}
                sx={{ ml: 2 }}
                onClick={() => setColorizeSequence(!colorizeSequence)}
              >
                <Brush />
              </IconButton>
            </Tooltip>
            {navigator.clipboard && (
              <Tooltip title="copy to clipboard" arrow>
                <IconButton
                  aria-label="copy sequence to clipboard"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      activeSequence?.sequence.substring(
                        (bpRange?.[0] || 1) - 1,
                        (bpRange?.[1] || activeSequence?.sequence.length) + 1
                      ) || ""
                    )
                  }
                  sx={{ ml: 2 }}
                >
                  <ContentPaste />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{
                display: "inline-block",
                p: 2,
                fontWeight: 600,
              }}
            >
              Type:
            </Typography>
            <Typography sx={{ display: "inline-block", p: 2 }}>
              {activeSequence?.type}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
            <SequenceDisplay
              sequence={activeSequence}
              showBinary={displayBinary}
              showColors={colorizeSequence}
              showText={displaySequenceText}
              showTooltip={displayTooltip}
              minBasePair={minBasePair}
              maxBasePair={maxBasePair}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
