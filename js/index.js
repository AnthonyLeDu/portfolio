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

/**
 * Create a button with (optional) text, icon and click handler function.
 * @param {HTMLElement} parentElem Element to which the created button will be parented
 * @param {String} caption Text displayed on the button
 * @param {String} iconSrc URL to the icon
 * @param {Function} clickHandler Handler function to trigger on click.
 * @returns {HTMLButtonElement} The created button
 */
function createButton(parentElem, caption = null, iconSrc = null, clickHandler = null) {
  const buttonElem = createDOMElement('button', parentElem);
  if (iconSrc) {
    createDOMElement('img', buttonElem, { src: iconSrc });
  }
  if (caption) {
    createDOMElement('p', buttonElem, { textContent: caption });
  }
  if (clickHandler) {
    buttonElem.addEventListener('click', clickHandler);
  }
  return buttonElem;
}

/**
 * Add or remove a class to an element.
 * @param {HTMLElement} element Element to affect
 * @param {String} className The class name to add or remove.
 * @param {Boolean} add True to add, false to remove.
 */
function toggleClass(element, className, add = true) {
  if (add) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
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
      this.setButtonActivated(event.target, techno.checked);
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
    toggleClass(element, 'button--off', !state);
  },

  /**
   * Update filter buttons look according to masterFilter and their own checked state.
   */
  updateFilterButtons() {
    app.state.technos.forEach((tech) => {
      app.setButtonActivated(tech.filterButtonElem, app.state.masterFilter && tech.checked);
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
      techno.filterButtonElem = createButton(
        filterButtonsElem,
        techno.name,
        `img/icons/${techno.icon}`,
        app.toggleTechno(techno),
      );
      techno.filterButtonElem.className = 'button--off';
    });
  },

  /**
   * Create the projects cards in the DOM.
   */
  createProjectsCards() {
    const projectsElem = document.getElementById('projects');
    projectsElem.textContent = ''; // Clear

    // Finding templates
    const projectTemplateElem = document.getElementById('project-template');
    const projectTechnoTemplateElem = document.getElementById('project-techno-template');

    // Adding projects cards
    app.state.projects.forEach((project) => {
      const projectFragment = document.importNode(projectTemplateElem.content, true);
      // Main image
      const mainImageElem = projectFragment.querySelector('.project-image');
      mainImageElem.alt = project.name;
      mainImageElem.src = `img/projects/${project.image}`;
      // Srcset if provided
      if (project.imageSources) {
        mainImageElem.srcset = project.imageSources.map((imageData) => `img/projects/${imageData.join(' ')}`).join(', ');
      }
      // Details
      projectFragment.querySelector('.project-details__title').textContent = project.name;
      projectFragment.querySelector('.project-details__description').textContent = project.description;
      const buttonsElem = projectFragment.querySelector('.project-details-buttons');
      if (project.website) {
        const webSiteLinkElem = createDOMElement('a', buttonsElem, {
          href: project.website,
          target: '_blank',
        });
        createButton(webSiteLinkElem, 'Visiter le site', 'img/icons/website.svg');
      }
      if (project.github) {
        const gitHubLinkElem = createDOMElement('a', buttonsElem, {
          href: project.github,
          target: '_blank',
        });
        createButton(gitHubLinkElem, 'Visiter le repo', 'img/icons/github.svg');
      }

      // Footer
      const footerElem = projectFragment.querySelector('.project-footer');
      footerElem.querySelector('.project-footer__title').textContent = project.name;
      // Technos icons

      project.technos.sort().forEach((projTechName) => {
        const projectTechnoFragment = document.importNode(projectTechnoTemplateElem.content, true);
        projectTechnoFragment.querySelector('.project-techno').dataset.techName = projTechName;
        const appTechno = app.state.technos.find((appTech) => appTech.name === projTechName);
        const technoIcon = `img/icons/${appTechno ? appTechno.icon : 'question-mark.svg'}`;
        projectTechnoFragment.querySelector('.project-techno__icon').src = technoIcon;
        projectTechnoFragment.querySelector('.project-techno__tooltip').textContent = projTechName;
        footerElem.appendChild(projectTechnoFragment);
      });

      projectsElem.appendChild(projectFragment);
    });
    app.updateProjects();
  },

  /**
   * Show/hide projects depending on the filters.
   */
  updateProjects() {
    let checkedTechnos = [];
    let filteredTechnos = [];
    if (app.state.masterFilter) {
      checkedTechnos = app.state.technos
        .filter((tech) => tech.checked)
        .map((tech) => tech.name);
      filteredTechnos = [...checkedTechnos];
    } else {
      // If filter is off, consider all projects must be displayed
      filteredTechnos = app.state.technos.map((tech) => tech.name);
    }

    document.querySelectorAll('.project').forEach((projectElem) => {
      let visible = false;
      projectElem.querySelectorAll('.project-techno').forEach((technoElem) => {
        visible = visible || filteredTechnos.includes(technoElem.dataset.techName);
        // Icons "activation" (color)
        toggleClass(
          technoElem.querySelector('.project-techno__icon'),
          'project-techno__icon--active',
          checkedTechnos.includes(technoElem.dataset.techName),
        );
      });
      toggleClass(projectElem, 'project--hidden', !visible); // Project's visibility
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
    app.createProjectsCards();
  },

  /**
   * Add event listeners to DOM elements.
   */
  addListeners() {
    app.filterToggleButtonElem = document.getElementById('filter-buttons__toggle');
    app.filterToggleButtonElem.classList.add('button--off');
    app.filterToggleButtonElem.addEventListener('click', app.toggleMasterFilter);
  },

};

app.init();
