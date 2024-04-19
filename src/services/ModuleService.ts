import { Module, ModuleEvent, ModuleEventType } from 'src/types/Module';

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

const mockEvents: Partial<Record<ModuleEventType, ModuleEvent>> = {
  Workshop: {
    eventDescription: `
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
    sessions: [
      {
        endTime: '2024-04-16T16:00:00Z',
        id: 101,
        meetingUrl: 'https://source.unsplash.com/random/1920x1080/?cat',
        recordingUrl: 'https://source.unsplash.com/random/1920x1080/?dog',
        slidesUrl: 'https://source.unsplash.com/random/1920x1080/?cat,dog',
        startTime: '2024-04-16T17:00:00Z',
      },
    ],
  },
  'One-on-One Session': {
    eventDescription: `
      <div>
        <h3>Details</h3>
        <p>This week's one-on-one session will focus on reviewing Budget Template.</p>
        <p>Please ensure to complete all the Stakeholders & Co-Benefits questions for the Feasibility Study by Friday 3rd November.</p>
      </div>
    `,
    sessions: [
      {
        endTime: '2024-04-16T16:00:00Z',
        id: 102,
        meetingUrl: 'https://source.unsplash.com/random/1920x1080/?cat',
        recordingUrl: 'https://source.unsplash.com/random/1920x1080/?dog',
        slidesUrl: 'https://source.unsplash.com/random/1920x1080/?cat,dog',
        startTime: '2024-04-16T17:00:00Z',
      },
    ],
  },
};

const mockModules: Module[] = [
  {
    additionalResources: `
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
    endDate: '2024-04-23T16:00:00Z',
    events: mockEvents,
    id: 1,
    name: 'Kick-Off',
    preparationMaterials: `
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
    overview: `
      <div>
        <p>The purpose of this module is to welcome all participants, share an overview of each project, and set some goals for the Accelerator program.</p>
        <p>By the end of this week, you should be equipped with the following:</p>
        <ul>
          <li>Who’s who — within both Terraformation and your Accelerator cohort</li>
          <li>Shared goals - holding yourselves accountable to your peers on what you hope to achieve</li>
        </ul>
      </div>
    `,
    startDate: '2024-04-16T17:00:00Z',
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
const getEvent = async (key: string): Promise<Response2<ModuleEventData | null>> => {
  const event = mockEvents?.[key as ModuleEventType];

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
