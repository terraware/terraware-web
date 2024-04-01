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
    dateRange: 'March 3-10',
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
    id: 6,
    name: 'Module 6',
    title: 'Financial Viability',
    contents: [
      {
        content: '',
        dueDate: '2024-03-21T00:00:00PST',
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
        eventTime: '2024-03-16T15:00:00PST',
        id: 1,
        moduleId: 6,
        name: 'Live Session',
      },
      {
        eventTime: '2024-03-14T15:00:00PST',
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
