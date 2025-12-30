export interface paths {
    "/api/v1/accelerator/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all of a project's activities. */
        get: operations["listActivities"];
        put?: never;
        /** Creates a new activity. */
        post: operations["createActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all of a project's activities with accelerator-admin-only details. */
        get: operations["adminListActivities"];
        put?: never;
        /** Creates a new activity including accelerator-admin-only details. */
        post: operations["adminCreateActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/admin/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single activity with accelerator-admin-only details. */
        get: operations["adminGetActivity"];
        /** Updates an activity including its accelerator-admin-only details. */
        put: operations["adminUpdateActivity"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/admin/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Publishes an activity.
         * @description Only verified activities may be published.
         */
        post: operations["adminPublishActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/{activityId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single activity. */
        get: operations["getActivity"];
        /** Updates an activity. */
        put: operations["updateActivity"];
        post?: never;
        /**
         * Deletes an activity.
         * @description Only activities that have not been published may be deleted.
         */
        delete: operations["deleteActivity"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/{activityId}/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Uploads media for an activity. */
        post: operations["uploadActivityMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/{activityId}/media/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets a photo file for an activity.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getActivityMedia"];
        /** Updates information about a media file for an activity. */
        put: operations["updateActivityMedia"];
        post?: never;
        /** Deletes a media file from an activity. */
        delete: operations["deleteActivityMedia"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/activities/{activityId}/media/{fileId}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets streaming details for a video for an activity.
         * @description This does not return the actual streaming data; it just returns the necessary information to stream video from Mux.
         */
        get: operations["getActivityMediaStream_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List all the applications with optional search criteria
         * @description Only applications visible to the current user are returned.
         */
        get: operations["listApplications"];
        put?: never;
        /** Create a new application */
        post: operations["createApplication"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get information about an application */
        get: operations["getApplication"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/boundary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update an application's boundary */
        put: operations["updateApplicationBoundary"];
        /** Update an application's boundary using an uploaded file */
        post: operations["uploadApplicationBoundary"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/deliverables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get deliverables for an application */
        get: operations["getApplicationDeliverables"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get GeoJSON for an application */
        get: operations["getApplicationGeoJson"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the history of changes to the metadata of an application */
        get: operations["getApplicationHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/modules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get modules for an application */
        get: operations["getApplicationModules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/modules/{moduleId}/deliverables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get deliverables for an application module */
        get: operations["getApplicationModuleDeliverables"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/restart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restart a previously-submitted application
         * @description If the application has not been submitted yet, this is a no-op.
         */
        post: operations["restartApplication"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Update an application's metadata to reflect a review
         * @description This is an internal-user-only operation.
         */
        post: operations["reviewApplication"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/applications/{applicationId}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submit an application for review
         * @description If the application has already been submitted, this is a no-op.
         */
        post: operations["submitApplication"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/cohorts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the list of cohorts. */
        get: operations["listCohorts"];
        put?: never;
        /** Creates a new cohort. */
        post: operations["createCohort"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/cohorts/{cohortId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single cohort. */
        get: operations["getCohort"];
        /** Updates the information within a single cohort. */
        put: operations["updateCohort"];
        post?: never;
        /** Deletes a single cohort. */
        delete: operations["deleteCohort"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/cohorts/{cohortId}/modules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List cohort modules. */
        get: operations["listCohortModules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/cohorts/{cohortId}/modules/{moduleId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one cohort module. */
        get: operations["getCohortModule"];
        /**
         * Updates the information about a module's use by a cohort.
         * @description Adds the module to the cohort if it is not already associated.
         */
        put: operations["updateCohortModule"];
        post?: never;
        /** Deletes a module from a cohort if it is currently associated. */
        delete: operations["deleteCohortModule"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lists the deliverables for accelerator projects
         * @description The list may optionally be filtered based on certain criteria as specified in the query string. If no filter parameters are supplied, lists all the deliverables in all the participants and projects that are visible to the user. For users with accelerator admin privileges, this will be the full list of all deliverables for all accelerator projects.
         */
        get: operations["listDeliverables"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Import a list of deliverables metadata.  */
        post: operations["importDeliverables"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/{deliverableId}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Uploads a new document to satisfy a deliverable. */
        post: operations["uploadDeliverableDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/{deliverableId}/documents/{documentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a single submission document from a deliverable. */
        get: operations["getDeliverableDocument"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the details of a single deliverable and its submission documents, if any. */
        get: operations["getDeliverable"];
        /**
         * Updates the state of a submission from a project.
         * @description Only permitted for users with accelerator admin privileges.
         */
        put: operations["updateSubmission"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Marks a submission from a project as complete. */
        post: operations["completeSubmission"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}/incomplete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Marks a submission from a project as incomplete. */
        post: operations["incompleteSubmission"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submits a submission from a project. */
        post: operations["submitSubmission"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List events */
        get: operations["listEvents"];
        put?: never;
        /**
         * Create a new event on a module.
         * @description Only accessible by accelerator administrators.
         */
        post: operations["createEvent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/events/{eventId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one event for a project. */
        get: operations["getEvent"];
        /**
         * Update an event on a module.
         * @description Only accessible by accelerator administrators.
         */
        put: operations["updateEvent"];
        post?: never;
        /**
         * Delete an event from a module.
         * @description Only accessible by accelerator administrators.
         */
        delete: operations["deleteEvent"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/events/{eventId}/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Update the list of projects for a module event.
         * @description Only accessible by accelerator administrators.
         */
        post: operations["updateEventProjects"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/modules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List modules. */
        get: operations["listModules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/modules/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Import a list of modules.  */
        post: operations["importModules"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/modules/{moduleId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one module. */
        get: operations["getModule"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/organizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lists accelerator related organizations and their projects.
         * @description By default, only lists tagged organizations that have projects that have not been assigned to participants yet.
         */
        get: operations["listAcceleratorOrganizations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/organizations/{organizationId}/tfContact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Assign a user as a Terraformation contact for an organization.
         * @description The user will be added to the organization if they are not already a member.
         */
        put: operations["assignTerraformationContact"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/participants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List participants and their assigned projects. */
        get: operations["listParticipants"];
        put?: never;
        /** Creates a new participant. */
        post: operations["createParticipant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/participants/{participantId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a participant and its assigned projects. */
        get: operations["getParticipant"];
        /** Updates a participant's information. */
        put: operations["updateParticipant"];
        post?: never;
        /** Deletes a participant that has no projects. */
        delete: operations["deleteParticipant"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List accelerator projects with accelerator-related details. */
        get: operations["listProjectAcceleratorDetails"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/species": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Creates a new participant project species entry. */
        post: operations["createParticipantProjectSpecies"];
        /** Deletes participant project species entries. */
        delete: operations["deleteParticipantProjectSpecies"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/species/assign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Creates a new participant project species entry for every project ID and species ID pairing. */
        post: operations["assignParticipantProjectSpecies"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/species/{participantProjectSpeciesId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a participant project species. */
        get: operations["getParticipantProjectSpecies"];
        /** Updates a participant project species entry. */
        put: operations["updateParticipantProjectSpecies"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the accelerator-related details for a project. */
        get: operations["getProjectAcceleratorDetails"];
        /** Updates the accelerator-related details for a project. */
        put: operations["updateProjectAcceleratorDetails"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List project accelerator reports.
         * @description By default, reports more than 30 days in the future, or marked as Not Needed will be omitted. Optionally query by year, or include metrics.
         */
        get: operations["listAcceleratorReports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/configs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List accelerator report configurations. */
        get: operations["listAcceleratorReportConfig"];
        /**
         * Insert accelerator report configuration.
         * @description Set up an accelerator report configuration for a project. This will createall the reports within the reporting period.
         */
        put: operations["createAcceleratorReportConfig"];
        /** Update all accelerator report configurations for a project. */
        post: operations["updateProjectAcceleratorReportConfig"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/configs/{configId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update accelerator report configuration. */
        post: operations["updateAcceleratorReportConfig"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all project metrics for one project. */
        get: operations["listProjectMetrics"];
        /** Insert project metric, that the project will report on all future reports. */
        put: operations["createProjectMetric"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/metrics/{metricId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update one project metric by ID. */
        post: operations["updateProjectMetric"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/targets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update project metric targets. */
        post: operations["updateProjectMetricTargets"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get one report. */
        get: operations["getAcceleratorReport"];
        put?: never;
        /** Update metric data and qualitative data for a report */
        post: operations["updateAcceleratorReportValues"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/metrics/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Refresh system metric entries value for a report */
        post: operations["refreshAcceleratorReportSystemMetrics"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/metrics/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Review metric entries for a report */
        post: operations["reviewAcceleratorReportMetrics"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Uploads a photo to a report. */
        post: operations["uploadAcceleratorReportPhoto"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/photos/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieves a specific photo from a report
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getAcceleratorReportPhoto"];
        /** Updates a report photo caption */
        put: operations["updateAcceleratorReportPhoto"];
        post?: never;
        /** Deletes a report photo */
        delete: operations["deleteAcceleratorReportPhoto"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Publishes a report to funder */
        post: operations["publishAcceleratorReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Review a report */
        post: operations["reviewAcceleratorReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/reports/{reportId}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submits a report for review */
        post: operations["submitAcceleratorReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/scores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets score selections for a single project. */
        get: operations["getProjectScores"];
        /**
         * Upserts score selections for a single project.
         * @description Update the scores for the project phase. If the (project, phase, category) does not exist, a new entry is created. Setting a `score` to `null` removes the score.
         */
        put: operations["upsertProjectScores_1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/species": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets all species associated to a participant project. */
        get: operations["getSpeciesForProject"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/species/snapshots/{deliverableId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Creates a new participant project species entry. */
        get: operations["getParticipantProjectSpeciesSnapshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/projects/{projectId}/votes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets vote selections for a single project.
         * @description List every vote selection for this project, organized by phases. Each phase will contain a list of eligible voters and their selections.
         */
        get: operations["getProjectVotes"];
        /**
         * Upserts vote selections for a single project.
         * @description Update the user's vote for the project phase. If the (user, project, phase) does not exist, a new entry is created. Setting a `voteOption` to `null` removes the vote.
         */
        put: operations["upsertProjectVotes"];
        post?: never;
        /**
         * Remove one or more voters from the project/phase.
         * @description Remove the voters from the project phase, making them ineligible from voting. This is different from undoing a vote (by setting the `voteOption` to `null`). To remove voters from the entire project phase, set `userId` to `null`, and set `phaseDelete` to `true`
         */
        delete: operations["deleteProjectVotes"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/reports/standardMetrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all standard metrics. */
        get: operations["listStandardMetric"];
        /** Insert standard metric, that projects will report on all future reports. */
        put: operations["createStandardMetric"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/reports/standardMetrics/{metricId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update one standard metric by ID. */
        post: operations["updateStandardMetric"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/reports/systemMetrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all system metrics. */
        get: operations["listSystemMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accelerator/species/{speciesId}/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets all participant projects associated to a species with active deliverable information if applicable. */
        get: operations["getProjectsForSpecies"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/automations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of automations for a device or facility. */
        get: operations["listAutomations"];
        put?: never;
        /** Creates a new automation for a device or facility. */
        post: operations["createAutomation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/automations/{automationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the details of a single automation for a device or facility. */
        get: operations["getAutomation"];
        /** Updates an existing automation for a device or facility. */
        put: operations["updateAutomation"];
        post?: never;
        /** Deletes an existing automation from a device or facility. */
        delete: operations["deleteAutomation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/automations/{automationId}/trigger": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reports that an automation has been triggered. */
        post: operations["postAutomationTrigger"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/countries/{countryCode}/boundary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets boundary of one country given the 2-letter country code. */
        get: operations["getBorder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registers a new device a facility's device manager. */
        post: operations["createDevice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the configuration of a single device. */
        get: operations["getDevice"];
        /** Updates the configuration of an existing device. */
        put: operations["updateDevice"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/{id}/unresponsive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Marks a device as unresponsive.
         * @description Notifies the appropriate users so they can troubleshoot the problem.
         */
        post: operations["deviceUnresponsive"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/disclaimer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Fetch current disclaimer. */
        get: operations["getDisclaimer"];
        put?: never;
        /** Accept current disclaimer. */
        post: operations["acceptDisclaimer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of all the documents. */
        get: operations["listDocuments"];
        put?: never;
        /** Creates a new document. */
        post: operations["createDocument"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/documents/{documentId}/upgrade": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upgrades a document to a newer manifest.
         * @description The manifest must be for the same document template as the existing manifest.
         */
        post: operations["upgradeManifest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/documents/{documentId}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Saves a version of a document. */
        post: operations["createSavedDocumentVersion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/documents/{documentId}/versions/{versionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets details of a specific saved version of a document. */
        get: operations["getSavedDocumentVersion"];
        /** Updates a saved version of a document. */
        put: operations["updateSavedDocumentVersion"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/documents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a document. */
        get: operations["getDocument"];
        /** Updates a document. */
        put: operations["updateDocument"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/documents/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the history of a document. This includes both information about document edits and information about saved versions. */
        get: operations["getDocumentHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/images": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Save an image to a new variable value. */
        post: operations["uploadProjectImageValue"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/images/{valueId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the contents of an image variable value.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getProjectImageValue"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/owners": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the owners of a project's variables.
         * @description Only variables that actually have owners are returned.
         */
        get: operations["listVariableOwners"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/owners/{variableId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update or remove the owner of a variable in a project. */
        put: operations["updateVariableOwner"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/values": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the values of the variables in a project.
         * @description This may be used to fetch the full set of current values (the default behavior), the values from a saved version (if maxValueId is specified), or to poll for recent edits (if minValueId is specified).
         */
        get: operations["listProjectVariableValues"];
        put?: never;
        /**
         * Update the values of the variables in a project.
         * @description Make a list of changes to a project's variable values. The changes are applied in order and are treated as an atomic unit. That is, the changes will either all succeed or all fail; there won't be a case where some of the changes are applied and some aren't. See the payload descriptions for more details about the operations you can perform on values.
         */
        post: operations["updateProjectVariableValues"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/workflow/{variableId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update the workflow details for a variable in a project. */
        put: operations["updateVariableWorkflowDetails"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/projects/{projectId}/workflow/{variableId}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the workflow history for a variable in a project. */
        get: operations["getVariableWorkflowHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of all the valid document templates. */
        get: operations["listDocumentTemplates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/document-producer/variables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the available variables, optionally filtered by a document or deliverable.
         * @description Variables returned for a document include all section hierarchies and variables injected into section text.
         */
        get: operations["listVariables"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/events/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Lists the entries from the event log that relate to a particular entity. */
        post: operations["listEventLogEntries"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all accessible facilities. */
        get: operations["listAllFacilities"];
        put?: never;
        /** Creates a new facility. */
        post: operations["createFacility"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single facility. */
        get: operations["getFacility"];
        /** Updates information about a facility. */
        put: operations["updateFacility"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/alert/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sends an alert to the facility's configured alert recipients. */
        post: operations["sendFacilityAlert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/configured": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Marks a facility as fully configured.
         * @description After connecting a device manager and finishing any necessary configuration of the facility's devices, send this request to enable processing of timeseries values and alerts from the device manager. Only valid if the facility's connection state is `Connected`.
         */
        post: operations["postConfigured"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the configurations of all the devices at a facility. */
        get: operations["listFacilityDevices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/subLocations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of sub-locations at a facility. */
        get: operations["listSubLocations"];
        put?: never;
        /** Creates a new sub-location at a facility. */
        post: operations["createSubLocation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/subLocations/{subLocationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a specific sub-location at a facility. */
        get: operations["getSubLocation"];
        /** Updates the name of a sub-location at a facility. */
        put: operations["updateSubLocation"];
        post?: never;
        /**
         * Deletes a sub-location from a facility.
         * @description The sub-location must not be in use.
         */
        delete: operations["deleteSubLocation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facility/{facilityId}/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the configurations of all the devices at a facility. */
        get: operations["listFacilityDevices_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/files/tokens/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the contents of the file associated with a file access token.
         * @description This endpoint does not require authentication; it's intended to offer temporary file access for third-party services such as video transcoding.
         */
        get: operations["getFileForToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/activities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Returns a list of published activities for a project. */
        get: operations["funderListActivities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/activities/{activityId}/media/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets a photo file for an activity.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getActivityMedia_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/activities/{activityId}/media/{fileId}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets streaming details for a video for an activity.
         * @description This does not return the actual streaming data; it just returns the necessary information to stream video from Mux.
         */
        get: operations["getActivityMediaStream"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/entities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all funding entities. */
        get: operations["listFundingEntities"];
        put?: never;
        /** Creates a new funding entity */
        post: operations["createFundingEntity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/entities/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the Funding Entities that a specific project is tied to */
        get: operations["getProjectFundingEntities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/entities/users/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the Funding Entity that a specific user belongs to */
        get: operations["getFundingEntity_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/entities/{fundingEntityId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a funding entity */
        get: operations["getFundingEntity"];
        /** Updates an existing funding entity */
        put: operations["updateFundingEntity"];
        post?: never;
        /** Deletes an existing funding entity */
        delete: operations["deleteFundingEntity"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/entities/{fundingEntityId}/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List funders for a Funding Entity */
        get: operations["getFunders"];
        put?: never;
        /** Invites a funder via email to a Funding Entity */
        post: operations["inviteFunder"];
        /** Removes a funder from a Funding Entity */
        delete: operations["removeFunder"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a list of all published projects */
        get: operations["getAllProjects"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/projects/{projectIds}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get published project details displayable to funders */
        get: operations["getProjects"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Publishes project detail information for funders */
        post: operations["publishProjectProfile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/reports/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the published reports for a specific project. */
        get: operations["listPublishedReports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/funder/reports/{reportId}/photos/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieves a specific photo from a published report
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getPublishedReportPhoto"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/gis/wfs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Forwards a WFS API request to GeoServer.
         * @description Query string parameters are passed to GeoServer, but headers aren't. The response from GeoServer, if any, will be returned verbatim. Only available for internal users.
         */
        get: operations["proxyGetRequest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/globalRoles/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the list of users that have global roles. */
        get: operations["listGlobalRoles"];
        put?: never;
        post?: never;
        /** Remove global roles from the supplied users. */
        delete: operations["deleteGlobalRoles"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/i18n/timeZones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of supported time zones and their names. */
        get: operations["listTimeZoneNames"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internalTags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all the available internal tags */
        get: operations["listAllInternalTags"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internalTags/organizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the internal tags assigned to all organizations
         * @description This includes organizations with no internal tags, whose list of tags will be empty.
         */
        get: operations["listAllOrganizationInternalTags"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/internalTags/organizations/{organizationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the internal tags assigned to an organization */
        get: operations["listOrganizationInternalTags"];
        /** Replace the list of internal tags assigned to an organization */
        put: operations["updateOrganizationInternalTags"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Redirects to a login page.
         * @description For interactive web applications, this can be used to redirect the user to a login page to allow the application to make other API requests. The login process will set a cookie that will authenticate to the API, and will then redirect back to the application. One approach is to use this in error response handlers: if an API request returns HTTP 401 Unauthorized, set location.href to this endpoint and set "redirect" to the URL of the page the user was on so they'll return there after logging in.
         */
        get: operations["login"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieve all notifications for current user scoped to an organization. */
        get: operations["readAll"];
        /** Update notifications as read or unread */
        put: operations["markAllRead"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieve notifications count by organization for current user. */
        get: operations["count"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieve a notification by its id. */
        get: operations["read"];
        /** Update a single notification as read or unread */
        put: operations["markRead"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Creates a new seedling batch at a nursery. */
        post: operations["createBatch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Uploads a list of seedling batches to add to the nursery.
         * @description The uploaded file must be in CSV format. A template with the correct headers may be downloaded from the `/api/v1/nursery/batches/uploads/template` endpoint.
         */
        post: operations["uploadSeedlingBatchesList"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/uploads/template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a template file that contains the required header row for seedling batch uploads. */
        get: operations["getSeedlingBatchesUploadTemplate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/uploads/{uploadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the status of a seedling batches list uploaded previously.
         * @description Clients may poll this endpoint to monitor the progress of the file.
         */
        get: operations["getSeedlingBatchesListUploadStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/{batchId}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the history of changes to a seedling batch.
         * @description Each event includes a version number. For events such as details edits that are snapshots of the values at a particular time, clients can compare against the event with the previous version number to see what has changed, e.g., to show a delta or a diff view.
         */
        get: operations["getBatchHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/{batchId}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all the photos of a seedling batch. */
        get: operations["listBatchPhotos"];
        put?: never;
        /** Creates a new photo of a seedling batch. */
        post: operations["createBatchPhoto"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/{batchId}/photos/{photoId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieves a specific photo from a seedling batch.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getBatchPhoto"];
        put?: never;
        post?: never;
        /** Deletes a photo from a seedling batch. */
        delete: operations["deleteBatchPhoto"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single seedling batch. */
        get: operations["getBatch"];
        /** Updates non-quantity-related details about a batch. */
        put: operations["updateBatch"];
        post?: never;
        /** Deletes an existing seedling batch from a nursery. */
        delete: operations["deleteBatch"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/{id}/changeStatuses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Changes the statuses of seedlings in a batch.
         * @description There must be enough seedlings available to move to the next status.
         */
        post: operations["changeBatchStatuses"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/batches/{id}/quantities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Updates the remaining quantities in a seedling batch.
         * @description This should not be used to record withdrawals; use the withdrawal API for that.
         */
        put: operations["updateBatchQuantities"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/facilities/{facilityId}/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a summary of the numbers of plants in a nursery. */
        get: operations["getNurserySummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/species/{speciesId}/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a summary of the numbers of plants of each species in all nurseries. */
        get: operations["getSpeciesSummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a summary of the numbers of plants in all the nurseries in an organization. */
        get: operations["getOrganizationNurserySummary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/withdrawals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Withdraws seedlings from one or more seedling batches at a nursery. */
        post: operations["createBatchWithdrawal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/withdrawals/{withdrawalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a specific nursery withdrawal. */
        get: operations["getNurseryWithdrawal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/withdrawals/{withdrawalId}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all the photos of a withdrawal. */
        get: operations["listWithdrawalPhotos"];
        put?: never;
        /** Creates a new photo of a seedling batch withdrawal. */
        post: operations["uploadWithdrawalPhoto"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/withdrawals/{withdrawalId}/photos/{photoId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieves a specific photo from a withdrawal.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getWithdrawalPhoto"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nursery/withdrawals/{withdrawalId}/undo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Undoes a withdrawal.
         * @description The withdrawal's plants will be returned to their original batches. Nursery transfers may not be undone. If the withdrawal was an outplanting to a planting site, the plants will be removed from the planting site's plant totals. This does not delete the original withdrawal.
         */
        post: operations["undoBatchWithdrawal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lists all organizations.
         * @description Lists all organizations the user can access through organization roles.
         */
        get: operations["listOrganizations"];
        put?: never;
        /** Creates a new organization. */
        post: operations["createOrganization"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations/{organizationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about an organization. */
        get: operations["getOrganization"];
        /** Updates an existing organization. */
        put: operations["updateOrganization"];
        post?: never;
        /**
         * Deletes an existing organization.
         * @description Organizations can only be deleted if they have no members other than the current user.
         */
        delete: operations["deleteOrganization"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations/{organizationId}/features": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the features available to an organization. */
        get: operations["listOrganizationFeatures"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations/{organizationId}/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the roles in an organization. */
        get: operations["listOrganizationRoles"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations/{organizationId}/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the users in an organization. */
        get: operations["listOrganizationUsers"];
        put?: never;
        /** Adds a user to an organization. */
        post: operations["addOrganizationUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations/{organizationId}/users/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a user's membership in an organization. */
        get: operations["getOrganizationUser"];
        /**
         * Updates the user's organization information.
         * @description Only includes organization-level information that can be modified by organization administrators.
         */
        put: operations["updateOrganizationUser"];
        post?: never;
        /**
         * Removes a user from an organization.
         * @description Does not remove any data created by the user.
         */
        delete: operations["deleteOrganizationUser"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists accessible projects. */
        get: operations["listProjects"];
        put?: never;
        /** Creates a new project. */
        post: operations["createProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a specific project. */
        get: operations["getProject"];
        /** Updates information about an existing project. */
        put: operations["updateProject"];
        post?: never;
        /**
         * Deletes an existing project.
         * @description Any accessions, seedling batches, or planting sites that were assigned to the project will no longer be assigned to any project.
         */
        delete: operations["deleteProject"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{id}/assign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Assigns multiple entities to a project.
         * @description Overwrites any existing project assignments.
         */
        post: operations["assignProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{id}/internalUsers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all internal users for a project. */
        get: operations["getInternalUsers"];
        /** Assign a user with global roles with an internal role for a project. */
        put: operations["updateInternalUser"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists an organization's reports. */
        get: operations["listReports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the report settings for an organization. */
        get: operations["getReportSettings"];
        /** Updates the report settings for an organization. */
        put: operations["updateReportSettings"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieves the contents of a report. */
        get: operations["getReport"];
        /**
         * Updates a report.
         * @description The report must be locked by the current user.
         */
        put: operations["updateReport"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the files associated with a report. */
        get: operations["listReportFiles"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}/lock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Locks a report.
         * @description Only succeeds if the report is not currently locked or if it is locked by the current user.
         */
        post: operations["lockReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}/lock/force": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Locks a report even if it is locked by another user already. */
        post: operations["forceLockReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the photos associated with a report. */
        get: operations["listReportPhotos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submits a report.
         * @description The report must be locked by the current user. Submitting a report releases the lock. Once a report is submitted, it may no longer be locked or updated.
         */
        post: operations["submitReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{id}/unlock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Releases the lock on a report. */
        post: operations["unlockReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{reportId}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Uploads a file to associate with a report. */
        post: operations["uploadReportFile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{reportId}/files/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Downloads a file associated with a report. */
        get: operations["downloadReportFile"];
        put?: never;
        post?: never;
        /** Deletes a file from a report. */
        delete: operations["deleteReportFile"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{reportId}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Uploads a photo to include with a report. */
        post: operations["uploadReportPhoto"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/reports/{reportId}/photos/{photoId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the contents of a photo.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getReportPhoto"];
        /** Updates a photo's caption. */
        put: operations["updateReportPhoto"];
        post?: never;
        /** Deletes a photo from a report. */
        delete: operations["deleteReportPhoto"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Exports selected fields from data matching a set of search criteria.
         * @description If a sublist field has multiple values, they are separated with line breaks in the exported file.
         */
        post: operations["search"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Get the total count of values matching a set of search criteria.
         * @description Note that fields, sortOrder, cursor, and count in the payload are unused in the count query and thus can be included or left out.
         */
        post: operations["searchCount"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/search/values": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search for distinct values from data matching a set of search criteria. */
        post: operations["searchDistinctValues"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/accessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Deletes an existing accession. */
        delete: operations["delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/accessions/{id}/checkIn": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Marks an accession as checked in. */
        post: operations["checkIn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/accessions/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the history of changes to an accession. */
        get: operations["getAccessionHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/accessions/{id}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all the available photos for an accession. */
        get: operations["listPhotos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/accessions/{id}/photos/{photoFilename}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a specific photo from an accession.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getPhoto"];
        put?: never;
        /**
         * Upload a new photo for an accession.
         * @description If there was already a photo with the specified filename, replaces it.
         */
        post: operations["uploadPhoto"];
        /** Delete one photo for an accession. */
        delete: operations["deletePhoto"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/clock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the server's current date and time.
         * @description In test environments, the clock can be advanced artificially, which will cause it to differ from the real-world date and time.
         */
        get: operations["getCurrentTime"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/log/{tag}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Records a log message from a device at a seed bank. */
        post: operations["recordLogMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get summary statistics about a specific seed bank or all seed banks within an organization. */
        get: operations["getSeedBankSummary"];
        put?: never;
        /** Get summary statistics about accessions that match a specified set of search criteria. */
        post: operations["summarizeAccessionSearch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/seedbank/values": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** List the values of a set of search fields for a set of accessions matching certain filter criteria. */
        post: operations["listFieldValues"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all the species available in an organization. */
        get: operations["listSpecies"];
        put?: never;
        /** Creates a new species. */
        post: operations["createSpecies"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/lookup/details": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets more information about a species with a particular scientific name. */
        get: operations["getSpeciesDetails"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/lookup/names": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Gets a list of known scientific names whose words begin with particular letters. */
        get: operations["listSpeciesNames"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/problems/{problemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Returns details about a problem with a species. */
        get: operations["getSpeciesProblem"];
        put?: never;
        /**
         * Applies suggested changes to fix a problem with a species.
         * @description Only valid for problems that include suggested changes.
         */
        post: operations["acceptProblemSuggestion"];
        /** Deletes information about a problem with a species without applying any suggested changes. */
        delete: operations["deleteProblem"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Uploads a list of species to add to the organization.
         * @description The uploaded file must be in CSV format. A template with the correct headers may be downloaded from the `/api/v1/species/uploads/template` endpoint.
         */
        post: operations["uploadSpeciesList"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/uploads/template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a template file that contains the required header row for species list uploads. */
        get: operations["getSpeciesListUploadTemplate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/uploads/{uploadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the status of a species list uploaded previously.
         * @description Clients may poll this endpoint to monitor the progress of the file.
         */
        get: operations["getSpeciesListUploadStatus"];
        put?: never;
        post?: never;
        /**
         * Deletes a species list upload that is awaiting user action.
         * @description This may only be called if the status of the upload is "Awaiting User Action".
         */
        delete: operations["deleteSpeciesListUpload"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/uploads/{uploadId}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resolves the problems with a species list that is awaiting user action.
         * @description This may only be called if the status of the upload is "Awaiting User Action".
         */
        post: operations["resolveSpeciesListUpload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/species/{speciesId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single species. */
        get: operations["getSpecies"];
        /** Updates an existing species. */
        put: operations["updateSpecies"];
        post?: never;
        /**
         * Deletes an existing species.
         * @description The species will no longer appear in the organization's list of species, but existing data (plants, seeds, etc.) that refer to the species will still refer to it.
         */
        delete: operations["deleteSpecies"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/support": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists support request types. */
        get: operations["listRequestTypes"];
        put?: never;
        /** Submit support request types. */
        post: operations["submitRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/support/attachment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload a temporary attachment.
         * @description Uploads an attachment, which can be assigned to a support request during submission.
         */
        post: operations["uploadAttachment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/timeseries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists the timeseries for one or more devices. */
        get: operations["listTimeseries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/timeseries/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Defines a list of timeseries for one or more devices.
         * @description If there are existing timeseries with the same names, the old definitions will be overwritten.
         */
        post: operations["createMultipleTimeseries"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/timeseries/values": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Records new values for one or more timeseries. */
        post: operations["recordTimeseriesValues"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/deliveries/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a specific delivery of seedlings to a planting site. */
        get: operations["getDelivery"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/deliveries/{id}/reassign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reassigns some of the seedlings from a delivery to a different substratum. */
        post: operations["reassignDelivery"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/draftSites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Saves a draft of an in-progress planting site. */
        post: operations["createDraftPlantingSite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/draftSites/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the details of a saved draft of a planting site. */
        get: operations["getDraftPlantingSite"];
        /** Updates an existing draft of an in-progress planting site. */
        put: operations["updateDraftPlantingSite"];
        post?: never;
        /** Deletes an existing draft of an in-progress planting site. */
        delete: operations["deleteDraftPlantingSite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/mapbox/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets an API token to use for displaying Mapbox maps.
         * @description Mapbox API tokens are short-lived; when a token expires, request a new one.
         */
        get: operations["getMapboxToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of observations of planting sites. */
        get: operations["listObservations"];
        put?: never;
        /** Schedules a new observation. */
        post: operations["scheduleObservation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/adHoc": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of ad-hoc observations of planting sites. */
        get: operations["listAdHocObservations"];
        put?: never;
        /** Records a new completed ad-hoc observation. */
        post: operations["completeAdHocObservation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/adHoc/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of the results of ad-hoc observations. */
        get: operations["listAdHocObservationResults"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a list of the results of observations. */
        get: operations["listObservationResults"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/results/summaries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the rollup observation summaries of a planting site */
        get: operations["listObservationSummaries"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about a single observation. */
        get: operations["getObservation"];
        /** Reschedules an existing observation. */
        put: operations["rescheduleObservation"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/abandon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Abandon the observation. */
        post: operations["abandonObservation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/mergeOtherSpecies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Replaces a user-entered 'Other' species with one of the organization's species in an observation. */
        post: operations["mergeOtherSpecies"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Exports monitoring plots assigned to an observation as a GPX file. */
        get: operations["listAssignedPlots"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets one assigned observation monitoring plot */
        get: operations["getOneAssignedPlot"];
        /** Updates information about the observation of a plot. */
        put: operations["updatePlotObservation"];
        /** Stores the results of a completed observation of a plot. */
        post: operations["completePlotObservation"];
        delete?: never;
        options?: never;
        head?: never;
        /** Updates information about a completed plot in an observation. */
        patch: operations["updateCompletedObservationPlot"];
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/claim": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Claims a monitoring plot.
         * @description A plot may only be claimed by one user at a time.
         */
        post: operations["claimMonitoringPlot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/media/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Downloads a video or photo of an observation.
         * @description For videos, this returns a video file, not a stream.
         */
        get: operations["getObservationMediaFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/media/{fileId}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets streaming details for a video for an observation. */
        get: operations["getObservationMediaStream"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/otherMedia": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Adds a photo of a monitoring plot after an observation is complete. */
        post: operations["uploadOtherPlotMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Uploads a photo of a monitoring plot as part of the observation.
         * @description Photos uploaded via this endpoint are considered to be part of the original observation and cannot be deleted later.
         */
        post: operations["uploadPlotPhoto"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/photos/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieves a specific photo from an observation of a monitoring plot.
         * @description Optional maxWidth and maxHeight parameters may be included to control the dimensions of the image; the server will scale the original down as needed. If neither parameter is specified, the original full-size image will be returned. The aspect ratio of the original image is maintained, so the returned image may be smaller than the requested width and height. If only maxWidth or only maxHeight is supplied, the other dimension will be computed based on the original image's aspect ratio.
         */
        get: operations["getPlotPhoto"];
        /** Updates information about a specific photo from an observation of a monitoring plot. */
        put: operations["updatePlotPhoto"];
        post?: never;
        /**
         * Deletes a photo from an observation of a monitoring plot.
         * @description Only photos that were not part of the original observation may be deleted.
         */
        delete: operations["deletePlotPhoto"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/release": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Releases the claim on a monitoring plot. */
        post: operations["releaseMonitoringPlot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/plots/{plotId}/replace": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Requests that a monitoring plot be replaced with a new one.
         * @description In some cases, the requested plot will be removed from the observation but not replaced with a different one.
         */
        post: operations["replaceObservationPlot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/observations/{observationId}/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the results of an observation of a planting site.
         * @description Some information is only available once all plots have been completed.
         */
        get: operations["getObservationResults"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets a list of an organization's planting sites.
         * @description The list can optionally contain information about strata and substrata.
         */
        get: operations["listPlantingSites"];
        put?: never;
        /** Creates a new planting site. */
        post: operations["createPlantingSite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites/reportedPlants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lists the total number of plants planted at a planting site and in each stratum.
         * @description The totals are based on nursery withdrawals.
         */
        get: operations["listPlantingSiteReportedPlants"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Validates the definition of a new planting site. */
        post: operations["validatePlantingSite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets information about a specific planting site.
         * @description Includes information about the site's strata and substrata.
         */
        get: operations["getPlantingSite"];
        /** Updates information about an existing planting site. */
        put: operations["updatePlantingSite"];
        post?: never;
        /**
         * Deletes a planting site.
         * @description Planting site should not have any plantings.
         */
        delete: operations["deletePlantingSite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lists all older versions of a planting site. */
        get: operations["listPlantingSiteHistories"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites/{id}/history/{historyId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about an older version of a planting site. */
        get: operations["getPlantingSiteHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/sites/{id}/reportedPlants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the total number of plants planted at a planting site and in each stratum.
         * @description The totals are based on nursery withdrawals.
         */
        get: operations["getPlantingSiteReportedPlants"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/substrata/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Updates the planting-completed state of a substratum. */
        put: operations["updateSubstrata"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/substrata/{id}/species": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets a list of the species that may have been planted in a substratum.
         * @description The list is based on nursery withdrawals to the planting site as well as past observations.
         */
        get: operations["listSubstratumSpecies_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/subzones/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Updates the planting-completed state of a substratum.
         * @deprecated
         * @description Deprecated, use /substrata/{id} instead
         */
        put: operations["updatePlantingSubzone"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/subzones/{id}/species": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets a list of the species that may have been planted in a substratum.
         * @description The list is based on nursery withdrawals to the planting site as well as past observations.
         */
        get: operations["listSubstratumSpecies"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/t0/site": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Assign T0 Data for a planting site
         * @description Deletes existing densities in the same plot if they don't appear in the payload.
         */
        post: operations["assignT0SiteData"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/t0/site/temp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Assign T0 Data for a planting site, only applicable to temporary plots */
        post: operations["assignT0TempSiteData"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/t0/site/{plantingSiteId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all saved T0 Data for a planting site */
        get: operations["getT0SiteData"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/t0/site/{plantingSiteId}/allSet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get whether or not all T0 Data has been set for a planting site */
        get: operations["getAllT0SiteDataSet"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracking/t0/site/{plantingSiteId}/species": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lists all the species that have been withdrawn to a planting site or recorded in observations (if not withdrawn).
         * @description Species with densities are species that were withdrawn, species with null densities are species that were recorded in observations but not withdrawn to the plot's substratum.
         */
        get: operations["getT0SpeciesForPlantingSite"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a user by some criteria, for now only email is available */
        get: operations["searchUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets information about the current user. */
        get: operations["getMyself"];
        /** Updates information about the current user. */
        put: operations["updateMyself"];
        post?: never;
        /**
         * Deletes the current user's account.
         * @description WARNING! This operation is not reversible.
         */
        delete: operations["deleteMyself"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me/cookies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Updates the current user's cookie consent selection. */
        put: operations["updateCookieConsent"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the current user's preferences. */
        get: operations["getUserPreferences"];
        /** Updates the current user's preferences. */
        put: operations["updateUserPreferences"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a user by ID, if they exist. */
        get: operations["getUser"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{userId}/globalRoles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Apply the supplied global roles to the user. */
        post: operations["updateGlobalRoles"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{userId}/internalInterests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the list of internal interests assigned to a user. */
        get: operations["getUserDeliverableCategories"];
        /** Update which internal interests are assigned to a user. */
        put: operations["updateUserDeliverableCategories"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets the minimum and recommended versions for Terraware's client applications. */
        get: operations["getVersions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/webhooks/mux": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Endpoint for webhook requests from Mux. */
        post: operations["handleMuxWebhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/accelerator/projects/{projectId}/scores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets overall score for a single project.  */
        get: operations["getProjectOverallScore"];
        /** Updates overall score for a single project. */
        put: operations["upsertProjectScores"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Creates a new accession. */
        post: operations["createAccession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Uploads a list of accessions to add to the facility.
         * @description The uploaded file must be in CSV format. A template with the correct headers may be downloaded from the `/api/v2/seedbank/accessions/uploads/template` endpoint.
         */
        post: operations["uploadAccessionsList"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/uploads/template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gets a template file that contains the required header row for accessions list uploads. */
        get: operations["getAccessionsListUploadTemplate"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/uploads/{uploadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gets the status of an accessions list uploaded previously.
         * @description Clients may poll this endpoint to monitor the progress of the file.
         */
        get: operations["getAccessionsListUploadStatus"];
        put?: never;
        post?: never;
        /**
         * Deletes an accessions list upload that is awaiting user action.
         * @description This may only be called if the status of the upload is "Awaiting User Action".
         */
        delete: operations["deleteAccessionsListUpload"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/uploads/{uploadId}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resolves the problems with an accessions list that is awaiting user action.
         * @description This may only be called if the status of the upload is "Awaiting User Action".
         */
        post: operations["resolveAccessionsListUpload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/{accessionId}/transfers/nursery": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Transfers seeds to a nursery. */
        post: operations["createNurseryTransferWithdrawal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/{accessionId}/viabilityTests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all of the accession's viability tests. */
        get: operations["listViabilityTests"];
        put?: never;
        /**
         * Create a new viability test on an existing accession.
         * @description May cause the accession's remaining quantity to change.
         */
        post: operations["createViabilityTest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/{accessionId}/viabilityTests/{viabilityTestId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single viability test. */
        get: operations["getViabilityTest"];
        /**
         * Update the details of an existing viability test.
         * @description May cause the accession's remaining quantity to change.
         */
        put: operations["updateViabilityTest"];
        post?: never;
        /**
         * Delete an existing viability test.
         * @description May cause the accession's remaining quantity to change.
         */
        delete: operations["deleteViabilityTest"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/{accessionId}/withdrawals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all the withdrawals from an accession. */
        get: operations["listWithdrawals"];
        put?: never;
        /**
         * Create a new withdrawal on an existing accession.
         * @description May cause the accession's remaining quantity to change.
         */
        post: operations["createWithdrawal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/{accessionId}/withdrawals/{withdrawalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single withdrawal. */
        get: operations["getWithdrawal"];
        /**
         * Update the details of an existing withdrawal.
         * @description May cause the accession's remaining quantity to change.
         */
        put: operations["updateWithdrawal"];
        post?: never;
        /**
         * Delete an existing withdrawal.
         * @description May cause the accession's remaining quantity to change.
         */
        delete: operations["deleteWithdrawal"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v2/seedbank/accessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieve an existing accession. */
        get: operations["getAccession"];
        /** Update an existing accession. */
        put: operations["updateAccession"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AcceleratorOrganizationPayload: {
            /** Format: int64 */
            id: number;
            name: string;
            projects: components["schemas"]["AcceleratorProjectPayload"][];
            tfContactUser?: components["schemas"]["TerraformationContactUserPayload"];
            tfContactUsers: components["schemas"]["TerraformationContactUserPayload"][];
        };
        AcceleratorProjectPayload: {
            /** Format: int64 */
            id: number;
            name: string;
            /** Format: int64 */
            participantId?: number;
        };
        AcceleratorReportPayload: {
            achievements: string[];
            additionalComments?: string;
            challenges: components["schemas"]["ReportChallengePayload"][];
            /** Format: date */
            endDate: string;
            feedback?: string;
            financialSummaries?: string;
            /** @enum {string} */
            frequency: "Quarterly" | "Annual";
            highlights?: string;
            /** Format: int64 */
            id: number;
            internalComment?: string;
            /** Format: int64 */
            modifiedBy: number;
            modifiedByUser: components["schemas"]["SimpleUserPayload"];
            /** Format: date-time */
            modifiedTime: string;
            photos: components["schemas"]["ReportPhotoPayload"][];
            /** Format: int64 */
            projectId: number;
            projectMetrics: components["schemas"]["ReportProjectMetricPayload"][];
            /** @enum {string} */
            quarter?: "Q1" | "Q2" | "Q3" | "Q4";
            standardMetrics: components["schemas"]["ReportStandardMetricPayload"][];
            /** Format: date */
            startDate: string;
            /** @enum {string} */
            status: "Not Submitted" | "Submitted" | "Approved" | "Needs Update" | "Not Needed";
            /** Format: int64 */
            submittedBy?: number;
            submittedByUser?: components["schemas"]["SimpleUserPayload"];
            /** Format: date-time */
            submittedTime?: string;
            systemMetrics: components["schemas"]["ReportSystemMetricPayload"][];
        };
        AccessionHistoryEntryPayload: {
            /** Format: int64 */
            batchId?: number;
            /** Format: date */
            date: string;
            /**
             * @description Human-readable description of the event. Does not include date or userName.
             * @example updated the status to Drying
             */
            description: string;
            /** @description Full name of the person responsible for the event, if known. */
            fullName?: string;
            /** @description User-entered notes about the event, if any. */
            notes?: string;
            /** @enum {string} */
            type: "Created" | "QuantityUpdated" | "StateChanged" | "ViabilityTesting" | "Withdrawal";
        };
        AccessionPayloadV2: {
            /** @description Server-generated human-readable identifier for the accession. This is unique within a single seed bank, but different seed banks may have accessions with the same number. */
            accessionNumber: string;
            /**
             * @description Server-calculated active indicator. This is based on the accession's state.
             * @enum {string}
             */
            active: "Inactive" | "Active";
            bagNumbers?: string[];
            /** Format: date */
            collectedDate?: string;
            collectionSiteCity?: string;
            collectionSiteCoordinates?: components["schemas"]["Geolocation"][];
            collectionSiteCountryCode?: string;
            collectionSiteCountrySubdivision?: string;
            collectionSiteLandowner?: string;
            collectionSiteName?: string;
            collectionSiteNotes?: string;
            /** @enum {string} */
            collectionSource?: "Wild" | "Reintroduced" | "Cultivated" | "Other";
            /** @description Names of the people who collected the seeds. */
            collectors?: string[];
            /** Format: date */
            dryingEndDate?: string;
            /**
             * Format: int32
             * @description Estimated number of seeds remaining. Absent if there isn't enough information to calculate an estimate.
             */
            estimatedCount?: number;
            /** @description Estimated weight of seeds remaining. Absent if there isn't enough information to calculate an estimate. */
            estimatedWeight?: components["schemas"]["SeedQuantityPayload"];
            /** Format: int64 */
            facilityId: number;
            /** @description If true, plants from this accession's seeds were delivered to a planting site. */
            hasDeliveries: boolean;
            /**
             * Format: int64
             * @description Server-generated unique identifier for the accession. This is unique across all seed banks, but is not suitable for display to end users.
             */
            id: number;
            /** @description Most recent user observation of seeds remaining in the accession. This is not directly editable; it is updated by the server whenever the "remainingQuantity" field is edited. */
            latestObservedQuantity?: components["schemas"]["SeedQuantityPayload"];
            /**
             * Format: date-time
             * @description Time of most recent user observation of seeds remaining in the accession. This is updated by the server whenever the "remainingQuantity" field is edited.
             */
            latestObservedTime?: string;
            notes?: string;
            photoFilenames?: string[];
            plantId?: string;
            /**
             * Format: int32
             * @description Estimated number of plants the seeds were collected from.
             */
            plantsCollectedFrom?: number;
            /** Format: int64 */
            projectId?: number;
            /** Format: date */
            receivedDate?: string;
            /** @description Number or weight of seeds remaining for withdrawal and testing. May be calculated by the server after withdrawals. */
            remainingQuantity?: components["schemas"]["SeedQuantityPayload"];
            /**
             * @description Which source of data this accession originally came from.
             * @enum {string}
             */
            source?: "Web" | "Seed Collector App" | "File Import";
            /** @description Common name of the species, if defined. */
            speciesCommonName?: string;
            /**
             * Format: int64
             * @description Server-generated unique ID of the species.
             */
            speciesId?: number;
            /** @description Scientific name of the species. */
            speciesScientificName?: string;
            /** @enum {string} */
            state: "Awaiting Check-In" | "Awaiting Processing" | "Processing" | "Drying" | "In Storage" | "Used Up";
            subLocation?: string;
            /** Format: int32 */
            subsetCount?: number;
            /** @description Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
            subsetWeight?: components["schemas"]["SeedQuantityPayload"];
            /**
             * Format: int32
             * @description Total number of seeds withdrawn. If withdrawals are measured by weight, this is an estimate based on the accession's subset count and weight.
             */
            totalWithdrawnCount?: number;
            /** @description Total weight of seeds withdrawn. If withdrawals are measured by seed count, this is an estimate based on the accession's subset count and weight. */
            totalWithdrawnWeight?: components["schemas"]["SeedQuantityPayload"];
            /** Format: int32 */
            viabilityPercent?: number;
            viabilityTests?: components["schemas"]["GetViabilityTestPayload"][];
            withdrawals?: components["schemas"]["GetWithdrawalPayload"][];
        };
        ActivityMediaFilePayload: {
            caption?: string;
            /** Format: date */
            capturedDate: string;
            /** Format: int64 */
            fileId: number;
            fileName: string;
            geolocation?: components["schemas"]["Point"];
            isCoverPhoto: boolean;
            isHiddenOnMap: boolean;
            /** Format: int32 */
            listPosition: number;
            /** @enum {string} */
            type: "Photo" | "Video";
        };
        ActivityPayload: {
            /** Format: date */
            date: string;
            description?: string;
            /** Format: int64 */
            id: number;
            isHighlight: boolean;
            media: components["schemas"]["ActivityMediaFilePayload"][];
            /** Format: date-time */
            publishedTime?: string;
            /** @enum {string} */
            status: "Not Verified" | "Verified" | "Do Not Use";
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
        };
        AddOrganizationUserRequestPayload: {
            email: string;
            /** @enum {string} */
            role: "Contributor" | "Manager" | "Admin" | "Owner" | "Terraformation Contact";
        };
        AdminActivityMediaFilePayload: {
            caption?: string;
            /** Format: date */
            capturedDate: string;
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** Format: int64 */
            fileId: number;
            fileName: string;
            geolocation?: components["schemas"]["Point"];
            isCoverPhoto: boolean;
            isHiddenOnMap: boolean;
            /** Format: int32 */
            listPosition: number;
            /** @enum {string} */
            type: "Photo" | "Video";
        };
        AdminActivityPayload: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** Format: date */
            date: string;
            description?: string;
            /** Format: int64 */
            id: number;
            isHighlight: boolean;
            media: components["schemas"]["AdminActivityMediaFilePayload"][];
            /** Format: int64 */
            modifiedBy: number;
            /** Format: date-time */
            modifiedTime: string;
            /** Format: int64 */
            publishedBy?: number;
            /** Format: date-time */
            publishedTime?: string;
            /** @enum {string} */
            status: "Not Verified" | "Verified" | "Do Not Use";
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
            /** Format: int64 */
            verifiedBy?: number;
            /** Format: date-time */
            verifiedTime?: string;
        };
        AdminCreateActivityRequestPayload: {
            /** Format: date */
            date: string;
            description: string;
            isHighlight: boolean;
            /** Format: int64 */
            projectId: number;
            /** @enum {string} */
            status: "Not Verified" | "Verified" | "Do Not Use";
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
        };
        AdminGetActivityResponsePayload: {
            activity: components["schemas"]["AdminActivityPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        AdminListActivitiesResponsePayload: {
            activities: components["schemas"]["AdminActivityPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        AdminUpdateActivityRequestPayload: {
            /** Format: date */
            date: string;
            description: string;
            isHighlight: boolean;
            /** @enum {string} */
            status: "Not Verified" | "Verified" | "Do Not Use";
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
        };
        /** @description Search criterion that matches results that meet all of a set of other search criteria. That is, if the list of children is x, y, and z, this will require x AND y AND z. */
        AndNodePayload: Omit<components["schemas"]["SearchNodePayload"], "operation"> & {
            /** @description List of criteria all of which must be satisfied */
            children: components["schemas"]["SearchNodePayload"][];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "and";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "and";
        };
        AnnualDetailsPayloadV1: {
            bestMonthsForObservation: number[];
            budgetNarrativeSummary?: string;
            catalyticDetail?: string;
            challenges?: string;
            isCatalytic: boolean;
            keyLessons?: string;
            nextSteps?: string;
            opportunities?: string;
            projectImpact?: string;
            projectSummary?: string;
            socialImpact?: string;
            successStories?: string;
            sustainableDevelopmentGoals: components["schemas"]["GoalProgressPayloadV1"][];
        };
        /** @description Operation that appends a new value to a variable. If the variable does not have an existing value, creates the value with list position 0.
         *
         *     If the variable has an existing value and it is NOT a list, replaces the existing value. In this case, the new list position will be 0.
         *
         *     If the variable has existing values and it IS a list, creates the value with a list position 1 greater than the currently-highest position, that is, appends the value to the list.
         *
         *     If the variable is a table column and no rowValueId is specified, associates the new value with the most recently appended row. You MUST append a row value before appending the values of the columns. */
        AppendValueOperationPayload: Omit<components["schemas"]["ValueOperationPayload"], "operation"> & {
            /**
             * Format: int64
             * @description If the variable is a table column and the new value should be appended to an existing row, the existing row's value ID.
             */
            rowValueId?: number;
            value: components["schemas"]["NewDateValuePayload"] | components["schemas"]["NewEmailValuePayload"] | components["schemas"]["NewImageValuePayload"] | components["schemas"]["NewLinkValuePayload"] | components["schemas"]["NewNumberValuePayload"] | components["schemas"]["NewSectionTextValuePayload"] | components["schemas"]["NewSectionVariableValuePayload"] | components["schemas"]["NewSelectValuePayload"] | components["schemas"]["NewTableValuePayload"] | components["schemas"]["NewTextValuePayload"];
            /** Format: int64 */
            variableId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "Append";
        };
        ApplicationDeliverablePayload: {
            /** @enum {string} */
            category: "Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files";
            /** @description Optional description of the deliverable in HTML form. */
            descriptionHtml?: string;
            documents: components["schemas"]["SubmissionDocumentPayload"][];
            /** Format: int64 */
            id: number;
            internalComment?: string;
            /** Format: date-time */
            modifiedTime?: string;
            /** Format: int64 */
            moduleId: number;
            moduleName: string;
            name: string;
            /** Format: int64 */
            organizationId: number;
            organizationName: string;
            /** Format: int32 */
            position: number;
            projectDealName?: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
            required: boolean;
            sensitive: boolean;
            /** @enum {string} */
            status: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
            /** @enum {string} */
            type: "Document" | "Species" | "Questions";
        };
        ApplicationHistoryPayload: {
            feedback?: string;
            /** @description Internal-only comment, if any. Only set if the current user is an internal user. */
            internalComment?: string;
            /** Format: date-time */
            modifiedTime: string;
            /** @enum {string} */
            status: "Accepted" | "Carbon Assessment" | "Expert Review" | "Failed Pre-screen" | "Issue Active" | "Issue Reassessment" | "Not Eligible" | "Not Submitted" | "P0 Eligible" | "Passed Pre-screen" | "Sourcing Team Review" | "GIS Assessment" | "Submitted" | "In Review" | "Waitlist";
        };
        ApplicationModulePayload: {
            /** Format: int64 */
            applicationId?: number;
            /** Format: int64 */
            moduleId: number;
            name: string;
            overview?: string;
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            /** @enum {string} */
            status?: "Incomplete" | "Complete";
        };
        ApplicationPayload: {
            boundary?: components["schemas"]["MultiPolygon"];
            countryCode?: string;
            /** Format: date-time */
            createdTime: string;
            feedback?: string;
            /** Format: int64 */
            id: number;
            /** @description Internal-only comment, if any. Only set if the current user is an internal user. */
            internalComment?: string;
            /** @description Internal-only reference name of application. Only set if the current user is an internal user. */
            internalName?: string;
            /** Format: date-time */
            modifiedTime?: string;
            /** Format: int64 */
            organizationId: number;
            organizationName: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
            /** @enum {string} */
            status: "Accepted" | "Carbon Assessment" | "Expert Review" | "Failed Pre-screen" | "Issue Active" | "Issue Reassessment" | "Not Eligible" | "Not Submitted" | "P0 Eligible" | "Passed Pre-screen" | "Sourcing Team Review" | "GIS Assessment" | "Submitted" | "In Review" | "Waitlist";
        };
        AssignParticipantProjectSpeciesPayload: {
            projectIds: number[];
            speciesIds: number[];
        };
        AssignProjectRequestPayload: {
            accessionIds?: number[];
            batchIds?: number[];
            plantingSiteIds?: number[];
        };
        AssignSiteT0DataRequestPayload: {
            /** Format: int64 */
            plantingSiteId: number;
            plots: components["schemas"]["PlotT0DataPayload"][];
        };
        AssignSiteT0TempDataRequestPayload: {
            /** Format: int64 */
            plantingSiteId: number;
            strata?: components["schemas"]["StratumT0DataPayload"][];
            /**
             * @deprecated
             * @description Use strata instead
             */
            zones?: components["schemas"]["ZoneT0DataPayload"][];
        };
        AssignTerraformationContactRequestPayload: {
            /** Format: int64 */
            userId: number;
        };
        AssignedPlotPayload: {
            boundary: components["schemas"]["Geometry"];
            claimedByName?: string;
            /** Format: int64 */
            claimedByUserId?: number;
            completedByName?: string;
            /** Format: int64 */
            completedByUserId?: number;
            /** Format: date-time */
            completedTime?: string;
            elevationMeters?: number;
            /** @description True if this is the first observation to include the monitoring plot. */
            isFirstObservation: boolean;
            isPermanent: boolean;
            /** Format: int64 */
            observationId: number;
            /**
             * Format: int64
             * @deprecated
             * @description Use substratumId instead
             */
            plantingSubzoneId?: number;
            /**
             * @deprecated
             * @description Use substratumName instead
             */
            plantingSubzoneName: string;
            /**
             * @deprecated
             * @description Use stratumName instead
             */
            plantingZoneName: string;
            /** Format: int64 */
            plotId: number;
            plotName: string;
            /** Format: int64 */
            plotNumber: number;
            /**
             * Format: int32
             * @description Length of each edge of the monitoring plot in meters.
             */
            sizeMeters: number;
            stratumName: string;
            /** Format: int64 */
            substratumId?: number;
            substratumName: string;
        };
        AutomationPayload: {
            /** @description Human-readable description of this automation. */
            description?: string;
            /** Format: int64 */
            deviceId?: number;
            /** Format: int64 */
            facilityId: number;
            /** Format: int64 */
            id: number;
            /** Format: double */
            lowerThreshold?: number;
            /** @description Short human-readable name of this automation. */
            name: string;
            /** @description Client-defined configuration data for this automation. */
            settings?: {
                [key: string]: unknown;
            };
            timeseriesName?: string;
            type: string;
            /** Format: double */
            upperThreshold?: number;
            /** Format: int32 */
            verbosity: number;
        };
        AutomationTriggerRequestPayload: {
            /** @description Default message to publish if the automation type isn't yet supported by the server. */
            message?: string;
            /**
             * Format: double
             * @description For automations that are triggered by changes to timeseries values, the value that triggered the automation.
             */
            timeseriesValue?: number;
        };
        /** @description A change to the non-quantity-related details of a batch. */
        BatchHistoryDetailsEditedPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime" | "version"> & {
            /** Format: date */
            germinationStartedDate?: string;
            notes?: string;
            /**
             * Format: int64
             * @description The ID of the batch's project if the project still exists. If the project was subsequently deleted, this will be null but the project name will still be set.
             */
            projectId?: number;
            /** @description The name of the project at the time the details were edited. If the project was subsequently renamed or deleted, this name remains the same. */
            projectName?: string;
            /** Format: date */
            readyByDate?: string;
            /** Format: date */
            seedsSownDate?: string;
            subLocations: components["schemas"]["BatchHistorySubLocationPayload"][];
            /** @enum {string} */
            substrate?: "MediaMix" | "Soil" | "Sand" | "Moss" | "PerliteVermiculite" | "Other";
            substrateNotes?: string;
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            treatmentNotes?: string;
            /** @enum {string} */
            type: "DetailsEdited";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "DetailsEdited";
        };
        /** @description A nursery transfer withdrawal from another batch that added seedlings to this batch. */
        BatchHistoryIncomingWithdrawalPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime" | "version"> & {
            /** Format: int32 */
            activeGrowthQuantityAdded: number;
            /** Format: int64 */
            fromBatchId: number;
            /** Format: int32 */
            germinatingQuantityAdded: number;
            /** Format: int32 */
            hardeningOffQuantityAdded: number;
            /** Format: int32 */
            notReadyQuantityAdded: number;
            /** Format: int32 */
            readyQuantityAdded: number;
            /** @enum {string} */
            type: "IncomingWithdrawal";
            /** Format: int64 */
            withdrawalId: number;
            /** Format: date */
            withdrawnDate: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "IncomingWithdrawal";
        };
        /** @description A withdrawal that removed seedlings from this batch. This does not include the full details of the withdrawal; they can be retrieved using the withdrawal ID. */
        BatchHistoryOutgoingWithdrawalPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime" | "version"> & {
            /** Format: int32 */
            activeGrowthQuantityWithdrawn: number;
            /** Format: int32 */
            germinatingQuantityWithdrawn: number;
            /** Format: int32 */
            hardeningOffQuantity: number;
            /** Format: int32 */
            notReadyQuantityWithdrawn: number;
            /** @enum {string} */
            purpose: "Nursery Transfer" | "Dead" | "Out Plant" | "Other" | "Undo";
            /** Format: int32 */
            readyQuantityWithdrawn: number;
            /** @enum {string} */
            type: "OutgoingWithdrawal";
            /** Format: int64 */
            withdrawalId: number;
            /** Format: date */
            withdrawnDate: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "OutgoingWithdrawal";
        };
        BatchHistoryPayload: ({
            type: string;
        } & WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime">) & (components["schemas"]["BatchHistoryDetailsEditedPayload"] | components["schemas"]["BatchHistoryIncomingWithdrawalPayload"] | components["schemas"]["BatchHistoryOutgoingWithdrawalPayload"] | components["schemas"]["BatchHistoryPhotoCreatedPayload"] | components["schemas"]["BatchHistoryPhotoDeletedPayload"] | components["schemas"]["BatchHistoryQuantityEditedPayload"] | components["schemas"]["BatchHistoryStatusChangedPayload"]);
        BatchHistoryPayloadCommonProps: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** Format: int32 */
            version?: number;
        };
        BatchHistoryPhotoCreatedPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime"> & {
            /**
             * Format: int64
             * @description ID of the photo if it exists. Null if the photo has been deleted.
             */
            fileId?: number;
            /** @enum {string} */
            type: "PhotoCreated";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "PhotoCreated";
        };
        BatchHistoryPhotoDeletedPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime"> & {
            /** @enum {string} */
            type: "PhotoDeleted";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "PhotoDeleted";
        };
        /** @description A manual edit of a batch's remaining quantities. */
        BatchHistoryQuantityEditedPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime" | "version"> & {
            /** Format: int32 */
            activeGrowthQuantity: number;
            /** Format: int32 */
            germinatingQuantity: number;
            /** Format: int32 */
            hardeningOffQuantity: number;
            /** Format: int32 */
            notReadyQuantity: number;
            /** Format: int32 */
            readyQuantity: number;
            /** @enum {string} */
            type: "QuantityEdited";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "QuantityEdited";
        };
        /** @description The new quantities resulting from changing the statuses of seedlings in a batch. The values here are the total quantities remaining after the status change, not the number of seedlings whose statuses were changed. */
        BatchHistoryStatusChangedPayload: WithRequired<components["schemas"]["BatchHistoryPayloadCommonProps"], "createdBy" | "createdTime" | "version"> & {
            /** Format: int32 */
            activeGrowthQuantity: number;
            /** Format: int32 */
            germinatingQuantity: number;
            /** Format: int32 */
            hardeningOffQuantity: number;
            /** Format: int32 */
            notReadyQuantity: number;
            /** Format: int32 */
            readyQuantity: number;
            /** @enum {string} */
            type: "StatusChanged";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "StatusChanged";
        };
        BatchHistorySubLocationPayload: {
            /**
             * Format: int64
             * @description The ID of the sub-location if it still exists. If it was subsequently deleted, this will be null but the name will still be present.
             */
            id?: number;
            /** @description The name of the sub-location at the time the details were edited. If the sub-location was subsequently renamed or deleted, this name remains the same. */
            name: string;
        };
        BatchPayload: {
            /**
             * Format: int64
             * @description If this batch was created via a seed withdrawal, the ID of the seed accession it came from.
             */
            accessionId?: number;
            /** @description If this batch was created via a seed withdrawal, the accession number associated to the seed accession it came from. */
            accessionNumber?: string;
            /** Format: int32 */
            activeGrowthQuantity: number;
            /** Format: date */
            addedDate: string;
            batchNumber: string;
            /** Format: int64 */
            facilityId: number;
            /** Format: int32 */
            germinatingQuantity: number;
            /** Format: int32 */
            germinationRate?: number;
            /** Format: date */
            germinationStartedDate?: string;
            /** Format: int32 */
            hardeningOffQuantity: number;
            /** Format: int64 */
            id: number;
            /**
             * Format: int64
             * @description If this batch was created via a nursery transfer from another batch, the ID of the batch it came from.
             */
            initialBatchId?: number;
            /** Format: date-time */
            latestObservedTime: string;
            /** Format: int32 */
            lossRate?: number;
            /** Format: int32 */
            notReadyQuantity: number;
            notes?: string;
            /** Format: int64 */
            projectId?: number;
            /** Format: date */
            readyByDate?: string;
            /** Format: int32 */
            readyQuantity: number;
            /** Format: date */
            seedsSownDate?: string;
            /** Format: int64 */
            speciesId: number;
            subLocationIds: number[];
            /** @enum {string} */
            substrate?: "MediaMix" | "Soil" | "Sand" | "Moss" | "PerliteVermiculite" | "Other";
            substrateNotes?: string;
            /** Format: int32 */
            totalWithdrawn: number;
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            treatmentNotes?: string;
            /**
             * Format: int32
             * @description Increases every time a batch is updated. Must be passed as a parameter for certain kinds of write operations to detect when a batch has changed since the client last retrieved it.
             */
            version: number;
        };
        BatchPhotoPayload: {
            /** Format: int64 */
            id: number;
        };
        BatchResponsePayload: {
            batch: components["schemas"]["BatchPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        BatchWithdrawalPayload: {
            /** Format: int32 */
            activeGrowthQuantityWithdrawn: number;
            /** Format: int64 */
            batchId: number;
            /**
             * Format: int32
             * @default 0
             */
            germinatingQuantityWithdrawn: number;
            /**
             * Format: int32
             * @default 0
             */
            hardeningOffQuantityWithdrawn: number;
            /** Format: int32 */
            notReadyQuantityWithdrawn?: number;
            /** Format: int32 */
            readyQuantityWithdrawn: number;
        };
        BiomassDetailsSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "BiomassDetails";
        };
        BiomassQuadratSpeciesSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            scientificName?: string;
            /** Format: int64 */
            speciesId?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "BiomassQuadratSpecies";
        };
        BiomassQuadratSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "BiomassQuadrat";
        };
        /** @description List of herbaceous and tree species. Includes all recorded quadrat and additional herbaceous species and recorded tree species. Species not assigned to a quadrat or recorded trees will be saved as an additional herbaceous species. */
        BiomassSpeciesPayload: {
            commonName?: string;
            isInvasive: boolean;
            isThreatened: boolean;
            scientificName?: string;
            /** Format: int64 */
            speciesId?: number;
        };
        BiomassSpeciesSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
            scientificName?: string;
            /** Format: int64 */
            speciesId?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "BiomassSpecies";
        };
        BiomassSpeciesUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            isInvasive?: boolean;
            isThreatened?: boolean;
            /** @description Name of species to update. Either this or speciesId must be present. */
            scientificName?: string;
            /**
             * Format: int64
             * @description ID of species to update. Either this or scientificName must be present.
             */
            speciesId?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "BiomassSpecies";
        };
        BiomassUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            description?: string;
            /** @enum {string} */
            forestType?: "Terrestrial" | "Mangrove";
            /** Format: int32 */
            herbaceousCoverPercent?: number;
            ph?: number;
            salinity?: number;
            /** Format: int32 */
            smallTreeCountHigh?: number;
            /** Format: int32 */
            smallTreeCountLow?: number;
            soilAssessment?: string;
            /** @enum {string} */
            tide?: "Low" | "High";
            /** Format: date-time */
            tideTime?: string;
            /** Format: int32 */
            waterDepth?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Biomass";
        };
        /** @description Coordinate reference system used for X and Y coordinates in this geometry. By default, coordinates are in WGS 84, with longitude and latitude in degrees. In that case, this element is not present. Otherwise, it specifies which coordinate system to use. */
        CRS: {
            properties: components["schemas"]["CRSProperties"];
            /** @enum {string} */
            type: "name";
        };
        CRSProperties: {
            /**
             * @description Name of the coordinate reference system. This must be in the form EPSG:nnnn where nnnn is the numeric identifier of a coordinate system in the EPSG dataset. The default is Longitude/Latitude EPSG:4326, which is the coordinate system +for GeoJSON.
             * @example EPSG:4326
             */
            name: string;
        };
        ChangeBatchStatusRequestPayload: {
            /**
             * @description Which status to move seedlings to.
             * @enum {string}
             */
            newPhase?: "Germinating" | "ActiveGrowth" | "NotReady" | "HardeningOff" | "Ready";
            /**
             * @description Which status change to apply.
             * @enum {string}
             */
            operation?: "GerminatingToNotReady" | "NotReadyToReady";
            /**
             * @description Which status to move seedlings from.
             * @enum {string}
             */
            previousPhase?: "Germinating" | "ActiveGrowth" | "NotReady" | "HardeningOff" | "Ready";
            /**
             * Format: int32
             * @description Number of seedlings to move from one status to the next.
             */
            quantity: number;
        };
        CohortListResponsePayload: {
            cohorts: components["schemas"]["CohortPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        CohortModulePayload: {
            additionalResources?: string;
            /** Format: date */
            endDate: string;
            eventDescriptions: {
                [key: string]: string;
            };
            /** Format: int64 */
            id: number;
            isActive: boolean;
            name: string;
            overview?: string;
            preparationMaterials?: string;
            /** Format: date */
            startDate: string;
            title: string;
        };
        CohortPayload: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            modifiedBy: number;
            /** Format: date-time */
            modifiedTime: string;
            name: string;
            participantIds?: number[];
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
        };
        CohortResponsePayload: {
            cohort: components["schemas"]["CohortPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        CompleteAdHocObservationRequestPayload: {
            /** @description Biomass Measurements. Required for biomass measurement observations */
            biomassMeasurements?: components["schemas"]["NewBiomassMeasurementPayload"];
            conditions: ("AnimalDamage" | "FastGrowth" | "FavorableWeather" | "Fungus" | "Pests" | "SeedProduction" | "UnfavorableWeather" | "NaturalRegenerationWoody" | "Logging" | "Fire" | "Mining" | "Grazing" | "Infrastructure" | "ElectricalLines" | "SoilErosion" | "DifficultAccessibility" | "Contamination" | "SteepSlope" | "WaterBodies")[];
            notes?: string;
            /**
             * @description Observation type for this observation.
             * @enum {string}
             */
            observationType: "Monitoring" | "Biomass Measurements";
            /**
             * Format: date-time
             * @description Date and time the observation was performed in the field.
             */
            observedTime: string;
            /**
             * Format: int64
             * @description Which planting site this observation needs to be scheduled for.
             */
            plantingSiteId: number;
            /** @description Recorded plants. Required for monitoring observations. */
            plants?: components["schemas"]["RecordedPlantPayload"][];
            /** @description GPS coordinates for the South West corner of the ad-hoc plot. */
            swCorner: Omit<components["schemas"]["Point"], "type">;
        };
        CompleteAdHocObservationResponsePayload: {
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plotId: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CompletePlotObservationRequestPayload: {
            conditions: ("AnimalDamage" | "FastGrowth" | "FavorableWeather" | "Fungus" | "Pests" | "SeedProduction" | "UnfavorableWeather" | "NaturalRegenerationWoody" | "Logging" | "Fire" | "Mining" | "Grazing" | "Infrastructure" | "ElectricalLines" | "SoilErosion" | "DifficultAccessibility" | "Contamination" | "SteepSlope" | "WaterBodies")[];
            notes?: string;
            /**
             * Format: date-time
             * @description Date and time the observation was performed in the field.
             */
            observedTime: string;
            plants: components["schemas"]["RecordedPlantPayload"][];
        };
        CreateAcceleratorReportConfigRequestPayload: {
            config: components["schemas"]["NewAcceleratorReportConfigPayload"];
        };
        CreateAccessionRequestPayloadV2: {
            bagNumbers?: string[];
            /** Format: date */
            collectedDate?: string;
            collectionSiteCity?: string;
            collectionSiteCoordinates?: components["schemas"]["Geolocation"][];
            collectionSiteCountryCode?: string;
            collectionSiteCountrySubdivision?: string;
            collectionSiteLandowner?: string;
            collectionSiteName?: string;
            collectionSiteNotes?: string;
            /** @enum {string} */
            collectionSource?: "Wild" | "Reintroduced" | "Cultivated" | "Other";
            collectors?: string[];
            /** Format: int64 */
            facilityId?: number;
            notes?: string;
            plantId?: string;
            /**
             * Format: int32
             * @description Estimated number of plants the seeds were collected from.
             */
            plantsCollectedFrom?: number;
            /** Format: int64 */
            projectId?: number;
            /** Format: date */
            receivedDate?: string;
            /** @enum {string} */
            source?: "Web" | "Seed Collector App" | "File Import";
            /** Format: int64 */
            speciesId?: number;
            /** @enum {string} */
            state?: "Awaiting Check-In" | "Awaiting Processing" | "Processing" | "Drying" | "In Storage" | "Used Up";
            subLocation?: string;
        };
        CreateAccessionResponsePayloadV2: {
            accession: components["schemas"]["AccessionPayloadV2"];
            status: components["schemas"]["SuccessOrError"];
        };
        CreateActivityRequestPayload: {
            /** Format: date */
            date: string;
            description: string;
            /** Format: int64 */
            projectId: number;
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
        };
        CreateApplicationRequestPayload: {
            /** Format: int64 */
            projectId: number;
        };
        CreateApplicationResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateAutomationRequestPayload: {
            description?: string;
            /** Format: int64 */
            deviceId?: number;
            /** Format: int64 */
            facilityId: number;
            /** Format: double */
            lowerThreshold?: number;
            name: string;
            settings?: {
                [key: string]: unknown;
            };
            timeseriesName?: string;
            type: string;
            /** Format: double */
            upperThreshold?: number;
            /** Format: int32 */
            verbosity?: number;
        };
        CreateAutomationResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateBatchPhotoResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateBatchRequestPayload: {
            /** Format: int32 */
            activeGrowthQuantity: number;
            /** Format: date */
            addedDate: string;
            /** Format: int64 */
            facilityId: number;
            /** Format: int32 */
            germinatingQuantity: number;
            /** Format: date */
            germinationStartedDate?: string;
            /** Format: int32 */
            hardeningOffQuantity: number;
            notes?: string;
            /** Format: int64 */
            projectId?: number;
            /** Format: date */
            readyByDate?: string;
            /** Format: int32 */
            readyQuantity: number;
            /** Format: date */
            seedsSownDate?: string;
            /** Format: int64 */
            speciesId: number;
            subLocationIds?: number[];
            /** @enum {string} */
            substrate?: "MediaMix" | "Soil" | "Sand" | "Moss" | "PerliteVermiculite" | "Other";
            substrateNotes?: string;
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            treatmentNotes?: string;
        };
        CreateCohortRequestPayload: {
            name: string;
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
        };
        CreateDeviceRequestPayload: {
            /**
             * @description Protocol-specific address of device, e.g., an IP address or a Bluetooth device ID.
             * @example 192.168.1.100
             */
            address?: string;
            /**
             * Format: int64
             * @description Identifier of facility where this device is located.
             */
            facilityId: number;
            /**
             * @description Name of device manufacturer.
             * @example InHand Networks
             */
            make: string;
            /**
             * @description Model number or model name of the device.
             * @example IR915L
             */
            model: string;
            /**
             * @description Name of this device.
             * @example BMU-1
             */
            name: string;
            /**
             * Format: int64
             * @description ID of parent device such as a hub or gateway, if any. The parent device must exist.
             */
            parentId?: number;
            /**
             * Format: int32
             * @description Port number if relevant for the protocol.
             * @example 50000
             */
            port?: number;
            /**
             * @description Device manager protocol name.
             * @example modbus
             */
            protocol?: string;
            /** @description Protocol- and device-specific custom settings. This is an arbitrary JSON object; the exact settings depend on the device type. */
            settings?: {
                [key: string]: unknown;
            };
            /**
             * @description High-level type of the device. Device manager may use this in conjunction with the make and model to determine which metrics to report.
             * @example inverter
             */
            type: string;
            /**
             * Format: int32
             * @description Level of diagnostic information to log.
             */
            verbosity?: number;
        };
        CreateDocumentRequestPayload: {
            /** Format: int64 */
            documentTemplateId: number;
            name: string;
            /** Format: int64 */
            ownedBy: number;
            /** Format: int64 */
            projectId: number;
        };
        CreateDocumentResponsePayload: {
            document: components["schemas"]["DocumentPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        CreateDraftPlantingSiteRequestPayload: {
            /** @description In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
            data: {
                [key: string]: unknown;
            };
            description?: string;
            name: string;
            /**
             * Format: int32
             * @deprecated
             * @description Use numSubstrata instead
             */
            numPlantingSubzones?: number;
            /**
             * Format: int32
             * @deprecated
             * @description Use numStrata instead
             */
            numPlantingZones?: number;
            /**
             * Format: int32
             * @description If the user has started defining strata, the number of strata defined so far.
             */
            numStrata?: number;
            /**
             * Format: int32
             * @description If the user has started defining substrata, the number of substrata defined so far.
             */
            numSubstrata?: number;
            /** Format: int64 */
            organizationId: number;
            /**
             * Format: int64
             * @description If the draft is associated with a project, its ID.
             */
            projectId?: number;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        CreateDraftPlantingSiteResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateFacilityRequestPayload: {
            /** Format: date */
            buildCompletedDate?: string;
            /** Format: date */
            buildStartedDate?: string;
            /**
             * Format: int32
             * @description For nursery facilities, the number of plants this nursery is capable of holding.
             */
            capacity?: number;
            description?: string;
            name: string;
            /** Format: date */
            operationStartedDate?: string;
            /**
             * Format: int64
             * @description Which organization this facility belongs to.
             */
            organizationId: number;
            subLocationNames?: string[];
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
            /** @enum {string} */
            type: "Seed Bank" | "Desalination" | "Reverse Osmosis" | "Nursery";
        };
        CreateFacilityResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateFundingEntityRequestPayload: {
            name: string;
            projects?: number[];
        };
        CreateModuleEventRequestPayload: {
            /** Format: date-time */
            endTime?: string;
            /** @enum {string} */
            eventType: "One-on-One Session" | "Workshop" | "Live Session" | "Recorded Session";
            /** Format: uri */
            meetingUrl?: string;
            /** Format: int64 */
            moduleId: number;
            /** Format: uri */
            recordingUrl?: string;
            /** Format: uri */
            slidesUrl?: string;
            /** Format: date-time */
            startTime: string;
        };
        CreateModuleEventResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateNurseryTransferRequestPayload: {
            /** Format: int32 */
            activeGrowthQuantity: number;
            /** Format: date */
            date: string;
            /** Format: int64 */
            destinationFacilityId: number;
            /** Format: int32 */
            germinatingQuantity: number;
            /** Format: int32 */
            hardeningOffQuantity?: number;
            notes?: string;
            /** Format: date */
            readyByDate?: string;
            /** Format: int32 */
            readyQuantity: number;
            /**
             * Format: int64
             * @description ID of the user who withdrew the seeds. Default is the current user's ID. If non-null, the current user must have permission to read the referenced user's membership details in the organization.
             */
            withdrawnByUserId?: number;
        };
        CreateNurseryTransferResponsePayload: {
            /** @description Updated accession that includes a withdrawal for the nursery transfer. */
            accession: components["schemas"]["AccessionPayloadV2"];
            /** @description Details of newly-created seedling batch. */
            batch: components["schemas"]["BatchPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        CreateNurseryWithdrawalPhotoResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateNurseryWithdrawalRequestPayload: {
            batchWithdrawals: components["schemas"]["BatchWithdrawalPayload"][];
            /**
             * Format: int64
             * @description If purpose is "Nursery Transfer", the ID of the facility to transfer to. Must be in the same organization as the originating facility. Not allowed for purposes other than "Nursery Transfer".
             */
            destinationFacilityId?: number;
            /** Format: int64 */
            facilityId: number;
            notes?: string;
            /**
             * Format: int64
             * @description If purpose is "Out Plant", the ID of the planting site to which the seedlings were delivered.
             */
            plantingSiteId?: number;
            /**
             * Format: int64
             * @deprecated
             * @description Use substratumId instead
             */
            plantingSubzoneId?: number;
            /** @enum {string} */
            purpose: "Nursery Transfer" | "Dead" | "Out Plant" | "Other";
            /**
             * Format: date
             * @description If purpose is "Nursery Transfer", the estimated ready-by date to use for the batches that are created at the other nursery.
             */
            readyByDate?: string;
            /**
             * Format: int64
             * @description If purpose is "Out Plant", the ID of the substratum to which the seedlings were delivered. Must be specified if the planting site has substrata, but must be omitted or set to null if the planting site has no substrata.
             */
            substratumId?: number;
            /** Format: date */
            withdrawnDate: string;
        };
        CreateOrganizationRequestPayload: {
            /**
             * @description ISO 3166 alpha-2 code of organization's country.
             * @example AU
             */
            countryCode?: string;
            /**
             * @description ISO 3166-2 code of organization's country subdivision (state, province, region, etc.) This is the full ISO 3166-2 code including the country prefix. If this is set, countryCode must also be set.
             * @example US-HI
             */
            countrySubdivisionCode?: string;
            description?: string;
            managedLocationTypes?: ("SeedBank" | "Nursery" | "PlantingSite")[];
            name: string;
            /** @enum {string} */
            organizationType?: "Government" | "NGO" | "Arboreta" | "Academia" | "ForProfit" | "Other";
            /** @description Non-empty additional description of organization when type is Other. */
            organizationTypeDetails?: string;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
            /** @description Website of organization, no restrictions on format. */
            website?: string;
        };
        CreateOrganizationUserResponsePayload: {
            /**
             * Format: int64
             * @description The ID of the newly-added user.
             */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateParticipantProjectSpeciesPayload: {
            /** Format: int64 */
            projectId: number;
            rationale?: string;
            /** Format: int64 */
            speciesId: number;
            /** @enum {string} */
            speciesNativeCategory?: "Native" | "Non-native";
        };
        CreateParticipantRequestPayload: {
            /**
             * Format: int64
             * @description Assign the participant to this cohort. If null, the participant will not be assigned to any cohort initially.
             */
            cohortId?: number;
            name: string;
            /** @description Assign these projects to the new participant. If projects are already assigned to other participants, they will be reassigned to the new one. */
            projectIds?: number[];
        };
        CreatePlantingSiteRequestPayload: {
            boundary?: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
            description?: string;
            exclusion?: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
            name: string;
            /** Format: int64 */
            organizationId: number;
            plantingSeasons?: components["schemas"]["NewPlantingSeasonPayload"][];
            /**
             * @deprecated
             * @description Use strata instead
             */
            plantingZones?: components["schemas"]["NewPlantingZonePayload"][];
            /** Format: int64 */
            projectId?: number;
            /** @description List of strata to create. If present and not empty, "boundary" must also be specified. */
            strata?: components["schemas"]["NewStratumPayload"][];
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        CreatePlantingSiteResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateProjectMetricRequestPayload: {
            metric: components["schemas"]["NewMetricPayload"];
        };
        CreateProjectRequestPayload: {
            description?: string;
            name: string;
            /** Format: int64 */
            organizationId: number;
        };
        CreateProjectResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateSavedDocumentVersionRequestPayload: {
            isSubmitted?: boolean;
            name: string;
        };
        CreateSavedDocumentVersionResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            version: components["schemas"]["DocumentSavedVersionPayload"];
        };
        CreateSpeciesResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        CreateStandardMetricRequestPayload: {
            metric: components["schemas"]["NewMetricPayload"];
        };
        CreateSubLocationRequestPayload: {
            name: string;
        };
        CreateTimeseriesEntry: {
            /**
             * Format: int32
             * @description Number of significant fractional digits (after the decimal point), if this is a timeseries with non-integer numeric values.
             */
            decimalPlaces?: number;
            /**
             * Format: int64
             * @description ID of device that produces this timeseries.
             */
            deviceId: number;
            /** @description Name of this timeseries. Duplicate timeseries names for the same device aren't allowed, but different devices can have timeseries with the same name. */
            timeseriesName: string;
            /** @enum {string} */
            type: "Numeric" | "Text";
            /**
             * @description Units of measure for values in this timeseries.
             * @example volts
             */
            units?: string;
        };
        CreateTimeseriesRequestPayload: {
            timeseries: components["schemas"]["CreateTimeseriesEntry"][];
        };
        CreateViabilityTestRequestPayload: {
            /** Format: date */
            endDate?: string;
            notes?: string;
            /** @enum {string} */
            seedType?: "Fresh" | "Stored";
            /** Format: int32 */
            seedsCompromised?: number;
            /** Format: int32 */
            seedsEmpty?: number;
            /** Format: int32 */
            seedsFilled?: number;
            /** Format: int32 */
            seedsTested: number;
            /** Format: date */
            startDate?: string;
            /** @enum {string} */
            substrate?: "Nursery Media" | "Agar" | "Paper" | "Other" | "Sand" | "Media Mix" | "Soil" | "Moss" | "Perlite/Vermiculite" | "None";
            testResults?: components["schemas"]["ViabilityTestResultPayload"][];
            /** @enum {string} */
            testType: "Lab" | "Nursery" | "Cut";
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            /**
             * Format: int64
             * @description ID of user who withdrew seeds to perform the test. Defaults to the current user. If non-null, the current user must have permission to see the referenced user's membership details in the organization.
             */
            withdrawnByUserId?: number;
        };
        CreateWithdrawalRequestPayload: {
            /** Format: date */
            date?: string;
            notes?: string;
            /** @enum {string} */
            purpose?: "Other" | "Viability Testing" | "Out-planting" | "Nursery";
            /**
             * Format: int64
             * @description ID of the user who withdrew the seeds. Default is the current user's ID. If non-null, the current user must have permission to read the referenced user's membership details in the organization.
             */
            withdrawnByUserId?: number;
            /** @description Quantity of seeds withdrawn. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
            withdrawnQuantity?: components["schemas"]["SeedQuantityPayload"];
        };
        CreatedActionPayload: Omit<components["schemas"]["EventActionPayload"], "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Created";
        };
        DateVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Date";
        };
        DeleteFundersRequestPayload: {
            userIds: number[];
        };
        DeleteGlobalRolesRequestPayload: {
            userIds: number[];
        };
        DeleteParticipantProjectSpeciesPayload: {
            participantProjectSpeciesIds: number[];
        };
        DeleteProjectVotesRequestPayload: {
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            /** @description A safeguard flag that must be set to `true` for deleting all voters in a project phase.  */
            phaseDelete?: boolean;
            /**
             * Format: int64
             * @description If set to `null`, all voters in the phase will be removed.
             */
            userId?: number;
        };
        /** @description Operation that deletes a value from a variable. Deletion is non-destructive; this actually creates a new value with its own value ID, where the new value is marked as deleted. This "is deleted" value is included in incremental value query results.
         *
         *     If the variable is a list and there are other values with higher list positions, the remaining items will be renumbered such that the list remains contiguously numbered starting at 0.
         *
         *     If the variable is a table, or in other words if the value is a table row, any values associated with the row are also deleted. The row itself gets a new value that is marked as deleted, and the new values that are created to delete the row's contents are associated with this newly-created deleted row value. */
        DeleteValueOperationPayload: Omit<WithRequired<components["schemas"]["ValueOperationPayload"], "existingValueId">, "operation"> & {
            /** Format: int64 */
            valueId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "Delete";
        };
        DeletedActionPayload: Omit<components["schemas"]["EventActionPayload"], "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Deleted";
        };
        DeliverablePayload: {
            /** @enum {string} */
            category: "Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files";
            /** @description Optional description of the deliverable in HTML form. */
            descriptionHtml?: string;
            documents: components["schemas"]["SubmissionDocumentPayload"][];
            /**
             * Format: date
             * @description If the deliverable has been reviewed, the user-visible feedback from the review.
             */
            dueDate?: string;
            feedback?: string;
            /** Format: int64 */
            id: number;
            /** @description Internal-only comment on the submission. Only present if the current user has accelerator admin privileges. */
            internalComment?: string;
            name: string;
            /** Format: int64 */
            organizationId: number;
            organizationName: string;
            /** Format: int64 */
            participantId?: number;
            participantName?: string;
            /** Format: int32 */
            position: number;
            projectDealName?: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
            required: boolean;
            sensitive: boolean;
            /** @enum {string} */
            status: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
            /** Format: uri */
            templateUrl?: string;
            /** @enum {string} */
            type: "Document" | "Species" | "Questions";
        };
        /** @description If the withdrawal was an outplanting to a planting site, the delivery that was created. Not present for other withdrawal purposes. */
        DeliveryPayload: {
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            plantingSiteId: number;
            plantings: components["schemas"]["PlantingPayload"][];
            /** Format: int64 */
            withdrawalId: number;
        };
        DeviceConfig: {
            /**
             * @description Protocol-specific address of device, e.g., an IP address or a Bluetooth device ID.
             * @example 192.168.1.100
             */
            address?: string;
            /**
             * Format: int64
             * @description Identifier of facility where this device is located.
             */
            facilityId: number;
            /**
             * Format: int64
             * @description Unique identifier of this device.
             */
            id: number;
            /**
             * @description Name of device manufacturer.
             * @example InHand Networks
             */
            make: string;
            /**
             * @description Model number or model name of the device.
             * @example IR915L
             */
            model: string;
            /**
             * @description Name of this device.
             * @example BMU-1
             */
            name: string;
            /**
             * Format: int64
             * @description ID of parent device such as a hub or gateway, if any.
             */
            parentId?: number;
            /**
             * Format: int32
             * @description Port number if relevant for the protocol.
             * @example 50000
             */
            port?: number;
            /**
             * @description Device manager protocol name.
             * @example modbus
             */
            protocol?: string;
            settings?: Record<string, never>;
            /**
             * @description High-level type of the device. Device manager may use this in conjunction with the make and model to determine which metrics to report.
             * @example inverter
             */
            type: string;
            /**
             * Format: int32
             * @description Level of diagnostic information to log.
             */
            verbosity?: number;
        };
        DeviceUnresponsiveRequestPayload: {
            /**
             * Format: int32
             * @description The expected amount of time between updates from the device. Null or absent if there is no fixed update interval.
             */
            expectedIntervalSecs?: number;
            /**
             * Format: date-time
             * @description When the device most recently responded. Null or absent if the device has never responded.
             */
            lastRespondedTime?: string;
        };
        DisclaimerPayload: {
            /** Format: date-time */
            acceptedOn?: string;
            content: string;
            /** Format: date-time */
            effectiveOn: string;
        };
        /** @description History entry about the creation of the document. This is always the last element in the reverse-chronological list of history events. It has the same information as the createdBy and createdTime fields in DocumentPayload. */
        DocumentHistoryCreatedPayload: Omit<WithRequired<components["schemas"]["DocumentHistoryPayload"], "createdBy" | "createdTime" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Created";
        };
        /** @description History entry about a document being edited. This represents the most recent edit by the given user; if the same user edits the document multiple times in a row, only the last edit will be listed in the history. */
        DocumentHistoryEditedPayload: Omit<WithRequired<components["schemas"]["DocumentHistoryPayload"], "createdBy" | "createdTime" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Edited";
        };
        DocumentHistoryPayload: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** @enum {string} */
            type: "Created" | "Edited" | "Saved";
        };
        /** @description History entry about a saved version of a document. The maxVariableValueId and variableManifestId may be used to retrieve the contents of the saved version. */
        DocumentHistorySavedPayload: Omit<WithRequired<components["schemas"]["DocumentHistoryPayload"], "createdBy" | "createdTime" | "type">, "type"> & {
            isSubmitted: boolean;
            /** Format: int64 */
            maxVariableValueId: number;
            name: string;
            /** Format: int64 */
            variableManifestId: number;
            /** Format: int64 */
            versionId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Saved";
        };
        DocumentPayload: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** Format: int64 */
            documentTemplateId: number;
            documentTemplateName: string;
            /** Format: int64 */
            id: number;
            internalComment?: string;
            /** Format: int64 */
            lastSavedVersionId?: number;
            /** Format: int64 */
            modifiedBy: number;
            /** Format: date-time */
            modifiedTime: string;
            name: string;
            /** Format: int64 */
            ownedBy: number;
            projectDealName?: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
            /** @enum {string} */
            status: "Draft" | "Locked" | "Published" | "Ready" | "Submitted";
            /** Format: int64 */
            variableManifestId: number;
        };
        /** @description Information about a saved version of a document. The maxVariableValueId and variableManifestId may be used to retrieve the contents of the saved version. */
        DocumentSavedVersionPayload: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            isSubmitted: boolean;
            /** Format: int64 */
            maxVariableValueId: number;
            name: string;
            /** Format: int64 */
            variableManifestId: number;
            /** Format: int64 */
            versionId: number;
        };
        DocumentTemplatePayload: {
            /** Format: int64 */
            id: number;
            name: string;
            /**
             * Format: int64
             * @description ID of the most recent variable manifest for the document template, if any.
             */
            variableManifestId?: number;
        };
        DraftPlantingSitePayload: {
            /**
             * Format: int64
             * @description ID of the user who created this draft. Only that user is allowed to modify or delete the draft.
             */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            /** @description In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
            data: {
                [key: string]: unknown;
            };
            description?: string;
            /** Format: int64 */
            id: number;
            /** Format: date-time */
            modifiedTime: string;
            name: string;
            /**
             * Format: int32
             * @deprecated
             * @description Use numSubstrata instead.
             */
            numPlantingSubzones?: number;
            /**
             * Format: int32
             * @deprecated
             * @description Use numStrata instead.
             */
            numPlantingZones?: number;
            /**
             * Format: int32
             * @description If the user has started defining strata, the number of strata defined so far.
             */
            numStrata?: number;
            /**
             * Format: int32
             * @description If the user has started defining substrata, the number of substrata defined so far.
             */
            numSubstrata?: number;
            /** Format: int64 */
            organizationId: number;
            /**
             * Format: int64
             * @description If the draft is associated with a project, its ID.
             */
            projectId?: number;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        EmailVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Email";
        };
        ErrorDetails: {
            message: string;
        };
        EventActionPayload: {
            type: string;
        };
        EventLogEntryPayload: {
            action: components["schemas"]["CreatedActionPayload"] | components["schemas"]["DeletedActionPayload"] | components["schemas"]["FieldUpdatedActionPayload"];
            subject: components["schemas"]["BiomassDetailsSubjectPayload"] | components["schemas"]["BiomassQuadratSpeciesSubjectPayload"] | components["schemas"]["BiomassQuadratSubjectPayload"] | components["schemas"]["BiomassSpeciesSubjectPayload"] | components["schemas"]["ObservationPlotMediaSubjectPayload"] | components["schemas"]["ObservationPlotSubjectPayload"] | components["schemas"]["OrganizationSubjectPayload"] | components["schemas"]["ProjectSubjectPayload"] | components["schemas"]["RecordedTreeSubjectPayload"];
            /** Format: date-time */
            timestamp: string;
            /** Format: int64 */
            userId: number;
            userName: string;
        };
        EventSubjectPayload: {
            /** @description If this is true, the entity referred to by this subject has been deleted. This property will be omitted if the entity still exists, i.e., this property will always be true if it exists. */
            deleted?: boolean;
            /**
             * @description A localized extended human-readable description of the subject of the event, suitable for display in cases where events for many subjects are being shown in the same list.
             * @example Project Backyard Garden
             */
            fullText: string;
            /**
             * @description A localized short human-readable name (often a single word) for the subject of the event, suitable for display in cases where only events for a single subject are being shown or where the subject doesn't need to be distinguished from others of the same type.
             * @example Project
             */
            shortText: string;
            type: string;
        };
        ExistingAcceleratorReportConfigPayload: {
            /** Format: int64 */
            configId: number;
            /** @enum {string} */
            frequency: "Quarterly" | "Annual";
            /** Format: uri */
            logframeUrl?: string;
            /** Format: int64 */
            projectId: number;
            /** Format: date */
            reportingEndDate: string;
            /** Format: date */
            reportingStartDate: string;
        };
        ExistingBiomassMeasurementPayload: {
            additionalSpecies: components["schemas"]["BiomassSpeciesPayload"][];
            description?: string;
            /** @enum {string} */
            forestType: "Terrestrial" | "Mangrove";
            /** Format: int32 */
            herbaceousCoverPercent: number;
            ph?: number;
            quadrats: components["schemas"]["ExistingBiomassQuadratPayload"][];
            /** @description Measured in ppt */
            salinity?: number;
            /** Format: int32 */
            smallTreeCountHigh: number;
            /** Format: int32 */
            smallTreeCountLow: number;
            soilAssessment: string;
            /**
             * @description Low or high tide.
             * @enum {string}
             */
            tide?: "Low" | "High";
            /**
             * Format: date-time
             * @description Time when ide is observed.
             */
            tideTime?: string;
            /** Format: int32 */
            treeSpeciesCount: number;
            trees: components["schemas"]["ExistingTreePayload"][];
            /**
             * Format: int32
             * @description Measured in centimeters.
             */
            waterDepth?: number;
        };
        ExistingBiomassQuadratPayload: {
            description?: string;
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            species: components["schemas"]["ExistingBiomassQuadratSpeciesPayload"][];
        };
        ExistingBiomassQuadratSpeciesPayload: {
            /** Format: int32 */
            abundancePercent: number;
            isInvasive: boolean;
            isThreatened: boolean;
            /** Format: int64 */
            speciesId?: number;
            speciesName?: string;
        };
        ExistingDateValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            /** Format: date */
            dateValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Date";
        };
        /** @description Represents the deletion of an earlier value at the same location. This is only included when you are querying for incremental changes to a document's values. */
        ExistingDeletedValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Deleted";
        };
        ExistingEmailValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            emailValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Email";
        };
        /** @description Metadata about an image. The actual image data (e.g., the JPEG or PNG file) must be retrieved in a separate request using the value ID in this payload. */
        ExistingImageValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            caption?: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Image";
        };
        ExistingLinkValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            title?: string;
            /** Format: uri */
            url: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Link";
        };
        ExistingNumberValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            numberValue: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Number";
        };
        ExistingProjectMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            /** Format: int64 */
            id: number;
            isPublishable: boolean;
            name: string;
            /** Format: int64 */
            projectId: number;
            reference: string;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
            unit?: string;
        };
        ExistingSectionTextValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            textValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "SectionText";
        };
        ExistingSectionVariableValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            /** @enum {string} */
            displayStyle?: "Inline" | "Block";
            /** @enum {string} */
            usageType: "Injection" | "Reference";
            /** Format: int64 */
            variableId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "SectionVariable";
        };
        ExistingSelectValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            optionValues: number[];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Select";
        };
        ExistingStandardMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            /** Format: int64 */
            id: number;
            isPublishable: boolean;
            name: string;
            reference: string;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
            unit?: string;
        };
        /** @description A row in a table. Each row has its own value ID. ExistingVariableValuesPayload includes this ID for values of variables that are defined as columns of a table. */
        ExistingTableValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Table";
        };
        ExistingTextValuePayload: Omit<WithRequired<components["schemas"]["ExistingValuePayload"], "id" | "listPosition" | "type">, "type"> & {
            textValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Text";
        };
        ExistingTreePayload: {
            description?: string;
            /** @description Measured in centimeters. */
            diameterAtBreastHeight?: number;
            gpsCoordinates?: components["schemas"]["Point"];
            /** @description Measured in meters. */
            height?: number;
            /** Format: int64 */
            id: number;
            isDead: boolean;
            isInvasive: boolean;
            isThreatened: boolean;
            /** @description Measured in meters. */
            pointOfMeasurement?: number;
            /** Format: int32 */
            shrubDiameter?: number;
            /** Format: int64 */
            speciesId?: number;
            speciesName?: string;
            /** @enum {string} */
            treeGrowthForm: "Tree" | "Shrub" | "Trunk";
            /** Format: int32 */
            treeNumber: number;
            /** Format: int32 */
            trunkNumber: number;
        };
        ExistingValuePayload: {
            citation?: string;
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            listPosition: number;
            /** @enum {string} */
            type: "Date" | "Deleted" | "Email" | "Image" | "Link" | "Number" | "SectionText" | "SectionVariable" | "Select" | "Table" | "Text";
        };
        ExistingVariableValuesPayload: {
            /** @description User-visible feedback from reviewer. Not populated for table cell values. */
            feedback?: string;
            /** @description Internal comment from reviewer. Only populated if the current user has permission to read internal comments. Not populated for table cell values. */
            internalComment?: string;
            /**
             * Format: int64
             * @description If this is the value of a table cell, the ID of the row it's part of.
             */
            rowValueId?: number;
            /**
             * @description Current status of this variable. Not populated for table cell values.
             * @enum {string}
             */
            status?: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Incomplete" | "Complete";
            /** @description Values of this variable or this table cell. When getting the full set of values for a document, this will be the complete list of this variable's values in order of list position. When getting incremental changes to a document, this is only the items that have changed, and existing items won't be present. For example, if a variable is a list and has 3 values, and a fourth value is added, the incremental list of values in this payload will have one item and its list position will be 3 (since lists are 0-indexed). */
            values: (components["schemas"]["ExistingDateValuePayload"] | components["schemas"]["ExistingDeletedValuePayload"] | components["schemas"]["ExistingEmailValuePayload"] | components["schemas"]["ExistingImageValuePayload"] | components["schemas"]["ExistingLinkValuePayload"] | components["schemas"]["ExistingNumberValuePayload"] | components["schemas"]["ExistingSectionTextValuePayload"] | components["schemas"]["ExistingSectionVariableValuePayload"] | components["schemas"]["ExistingSelectValuePayload"] | components["schemas"]["ExistingTableValuePayload"] | components["schemas"]["ExistingTextValuePayload"])[];
            /** Format: int64 */
            variableId: number;
        };
        FacilityPayload: {
            /** Format: date */
            buildCompletedDate?: string;
            /** Format: date */
            buildStartedDate?: string;
            /**
             * Format: int32
             * @description For nursery facilities, the number of plants this nursery is capable of holding.
             */
            capacity?: number;
            /** @enum {string} */
            connectionState: "Not Connected" | "Connected" | "Configured";
            /** Format: date-time */
            createdTime: string;
            description?: string;
            /**
             * Format: int32
             * @description Short numeric identifier for this facility. Facility numbers start at 1 for each facility type in an organization.
             */
            facilityNumber: number;
            /** Format: int64 */
            id: number;
            name: string;
            /** Format: date */
            operationStartedDate?: string;
            /** Format: int64 */
            organizationId: number;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
            /** @enum {string} */
            type: "Seed Bank" | "Desalination" | "Reverse Osmosis" | "Nursery";
        };
        FieldNodePayload: Omit<components["schemas"]["SearchNodePayload"], "operation"> & {
            field: string;
            /**
             * @default Exact
             * @enum {string}
             */
            type: "Exact" | "ExactOrFuzzy" | "Fuzzy" | "PhraseMatch" | "Range";
            /** @description List of values to match. For exact, fuzzy and phrase match searches, a list of at least one value to search for; the list may include null to match accessions where the field does not have a value. For range searches, the list must contain exactly two values, the minimum and maximum; one of the values may be null to search for all values above a minimum or below a maximum. */
            values: (string | null)[];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "field";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "field";
        };
        FieldUpdatedActionPayload: Omit<components["schemas"]["EventActionPayload"], "type"> & {
            changedFrom?: string[];
            changedTo?: string[];
            fieldName: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "FieldUpdated";
        };
        FieldValuesPayload: {
            /** @description If true, the list of values is too long to return in its entirety and "values" is a partial list. */
            partial: boolean;
            /** @description List of values in the matching accessions. If there are accessions where the field has no value, this list will contain null (an actual null value, not the string "null"). */
            values: (string | null)[];
        };
        FunderActivityMediaFilePayload: {
            caption?: string;
            /** Format: date */
            capturedDate: string;
            /** Format: int64 */
            fileId: number;
            fileName: string;
            geolocation?: components["schemas"]["Point"];
            isCoverPhoto: boolean;
            isHiddenOnMap: boolean;
            /** Format: int32 */
            listPosition: number;
            /** @enum {string} */
            type: "Photo" | "Video";
        };
        FunderActivityPayload: {
            /** Format: date */
            date: string;
            description?: string;
            /** Format: int64 */
            id: number;
            isHighlight: boolean;
            media: components["schemas"]["FunderActivityMediaFilePayload"][];
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
        };
        FunderListActivitiesResponsePayload: {
            activities: components["schemas"]["FunderActivityPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        FunderPayload: {
            accountCreated: boolean;
            /** Format: date-time */
            createdTime: string;
            email: string;
            firstName?: string;
            lastName?: string;
            /** Format: int64 */
            userId: number;
        };
        FunderProjectDetailsPayload: {
            accumulationRate?: number;
            annualCarbon?: number;
            carbonCertifications: "CCB Standard"[];
            confirmedReforestableLand?: number;
            countryAlpha3?: string;
            countryCode?: string;
            dealDescription?: string;
            dealName?: string;
            landUseModelHectares: {
                [key: string]: number;
            };
            landUseModelTypes: ("Native Forest" | "Monoculture" | "Sustainable Timber" | "Other Timber" | "Mangroves" | "Agroforestry" | "Silvopasture" | "Other Land-Use Model")[];
            methodologyNumber?: string;
            metricProgress: components["schemas"]["MetricProgressPayload"][];
            minProjectArea?: number;
            /** Format: int32 */
            numNativeSpecies?: number;
            perHectareBudget?: number;
            projectArea?: number;
            /** Format: int64 */
            projectHighlightPhotoValueId?: number;
            /** Format: int64 */
            projectId: number;
            /** Format: int64 */
            projectZoneFigureValueId?: number;
            sdgList: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[];
            standard?: string;
            totalExpansionPotential?: number;
            totalVCU?: number;
            /** Format: uri */
            verraLink?: string;
        };
        FundingEntityPayload: {
            /** Format: int64 */
            id: number;
            name: string;
            projects: components["schemas"]["FundingProjectPayload"][];
        };
        FundingProjectPayload: {
            dealName: string;
            /** Format: int64 */
            projectId: number;
        };
        Geolocation: {
            accuracy?: number;
            latitude: number;
            longitude: number;
        };
        /** @description GEOMETRY-FIX-TYPE-ON-CLIENT-SIDE */
        Geometry: {
            crs?: components["schemas"]["CRS"];
            /** @enum {string} */
            type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon" | "GeometryCollection";
        };
        GeometryCollection: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            geometries: (components["schemas"]["GeometryCollection"] | components["schemas"]["LineString"] | components["schemas"]["MultiLineString"] | components["schemas"]["MultiPoint"] | components["schemas"]["MultiPolygon"] | components["schemas"]["Point"] | components["schemas"]["Polygon"])[];
            /** @enum {string} */
            type: "GeometryCollection";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "GeometryCollection";
        };
        GetAcceleratorReportResponsePayload: {
            report: components["schemas"]["AcceleratorReportPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetAccessionHistoryResponsePayload: {
            /** @description History of changes in descending time order (newest first.) */
            history: components["schemas"]["AccessionHistoryEntryPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetAccessionResponsePayloadV2: {
            accession: components["schemas"]["AccessionPayloadV2"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetActivityResponsePayload: {
            activity: components["schemas"]["ActivityPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetAllSiteT0DataSetResponsePayload: {
            allSet: boolean;
            status: components["schemas"]["SuccessOrError"];
        };
        GetApplicationDeliverablesResponsePayload: {
            deliverables: components["schemas"]["ApplicationDeliverablePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetApplicationHistoryResponsePayload: {
            /** @description History of metadata changes in reverse chronological order. */
            history: components["schemas"]["ApplicationHistoryPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetApplicationModulesResponsePayload: {
            modules: components["schemas"]["ApplicationModulePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetApplicationResponsePayload: {
            application: components["schemas"]["ApplicationPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetAutomationResponsePayload: {
            automation: components["schemas"]["AutomationPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetBatchHistoryResponsePayload: {
            history: components["schemas"]["BatchHistoryPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetCohortModuleResponsePayload: {
            module: components["schemas"]["CohortModulePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetCountryBorderResponsePayload: {
            border: components["schemas"]["MultiPolygon"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetCurrentTimeResponsePayload: {
            /** Format: date-time */
            currentTime: string;
            status: components["schemas"]["SuccessOrError"];
        };
        GetDeliverableResponsePayload: {
            deliverable: components["schemas"]["DeliverablePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetDeliveryResponsePayload: {
            delivery: components["schemas"]["DeliveryPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetDeviceResponsePayload: {
            device: components["schemas"]["DeviceConfig"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetDisclaimerResponse: {
            disclaimer?: components["schemas"]["DisclaimerPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetDocumentHistoryResponsePayload: {
            /** @description List of events in the document's history in reverse chronological order. The last element is always the "Created" event. */
            history: (components["schemas"]["DocumentHistoryCreatedPayload"] | components["schemas"]["DocumentHistoryEditedPayload"] | components["schemas"]["DocumentHistorySavedPayload"])[];
            status: components["schemas"]["SuccessOrError"];
        };
        GetDocumentResponsePayload: {
            document: components["schemas"]["DocumentPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetDraftPlantingSiteResponsePayload: {
            site: components["schemas"]["DraftPlantingSitePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetEventResponsePayload: {
            event: components["schemas"]["ModuleEvent"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetFacilityResponse: {
            facility: components["schemas"]["FacilityPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetFundersResponsePayload: {
            funders: components["schemas"]["FunderPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetFundingEntityResponsePayload: {
            fundingEntity: components["schemas"]["FundingEntityPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetFundingProjectResponsePayload: {
            details?: components["schemas"]["FunderProjectDetailsPayload"];
            projects: components["schemas"]["FunderProjectDetailsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetMapboxTokenResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            token: string;
        };
        GetModuleResponsePayload: {
            module: components["schemas"]["ModulePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetMuxStreamResponsePayload: {
            playbackId: string;
            playbackToken: string;
            status: components["schemas"]["SuccessOrError"];
        };
        GetNotificationResponsePayload: {
            notification: components["schemas"]["NotificationPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetNotificationsCountResponsePayload: {
            notifications: components["schemas"]["NotificationCountPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetNotificationsResponsePayload: {
            notifications: components["schemas"]["NotificationPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetNurserySummaryResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            summary: components["schemas"]["NurserySummaryPayload"];
        };
        GetNurseryV1: {
            /** Format: date */
            buildCompletedDate?: string;
            buildCompletedDateEditable: boolean;
            /** Format: date */
            buildStartedDate?: string;
            buildStartedDateEditable: boolean;
            /** Format: int32 */
            capacity?: number;
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            mortalityRate: number;
            name: string;
            notes?: string;
            /** Format: date */
            operationStartedDate?: string;
            operationStartedDateEditable: boolean;
            selected: boolean;
            /** Format: int64 */
            totalPlantsPropagated: number;
            /** Format: int64 */
            totalPlantsPropagatedForProject?: number;
            workers: components["schemas"]["WorkersPayloadV1"];
        };
        GetNurseryWithdrawalResponsePayload: {
            batches: components["schemas"]["BatchPayload"][];
            /** @description If the withdrawal was an outplanting to a planting site, the delivery that was created. Not present for other withdrawal purposes. */
            delivery?: components["schemas"]["DeliveryPayload"];
            status: components["schemas"]["SuccessOrError"];
            withdrawal: components["schemas"]["NurseryWithdrawalPayload"];
        };
        GetObservationResponsePayload: {
            observation: components["schemas"]["ObservationPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetObservationResultsResponsePayload: {
            observation: components["schemas"]["ObservationResultsPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetOneAssignedPlotResponsePayload: {
            plot: components["schemas"]["AssignedPlotPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetOrganizationNurserySummaryResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            summary: components["schemas"]["OrganizationNurserySummaryPayload"];
        };
        GetOrganizationResponsePayload: {
            organization: components["schemas"]["OrganizationPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetOrganizationUserResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            user: components["schemas"]["OrganizationUserPayload"];
        };
        GetParticipantProjectSpeciesResponsePayload: {
            participantProjectSpecies: components["schemas"]["ParticipantProjectSpeciesPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetParticipantProjectsForSpeciesResponsePayload: {
            participantProjectsForSpecies: components["schemas"]["ParticipantProjectForSpeciesPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetParticipantResponsePayload: {
            participant: components["schemas"]["ParticipantPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetPlantingSiteHistoryResponsePayload: {
            site: components["schemas"]["PlantingSiteHistoryPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetPlantingSiteReportedPlantsResponsePayload: {
            site: components["schemas"]["PlantingSiteReportedPlantsPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetPlantingSiteResponsePayload: {
            site: components["schemas"]["PlantingSitePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetPlantingSiteSpeciesV1: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            mortalityRateInField?: number;
            /** Format: int32 */
            totalPlanted?: number;
        };
        GetPlantingSiteV1: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            mortalityRate?: number;
            name: string;
            notes?: string;
            selected: boolean;
            species: components["schemas"]["GetPlantingSiteSpeciesV1"][];
            /** Format: int32 */
            totalPlantedArea?: number;
            /** Format: int32 */
            totalPlantingSiteArea?: number;
            /** Format: int32 */
            totalPlantsPlanted?: number;
            /** Format: int32 */
            totalTreesPlanted?: number;
            workers: components["schemas"]["WorkersPayloadV1"];
        };
        GetProjectAcceleratorDetailsResponsePayload: {
            details: components["schemas"]["ProjectAcceleratorDetailsPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetProjectOverallScoreResponsePayload: {
            score: components["schemas"]["ProjectOverallScorePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetProjectResponsePayload: {
            project: components["schemas"]["ProjectPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetProjectScoresResponsePayload: {
            phases: components["schemas"]["PhaseScores"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetProjectVotesResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            votes: components["schemas"]["ProjectVotesPayload"];
        };
        GetPublishedProjectResponsePayload: {
            projects: components["schemas"]["PublishedProjectPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetReportPayload: {
            /** Format: int64 */
            id: number;
            lockedByName?: string;
            /** Format: int64 */
            lockedByUserId?: number;
            /** Format: date-time */
            lockedTime?: string;
            modifiedByName?: string;
            /** Format: int64 */
            modifiedByUserId?: number;
            /** Format: date-time */
            modifiedTime?: string;
            /** Format: int64 */
            projectId?: number;
            projectName?: string;
            /** Format: int32 */
            quarter: number;
            /** @enum {string} */
            status: "New" | "In Progress" | "Locked" | "Submitted";
            submittedByName?: string;
            /** Format: int64 */
            submittedByUserId?: number;
            /** Format: date-time */
            submittedTime?: string;
            version: string;
            /** Format: int32 */
            year: number;
        };
        GetReportPayloadV1: Omit<WithRequired<components["schemas"]["GetReportPayload"], "id" | "quarter" | "status" | "year">, "version"> & {
            annualDetails?: components["schemas"]["AnnualDetailsPayloadV1"];
            isAnnual: boolean;
            notes?: string;
            nurseries: components["schemas"]["GetNurseryV1"][];
            organizationName: string;
            plantingSites: components["schemas"]["GetPlantingSiteV1"][];
            seedBanks: components["schemas"]["GetSeedBankV1"][];
            summaryOfProgress?: string;
            /** Format: int32 */
            totalNurseries: number;
            /** Format: int32 */
            totalPlantingSites: number;
            /** Format: int32 */
            totalSeedBanks: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            version: "1";
        };
        GetReportResponsePayload: {
            report: components["schemas"]["GetReportPayloadV1"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetReportSettingsResponsePayload: {
            /** @description If false, settings have not been configured yet and the values in the rest of the payload are the defaults. */
            isConfigured: boolean;
            /** @description If true, organization-level reports are enabled. */
            organizationEnabled: boolean;
            /** @description Per-project report settings. */
            projects: components["schemas"]["ProjectReportSettingsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetSavedDocumentVersionResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            version: components["schemas"]["DocumentSavedVersionPayload"];
        };
        GetSeedBankV1: {
            /** Format: date */
            buildCompletedDate?: string;
            buildCompletedDateEditable: boolean;
            /** Format: date */
            buildStartedDate?: string;
            buildStartedDateEditable: boolean;
            /** Format: int64 */
            id: number;
            name: string;
            notes?: string;
            /** Format: date */
            operationStartedDate?: string;
            operationStartedDateEditable: boolean;
            selected: boolean;
            /** Format: int64 */
            totalSeedsStored: number;
            /** Format: int64 */
            totalSeedsStoredForProject?: number;
            workers: components["schemas"]["WorkersPayloadV1"];
        };
        GetSitePlotSpeciesResponsePayload: {
            plots: components["schemas"]["PlotSpeciesDensitiesPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetSiteT0DataResponsePayload: {
            data: components["schemas"]["SiteT0DataResponsePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetSpeciesForParticipantProjectsResponsePayload: {
            speciesForParticipantProjects: components["schemas"]["SpeciesForParticipantProjectPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        GetSpeciesProblemResponsePayload: {
            problem: components["schemas"]["SpeciesProblemElement"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetSpeciesResponsePayload: {
            species: components["schemas"]["SpeciesResponseElement"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetSpeciesSummaryResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            summary: components["schemas"]["SpeciesSummaryPayload"];
        };
        GetSubLocationResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            subLocation: components["schemas"]["SubLocationPayload"];
        };
        GetUploadStatusDetailsPayload: {
            errors?: components["schemas"]["UploadProblemPayload"][];
            /** @description True if the server is finished processing the file, either successfully or not. */
            finished: boolean;
            /** Format: int64 */
            id: number;
            /** @enum {string} */
            status: "Receiving" | "Validating" | "Processing" | "Completed" | "Processing Failed" | "Invalid" | "Receiving Failed" | "Awaiting Validation" | "Awaiting User Action" | "Awaiting Processing";
            warnings?: components["schemas"]["UploadProblemPayload"][];
        };
        GetUploadStatusResponsePayload: {
            details: components["schemas"]["GetUploadStatusDetailsPayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        GetUserInternalInterestsResponsePayload: {
            internalInterests: ("Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files" | "Sourcing")[];
            status: components["schemas"]["SuccessOrError"];
        };
        GetUserPreferencesResponsePayload: {
            /** @description The user's preferences, or null if no preferences have been stored yet. */
            preferences?: {
                [key: string]: unknown;
            };
            status: components["schemas"]["SuccessOrError"];
        };
        GetUserResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            user: components["schemas"]["UserProfilePayload"];
        };
        GetVariableWorkflowHistoryResponsePayload: {
            history: components["schemas"]["VariableWorkflowHistoryElement"][];
            status: components["schemas"]["SuccessOrError"];
            variable: components["schemas"]["DateVariablePayload"] | components["schemas"]["EmailVariablePayload"] | components["schemas"]["ImageVariablePayload"] | components["schemas"]["LinkVariablePayload"] | components["schemas"]["NumberVariablePayload"] | components["schemas"]["SectionVariablePayload"] | components["schemas"]["SelectVariablePayload"] | components["schemas"]["TableVariablePayload"] | components["schemas"]["TextVariablePayload"];
        };
        GetViabilityTestPayload: {
            /** Format: int64 */
            accessionId: number;
            /** Format: date */
            endDate?: string;
            /** Format: int64 */
            id: number;
            notes?: string;
            /** @enum {string} */
            seedType?: "Fresh" | "Stored";
            /** Format: int32 */
            seedsCompromised?: number;
            /** Format: int32 */
            seedsEmpty?: number;
            /** Format: int32 */
            seedsFilled?: number;
            /** Format: int32 */
            seedsTested: number;
            /** Format: date */
            startDate?: string;
            /** @enum {string} */
            substrate?: "Nursery Media" | "Agar" | "Paper" | "Other" | "Sand" | "Media Mix" | "Soil" | "Moss" | "Perlite/Vermiculite" | "None";
            testResults?: components["schemas"]["ViabilityTestResultPayload"][];
            /** @enum {string} */
            testType: "Lab" | "Nursery" | "Cut";
            /** Format: int32 */
            totalSeedsGerminated?: number;
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            /**
             * Format: int32
             * @description Server-calculated viability percent for this test. For lab and nursery tests, this is based on the total seeds germinated across all test results. For cut tests, it is based on the number of seeds filled.
             */
            viabilityPercent?: number;
            /** @description Full name of user who withdrew seeds to perform the test. */
            withdrawnByName?: string;
            /**
             * Format: int64
             * @description ID of user who withdrew seeds to perform the test.
             */
            withdrawnByUserId?: number;
        };
        GetViabilityTestResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            viabilityTest: components["schemas"]["GetViabilityTestPayload"];
        };
        GetWithdrawalPayload: {
            /** Format: date */
            date: string;
            /**
             * Format: int32
             * @description Number of seeds withdrawn. Calculated by server. This is an estimate if "withdrawnQuantity" is a weight quantity and the accession has subset weight and count data. Absent if "withdrawnQuantity" is a weight quantity and the accession has no subset weight and count.
             */
            estimatedCount?: number;
            /** @description Weight of seeds withdrawn. Calculated by server. This is an estimate if "withdrawnQuantity" is a seed count and the accession has subset weight and count data. Absent if "withdrawnQuantity" is a seed count and the accession has no subset weight and count. */
            estimatedWeight?: components["schemas"]["SeedQuantityPayload"];
            /**
             * Format: int64
             * @description Server-assigned unique ID of this withdrawal.
             */
            id?: number;
            notes?: string;
            /** @enum {string} */
            purpose?: "Other" | "Viability Testing" | "Out-planting" | "Nursery";
            /**
             * Format: int64
             * @description If this withdrawal is of purpose "Viability Testing", the ID of the test it is associated with.
             */
            viabilityTestId?: number;
            /** @description Full name of the person who withdrew the seeds. V1 COMPATIBILITY: This is the "staffResponsible" v1 field, which may not be the name of an organization user. */
            withdrawnByName?: string;
            /**
             * Format: int64
             * @description ID of the user who withdrew the seeds. Only present if the current user has permission to list the users in the organization. V1 COMPATIBILITY: Also absent if the withdrawal was written with the v1 API and we haven't yet written the code to figure out which user ID to assign.
             */
            withdrawnByUserId?: number;
            /** @description Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. */
            withdrawnQuantity?: components["schemas"]["SeedQuantityPayload"];
        };
        GetWithdrawalResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            withdrawal: components["schemas"]["GetWithdrawalPayload"];
        };
        GetWithdrawalsResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            withdrawals: components["schemas"]["GetWithdrawalPayload"][];
        };
        GlobalRoleUsersListResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            users: components["schemas"]["UserWithGlobalRolesPayload"][];
        };
        GoalProgressPayloadV1: {
            /**
             * Format: int32
             * @enum {integer}
             */
            goal: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
            progress?: string;
        };
        ImageVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Image";
        };
        ImportDeliverableProblemElement: {
            problem: string;
            /** Format: int32 */
            row: number;
        };
        ImportDeliverableResponsePayload: {
            message?: string;
            problems: components["schemas"]["ImportDeliverableProblemElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ImportModuleProblemElement: {
            problem: string;
            /** Format: int32 */
            row: number;
        };
        ImportModuleResponsePayload: {
            message?: string;
            problems: components["schemas"]["ImportModuleProblemElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        InternalTagPayload: {
            /** Format: int64 */
            id: number;
            /** @description If true, this internal tag is system-defined and may affect the behavior of the application. If falso, the tag is admin-defined and is only used for reporting. */
            isSystem: boolean;
            name: string;
        };
        InternalUserPayload: {
            /** @enum {string} */
            role?: "Project Lead" | "Restoration Lead" | "Social Lead" | "GIS Lead" | "Carbon Lead" | "Phase Lead" | "Regional Expert" | "Project Finance Lead" | "Climate Impact Lead" | "Legal Lead" | "Consultant";
            roleName?: string;
            /** Format: int64 */
            userId: number;
        };
        InviteFundingEntityFunderRequestPayload: {
            email: string;
        };
        InviteFundingEntityFunderResponsePayload: {
            email: string;
            status: components["schemas"]["SuccessOrError"];
        };
        LineString: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            coordinates: number[][];
            /** @enum {string} */
            type: "LineString";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "LineString";
        };
        LinkVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Link";
        };
        ListAcceleratorOrganizationsResponsePayload: {
            organizations: components["schemas"]["AcceleratorOrganizationPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAcceleratorReportConfigResponsePayload: {
            configs: components["schemas"]["ExistingAcceleratorReportConfigPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAcceleratorReportsResponsePayload: {
            reports: components["schemas"]["AcceleratorReportPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListActivitiesResponsePayload: {
            activities: components["schemas"]["ActivityPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAdHocObservationResultsResponsePayload: {
            observations: components["schemas"]["ObservationResultsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAdHocObservationsResponsePayload: {
            observations: components["schemas"]["ObservationPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAllInternalTagsResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            tags: components["schemas"]["InternalTagPayload"][];
        };
        ListAllOrganizationInternalTagsResponsePayload: {
            organizations: components["schemas"]["OrganizationInternalTagsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListApplicationsResponsePayload: {
            applications: components["schemas"]["ApplicationPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAssignedPlotsResponsePayload: {
            plots: components["schemas"]["AssignedPlotPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListAutomationsResponsePayload: {
            automations: components["schemas"]["AutomationPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListBatchPhotosResponsePayload: {
            photos: components["schemas"]["BatchPhotoPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListCohortModulesResponsePayload: {
            modules: components["schemas"]["CohortModulePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListDeliverablesElement: {
            /** @enum {string} */
            category: "Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files";
            /** Format: int64 */
            cohortId?: number;
            cohortName?: string;
            /** @description Optional description of the deliverable in HTML form. */
            descriptionHtml?: string;
            /** Format: date */
            dueDate?: string;
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            moduleId: number;
            moduleName: string;
            moduleTitle?: string;
            name: string;
            /**
             * Format: int32
             * @description Number of documents submitted for this deliverable. Only valid for deliverables of type Document.
             */
            numDocuments?: number;
            /** Format: int64 */
            organizationId: number;
            organizationName: string;
            /** Format: int64 */
            participantId?: number;
            participantName?: string;
            /** Format: int32 */
            position: number;
            projectDealName?: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
            required: boolean;
            sensitive: boolean;
            /** @enum {string} */
            status: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
            /** @enum {string} */
            type: "Document" | "Species" | "Questions";
        };
        ListDeliverablesResponsePayload: {
            deliverables: components["schemas"]["ListDeliverablesElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListDeviceConfigsResponse: {
            devices: components["schemas"]["DeviceConfig"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListDocumentTemplatesResponsePayload: {
            documentTemplates: components["schemas"]["DocumentTemplatePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListDocumentsResponsePayload: {
            documents: components["schemas"]["DocumentPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        /** @description Specifies which entities' events should be retrieved. Organization ID is mandatory, but other IDs can also be specified here. Entities have to match all the requested IDs. For example, if you specify observationId and monitoringPlotId, you will only get events related to one monitoring plot in one observation, whereas if you specify just observationId, you will get events related to all monitoring plots in that observation. The subjects property may be used to narrow the search further. */
        ListEventLogEntriesRequestPayload: {
            /** Format: int64 */
            fileId?: number;
            /** Format: int64 */
            monitoringPlotId?: number;
            /** Format: int64 */
            observationId?: number;
            /** Format: int64 */
            organizationId: number;
            /** Format: int64 */
            plantingSiteId?: number;
            /** Format: int64 */
            projectId?: number;
            /** @description If specified, only return event log entries for specific subject types. This can be used to narrow the scope of the results in cases where there might be events related to child entities and you don't care about those. */
            subjects?: ("BiomassDetails" | "BiomassQuadrat" | "BiomassQuadratSpecies" | "BiomassSpecies" | "ObservationPlot" | "ObservationPlotMedia" | "Organization" | "Project" | "RecordedTree")[];
        };
        ListEventLogEntriesResponsePayload: {
            events: components["schemas"]["EventLogEntryPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListEventsResponsePayload: {
            events: components["schemas"]["ModuleEvent"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListFacilitiesResponse: {
            facilities: components["schemas"]["FacilityPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListFieldValuesRequestPayload: {
            /** Format: int64 */
            facilityId?: number;
            fields: string[];
            /** Format: int64 */
            organizationId?: number;
            search?: components["schemas"]["SearchNodePayload"];
        };
        ListFieldValuesResponsePayload: {
            results: {
                [key: string]: components["schemas"]["FieldValuesPayload"];
            };
            status: components["schemas"]["SuccessOrError"];
        };
        ListFundingEntitiesPayload: {
            fundingEntities: components["schemas"]["FundingEntityPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListModulesResponsePayload: {
            modules: components["schemas"]["ModulePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListObservationResultsResponsePayload: {
            observations: components["schemas"]["ObservationResultsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListObservationSummariesResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            /** @description History of rollup summaries of planting site observations in order of observation time, latest first.  */
            summaries: components["schemas"]["PlantingSiteObservationSummaryPayload"][];
        };
        ListObservationsResponsePayload: {
            observations: components["schemas"]["ObservationPayload"][];
            status: components["schemas"]["SuccessOrError"];
            /**
             * Format: int32
             * @description Total number of monitoring plots that haven't been completed yet across all current observations.
             */
            totalIncompletePlots: number;
            /**
             * Format: int32
             * @description Total number of monitoring plots that haven't been claimed yet across all current observations.
             */
            totalUnclaimedPlots: number;
        };
        ListOrganizationFeaturesResponsePayload: {
            applications: components["schemas"]["OrganizationFeaturePayload"];
            deliverables: components["schemas"]["OrganizationFeaturePayload"];
            modules: components["schemas"]["OrganizationFeaturePayload"];
            reports: components["schemas"]["OrganizationFeaturePayload"];
            seedFundReports: components["schemas"]["OrganizationFeaturePayload"];
            status: components["schemas"]["SuccessOrError"];
        };
        ListOrganizationInternalTagsResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            tagIds: number[];
        };
        ListOrganizationRolesResponsePayload: {
            roles: components["schemas"]["OrganizationRolePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListOrganizationUsersResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            users: components["schemas"]["OrganizationUserPayload"][];
        };
        ListOrganizationsResponsePayload: {
            organizations: components["schemas"]["OrganizationPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListParticipantsResponsePayload: {
            participants: components["schemas"]["ParticipantPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListPhotosResponseElement: {
            filename: string;
            /** Format: int64 */
            size: number;
        };
        ListPhotosResponsePayload: {
            photos: components["schemas"]["ListPhotosResponseElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListPlantingSiteHistoriesResponsePayload: {
            histories: components["schemas"]["PlantingSiteHistoryPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListPlantingSiteReportedPlantsResponsePayload: {
            sites: components["schemas"]["PlantingSiteReportedPlantsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListPlantingSitesResponsePayload: {
            sites: components["schemas"]["PlantingSitePayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListProjectAcceleratorDetailsResponsePayload: {
            details: components["schemas"]["ProjectAcceleratorDetailsPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListProjectInternalUsersResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            users: components["schemas"]["ProjectInternalUserResponsePayload"][];
        };
        ListProjectMetricsResponsePayload: {
            metrics: components["schemas"]["ExistingProjectMetricPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListProjectsResponsePayload: {
            projects: components["schemas"]["ProjectPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListPublishedReportsResponsePayload: {
            reports: components["schemas"]["PublishedReportPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListReportFilesResponseElement: {
            filename: string;
            /** Format: int64 */
            id: number;
        };
        ListReportFilesResponsePayload: {
            files: components["schemas"]["ListReportFilesResponseElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListReportPhotosResponseElement: {
            caption?: string;
            filename: string;
            /** Format: int64 */
            id: number;
        };
        ListReportPhotosResponsePayload: {
            photos: components["schemas"]["ListReportPhotosResponseElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListReportsResponseElement: {
            /** Format: int64 */
            id: number;
            lockedByName?: string;
            /** Format: int64 */
            lockedByUserId?: number;
            /** Format: date-time */
            lockedTime?: string;
            modifiedByName?: string;
            /** Format: int64 */
            modifiedByUserId?: number;
            /** Format: date-time */
            modifiedTime?: string;
            /** Format: int64 */
            projectId?: number;
            projectName?: string;
            /** Format: int32 */
            quarter: number;
            /** @enum {string} */
            status: "New" | "In Progress" | "Locked" | "Submitted";
            submittedByName?: string;
            /** Format: int64 */
            submittedByUserId?: number;
            /** Format: date-time */
            submittedTime?: string;
            /** Format: int32 */
            year: number;
        };
        ListReportsResponsePayload: {
            reports: components["schemas"]["ListReportsResponseElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListSpeciesResponsePayload: {
            species: components["schemas"]["SpeciesResponseElement"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListStandardMetricsResponsePayload: {
            metrics: components["schemas"]["ExistingStandardMetricPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListSubLocationsResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            subLocations: components["schemas"]["SubLocationPayload"][];
        };
        ListSubstratumSpeciesResponsePayload: {
            species: (components["schemas"]["PlantingSubzoneSpeciesPayload"] | components["schemas"]["SubstratumSpeciesPayload"])[];
            status: components["schemas"]["SuccessOrError"];
        };
        ListSupportRequestTypesResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            types: ("Bug Report" | "Feature Request" | "Contact Us")[];
        };
        ListSystemMetricsResponsePayload: {
            metrics: components["schemas"]["SystemMetricPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        ListTimeZoneNamesResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            timeZones: components["schemas"]["TimeZonePayload"][];
        };
        ListTimeseriesResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            timeseries: components["schemas"]["TimeseriesPayload"][];
        };
        ListVariableOwnersResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            variables: components["schemas"]["VariableOwnersResponseElement"][];
        };
        ListVariableValuesResponsePayload: {
            /**
             * Format: int64
             * @description The next unused value ID. You can pass this back to the endpoint as the minValueId parameter to poll for newly-updated values.
             */
            nextValueId: number;
            status: components["schemas"]["SuccessOrError"];
            /** @description Variable values organized by variable ID and table row. If you are getting incremental values (that is, you passed minValueId to the endpoint) this list may include values of type "Deleted" to indicate that existing values were deleted and not replaced with new values. */
            values: components["schemas"]["ExistingVariableValuesPayload"][];
        };
        ListVariablesResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            variables: (components["schemas"]["DateVariablePayload"] | components["schemas"]["EmailVariablePayload"] | components["schemas"]["ImageVariablePayload"] | components["schemas"]["LinkVariablePayload"] | components["schemas"]["NumberVariablePayload"] | components["schemas"]["SectionVariablePayload"] | components["schemas"]["SelectVariablePayload"] | components["schemas"]["TableVariablePayload"] | components["schemas"]["TextVariablePayload"])[];
        };
        ListViabilityTestsResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            viabilityTests: components["schemas"]["GetViabilityTestPayload"][];
        };
        ListWithdrawalPhotosResponsePayload: {
            photos: components["schemas"]["NurseryWithdrawalPhotoPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        MergeOtherSpeciesRequestPayload: {
            /** @description Name of the species of certainty Other whose recorded plants should be updated to refer to the known species. */
            otherSpeciesName: string;
            /**
             * Format: int64
             * @description ID of the existing species that the Other species' recorded plants should be merged into.
             */
            speciesId: number;
        };
        MetricProgressPayload: {
            /** @enum {string} */
            metric: "Seeds Collected" | "Seedlings" | "Trees Planted" | "Species Planted" | "Hectares Planted" | "Survival Rate";
            /** Format: int32 */
            progress: number;
        };
        ModuleDeliverablePayload: {
            /** @enum {string} */
            category: "Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files";
            /** @description Optional description of the deliverable in HTML form. */
            descriptionHtml?: string;
            /** Format: int64 */
            id: number;
            name: string;
            /** Format: int32 */
            position: number;
            required: boolean;
            sensitive: boolean;
            /** @enum {string} */
            type: "Document" | "Species" | "Questions";
        };
        ModuleEvent: {
            description?: string;
            /** Format: date-time */
            endTime?: string;
            /** Format: int64 */
            id: number;
            /** Format: uri */
            meetingUrl?: string;
            /** Format: int64 */
            moduleId: number;
            moduleName: string;
            projects?: components["schemas"]["ModuleEventProject"][];
            /** Format: uri */
            recordingUrl?: string;
            /** Format: uri */
            slidesUrl?: string;
            /** Format: date-time */
            startTime?: string;
            /** @enum {string} */
            status: "Not Started" | "Starting Soon" | "In Progress" | "Ended";
            /** @enum {string} */
            type: "One-on-One Session" | "Workshop" | "Live Session" | "Recorded Session";
        };
        ModuleEventProject: {
            /** Format: int64 */
            cohortId: number;
            cohortName: string;
            /** Format: int64 */
            participantId: number;
            participantName: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
        };
        ModulePayload: {
            additionalResources?: string;
            deliverables: components["schemas"]["ModuleDeliverablePayload"][];
            eventDescriptions: {
                [key: string]: string;
            };
            /** Format: int64 */
            id: number;
            name: string;
            overview?: string;
            preparationMaterials?: string;
        };
        MonitoringPlotHistoryPayload: {
            boundary: components["schemas"]["Polygon"];
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int32 */
            sizeMeters: number;
        };
        MonitoringPlotPayload: {
            boundary: components["schemas"]["Polygon"];
            elevationMeters?: number;
            /** Format: int64 */
            id: number;
            isAdHoc: boolean;
            isAvailable: boolean;
            /** Format: int64 */
            plotNumber: number;
            /** Format: int32 */
            sizeMeters: number;
        };
        MonitoringSpeciesUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            /** @enum {string} */
            certainty: "Known" | "Other" | "Unknown";
            /**
             * Format: int64
             * @description Required if certainty is Known. Ignored if certainty is Other or Unknown.
             */
            speciesId?: number;
            /** @description Required if certainty is Other. Ignored if certainty is Known or Unknown. */
            speciesName?: string;
            /** Format: int32 */
            totalDead?: number;
            /** Format: int32 */
            totalExisting?: number;
            /** Format: int32 */
            totalLive?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "MonitoringSpecies";
        };
        MultiLineString: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            coordinates: number[][][];
            /** @enum {string} */
            type: "MultiLineString";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "MultiLineString";
        };
        MultiPoint: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            coordinates: number[][];
            /** @enum {string} */
            type: "MultiPoint";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "MultiPoint";
        };
        MultiPolygon: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            coordinates: number[][][][];
            /** @enum {string} */
            type: "MultiPolygon";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "MultiPolygon";
        };
        NewAcceleratorReportConfigPayload: {
            /** Format: uri */
            logframeUrl?: string;
            /** Format: date */
            reportingEndDate: string;
            /** Format: date */
            reportingStartDate: string;
        };
        /** @description Biomass Measurements. Required for biomass measurement observations */
        NewBiomassMeasurementPayload: {
            description?: string;
            /** @enum {string} */
            forestType: "Terrestrial" | "Mangrove";
            /** Format: int32 */
            herbaceousCoverPercent: number;
            /** @description Required for Mangrove forest. */
            ph?: number;
            quadrats: components["schemas"]["NewBiomassQuadratPayload"][];
            /** @description Measured in ppt. Required for Mangrove forest. */
            salinity?: number;
            /** Format: int32 */
            smallTreeCountHigh: number;
            /** Format: int32 */
            smallTreeCountLow: number;
            soilAssessment: string;
            /** @description List of herbaceous and tree species. Includes all recorded quadrat and additional herbaceous species and recorded tree species. Species not assigned to a quadrat or recorded trees will be saved as an additional herbaceous species. */
            species: components["schemas"]["BiomassSpeciesPayload"][];
            /**
             * @description Low or high tide. Required for Mangrove forest.
             * @enum {string}
             */
            tide?: "Low" | "High";
            /**
             * Format: date-time
             * @description Time when ide is observed. Required for Mangrove forest.
             */
            tideTime?: string;
            trees: (components["schemas"]["NewShrubPayload"] | components["schemas"]["NewTreeWithTrunksPayload"])[];
            /**
             * Format: int32
             * @description Measured in centimeters. Required for Mangrove forest.
             */
            waterDepth?: number;
        };
        NewBiomassQuadratPayload: {
            description?: string;
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            species: components["schemas"]["NewBiomassQuadratSpeciesPayload"][];
        };
        NewBiomassQuadratSpeciesPayload: {
            /** Format: int32 */
            abundancePercent: number;
            /** Format: int64 */
            speciesId?: number;
            speciesName?: string;
        };
        NewDateValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            citation?: string;
            /** Format: date */
            dateValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Date";
        };
        NewEmailValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            citation?: string;
            emailValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Email";
        };
        /** @description Updated metadata about an image value. May only be used in Update operations, and cannot be used to replace the actual image data. */
        NewImageValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            caption?: string;
            citation?: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Image";
        };
        NewLinkValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            citation?: string;
            title?: string;
            /** Format: uri */
            url: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Link";
        };
        NewMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            isPublishable: boolean;
            name: string;
            reference: string;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
            unit?: string;
        };
        NewNumberValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            citation?: string;
            numberValue: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Number";
        };
        NewPlantingSeasonPayload: {
            /** Format: date */
            endDate: string;
            /** Format: date */
            startDate: string;
        };
        /**
         * @deprecated
         * @description Use NewSubstratumPayload
         */
        NewPlantingSubzonePayload: {
            boundary: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
            name: string;
        };
        /**
         * @deprecated
         * @description Use NewStratumPayload
         */
        NewPlantingZonePayload: {
            boundary: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
            name: string;
            plantingSubzones?: components["schemas"]["NewPlantingSubzonePayload"][];
            targetPlantingDensity?: number;
        };
        NewSectionTextValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            /** @description Citation for this chunk of text. If you want text with multiple citations at different positions, you can split it into multiple text values and put a citation on each of them. */
            citation?: string;
            textValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "SectionText";
        };
        NewSectionVariableValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            /** @enum {string} */
            displayStyle?: "Inline" | "Block";
            /** @enum {string} */
            usageType: "Injection" | "Reference";
            /** Format: int64 */
            variableId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "SectionVariable";
        };
        NewSelectValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            citation?: string;
            optionIds: number[];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Select";
        };
        NewShrubPayload: Omit<components["schemas"]["NewTreePayload"], "growthForm"> & {
            description?: string;
            isDead: boolean;
            /**
             * Format: int32
             * @description Measured in centimeters.
             */
            shrubDiameter: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            growthForm: "shrub";
        };
        /** @description List of strata to create. If present and not empty, "boundary" must also be specified. */
        NewStratumPayload: {
            boundary: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
            /** @description Name of this stratum. Two strata in the same planting site may not have the same name. */
            name: string;
            substrata?: components["schemas"]["NewSubstratumPayload"][];
            targetPlantingDensity?: number;
        };
        NewSubstratumPayload: {
            boundary: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
            /** @description Name of this substratum. Two substrata in the same stratum may not have the same name, but using the same substratum name in different strata is valid. */
            name: string;
        };
        NewTableValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            /** @description Citations on table values can be used if you want a citation that is associated with the table as a whole rather than with individual cells, or if you want a citation on an empty table: append a row with no column values but with a citation. */
            citation?: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Table";
        };
        NewTextValuePayload: Omit<components["schemas"]["NewValuePayload"], "type"> & {
            citation?: string;
            textValue: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Text";
        };
        NewTreePayload: {
            gpsCoordinates?: components["schemas"]["Point"];
            growthForm: string;
            /** Format: int64 */
            speciesId?: number;
            speciesName?: string;
        };
        NewTreeWithTrunksPayload: Omit<components["schemas"]["NewTreePayload"], "growthForm"> & {
            trunks: components["schemas"]["NewTrunkPayload"][];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            growthForm: "tree";
        };
        NewTrunkPayload: {
            description?: string;
            /** @description Measured in centimeters. */
            diameterAtBreastHeight: number;
            /** @description Measured in meters. */
            height?: number;
            isDead: boolean;
            /** @description Measured in meters. */
            pointOfMeasurement: number;
        };
        /** @description Supertype for payloads that represent new variable values. See the descriptions of individual payload types for more details. */
        NewValuePayload: {
            type: string;
        };
        /** @description Search criterion that matches results that do not match a set of search criteria. */
        NotNodePayload: Omit<components["schemas"]["SearchNodePayload"], "operation"> & {
            child: components["schemas"]["SearchNodePayload"];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "not";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "not";
        };
        NotificationCountPayload: {
            /** Format: int64 */
            organizationId?: number;
            /** Format: int32 */
            unread: number;
        };
        NotificationPayload: {
            body: string;
            /** Format: date-time */
            createdTime: string;
            /** Format: int64 */
            id: number;
            isRead: boolean;
            /** Format: uri */
            localUrl: string;
            /** @enum {string} */
            notificationCriticality: "Info" | "Warning" | "Error" | "Success";
            /** Format: int64 */
            organizationId?: number;
            title: string;
        };
        NumberVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            /** Format: int32 */
            decimalPlaces?: number;
            maxValue?: number;
            minValue?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Number";
        };
        NurserySummaryPayload: {
            /** Format: int64 */
            activeGrowthQuantity: number;
            /** Format: int64 */
            germinatingQuantity: number;
            /** Format: int32 */
            germinationRate?: number;
            /** Format: int64 */
            hardeningOffQuantity: number;
            /**
             * Format: int32
             * @description Percentage of current and past inventory that was withdrawn due to death.
             */
            lossRate?: number;
            /** Format: int64 */
            notReadyQuantity: number;
            /** Format: int64 */
            readyQuantity: number;
            /** @description Species currently present in the nursery. */
            species: components["schemas"]["NurserySummarySpeciesPayload"][];
            /**
             * Format: int64
             * @description Total number of plants that have been withdrawn due to death.
             */
            totalDead: number;
            /**
             * Format: int64
             * @description Total number of germinated plants currently in inventory.
             */
            totalQuantity: number;
            /**
             * Format: int64
             * @description Total number of plants that have been withdrawn in the past.
             */
            totalWithdrawn: number;
        };
        NurserySummarySpeciesPayload: {
            /** Format: int64 */
            id: number;
            scientificName: string;
        };
        NurseryWithdrawalPayload: {
            batchWithdrawals: components["schemas"]["BatchWithdrawalPayload"][];
            /**
             * Format: int64
             * @description If purpose is "Nursery Transfer", the ID of the facility to which the seedlings were transferred.
             */
            destinationFacilityId?: number;
            /** Format: int64 */
            facilityId: number;
            /** Format: int64 */
            id: number;
            notes?: string;
            /** @enum {string} */
            purpose: "Nursery Transfer" | "Dead" | "Out Plant" | "Other" | "Undo";
            /**
             * Format: int64
             * @description If purpose is "Undo", the ID of the withdrawal this one undoes.
             */
            undoesWithdrawalId?: number;
            /**
             * Format: int64
             * @description If this withdrawal was undone, the ID of the withdrawal that undid it.
             */
            undoneByWithdrawalId?: number;
            /** Format: date */
            withdrawnDate: string;
        };
        NurseryWithdrawalPhotoPayload: {
            /** Format: int64 */
            id: number;
        };
        ObservationMonitoringPlotCoordinatesPayload: {
            gpsCoordinates: components["schemas"]["Point"];
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
        };
        ObservationMonitoringPlotMediaPayload: {
            caption?: string;
            /** Format: int64 */
            fileId: number;
            gpsCoordinates?: components["schemas"]["Point"];
            /** @description If true, this file was uploaded as part of the original observation. If false, it was uploaded later. */
            isOriginal: boolean;
            /** @enum {string} */
            mediaKind: "Photo" | "Video";
            /** @enum {string} */
            position?: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            /** @enum {string} */
            type: "Plot" | "Quadrat" | "Soil";
        };
        /** @description Percentage of plants of all species that were dead in this substratum's permanent monitoring plots. */
        ObservationMonitoringPlotResultsPayload: {
            boundary: components["schemas"]["Polygon"];
            claimedByName?: string;
            /** Format: int64 */
            claimedByUserId?: number;
            /** Format: date-time */
            completedTime?: string;
            conditions: ("AnimalDamage" | "FastGrowth" | "FavorableWeather" | "Fungus" | "Pests" | "SeedProduction" | "UnfavorableWeather" | "NaturalRegenerationWoody" | "Logging" | "Fire" | "Mining" | "Grazing" | "Infrastructure" | "ElectricalLines" | "SoilErosion" | "DifficultAccessibility" | "Contamination" | "SteepSlope" | "WaterBodies")[];
            /** @description Observed coordinates, if any, up to one per position. */
            coordinates: components["schemas"]["ObservationMonitoringPlotCoordinatesPayload"][];
            elevationMeters?: number;
            isAdHoc: boolean;
            /** @description True if this was a permanent monitoring plot in this observation. Clients should not assume that the set of permanent monitoring plots is the same in all observations; the number of permanent monitoring plots can be adjusted over time based on observation results. */
            isPermanent: boolean;
            media: components["schemas"]["ObservationMonitoringPlotMediaPayload"][];
            /** Format: int64 */
            monitoringPlotId: number;
            /** @description Full name of this monitoring plot, including stratum and substratum prefixes. */
            monitoringPlotName: string;
            /**
             * Format: int64
             * @description Organization-unique number of this monitoring plot.
             */
            monitoringPlotNumber: number;
            notes?: string;
            /** @description IDs of any newer monitoring plots that overlap with this one. */
            overlappedByPlotIds: number[];
            /** @description IDs of any older monitoring plots this one overlaps with. */
            overlapsWithPlotIds: number[];
            photos: components["schemas"]["ObservationMonitoringPlotMediaPayload"][];
            /**
             * Format: int32
             * @description Number of live plants per hectare.
             */
            plantingDensity: number;
            plants?: components["schemas"]["RecordedPlantPayload"][];
            /**
             * Format: int32
             * @description Length of each edge of the monitoring plot in meters.
             */
            sizeMeters: number;
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /** @enum {string} */
            status: "Unclaimed" | "Claimed" | "Completed" | "Not Observed";
            /**
             * Format: int32
             * @description If this is a permanent monitoring plot in this observation, percentage of plants that have survived since t0 data.
             */
            survivalRate?: number;
            /**
             * Format: int32
             * @description Total number of plants recorded. Includes all plants, regardless of live/dead status or species.
             */
            totalPlants: number;
            /**
             * Format: int32
             * @description Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total.
             */
            totalSpecies: number;
            /** @description Information about plants of unknown species, if any were observed. */
            unknownSpecies?: components["schemas"]["ObservationSpeciesResultsPayload"];
        };
        ObservationPayload: {
            /**
             * Format: date
             * @description Date this observation is scheduled to end.
             */
            endDate: string;
            /** Format: int64 */
            id: number;
            isAdHoc: boolean;
            /**
             * Format: int32
             * @description Total number of monitoring plots that haven't been completed yet. Includes both claimed and unclaimed plots.
             */
            numIncompletePlots: number;
            /**
             * Format: int32
             * @description Total number of monitoring plots in observation, regardless of status.
             */
            numPlots: number;
            /**
             * Format: int32
             * @description Total number of monitoring plots that haven't been claimed yet.
             */
            numUnclaimedPlots: number;
            /**
             * Format: int64
             * @description If this observation has already started, the version of the planting site that was used to place its monitoring plots.
             */
            plantingSiteHistoryId?: number;
            /** Format: int64 */
            plantingSiteId: number;
            plantingSiteName: string;
            /** @description If specific substrata were requested for this observation, their IDs. */
            requestedSubstratumIds?: number[];
            /**
             * @deprecated
             * @description Use requestedSubstratumIds instead.
             */
            requestedSubzoneIds?: number[];
            /**
             * Format: date
             * @description Date this observation started.
             */
            startDate: string;
            /** @enum {string} */
            state: "Upcoming" | "InProgress" | "Completed" | "Overdue" | "Abandoned";
            /** @enum {string} */
            type: "Monitoring" | "Biomass Measurements";
        };
        /**
         * @deprecated
         * @description Use ObservationSubstratumResultsPayload instead
         */
        ObservationPlantingSubzoneResultsPayload: {
            areaHa: number;
            /** Format: date-time */
            completedTime?: string;
            /** Format: int32 */
            estimatedPlants?: number;
            monitoringPlots: components["schemas"]["ObservationMonitoringPlotResultsPayload"][];
            name: string;
            /** Format: int32 */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            /** Format: int64 */
            plantingSubzoneId?: number;
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /** Format: int32 */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        /**
         * @deprecated
         * @description Use ObservationStratumResultsPayload instead
         */
        ObservationPlantingZoneResultsPayload: {
            areaHa: number;
            /** Format: date-time */
            completedTime?: string;
            /** Format: int32 */
            estimatedPlants?: number;
            name: string;
            /** Format: int32 */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            plantingSubzones: components["schemas"]["ObservationPlantingSubzoneResultsPayload"][];
            /** Format: int64 */
            plantingZoneId?: number;
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /** Format: int32 */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        ObservationPlotMediaSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            fileId: number;
            /** @description True if this file was uploaded as part of the original submission of observation data; false if it was uploaded later. */
            isOriginal: boolean;
            /** @enum {string} */
            mediaKind: "Photo" | "Video";
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "ObservationPlotMedia";
        };
        ObservationPlotSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "ObservationPlot";
        };
        ObservationPlotUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            conditions?: ("AnimalDamage" | "FastGrowth" | "FavorableWeather" | "Fungus" | "Pests" | "SeedProduction" | "UnfavorableWeather" | "NaturalRegenerationWoody" | "Logging" | "Fire" | "Mining" | "Grazing" | "Infrastructure" | "ElectricalLines" | "SoilErosion" | "DifficultAccessibility" | "Contamination" | "SteepSlope" | "WaterBodies")[];
            notes?: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "ObservationPlot";
        };
        ObservationResultsPayload: {
            adHocPlot?: components["schemas"]["ObservationMonitoringPlotResultsPayload"];
            areaHa?: number;
            biomassMeasurements?: components["schemas"]["ExistingBiomassMeasurementPayload"];
            /** Format: date-time */
            completedTime?: string;
            /**
             * Format: int32
             * @description Estimated total number of live plants at the site, based on the estimated planting density and site size. Only present if all the substrata in the site have been marked as having completed planting.
             */
            estimatedPlants?: number;
            /** @description Percentage of plants of all species that were dead in this site's permanent monitoring plots. */
            isAdHoc: boolean;
            /** Format: int64 */
            observationId: number;
            /**
             * Format: int32
             * @description Estimated planting density for the site, based on the observed planting densities of monitoring plots.
             */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            /** Format: int64 */
            plantingSiteHistoryId?: number;
            /** Format: int64 */
            plantingSiteId: number;
            /**
             * @deprecated
             * @description Use strata instead
             */
            plantingZones: components["schemas"]["ObservationPlantingZoneResultsPayload"][];
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /** Format: date */
            startDate: string;
            /** @enum {string} */
            state: "Upcoming" | "InProgress" | "Completed" | "Overdue" | "Abandoned";
            strata: components["schemas"]["ObservationStratumResultsPayload"][];
            /** Format: int32 */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
            /** @enum {string} */
            type: "Monitoring" | "Biomass Measurements";
        };
        /** @description Information about observed plants of a particular species in a region. */
        ObservationSpeciesResultsPayload: {
            /** @enum {string} */
            certainty: "Known" | "Other" | "Unknown";
            /**
             * Format: int32
             * @description Number of live plants observed in permanent plots in this observation, not including existing plants. 0 if ths is a plot-level result for a temporary monitoring plot.
             */
            permanentLive: number;
            /**
             * Format: int64
             * @description If certainty is Known, the ID of the species. Null if certainty is Other or Unknown.
             */
            speciesId?: number;
            /** @description If certainty is Other, the user-supplied name of the species. Null if certainty is Known or Unknown. */
            speciesName?: string;
            /**
             * Format: int32
             * @description Percentage of plants in permanent monitoring plots that have survived since the t0 point. If there are no permanent monitoring plots (or if this is a plot-level result for a temporary monitoring plot) this will be null.
             */
            survivalRate?: number;
            /**
             * Format: int32
             * @description Number of dead plants observed in this observation.
             */
            totalDead: number;
            /**
             * Format: int32
             * @description Number of existing plants observed in this observation.
             */
            totalExisting: number;
            /**
             * Format: int32
             * @description Number of live plants observed in this observation, not including existing plants.
             */
            totalLive: number;
            /**
             * Format: int32
             * @description Total number of live and existing plants of this species.
             */
            totalPlants: number;
        };
        ObservationStratumResultsPayload: {
            /** @description Area of this stratum in hectares. */
            areaHa: number;
            /** Format: date-time */
            completedTime?: string;
            /**
             * Format: int32
             * @description Estimated number of plants in stratum based on estimated planting density and stratum area. Only present if all the substrata in the stratum have been marked as having completed planting.
             */
            estimatedPlants?: number;
            name: string;
            /**
             * Format: int32
             * @description Estimated planting density for the stratum based on the observed planting densities of monitoring plots.
             */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /**
             * Format: int64
             * @description ID of the stratum. Absent if the stratum was deleted after the observation.
             */
            stratumId?: number;
            /** @description Percentage of plants of all species in this stratum's permanent monitoring plots that have survived since the t0 point. */
            substrata: components["schemas"]["ObservationSubstratumResultsPayload"][];
            /** Format: int32 */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /**
             * Format: int32
             * @description Total number of plants recorded. Includes all plants, regardless of live/dead status or species.
             */
            totalPlants: number;
            /**
             * Format: int32
             * @description Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total.
             */
            totalSpecies: number;
        };
        /** @description Percentage of plants of all species in this stratum's permanent monitoring plots that have survived since the t0 point. */
        ObservationSubstratumResultsPayload: {
            /** @description Area of this substratum in hectares. */
            areaHa: number;
            /** Format: date-time */
            completedTime?: string;
            /**
             * Format: int32
             * @description Estimated number of plants in substratum based on estimated planting density and substratum area. Only present if the substratum has completed planting.
             */
            estimatedPlants?: number;
            /** @description Percentage of plants of all species that were dead in this substratum's permanent monitoring plots. */
            monitoringPlots: components["schemas"]["ObservationMonitoringPlotResultsPayload"][];
            name: string;
            /**
             * Format: int32
             * @description Estimated planting density for the substratum based on the observed planting densities of monitoring plots.
             */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /**
             * Format: int64
             * @description ID of the substratum. Absent if the substratum was deleted after the observation.
             */
            substratumId?: number;
            /** Format: int32 */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /**
             * Format: int32
             * @description Total number of plants recorded. Includes all plants, regardless of live/dead status or species.
             */
            totalPlants: number;
            /**
             * Format: int32
             * @description Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total.
             */
            totalSpecies: number;
        };
        ObservationUpdateOperationPayload: {
            type: string;
        };
        OptionalSpeciesDensityPayload: {
            density?: number;
            /** Format: int64 */
            speciesId: number;
        };
        /** @description Search criterion that matches results that meet any of a set of other search criteria. That is, if the list of children is x, y, and z, this will require x OR y OR z. */
        OrNodePayload: Omit<components["schemas"]["SearchNodePayload"], "operation"> & {
            /** @description List of criteria at least one of which must be satisfied */
            children: components["schemas"]["SearchNodePayload"][];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "or";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "or";
        };
        OrganizationFeaturePayload: {
            enabled: boolean;
            projectIds: number[];
        };
        OrganizationInternalTagsPayload: {
            internalTagIds: number[];
            /** Format: int64 */
            organizationId: number;
            organizationName: string;
        };
        OrganizationNurserySummaryPayload: {
            /** Format: int64 */
            activeGrowthQuantity: number;
            /** Format: int64 */
            germinatingQuantity: number;
            /** Format: int32 */
            germinationRate?: number;
            /** Format: int64 */
            hardeningOffQuantity: number;
            /**
             * Format: int32
             * @description Percentage of current and past inventory that was withdrawn due to death.
             */
            lossRate?: number;
            /** Format: int64 */
            notReadyQuantity: number;
            /** Format: int64 */
            readyQuantity: number;
            /**
             * Format: int64
             * @description Total number of plants that have been withdrawn due to death.
             */
            totalDead: number;
            /**
             * Format: int64
             * @description Total number of germinated plants currently in inventory.
             */
            totalQuantity: number;
            /**
             * Format: int64
             * @description Total number of plants that have been withdrawn in the past.
             */
            totalWithdrawn: number;
        };
        OrganizationPayload: {
            /** @description Whether this organization can submit reports to Terraformation. */
            canSubmitReports: boolean;
            /**
             * @description ISO 3166 alpha-2 code of organization's country.
             * @example AU
             */
            countryCode?: string;
            /**
             * @description ISO 3166-2 code of organization's country subdivision (state, province, region, etc.) This is the full ISO 3166-2 code including the country prefix. If this is set, countryCode will also be set.
             * @example US-HI
             */
            countrySubdivisionCode?: string;
            /** Format: date-time */
            createdTime: string;
            description?: string;
            /** @description This organization's facilities. Only included if depth is "Facility". */
            facilities?: components["schemas"]["FacilityPayload"][];
            /** Format: int64 */
            id: number;
            name: string;
            /** @enum {string} */
            organizationType?: "Government" | "NGO" | "Arboreta" | "Academia" | "ForProfit" | "Other";
            organizationTypeDetails?: string;
            /**
             * @description The current user's role in the organization. Absent if the current user is not a member of the organization but is able to read it thanks to a global role.
             * @enum {string}
             */
            role?: "Contributor" | "Manager" | "Admin" | "Owner" | "Terraformation Contact";
            tfContactUser?: components["schemas"]["TerraformationContactUserPayload"];
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
            /**
             * Format: int32
             * @description The total number of users in the organization, including the current user.
             */
            totalUsers: number;
            website?: string;
        };
        OrganizationRolePayload: {
            /** @enum {string} */
            role: "Contributor" | "Manager" | "Admin" | "Owner" | "Terraformation Contact";
            /**
             * Format: int32
             * @description Total number of users in the organization with this role.
             */
            totalUsers: number;
        };
        OrganizationSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            organizationId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Organization";
        };
        OrganizationUserPayload: {
            /**
             * Format: date-time
             * @description Date and time the user was added to the organization.
             */
            addedTime: string;
            email: string;
            /** @description The user's first name. Not present if the user has been added to the organization but has not signed up for an account yet. */
            firstName?: string;
            /** Format: int64 */
            id: number;
            /** @description The user's last name. Not present if the user has been added to the organization but has not signed up for an account yet. */
            lastName?: string;
            /** @enum {string} */
            role: "Contributor" | "Manager" | "Admin" | "Owner" | "Terraformation Contact";
        };
        ParticipantPayload: {
            /** Format: int64 */
            cohortId?: number;
            cohortName?: string;
            /** @enum {string} */
            cohortPhase?: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            /** Format: int64 */
            id: number;
            name: string;
            projects: components["schemas"]["ParticipantProjectPayload"][];
        };
        ParticipantProjectForSpeciesPayload: {
            /**
             * Format: int64
             * @description This deliverable ID is associated to the active or most recent cohort module, if available.
             */
            deliverableId?: number;
            /** Format: int64 */
            participantProjectSpeciesId: number;
            /** @enum {string} */
            participantProjectSpeciesNativeCategory?: "Native" | "Non-native";
            /** @enum {string} */
            participantProjectSpeciesSubmissionStatus: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
            /** Format: int64 */
            projectId: number;
            projectName: string;
            /** Format: int64 */
            speciesId: number;
        };
        ParticipantProjectPayload: {
            /** Format: int64 */
            organizationId: number;
            organizationName: string;
            projectDealName?: string;
            /** Format: int64 */
            projectId: number;
            projectName: string;
        };
        ParticipantProjectSpeciesPayload: {
            feedback?: string;
            /** Format: int64 */
            id: number;
            internalComment?: string;
            /** Format: int64 */
            projectId: number;
            rationale?: string;
            /** Format: int64 */
            speciesId: number;
            /** @enum {string} */
            speciesNativeCategory?: "Native" | "Non-native";
            /** @enum {string} */
            submissionStatus: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
        };
        PhaseScores: {
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            scores: components["schemas"]["Score"][];
            totalScore?: number;
        };
        PhaseVotes: {
            /** @enum {string} */
            decision?: "No" | "Conditional" | "Yes";
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            votes: components["schemas"]["VoteSelection"][];
        };
        PlantingPayload: {
            /** Format: int64 */
            id: number;
            /** @description If type is "Reassignment To", the reassignment notes, if any. */
            notes?: string;
            /**
             * Format: int32
             * @description Number of plants planted or reassigned. If type is "Reassignment From", this will be negative.
             */
            numPlants: number;
            /**
             * Format: int64
             * @deprecated
             * @description Use substratumId instead.
             */
            plantingSubzoneId?: number;
            /** Format: int64 */
            speciesId: number;
            /** Format: int64 */
            substratumId?: number;
            /** @enum {string} */
            type: "Delivery" | "Reassignment From" | "Reassignment To" | "Undo";
        };
        PlantingSeasonPayload: {
            /** Format: date */
            endDate: string;
            /** Format: int64 */
            id: number;
            /** Format: date */
            startDate: string;
        };
        PlantingSiteHistoryPayload: {
            areaHa?: number;
            boundary: components["schemas"]["MultiPolygon"];
            /** Format: date-time */
            createdTime: string;
            exclusion?: components["schemas"]["MultiPolygon"];
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            plantingSiteId: number;
            /**
             * @deprecated
             * @description Use strata instead
             */
            plantingZones: components["schemas"]["PlantingZoneHistoryPayload"][];
            strata: components["schemas"]["StratumHistoryResponsePayload"][];
        };
        /** @description History of rollup summaries of planting site observations in order of observation time, latest first.  */
        PlantingSiteObservationSummaryPayload: {
            /**
             * Format: date-time
             * @description The earliest time of the observations used in this summary.
             */
            earliestObservationTime: string;
            /**
             * Format: int32
             * @description Estimated total number of live plants at the site, based on the estimated planting density and site size. Only present if all the substrata in the site have been marked as having completed planting.
             */
            estimatedPlants?: number;
            /**
             * Format: date-time
             * @description The latest time of the observations used in this summary.
             */
            latestObservationTime: string;
            /**
             * Format: int32
             * @description Estimated planting density for the site, based on the observed planting densities of monitoring plots.
             */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            /** Format: int64 */
            plantingSiteId: number;
            /**
             * @deprecated
             * @description Use strata instead
             */
            plantingZones: components["schemas"]["PlantingZoneObservationSummaryPayload"][];
            /** @description Combined list of observed species and their statuses from the latest observation of each substratum within each stratum. */
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            strata: components["schemas"]["StratumObservationSummaryPayload"][];
            /**
             * Format: int32
             * @description Percentage of plants of all species in this site's permanent monitoring plots that have survived since the t0 point.
             */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /**
             * Format: int32
             * @description Total number of plants recorded from the latest observations of each substratum within each stratum. Includes all plants, regardless of live/dead status or species.
             */
            totalPlants: number;
            /**
             * Format: int32
             * @description Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total.
             */
            totalSpecies: number;
        };
        PlantingSitePayload: {
            adHocPlots: components["schemas"]["MonitoringPlotPayload"][];
            /** @description Area of planting site in hectares. Only present if the site has strata. */
            areaHa?: number;
            boundary?: components["schemas"]["MultiPolygon"];
            countryCode?: string;
            description?: string;
            exclusion?: components["schemas"]["MultiPolygon"];
            /** Format: int64 */
            id: number;
            /** Format: date-time */
            latestObservationCompletedTime?: string;
            /** Format: int64 */
            latestObservationId?: number;
            name: string;
            /** Format: int64 */
            organizationId: number;
            plantingSeasons: components["schemas"]["PlantingSeasonPayload"][];
            /**
             * @deprecated
             * @description Use strata instead
             */
            plantingZones?: components["schemas"]["PlantingZonePayload"][];
            /** Format: int64 */
            projectId?: number;
            strata?: components["schemas"]["StratumResponsePayload"][];
            survivalRateIncludesTempPlots?: boolean;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        PlantingSiteReportedPlantsPayload: {
            /** Format: int64 */
            id: number;
            /**
             * @deprecated
             * @description Use strata instead
             */
            plantingZones: components["schemas"]["PlantingZoneReportedPlantsPayload"][];
            /** Format: int32 */
            plantsSinceLastObservation: number;
            /** Format: int32 */
            progressPercent?: number;
            species: components["schemas"]["ReportedSpeciesPayload"][];
            strata: components["schemas"]["StratumReportedPlantsResponsePayload"][];
            /** Format: int32 */
            totalPlants: number;
        };
        PlantingSiteValidationProblemPayload: {
            /** @description If the problem is a conflict between two strata or two substrata, the list of the conflicting stratum or substratum names. */
            conflictsWith?: string[];
            /**
             * @deprecated
             * @description Use substratum instead
             */
            plantingSubzone?: string;
            /**
             * @deprecated
             * @description Use stratum instead
             */
            plantingZone?: string;
            /** @enum {string} */
            problemType: "DuplicateSubstratumName" | "DuplicateStratumName" | "ExclusionWithoutBoundary" | "SiteTooLarge" | "SubstratumBoundaryOverlaps" | "SubstratumInExclusionArea" | "SubstratumNotInStratum" | "StratumBoundaryOverlaps" | "StratumHasNoSubstrata" | "StratumNotInSite" | "StratumTooSmall" | "StrataWithoutSiteBoundary";
            /** @description If the problem relates to a particular stratum, its name. */
            stratum?: string;
            /** @description If the problem relates to a particular substratum, its name. If this is present, stratum will also be present and will be the name of the stratum that contains this substratum. */
            substratum?: string;
        };
        /**
         * @deprecated
         * @description Use SubstratumHistoryResponsePayload instead
         */
        PlantingSubzoneHistoryPayload: {
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            fullName: string;
            /** Format: int64 */
            id: number;
            monitoringPlots: components["schemas"]["MonitoringPlotHistoryPayload"][];
            name: string;
            /** Format: int64 */
            plantingSubzoneId?: number;
        };
        /**
         * @deprecated
         * @description Use SubstratumResponsePayload instead
         */
        PlantingSubzonePayload: {
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            fullName: string;
            /** Format: int64 */
            id: number;
            /** Format: date-time */
            latestObservationCompletedTime?: string;
            /** Format: int64 */
            latestObservationId?: number;
            monitoringPlots: components["schemas"]["MonitoringPlotPayload"][];
            name: string;
            /** Format: date-time */
            observedTime?: string;
            plantingCompleted: boolean;
            /** Format: date-time */
            plantingCompletedTime?: string;
        };
        /**
         * @deprecated
         * @description Use SubstratumReportedPlantsResponsePayload instead
         */
        PlantingSubzoneReportedPlantsPayload: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            plantsSinceLastObservation: number;
            species: components["schemas"]["ReportedSpeciesPayload"][];
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        /**
         * @deprecated
         * @description Use SubstratumSpeciesPayload instead
         */
        PlantingSubzoneSpeciesPayload: components["schemas"]["SpeciesPayload"] & {
            commonName?: string;
            /** Format: int64 */
            id: number;
            scientificName: string;
        };
        /**
         * @deprecated
         * @description Use StratumHistoryResponsePayload instead
         */
        PlantingZoneHistoryPayload: {
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            /** Format: int64 */
            id: number;
            name: string;
            plantingSubzones: components["schemas"]["PlantingSubzoneHistoryPayload"][];
            /** Format: int64 */
            plantingZoneId?: number;
        };
        /**
         * @deprecated
         * @description Use StratumObservationSummaryPayload instead
         */
        PlantingZoneObservationSummaryPayload: {
            areaHa: number;
            /** Format: date-time */
            earliestObservationTime: string;
            /** Format: int32 */
            estimatedPlants?: number;
            /** Format: date-time */
            latestObservationTime: string;
            /** Format: int32 */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            plantingSubzones: components["schemas"]["ObservationPlantingSubzoneResultsPayload"][];
            /** Format: int64 */
            plantingZoneId: number;
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            substrata: components["schemas"]["ObservationSubstratumResultsPayload"][];
            /** Format: int32 */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        /**
         * @deprecated
         * @description Use StratumResponsePayload instead
         */
        PlantingZonePayload: {
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            /** Format: date-time */
            boundaryModifiedTime: string;
            /** Format: int64 */
            id: number;
            /** Format: date-time */
            latestObservationCompletedTime?: string;
            /** Format: int64 */
            latestObservationId?: number;
            name: string;
            /** Format: int32 */
            numPermanentPlots: number;
            /** Format: int32 */
            numTemporaryPlots: number;
            plantingSubzones: components["schemas"]["PlantingSubzonePayload"][];
            targetPlantingDensity: number;
        };
        /**
         * @deprecated
         * @description Use StratumReportedPlantsResponsePayload instead
         */
        PlantingZoneReportedPlantsPayload: {
            /** Format: int64 */
            id: number;
            plantingSubzones: components["schemas"]["PlantingSubzoneReportedPlantsPayload"][];
            /** Format: int32 */
            plantsSinceLastObservation: number;
            /** Format: int32 */
            progressPercent: number;
            species: components["schemas"]["ReportedSpeciesPayload"][];
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        PlotSpeciesDensitiesPayload: {
            /** Format: int64 */
            monitoringPlotId: number;
            species: components["schemas"]["OptionalSpeciesDensityPayload"][];
        };
        PlotT0DataPayload: {
            densityData: components["schemas"]["SpeciesDensityPayload"][];
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId?: number;
        };
        Point: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            /**
             * @description A single position consisting of X and Y values in the coordinate system specified by the crs field.
             * @example [
             *       120,
             *       -9.53
             *     ]
             */
            coordinates: number[];
            /** @enum {string} */
            type: "Point";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Point";
        };
        Polygon: Omit<WithRequired<components["schemas"]["Geometry"], "type">, "type"> & {
            coordinates: number[][][];
            /** @enum {string} */
            type: "Polygon";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Polygon";
        };
        /**
         * @description Search criteria to apply, only to the specified prefix. If the prefix is an empty string, apply the search to all results. If prefix is a sublist (no matter how nested), apply the search to the sublist results without affecting the top level results.
         * @example [
         *       {
         *         "prefix": "species",
         *         "search": {
         *           "operation": "field",
         *           "field": "name",
         *           "values": [
         *             "Species Name"
         *           ]
         *         }
         *       },
         *       {
         *         "prefix": "viabilityTestResults",
         *         "search": {
         *           "operation": "field",
         *           "field": "seedsGerminated",
         *           "type": "Range",
         *           "values": [
         *             "30",
         *             "40"
         *           ]
         *         }
         *       }
         *     ]
         */
        PrefixedSearch: {
            prefix: string;
            search: components["schemas"]["SearchNodePayload"];
        };
        ProjectAcceleratorDetailsPayload: {
            accumulationRate?: number;
            annualCarbon?: number;
            applicationReforestableLand?: number;
            carbonCapacity?: number;
            carbonCertifications?: "CCB Standard"[];
            /** Format: uri */
            clickUpLink?: string;
            /** Format: int64 */
            cohortId?: number;
            cohortName?: string;
            /** @enum {string} */
            cohortPhase?: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            confirmedReforestableLand?: number;
            countryAlpha3?: string;
            countryCode?: string;
            dealDescription?: string;
            dealName?: string;
            /** @enum {string} */
            dealStage?: "Phase 0 (Doc Review)" | "Phase 1" | "Phase 2" | "Phase 3" | "Graduated, Finished Planting" | "Non Graduate" | "Application Submitted" | "Project Lead Screening Review" | "Screening Questions Ready for Review" | "Carbon Pre-Check" | "Submission Requires Follow Up" | "Carbon Eligible" | "Closed Lost" | "Issue Active" | "Issue Pending" | "Issue Reesolved";
            dropboxFolderPath?: string;
            failureRisk?: string;
            fileNaming?: string;
            /** Format: uri */
            gisReportsLink?: string;
            /** Format: uri */
            googleFolderUrl?: string;
            /** Format: uri */
            hubSpotUrl?: string;
            investmentThesis?: string;
            landUseModelHectares?: {
                [key: string]: number;
            };
            landUseModelTypes: ("Native Forest" | "Monoculture" | "Sustainable Timber" | "Other Timber" | "Mangroves" | "Agroforestry" | "Silvopasture" | "Other Land-Use Model")[];
            maxCarbonAccumulation?: number;
            methodologyNumber?: string;
            metricProgress: components["schemas"]["MetricProgressPayload"][];
            minCarbonAccumulation?: number;
            minProjectArea?: number;
            /** Format: int32 */
            numCommunities?: number;
            /** Format: int32 */
            numNativeSpecies?: number;
            /** Format: int64 */
            participantId?: number;
            participantName?: string;
            perHectareBudget?: number;
            /** @enum {string} */
            pipeline?: "Accelerator Projects" | "Carbon Supply" | "Carbon Waitlist";
            plantingSitesCql?: string;
            projectArea?: number;
            projectBoundariesCql?: string;
            /** Format: int64 */
            projectHighlightPhotoValueId?: number;
            /** Format: int64 */
            projectId: number;
            /** Format: int64 */
            projectZoneFigureValueId?: number;
            /** @enum {string} */
            region?: "Antarctica" | "East Asia & Pacific" | "Europe & Central Asia" | "Latin America & Caribbean" | "Middle East & North Africa" | "North America" | "Oceania" | "South Asia" | "Sub-Saharan Africa";
            /** Format: uri */
            riskTrackerLink?: string;
            sdgList?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[];
            /** Format: uri */
            slackLink?: string;
            standard?: string;
            totalCarbon?: number;
            totalExpansionPotential?: number;
            totalVCU?: number;
            /** Format: uri */
            verraLink?: string;
            whatNeedsToBeTrue?: string;
        };
        ProjectInternalUserResponsePayload: {
            /** Format: date-time */
            createdTime: string;
            email: string;
            firstName?: string;
            lastName?: string;
            /** Format: date-time */
            modifiedTime: string;
            /** @enum {string} */
            role?: "Project Lead" | "Restoration Lead" | "Social Lead" | "GIS Lead" | "Carbon Lead" | "Phase Lead" | "Regional Expert" | "Project Finance Lead" | "Climate Impact Lead" | "Legal Lead" | "Consultant";
            roleName?: string;
            /** Format: int64 */
            userId: number;
        };
        ProjectOverallScorePayload: {
            /** Format: uri */
            detailsUrl?: string;
            /** Format: int64 */
            modifiedBy?: number;
            /** Format: date-time */
            modifiedTime?: string;
            /** Format: double */
            overallScore?: number;
            summary?: string;
        };
        ProjectPayload: {
            /** Format: int64 */
            cohortId?: number;
            /** @enum {string} */
            cohortPhase?: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            /** Format: int64 */
            createdBy?: number;
            /** Format: date-time */
            createdTime?: string;
            description?: string;
            /** Format: int64 */
            id: number;
            /** Format: int64 */
            modifiedBy?: number;
            /** Format: date-time */
            modifiedTime?: string;
            name: string;
            /** Format: int64 */
            organizationId: number;
            /** Format: int64 */
            participantId?: number;
        };
        ProjectReportSettingsPayload: {
            /** @description If true, reports are enabled for this project. */
            isEnabled: boolean;
            /** Format: int64 */
            projectId: number;
        };
        ProjectSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            projectId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Project";
        };
        ProjectVotesPayload: {
            phases: components["schemas"]["PhaseVotes"][];
        };
        PublishProjectProfileRequestPayload: {
            details: components["schemas"]["FunderProjectDetailsPayload"];
        };
        PublishedProjectPayload: {
            dealName?: string;
            /** Format: int64 */
            projectId: number;
        };
        PublishedReportMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            name: string;
            progressNotes?: string;
            projectsComments?: string;
            reference: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: int32 */
            target?: number;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
            unit?: string;
            /** Format: int32 */
            value?: number;
        };
        PublishedReportPayload: {
            achievements: string[];
            additionalComments?: string;
            challenges: components["schemas"]["ReportChallengePayload"][];
            /** Format: date */
            endDate: string;
            financialSummaries?: string;
            /** @enum {string} */
            frequency: "Quarterly" | "Annual";
            highlights?: string;
            photos: components["schemas"]["ReportPhotoPayload"][];
            /** Format: int64 */
            projectId: number;
            projectMetrics: components["schemas"]["PublishedReportMetricPayload"][];
            projectName: string;
            /** Format: int64 */
            publishedBy: number;
            /** Format: date-time */
            publishedTime: string;
            /** @enum {string} */
            quarter?: "Q1" | "Q2" | "Q3" | "Q4";
            /** Format: int64 */
            reportId: number;
            standardMetrics: components["schemas"]["PublishedReportMetricPayload"][];
            /** Format: date */
            startDate: string;
            systemMetrics: components["schemas"]["PublishedReportMetricPayload"][];
        };
        PutNurseryV1: {
            /** Format: date */
            buildCompletedDate?: string;
            /** Format: date */
            buildStartedDate?: string;
            /** Format: int32 */
            capacity?: number;
            /** Format: int64 */
            id: number;
            notes?: string;
            /** Format: date */
            operationStartedDate?: string;
            selected: boolean;
            workers: components["schemas"]["WorkersPayloadV1"];
        };
        PutPlantingSiteSpeciesV1: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            mortalityRateInField?: number;
            /** Format: int32 */
            totalPlanted?: number;
        };
        PutPlantingSiteV1: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            mortalityRate?: number;
            notes?: string;
            selected: boolean;
            species: components["schemas"]["PutPlantingSiteSpeciesV1"][];
            /** Format: int32 */
            totalPlantedArea?: number;
            /** Format: int32 */
            totalPlantingSiteArea?: number;
            /** Format: int32 */
            totalPlantsPlanted?: number;
            /** Format: int32 */
            totalTreesPlanted?: number;
            workers: components["schemas"]["WorkersPayloadV1"];
        };
        PutReportPayload: {
            version: string;
        };
        PutReportPayloadV1: Omit<components["schemas"]["PutReportPayload"], "version"> & {
            annualDetails?: components["schemas"]["AnnualDetailsPayloadV1"];
            notes?: string;
            nurseries: components["schemas"]["PutNurseryV1"][];
            plantingSites: components["schemas"]["PutPlantingSiteV1"][];
            seedBanks: components["schemas"]["PutSeedBankV1"][];
            summaryOfProgress?: string;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            version: "1";
        };
        PutReportRequestPayload: {
            report: components["schemas"]["PutReportPayloadV1"];
        };
        PutSeedBankV1: {
            /** Format: date */
            buildCompletedDate?: string;
            /** Format: date */
            buildStartedDate?: string;
            /** Format: int64 */
            id: number;
            notes?: string;
            /** Format: date */
            operationStartedDate?: string;
            selected: boolean;
            workers: components["schemas"]["WorkersPayloadV1"];
        };
        QuadratSpeciesUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            /** Format: int32 */
            abundance?: number;
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            /** @description Name of species to update. Either this or speciesId must be present. */
            scientificName?: string;
            /**
             * Format: int64
             * @description ID of species to update. Either this or scientificName must be present.
             */
            speciesId?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "QuadratSpecies";
        };
        QuadratUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            description?: string;
            /** @enum {string} */
            position: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Quadrat";
        };
        ReassignDeliveryRequestPayload: {
            reassignments: components["schemas"]["ReassignmentPayload"][];
        };
        ReassignmentPayload: {
            /** Format: int64 */
            fromPlantingId: number;
            notes?: string;
            /**
             * Format: int32
             * @description Number of plants to reassign from the planting's original substratum to the new one. Must be less than or equal to the number of plants in the original planting.
             */
            numPlants: number;
            /**
             * Format: int64
             * @deprecated
             * @description Use toSubstratumId instead
             */
            toPlantingSubzoneId?: number;
            /** Format: int64 */
            toSubstratumId?: number;
        };
        RecordTimeseriesValuesRequestPayload: {
            timeseries: components["schemas"]["TimeseriesValuesPayload"][];
        };
        /** @description Results of a request to record timeseries values. */
        RecordTimeseriesValuesResponsePayload: {
            error?: components["schemas"]["ErrorDetails"];
            /** @description List of values that the server failed to record. Will not be included if all the values were recorded successfully. */
            failures?: components["schemas"]["TimeseriesValuesErrorPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        RecordedPlantPayload: {
            /** @enum {string} */
            certainty: "Known" | "Other" | "Unknown";
            /** @description GPS coordinates where plant was observed. */
            gpsCoordinates: Omit<components["schemas"]["Point"], "type">;
            /** Format: int64 */
            id?: number;
            /**
             * Format: int64
             * @description Required if certainty is Known. Ignored if certainty is Other or Unknown.
             */
            speciesId?: number;
            /** @description If certainty is Other, the optional user-supplied name of the species. Ignored if certainty is Known or Unknown. */
            speciesName?: string;
            /** @enum {string} */
            status: "Live" | "Dead" | "Existing";
        };
        RecordedTreeSubjectPayload: Omit<WithRequired<components["schemas"]["EventSubjectPayload"], "fullText" | "shortText">, "type"> & {
            /** Format: int64 */
            monitoringPlotId: number;
            /** Format: int64 */
            observationId: number;
            /** Format: int64 */
            plantingSiteId: number;
            /** Format: int64 */
            recordedTreeId: number;
            /** @enum {string} */
            treeGrowthForm: "Tree" | "Shrub" | "Trunk";
            /** Format: int32 */
            treeNumber: number;
            /** Format: int32 */
            trunkNumber: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "RecordedTree";
        };
        RecordedTreeUpdateOperationPayload: Omit<components["schemas"]["ObservationUpdateOperationPayload"], "type"> & {
            description?: string;
            /** @description Only valid for Tree and Trunk growth forms. */
            diameterAtBreastHeight?: number;
            /** @description Only valid for Tree and Trunk growth forms. */
            height?: number;
            isDead?: boolean;
            /** @description Only valid for Tree and Trunk growth forms. */
            pointOfMeasurement?: number;
            /**
             * Format: int64
             * @description ID of tree to update.
             */
            recordedTreeId: number;
            /**
             * Format: int32
             * @description Only valid for Shrub growth form.
             */
            shrubDiameter?: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "RecordedTree";
        };
        ReplaceObservationPlotRequestPayload: {
            /** @enum {string} */
            duration: "Temporary" | "LongTerm";
            justification: string;
        };
        ReplaceObservationPlotResponsePayload: {
            /** @description IDs of monitoring plots that were added to the observation. Empty if no plots were added. */
            addedMonitoringPlotIds: number[];
            /** @description IDs of monitoring plots that were removed from the observation. Will usually include the requested plot ID, but may be empty if the replacement request couldn't be satisfied. */
            removedMonitoringPlotIds: number[];
            status: components["schemas"]["SuccessOrError"];
        };
        /** @description Operation that replaces all the values of a variable with new ones. This is an "upsert" operation: it replaces any existing values, or creates new values if there weren't already any.
         *
         *     This operation may not be used with table variables.
         *
         *     If the variable is a list and previously had more values than are included in this payload, the existing values with higher-numbered list positions are deleted.
         *
         *     If the variable is not a list, it is invalid for this payload to include more than one value. */
        ReplaceValuesOperationPayload: Omit<components["schemas"]["ValueOperationPayload"], "operation"> & {
            /**
             * Format: int64
             * @description If the variable is a table column, the value ID of the row whose values should be replaced.
             */
            rowValueId?: number;
            values: (components["schemas"]["NewDateValuePayload"] | components["schemas"]["NewEmailValuePayload"] | components["schemas"]["NewImageValuePayload"] | components["schemas"]["NewLinkValuePayload"] | components["schemas"]["NewNumberValuePayload"] | components["schemas"]["NewSectionTextValuePayload"] | components["schemas"]["NewSectionVariableValuePayload"] | components["schemas"]["NewSelectValuePayload"] | components["schemas"]["NewTableValuePayload"] | components["schemas"]["NewTextValuePayload"])[];
            /** Format: int64 */
            variableId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "Replace";
        };
        ReportChallengePayload: {
            challenge: string;
            mitigationPlan: string;
        };
        ReportMetricTargetPayload: {
            /** Format: int64 */
            reportId: number;
            /** Format: int32 */
            target?: number;
        };
        ReportPhotoPayload: {
            caption?: string;
            /** Format: int64 */
            fileId: number;
        };
        ReportProjectMetricEntriesPayload: {
            /** Format: int64 */
            id: number;
            progressNotes?: string;
            projectsComments?: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: int32 */
            target?: number;
            /** Format: int32 */
            value?: number;
        };
        ReportProjectMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            /** Format: int64 */
            id: number;
            isPublishable: boolean;
            name: string;
            progressNotes?: string;
            projectsComments?: string;
            reference: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: int32 */
            target?: number;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
            unit?: string;
            /** Format: int32 */
            value?: number;
        };
        ReportReviewPayload: {
            achievements: string[];
            additionalComments?: string;
            challenges: components["schemas"]["ReportChallengePayload"][];
            feedback?: string;
            financialSummaries?: string;
            highlights?: string;
            internalComment?: string;
            /**
             * @description Must be unchanged if a report has not been submitted yet.
             * @enum {string}
             */
            status: "Not Submitted" | "Submitted" | "Approved" | "Needs Update" | "Not Needed";
        };
        ReportStandardMetricEntriesPayload: {
            /** Format: int64 */
            id: number;
            progressNotes?: string;
            projectsComments?: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: int32 */
            target?: number;
            /** Format: int32 */
            value?: number;
        };
        ReportStandardMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            /** Format: int64 */
            id: number;
            isPublishable: boolean;
            name: string;
            progressNotes?: string;
            projectsComments?: string;
            reference: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: int32 */
            target?: number;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
            /** Format: int32 */
            value?: number;
        };
        ReportSystemMetricEntriesPayload: {
            /** @enum {string} */
            metric: "Seeds Collected" | "Seedlings" | "Trees Planted" | "Species Planted" | "Hectares Planted" | "Survival Rate";
            /** Format: int32 */
            overrideValue?: number;
            progressNotes?: string;
            projectsComments?: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: int32 */
            target?: number;
        };
        ReportSystemMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description?: string;
            isPublishable: boolean;
            /** @enum {string} */
            metric: "Seeds Collected" | "Seedlings" | "Trees Planted" | "Species Planted" | "Hectares Planted" | "Survival Rate";
            /** Format: int32 */
            overrideValue?: number;
            progressNotes?: string;
            projectsComments?: string;
            reference: string;
            /** @enum {string} */
            status?: "Achieved" | "On-Track" | "Unlikely";
            /** Format: date-time */
            systemTime?: string;
            /** Format: int32 */
            systemValue: number;
            /** Format: int32 */
            target?: number;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
        };
        ReportedSpeciesPayload: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            plantsSinceLastObservation: number;
            /** Format: int32 */
            totalPlants: number;
        };
        RescheduleObservationRequestPayload: {
            /**
             * Format: date
             * @description The end date for this observation, should be limited to 2 months from the start date .
             */
            endDate: string;
            /**
             * Format: date
             * @description The start date for this observation, can be up to a year from the date this schedule request occurs on.
             */
            startDate: string;
        };
        ResolveUploadRequestPayload: {
            /** @description If true, the data for entries that already exist will be overwritten with the values in the uploaded file. If false, only entries that don't already exist will be imported. */
            overwriteExisting: boolean;
        };
        ReviewAcceleratorReportMetricsRequestPayload: {
            projectMetrics: components["schemas"]["ReportProjectMetricEntriesPayload"][];
            standardMetrics: components["schemas"]["ReportStandardMetricEntriesPayload"][];
            systemMetrics: components["schemas"]["ReportSystemMetricEntriesPayload"][];
        };
        ReviewAcceleratorReportRequestPayload: {
            review: components["schemas"]["ReportReviewPayload"];
        };
        ReviewApplicationRequestPayload: {
            feedback?: string;
            internalComment?: string;
            /** @enum {string} */
            status: "Not Submitted" | "Failed Pre-screen" | "Passed Pre-screen" | "Submitted" | "Sourcing Team Review" | "GIS Assessment" | "Expert Review" | "Carbon Assessment" | "P0 Eligible" | "Accepted" | "Issue Active" | "Issue Reassessment" | "Not Eligible";
        };
        ScheduleObservationRequestPayload: {
            /**
             * Format: date
             * @description The end date for this observation, should be limited to 2 months from the start date.
             */
            endDate: string;
            /**
             * Format: int64
             * @description Which planting site this observation needs to be scheduled for.
             */
            plantingSiteId: number;
            /** @description The IDs of the substrata this observation should cover. */
            requestedSubstratumIds?: number[];
            /**
             * @deprecated
             * @description Use requestedSubstratumIds instead
             */
            requestedSubzoneIds?: number[];
            /**
             * Format: date
             * @description The start date for this observation, can be up to a year from the date this schedule request occurs on.
             */
            startDate: string;
        };
        ScheduleObservationResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        Score: {
            /** @enum {string} */
            category: "Carbon" | "Finance" | "Forestry" | "Legal" | "Social Impact" | "GIS" | "Climate Impact" | "Expansion Potential" | "Experience and Understanding" | "Operational Capacity" | "Responsiveness and Attention to Detail" | "Values Alignment";
            /** Format: date-time */
            modifiedTime: string;
            qualitative?: string;
            /**
             * Format: int32
             * @description If `null`, a score has not been selected.
             */
            value?: number;
        };
        SearchCountResponsePayload: {
            /** Format: int64 */
            count: number;
        };
        /** @description A search criterion. The search will return results that match this criterion. The criterion can be composed of other search criteria to form arbitrary Boolean search expressions. TYPESCRIPT-OVERRIDE-TYPE-WITH-ANY */
        SearchNodePayload: {
            operation: "and" | "field" | "not" | "or";
            [key: string]: any;
        };
        SearchRequestPayload: {
            count?: number;
            cursor?: string;
            fields: string[];
            filters?: components["schemas"]["PrefixedSearch"][];
            prefix?: "accessionCollectors" | "accessions" | "bags" | "batchSubLocations" | "batchWithdrawals" | "batches" | "cohortModules" | "cohorts" | "countries" | "countrySubdivisions" | "deliverables" | "deliveries" | "documentTemplates" | "documents" | "draftPlantingSites" | "events" | "facilities" | "facilityInventories" | "facilityInventoryTotals" | "geolocations" | "internalTags" | "inventories" | "modules" | "monitoringPlotHistories" | "monitoringPlots" | "nurserySpeciesProjects" | "nurseryWithdrawals" | "observationBiomassDetails" | "observationBiomassQuadratSpecies" | "observationBiomassSpecies" | "observationPlotConditions" | "observationPlots" | "observations" | "organizationInternalTags" | "organizationUsers" | "organizations" | "participantProjectSpecies" | "participants" | "plantingSeasons" | "plantingSiteHistories" | "plantingSitePopulations" | "plantingSites" | "plantings" | "projectAcceleratorDetails" | "projectDeliverables" | "projectInternalUsers" | "projectLandUseModelTypes" | "projectVariableValues" | "projectVariables" | "projects" | "recordedTrees" | "reports" | "species" | "speciesEcosystemTypes" | "speciesGrowthForms" | "speciesPlantMaterialSourcingMethods" | "speciesProblems" | "speciesSuccessionalGroups" | "strata" | "stratumHistories" | "stratumPopulations" | "subLocations" | "substrata" | "substratumHistories" | "substratumPopulations" | "users" | "variableSelectOptions" | "viabilityTestResults" | "viabilityTests" | "withdrawals";
            search?: components["schemas"]["SearchNodePayload"];
            sortOrder?: components["schemas"]["SearchSortOrderElement"][];
        };
        SearchResponsePayload: {
            cursor?: string;
            results: {
                [key: string]: unknown;
            }[];
        };
        SearchSortOrderElement: {
            field: string;
            direction?: "Ascending" | "Descending";
        };
        SearchValuesResponsePayload: {
            results: {
                [key: string]: components["schemas"]["FieldValuesPayload"];
            };
        };
        SectionVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            children: components["schemas"]["SectionVariablePayload"][];
            /** @description IDs of variables that this section recommends. */
            recommends: number[];
            renderHeading: boolean;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Section";
        };
        SeedCountSummaryPayload: {
            /**
             * Format: int64
             * @description Total number of seeds remaining in accessions whose quantities are measured in seeds.
             */
            subtotalBySeedCount: number;
            /**
             * Format: int64
             * @description Estimated total number of seeds remaining in accessions whose quantities are measured by weight. This estimate is based on the subset weight and count. Accessions measured by weight that don't have subset weights and counts are not included in this estimate.
             */
            subtotalByWeightEstimate: number;
            /**
             * Format: int64
             * @description Total number of seeds remaining. The sum of subtotalBySeedCount and subtotalByWeightEstimate.
             */
            total: number;
            /**
             * Format: int32
             * @description Number of accessions that are measured by weight and don't have subset weight and count data. The system cannot estimate how many seeds they have.
             */
            unknownQuantityAccessions: number;
        };
        /** @description Represents a quantity of seeds, measured either in individual seeds or by weight. */
        SeedQuantityPayload: {
            /** @description If this quantity is a weight measurement, the weight in grams. This is not set if the "units" field is "Seeds". This is always calculated on the server side and is ignored on input. */
            readonly grams?: number;
            /** @description Number of units of seeds. If "units" is "Seeds", this is the number of seeds and must be an integer. Otherwise it is a measurement in the weight units specified in the "units" field, and may have a fractional part. */
            quantity: number;
            /** @enum {string} */
            units: "Seeds" | "Grams" | "Milligrams" | "Kilograms" | "Ounces" | "Pounds";
        };
        SelectOptionPayload: {
            description?: string;
            /** Format: int64 */
            id: number;
            name: string;
            renderedText?: string;
        };
        SelectVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            isMultiple: boolean;
            options: components["schemas"]["SelectOptionPayload"][];
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Select";
        };
        SendFacilityAlertRequestPayload: {
            /** @description Alert body in plain text. HTML alerts are not supported yet. */
            body: string;
            subject: string;
        };
        SimpleErrorResponsePayload: {
            error: components["schemas"]["ErrorDetails"];
            status: components["schemas"]["SuccessOrError"];
        };
        SimpleSuccessResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
        };
        SimpleUserPayload: {
            fullName: string;
            /** Format: int64 */
            userId: number;
        };
        SiteT0DataResponsePayload: {
            /** Format: int64 */
            plantingSiteId: number;
            plots: components["schemas"]["PlotT0DataPayload"][];
            strata: components["schemas"]["StratumT0DataPayload"][];
            survivalRateIncludesTempPlots: boolean;
            zones: components["schemas"]["ZoneT0DataPayload"][];
        };
        SpeciesDensityPayload: {
            density: number;
            plotDensity: number;
            /** Format: int64 */
            speciesId: number;
        };
        SpeciesForParticipantProjectPayload: {
            participantProjectSpecies: components["schemas"]["ParticipantProjectSpeciesPayload"];
            project: components["schemas"]["ProjectPayload"];
            species: components["schemas"]["SpeciesResponseElement"];
        };
        SpeciesLookupCommonNamePayload: {
            /** @description ISO 639-1 two-letter language code indicating the name's language. Some common names in the server's taxonomic database are not tagged with languages; this value will not be present for those names. */
            language?: string;
            name: string;
        };
        SpeciesLookupDetailsResponsePayload: {
            /** @description List of known common names for the species, if any. */
            commonNames?: components["schemas"]["SpeciesLookupCommonNamePayload"][];
            /**
             * @description IUCN Red List conservation category code.
             * @enum {string}
             */
            conservationCategory?: "CR" | "DD" | "EN" | "EW" | "EX" | "LC" | "NE" | "NT" | "VU";
            familyName: string;
            /**
             * @description If this is not the accepted name for the species, the type of problem the name has. Currently, this will always be "Name Is Synonym".
             * @enum {string}
             */
            problemType?: "Name Misspelled" | "Name Not Found" | "Name Is Synonym";
            scientificName: string;
            /** @description If this is not the accepted name for the species, the name to suggest as an alternative. */
            suggestedScientificName?: string;
        };
        SpeciesLookupNamesResponsePayload: {
            names: string[];
            /** @description True if there were more matching names than could be included in the response. */
            partial: boolean;
            status: components["schemas"]["SuccessOrError"];
        };
        SpeciesPayload: Record<string, never>;
        SpeciesProblemElement: {
            /** @enum {string} */
            field: "Scientific Name";
            /** Format: int64 */
            id: number;
            /** @description Value for the field in question that would correct the problem. Absent if the system is unable to calculate a corrected value. */
            suggestedValue?: string;
            /** @enum {string} */
            type: "Name Misspelled" | "Name Not Found" | "Name Is Synonym";
        };
        SpeciesRequestPayload: {
            averageWoodDensity?: number;
            commonName?: string;
            /**
             * @description IUCN Red List conservation category code.
             * @enum {string}
             */
            conservationCategory?: "CR" | "DD" | "EN" | "EW" | "EX" | "LC" | "NE" | "NT" | "VU";
            dbhSource?: string;
            dbhValue?: number;
            ecologicalRoleKnown?: string;
            ecosystemTypes?: ("Boreal forests/Taiga" | "Deserts and xeric shrublands" | "Flooded grasslands and savannas" | "Mangroves" | "Mediterranean forests, woodlands and scrubs" | "Montane grasslands and shrublands" | "Temperate broad leaf and mixed forests" | "Temperate coniferous forest" | "Temperate grasslands, savannas and shrublands" | "Tropical and subtropical coniferous forests" | "Tropical and subtropical dry broad leaf forests" | "Tropical and subtropical grasslands, savannas and shrublands" | "Tropical and subtropical moist broad leaf forests" | "Tundra")[];
            familyName?: string;
            growthForms?: ("Tree" | "Shrub" | "Forb" | "Graminoid" | "Fern" | "Fungus" | "Lichen" | "Moss" | "Vine" | "Liana" | "Subshrub" | "Multiple Forms" | "Mangrove" | "Herb")[];
            heightAtMaturitySource?: string;
            heightAtMaturityValue?: number;
            localUsesKnown?: string;
            nativeEcosystem?: string;
            /**
             * Format: int64
             * @description Which organization's species list to update.
             */
            organizationId: number;
            otherFacts?: string;
            plantMaterialSourcingMethods?: ("Seed collection & germination" | "Seed purchase & germination" | "Mangrove propagules" | "Vegetative propagation" | "Wildling harvest" | "Seedling purchase" | "Other")[];
            rare?: boolean;
            scientificName: string;
            /** @enum {string} */
            seedStorageBehavior?: "Orthodox" | "Recalcitrant" | "Intermediate" | "Unknown" | "Likely Orthodox" | "Likely Recalcitrant" | "Likely Intermediate" | "Intermediate - Cool Temperature Sensitive" | "Intermediate - Partial Desiccation Tolerant" | "Intermediate - Short Lived" | "Likely Intermediate - Cool Temperature Sensitive" | "Likely Intermediate - Partial Desiccation Tolerant" | "Likely Intermediate - Short Lived";
            successionalGroups?: ("Pioneer" | "Early secondary" | "Late secondary" | "Mature")[];
            /** @enum {string} */
            woodDensityLevel?: "Species" | "Genus" | "Family";
        };
        SpeciesResponseElement: {
            averageWoodDensity?: number;
            commonName?: string;
            /**
             * @description IUCN Red List conservation category code.
             * @enum {string}
             */
            conservationCategory?: "CR" | "DD" | "EN" | "EW" | "EX" | "LC" | "NE" | "NT" | "VU";
            /** Format: date-time */
            createdTime: string;
            dbhSource?: string;
            dbhValue?: number;
            ecologicalRoleKnown?: string;
            ecosystemTypes?: ("Boreal forests/Taiga" | "Deserts and xeric shrublands" | "Flooded grasslands and savannas" | "Mangroves" | "Mediterranean forests, woodlands and scrubs" | "Montane grasslands and shrublands" | "Temperate broad leaf and mixed forests" | "Temperate coniferous forest" | "Temperate grasslands, savannas and shrublands" | "Tropical and subtropical coniferous forests" | "Tropical and subtropical dry broad leaf forests" | "Tropical and subtropical grasslands, savannas and shrublands" | "Tropical and subtropical moist broad leaf forests" | "Tundra")[];
            familyName?: string;
            growthForms?: ("Tree" | "Shrub" | "Forb" | "Graminoid" | "Fern" | "Fungus" | "Lichen" | "Moss" | "Vine" | "Liana" | "Subshrub" | "Multiple Forms" | "Mangrove" | "Herb")[];
            heightAtMaturitySource?: string;
            heightAtMaturityValue?: number;
            /** Format: int64 */
            id: number;
            localUsesKnown?: string;
            /** Format: date-time */
            modifiedTime: string;
            nativeEcosystem?: string;
            otherFacts?: string;
            plantMaterialSourcingMethods?: ("Seed collection & germination" | "Seed purchase & germination" | "Mangrove propagules" | "Vegetative propagation" | "Wildling harvest" | "Seedling purchase" | "Other")[];
            problems?: components["schemas"]["SpeciesProblemElement"][];
            rare?: boolean;
            scientificName: string;
            /** @enum {string} */
            seedStorageBehavior?: "Orthodox" | "Recalcitrant" | "Intermediate" | "Unknown" | "Likely Orthodox" | "Likely Recalcitrant" | "Likely Intermediate" | "Intermediate - Cool Temperature Sensitive" | "Intermediate - Partial Desiccation Tolerant" | "Intermediate - Short Lived" | "Likely Intermediate - Cool Temperature Sensitive" | "Likely Intermediate - Partial Desiccation Tolerant" | "Likely Intermediate - Short Lived";
            successionalGroups?: ("Pioneer" | "Early secondary" | "Late secondary" | "Mature")[];
            /** @enum {string} */
            woodDensityLevel?: "Species" | "Genus" | "Family";
        };
        SpeciesSummaryNurseryPayload: {
            /** Format: int64 */
            facilityId: number;
            name: string;
        };
        SpeciesSummaryPayload: {
            /** Format: int64 */
            activeGrowthQuantity: number;
            /** Format: int64 */
            germinatingQuantity: number;
            /** Format: int32 */
            germinationRate?: number;
            /** Format: int64 */
            hardeningOffQuantity: number;
            /**
             * Format: int32
             * @description Percentage of current and past inventory that was withdrawn due to death.
             */
            lossRate?: number;
            /** Format: int64 */
            notReadyQuantity: number;
            nurseries: components["schemas"]["SpeciesSummaryNurseryPayload"][];
            /** Format: int64 */
            readyQuantity: number;
            /** Format: int64 */
            speciesId: number;
            /**
             * Format: int64
             * @description Total number of germinated plants that have been withdrawn due to death.
             */
            totalDead: number;
            /**
             * Format: int64
             * @description Total number of germinated plants currently in inventory.
             */
            totalQuantity: number;
            /**
             * Format: int64
             * @description Total number of germinated plants that have been withdrawn in the past.
             */
            totalWithdrawn: number;
        };
        StratumHistoryResponsePayload: {
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            /** Format: int64 */
            id: number;
            name: string;
            /**
             * Format: int64
             * @description ID of stratum if it exists in the current version of the site.
             */
            stratumId?: number;
            substrata: components["schemas"]["SubstratumHistoryResponsePayload"][];
        };
        StratumObservationSummaryPayload: {
            /** @description Area of this stratum in hectares. */
            areaHa: number;
            /**
             * Format: date-time
             * @description The earliest time of the observations used in this summary.
             */
            earliestObservationTime: string;
            /**
             * Format: int32
             * @description Estimated number of plants in stratum based on estimated planting density and stratum area. Only present if all the substrata in the stratum have been marked as having completed planting.
             */
            estimatedPlants?: number;
            /**
             * Format: date-time
             * @description The latest time of the observations used in this summary.
             */
            latestObservationTime: string;
            /**
             * Format: int32
             * @description Estimated planting density for the stratum based on the observed planting densities of monitoring plots.
             */
            plantingDensity: number;
            /** Format: int32 */
            plantingDensityStdDev?: number;
            /** @description Combined list of observed species and their statuses from the latest observation of each substratum. */
            species: components["schemas"]["ObservationSpeciesResultsPayload"][];
            /** Format: int64 */
            stratumId: number;
            /** @description List of substratum observations used in this summary. */
            substrata: components["schemas"]["ObservationSubstratumResultsPayload"][];
            /**
             * Format: int32
             * @description Percentage of plants of all species in this stratum's permanent monitoring plots that have survived since the t0 point.
             */
            survivalRate?: number;
            /** Format: int32 */
            survivalRateStdDev?: number;
            /**
             * Format: int32
             * @description Total number of plants recorded from the latest observations of each substratum. Includes all plants, regardless of live/dead status or species.
             */
            totalPlants: number;
            /**
             * Format: int32
             * @description Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total.
             */
            totalSpecies: number;
        };
        StratumReportedPlantsResponsePayload: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            plantsSinceLastObservation: number;
            /** Format: int32 */
            progressPercent: number;
            species: components["schemas"]["ReportedSpeciesPayload"][];
            substrata: components["schemas"]["SubstratumReportedPlantsResponsePayload"][];
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        StratumResponsePayload: {
            /** @description Area of stratum in hectares. */
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            /**
             * Format: date-time
             * @description When the boundary of this stratum was last modified. Modifications of other attributes of the stratum do not cause this timestamp to change.
             */
            boundaryModifiedTime: string;
            /** Format: int64 */
            id: number;
            /** Format: date-time */
            latestObservationCompletedTime?: string;
            /** Format: int64 */
            latestObservationId?: number;
            name: string;
            /** Format: int32 */
            numPermanentPlots: number;
            /** Format: int32 */
            numTemporaryPlots: number;
            substrata: components["schemas"]["SubstratumResponsePayload"][];
            targetPlantingDensity: number;
        };
        StratumT0DataPayload: {
            densityData: components["schemas"]["SpeciesDensityPayload"][];
            /** Format: int64 */
            stratumId: number;
        };
        SubLocationPayload: {
            /**
             * Format: int32
             * @description If this sub-location is at a seed bank, the number of active accessions stored there.
             */
            activeAccessions?: number;
            /**
             * Format: int32
             * @description If this sub-location is at a nursery, the number of batches stored there that have seedlings.
             */
            activeBatches?: number;
            /** Format: int64 */
            facilityId: number;
            /** Format: int64 */
            id: number;
            name: string;
        };
        SubmissionDocumentPayload: {
            /** Format: date-time */
            createdTime: string;
            description?: string;
            /** @enum {string} */
            documentStore: "Dropbox" | "Google" | "External";
            /** Format: int64 */
            id: number;
            name: string;
            originalName?: string;
        };
        SubmitApplicationResponsePayload: {
            application: components["schemas"]["ApplicationPayload"];
            /** @description If the application failed any of the pre-screening checks, a list of the reasons why. Empty if the application passed pre-screening. */
            problems: string[];
            status: components["schemas"]["SuccessOrError"];
        };
        SubmitSupportRequestPayload: {
            attachmentComment?: string;
            attachmentIds?: string[];
            description: string;
            /** @enum {string} */
            requestType: "Bug Report" | "Feature Request" | "Contact Us";
            summary: string;
        };
        SubmitSupportRequestResponsePayload: {
            issueKey: string;
            status: components["schemas"]["SuccessOrError"];
        };
        SubstratumHistoryResponsePayload: {
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            fullName: string;
            /** Format: int64 */
            id: number;
            monitoringPlots: components["schemas"]["MonitoringPlotHistoryPayload"][];
            name: string;
            /**
             * Format: int64
             * @description ID of substratum if it exists in the current version of the site.
             */
            substratumId?: number;
        };
        SubstratumReportedPlantsResponsePayload: {
            /** Format: int64 */
            id: number;
            /** Format: int32 */
            plantsSinceLastObservation: number;
            species: components["schemas"]["ReportedSpeciesPayload"][];
            /** Format: int32 */
            totalPlants: number;
            /** Format: int32 */
            totalSpecies: number;
        };
        SubstratumResponsePayload: {
            /** @description Area of substratum in hectares. */
            areaHa: number;
            boundary: components["schemas"]["MultiPolygon"];
            fullName: string;
            /** Format: int64 */
            id: number;
            /** Format: date-time */
            latestObservationCompletedTime?: string;
            /** Format: int64 */
            latestObservationId?: number;
            monitoringPlots: components["schemas"]["MonitoringPlotPayload"][];
            name: string;
            /**
             * Format: date-time
             * @description When any monitoring plot in the substratum was most recently observed.
             */
            observedTime?: string;
            plantingCompleted: boolean;
            /**
             * Format: date-time
             * @description When planting of the substratum was marked as completed.
             */
            plantingCompletedTime?: string;
        };
        SubstratumSpeciesPayload: components["schemas"]["SpeciesPayload"] & {
            commonName?: string;
            /** Format: int64 */
            id: number;
            scientificName: string;
        };
        /**
         * @description Indicates of success or failure of the requested operation.
         * @enum {string}
         */
        SuccessOrError: "ok" | "error";
        SuccessResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
        };
        SummarizeAccessionSearchRequestPayload: {
            search?: components["schemas"]["SearchNodePayload"];
        };
        SummarizeAccessionSearchResponsePayload: {
            /** Format: int32 */
            accessions: number;
            seedsRemaining: components["schemas"]["SeedCountSummaryPayload"];
            /** Format: int32 */
            species: number;
            status: components["schemas"]["SuccessOrError"];
        };
        /** @description Summary of important statistics about the seed bank for the Summary page. */
        SummaryResponsePayload: {
            /** @description Number of accessions in each state. */
            accessionsByState: {
                [key: string]: number;
            };
            /** Format: int32 */
            activeAccessions: number;
            /** @description Summary of the number of seeds remaining across all active accessions. */
            seedsRemaining: components["schemas"]["SeedCountSummaryPayload"];
            /** Format: int32 */
            species: number;
            status: components["schemas"]["SuccessOrError"];
        };
        SystemMetricPayload: {
            /** @enum {string} */
            component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
            description: string;
            /** @enum {string} */
            metric: "Seeds Collected" | "Seedlings" | "Trees Planted" | "Species Planted" | "Hectares Planted" | "Survival Rate";
            name: string;
            reference: string;
            /** @enum {string} */
            type: "Activity" | "Output" | "Outcome" | "Impact";
        };
        TableColumnPayload: {
            isHeader: boolean;
            variable: components["schemas"]["VariablePayload"];
        };
        TableVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            columns: components["schemas"]["TableColumnPayload"][];
            /** @enum {string} */
            tableStyle: "Horizontal" | "Vertical";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Table";
        };
        TemporaryAttachment: {
            filename: string;
            temporaryAttachmentId: string;
        };
        TerraformationContactUserPayload: {
            email: string;
            firstName?: string;
            lastName?: string;
            /** Format: int64 */
            userId: number;
        };
        TextVariablePayload: Omit<WithRequired<components["schemas"]["VariablePayload"], "id" | "internalOnly" | "isList" | "isRequired" | "name" | "stableId" | "type">, "type"> & {
            /** @enum {string} */
            textType: "SingleLine" | "MultiLine";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "Text";
        };
        TimeZonePayload: {
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            id: string;
            /**
             * @description Long name of time zone, possibly including a city name. This name is guaranteed to be unique across all zones.
             * @example Central European Time - Berlin
             */
            longName: string;
        };
        TimeseriesPayload: {
            /**
             * Format: int32
             * @description Number of significant fractional digits (after the decimal point), if this is a timeseries with non-integer numeric values.
             */
            decimalPlaces?: number;
            /**
             * Format: int64
             * @description ID of device that produces this timeseries.
             */
            deviceId: number;
            /** @description If any values have been recorded for the timeseries, the latest one. */
            latestValue?: components["schemas"]["TimeseriesValuePayload"];
            timeseriesName: string;
            /** @enum {string} */
            type: "Numeric" | "Text";
            /**
             * @description Units of measure for values in this timeseries.
             * @example volts
             */
            units?: string;
        };
        TimeseriesValuePayload: {
            /** Format: date-time */
            timestamp: string;
            /** @description Value to record. If the timeseries is of type Numeric, this must be a decimal or integer value in string form. If the timeseries is of type Text, this can be an arbitrary string. */
            value: string;
        };
        TimeseriesValuesErrorPayload: {
            /**
             * Format: int64
             * @description Device ID as specified in the failing request.
             */
            deviceId: number;
            /** @description Human-readable details about the failure. */
            message: string;
            /** @description Name of timeseries as specified in the failing request. */
            timeseriesName: string;
            /** @description Values that the server was not able to successfully record. */
            values: components["schemas"]["TimeseriesValuePayload"][];
        };
        TimeseriesValuesPayload: {
            /**
             * Format: int64
             * @description ID of device that produced this value.
             */
            deviceId: number;
            /** @description Name of timeseries. This must be the name of a timeseries that has already been created for the device. */
            timeseriesName: string;
            values: components["schemas"]["TimeseriesValuePayload"][];
        };
        UpdateAcceleratorReportConfigPayload: {
            /** Format: uri */
            logframeUrl?: string;
            /** Format: date */
            reportingEndDate: string;
            /** Format: date */
            reportingStartDate: string;
        };
        UpdateAcceleratorReportConfigRequestPayload: {
            config: components["schemas"]["UpdateAcceleratorReportConfigPayload"];
        };
        UpdateAcceleratorReportPhotoRequestPayload: {
            caption?: string;
        };
        UpdateAcceleratorReportValuesRequestPayload: {
            achievements: string[];
            additionalComments?: string;
            challenges: components["schemas"]["ReportChallengePayload"][];
            financialSummaries?: string;
            highlights?: string;
            projectMetrics: components["schemas"]["ReportProjectMetricEntriesPayload"][];
            standardMetrics: components["schemas"]["ReportStandardMetricEntriesPayload"][];
            systemMetrics: components["schemas"]["ReportSystemMetricEntriesPayload"][];
        };
        UpdateAccessionRequestPayloadV2: {
            bagNumbers?: string[];
            /** Format: date */
            collectedDate?: string;
            collectionSiteCity?: string;
            collectionSiteCoordinates?: components["schemas"]["Geolocation"][];
            collectionSiteCountryCode?: string;
            collectionSiteCountrySubdivision?: string;
            collectionSiteLandowner?: string;
            collectionSiteName?: string;
            collectionSiteNotes?: string;
            /** @enum {string} */
            collectionSource?: "Wild" | "Reintroduced" | "Cultivated" | "Other";
            collectors?: string[];
            /** Format: date */
            dryingEndDate?: string;
            /** Format: int64 */
            facilityId?: number;
            notes?: string;
            plantId?: string;
            /**
             * Format: int32
             * @description Estimated number of plants the seeds were collected from.
             */
            plantsCollectedFrom?: number;
            /** Format: int64 */
            projectId?: number;
            /** Format: date */
            receivedDate?: string;
            /** @description Quantity of seeds remaining in the accession. If this is different than the existing value, it is considered a new observation, and the new value will override any previously-calculated remaining quantities. */
            remainingQuantity?: components["schemas"]["SeedQuantityPayload"];
            /** @description Notes associated with remaining quantity updates if any. */
            remainingQuantityNotes?: string;
            /** Format: int64 */
            speciesId?: number;
            /** @enum {string} */
            state?: "Awaiting Check-In" | "Awaiting Processing" | "Processing" | "Drying" | "In Storage" | "Used Up";
            subLocation?: string;
            /** Format: int32 */
            subsetCount?: number;
            /** @description Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
            subsetWeight?: components["schemas"]["SeedQuantityPayload"];
            /** Format: int32 */
            viabilityPercent?: number;
        };
        UpdateAccessionResponsePayloadV2: {
            accession: components["schemas"]["AccessionPayloadV2"];
            status: components["schemas"]["SuccessOrError"];
        };
        UpdateActivityMediaRequestPayload: {
            caption?: string;
            isCoverPhoto: boolean;
            isHiddenOnMap: boolean;
            /** Format: int32 */
            listPosition: number;
        };
        UpdateActivityRequestPayload: {
            /** Format: date */
            date: string;
            description: string;
            /** @enum {string} */
            status: "Not Verified" | "Verified" | "Do Not Use";
            /** @enum {string} */
            type: "Seed Collection" | "Nursery and Propagule Operations" | "Planting" | "Monitoring" | "Site Visit" | "Social Impact" | "Drone Flight" | "Others";
        };
        UpdateApplicationBoundaryRequestPayload: {
            boundary: components["schemas"]["MultiPolygon"] | components["schemas"]["Polygon"];
        };
        UpdateAutomationRequestPayload: {
            description?: string;
            /** Format: int64 */
            deviceId?: number;
            /** Format: double */
            lowerThreshold?: number;
            name: string;
            settings?: {
                [key: string]: unknown;
            };
            timeseriesName?: string;
            type: string;
            /** Format: double */
            upperThreshold?: number;
            /** Format: int32 */
            verbosity?: number;
        };
        UpdateBatchQuantitiesRequestPayload: {
            /** Format: int32 */
            activeGrowthQuantity: number;
            /** Format: int32 */
            germinatingQuantity: number;
            /** Format: int32 */
            hardeningOffQuantity?: number;
            /** Format: int32 */
            readyQuantity: number;
            /** Format: int32 */
            version: number;
        };
        UpdateBatchRequestPayload: {
            /** Format: date */
            germinationStartedDate?: string;
            notes?: string;
            /** Format: int64 */
            projectId?: number;
            /** Format: date */
            readyByDate?: string;
            /** Format: date */
            seedsSownDate?: string;
            subLocationIds?: number[];
            /** @enum {string} */
            substrate?: "MediaMix" | "Soil" | "Sand" | "Moss" | "PerliteVermiculite" | "Other";
            substrateNotes?: string;
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            treatmentNotes?: string;
            /** Format: int32 */
            version: number;
        };
        UpdateCohortModuleRequestPayload: {
            /** Format: date */
            endDate: string;
            /** Format: date */
            startDate: string;
            title: string;
        };
        UpdateCohortRequestPayload: {
            name: string;
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
        };
        UpdateDeviceRequestPayload: {
            /**
             * @description Protocol-specific address of device, e.g., an IP address or a Bluetooth device ID.
             * @example 192.168.1.100
             */
            address?: string;
            /**
             * @description Name of device manufacturer.
             * @example InHand Networks
             */
            make: string;
            /**
             * @description Model number or model name of the device.
             * @example IR915L
             */
            model: string;
            /**
             * @description Name of this device.
             * @example BMU-1
             */
            name: string;
            /**
             * Format: int64
             * @description ID of parent device such as a hub or gateway, if any. The parent device must exist.
             */
            parentId?: number;
            /**
             * Format: int32
             * @description Port number if relevant for the protocol.
             * @example 50000
             */
            port?: number;
            /**
             * @description Device manager protocol name.
             * @example modbus
             */
            protocol?: string;
            /** @description Protocol- and device-specific custom settings. This is an arbitrary JSON object; the exact settings depend on the device type. */
            settings?: {
                [key: string]: unknown;
            };
            /**
             * @description High-level type of the device. Device manager may use this in conjunction with the make and model to determine which metrics to report.
             * @example inverter
             */
            type: string;
            /**
             * Format: int32
             * @description Level of diagnostic information to log.
             */
            verbosity?: number;
        };
        UpdateDocumentRequestPayload: {
            internalComment?: string;
            name: string;
            /** Format: int64 */
            ownedBy: number;
            /** @enum {string} */
            status: "Draft" | "Locked" | "Published" | "Ready" | "Submitted";
        };
        UpdateDraftPlantingSiteRequestPayload: {
            /** @description In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
            data: {
                [key: string]: unknown;
            };
            description?: string;
            name: string;
            /**
             * Format: int32
             * @deprecated
             * @description Use numSubstrata instead
             */
            numPlantingSubzones?: number;
            /**
             * Format: int32
             * @deprecated
             * @description Use numStrata instead
             */
            numPlantingZones?: number;
            /**
             * Format: int32
             * @description If the user has started defining strata, the number of strata defined so far.
             */
            numStrata?: number;
            /**
             * Format: int32
             * @description If the user has started defining substrata, the number of substrata defined so far.
             */
            numSubstrata?: number;
            /**
             * Format: int64
             * @description If the draft is associated with a project, its ID.
             */
            projectId?: number;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        UpdateFacilityRequestPayload: {
            /** Format: date */
            buildCompletedDate?: string;
            /** Format: date */
            buildStartedDate?: string;
            /**
             * Format: int32
             * @description For nursery facilities, the number of plants this nursery is capable of holding.
             */
            capacity?: number;
            description?: string;
            name: string;
            /** Format: date */
            operationStartedDate?: string;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        UpdateFundingEntityRequestPayload: {
            name: string;
            projects?: number[];
        };
        UpdateGlobalRolesRequestPayload: {
            globalRoles: ("Super-Admin" | "Accelerator Admin" | "TF Expert" | "Read Only")[];
        };
        UpdateMetricTargetsPayload: {
            targets: components["schemas"]["ReportMetricTargetPayload"][];
            type: string;
        };
        UpdateMetricTargetsRequestPayload: {
            metric: components["schemas"]["UpdateProjectMetricTargetsPayload"] | components["schemas"]["UpdateStandardMetricTargetsPayload"] | components["schemas"]["UpdateSystemMetricTargetsPayload"];
        };
        UpdateModuleEventProjectsRequestPayload: {
            addProjects?: number[];
            removeProjects?: number[];
        };
        UpdateModuleEventRequestPayload: {
            /** Format: date-time */
            endTime?: string;
            /** Format: uri */
            meetingUrl?: string;
            /** Format: uri */
            recordingUrl?: string;
            /** Format: uri */
            slidesUrl?: string;
            /** Format: date-time */
            startTime: string;
        };
        UpdateNotificationRequestPayload: {
            read: boolean;
        };
        UpdateNotificationsRequestPayload: {
            /** Format: int64 */
            organizationId?: number;
            read: boolean;
        };
        UpdateObservationRequestPayload: {
            /** @description List of changes to make to different parts of the observation. Changes are all-or-nothing; if any of them fails, none of them is applied. */
            updates: (components["schemas"]["BiomassSpeciesUpdateOperationPayload"] | components["schemas"]["BiomassUpdateOperationPayload"] | components["schemas"]["MonitoringSpeciesUpdateOperationPayload"] | components["schemas"]["ObservationPlotUpdateOperationPayload"] | components["schemas"]["QuadratSpeciesUpdateOperationPayload"] | components["schemas"]["QuadratUpdateOperationPayload"] | components["schemas"]["RecordedTreeUpdateOperationPayload"])[];
        };
        UpdateOrganizationInternalTagsRequestPayload: {
            tagIds: number[];
        };
        UpdateOrganizationRequestPayload: {
            /**
             * @description ISO 3166 alpha-2 code of organization's country.
             * @example AU
             */
            countryCode?: string;
            /**
             * @description ISO 3166-2 code of organization's country subdivision (state, province, region, etc.) This is the full ISO 3166-2 code including the country prefix. If this is set, countryCode must also be set.
             * @example US-HI
             */
            countrySubdivisionCode?: string;
            description?: string;
            name: string;
            /** @enum {string} */
            organizationType?: "Government" | "NGO" | "Arboreta" | "Academia" | "ForProfit" | "Other";
            /** @description Non-empty additional description of organization when type is Other. */
            organizationTypeDetails?: string;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
            website?: string;
        };
        UpdateOrganizationUserRequestPayload: {
            /** @enum {string} */
            role: "Contributor" | "Manager" | "Admin" | "Owner" | "Terraformation Contact";
        };
        UpdateParticipantProjectSpeciesPayload: {
            feedback?: string;
            internalComment?: string;
            rationale?: string;
            /** @enum {string} */
            speciesNativeCategory?: "Native" | "Non-native";
            /** @enum {string} */
            submissionStatus: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
        };
        UpdateParticipantRequestPayload: {
            /**
             * Format: int64
             * @description Assign the participant to this cohort. If null, remove the participant from its current cohort, if any.
             */
            cohortId?: number;
            name: string;
            /** @description Set the participant's list of assigned projects to this. If projects are currently assigned to the participant but aren't included in this list, they will be removed from the participant. */
            projectIds: number[];
        };
        UpdatePlantingSiteRequestPayload: {
            /** @description Site boundary. Ignored if this is a detailed planting site. */
            boundary?: Omit<components["schemas"]["MultiPolygon"], "type">;
            description?: string;
            name: string;
            plantingSeasons?: components["schemas"]["UpdatedPlantingSeasonPayload"][];
            /** Format: int64 */
            projectId?: number;
            survivalRateIncludesTempPlots?: boolean;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        UpdatePlantingSubzoneRequestPayload: {
            plantingCompleted: boolean;
        };
        UpdatePlotObservationRequestPayload: {
            /** @description Observed coordinates, if any, up to one per position. */
            coordinates: components["schemas"]["ObservationMonitoringPlotCoordinatesPayload"][];
        };
        UpdatePlotPhotoRequestPayload: {
            caption?: string;
        };
        UpdateProjectAcceleratorDetailsRequestPayload: {
            accumulationRate?: number;
            annualCarbon?: number;
            applicationReforestableLand?: number;
            carbonCapacity?: number;
            carbonCertifications?: "CCB Standard"[];
            /** Format: uri */
            clickUpLink?: string;
            confirmedReforestableLand?: number;
            countryCode?: string;
            dealDescription?: string;
            dealName?: string;
            /** @enum {string} */
            dealStage?: "Phase 0 (Doc Review)" | "Phase 1" | "Phase 2" | "Phase 3" | "Graduated, Finished Planting" | "Non Graduate" | "Application Submitted" | "Project Lead Screening Review" | "Screening Questions Ready for Review" | "Carbon Pre-Check" | "Submission Requires Follow Up" | "Carbon Eligible" | "Closed Lost" | "Issue Active" | "Issue Pending" | "Issue Reesolved";
            /** @description Path on Dropbox to use for sensitive document storage. Ignored if the user does not have permission to update project document settings. */
            dropboxFolderPath?: string;
            failureRisk?: string;
            fileNaming?: string;
            /** Format: uri */
            gisReportsLink?: string;
            /**
             * Format: uri
             * @description URL of Google Drive folder to use for non-sensitive document storage. Ignored if the user does not have permission to update project document settings.
             */
            googleFolderUrl?: string;
            /** Format: uri */
            hubSpotUrl?: string;
            investmentThesis?: string;
            landUseModelHectares?: {
                [key: string]: number;
            };
            landUseModelTypes: ("Native Forest" | "Monoculture" | "Sustainable Timber" | "Other Timber" | "Mangroves" | "Agroforestry" | "Silvopasture" | "Other Land-Use Model")[];
            maxCarbonAccumulation?: number;
            methodologyNumber?: string;
            minCarbonAccumulation?: number;
            minProjectArea?: number;
            /** Format: int32 */
            numCommunities?: number;
            /** Format: int32 */
            numNativeSpecies?: number;
            perHectareBudget?: number;
            /** @enum {string} */
            pipeline?: "Accelerator Projects" | "Carbon Supply" | "Carbon Waitlist";
            projectArea?: number;
            /** Format: uri */
            riskTrackerLink?: string;
            sdgList?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[];
            /** Format: uri */
            slackLink?: string;
            standard?: string;
            totalCarbon?: number;
            totalExpansionPotential?: number;
            totalVCU?: number;
            /** Format: uri */
            verraLink?: string;
            whatNeedsToBeTrue?: string;
        };
        UpdateProjectAcceleratorReportConfigRequestPayload: {
            config: components["schemas"]["UpdateAcceleratorReportConfigPayload"];
        };
        UpdateProjectInternalUserRequestPayload: {
            internalUsers: components["schemas"]["InternalUserPayload"][];
        };
        UpdateProjectMetricRequestPayload: {
            metric: components["schemas"]["ExistingProjectMetricPayload"];
        };
        UpdateProjectMetricTargetsPayload: Omit<WithRequired<components["schemas"]["UpdateMetricTargetsPayload"], "targets">, "type"> & {
            /** Format: int64 */
            metricId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "project";
        };
        UpdateProjectOverallScorePayload: {
            /** Format: uri */
            detailsUrl?: string;
            /** Format: double */
            overallScore?: number;
            summary?: string;
        };
        UpdateProjectOverallScoreRequestPayload: {
            score: components["schemas"]["UpdateProjectOverallScorePayload"];
        };
        UpdateProjectRequestPayload: {
            description?: string;
            name: string;
        };
        UpdateReportPhotoRequestPayload: {
            caption?: string;
        };
        UpdateReportSettingsRequestPayload: {
            /** @description If true, enable organization-level reports. */
            organizationEnabled: boolean;
            /** Format: int64 */
            organizationId: number;
            /** @description Per-project report settings. If a project is missing from this list, its settings will revert to the defaults. */
            projects: components["schemas"]["ProjectReportSettingsPayload"][];
        };
        UpdateSavedDocumentVersionRequestPayload: {
            isSubmitted: boolean;
        };
        UpdateStandardMetricRequestPayload: {
            metric: components["schemas"]["ExistingStandardMetricPayload"];
        };
        UpdateStandardMetricTargetsPayload: Omit<WithRequired<components["schemas"]["UpdateMetricTargetsPayload"], "targets">, "type"> & {
            /** Format: int64 */
            metricId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "standard";
        };
        UpdateSubLocationRequestPayload: {
            name: string;
        };
        UpdateSubmissionRequestPayload: {
            feedback?: string;
            internalComment?: string;
            /** @enum {string} */
            status: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Completed";
        };
        UpdateSubstratumRequestPayload: {
            plantingCompleted: boolean;
        };
        UpdateSystemMetricTargetsPayload: Omit<WithRequired<components["schemas"]["UpdateMetricTargetsPayload"], "targets">, "type"> & {
            /** @enum {string} */
            metric: "Seeds Collected" | "Seedlings" | "Trees Planted" | "Species Planted" | "Hectares Planted" | "Survival Rate";
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "system";
        };
        UpdateUserCookieConsentRequestPayload: {
            /** @description If true, the user consents to the use of analytics cookies. If false, they decline. */
            cookiesConsented: boolean;
        };
        UpdateUserInternalInterestsRequestPayload: {
            /** @description New set of category assignments. Existing assignments that aren't included here will be removed from the user. */
            internalInterests: ("Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files" | "Sourcing")[];
        };
        UpdateUserPreferencesRequestPayload: {
            /**
             * Format: int64
             * @description If present, update the user's per-organization preferences for this organization. If not present, update the user's global preferences.
             */
            organizationId?: number;
            preferences: {
                [key: string]: unknown;
            };
        };
        UpdateUserRequestPayload: {
            /**
             * @description Two-letter code of the user's country.
             * @example US
             */
            countryCode?: string;
            /** @description If true, the user wants to receive all the notifications for their organizations via email. This does not apply to certain kinds of notifications such as "You've been added to a new organization." If null, leave the existing value as-is. */
            emailNotificationsEnabled?: boolean;
            firstName: string;
            lastName: string;
            /**
             * @description IETF locale code containing user's preferred language.
             * @example en
             */
            locale?: string;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
        };
        /** @description Operation that replaces a single existing value with a new one. The new value will have the same list position as the existing one.
         *
         *     This operation may not be used with table variables.
         *
         *     If the variable is a table column, the new value will be contained in the same row as the existing one. */
        UpdateValueOperationPayload: Omit<WithRequired<components["schemas"]["ValueOperationPayload"], "existingValueId">, "operation"> & {
            value: components["schemas"]["NewDateValuePayload"] | components["schemas"]["NewEmailValuePayload"] | components["schemas"]["NewImageValuePayload"] | components["schemas"]["NewLinkValuePayload"] | components["schemas"]["NewNumberValuePayload"] | components["schemas"]["NewSectionTextValuePayload"] | components["schemas"]["NewSectionVariableValuePayload"] | components["schemas"]["NewSelectValuePayload"] | components["schemas"]["NewTableValuePayload"] | components["schemas"]["NewTextValuePayload"];
            /** Format: int64 */
            valueId: number;
        } & {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            operation: "Update";
        };
        UpdateVariableOwnerRequestPayload: {
            /**
             * Format: int64
             * @description New owner of the variable, or null if the variable should have no owner.
             */
            ownedBy?: number;
        };
        UpdateVariableValuesRequestPayload: {
            /** @description List of operations to perform on the document's values. The operations are applied in order, and atomically: if any of them fail, none of them will be applied. */
            operations: (components["schemas"]["AppendValueOperationPayload"] | components["schemas"]["DeleteValueOperationPayload"] | components["schemas"]["ReplaceValuesOperationPayload"] | components["schemas"]["UpdateValueOperationPayload"])[];
            /** @description Whether to update variable statuses. Defaults to true. Accelerator admins can bypass the status updates by setting the flag to false. */
            updateStatuses?: boolean;
        };
        UpdateVariableWorkflowDetailsRequestPayload: {
            feedback?: string;
            internalComment?: string;
            /** @enum {string} */
            status: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Incomplete" | "Complete";
        };
        UpdateViabilityTestRequestPayload: {
            /** Format: date */
            endDate?: string;
            notes?: string;
            /** @enum {string} */
            seedType?: "Fresh" | "Stored";
            /** Format: int32 */
            seedsCompromised?: number;
            /** Format: int32 */
            seedsEmpty?: number;
            /** Format: int32 */
            seedsFilled?: number;
            /** Format: int32 */
            seedsTested: number;
            /** Format: date */
            startDate?: string;
            /** @enum {string} */
            substrate?: "Nursery Media" | "Agar" | "Paper" | "Other" | "Sand" | "Media Mix" | "Soil" | "Moss" | "Perlite/Vermiculite" | "None";
            testResults?: components["schemas"]["ViabilityTestResultPayload"][];
            /** @enum {string} */
            treatment?: "Soak" | "Scarify" | "Chemical" | "Stratification" | "Other" | "Light";
            /**
             * Format: int64
             * @description ID of user who withdrew seeds to perform the test. If non-null, the current user must have permission to see the referenced user's membership details in the organization. If absent or null, the existing value is left unchanged.
             */
            withdrawnByUserId?: number;
        };
        UpdateWithdrawalRequestPayload: {
            /** Format: date */
            date?: string;
            notes?: string;
            /** @enum {string} */
            purpose?: "Other" | "Viability Testing" | "Out-planting" | "Nursery";
            /**
             * Format: int64
             * @description ID of the user who withdrew the seeds. Default is the withdrawal's existing user ID. If non-null, the current user must have permission to read the referenced user's membership details in the organization.
             */
            withdrawnByUserId?: number;
            /** @description Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. Otherwise, it is a user-supplied value. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
            withdrawnQuantity?: components["schemas"]["SeedQuantityPayload"];
        };
        UpdatedPlantingSeasonPayload: {
            /** Format: date */
            endDate: string;
            /**
             * Format: int64
             * @description If present, the start and end dates of an existing planting season will be updated. Otherwise a new planting season will be created.
             */
            id?: number;
            /** Format: date */
            startDate: string;
        };
        UpgradeManifestRequestPayload: {
            /**
             * Format: int64
             * @description ID of manifest to upgrade the document to. This must be greater than the document's current manifest ID (downgrades are not supported) and must be for the same document template as the current manifest.
             */
            variableManifestId: number;
        };
        UploadAcceleratorReportPhotoResponsePayload: {
            /** Format: int64 */
            fileId: number;
            status: components["schemas"]["SuccessOrError"];
        };
        UploadActivityMediaResponsePayload: {
            /** Format: int64 */
            fileId: number;
            status: components["schemas"]["SuccessOrError"];
        };
        UploadAttachmentResponsePayload: {
            attachments: components["schemas"]["TemporaryAttachment"][];
            status: components["schemas"]["SuccessOrError"];
        };
        UploadDeliverableDocumentResponsePayload: {
            /** Format: int64 */
            documentId: number;
            status: components["schemas"]["SuccessOrError"];
        };
        UploadFileResponsePayload: {
            /**
             * Format: int64
             * @description ID of uploaded file. This may be used to poll for the file's status.
             */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        UploadImageFileResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            /** Format: int64 */
            valueId: number;
        };
        UploadPlotMediaRequestPayload: {
            caption?: string;
            /** @enum {string} */
            position?: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            /**
             * @description Type of subject the uploaded file depicts.
             * @default Plot
             * @enum {string}
             */
            type: "Plot" | "Quadrat" | "Soil";
        };
        UploadPlotPhotoRequestPayload: {
            caption?: string;
            gpsCoordinates: components["schemas"]["Point"];
            /** @enum {string} */
            position?: "SouthwestCorner" | "SoutheastCorner" | "NortheastCorner" | "NorthwestCorner";
            /**
             * @description Type of observation plot photo.
             * @default Plot
             * @enum {string}
             */
            type: "Plot" | "Quadrat" | "Soil";
        };
        UploadPlotPhotoResponsePayload: {
            /** Format: int64 */
            fileId: number;
            status: components["schemas"]["SuccessOrError"];
        };
        /** @description List of conditions that might cause the user to want to cancel the upload but that can be automatically resolved if desired. */
        UploadProblemPayload: {
            /** @description Name of the field with the problem. Absent if the problem isn't specific to a single field. */
            fieldName?: string;
            /** @description Human-readable description of the problem. */
            message?: string;
            /**
             * Format: int32
             * @description Position (row number) of the record with the problem.
             */
            position?: number;
            /** @enum {string} */
            type: "Unrecognized Value" | "Missing Required Value" | "Duplicate Value" | "Malformed Value";
            /** @description The value that caused the problem. Absent if the problem wasn't caused by a specific field value. */
            value?: string;
        };
        UploadReportFileResponsePayload: {
            /** Format: int64 */
            id: number;
            status: components["schemas"]["SuccessOrError"];
        };
        UpsertProjectScoresRequestPayload: {
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            scores: components["schemas"]["UpsertScore"][];
        };
        UpsertProjectVotesRequestPayload: {
            /** @enum {string} */
            phase: "Phase 0 - Due Diligence" | "Phase 1 - Feasibility Study" | "Phase 2 - Plan and Scale" | "Phase 3 - Implement and Monitor" | "Pre-Screen" | "Application";
            votes: components["schemas"]["UpsertVoteSelection"][];
        };
        UpsertScore: {
            /** @enum {string} */
            category: "Carbon" | "Finance" | "Forestry" | "Legal" | "Social Impact" | "GIS" | "Climate Impact" | "Expansion Potential" | "Experience and Understanding" | "Operational Capacity" | "Responsiveness and Attention to Detail" | "Values Alignment";
            qualitative?: string;
            /**
             * Format: int32
             * @description If set to `null`, remove the selected score.
             */
            value?: number;
        };
        UpsertVoteSelection: {
            conditionalInfo?: string;
            /** Format: int64 */
            userId: number;
            /**
             * @description If set to `null`, remove the vote the user has previously selected.
             * @enum {string}
             */
            voteOption?: "No" | "Conditional" | "Yes";
        };
        UserProfilePayload: {
            /** @description If true, the user has consented to the use of analytics cookies. If false, the user has declined. If null, the user has not made a consent selection yet. */
            cookiesConsented?: boolean;
            /**
             * Format: date-time
             * @description If the user has selected whether or not to consent to analytics cookies, the date and time of the selection.
             */
            cookiesConsentedTime?: string;
            /**
             * @description Two-letter code of the user's country.
             * @example US
             */
            countryCode?: string;
            email: string;
            /** @description If true, the user wants to receive all the notifications for their organizations via email. This does not apply to certain kinds of notifications such as "You've been added to a new organization." */
            emailNotificationsEnabled: boolean;
            firstName?: string;
            globalRoles: ("Super-Admin" | "Accelerator Admin" | "TF Expert" | "Read Only")[];
            /**
             * Format: int64
             * @description User's unique ID. This should not be shown to the user, but is a required input to some API endpoints.
             */
            id: number;
            lastName?: string;
            /**
             * @description IETF locale code containing user's preferred language.
             * @example en
             */
            locale?: string;
            /**
             * @description Time zone name in IANA tz database format
             * @example America/New_York
             */
            timeZone?: string;
            /**
             * @description Type of User. Could be Individual, Funder or DeviceManager
             * @enum {string}
             */
            userType: "Individual" | "Device Manager" | "System" | "Funder";
        };
        UserWithGlobalRolesPayload: {
            /** Format: date-time */
            createdTime: string;
            email: string;
            firstName?: string;
            globalRoles: ("Super-Admin" | "Accelerator Admin" | "TF Expert" | "Read Only")[];
            /** Format: int64 */
            id: number;
            internalInterests: ("Compliance" | "Financial Viability" | "GIS" | "Carbon Eligibility" | "Stakeholders and Community Impact" | "Proposed Restoration Activities" | "Verra Non-Permanence Risk Tool (NPRT)" | "Supplemental Files" | "Sourcing")[];
            lastName?: string;
        };
        ValidatePlantingSiteResponsePayload: {
            /** @description True if the request was valid. */
            isValid: boolean;
            /** @description List of validation problems found, if any. Empty if the request is valid. */
            problems: components["schemas"]["PlantingSiteValidationProblemPayload"][];
            status: components["schemas"]["SuccessOrError"];
        };
        /** @description Supertype of the payloads that describe which operations to perform on a variable's value(s). See the descriptions of the individual operations for details. */
        ValueOperationPayload: {
            /** Format: int64 */
            existingValueId?: number;
            operation: string;
        };
        VariableOwnersResponseElement: {
            /** Format: int64 */
            ownedBy: number;
            /** Format: int64 */
            variableId: number;
        };
        VariablePayload: {
            /** Format: int64 */
            deliverableId?: number;
            deliverableQuestion?: string;
            /** @enum {string} */
            dependencyCondition?: "eq" | "gt" | "gte" | "lt" | "lte" | "neq";
            dependencyValue?: string;
            dependencyVariableStableId?: string;
            description?: string;
            /** Format: int64 */
            id: number;
            internalOnly: boolean;
            isList: boolean;
            isRequired: boolean;
            name: string;
            /** Format: int32 */
            position?: number;
            /** @description IDs of sections that recommend this variable. */
            recommendedBy?: number[];
            stableId: string;
            /** @enum {string} */
            type: "Number" | "Text" | "Date" | "Image" | "Select" | "Table" | "Link" | "Section" | "Email";
        };
        VariableWorkflowHistoryElement: {
            /** Format: int64 */
            createdBy: number;
            /** Format: date-time */
            createdTime: string;
            feedback?: string;
            /** Format: int64 */
            id: number;
            internalComment?: string;
            /** Format: int64 */
            maxVariableValueId: number;
            /** Format: int64 */
            projectId: number;
            /** @enum {string} */
            status: "Not Submitted" | "In Review" | "Needs Translation" | "Approved" | "Rejected" | "Not Needed" | "Incomplete" | "Complete";
            variableValues: (components["schemas"]["ExistingDateValuePayload"] | components["schemas"]["ExistingDeletedValuePayload"] | components["schemas"]["ExistingEmailValuePayload"] | components["schemas"]["ExistingImageValuePayload"] | components["schemas"]["ExistingLinkValuePayload"] | components["schemas"]["ExistingNumberValuePayload"] | components["schemas"]["ExistingSectionTextValuePayload"] | components["schemas"]["ExistingSectionVariableValuePayload"] | components["schemas"]["ExistingSelectValuePayload"] | components["schemas"]["ExistingTableValuePayload"] | components["schemas"]["ExistingTextValuePayload"])[];
        };
        VersionsEntryPayload: {
            appName: string;
            minimumVersion: string;
            platform: string;
            recommendedVersion: string;
        };
        VersionsResponsePayload: {
            status: components["schemas"]["SuccessOrError"];
            versions: components["schemas"]["VersionsEntryPayload"][];
        };
        ViabilityTestResultPayload: {
            /** Format: date */
            recordingDate: string;
            /** Format: int32 */
            seedsGerminated: number;
        };
        VoteSelection: {
            conditionalInfo?: string;
            /** @description The vote the user has selected. Can be yes/no/conditional or `null` if a vote is not yet selected. */
            email: string;
            firstName?: string;
            lastName?: string;
            /** Format: int64 */
            userId: number;
            /** @enum {string} */
            voteOption?: "No" | "Conditional" | "Yes";
        };
        WorkersPayloadV1: {
            /** Format: int32 */
            femalePaidWorkers?: number;
            /** Format: int32 */
            paidWorkers?: number;
            /** Format: int32 */
            volunteers?: number;
        };
        /**
         * @deprecated
         * @description Use strata instead
         */
        ZoneT0DataPayload: {
            densityData: components["schemas"]["SpeciesDensityPayload"][];
            /** Format: int64 */
            plantingZoneId: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listActivities: {
        parameters: {
            query: {
                projectId: number;
                /** @description If true, include a list of media files for each activity. */
                includeMedia?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListActivitiesResponsePayload"];
                };
            };
        };
    };
    createActivity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateActivityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetActivityResponsePayload"];
                };
            };
        };
    };
    adminListActivities: {
        parameters: {
            query: {
                projectId: number;
                /** @description If true, include a list of media files for each activity. */
                includeMedia?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminListActivitiesResponsePayload"];
                };
            };
        };
    };
    adminCreateActivity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminCreateActivityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminGetActivityResponsePayload"];
                };
            };
        };
    };
    adminGetActivity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminGetActivityResponsePayload"];
                };
            };
        };
    };
    adminUpdateActivity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminUpdateActivityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    adminPublishActivity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getActivity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetActivityResponsePayload"];
                };
            };
        };
    };
    updateActivity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateActivityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteActivity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    uploadActivityMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    /** Format: int32 */
                    listPosition?: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadActivityMediaResponsePayload"];
                };
            };
        };
    };
    getActivityMedia: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
                /** @description If true, return the originally uploaded media file verbatim. maxWidth and maxHeight are ignored when raw is true. */
                raw?: boolean;
            };
            header?: never;
            path: {
                activityId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    updateActivityMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateActivityMediaRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteActivityMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getActivityMediaStream_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMuxStreamResponsePayload"];
                };
            };
        };
    };
    listApplications: {
        parameters: {
            query?: {
                /** @description If present, only list applications for this organization. */
                organizationId?: number;
                /** @description If present, only list applications for this project. A project can only have one application, so this will either return an empty result or a result with a single element. */
                projectId?: number;
                /** @description If true, list all applications for all projects. Only allowed for internal users. */
                listAll?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListApplicationsResponsePayload"];
                };
            };
        };
    };
    createApplication: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateApplicationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateApplicationResponsePayload"];
                };
            };
        };
    };
    getApplication: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetApplicationResponsePayload"];
                };
            };
        };
    };
    updateApplicationBoundary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateApplicationBoundaryRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    uploadApplicationBoundary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getApplicationDeliverables: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetApplicationDeliverablesResponsePayload"];
                };
            };
        };
    };
    getApplicationGeoJson: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/geo+json": string;
                };
            };
        };
    };
    getApplicationHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetApplicationHistoryResponsePayload"];
                };
            };
        };
    };
    getApplicationModules: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetApplicationModulesResponsePayload"];
                };
            };
        };
    };
    getApplicationModuleDeliverables: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
                moduleId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetApplicationDeliverablesResponsePayload"];
                };
            };
        };
    };
    restartApplication: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    reviewApplication: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewApplicationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    submitApplication: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                applicationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubmitApplicationResponsePayload"];
                };
            };
        };
    };
    listCohorts: {
        parameters: {
            query?: {
                /** @description If specified, retrieve associated entities to the supplied depth. For example, 'participant' depth will return the participants associated to the cohort. */
                cohortDepth?: "Cohort" | "Participant";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CohortListResponsePayload"];
                };
            };
        };
    };
    createCohort: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCohortRequestPayload"];
            };
        };
        responses: {
            /** @description The cohort was created successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CohortResponsePayload"];
                };
            };
        };
    };
    getCohort: {
        parameters: {
            query?: {
                /** @description If specified, retrieve associated entities to the supplied depth. For example, 'participant' depth will return the participants associated to the cohort. */
                cohortDepth?: "Cohort" | "Participant";
            };
            header?: never;
            path: {
                cohortId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CohortResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateCohort: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cohortId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCohortRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CohortResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteCohort: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cohortId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listCohortModules: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cohortId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListCohortModulesResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getCohortModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cohortId: number;
                moduleId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetCohortModuleResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateCohortModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cohortId: number;
                moduleId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCohortModuleRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteCohortModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cohortId: number;
                moduleId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listDeliverables: {
        parameters: {
            query?: {
                /** @description Filter deliverables by modules. Can be used with other request params. */
                moduleId?: number;
                /** @description List deliverables for projects belonging to this organization. Ignored if participantId or projectId is specified. */
                organizationId?: number;
                /** @description List deliverables for all projects in this participant. Ignored if projectId is specified. */
                participantId?: number;
                /** @description List deliverables for this project only. */
                projectId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListDeliverablesResponsePayload"];
                };
            };
        };
    };
    importDeliverables: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportDeliverableResponsePayload"];
                };
            };
        };
    };
    uploadDeliverableDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    description: string;
                    /** Format: binary */
                    file: string;
                    projectId: string;
                };
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadDeliverableDocumentResponsePayload"];
                };
            };
            /** @description The server is unable to store the uploaded file. This response indicates a condition that triggers the system to create a customer support ticket; clients can inform users of that fact. */
            507: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadDeliverableDocumentResponsePayload"];
                };
            };
        };
    };
    getDeliverableDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
                documentId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description If the current user has permission to view the document, redirects to the document on the document store. Depending on the document store, the redirect URL may or may not be valid for only a limited time. */
            307: {
                headers: {
                    /** @description URL of document in document store. */
                    Location?: unknown;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getDeliverable: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDeliverableResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateSubmission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSubmissionRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    completeSubmission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    incompleteSubmission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    submitSubmission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                deliverableId: number;
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listEvents: {
        parameters: {
            query?: {
                projectId?: number;
                moduleId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEventsResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createEvent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateModuleEventRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateModuleEventResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                eventId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetEventResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                eventId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateModuleEventRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                eventId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateEventProjects: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                eventId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateModuleEventProjectsRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listModules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListModulesResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    importModules: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportModuleResponsePayload"];
                };
            };
        };
    };
    getModule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                moduleId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetModuleResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listAcceleratorOrganizations: {
        parameters: {
            query?: {
                /** @description Whether to also include projects that have been assigned to participants. */
                includeParticipants?: boolean;
                /** @description Whether to load all organizations with a project with an application. */
                hasProjectApplication?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAcceleratorOrganizationsResponsePayload"];
                };
            };
        };
    };
    assignTerraformationContact: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignTerraformationContactRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listParticipants: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListParticipantsResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createParticipant: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateParticipantRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetParticipantResponsePayload"];
                };
            };
        };
    };
    getParticipant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participantId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetParticipantResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateParticipant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participantId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateParticipantRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteParticipant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participantId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description There are projects associated with the participant. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listProjectAcceleratorDetails: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListProjectAcceleratorDetailsResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createParticipantProjectSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateParticipantProjectSpeciesPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetParticipantProjectSpeciesResponsePayload"];
                };
            };
        };
    };
    deleteParticipantProjectSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteParticipantProjectSpeciesPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    assignParticipantProjectSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignParticipantProjectSpeciesPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getParticipantProjectSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participantProjectSpeciesId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetParticipantProjectSpeciesResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateParticipantProjectSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                participantProjectSpeciesId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateParticipantProjectSpeciesPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getProjectAcceleratorDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetProjectAcceleratorDetailsResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateProjectAcceleratorDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProjectAcceleratorDetailsRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listAcceleratorReports: {
        parameters: {
            query?: {
                year?: number;
                includeArchived?: boolean;
                includeFuture?: boolean;
                includeMetrics?: boolean;
            };
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAcceleratorReportsResponsePayload"];
                };
            };
        };
    };
    listAcceleratorReportConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAcceleratorReportConfigResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createAcceleratorReportConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAcceleratorReportConfigRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateProjectAcceleratorReportConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProjectAcceleratorReportConfigRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateAcceleratorReportConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                configId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAcceleratorReportConfigRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listProjectMetrics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListProjectMetricsResponsePayload"];
                };
            };
        };
    };
    createProjectMetric: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProjectMetricRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    updateProjectMetric: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                metricId: number;
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProjectMetricRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateProjectMetricTargets: {
        parameters: {
            query?: {
                /** @description Update targets for submitted reports. Require TF Experts privileges. */
                updateSubmitted?: boolean;
            };
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMetricTargetsRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getAcceleratorReport: {
        parameters: {
            query?: {
                includeMetrics?: boolean;
            };
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetAcceleratorReportResponsePayload"];
                };
            };
        };
    };
    updateAcceleratorReportValues: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAcceleratorReportValuesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    refreshAcceleratorReportSystemMetrics: {
        parameters: {
            query: {
                metrics: ("Seeds Collected" | "Seedlings" | "Trees Planted" | "Species Planted" | "Hectares Planted" | "Survival Rate")[];
            };
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    reviewAcceleratorReportMetrics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewAcceleratorReportMetricsRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    uploadAcceleratorReportPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    caption?: string;
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadAcceleratorReportPhotoResponsePayload"];
                };
            };
        };
    };
    getAcceleratorReportPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                projectId: number;
                reportId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
            /** @description The report does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateAcceleratorReportPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAcceleratorReportPhotoRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteAcceleratorReportPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": unknown;
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    publishAcceleratorReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    reviewAcceleratorReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewAcceleratorReportRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    submitAcceleratorReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was not valid. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getProjectScores: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetProjectScoresResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    upsertProjectScores_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpsertProjectScoresRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getSpeciesForProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSpeciesForParticipantProjectsResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getParticipantProjectSpeciesSnapshot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                deliverableId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The file was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    getProjectVotes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetProjectVotesResponsePayload"];
                };
            };
            /** @description Attempting to read votes without sufficient privilege */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    upsertProjectVotes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpsertProjectVotesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description Attempting to delete votes without sufficient privilege */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description Attempting to upsert a vote in an inactive phase */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteProjectVotes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteProjectVotesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description Attempting to delete a phase of votes without safeguard */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description Attempting to delete votes without sufficient privilege */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description Attempting to delete a vote in an inactive phase */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listStandardMetric: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListStandardMetricsResponsePayload"];
                };
            };
        };
    };
    createStandardMetric: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateStandardMetricRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    updateStandardMetric: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                metricId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateStandardMetricRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listSystemMetrics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSystemMetricsResponsePayload"];
                };
            };
        };
    };
    getProjectsForSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                speciesId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetParticipantProjectsForSpeciesResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listAutomations: {
        parameters: {
            query?: {
                deviceId?: number;
                facilityId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAutomationsResponsePayload"];
                };
            };
        };
    };
    createAutomation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAutomationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateAutomationResponsePayload"];
                };
            };
        };
    };
    getAutomation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                automationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetAutomationResponsePayload"];
                };
            };
        };
    };
    updateAutomation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                automationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAutomationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteAutomation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                automationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    postAutomationTrigger: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                automationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutomationTriggerRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getBorder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                countryCode: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetCountryBorderResponsePayload"];
                };
            };
        };
    };
    createDevice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDeviceRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getDevice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Device configuration retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDeviceResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateDevice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateDeviceRequestPayload"];
            };
        };
        responses: {
            /** @description Device configuration updated. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deviceUnresponsive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceUnresponsiveRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getDisclaimer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDisclaimerResponse"];
                };
            };
        };
    };
    acceptDisclaimer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listDocuments: {
        parameters: {
            query?: {
                /** @description If present, only list documents for this project. */
                projectId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListDocumentsResponsePayload"];
                };
            };
        };
    };
    createDocument: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDocumentRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateDocumentResponsePayload"];
                };
            };
        };
    };
    upgradeManifest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                documentId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpgradeManifestRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The document does not exist or the requested manifest does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested manifest is for a different document template than the current one. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createSavedDocumentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                documentId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSavedDocumentVersionRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateSavedDocumentVersionResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The document has no values to save. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getSavedDocumentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                documentId: number;
                versionId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSavedDocumentVersionResponsePayload"];
                };
            };
        };
    };
    updateSavedDocumentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                documentId: number;
                versionId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSavedDocumentVersionRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDocumentResponsePayload"];
                };
            };
        };
    };
    updateDocument: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateDocumentRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getDocumentHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDocumentHistoryResponsePayload"];
                };
            };
        };
    };
    uploadProjectImageValue: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    caption?: string;
                    citation?: string;
                    /** Format: binary */
                    file: string;
                    /**
                     * Format: int32
                     * @description If the variable is a list, which list position to use for the value. If not specified, the server will use the next available list position if the variable is a list, or will replace any existing image if the variable is not a list.
                     */
                    listPosition?: number;
                    /**
                     * Format: int64
                     * @description If the variable is a table column, value ID of the row the value should belong to.
                     */
                    rowValueId?: number;
                    /** Format: int64 */
                    variableId: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadImageFileResponsePayload"];
                };
            };
        };
    };
    getProjectImageValue: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                projectId: number;
                valueId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
        };
    };
    listVariableOwners: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListVariableOwnersResponsePayload"];
                };
            };
        };
    };
    updateVariableOwner: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                variableId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateVariableOwnerRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listProjectVariableValues: {
        parameters: {
            query?: {
                /** @description If specified, only return values that belong to variables that are associated to the given ID */
                deliverableId?: number;
                /** @description If specified, only return values with this ID or higher. Use this to poll for incremental updates to a document. Incremental results may include values of type 'Deleted' in cases where, e.g., elements have been removed from a list. */
                minValueId?: number;
                /** @description If specified, only return values with this ID or lower. Use this to retrieve saved document versions. */
                maxValueId?: number;
                /** @description If specified, return the value of the variable with this stable ID. May be specified more than once to return values for multiple variables. Ignored if variableId is specified. */
                stableId?: string[];
                /** @description If specified, return the value of this variable. May be specified more than once to return values for multiple variables. */
                variableId?: number[];
            };
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListVariableValuesResponsePayload"];
                };
            };
        };
    };
    updateProjectVariableValues: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateVariableValuesRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    updateVariableWorkflowDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                variableId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateVariableWorkflowDetailsRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getVariableWorkflowHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
                variableId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetVariableWorkflowHistoryResponsePayload"];
                };
            };
        };
    };
    listDocumentTemplates: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListDocumentTemplatesResponsePayload"];
                };
            };
        };
    };
    listVariables: {
        parameters: {
            query?: {
                deliverableId?: number;
                documentId?: number;
                /** @description If specified, return the definition of a specific variable given its stable ID. May be specified more than once to return multiple variables. deliverableId and documentId are ignored if this is specified. */
                stableId?: string[];
                /** @description If specified, return the definition of a specific variable. May be specified more than once to return multiple variables. deliverableId, documentId, and stableId are ignored if this is specified. */
                variableId?: number[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListVariablesResponsePayload"];
                };
            };
        };
    };
    listEventLogEntries: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListEventLogEntriesRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListEventLogEntriesResponsePayload"];
                };
            };
        };
    };
    listAllFacilities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListFacilitiesResponse"];
                };
            };
        };
    };
    createFacility: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateFacilityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateFacilityResponsePayload"];
                };
            };
        };
    };
    getFacility: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFacilityResponse"];
                };
            };
        };
    };
    updateFacility: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateFacilityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    sendFacilityAlert: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendFacilityAlertRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The request was received, but the user is still configuring or placing sensors, so no notification has been generated. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    postConfigured: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The facility's device manager was not in the process of being configured. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listFacilityDevices: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully listed the facility's devices. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListDeviceConfigsResponse"];
                };
            };
            /** @description The facility does not exist or is not accessible by the current user. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listSubLocations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSubLocationsResponsePayload"];
                };
            };
        };
    };
    createSubLocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSubLocationRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSubLocationResponsePayload"];
                };
            };
            /** @description A sub-location with the requested name already exists at the facility. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getSubLocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
                subLocationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSubLocationResponsePayload"];
                };
            };
        };
    };
    updateSubLocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
                subLocationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSubLocationRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description A sub-location with the requested name already exists at the facility. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteSubLocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
                subLocationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The sub-location is in use, e.g., there are seeds or seedlings stored there. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listFacilityDevices_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successfully listed the facility's devices. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListDeviceConfigsResponse"];
                };
            };
            /** @description The facility does not exist or is not accessible by the current user. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getFileForToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    funderListActivities: {
        parameters: {
            query: {
                projectId: number;
                includeMedia?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FunderListActivitiesResponsePayload"];
                };
            };
        };
    };
    getActivityMedia_1: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                activityId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    getActivityMediaStream: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                activityId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMuxStreamResponsePayload"];
                };
            };
        };
    };
    listFundingEntities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListFundingEntitiesPayload"];
                };
            };
        };
    };
    createFundingEntity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateFundingEntityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFundingEntityResponsePayload"];
                };
            };
        };
    };
    getProjectFundingEntities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListFundingEntitiesPayload"];
                };
            };
        };
    };
    getFundingEntity_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFundingEntityResponsePayload"];
                };
            };
        };
    };
    getFundingEntity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fundingEntityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFundingEntityResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateFundingEntity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fundingEntityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateFundingEntityRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteFundingEntity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fundingEntityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getFunders: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fundingEntityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFundersResponsePayload"];
                };
            };
        };
    };
    inviteFunder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fundingEntityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteFundingEntityFunderRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteFundingEntityFunderResponsePayload"];
                };
            };
        };
    };
    removeFunder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                fundingEntityId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteFundersRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getAllProjects: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetPublishedProjectResponsePayload"];
                };
            };
        };
    };
    getProjects: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectIds: number[];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetFundingProjectResponsePayload"];
                };
            };
        };
    };
    publishProjectProfile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PublishProjectProfileRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listPublishedReports: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListPublishedReportsResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getPublishedReportPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                reportId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
            /** @description The report does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    proxyGetRequest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    listGlobalRoles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GlobalRoleUsersListResponsePayload"];
                };
            };
        };
    };
    deleteGlobalRoles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteGlobalRolesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listTimeZoneNames: {
        parameters: {
            query?: {
                /**
                 * @description Language code and optional country code suffix. If not specified, the preferred locale from the Accept-Language header is used if supported; otherwise US English is the default.
                 * @example zh-CN
                 */
                locale?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListTimeZoneNamesResponsePayload"];
                };
            };
        };
    };
    listAllInternalTags: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAllInternalTagsResponsePayload"];
                };
            };
        };
    };
    listAllOrganizationInternalTags: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAllOrganizationInternalTagsResponsePayload"];
                };
            };
        };
    };
    listOrganizationInternalTags: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListOrganizationInternalTagsResponsePayload"];
                };
            };
        };
    };
    updateOrganizationInternalTags: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateOrganizationInternalTagsRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    login: {
        parameters: {
            query: {
                /** @description URL to redirect to after login. The list of valid redirect URLs is restricted; this must be the URL of a Terraware web application. */
                redirect: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirects to a login page. After login, the user will be redirected back to the URL specified in the "redirect" parameter. */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    readAll: {
        parameters: {
            query?: {
                /** @description If set, return notifications relevant to that organization. */
                organizationId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetNotificationsResponsePayload"];
                };
            };
        };
    };
    markAllRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateNotificationsRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    count: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetNotificationsCountResponsePayload"];
                };
            };
        };
    };
    read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetNotificationResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    markRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateNotificationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createBatch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBatchRequestPayload"];
            };
        };
        responses: {
            /** @description The batch was created successfully. Response includes fields populated by the server, including the batch ID. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchResponsePayload"];
                };
            };
        };
    };
    uploadSeedlingBatchesList: {
        parameters: {
            query: {
                facilityId: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description The file has been successfully received. It will be processed asynchronously; use the ID returned in the response payload to poll for its status using the `/api/v1/nursery/batches/uploads/{uploadId}` GET endpoint. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadFileResponsePayload"];
                };
            };
        };
    };
    getSeedlingBatchesUploadTemplate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    getSeedlingBatchesListUploadStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUploadStatusResponsePayload"];
                };
            };
        };
    };
    getBatchHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                batchId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetBatchHistoryResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listBatchPhotos: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                batchId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListBatchPhotosResponsePayload"];
                };
            };
            /** @description The batch does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createBatchPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                batchId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateBatchPhotoResponsePayload"];
                };
            };
        };
    };
    getBatchPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                batchId: number;
                photoId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
            /** @description The batch does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteBatchPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                batchId: number;
                photoId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The batch does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getBatch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateBatch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBatchRequestPayload"];
            };
        };
        responses: {
            /** @description The batch was updated successfully. Response includes fields populated or modified by the server as a result of the update. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource has a newer version and was not updated. */
            412: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteBatch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    changeBatchStatuses: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeBatchStatusRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource has a newer version and was not updated. */
            412: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateBatchQuantities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBatchQuantitiesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BatchResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The requested resource has a newer version and was not updated. */
            412: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getNurserySummary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                facilityId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetNurserySummaryResponsePayload"];
                };
            };
        };
    };
    getSpeciesSummary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                speciesId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSpeciesSummaryResponsePayload"];
                };
            };
        };
    };
    getOrganizationNurserySummary: {
        parameters: {
            query: {
                organizationId: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetOrganizationNurserySummaryResponsePayload"];
                };
            };
        };
    };
    createBatchWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateNurseryWithdrawalRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetNurseryWithdrawalResponsePayload"];
                };
            };
        };
    };
    getNurseryWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetNurseryWithdrawalResponsePayload"];
                };
            };
        };
    };
    listWithdrawalPhotos: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListWithdrawalPhotosResponsePayload"];
                };
            };
            /** @description The withdrawal does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    uploadWithdrawalPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateNurseryWithdrawalPhotoResponsePayload"];
                };
            };
        };
    };
    getWithdrawalPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                withdrawalId: number;
                photoId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
            /** @description The withdrawal does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    undoBatchWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The withdrawal does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The withdrawal is not eligible for undo, e.g., because it has already been undone or because it is a nursery transfer. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listOrganizations: {
        parameters: {
            query?: {
                /** @description Return this level of information about the organization's contents. */
                depth?: "Organization" | "Facility";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListOrganizationsResponsePayload"];
                };
            };
        };
    };
    createOrganization: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOrganizationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetOrganizationResponsePayload"];
                };
            };
        };
    };
    getOrganization: {
        parameters: {
            query?: {
                /** @description Return this level of information about the organization's contents. */
                depth?: "Organization" | "Facility";
            };
            header?: never;
            path: {
                /** @description ID of organization to get. User must be a member of the organization. */
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetOrganizationResponsePayload"];
                };
            };
        };
    };
    updateOrganization: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateOrganizationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteOrganization: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The organization has other members and cannot be deleted. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listOrganizationFeatures: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListOrganizationFeaturesResponsePayload"];
                };
            };
        };
    };
    listOrganizationRoles: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListOrganizationRolesResponsePayload"];
                };
            };
        };
    };
    listOrganizationUsers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListOrganizationUsersResponsePayload"];
                };
            };
        };
    };
    addOrganizationUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddOrganizationUserRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateOrganizationUserResponsePayload"];
                };
            };
        };
    };
    getOrganizationUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
                userId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetOrganizationUserResponsePayload"];
                };
            };
        };
    };
    updateOrganizationUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
                userId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateOrganizationUserRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The user is not a member of the organization. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description An organization must have at least one owner; cannot change the role of an organization's only owner. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteOrganizationUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: number;
                userId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The user is not a member of the organization. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The user is the organization's only owner and an organization must have at least one owner. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listProjects: {
        parameters: {
            query?: {
                /** @description If specified, list projects in this organization. If absent, list projects in all the user's organizations. */
                organizationId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListProjectsResponsePayload"];
                };
            };
        };
    };
    createProject: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProjectRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateProjectResponsePayload"];
                };
            };
        };
    };
    getProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetProjectResponsePayload"];
                };
            };
        };
    };
    updateProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProjectRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    assignProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignProjectRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getInternalUsers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListProjectInternalUsersResponsePayload"];
                };
            };
        };
    };
    updateInternalUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProjectInternalUserRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listReports: {
        parameters: {
            query: {
                organizationId: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListReportsResponsePayload"];
                };
            };
        };
    };
    getReportSettings: {
        parameters: {
            query: {
                organizationId: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetReportSettingsResponsePayload"];
                };
            };
        };
    };
    updateReportSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReportSettingsRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetReportResponsePayload"];
                };
            };
        };
    };
    updateReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PutReportRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The report is not locked by the current user. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listReportFiles: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListReportFilesResponsePayload"];
                };
            };
        };
    };
    lockReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The report is now locked by the current user. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The report was already locked by another user. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    forceLockReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The report is now locked by the current user. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listReportPhotos: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListReportPhotosResponsePayload"];
                };
            };
        };
    };
    submitReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The report is missing required information and can't be submitted. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The report is not locked by the current user or has already been submitted. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    unlockReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The report is no longer locked. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The report is locked by another user. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    uploadReportFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadReportFileResponsePayload"];
                };
            };
        };
    };
    downloadReportFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reportId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The file was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    deleteReportFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reportId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    uploadReportPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reportId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadReportFileResponsePayload"];
                };
            };
        };
    };
    getReportPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                reportId: number;
                photoId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
        };
    };
    updateReportPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reportId: number;
                photoId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReportPhotoRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteReportPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reportId: number;
                photoId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    search: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SearchRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchResponsePayload"];
                    "text/csv": string;
                };
            };
        };
    };
    searchCount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SearchRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchCountResponsePayload"];
                };
            };
        };
    };
    searchDistinctValues: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SearchRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchValuesResponsePayload"];
                };
            };
        };
    };
    delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    checkIn: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getAccessionHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetAccessionHistoryResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listPhotos: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The accession's photos are listed in the response. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListPhotosResponsePayload"];
                };
            };
            /** @description The accession does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                id: number;
                photoFilename: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
            /** @description The accession does not exist, or does not have a photo with the requested filename. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    uploadPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                photoFilename: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The specified accession does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deletePhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                photoFilename: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The accession does not exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getCurrentTime: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetCurrentTimeResponsePayload"];
                };
            };
        };
    };
    recordLogMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description Source of the log message.
                 * @example seedbank-app
                 */
                tag: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    [key: string]: Record<string, never>;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getSeedBankSummary: {
        parameters: {
            query?: {
                /** @description If set, return summary on all seedbanks for that organization. */
                organizationId?: number;
                /** @description If set, return summary on that specific seedbank. */
                facilityId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SummaryResponsePayload"];
                };
            };
        };
    };
    summarizeAccessionSearch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SummarizeAccessionSearchRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SummarizeAccessionSearchResponsePayload"];
                };
            };
        };
    };
    listFieldValues: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ListFieldValuesRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListFieldValuesResponsePayload"];
                };
            };
        };
    };
    listSpecies: {
        parameters: {
            query: {
                /** @description Organization whose species should be listed. */
                organizationId: number;
                /** @description Only list species that are currently used in the organization's inventory, accessions or planting sites. */
                inUse?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSpeciesResponsePayload"];
                };
            };
        };
    };
    createSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SpeciesRequestPayload"];
            };
        };
        responses: {
            /** @description Species created. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateSpeciesResponsePayload"];
                };
            };
            /** @description A species with the requested name already exists. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateSpeciesResponsePayload"];
                };
            };
        };
    };
    getSpeciesDetails: {
        parameters: {
            query: {
                /** @description Exact scientific name to look up. This name is case-sensitive. */
                scientificName: string;
                /**
                 * @description If specified, only return common names in this language or whose language is unknown. Names with unknown languages are always included. This is a two-letter ISO 639-1 language code.
                 * @example en
                 */
                language?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpeciesLookupDetailsResponsePayload"];
                };
            };
            /** @description The scientific name was not found in the server's taxonomic database. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listSpeciesNames: {
        parameters: {
            query: {
                /**
                 * @description Space-delimited list of word prefixes to search for. Non-alphabetic characters are ignored, and matches are case-insensitive. The order of prefixes is significant; "ag sc" will match "Aglaonema schottianum" but won't match "Scabiosa agrestis".
                 * @example ag sc
                 */
                search: string;
                /** @description Maximum number of results to return. */
                maxResults?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SpeciesLookupNamesResponsePayload"];
                };
            };
        };
    };
    getSpeciesProblem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                problemId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Problem retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSpeciesProblemResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    acceptProblemSuggestion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                problemId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suggestion applied. Response contains the updated species information. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSpeciesResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description There is no suggested change for this problem. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteProblem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                problemId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    uploadSpeciesList: {
        parameters: {
            query: {
                organizationId: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description The file has been successfully received. It will be processed asynchronously; use the ID returned in the response payload to poll for its status using the `/api/v1/species/uploads/{uploadId}` GET endpoint. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadFileResponsePayload"];
                };
            };
        };
    };
    getSpeciesListUploadTemplate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    getSpeciesListUploadStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUploadStatusResponsePayload"];
                };
            };
        };
    };
    deleteSpeciesListUpload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The upload was not awaiting user action. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    resolveSpeciesListUpload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveUploadRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The upload was not awaiting user action. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getSpecies: {
        parameters: {
            query: {
                /** @description Organization whose information about the species should be returned. */
                organizationId: number;
            };
            header?: never;
            path: {
                speciesId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Species retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSpeciesResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                speciesId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SpeciesRequestPayload"];
            };
        };
        responses: {
            /** @description Species updated or merged with an existing species. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description A species with the requested name already exists. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deleteSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                speciesId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Species deleted. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description Cannot delete the species because it is currently in use. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listRequestTypes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSupportRequestTypesResponsePayload"];
                };
            };
        };
    };
    submitRequest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubmitSupportRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubmitSupportRequestResponsePayload"];
                };
            };
        };
    };
    uploadAttachment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadAttachmentResponsePayload"];
                };
            };
            /** @description The request was too large. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The media type is not supported. */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listTimeseries: {
        parameters: {
            query: {
                deviceId: number[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListTimeseriesResponsePayload"];
                };
            };
        };
    };
    createMultipleTimeseries: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTimeseriesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    recordTimeseriesValues: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecordTimeseriesValuesRequestPayload"];
            };
        };
        responses: {
            /** @description Successfully processed the request. Note that this status will be returned even if the server was unable to record some of the values. In that case, the failed values will be returned in the response payload. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecordTimeseriesValuesResponsePayload"];
                };
            };
            /** @description The request was valid, but the user is still configuring or placing sensors, so the timeseries values have not been recorded. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecordTimeseriesValuesResponsePayload"];
                };
            };
            /** @description The request had more than 1000 values. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getDelivery: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDeliveryResponsePayload"];
                };
            };
        };
    };
    reassignDelivery: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReassignDeliveryRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    createDraftPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDraftPlantingSiteRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateDraftPlantingSiteResponsePayload"];
                };
            };
        };
    };
    getDraftPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetDraftPlantingSiteResponsePayload"];
                };
            };
        };
    };
    updateDraftPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateDraftPlantingSiteRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteDraftPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getMapboxToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMapboxTokenResponsePayload"];
                };
            };
            /** @description The server is not configured to return Mapbox tokens. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The server is temporarily unable to generate a new Mapbox token. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMapboxTokenResponsePayload"];
                };
            };
        };
    };
    listObservations: {
        parameters: {
            query?: {
                /** @description Limit results to observations of planting sites in a specific organization. Ignored if plantingSiteId is specified. */
                organizationId?: number;
                /** @description Limit results to observations of a specific planting site. Required if organizationId is not specified. */
                plantingSiteId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListObservationsResponsePayload"];
                };
            };
        };
    };
    scheduleObservation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScheduleObservationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScheduleObservationResponsePayload"];
                };
            };
        };
    };
    listAdHocObservations: {
        parameters: {
            query?: {
                /** @description Limit results to observations of planting sites in a specific organization. Ignored if plantingSiteId is specified. */
                organizationId?: number;
                /** @description Limit results to observations of a specific planting site. Required if organizationId is not specified. */
                plantingSiteId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAdHocObservationsResponsePayload"];
                };
            };
        };
    };
    completeAdHocObservation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompleteAdHocObservationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompleteAdHocObservationResponsePayload"];
                };
            };
        };
    };
    listAdHocObservationResults: {
        parameters: {
            query?: {
                organizationId?: number;
                plantingSiteId?: number;
                /** @description Whether to include plants in the results. Default to false */
                includePlants?: boolean;
                /** @description Maximum number of results to return. Results are always returned in order of completion time, newest first, so setting this to 1 will return the results of the most recently completed observation. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListAdHocObservationResultsResponsePayload"];
                };
            };
        };
    };
    listObservationResults: {
        parameters: {
            query?: {
                organizationId?: number;
                plantingSiteId?: number;
                /** @description Whether to include plants in the results. Default to false */
                includePlants?: boolean;
                /** @description Maximum number of results to return. Results are always returned in order of completion time, newest first, so setting this to 1 will return the results of the most recently completed observation. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListObservationResultsResponsePayload"];
                };
            };
        };
    };
    listObservationSummaries: {
        parameters: {
            query: {
                plantingSiteId: number;
                /** @description Maximum number of results to return. Results are always returned in order of observations completion time, newest first, so setting this to 1 will return the summaries including the most recently completed observation. */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListObservationSummariesResponsePayload"];
                };
            };
        };
    };
    getObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetObservationResponsePayload"];
                };
            };
        };
    };
    rescheduleObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RescheduleObservationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    abandonObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description Observation is already completed or abandoned. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    mergeOtherSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MergeOtherSpeciesRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listAssignedPlots: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/gpx+xml": string;
                    "application/json": components["schemas"]["ListAssignedPlotsResponsePayload"];
                };
            };
        };
    };
    getOneAssignedPlot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetOneAssignedPlotResponsePayload"];
                };
            };
        };
    };
    updatePlotObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlotObservationRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    completePlotObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompletePlotObservationRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The observation of the plot was already completed. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateCompletedObservationPlot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateObservationRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The plot or observation can't be found, or the plot isn't part of the observation. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The plot's observation has not been completed yet. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    claimMonitoringPlot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The plot is already claimed by someone else. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getObservationMediaFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description The plot observation does not exist, or does not have a video with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getObservationMediaStream: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetMuxStreamResponsePayload"];
                };
            };
            /** @description The plot observation does not exist, or does not have a video with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    uploadOtherPlotMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    payload: components["schemas"]["UploadPlotMediaRequestPayload"];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadPlotPhotoResponsePayload"];
                };
            };
        };
    };
    uploadPlotPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    payload: components["schemas"]["UploadPlotPhotoRequestPayload"];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadPlotPhotoResponsePayload"];
                };
            };
        };
    };
    getPlotPhoto: {
        parameters: {
            query?: {
                /** @description Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
                maxWidth?: number;
                /** @description Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
                maxHeight?: number;
            };
            header?: never;
            path: {
                observationId: number;
                plotId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The photo was successfully retrieved. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                    "image/png": string;
                };
            };
            /** @description The plot observation does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updatePlotPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlotPhotoRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The plot observation does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    deletePlotPhoto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
                fileId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The plot observation does not exist, or does not have a photo with the requested ID. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    releaseMonitoringPlot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description You don't have a claim on the plot. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    replaceObservationPlot: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                observationId: number;
                plotId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplaceObservationPlotRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReplaceObservationPlotResponsePayload"];
                };
            };
            /** @description The observation does not exist or does not have the requested monitoring plot. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description The observation of the monitoring plot has already been completed and the plot cannot be replaced. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getObservationResults: {
        parameters: {
            query?: {
                /** @description Whether to include plants in the results. Default to false */
                includePlants?: boolean;
            };
            header?: never;
            path: {
                observationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetObservationResultsResponsePayload"];
                };
            };
        };
    };
    listPlantingSites: {
        parameters: {
            query?: {
                organizationId?: number;
                projectId?: number;
                /** @description If true, include strata and substrata for each site. */
                full?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListPlantingSitesResponsePayload"];
                };
            };
        };
    };
    createPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePlantingSiteRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreatePlantingSiteResponsePayload"];
                };
            };
        };
    };
    listPlantingSiteReportedPlants: {
        parameters: {
            query?: {
                organizationId?: number;
                projectId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListPlantingSiteReportedPlantsResponsePayload"];
                };
            };
        };
    };
    validatePlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePlantingSiteRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidatePlantingSiteResponsePayload"];
                };
            };
        };
    };
    getPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetPlantingSiteResponsePayload"];
                };
            };
        };
    };
    updatePlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlantingSiteRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deletePlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The planting site is in use, e.g., there are plantings allocated to the site. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    listPlantingSiteHistories: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListPlantingSiteHistoriesResponsePayload"];
                };
            };
        };
    };
    getPlantingSiteHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                historyId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetPlantingSiteHistoryResponsePayload"];
                };
            };
        };
    };
    getPlantingSiteReportedPlants: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetPlantingSiteReportedPlantsResponsePayload"];
                };
            };
        };
    };
    updateSubstrata: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSubstratumRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listSubstratumSpecies_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSubstratumSpeciesResponsePayload"];
                };
            };
        };
    };
    updatePlantingSubzone: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePlantingSubzoneRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    listSubstratumSpecies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListSubstratumSpeciesResponsePayload"];
                };
            };
        };
    };
    assignT0SiteData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignSiteT0DataRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    assignT0TempSiteData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignSiteT0TempDataRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getT0SiteData: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                plantingSiteId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSiteT0DataResponsePayload"];
                };
            };
        };
    };
    getAllT0SiteDataSet: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                plantingSiteId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetAllSiteT0DataSetResponsePayload"];
                };
            };
        };
    };
    getT0SpeciesForPlantingSite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                plantingSiteId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetSitePlotSpeciesResponsePayload"];
                };
            };
        };
    };
    searchUsers: {
        parameters: {
            query: {
                /** @description The email to use when searching for a user */
                email: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUserResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getMyself: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUserResponsePayload"];
                };
            };
        };
    };
    updateMyself: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    deleteMyself: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    updateCookieConsent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserCookieConsentRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getUserPreferences: {
        parameters: {
            query?: {
                /** @description If present, get the user's per-organization preferences for this organization. If not present, get the user's global preferences. */
                organizationId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUserPreferencesResponsePayload"];
                };
            };
        };
    };
    updateUserPreferences: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserPreferencesRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUserResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateGlobalRoles: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateGlobalRolesRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    getUserDeliverableCategories: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUserInternalInterestsResponsePayload"];
                };
            };
        };
    };
    updateUserDeliverableCategories: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserInternalInterestsRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
        };
    };
    getVersions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VersionsResponsePayload"];
                };
            };
        };
    };
    handleMuxWebhook: {
        parameters: {
            query?: never;
            header?: {
                "Mux-Signature"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string;
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    getProjectOverallScore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetProjectOverallScoreResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    upsertProjectScores: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProjectOverallScoreRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createAccession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAccessionRequestPayloadV2"];
            };
        };
        responses: {
            /** @description The accession was created successfully. Response includes fields populated by the server, including the accession number and ID. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    uploadAccessionsList: {
        parameters: {
            query: {
                facilityId: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description The file has been successfully received. It will be processed asynchronously; use the ID returned in the response payload to poll for its status using the `/api/v2/seedbank/accessions/uploads/{uploadId}` GET endpoint. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadFileResponsePayload"];
                };
            };
        };
    };
    getAccessionsListUploadTemplate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
        };
    };
    getAccessionsListUploadStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetUploadStatusResponsePayload"];
                };
            };
        };
    };
    deleteAccessionsListUpload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The upload was not awaiting user action. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    resolveAccessionsListUpload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uploadId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveUploadRequestPayload"];
            };
        };
        responses: {
            /** @description The requested operation succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleSuccessResponsePayload"];
                };
            };
            /** @description The upload was not awaiting user action. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    createNurseryTransferWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateNurseryTransferRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateNurseryTransferResponsePayload"];
                };
            };
        };
    };
    listViabilityTests: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListViabilityTestsResponsePayload"];
                };
            };
        };
    };
    createViabilityTest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateViabilityTestRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    getViabilityTest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
                viabilityTestId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetViabilityTestResponsePayload"];
                };
            };
        };
    };
    updateViabilityTest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
                viabilityTestId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateViabilityTestRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    deleteViabilityTest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
                viabilityTestId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    listWithdrawals: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetWithdrawalsResponsePayload"];
                };
            };
        };
    };
    createWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateWithdrawalRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    getWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetWithdrawalResponsePayload"];
                };
            };
        };
    };
    updateWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateWithdrawalRequestPayload"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    deleteWithdrawal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accessionId: number;
                withdrawalId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
        };
    };
    getAccession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GetAccessionResponsePayloadV2"];
                };
            };
            /** @description The requested resource was not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
    updateAccession: {
        parameters: {
            query?: {
                /** @description If true, do not actually save the accession; just return the result that would have been returned if it had been saved. */
                simulate?: boolean;
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAccessionRequestPayloadV2"];
            };
        };
        responses: {
            /** @description The accession was updated successfully. Response includes fields populated or modified by the server as a result of the update. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateAccessionResponsePayloadV2"];
                };
            };
            /** @description The specified accession doesn't exist. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
            /** @description One of the requested changes couldn't be made because the accession is in a state that doesn't allow the change. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimpleErrorResponsePayload"];
                };
            };
        };
    };
}
type WithRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
