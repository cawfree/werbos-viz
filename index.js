import "react-chartjs-2";
import "react-json-tree";

import axios from "axios";
import sabrina from "sabrina";
import compose from "rippleware";
import open from "open";
import { typeCheck } from "type-check";

const defaultOptions = Object.freeze(
  {
    title: undefined,
  },
);

// TODO: Likely a function of config.
const url = 'http://localhost:3000';

const request = (title, children) => axios({
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  url: `${url}/pane`,
  method: 'post',
  data: {
    title,
    children,
  },
});

const requestLine = (title, data) => request(
  title,
  {
    _: 'Line',
    data: {
      labels: [...Array(Math.max(...Object.values(data).map(({ data: { length } }) => length)))]
        .map((_, i) => `${i}`),
      datasets: Object.entries(data)
        .map(
          ([label, { data, backgroundColor }]) => ({
            label,
            data,
            backgroundColor,
          }),
        ),
    },
  },
);

const requestJson = (title, data) => request(
  title,
  {
    _: 'Json',
    data,
  },
);

// TODO: Needs stateful handling.
const ensureServerLoaded = () => sabrina(
  {
    "react-chartjs-2": ["Line"],
    "react-json-tree": [["default", "Json"]],
  },
)
  .then(() => open(url))
  .then(() => new Promise(resolve => setTimeout(resolve, 5000)));

const handleTrainingResults = (options, input, { useMeta }) => {
  const { history: { loss, val_loss }} = input;
  useMeta(useMeta());
  // TODO: How to load the server initially?
  return ensureServerLoaded()
    .then(() => requestLine(
      options.title || 'Training Results',
      Object
        .fromEntries(
          [
            (!!typeCheck('[Number]', loss)) && ['loss', { data: loss, backgroundColor: '#2d5ba6' }],
            (!!typeCheck('[Number]', val_loss)) && ['val_loss', { data: val_loss, backgroundColor: '#a8328d' }],
          ]
            .filter(e => !!e),
        ),
    ))
    .then(() => input);
};

const handleDefault = ({ title }, input, { useMeta }) => {
  useMeta(useMeta());
  return ensureServerLoaded()
    .then(() => requestJson(title || '🌳 Log', input))
    .then(() => input);
};

const viz = (options = defaultOptions) => handle => {
  const opts = {
    ...defaultOptions,
    options,
  };
  handle('{params:{...},epoch:[Number],history:{...},...}', (input, hooks) => handleTrainingResults(opts, input, hooks));
  handle('*', (input, hooks) => handleDefault(opts, input, hooks));
};

const app = compose()
  .use(viz({ title: 'ahhh!' }));

app(
  {
    "validationData": null,
    "params": {
      "epochs": 100,
      "initialEpoch": 0,
      "samples": 474,
      "steps": null,
      "batchSize": 128,
      "verbose": 1,
      "doValidation": true,
      "metrics": ["loss", "val_loss"]
    },
    "epoch": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
    "history": {
      "val_loss": [70.41766357421875, 47.03289794921875, 37.05887222290039, 34.802486419677734, 35.56342315673828, 34.219688415527344, 43.00543975830078, 25.562824249267578, 22.50123405456543, 37.08184051513672, 22.943553924560547, 22.479774475097656, 21.607807159423828, 33.218040466308594, 21.042808532714844, 25.85611343383789, 21.362462997436523, 20.99697494506836, 25.412384033203125, 21.983613967895508, 19.477584838867188, 26.47056770324707, 30.52638053894043, 27.507417678833008, 21.847381591796875, 32.62956237792969, 22.048471450805664, 45.33060836791992, 36.36497116088867, 28.321502685546875, 22.31224822998047, 28.904541015625, 21.471630096435547, 22.487194061279297, 20.132293701171875, 19.474193572998047, 35.022743225097656, 21.462379455566406, 30.24239730834961, 22.770753860473633, 22.396442413330078, 19.033931732177734, 24.512157440185547, 34.820953369140625, 36.33537292480469, 18.48686981201172, 21.96991729736328, 36.93211364746094, 68.78321838378906, 39.148048400878906, 31.3988037109375, 40.40827178955078, 30.878761291503906, 23.50948143005371, 45.254547119140625, 31.12615966796875, 39.062191009521484, 36.091827392578125, 28.708871841430664, 17.465051651000977, 20.23098373413086, 23.860652923583984, 27.05318260192871, 32.0859375, 49.79098892211914, 29.351482391357422, 20.93977928161621, 20.548439025878906, 24.3691463470459, 32.14856719970703, 27.72559356689453, 25.736949920654297, 28.667633056640625, 31.686626434326172, 38.49896240234375, 21.33509635925293, 26.947826385498047, 21.39904022216797, 46.28974914550781, 20.90654754638672, 24.613605499267578, 30.79874038696289, 22.861366271972656, 26.03292465209961, 16.167631149291992, 23.86652374267578, 22.447803497314453, 41.32380676269531, 20.394027709960938, 23.557933807373047, 20.473648071289062, 20.166122436523438, 47.57742691040039, 21.081653594970703, 20.930713653564453, 29.453296661376953, 24.24231719970703, 28.29843521118164, 26.347423553466797, 32.16392517089844],
      "loss": [379.45611572265625, 48.739845275878906, 24.991960525512695, 29.602937698364258, 25.703760147094727, 20.348817825317383, 32.721229553222656, 17.413776397705078, 13.577119827270508, 14.364031791687012, 32.88327407836914, 17.858470916748047, 18.364458084106445, 17.114290237426758, 19.571138381958008, 17.090057373046875, 17.983083724975586, 22.826276779174805, 16.52118492126465, 16.793787002563477, 16.921119689941406, 23.009986877441406, 15.94994831085205, 13.671087265014648, 19.425121307373047, 21.071151733398438, 11.849577903747559, 15.188699722290039, 14.042749404907227, 11.500815391540527, 25.01519775390625, 14.255352020263672, 11.373851776123047, 16.976119995117188, 22.652658462524414, 12.664657592773438, 12.675490379333496, 19.454723358154297, 17.59836196899414, 10.707784652709961, 13.906190872192383, 16.678598403930664, 11.852849006652832, 12.207148551940918, 12.912406921386719, 16.726110458374023, 17.993038177490234, 11.640634536743164, 14.346955299377441, 16.005205154418945, 14.962512969970703, 11.941483497619629, 9.013031005859375, 18.849140167236328, 13.788734436035156, 9.526446342468262, 16.330284118652344, 14.351383209228516, 8.863348960876465, 18.392452239990234, 14.509506225585938, 9.192093849182129, 8.267492294311523, 19.536273956298828, 8.468984603881836, 9.842479705810547, 16.213829040527344, 14.875492095947266, 13.486037254333496, 12.396437644958496, 9.37318229675293, 12.074881553649902, 15.451353073120117, 10.503763198852539, 10.143844604492188, 11.104227066040039, 13.389484405517578, 13.778119087219238, 8.247005462646484, 7.364555358886719, 12.298436164855957, 14.779343605041504, 11.166059494018555, 17.307083129882812, 9.75710678100586, 11.739792823791504, 9.222188949584961, 7.317647933959961, 16.933956146240234, 11.56043529510498, 11.464974403381348, 11.215487480163574, 8.708882331848145, 11.005762100219727, 16.651647567749023, 7.273936748504639, 11.703855514526367, 8.682079315185547, 8.725306510925293, 13.0275239944458]
    }
  }
);
