import { useRef, useState } from "react";

import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import SequenceTallies from "./SequenceTallies";
import SequencesTable from "./SequencesTable";
import AddSequenceCard from "./AddSequenceCard";
import { ChartMethod, GeneBoardState, Sequence } from "./types";
import {
  BarChart,
  Brush,
  ChatBubble,
  ContentPaste,
  DashboardRounded,
  FontDownload,
  FontDownloadOff,
  Numbers,
  PauseCircle,
  PlayCircleOutline,
  Queue,
  TableChart,
} from "@mui/icons-material";
import SequenceDisplay from "./SequenceDisplay";

import {
  BasepairHistogram,
  GatesChart,
  QiChart,
  RandicChart,
  SquiggleChart,
} from "./charts";
import Title from "./Title";
import ButtonGroup from "@mui/material/ButtonGroup";
import {
  Autocomplete,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";

function Copyright(props: any) {
  const thisYear = new Date().getFullYear();

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://rfranks.github.io/blasteroids">
        GeneBoard
      </Link>{" "}
      {2024 === thisYear ? `2024` : `2024-${thisYear}`}
      {"."}
    </Typography>
  );
}

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme({
  components: {
    // // Name of the component
    // MuiPaper: {
    //   styleOverrides: {
    //     // Name of the slot
    //     root: {
    //       // Some CSS
    //       backgroundColor: "#1d1d1d",
    //     },
    //   },
    // },
  },
  palette: {
    mode: "dark",
  },
});

