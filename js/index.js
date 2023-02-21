/**
 * Create an HTMLElement in the DOM.
 * @param {string} tag Name of the HTML tag.
 * @param {HTMLElement} parent Element to which the created element will be parented.
 * @param {Array} attributes List of {atttribute: value} to setup the element.
 * @returns {HTMLElement} The created element.
 */
function createDOMElement(tag, parent, attributes = {}) {
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
      app.setButtonActivated(tech.filterBtnElem, app.state.masterFilter && tech.checked);
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
    const filterButtonsElem = document.getElementById('filter-buttons');
    app.state.technos.forEach((techno) => {
      // Create the button
      techno.filterBtnElem = createDOMElement('button', filterButtonsElem);
      // Click handler
      techno.filterBtnElem.addEventListener('click', app.toggleTechno(techno));
      // Icon and text
      createDOMElement('img', techno.filterBtnElem, {
        src: `img/icons/${techno.icon}`,
      });
      createDOMElement('p', techno.filterBtnElem, { textContent: techno.name });
    });
  },

  createProjectsBoxes() {
    const projectsElem = document.getElementById('projects');
    app.state.projects.forEach((project) => {
      // Container
      project.element = createDOMElement('article', projectsElem, { className: 'project box' });
      // Image
      const imageElem = createDOMElement('img', project.element, {
        className: 'project__image',
        alt: project.name,
        src: `img/projects/${project.image}`,
      });
      // Srcset if provided
      if (project.imageSources) {
        imageElem.srcset = project.imageSources.map((imageData) => `img/projects/${imageData.join(' ')}`).join(', ');
      }
      // Footer
      const projectFooterElem = createDOMElement('div', project.element, { className: 'project-footer' });
      // Title
      createDOMElement('h3', projectFooterElem, { className: 'project__title' }).textContent = project.name;
      // Technos
      project.technos.sort((a, b) => a.localeCompare(b));
      project.technos.forEach((projectTech) => {
        const appTechno = app.state.technos.find((appTech) => appTech.name === projectTech);
        const iconContainer = createDOMElement('div', projectFooterElem, { className: 'project-techno' });
        // Icon
        createDOMElement('img', iconContainer, {
          className: 'project-techno__icon',
          src: `img/icons/${appTechno ? appTechno.icon : 'question-mark.svg'}`,
        });
        // Icon tooltip
        const tooltip = createDOMElement('span', iconContainer, { className: 'project-techno__tooltip' });
        tooltip.textContent = projectTech;
      });
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

    app.state.projects.forEach((project) => {
      if (project.technos.filter((tech) => filteredTechnos.includes(tech)).length > 0) {
        project.element.classList.remove('project--hidden');
      } else {
        project.element.classList.add('project--hidden');
      }
    });
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
    app.createProjectsBoxes();
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
