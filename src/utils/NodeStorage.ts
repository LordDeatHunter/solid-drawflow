import { createSignal } from "solid-js";
import {
  NodeData,
  NodeInput,
  NodeOutput,
  OutputDestination,
  SignalObject,
} from "../types/types";

export const [nodes, setNodes] = createSignal<Record<string, NodeData>>({});

export const addNode = (x = 0, y = 0, css?: string): NodeData => {
  let newNode;
  setNodes((prev) => {
    const newId = Object.keys(prev).length + 1;
    const [position, setPosition] = createSignal({ x, y });
    const [ref, setRef] = createSignal();
    const [getCss, setCss] = createSignal(css ?? "");

    const [inputs, setInputs] = createSignal<SignalObject<NodeInput>[]>([]);
    const [outputs, setOutputs] = createSignal<SignalObject<NodeOutput>[]>([]);

    newNode = {
      position: { get: position, set: setPosition },
      nodeId: newId.toString(),
      ref: { get: ref, set: setRef },
      inputs: { get: inputs, set: setInputs },
      outputs: { get: outputs, set: setOutputs },
      css: { get: getCss, set: setCss },
    };

    return {
      ...prev,
      [newId]: newNode,
    };
  });
  return newNode!;
};

export const getNode = (nodeId: string): NodeData | undefined =>
  nodes()[nodeId];

export const removeNode = (nodeId: string) => {
  setNodes((prev) => {
    Object.values(prev).forEach((node) =>
      Object.values(node.outputs.get()).forEach((output) =>
        output
          .get()
          .destinations.set((destinations) =>
            destinations.filter(
              (destination) => destination.destinationNodeId !== nodeId
            )
          )
      )
    );
    const { [nodeId]: _, ...rest } = prev;
    return rest;
  });
};

export const addConnection = (
  sourceNodeId: string,
  sourceOutputId: string,
  destinationNodeId: string,
  destinationInputId: string,
  css = "",
  createMissingNodes = false
) => {
  const sourceNode = getNode(sourceNodeId);
  const destinationNode = getNode(destinationNodeId);

  if (!sourceNode || !destinationNode) {
    return;
  }

  if (
    !(sourceOutputId in sourceNode.outputs.get()) ||
    !(destinationInputId in destinationNode.inputs.get())
  ) {
    if (!createMissingNodes) {
      return;
    }

    if (!(sourceOutputId in sourceNode.outputs.get())) {
      addOutput(sourceNodeId, sourceOutputId);
    }

    if (!(destinationInputId in destinationNode.inputs.get())) {
      addInput(destinationNodeId, destinationInputId);
    }
  }

  const [getCss, setCss] = createSignal(css ?? "");
  const outputDestinations = sourceNode.outputs
    .get()
    [sourceOutputId].get().destinations;

  outputDestinations.set([
    ...outputDestinations.get(),
    {
      destinationNodeId,
      destinationInputId,
      css: { get: getCss, set: setCss },
    },
  ]);
};

export const addInput = (nodeId: string, inputId?: string) => {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }

  inputId ??= node.inputs.get().length.toString();
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const [input, setInput] = createSignal<NodeInput>({
    connectorId: inputId,
    ref: { get: ref, set: setRef },
    position: { get: position, set: setPosition },
  });

  node.inputs.get()[inputId] = { get: input, set: setInput };
};

export const addOutput = (nodeId: string, outputId?: string) => {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }

  const [getDestination, setDestination] = createSignal<OutputDestination[]>(
    []
  );
  outputId ??= node.outputs.get().length.toString();
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const [output, setOutput] = createSignal<NodeOutput>({
    connectorId: outputId,
    ref: { get: ref, set: setRef },
    position: { get: position, set: setPosition },
    destinations: { get: getDestination, set: setDestination },
  });
  node.outputs.get()[outputId] = { get: output, set: setOutput };
};

export const getInputRect = (
  nodeId: string,
  connectorId: string
): DOMRect | undefined => {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }

  return node.inputs
    .get()
    [connectorId]?.get()
    ?.ref.get()
    ?.getBoundingClientRect();
};

export const getOutputRect = (
  nodeId: string,
  connectorId: string
): DOMRect | undefined =>
  nodes()
    [nodeId]?.outputs?.get()
    ?.[connectorId]?.get()
    ?.ref.get()
    ?.getBoundingClientRect();

export const getTotalConnectedInputs = (
  nodeId: string,
  inputId?: string
): number => {
  const node = getNode(nodeId);
  if (!node) {
    return 0;
  }
  return Object.values(nodes()).reduce(
    (total, node) =>
      total +
      Object.values(node.outputs.get()).reduce(
        (totalOutputs, output) =>
          totalOutputs +
          output
            .get()
            .destinations.get()
            .filter(
              (destination) =>
                destination.destinationNodeId === nodeId &&
                (inputId ? destination.destinationInputId === inputId : true)
            ).length,
        0
      ),
    0
  );
};
