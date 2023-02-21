/**
 * Create an HTMLElement in the DOM.
 * @param {string} tag Name of the HTML tag.
 * @param {HTMLElement} parent Element to which the created element will be parented.
 * @param {Array} attributes List of {atttribute: value} to setup the element.
 * @returns {HTMLElement} The created element.
 */
function createDOMElement(tag, parent, attributes = []) {
  const element = document.createElement(tag);
  parent.appendChild(element);
  Object.keys(attributes).forEach((attr) => {
    element[attr] = attributes[attr];
  });
  return element;
}

const app = {

  state: {
    masterFilter: false, // Is the filter button checked?
    technos: null,
    projects: null,
  },

  init() {
    app.addListeners();
    app.buildUI(); // async
  },

  /**
   * Update the master filter state depending on the buttons activeness.
   */
  updateMasterFilter() {
    app.setMasterFilter(app.state.technos.find((tech) => tech.checked));
  },

  /**
   * Set the master filter state.
   * @param {Boolean} state
   */
  setMasterFilter(state) {
    app.state.masterFilter = state;
    app.setButtonActivated(app.filterToggleButtonElem, app.state.masterFilter);
  },

  /**
   * Master filter toggle handler.
   */
  toggleMasterFilter() {
    app.setMasterFilter(!app.state.masterFilter);
    app.updateFilterButtons();
    app.updateProjects();
  },

  /**
   * Techno button toggle handler.
   * @param {Object} techno The techno Object bound to the clicked button element.
   */
  toggleTechno(techno) {
    return (event) => {
      // If filtering was off, clear the filters before adding the clicked one.
      if (!app.state.masterFilter) {
        app.state.technos.forEach((tech) => {
          tech.checked = false;
        });
      }

      techno.checked = !techno.checked;
      app.setButtonActivated(event.target, techno.checked);
      app.updateMasterFilter();
      app.updateProjects();
    };
  },

  /**
   * Set the visual state of an element.
   * @param {HTMLButtonElement} element The button to activate/deactivate.
   * @param {Boolean} state True to activate the element.
   */
  setButtonActivated(element, state) {
    if (state) {
      element.classList.add('button--active');
    } else {
      element.classList.remove('button--active');
    }
  },

  /**
   * Update filter buttons look according to masterFilter and their own checked state.
   */
  updateFilterButtons() {
    console.log('toto');
    app.state.technos.forEach((tech) => {
      app.setButtonActivated(tech.element, app.state.masterFilter && tech.checked);
    });
  },

  /**
   * Read the json files needed for the application.
   */
  async fetchData() {
    try {
      // Fetch technos
      const response1 = await fetch('../data/technos.json');
      app.state.technos = await response1.json();
      app.state.technos.sort((a, b) => a.name.localeCompare(b.name));
      // Fetch projects
      const response2 = await fetch('../data/projects.json');
      app.state.projects = await response2.json();
    } catch (error) {
      console.error(`Error while fetching data : ${error}`);
    }
  },

  /**
   * Create the techno buttons to filter projects, according to the fetched technos.
   */
  createFilterButtons() {
    const filterButtonsElement = document.getElementById('filter-buttons');
    app.state.technos.forEach((techno) => {
      // Create the button
      techno.element = createDOMElement('button', filterButtonsElement);
      // Click handler
      techno.element.addEventListener('click', app.toggleTechno(techno));
      // Icon and text
      createDOMElement('img', techno.element, {
        src: `img/icons/${techno.icon}`,
      });
      createDOMElement('p', techno.element, { textContent: techno.name });
    });
    app.updateProjects();
  },

  /**
   * Show/hide projects depending on the filters.
   */
  updateProjects() {
    // If no filter selected, consider that all are active
    const filteredTechnos = app.state.technos
      .filter((tech) => !app.state.masterFilter || tech.checked)
      .map((tech) => tech.name);

    const filteredProjects = app.state.projects
      .filter((project) => project.technos
        .filter((tech) => filteredTechnos.includes(tech)).length > 0);

    console.log(filteredProjects.map((project) => project.name));
  },

  /**
   * Init the UI.
   */
  async buildUI() {
    if (app.state.technos === null) {
      await app.fetchData();
      app.state.technos = app.state.technos.map((tech) => ({ ...tech, checked: false }));
    }
    app.createFilterButtons();
    app.updateProjects();
  },

  /**
   * Add event listeners to DOM elements.
   */
  addListeners() {
    app.filterToggleButtonElem = document.getElementById('filter-buttons__toggle');
    app.filterToggleButtonElem.addEventListener('click', app.toggleMasterFilter);
  },

};

app.init();
