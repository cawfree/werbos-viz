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

const requestLine = (title, data) =>
  request(title, {
    _: "Line",
    data: {
      labels: [
        ...Array(
          Math.max(...Object.values(data).map(({ data: { length } }) => length))
        )
      ].map((_, i) => `${i}`),
      datasets: Object.entries(data).map(
        ([label, { data, backgroundColor }]) => ({
          label,
          data,
          backgroundColor
        })
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
        .then(() => console.log(`${chalk.blue('[@werbos/viz]')} ${chalk.yellow('Launching... 🚀')}`))
        .then(() =>
          sabrina(
            {
              "react-chartjs-2": ["Line"],
              "react-json-tree": [["default", "Json"]]
            },
            { title: "🧠 werbos" }
          )
        )
        .then(() => console.log(`${chalk.blue('[@werbos/viz]')} ${chalk.green('Server ready.')}`))
        .then(() => new Promise(resolve => setTimeout(resolve, 3000)))
        .then(() => open(url))
    );

const handleTrainingResults = (options, input, { useMeta }) => {
  const {
    history: { loss, val_loss }
  } = input;
  useMeta(useMeta());
  return ensureServerLoaded()
    .then(() =>
      requestLine(
        options.title || "📉  Training Results",
        Object.fromEntries(
          [
            !!typeCheck("[Number]", loss) && [
              "loss",
              { data: loss, backgroundColor: "#2d5ba6" }
            ],
            !!typeCheck("[Number]", val_loss) && [
              "val_loss",
              { data: val_loss, backgroundColor: "#a8328d" }
            ]
          ].filter(e => !!e)
        )
      )
    )
    .then(() => input);
};

const handleKfoldTrainingResults = (opts, input, { useMeta }) => {
  useMeta(useMeta());
  return ensureServerLoaded()
    .then(
      () => requestJson(
        'k fold training data (should say k=)',
        input,
      ),
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
