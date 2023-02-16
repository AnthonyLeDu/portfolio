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

  init() {
    app.updateUI();
  },

  async fetchData() {
    try {
      // Fetch technos
      const response1 = await fetch('../data/technos.json');
      app.state.technos = await response1.json();
      // Fetch projects
      const response2 = await fetch('../data/projects.json');
      app.state.projects = await response2.json();
    } catch (error) {
      console.error(`Error while fetching data : ${error}`);
    }
  },

  async updateUI() {
    if (app.state.technos === null) {
      await app.fetchData();
      app.state.technos = app.state.technos.map((tech) => ({ ...tech, active: true }));
    }
    app.updateFilters();
  },

  handleFilterClicked(technoObject) {
    return () => {
      technoObject.active = !technoObject.active;
      app.updateFilters();
    };
  },

  updateFilters() {
    const filterContainerElement = document.getElementById('filter');
    filterContainerElement.textContent = ''; // Clear
    app.state.technos.forEach((techno) => {
      const activeClass = techno.active ? 'filter-button--active' : '';
      // Create the button
      const buttonContainerElem = createDOMElement('div', filterContainerElement, {
        className: `filter-button ${activeClass}`,
      });
      // Click handler
      buttonContainerElem.addEventListener('click', app.handleFilterClicked(techno));
      // Icon and text
      createDOMElement('img', buttonContainerElem, {
        src: `img/icons/${techno.icon}`,
        className: 'filter-button__icon',
      });
      createDOMElement('p', buttonContainerElem, { textContent: techno.name });
    });
    app.updateProjects();
  },

  updateProjects() {

  },
};

app.init();
