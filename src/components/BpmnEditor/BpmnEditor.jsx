import { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "./BpmnEditor.css";

import FileLoader from "../FileLoader/FileLoader";
import FileSaver from "../FileSaver/FileSaver";
import { useAutoSaveBpmn } from "../../hooks/useAutoSaveBpmn";
import ResetButton from "../ResetButton/ResetButton";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";

import "@bpmn-io/properties-panel/dist/assets/properties-panel.css";
import "@bpmn-io/element-template-chooser/dist/element-template-chooser.css";
import {
  ElementTemplatesCoreModule,
  ElementTemplatesPropertiesProviderModule,
} from "bpmn-js-element-templates";
import ElementTemplateChooserModule from "@bpmn-io/element-template-chooser";

import camundaModdle from "camunda-bpmn-moddle/resources/camunda.json";

import CustomRenderer from "../../renderers/customRenderer";
import DeployProcessButton from "../DeployProcessButton/DeployProcessButton";

const BpmnEditor = () => {
  const [isModelerReady, setIsModelerReady] = useState(false);

  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const templateModules = import.meta.glob('../../assets/element-templates/*.json', { eager: true });
    const templates = Object.values(templateModules).flatMap(mod => Array.isArray(mod.default) ? mod.default : [mod.default]);


    modelerRef.current = new BpmnModeler({
      container,
      propertiesPanel: {
        parent: "#properties",
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ElementTemplatesCoreModule,
        ElementTemplatesPropertiesProviderModule,
        ElementTemplateChooserModule,
        {
          __init__: ["customRenderer"],
          customRenderer: [
            "type",
            function (eventBus, bpmnRenderer) {
              return new CustomRenderer(eventBus, bpmnRenderer, templates);
            },
          ],
        },
      ],
      moddleExtensions: {
        camunda: camundaModdle,
      },
    });

    setIsModelerReady(true);

    modelerRef.current.on("elementTemplates.errors", (event) => {
      console.warn("Errores al cargar templates:", event.errors);
    });

    modelerRef.current.get("elementTemplatesLoader").setTemplates(templates);
    modelerRef.current.get("canvas").zoom("fit-viewport");
    let initialized = false;

    {/* Observer para detectar cambios en el contenedor y evitar errores de renderizado del canvas */}
    observerRef.current = new ResizeObserver((entries) => {
      if (initialized) return;

      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && modelerRef.current) {
          const saved = localStorage.getItem("bpmn-draft");
          if (saved && saved.startsWith("<?xml")) {
            modelerRef.current.importXML(saved);
          } else {
            modelerRef.current.createDiagram();
          }
          initialized = true;
        }
      }
    });

    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
      modelerRef.current?.destroy();
    };
  }, []);

  useAutoSaveBpmn(modelerRef, isModelerReady);

  const handleImport = async (xmlFile) => {
    try {
      await modelerRef.current?.importXML(xmlFile);
      const { xml } = await modelerRef.current.saveXML({ format: true });

      localStorage.setItem("bpmn-draft", xml);
      console.log("Modelo cargado exitosamente!");
    } catch (error) {
      console.error("Error al importar el modelo", error);
    }
  };

  return (
    <div className="flex w-full h-full min-h-[600px] overflow-hidden">
      {/* Canvas principal del modeler */}
      <div className="relative flex-1">
        {/* Botón flotante de herramientas abajo a la izquierda */}
        <div className="absolute flex items-center gap-2 bottom-5 left-5 bg-gray-100 rounded-lg px-2 py-2 shadow-md z-10">
          <FileLoader onImport={handleImport} />
          {isModelerReady && <FileSaver modelerInstance={modelerRef.current} />}
          <ResetButton modelerInstance={modelerRef.current} />
          {isModelerReady && <DeployProcessButton modelerInstance={modelerRef.current} />}
        </div>

        <div
          ref={containerRef}
          className="w-full h-full border-t-[0.5px] border-black bg-white box-border [&_*:focus]:outline-none"
        ></div>
      </div>

      {/* Properties Panel fijo a la derecha */}
      <div
        id="properties"
        className="w-[300px] border-l border-l-gray-300 border-t border-t-black bg-white overflow-auto"
      ></div>
    </div>
  );
};

export default BpmnEditor;
