import { useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "react-tooltip";

const FileLoader = ({ onImport }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlFile = event.target.result;
      onImport(xmlFile);
    };

    reader.readAsText(file);
  };

  return (
    <>
      <button data-tooltip-id="loadXmlButton" data-tooltip-content="Cargar Bpmn" data-tooltip-place="right"
        className="cursor-pointer rounded-md bg-slate-200 py-1 px-2" onClick={() => fileInputRef.current.click()}>
        <Tooltip id="loadXmlButton"></Tooltip>
        <FontAwesomeIcon icon={faArrowUpFromBracket}/>
      </button>
      <input
        type="file"
        accept=".bpmn,.xml"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default FileLoader