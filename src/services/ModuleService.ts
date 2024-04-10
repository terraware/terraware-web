import { Module, ModuleEvent } from 'src/types/Module';

import { Response2 } from './HttpService';

export type ModulesData = {
  modules: Module[] | undefined;
};

export type ModuleData = {
  module: Module | undefined;
};

export type ModuleEventData = {
  event: ModuleEvent | undefined;
};

const mockEvents: ModuleEvent[] = [
  {
    eventTime: '2024-03-16T22:00:00.000Z',
    eventURL: 'https://google.com/',
    id: 1,
    moduleId: 6,
    name: 'Live Session',
    description: `
      <div>
        <h3>Details</h3>
        <p>The workshop will take place on Monday, September 18th and cover the following topics:</p>
        <ol>
          <li>Welcomes</li>
          <li>Participant Introductions</li>
          <li>Breakout Rooms</li>
          <li>Shared Ideas</li>
          <li>Send off</li>
          <li>Conclusion and next steps for this week</li>
        </ol>
        <h3>Key Speakers</h3>
        <strong>Maddy Bell, Terraformation Accelerator Program Manager</strong>
        <p>Madeleine Bell is the Program Manager of Terraformation's Seed to Carbon Forest Accelerator. Prior to Terraformation, she spent the past 4 years working on a solar-thermal desalination technology, and supporting communities and corporations at the frontline of the global water crisis. Given this pattern, it looks like her life is going to revolve around scaling solutions to address climate change, which seems a good way to spend it.</p>
        <strong>Damien Kuhn, VP Forestry Partnerships and Development, Terraformation</strong>
        <p>Damien Kuhn is an agronomist and forestry engineer from AgroParisTech, where he specialized in environmental economics. He has spent the past 16 years working on forestry and climate projects across Africa, Latin America, and Southeast Asia. As former COO of Kinomé, he developed partnerships worldwide and managing a portfolio of community-based forestry projects. He has also been an advisor to governments and companies on their climate, forestry, and agricultural strategies, including as lead expert for four countries' Nationally Determined Contributions under the Paris Climate Accords.</p>
      </div>
    `,
    links: [{ label: 'Live Session Slides' }, { label: 'Live Session Recording' }],
  },
  {
    eventTime: '2024-03-14T22:00:00.000Z',
    eventURL: 'https://google.com/',
    id: 2,
    moduleId: 6,
    name: '1:1 Session',
    description: `
      <div>
        <p>This week's one-on-one session will focus on reviewing Budget Template.</p>
        <p>Please ensure to complete all the Stakeholders & Co-Benefits questions for the Feasibility Study by Friday 3rd November.</p>
      </div>
    `,
    links: [{ label: '1:1 Session Slides' }, { label: '1:1 Session Recording' }],
    additionalLinks: [{ label: 'Preparation Materials' }, { label: 'Additional Resources' }],
  },
];

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

/**
 * Get module event data for a specific module event.
 */
const getEvent = async (eventId: number): Promise<Response2<ModuleEventData | null>> => {
  const event = mockEvents.find((_event) => _event.id === eventId);
  return {
    requestSucceeded: true,
    data: {
      event,
    },
  };
};

const ModuleService = {
  get,
  getEvent,
  list,
};

export default ModuleService;
