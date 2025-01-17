# Useful Snippets 

## We will have to move to React and TypeScript!

### Reading list of files from multiple file input

```javascript
      // read each file and dispatch the parser, which in turn dispatches transformation
      for (const file of files) {
        await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target.result.length === 0) {
              this.$bvModal.msgBoxOk("This file is empty. Please try again.")
              this.uploadedFiles = null
            }
            // console.log(file.name, e.target.result)
            this.$store.dispatch("parseSequence", {
              unparsed: e.target.result,
              file: file.name,
            })
            this.$store.dispatch("wasm/instantiate")
            this.hideSpinner()
            resolve()
          }
          reader.readAsText(file)
        })
      }
```

### Fetching example fasta files
* Need to still find the `parseSequence` invocation and source, but this example illustrates loading the file and forwarding to parse the raw FASTA file contents
```javascript
    transformExample(example) {
      fetch(`/examples/${example}.fasta`)
        .then((x) => x.text())
        .then((text) => {
          this.$store.dispatch("parseSequence", {
            unparsed: text,
            file: example + ".fasta",
          })
        })
    },
```

### `index.js` which has a lot of the `parseSequence` logic and state management...
* Need to disect this more...move to React/TypeScript
```javascript
import { anyToJson } from "bio-parsers"  // this is key for data file interoperability
import * as dnaviz from "dnaviz"
import { downsample } from "./helpers"
export const state = () => ({
  sequences: {},
  currentMethod: "yau_int",
  legendMode: "sequence",
  useWasm: true,
  showSpinner: false,
})

export const mutations = {
  /**
   * Save a sequence and its description.
   * Note that the transformed visualization is *not* included.
   */
  insertSequence(state, { description, sequence, file, hasAmbiguous }) {
    Vue.set(state.sequences, description, {
      sequence,
      file,
      hasAmbiguous,
      visualization: {},
      overview: {},
    })
  },
  /**
   * Given a sequence already in `state`, save its transformed coordinates for the given method.
   */
  insertTransformedSequence(state, { description, method, xPtr, yPtr, arr }) {
    if (xPtr !== undefined && yPtr !== undefined) {
      state.sequences[description].visualization[method] = { xPtr, yPtr }
    } else if (arr !== undefined) {
      state.sequences[description].visualization[method] = arr
    } else {
      throw new Error("Didn't get ptrs or array")
    }
  },
  removeSequence(state, { description }) {
    Vue.delete(state.sequences, description)
  },
  updateOverview(state, { description, method, overview }) {
    Vue.set(state.sequences[description].overview, [method], overview)
  },
  setCurrentMethod(state, { method }) {
    state.currentMethod = method
  },
  /**
   * Overwrite the entire `sequences` object in `state`
   */
  setSequences(state, { sequences }) {
    Vue.set(state, "sequences", sequences)
  },
  setLegendMode(state, mode) {
    state.legendMode = mode
  },
  disableWasm(state) {
    state.useWasm = false
  },
  showSpinner(state) {
    state.showSpinner = true
  },
  hideSpinner(state) {
    state.showSpinner = false
  },
}

export const actions = {
  /**
   * Transform a sequence using the current visualization method and save it.
   * If the sequence already exists in `state` but does not have the current visualization
   * method's data, it will be modified. Otherwise, the sequence will be transformed and added.
   */
  // TODO: add a check to prevent duplicate transformation

  // uses async TeselaGen parser before dispatching to transformSequence
  async parseSequence({ dispatch }, { unparsed, file }) {
    for (const sequence of await anyToJson(unparsed)) {
      let hasAmbiguous = false
      for (const base of sequence.parsedSequence.sequence) {
        if (
          !["A", "T", "G", "C", "U", "a", "t", "g", "c", "u"].includes(base)
        ) {
          hasAmbiguous = true
          break
        }
      }
      dispatch("transformSequence", {
        description:
          sequence.parsedSequence.description !== undefined
            ? sequence.parsedSequence.name +
              " " +
              sequence.parsedSequence.description
            : sequence.parsedSequence.name,
        sequence: sequence.parsedSequence.sequence,
        file,
        hasAmbiguous,
      })
    }
  },

  transformSequence(
    { commit, state, dispatch },
    { description, sequence, file, hasAmbiguous }
  ) {
    // We need to check that
    if (!Object.prototype.hasOwnProperty.call(state.sequences, description)) {
      commit("insertSequence", {
        description,
        sequence: sequence.toUpperCase(),
        file,
        hasAmbiguous,
      })
    }
    dispatch(
      state.useWasm && state.currentMethod !== "gates"
        ? "wasm/transform"
        : "dnaviz/transform",
      {
        description,
      }
    )
    dispatch("computeOverview", { description })
  },
  computeOverview({ commit, state }, { description, xMin, xMax }) {
    let visualization =
      state.sequences[description].visualization[state.currentMethod]
    console.log(description, xMin, xMax)
    // We're zooming in
    if (xMin !== undefined && xMax !== undefined) {
      // first, we need to find how many points we've already saved in the range
      let inRange = [[], []]
      for (let i = 0; i < visualization[0].length; i++) {
        if (xMin < visualization[0][i] && visualization[0][i] < xMax) {
          inRange[0].push(visualization[0][i])
          inRange[1].push(visualization[1][i])
        } else if (visualization[0][i] > xMax) {
          break
        }
      }

      // if we have more than 1k points, we're good to downsample
      // if not, we need to compute points in the x range
      console.log(inRange)
      if (inRange[0].length < 1000) {
        // get the subsequence in the range
        console.log("resampling")
        const seqInRange = state.sequences[description].sequence.slice(
          Math.floor(xMin),
          Math.floor(xMax)
        )
        // transform it
        // TODO: downsample to 10k before reading
        if (state.useWasm && state.currentMethod !== "gates") {
          const ptrs = state.wasm[state.currentMethod](seqInRange)
          if (state.currentMethod === "yau_int") {
            inRange[0] = state.wasm.getInt32Array(ptrs[0])
            inRange[1] = state.wasm.getInt32Array(ptrs[1])
          } else {
            inRange[0] = state.wasm.getFloat64Array(ptrs[0])
            inRange[1] = state.wasm.getFloat64Array(ptrs[1])
          }
          // don't forget to free memory!
          ptrs.forEach((ptr) => state.wasm.release(ptr))
        } else if (state.currentMethod !== "gates") {
          inRange = dnaviz[state.currentMethod](seqInRange)
        }

        // fix the x offset
        for (let i = 0; i < inRange[0].length; i++) {
          inRange[0][i] += Math.floor(xMin)
        }
        console.log("done x shiftiing")
        if (["squiggle", "yau_int"].includes(state.currentMethod)) {
          console.log("y shifting")
          let lastXCoord
          for (let i = 0; i < visualization.length; i++) {
            if (visualization[0][i] < Math.floor(xMin)) {
              lastXCoord = visualization[0][i]
            } else {
              break
            }
          }
          let yOffset
          const inBetween = state.sequences[description].sequence.slice(
            lastXCoord,
            Math.floor(xMin) + 1
          )
          if (state.useWasm && state.currentMethod !== "gates") {
            const ptrs = state.wasm[state.currentMethod](inBetween)
            if (state.currentMethod === "yau_int") {
              const yArr = state.wasm.getInt32Array(ptrs[1])
              yOffset = yArr[yArr.length - 1]
            } else {
              const yArr = state.wasm.getFloat64Array(ptrs[1])
              yOffset = yArr[yArr.length - 1]
            }
            // don't forget to free memory!
            ptrs.forEach((ptr) => state.wasm.release(ptr))
          } else if (state.currentMethod !== "gates") {
            const yArr = dnaviz[state.currentMethod](inBetween)[1]
            yOffset = yArr[yArr.length - 1]
          }
          for (let i = 0; i < inRange[1].length; i++) {
            inRange[1][i] += yOffset
          }
        }
      }
      visualization = inRange
    }
    // if we have too many points, downsample
    const overview =
      visualization[0].length > 1000
        ? downsample(visualization, 1000)
        : visualization

    commit("updateOverview", {
      description,
      method: state.currentMethod,
      overview,
    })
  },
  /** Resets the state of the application to default */
  clearState({ commit }) {
    commit("setSequences", { sequences: {} })
  },
  /**
   * Change the current visualization method.
   * If not a sequence doesn't have the current visualization method stored, it will be computed.
   */
  changeMethod({ commit, state, dispatch }, { method }) {
    commit("setCurrentMethod", { method })
    for (const description in state.sequences) {
      // check whether we need to transform the sequence
      if (
        !Object.prototype.hasOwnProperty.call(
          state.sequences[description].visualization,
          method
        )
      ) {
        dispatch("transformSequence", {
          description,
          sequence: state.sequences[description].sequence,
        })
      }
    }
    commit("hideSpinner")
  },
  /** On page load, set up WASM */
  nuxtClientInit({ dispatch, commit }) {
    const supported = (() => {
      try {
        if (
          typeof WebAssembly === "object" &&
          typeof WebAssembly.instantiate === "function"
        ) {
          const module = new WebAssembly.Module(
            // eslint-disable-next-line
            Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
          )
          if (module instanceof WebAssembly.Module)
            return (
              new WebAssembly.Instance(module) instanceof WebAssembly.Instance
            )
        }
      } catch (e) {}
      return false
    })()
    if (supported) {
      dispatch("wasm/instantiate")
    } else {
      commit("disableWasm")
    }
  },
}
```

