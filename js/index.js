function createDOMElement(tag, parent, attributes) {
  const element = document.createElement(tag);
  parent.appendChild(element);
  Object.keys(attributes).forEach((attr) => {
    element[attr] = attributes[attr];
  });
  return element;
}

const app = {

  state: {
    technos: null,
    projects: null,
  },

  toggleTechno(technoName) {
    return (event) => {
      const techno = app.state.technos.find((tech) => tech.name === technoName);
      techno.active = !techno.active;
      event.target.classList.toggle('filter-buttons__btn--active');
      app.updateProjects();
    };
  },

  init() {
    app.buildUI();
  },

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

  async buildUI() {
    if (app.state.technos === null) {
      await app.fetchData();
      app.state.technos = app.state.technos.map((tech) => ({ ...tech, active: false }));
    }
    app.createFilters();
    app.updateProjects();
  },

  createFilters() {
    const filterButtonsElement = document.getElementById('filter-buttons');
    app.state.technos.forEach((techno) => {
      // Create the button
      const buttonContainerElem = createDOMElement('div', filterButtonsElement, {
        className: 'filter-buttons__btn',
      });
      // Click handler
      buttonContainerElem.addEventListener('click', app.toggleTechno(techno.name));
      // Icon and text
      createDOMElement('img', buttonContainerElem, {
        src: `img/icons/${techno.icon}`,
        className: 'filter-buttons__btn__icon',
      });
      createDOMElement('p', buttonContainerElem, { textContent: techno.name });
    });
    app.updateProjects();
  },

  updateProjects() {
    // If no filter selected, consider that all are active
    app.state.technos.forEach((techno) => {
      if (techno.active) console.log(techno.name);
    });
  },
};

app.init();
