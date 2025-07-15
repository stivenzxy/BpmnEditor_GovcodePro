import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

const ResetButton = ({ modelerInstance }) => {
  const handleReset = () => {
    localStorage.removeItem("bpmn-draft");
    modelerInstance?.createDiagram();
  };

  return (
    <button data-tooltip-id="resetBpmnButton" data-tooltip-content="Limpiar Bpmn" data-tooltip-place="right"
        className="cursor-pointer rounded-md bg-slate-200 py-1 px-2 ml-2"
        onClick={handleReset}
    >
    <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
    <Tooltip id="resetBpmnButton"></Tooltip>
    </button>
  );
};

export default ResetButton;