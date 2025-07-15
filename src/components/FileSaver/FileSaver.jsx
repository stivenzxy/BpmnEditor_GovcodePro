import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

// ({modelerInstance}) -> Prop - datos que se pasan de componente padre a componente hijo (unidireccional)
const FileSaver = ({ modelerInstance }) => {
  const handleFileSave = async () => {
    if (!modelerInstance) {
      console.warn("Modeler no disponible");
      return;
    }

    try {
      const { xml } = await modelerInstance.saveXML({ format: true });

      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "diagrama.bpmn";
      a.click();

      URL.revokeObjectURL(url); 
    } catch (error) {
      console.error("Error al guardar el modelo:", error);
    }
  };

  return (
    <button data-tooltip-id="saveButton" data-tooltip-place="right" data-tooltip-content="Guardar Bpmn"
      className="cursor-pointer rounded-md bg-slate-200 py-1 px-2 ml-2"
      onClick={handleFileSave}
    >
      <Tooltip id="saveButton"></Tooltip>
      <FontAwesomeIcon icon={faFloppyDisk} />
    </button>
  );
};

export default FileSaver;
