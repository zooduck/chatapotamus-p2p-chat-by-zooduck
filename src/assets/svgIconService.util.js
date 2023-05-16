/**
 * @typedef {import('./typedef.js')}
 */

class SVGIconService {
  #iconSVGs = new Map();
  /**
   * @static
   * @readonly
   * @type {Object.<string, SVGIconServiceIcon>}
   */
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
  /**
   * @type {Object.<string, SVGIconServiceIcon>}
   */
  get Icon() {
    return this.constructor.Icon;
  }
  /**
   * @method
   * @param {SVGIconServiceIcon}
   * @param {Object.<string, string>} attributes
   * @returns {SVGSVGElement}
   */
  getIcon(iconName, attributes = {}) {
    const svgIcon = this.#iconSVGs.get(iconName).cloneNode(true);
    Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
      svgIcon.setAttribute(attributeName, attributeValue);
    });
    return svgIcon;
  }
  /**
   * @method
   * @param {SVGIconServiceIcon[]} iconsToLoad
   * @returns {Promise<void>}
   */
  async loadIcons(iconsToLoad = Object.values(this.Icon)) {
    for (const iconName of iconsToLoad) {
      if (this.#iconSVGs.has(iconName)) {
        continue;
      }
      // --------------------------------------------------------------------------------------
      // The reason for importing svg files as .js instead of using fetch on the .svg file
      // is simply to remove any requirement for setting the absolute path to the .svg file.
      // --------------------------------------------------------------------------------------
      // Currently, that path is "../../assets/svg/icons/" but since we cannot guarantee that
      // path in an external project, we would need to provide a setIconsPath() method thus
      // increasing the complexity of using this service.
      // --------------------------------------------------------------------------------------
      // Unlike using fetch(), this way the assets will be placed with the rest of the imports
      // viewable in navigator developer tools (i.e. the "Sources" tab in Chromium browsers).
      // --------------------------------------------------------------------------------------
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
