import { ReactElement, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Pagination from "@mui/material/Pagination";

import { Sequence } from "./types";
import { baseTo2bit, baseToColor, validBase } from "../../utils/sequenceUtils";

export type SequenceDisplayProps = {
  sequence?: Sequence | null;
  showBinary?: boolean;
  showColors?: boolean;
  showText?: boolean;
  showTooltip?: boolean;
  maxBasePair?: number;
  minBasePair?: number;
};

export default function SequenceDisplay({
  sequence,
  showBinary,
  showColors = true,
  showText = true,
  showTooltip = true,
  minBasePair = 1,
  maxBasePair,
}: SequenceDisplayProps) {
  maxBasePair = maxBasePair || sequence?.sequence.length;

  const ref = useRef<HTMLDivElement | null>(null);

  const basePairHeight = 35;
  const basePairWidth = showBinary ? 19.953 : 9.977;
  const basePairsPerRow = ref?.current?.offsetWidth
    ? Math.floor(ref?.current?.offsetWidth / basePairWidth)
    : showBinary
    ? 56
    : 112;
  // const totalBPs = (maxBasePair || 1) - minBasePair + 1;
  // const totalRows = Math.floor(totalBPs / (1.0 * basePairsPerRow)) + 1;
  // const totalRowHeight = totalRows * basePairHeight;
  const maxHeight = 350;

  // const [scrollTop, setScrollTop] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  // const handleScroll = (e: any) => setScrollTop(e?.target?.scrollTop || 0);

  const renderBase = (base: string, index: number) => (
    <Box
      key={index}
      sx={{
        backgroundColor: showColors ? baseToColor(base) : "transparent",
        color: showColors ? "#151515" : "#fff",
        display: "inline-block",
        fontFamily: "Anonymous Pro",
        fontSize: "18px",
        height: showText ? "auto" : "27px",
        mb: showText ? 1 : 0,
        width: showText ? "auto" : "9.977px",
        border: validBase(base) ? "none" : "1px solid red",
      }}
    >
      {showText
        ? showBinary
          ? baseTo2bit(base.toUpperCase())
          : base.toUpperCase()
        : showBinary
        ? "  "
        : " "}
    </Box>
  );

  const wrapWithTooltip = (
    content: ReactElement,
    title: string,
    index: number
  ) => (
    <Tooltip key={index} title={title} placement="top" arrow followCursor>
      {content}
    </Tooltip>
  );

  // const pagesBeforeAndAfter = 3;
  const visibleRows = maxHeight / basePairHeight;
  // const totalRowsBefore = Math.ceil(scrollTop / basePairHeight);
  // const visibleRowsBefore = Math.min(totalRowsBefore, visibleRows);
  // const invisibleRowsBefore = totalRowsBefore - visibleRowsBefore;

  // const startingBP = Math.min(
  //   maxBasePair || 1,
  //   minBasePair + invisibleRowsBefore * basePairsPerRow
  // );

  // const endingBP = Math.min(
  //   startingBP + 3 * visibleRows * basePairsPerRow,
  //   (maxBasePair || 1) - startingBP
  // );

  // const visibleBPs = endingBP - startingBP + 1;

  // const paddingTop = invisibleRowsBefore * basePairHeight;

  const startingBP = Math.max(
    (page - 1) * visibleRows * basePairsPerRow,
    minBasePair - 1
  );
  const endingBP = Math.min(
    startingBP + visibleRows * basePairsPerRow,
    maxBasePair || 1
  );

  debugger;

  return (
    <Box>
      <Box
        sx={{
          textWrap: "wrap",
          wordBreak: "break-word",
          fontFamily: "Anonymous Pro",
          fontSize: "16px",
          height: `${maxHeight}px`,
          overflow: "auto",
        }}
        // onScroll={handleScroll}
      >
        <Box
          ref={ref}
          sx={
            {
              // pt: `${paddingTop}px`,
              // height: `${totalRowHeight}px`,
            }
          }
        >
          {sequence?.sequence
            .substring(startingBP, endingBP)
            .split("")
            .map((base, index) =>
              showTooltip
                ? wrapWithTooltip(
                    renderBase(base, index),
                    `bp # ${startingBP + index + 1} / ${
                      sequence?.sequence.length
                    } => ${base} ${
                      showBinary ? "(" + baseTo2bit(base) + ")" : ""
                    }`,
                    index
                  )
                : renderBase(base, index)
            )}
        </Box>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Pagination
          size="large"
          color="primary"
          count={Math.ceil(
            ((maxBasePair || 1) - minBasePair + 1) /
              (1.0 * basePairsPerRow * visibleRows)
          )}
          page={page}
          showFirstButton
          showLastButton
          variant="outlined"
          onChange={(_, page) => setPage(page)}
          sx={{
            "& .MuiPagination-ul": {
              justifyContent: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
}
