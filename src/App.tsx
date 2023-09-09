import { type Component } from "solid-js";
import Drawflow from "./components/Drawflow";
import curveCss from "./styles/curve.module.scss";
import nodeCss from "./styles/node.module.scss";
import {
  addConnection,
  addInput,
  addNode,
  addOutput,
  getTotalConnectedInputs,
  nodes,
} from "./utils/drawflow-storage";

const customData: Record<string, { gender: "M" | "F" }> = {};

for (let i = 0; i < 50; i++) {
  const newNode = addNode(Math.random() * 2000, Math.random() * 2000, {
    inputConnector: nodeCss["input-connector"],
    inputsSection: nodeCss["inputs-section"],
    normal: nodeCss.node,
    outputConnector: nodeCss["output-connector"],
    outputsSection: nodeCss["outputs-section"],
    selected: nodeCss["selected-node"],
  })!;
  addOutput(newNode.nodeId);
  addInput(newNode.nodeId);
  addInput(newNode.nodeId);
  customData[newNode.nodeId] = {
    gender: Math.floor(Math.random() * 2) === 1 ? "M" : "F",
  };
}
const totalNodes = Object.keys(nodes).length;

for (let i = 0; i < totalNodes; i++) {
  const from = Math.floor(Math.random() * totalNodes);
  const to = Math.floor(Math.random() * totalNodes);
  const fromNode = nodes[from.toString()];
  const toNode = nodes[to.toString()];
  if (!fromNode || !toNode) {
    continue;
  }

  const toInput = customData[from.toString()].gender === "M" ? "0" : "1";
  if (from === to || getTotalConnectedInputs(to.toString(), toInput) > 0) {
    continue;
  }

  addConnection(
    from.toString(),
    "0",
    to.toString(),
    toInput.toString(),
    toInput == "1" ? curveCss.father : curveCss.mother
  );
}

const App: Component = () => <Drawflow />;

export default App;
