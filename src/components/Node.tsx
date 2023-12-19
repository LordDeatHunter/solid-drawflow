import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  For,
} from "solid-js";
import { drawflow, mouseData, nodes, setNodes } from "../utils";
import { DrawflowNode } from "../drawflow-types";
import { Vec2 } from "../utils/vec2";
import { drawflowEventStore } from "../utils/events";

interface NodeProps {
  nodeId: string;
}

const Node: Component<NodeProps> = (props) => {
  const node = createMemo<DrawflowNode>(() => nodes[props.nodeId]);
  const [isVisible, setIsVisible] = createSignal<boolean>(false);

  createEffect(() => {
    if (mouseData.heldNodeId !== props.nodeId || !mouseData.draggingNode) {
      return;
    }

    const position = mouseData.mousePosition
      .divideBy(drawflow.zoomLevel)
      .subtract(mouseData.clickStartPosition ?? Vec2.default());

    setNodes(props.nodeId, "position", position);
  });

  return (
    <div
      ref={(el) =>
        setTimeout(() => {
          if (!el) return;

          const positionOffset = node().centered
            ? Vec2.of(el.clientWidth, el.clientHeight).divideBy(2)
            : Vec2.default();

          setNodes(props.nodeId, {
            offset: Vec2.of(el.clientLeft, el.clientTop),
            ref: el,
            position: node().position.subtract(positionOffset),
            size: Vec2.of(el.clientWidth, el.clientHeight),
          });

          setIsVisible(true);
        })
      }
      style={{
        left: `${node().position.x}px`,
        top: `${node().position.y}px`,
        opacity: isVisible() ? 1 : 0,
      }}
      classList={{
        [node()?.css?.normal ?? ""]: true,
        [node()?.css?.selected ?? ""]: mouseData.heldNodeId === props.nodeId,
      }}
      onMouseDown={(event) =>
        drawflowEventStore.onMouseDownInNode.publish({
          event,
          nodeId: props.nodeId,
        })
      }
      onTouchStart={(event) =>
        drawflowEventStore.onTouchStartInNode.publish({
          event,
          nodeId: props.nodeId,
        })
      }
    >
      {node().display({ node: node() })}
      <For each={Object.entries(node().connectorSections)}>
        {([sectionId, section]) => (
          <div class={section?.css}>
            <For each={Object.entries(section.connectors)}>
              {([connectorId, connector]) => (
                <div
                  ref={(el) =>
                    setTimeout(() => {
                      if (!el) return;
                      setNodes(
                        props.nodeId,
                        "connectorSections",
                        sectionId,
                        "connectors",
                        connectorId,
                        (prev) => ({
                          ...prev,
                          position: Vec2.of(
                            (el?.parentElement?.offsetLeft ?? 0) +
                              el.offsetLeft,
                            (el?.parentElement?.offsetTop ?? 0) + el.offsetTop,
                          ),
                          ref: el,
                          size: Vec2.of(el.offsetWidth, el.offsetHeight),
                        }),
                      );
                    })
                  }
                  class={connector?.css}
                  onPointerUp={(event) =>
                    drawflowEventStore.onPointerUpInConnector.publish({
                      event,
                      nodeId: props.nodeId,
                      connectorId,
                    })
                  }
                  onTouchStart={(event) =>
                    drawflowEventStore.onTouchStartInConnector.publish({
                      event,
                      nodeId: props.nodeId,
                      connectorId,
                    })
                  }
                  onMouseDown={(event) =>
                    drawflowEventStore.onMouseDownInConnector.publish({
                      event,
                      nodeId: props.nodeId,
                      connectorId,
                    })
                  }
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

export default Node;
