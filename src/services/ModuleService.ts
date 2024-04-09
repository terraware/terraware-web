import { Module } from 'src/types/Module';

import { Response2 } from './HttpService';

export type ModulesData = {
  modules: Module[] | undefined;
};

export type ModuleData = {
  module: Module | undefined;
};

const mockModules: Module[] = [
  {
    dateRange: 'Week of 2/24 - 3/1',
    description: `
      <div>
        <p>The purpose of this module is to welcome all participants, share an overview of each project, and set some goals for the Accelerator program.</p>
        <p>By the end of this week, you should be equipped with the following:</p>
        <ul>
          <li>Who’s who — within both Terraformation and your Accelerator cohort</li>
          <li>Shared goals - holding yourselves accountable to your peers on what you hope to achieve</li>
        </ul>
      </div>
    `,
    id: 1,
    name: 'Module 1',
    title: 'Kick-Off',
    contents: [
      {
        content: '',
        dueDate: '2024-03-21T07:00:00.000Z',
        id: 1,
        moduleId: 6,
        title: 'Module 6 Feasibility Questions',
      },
      {
        content: '',
        dueDate: null,
        id: 2,
        moduleId: 6,
        title: 'Preparation Materials',
      },
      {
        content: '',
        dueDate: null,
        id: 3,
        moduleId: 6,
        title: 'Live Session Slides',
      },
      {
        content: `
          <div>
            <ul>
              <li><a href="#">Verified Carbon Standard</a></li>
              <li><a href="#">Methodology For Afforestation, Reforestation and Revegetation Projects</a></li>
              <li><a href="#">Plan Vivo</a></li>
              <li><a href="#">AFOLU Non-Permanence Risk Tool</a></li>
              <li><a href="#">Climate Change: Atmospheric Carbon Dioxide</a></li>
              <li><a href="#">En-ROADS - Climate Interactive</a></li>
              <li><a href="#">Tool for the Demonstration and Assessment of Additionality in VCS Agriculture, Forestry and Other Land Use (Afolu) Project Activities</a></li>
            </ul>
          </div>
        `,
        dueDate: null,
        id: 4,
        moduleId: 6,
        title: 'Additional Resources',
      },
    ],
    events: [
      {
        eventTime: '2024-03-16T22:00:00.000Z',
        id: 1,
        moduleId: 6,
        name: 'Live Session',
      },
      {
        eventTime: '2024-03-14T22:00:00.000Z',
        id: 2,
        moduleId: 6,
        name: '1:1 Session',
      },
    ],
  },
  {
    dateRange: 'Week of 3/3 - 3/10',
    description: `
      <div>
        <p>The purpose of this module is to introduce you to carbon market basics and help you understand what a carbon project entails. After this session, you will be able to complete the deliverable which is the Carbon Eligibility questions for the Feasibility Study.</p>
        <p>By the end of this module, you should be equipped with the following:</p>
        <ul>
          <li>Knowledge of the major carbon standards (Verra/VCS, Plan Vivo, etc)</li>
          <li>Knowledge of the different types of carbon projects (Afforestation, Reforestation and Revegetation (ARR), Improved Forest Management (IFM), Avoided Deforestation)</li>
          <li>A good understanding of who is involved in a carbon project (project proponent, land owner, investors, buyers…)</li>
          <li>Some familiarity with the timeline of a carbon project</li>
          <li>New knowledge about Feasibility Studies and Project Design Documents (PDD)</li>
          <li>An understanding of why it is important to provide high-quality due diligence information, in order to produce the best Feasibility Studies possible for your project and provide you with better chances to get selected and registered.</li>
        </ul>
      </div>
    `,
    id: 2,
    name: 'Module 2',
    title: 'Introduction to Carbon Projects',
    contents: [
      {
        content: '',
        dueDate: '2024-03-21T07:00:00.000Z',
        id: 1,
        moduleId: 6,
        title: 'Module 6 Feasibility Questions',
      },
      {
        content: '',
        dueDate: null,
        id: 2,
        moduleId: 6,
        title: 'Preparation Materials',
      },
      {
        content: '',
        dueDate: null,
        id: 3,
        moduleId: 6,
        title: 'Live Session Slides',
      },
      {
        content: `
          <div>
            <ul>
              <li><a href="#">Verified Carbon Standard</a></li>
              <li><a href="#">Methodology For Afforestation, Reforestation and Revegetation Projects</a></li>
              <li><a href="#">Plan Vivo</a></li>
              <li><a href="#">AFOLU Non-Permanence Risk Tool</a></li>
              <li><a href="#">Climate Change: Atmospheric Carbon Dioxide</a></li>
              <li><a href="#">En-ROADS - Climate Interactive</a></li>
              <li><a href="#">Tool for the Demonstration and Assessment of Additionality in VCS Agriculture, Forestry and Other Land Use (Afolu) Project Activities</a></li>
            </ul>
          </div>
        `,
        dueDate: null,
        id: 4,
        moduleId: 6,
        title: 'Additional Resources',
      },
    ],
    events: [
      {
        eventTime: '2024-03-16T22:00:00.000Z',
        id: 1,
        moduleId: 6,
        name: 'Live Session',
      },
      {
        eventTime: '2024-03-14T22:00:00.000Z',
        id: 2,
        moduleId: 6,
        name: '1:1 Session',
      },
    ],
  },
  {
    dateRange: 'Week of 3/12 - 3/17',
    description: `
      <div>
        <p>The purpose of this module is to introduce you to the legal frameworks needed to register a carbon project. After this session, you will be able to complete the deliverable which is the Legal Eligibility questions for the Feasibility Study.</p>
        <p>By the end of this module, you should be equipped with the following:</p>
        <ul>
          <li>Role of Terraformation Legal Department</li>
          <li>Importance of Land Tenure</li>
          <li>Overview of Legal Agreements</li>
          <li>International Compliance Obligations</li>
        </ul>
      </div>
    `,
    id: 3,
    name: 'Module 3',
    title: 'Legal Eligibility',
    contents: [
      {
        content: '',
        dueDate: '2024-03-21T07:00:00.000Z',
        id: 1,
        moduleId: 6,
        title: 'Module 6 Feasibility Questions',
      },
      {
        content: '',
        dueDate: null,
        id: 2,
        moduleId: 6,
        title: 'Preparation Materials',
      },
      {
        content: '',
        dueDate: null,
        id: 3,
        moduleId: 6,
        title: 'Live Session Slides',
      },
      {
        content: `
          <div>
            <ul>
              <li><a href="#">Verified Carbon Standard</a></li>
              <li><a href="#">Methodology For Afforestation, Reforestation and Revegetation Projects</a></li>
              <li><a href="#">Plan Vivo</a></li>
              <li><a href="#">AFOLU Non-Permanence Risk Tool</a></li>
              <li><a href="#">Climate Change: Atmospheric Carbon Dioxide</a></li>
              <li><a href="#">En-ROADS - Climate Interactive</a></li>
              <li><a href="#">Tool for the Demonstration and Assessment of Additionality in VCS Agriculture, Forestry and Other Land Use (Afolu) Project Activities</a></li>
            </ul>
          </div>
        `,
        dueDate: null,
        id: 4,
        moduleId: 6,
        title: 'Additional Resources',
      },
    ],
    events: [
      {
        eventTime: '2024-03-16T22:00:00.000Z',
        id: 1,
        moduleId: 6,
        name: 'Live Session',
      },
      {
        eventTime: '2024-03-14T22:00:00.000Z',
        id: 2,
        moduleId: 6,
        name: '1:1 Session',
      },
    ],
  },
];

/**
 * List all modules for a project
 */
const list = async (projectId: number | null): Promise<Response2<ModulesData | null>> => {
  return {
    requestSucceeded: true,
    data: {
      modules: mockModules,
    },
  };
};

/**
 * Get module data for a specific module / project ID.
 */
const get = async (moduleId: number): Promise<Response2<ModuleData | null>> => {
  const module = mockModules.find((_module) => _module.id === moduleId);
  return {
    requestSucceeded: true,
    data: {
      module,
    },
  };
};

const ModuleService = {
  get,
  list,
};

export default ModuleService;
