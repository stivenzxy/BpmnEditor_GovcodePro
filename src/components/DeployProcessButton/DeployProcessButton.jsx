import Swal from 'sweetalert2';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket } from '@fortawesome/free-solid-svg-icons';

const DeployProcessButton = ({ modelerInstance }) => {
    const handleDeployButtonClick = async () => {
        const { value: deploymentName } = await Swal.fire({
            title: "Ingrese el nombre del proceso",
            input: "text",
            inputLabel: "Por favor ingrese un nombre para el deployment",
            showCancelButton: true,
            confirmButtonText: "Desplegar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value) return "Debe asignar un nombre al proceso!";
            }
        });

        if (!deploymentName) return;

        try {
            const { xml } = await modelerInstance.saveXML({ format: true });

            const formData = new FormData();
            formData.append('deployment-name', deploymentName);
            formData.append('deployment-source', 'bpmn-js');
            formData.append('data', new Blob([xml], { type: 'text/xml' }), 'process.bpmn');

            const response = await fetch('http://localhost:8080/engine-rest/deployment/create', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();

                const deployedDefinitions = result.deployedProcessDefinitions;

                if (deployedDefinitions && Object.keys(deployedDefinitions).length > 0) {
                    const firstKey = Object.keys(deployedDefinitions)[0];
                    const processDefinition = deployedDefinitions[firstKey];
                    const deployedProcessId = processDefinition.id;

                    const Toast = Swal.mixin({
                        toast: true,
                        icon: "success",
                        position: "bottom-left",
                        showConfirmButton: false,
                        timerProgressBar: true,
                        timer: 5000
                    })
                    Toast.fire({
                        title: `Proceso desplegado exitosamente con ID: ${deployedProcessId}`
                    });
                }
            } else {
                const error = await response.json();
                
                const Toast = Swal.mixin({
                        toast: true,
                        icon: "error",
                        position: "bottom-left",
                        showConfirmButton: false,
                        timerProgressBar: true,
                        timer: 3000
                    })
                    Toast.fire({
                        title: `Error al desplegar el proceso: ${error.message}`
                    });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({title: "Error al intentar desplegar el proceso", icon: "error", text: "Intente nuevamente"});
        }
    };

    return (
        <button onClick={handleDeployButtonClick} data-tooltip-id="deployProcessButton"
        data-tooltip-content="Desplegar proceso" data-tooltip-place="right"
        className="cursor-pointer rounded-md bg-slate-200 py-1 px-2 ml-2">
            <Tooltip id="deployProcessButton"></Tooltip>
            <FontAwesomeIcon icon={faRocket}/>
        </button>
    );
};

export default DeployProcessButton