export default function Dashboard() {
  const [open, setOpen] = useState<boolean>(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [state, setState] = useState<GeneBoardState>({
    sequences: {},
    currentMethod: "yau_int",
    legendMode: "sequence",
    useWasm: true,
    showSpinner: false,
  });

  const playRef = useRef<HTMLButtonElement | null>(null);

  const [activeSequence, setActiveSequence] = useState<Sequence | null>();

  const [chartMethod, setChartMethod] = useState<ChartMethod>("sequence");

  const [bpRange, setBpRange] = useState<number[] | null>(null);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timer | null>(null);

  const minBasePair = bpRange?.[0] || 1;
  const maxBasePair = bpRange?.[1] || activeSequence?.sequence.length || 1;

  const [colorizeSequence, setColorizeSequence] = useState<boolean>(true);
  const [displaySequenceText, setDisplaySequenceText] = useState<boolean>(true);
  const [displayTooltip, setDisplayTooltip] = useState<boolean>(true);
  const [displayBinary, setDisplayBinary] = useState<boolean>(false);

  const [openCards, setOpenCards] = useState({
    addSequence: 1,
    table: 1,
    visualizations: 1,
  });

  const sequenceKeys = Object.keys(state?.sequences || {});

  const getChartMethodTitle = (chartMethod: ChartMethod): string => {
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
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="absolute"
          open={open}
          sx={{ backgroundColor: "#1565c0" }}
        >
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              GeneBoard{" "}
              {`${
                activeSequence?.description
                  ? " for " + activeSequence?.description
                  : ""
              }`}
            </Typography>
            {activeSequence && (
              <>
                <IconButton
                  ref={playRef}
                  color="inherit"
                  onClick={() => {
                    if (playInterval) {
                      clearInterval(playInterval);
                      setPlayInterval(null);
                    }
                  }}
                  disabled={!playInterval}
                >
                  <Badge
                    badgeContent={playInterval ? maxBasePair : 0}
                    color="secondary"
                    max={10000}
                  >
                    <PauseCircle />
                  </Badge>
                </IconButton>
                <IconButton
                  ref={playRef}
                  color="inherit"
                  sx={{
                    display: playInterval ? "none" : undefined,
                  }}
                  onClick={() => {
                    if (
                      maxBasePair === activeSequence.sequence.length &&
                      playInterval
                    ) {
                      clearInterval(playInterval);
                      setPlayInterval(null);
                    } else if (playInterval) {
                      setBpRange([
                        1,
                        Math.min(
                          maxBasePair + 10,
                          activeSequence.sequence.length
                        ),
                      ]);
                    } else {
                      setBpRange([
                        1,
                        Math.min(2, activeSequence.sequence.length),
                      ]);

                      setPlayInterval(
                        setInterval(() => {
                          playRef?.current?.click();
                        }, 0)
                      );
                    }
                  }}
                >
                  <Badge badgeContent={0} color="secondary">
                    <PlayCircleOutline />
                  </Badge>
                </IconButton>
              </>
            )}
            {sequenceKeys.length > 0 && (
              <Autocomplete
                disablePortal
                id="gene-select-autocomplete"
                options={sequenceKeys.sort().map((key) => {
                  const seq = state?.sequences?.[key];

                  return {
                    label: seq.description,
                    id: seq.description,
                  };
                })}
                sx={{ width: 600 }}
                renderInput={(params) => (
                  <TextField {...params} label="Active Sequence" />
                )}
                value={{
                  label: activeSequence?.description || "",
                  id: activeSequence?.description || "",
                }}
                onChange={(
                  _,
                  newValue: { label: string; id: string } | null
                ) => {
                  if (newValue) {
                    const seq = state?.sequences?.[newValue.id];
                    setBpRange([1, seq.sequence.length]);
                    setActiveSequence(seq);
                  } else {
                    setActiveSequence(null);
                  }
                }}
              />
            )}
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton
              onClick={() =>
                setOpenCards({
                  addSequence: 1,
                  table: 1,
                  visualizations: 1,
                })
              }
            >
              <ListItemIcon>
                <DashboardRounded />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton
              onClick={() =>
                setOpenCards({
                  ...openCards,
                  addSequence: !openCards.addSequence ? 1 : 0,
                })
              }
              sx={{
                backgroundColor:
                  sequenceKeys.length && openCards.addSequence
                    ? "rgba(255, 255, 255, 0.08)"
                    : undefined,
              }}
            >
              <ListItemIcon>
                <Queue />
              </ListItemIcon>
              <ListItemText primary="Add sequences" />
            </ListItemButton>
            <ListItemButton
              disabled={!activeSequence}
              onClick={() =>
                setOpenCards({
                  ...openCards,
                  visualizations: !openCards.visualizations ? 1 : 0,
                })
              }
              sx={{
                backgroundColor:
                  sequenceKeys.length && openCards.visualizations
                    ? "rgba(255, 255, 255, 0.08)"
                    : undefined,
              }}
            >
              <ListItemIcon>
                <BarChart />
              </ListItemIcon>
              <ListItemText primary="Visualizations" />
            </ListItemButton>
            <ListItemButton
              disabled={!sequenceKeys.length}
              onClick={() =>
                setOpenCards({
                  ...openCards,
                  table: !openCards.table ? 1 : 0,
                })
              }
              sx={{
                backgroundColor:
                  sequenceKeys.length && openCards.table
                    ? "rgba(255, 255, 255, 0.08)"
                    : undefined,
              }}
            >
              <ListItemIcon>
                <TableChart />
              </ListItemIcon>
              <ListItemText primary="Table" />
            </ListItemButton>
            {open && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem>
                  <Paper
                    sx={{
                      m: 1,
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      height: "384px",
                      overflow: "auto",
                    }}
                  >
                    <SequenceTallies
                      sequences={state?.sequences}
                      activeSequence={activeSequence}
                      onViewSequenceClick={() => {
                        setOpenCards({
                          addSequence: 0,
                          table: 0,
                          visualizations: 1,
                        });

                        setChartMethod("sequence");
                      }}
                    />
                    <Grid container flexDirection="column">
                      <Grid item>
                        <Link
                          color="primary"
                          href="#"
                          onClick={() => {
                            setState({
                              ...state,
                              sequences: {},
                            });

                            setActiveSequence(null);
                          }}
                          sx={{ mt: 3 }}
                        >
                          Remove all
                        </Link>
                      </Grid>
                      <Grid item>
                        <Link
                          color="primary"
                          href="#"
                          onClick={() => {
                            Object.keys(state?.sequences).forEach((key) => {
                              if (
                                state?.sequences[key] &&
                                state?.sequences[key].hasAmbiguous
                              ) {
                                delete state?.sequences[key];
                              }
                            });

                            setState({
                              ...state,
                              sequences: {
                                ...state.sequences,
                              },
                            });

                            setActiveSequence(null);
                          }}
                          sx={{ mt: 3 }}
                        >
                          Clear errors
                        </Link>
                      </Grid>
                    </Grid>
                  </Paper>
                </ListItem>
              </>
            )}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: "#151515",
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {openCards.addSequence === 1 && (
                <Grid item xs={12} sx={{ height: "384px" }}>
                  <AddSequenceCard
                    onAddSequence={(seq) => {
                      state.sequences[seq.description] = seq;

                      state.sequences = { ...state.sequences };

                      setState({
                        ...state,
                      });
                    }}
                  />
                </Grid>
              )}
              {openCards.table === 1 && sequenceKeys.length > 0 && (
                <Grid item xs={12}>
                  <Paper
                    sx={{ p: 2, display: "flex", flexDirection: "column" }}
                  >
                    <SequencesTable
                      activeSequence={activeSequence}
                      sequences={state?.sequences}
                      onSequenceClick={(seq) => {
                        setBpRange([1, seq.sequence.length]);
                        setActiveSequence(
                          activeSequence?.description !== seq.description
                            ? seq
                            : null
                        );
                      }}
                    />
                  </Paper>
                </Grid>
              )}
              {openCards.visualizations === 1 && activeSequence && (
                <Grid item xs={12} sx={{ mt: 1, mb: 0 }}>
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
                          <InputLabel id="chart-select-label">
                            Visualization
                          </InputLabel>
                          <Select
                            labelId="chart-select-label"
                            id="chart-select"
                            value={chartMethod}
                            label="Chart Method"
                            onChange={(e: SelectChangeEvent) =>
                              setChartMethod(e.target.value as ChartMethod)
                            }
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            <MenuItem value={"bpcontent"}>
                              basepair content
                            </MenuItem>
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
                              setBpRange(newValue as number[])
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
                      <SquiggleChart
                        activeSequence={activeSequence}
                        bpRange={bpRange}
                      />
                    )}
                    {chartMethod === "gates" && (
                      <GatesChart
                        activeSequence={activeSequence}
                        bpRange={bpRange}
                      />
                    )}
                    {chartMethod === "qi" && (
                      <QiChart activeSequence={activeSequence} />
                    )}
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
                          bpRange?.[1] !==
                            activeSequence?.sequence.trim().length ? (
                            <Typography
                              sx={{
                                display: "inline-block",
                                fontSize: "12px",
                                fontWeight: 600,
                                px: 2,
                              }}
                            >
                              {`showing only ${
                                bpRange![1] - bpRange![0] + 1
                              } basepairs`}
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
                            <Tooltip
                              title="display the sequence as binary"
                              arrow
                            >
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
                                onClick={() =>
                                  setDisplayTooltip(!displayTooltip)
                                }
                              >
                                <ChatBubble />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="display the sequence" arrow>
                              <IconButton
                                aria-label="display the sequence"
                                color={
                                  displaySequenceText ? "primary" : "default"
                                }
                                sx={{ ml: 2 }}
                                onClick={() =>
                                  setDisplaySequenceText(!displaySequenceText)
                                }
                              >
                                {displaySequenceText ? (
                                  <FontDownload />
                                ) : (
                                  <FontDownloadOff />
                                )}
                              </IconButton>
                            </Tooltip>
                          </ButtonGroup>
                          <Tooltip title="colorize the sequence" arrow>
                            <IconButton
                              aria-label="colorize the sequence"
                              color={colorizeSequence ? "primary" : "default"}
                              sx={{ ml: 2 }}
                              onClick={() =>
                                setColorizeSequence(!colorizeSequence)
                              }
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
                                      (bpRange?.[1] ||
                                        activeSequence?.sequence.length) + 1
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
                </Grid>
              )}
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
