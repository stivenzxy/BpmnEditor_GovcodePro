import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend } from 'tiny-svg';
import { is } from 'bpmn-js/lib/util/ModelUtil';

export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, elementTemplates) {
    // (bus de eventos bpmn, prioridad del renderizado (post renderizado de bpmn-js (1000 es el estandar de bpmn-js)))
    {/** 1000 es la prioridad estandar de renderizado de los elementos nativos de bpmn-js */}
    super(eventBus, 1500);
    this.bpmnRenderer = bpmnRenderer;
    this.elementTemplates = elementTemplates;
  }

  canRender(element) {
    return is(element, 'bpmn:ServiceTask') &&   
           element.businessObject.modelerTemplate;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    const templateId = element.businessObject.modelerTemplate;
    const template = this.elementTemplates.find(t => t.id === templateId);

    if (template?.icon?.contents) {
      const iconSvg = this._decodeSvg(template.icon.contents);

      const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgWrapper.setAttribute('x', '30');
      svgWrapper.setAttribute('y', '4');
      svgWrapper.setAttribute('width', '20');
      svgWrapper.setAttribute('height', '20');
      svgWrapper.setAttribute('viewBox', '0 0 20 20');
      svgWrapper.innerHTML = iconSvg;

      svgAppend(parentNode, svgWrapper);
    }

    return shape;
  }

  _decodeSvg(dataUri) {
    if (dataUri.startsWith('data:image/svg+xml;utf8,')) {
      return decodeURIComponent(dataUri.replace('data:image/svg+xml;utf8,', ''));
    }

    if (dataUri.startsWith('data:image/svg+xml;base64,')) {
      return atob(dataUri.replace('data:image/svg+xml;base64,', ''));
    }
    
    return '';
  }

  getShapePath(shape) {
    return this.bpmnRenderer.getShapePath(shape);
  }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer', 'elementTemplates'];
