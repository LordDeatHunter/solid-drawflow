import { Component, Show } from "solid-js";
import {
  getDrawflowCenter,
  mouseData,
  Optional,
  removeNode,
  selectNode,
  updateNode,
} from "solid-drawflow/src";
import { FormDataType } from "./SidebarContent";
import formStyle from "../styles/form.module.scss";
import { createFamilyMemberNode } from "../utils";

interface NodeFormButtonsProps {
  mode: "add" | "empty" | "view" | "edit";
  nodeData: Optional<FormDataType>;
  formData: Optional<FormDataType>;
  setFormData: (data: Optional<FormDataType>) => void;
}

const AddButton: Component<{ onClick: () => void }> = (props) => (
  <button onClick={() => props.onClick()}>Add</button>
);

const NodeFormButtons: Component<NodeFormButtonsProps> = (props) => {
  const onAdd = () => props.setFormData({ name: "" } as FormDataType);
  const onCancel = () => props.setFormData(undefined);
  const onEdit = () => props.setFormData({ ...props.nodeData! });
  const onRemoveEditingNode = () => {
    removeNode(props.formData!.id);
    props.setFormData(undefined);
  };
  const onRemovePreviewNode = () => removeNode(props.nodeData!.id);
  const onSaveNewNode = () => {
    if (!props.formData?.name || !props.formData?.gender) return;
    const node = createFamilyMemberNode(
      props.formData!.name,
      props.formData!.gender,
      getDrawflowCenter(),
    );
    selectNode(node!.id, mouseData.mousePosition!, false);
    props.setFormData(undefined);
  };
  const onUpdateNode = () => {
    updateNode(props.formData!.id, {
      customData: {
        ...props.formData,
      },
    });
    props.setFormData(undefined);
  };

  return (
    <div class={formStyle.formButtonContainer}>
      <Show when={props.mode === "empty"}>
        <AddButton onClick={onAdd} />
      </Show>
      <Show when={props.mode === "add"}>
        <button onClick={onSaveNewNode}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </Show>
      <Show when={props.mode === "view"}>
        <AddButton onClick={onAdd} />
        <button onClick={onEdit}>Edit</button>
        <button onClick={onRemovePreviewNode}>Delete</button>
      </Show>
      <Show when={props.mode === "edit"}>
        <button onClick={onUpdateNode}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onRemoveEditingNode}>Delete</button>
      </Show>
    </div>
  );
};

export default NodeFormButtons;
