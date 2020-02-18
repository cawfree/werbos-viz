import "react-chartjs-2";
import "react-json-tree";

import axios from "axios";
import sabrina from "sabrina";
import open from "open";
import chalk from "chalk";
import { typeCheck } from "type-check";

// TODO: Need to register these as genuine shapes within @werbos/core.
const trainingShape = "{params:{...},epoch:[Number],history:{...},...}";
const kfoldTrainingShape = `[${trainingShape}]`;

const defaultOptions = Object.freeze({
  title: undefined
});

// TODO: Likely a function of config.
const url = "http://localhost:3000";

const request = (title, children) =>
  axios({
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    url: `${url}/pane`,
    method: "post",
    data: {
      title,
      children
    }
  });

const requestLines = (title, [...data]) =>
  request(title, {
    _: "Line",
    data: {
      labels: [
        ...Array(
          // TODO: fix this (should account for multiple datasets now, as opposed to a single line)
          Math.max(
            ...Object.values(data[0]).map(({ data: { length } }) => length)
          )
        )
      ].map((_, i) => `${i}`),
      datasets: [].concat(
        ...data.map((datum, i) =>
          Object.entries(datum).map(([label, { data, backgroundColor }]) => ({
            label: `${label} #${i}`,
            data,
            backgroundColor
          }))
        )
      )
    }
  });

const requestJson = (title, data) =>
  request(title, {
    _: "Json",
    data
  });

const ensureServerLoaded = () =>
  axios({ method: "get", url })
    .then(() => undefined)
    .catch(e =>
      Promise.resolve()
        .then(() =>
          console.log(
            `${chalk.blue("[@werbos/viz]")} ${chalk.yellow("Launching... 🚀")}`
          )
        )
        .then(() =>
          sabrina(
            {
              "react-chartjs-2": ["Line"],
              "react-json-tree": [["default", "Json"]]
            },
            { title: "🧠 werbos" }
          )
        )
        .then(() =>
          console.log(
            `${chalk.blue("[@werbos/viz]")} ${chalk.green("Server ready.")}`
          )
        )
        .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
        .then(() => open(url))
    );

const trainingDataToLine = (
  trainingData,
  lossColor = "#2d5ba6",
  valLossColor = "#a8328d"
) => {
  const {
    history: { loss, val_loss }
  } = trainingData;
  return Object.fromEntries(
    [
      !!typeCheck("[Number]", loss) && [
        "loss",
        { data: loss, backgroundColor: lossColor }
      ],
      !!typeCheck("[Number]", val_loss) && [
        "val_loss",
        { data: val_loss, backgroundColor: valLossColor }
      ]
    ].filter(e => !!e)
  );
};

const handleTrainingResults = (options, input, { useMeta }) => {
  useMeta(useMeta());
  return ensureServerLoaded()
    .then(() =>
      requestLines(options.title || "📉  Training Results", [
        trainingDataToLine(input)
      ])
    )
    .then(() => input);
};

const handleKfoldTrainingResults = (options, input, { useMeta }) => {
  useMeta(useMeta());
  return ensureServerLoaded()
    .then(() =>
      requestLines(
        options.title || `🧪 K-Fold Training Results (k=${input.length})`,
        input.map(e => trainingDataToLine(e))
      )
    )
    .then(() => input);
};

const handleDefault = ({ title }, input, { useMeta }) => {
  useMeta(useMeta());
  return ensureServerLoaded()
    .then(() => requestJson(title || "🌳 Log", input))
    .then(() => input);
};

export const viz = (options = defaultOptions) => handle => {
  const opts = {
    ...defaultOptions,
    ...options
  };
  handle(trainingShape, (input, hooks) =>
    handleTrainingResults(opts, input, hooks)
  );
  handle(kfoldTrainingShape, (input, hooks) =>
    handleKfoldTrainingResults(opts, input, hooks)
  );
  handle("*", (input, hooks) => handleDefault(opts, input, hooks));
};
