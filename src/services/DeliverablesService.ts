import {
  OptionalSearchRequestPayload,
  SearchNodePayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import {
  Deliverable,
  DeliverableTypeType,
  DeliverableCategoryType,
  DeliverableStatusType,
  DeliverableData,
  SearchResponseDeliverableParticipant,
  SearchResponseDeliverableAdmin,
  UpdateStatusRequest,
} from 'src/types/Deliverables';
import { Response } from 'src/services/HttpService';

/**
 * Accelerator "deliverable" related services
 */

const SEARCH_FIELDS_DELIVERABLES_ADMIN = ['category', 'documentCount', 'id', 'name', 'project_name', 'status', 'type'];

const SEARCH_FIELDS_DELIVERABLES_PARTICIPANT = [...SEARCH_FIELDS_DELIVERABLES_ADMIN, 'description'];

const mockDeliverable: Deliverable = {
  id: 1,
  documents: [
    {
      name: 'Upload 1',
      description: 'Some description for the upload',
      dateUploaded: '2024-02-15',
      documentType: 'google',
      link: 'http://placekitten.com/200/300',
      project_name: 'Andromeda',
    },
    {
      name: 'Upload 2',
      description: 'One description for the upload',
      dateUploaded: '2024-02-14',
      documentType: 'google',
      link: 'http://placekitten.com/200/300',
      project_name: 'Andromeda',
    },
    {
      name: 'Upload A',
      description: 'Another description for the upload',
      dateUploaded: '2024-02-11',
      documentType: 'google',
      link: 'http://placekitten.com/200/300',
      project_name: 'Andromeda',
    },
  ],
  category: 'Legal',
  status: 'Not Submitted',
  name: 'Company Formation Document',
  projectName: 'Treemendo.us',
  projectId: 1,
  // TODO need to figure out if we are going to allow raw HTML or just have regular text
  deliverableContent:
    'The Company Formation Document is to confirm the entity is properly formed and registered in the country.\n' +
    '\n' +
    'Depending on your jurisdiction, this document may be called a Certificate of Incorporation or a Business Registration Certificate, for example.\n' +
    '\n' +
    'Submit:\n' +
    'A document issued by the relevant authority in your jurisdiction that contains the following information:\n' +
    'Company Name\n' +
    'Legal Form / Structure – (e.g. corporation, limited liability company, etc.)\n' +
    'Date of Formation/Incorporation\n' +
    'Company Number (if applicable)',
};

const getDeliverable = async (deliverableId: number): Promise<Response & DeliverableData> => {
  // TODO replace with axios
  return {
    requestSucceeded: true,
    deliverable: { ...mockDeliverable },
  };
};

const updateStatus = async ({ reason, status }: UpdateStatusRequest): Promise<Response> => {
  mockDeliverable.status = status;
  mockDeliverable.reason = reason;
  return { requestSucceeded: true };
};

// TODO will get removed once BE is done
let mockResponseData: SearchResponseElement[] = [];
const searchDeliverables = async (
  fields: string[],
  organizationId: number,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<SearchResponseElement[] | null> => {
  const params: OptionalSearchRequestPayload = {
    // TODO confirm prefix when BE is done
    prefix: 'deliverables',
    fields,
    search,
    // TODO implement pagination when BE is done
    count: 1000,
  };

  if (sortOrder) {
    params.sortOrder = [sortOrder];
  }

  // TODO change this over once BE is done
  // return SearchService.search(params);
  return mockResponseData;
};

const transformAdminDeliverableElement = (element: SearchResponseElement): SearchResponseDeliverableAdmin => ({
  category: element.category as DeliverableCategoryType,
  documentCount: Number(element.documentCount),
  id: Number(element.id),
  name: `${element.name}`,
  project_name: `${element.project_name}`,
  status: element.category as DeliverableStatusType,
  // These casts (category, description, type) are typesafe but not runtime safe, if we ever use these cast properties in business logic we should
  // consider implementing a typeguard to ensure the type is actually the type we're casting to
  type: element.type as DeliverableTypeType,
});

const searchDeliverablesForAdmin = async (
  organizationId: number,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<SearchResponseDeliverableAdmin[] | null> => {
  const result = await searchDeliverables(SEARCH_FIELDS_DELIVERABLES_ADMIN, organizationId, search, sortOrder);
  if (!result) {
    return result;
  }

  return result.map(transformAdminDeliverableElement);
};

const searchDeliverablesForParticipant = async (
  organizationId: number,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<SearchResponseDeliverableParticipant[] | null> => {
  const result = await searchDeliverables(SEARCH_FIELDS_DELIVERABLES_PARTICIPANT, organizationId, search, sortOrder);
  if (!result) {
    return result;
  }

  return result.map((element) => ({
    ...transformAdminDeliverableElement(element),
    description: `${element.description}`,
  }));
};

const DeliverablesService = {
  getDeliverable,
  searchDeliverablesForAdmin,
  searchDeliverablesForParticipant,
  updateStatus,
};

export default DeliverablesService;

// TODO will get removed once BE is done
mockResponseData = [
  {
    id: 1,
    name: 'Company Formation Document',
    description: 'To confirm the entity is properly formed lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 1,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Approved',
  },
  {
    id: 2,
    name: 'Current Legal Status Document',
    description: 'To confirm the entity is in good standing lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 1,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Rejected',
  },
  {
    id: 3,
    name: 'Parent/Subsidiary Information',
    description: 'To understand if there are other entities lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 1,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'In Review',
  },
  {
    id: 4,
    name: 'Owner/Director Information',
    description: 'To confirm owners and managers so we lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 1,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'In Review',
  },
  {
    id: 5,
    name: 'Attorney Contact Information',
    description: 'So we can be in contact with your legal lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Not Submitted',
  },
  {
    id: 6,
    name: 'Landowner’s Name',
    description: 'To confirm the name of the landowner lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Not Submitted',
  },
  {
    id: 7,
    name: 'Land Title (If Government-Owned)',
    description: 'To confirm the entity is properly formed lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Not Submitted',
  },
  {
    id: 8,
    name: 'Land Title (If Not Government-Owned)',
    description: 'To confirm the entity is in good standing lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Not Submitted',
  },
  {
    id: 9,
    name: 'List of Disputes or Legal Proceedings',
    description: 'To understand if there are other entities lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: 'Not Submitted',
  },
  {
    id: 10,
    name: 'List of State and Local Permits, Consents',
    description: 'To confirm owners and managers so we lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Treemendo.us',
    status: '',
  },
  {
    id: 11,
    name: 'Photos of the land',
    description: 'Photos showing the area before any plantings have occurred',
    type: 'Document',
    documentCount: 5,
    category: 'Forestry',
    project_name: 'Treemendo.us',
    status: 'In Review',
  },
  {
    id: 12,
    name: 'Company Formation Document',
    description: 'To confirm the entity is properly formed lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Andromeda',
    status: 'Approved',
  },
  {
    id: 13,
    name: 'Current Legal Status Document',
    description: 'To confirm the entity is in good standing lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Andromeda',
    status: 'Rejected',
  },
  {
    id: 14,
    name: 'Parent/Subsidiary Information',
    description: 'To understand if there are other entities lorem ipsum dolor sit amet, consectetur adipiscing elit',
    type: 'Document',
    documentCount: 0,
    category: 'Legal',
    project_name: 'Andromeda',
    status: 'In Review',
  },
];
