import axios from "axios";
import open from "open";
import { typeCheck } from  "type-check";

const defaultData = Object.freeze({
  width: 768,
  height: 768,
});

const defaultOptions = Object.freeze({
  
});

const requestGraph = (method, data = defaultData) =>
  axios({
    url: `http://localhost:3030${method}`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    data: {
      ...defaultData,
      ...data
    }
  })
    .then(({ data }) => data)
    .catch(({ response: { data: { errors } } }) =>
      Promise.reject(new Error(errors))
    );

const requestLine = (data, { ...extras }) => requestGraph(
  "/charts/line",
  {
    data,
    ...extras,
  },
);

const openChart = url => Promise
  .resolve()
  .then(() => console.log(`📊 ${url}`))
  .then(() => open(url));

export const viz = (options = defaultOptions) => handle => [
  /* training history */
  handle("{params:{...},epoch:[Number],history:{...},...}", (input, { useMeta }) => {
    useMeta(useMeta());
    const { epoch, history: { loss, val_loss } } = input;
    const [hasLoss, hasValLoss] = [
      typeCheck("[Number]", loss),
      typeCheck("[Number]", val_loss),
    ];
    return requestLine(
      [
        hasLoss && (
          {
            id: 'loss',
            data: loss.map((y, x) => ({ x, y })),
          }
        ),
        hasValLoss && (
          {
            id: 'val_loss',
            data: val_loss.map((y, x) => ({ x, y })),
          }
        ),
      ]
        .filter(e => !!e),
      {
        axisLeft: {
          legend: 'loss',
          legendOffset: -12,
        },
        axisBottom: {
          legend: 'epochs',
          legendOffset: -12,
        },
        enableArea: true,
        colors: [
          hasLoss && 'blue',
          hasValLoss && 'firebrick',
        ].filter(e => !!e),
      },
    )
      .then(({ url }) => openChart(url))
      .then(() => input);
  }),
  handle("*", (input, { useMeta }) => {
    console.error(`❌ Unable to visualize ${input}.`);
    useMeta(useMeta());
    return input;
  }),
] && undefined;
