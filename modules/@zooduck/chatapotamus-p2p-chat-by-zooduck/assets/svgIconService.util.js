class SVGIconService {
  #iconSVGs = new Map();
  static get Icon() {
    return {
      AUDIO_OFF: 'audio_off',
      AUDIO_ON: 'audio_on',
      CANCELLATION_X: 'cancellation_x',
      CHEVRON_DOWN: 'chevron_down',
      CHEVRON_RIGHT: 'chevron_right',
      CHEVRON_UP: 'chevron_up',
      DISPLAY: 'display',
      DISPLAY_OFF: 'display_off',
      MICROPHONE_OFF: 'microphone_off',
      MICROPHONE_ON: 'microphone_on',
      PAPERCLIP: 'paperclip',
      WEBCAM_OFF: 'webcam_off',
      WEBCAM_ON: 'webcam_on'
    };
  }
  get Icon() {
    return this.constructor.Icon;
  }
  getIcon(iconName, attributes = {}) {
    const svgIcon = this.#iconSVGs.get(iconName).cloneNode(true);
    Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
      svgIcon.setAttribute(attributeName, attributeValue);
    });
    return svgIcon;
  }
  async loadIcons(iconsToLoad = Object.values(this.Icon)) {
    for (const iconName of iconsToLoad) {
      if (this.#iconSVGs.has(iconName)) {
        continue;
      }
      const iconPath = './svg-js/icons/' + iconName + '.svg.js';
      const module = await import(iconPath);
      const { default: svg } = module;
      const iconSVG = new DOMParser().parseFromString(svg, 'text/xml').childNodes[0];
      this.#iconSVGs.set(iconName, iconSVG);
    }
  }
}
const svgIconService = new SVGIconService();
export { svgIconService };