### `bio-parses` library allows data format interchange support
* This means we can accept the following files and convert any of them into a somewhat standardized json...
```jsx
    //...
    accept=".fasta, .fa, .fna, .fas, .frn, .ffn, .txt, .gbk, .gb"
    //...
```

## `downsample` utility function that seems to be used in quite a few places, was alone in a helpers file.. :-\
* We will have to make a utilities file for this.
```javascript
/**
 * Downsample a pair of arrays to hold n points
 */
export function downsample(transformed, nPoints) {
  const downsampleFactor = transformed[0].length / nPoints
  const overview = [new Array(nPoints), new Array(nPoints)]
  for (let index = 0; index < nPoints; index++) {
    overview[0][index] = transformed[0][Math.floor(index * downsampleFactor)]
    overview[1][index] = transformed[1][Math.floor(index * downsampleFactor)]
  }
  return overview
}
```

### How `dnaviz` library is used to transform to graphable data set based on visulatization method
```javascript
import * as dnaviz from "dnaviz"
import { downsample } from "./helpers"
function getOverview(arr) {
  if (arr.length <= 10000) {
    return arr
  } else {
    return downsample(arr, 10000)
  }
}

export const actions = {
  transform({ commit, dispatch, rootState }, { description }) {
    // perform the transformation
    let result = dnaviz[rootState.currentMethod](
      rootState.sequences[description].sequence
    )
    // get a 10k element overview of the sequence
    result = getOverview(result)
    commit(
      "insertTransformedSequence",
      {
        description,
        method: rootState.currentMethod,
        arr: result,
      },
      { root: true }
    )
  },
}
```