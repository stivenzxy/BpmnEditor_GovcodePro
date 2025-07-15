import { useEffect } from "react";

const STORAGE_KEY = 'bpmn-draft';

export const useAutoSaveBpmn = (modelerRef, isReady = false) => {
    useEffect(() => {
        if(!isReady || !modelerRef.current) return;

        const modeler = modelerRef.current;
        const bpmnEventBus = modeler.get('eventBus');

        const saveModel = async () => {
            try {
                const { xml } = await modeler.saveXML({ format: true });
                localStorage.setItem(STORAGE_KEY, xml)
                //console.log("Cambios guardados en localStorage");
            } catch (error) {
                console.warn("Error al guardar en localStorage", error);
            }
        };

        bpmnEventBus.on('commandStack.changed', saveModel);

        return () => {
            bpmnEventBus.off('commandStack.changed', saveModel);
        };
    }, [modelerRef, isReady]);
};