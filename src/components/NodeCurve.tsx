import { Component, createEffect, createMemo } from "solid-js";
import {
  CurveFunctions,
  getConnector,
  getSectionFromConnector,
  mouseData,
  nodes,
  setNodes,
} from "../utils";
import {
  DrawflowNode,
  NodeConnector,
  Optional,
  PathData,
  SelectableElementCSS,
} from "../drawflow-types";
import { drawflowEventStore } from "../utils/events";

interface NodeCurveProps {
  sourceNodeId: string;
  sourceConnectorId: string;
  destinationNodeId: string;
  destinationConnectorId: string;
  css: SelectableElementCSS;
}

const NodeCurve: Component<NodeCurveProps> = (props) => {
  const startNode = createMemo<DrawflowNode>(() => nodes[props.sourceNodeId]);
  const endNode = createMemo<DrawflowNode>(
    () => nodes[props.destinationNodeId],
  );

  const sourceConnector = createMemo<Optional<NodeConnector>>(() =>
    getConnector(props.sourceNodeId, props.sourceConnectorId),
  );
  const destinationConnector = createMemo<Optional<NodeConnector>>(() =>
    getConnector(props.destinationNodeId, props.destinationConnectorId),
  );

  const destinationIndex = createMemo<number>(() =>
    !startNode() || !endNode()
      ? -1
      : sourceConnector()?.destinations?.findIndex(
          (destination) =>
            destination.destinationConnector === destinationConnector(),
        ) ?? -1,
  );

  createEffect(() => {
    if (destinationIndex() < 0) {
      return;
    }

    const {
      position: startPosition,
      offset: startNodeOffset,
      size: startNodeSize,
    } = startNode();
    const {
      position: endPosition,
      offset: endNodeOffset,
      size: endNodeSize,
    } = endNode();

    const outputSection = getSectionFromConnector(
      props.sourceNodeId,
      props.sourceConnectorId,
    )!;
    const inputSection = getSectionFromConnector(
      props.destinationNodeId,
      props.destinationConnectorId,
    )!;
    const input = inputSection.connectors[props.destinationConnectorId]!;
    const output = outputSection.connectors[props.sourceConnectorId]!;

    const start = startPosition.add(
      startNodeOffset,
      output.position,
      output.size.divideBy(2),
    );
    const end = endPosition.add(
      endNodeOffset,
      input.position,
      input.size.divideBy(2),
    );

    const path: PathData = {
      start,
      end,
      path: CurveFunctions.createNodePathCurve(
        start,
        end,
        startPosition.add(startNodeOffset).add(startNodeSize.divideBy(2)),
        endPosition.add(endNodeOffset).add(endNodeSize.divideBy(2)),
      ),
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Solid doesn't like this
    setNodes(
      props.sourceNodeId,
      "connectorSections",
      outputSection.id,
      "connectors",
      props.sourceConnectorId,
      "destinations",
      destinationIndex(),
      "path",
      path,
    );
  });

  return (
    <path
      onPointerDown={(event) => {
        drawflowEventStore.onPointerDownInNodeCurve.publish({
          event,
          sourceConnector: sourceConnector()!,
          destinationConnector: destinationConnector()!,
        });
      }}
      d={sourceConnector()!.destinations[destinationIndex()].path?.path}
      stroke="black"
      stroke-width={1}
      fill="none"
      classList={{
        [props.css?.normal ?? ""]: true,
        [props.css?.selected ?? ""]:
          mouseData.heldConnection?.sourceConnector.parentSection.parentNode
            .id === props.sourceNodeId &&
          mouseData.heldConnection?.sourceConnector.id ===
            props.sourceConnectorId &&
          mouseData.heldConnection?.destinationConnector.parentSection
            .parentNode.id === props.destinationNodeId &&
          mouseData.heldConnection?.destinationConnector.id ===
            props.destinationConnectorId,
      }}
      style={{
        cursor: "pointer",
        "pointer-events": "visibleStroke",
      }}
    />
  );
};
export default NodeCurve;
