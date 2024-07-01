--
-- PostgreSQL database dump
--

-- Dumped from database version 13.12 (Debian 13.12-1.pgdg110+1)
-- Dumped by pg_dump version 13.12 (Debian 13.12-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: accelerator; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA accelerator;


--
-- Name: nursery; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA nursery;


--
-- Name: seedbank; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA seedbank;


--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger;


--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tiger_data;


--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA topology;


--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: tracking; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tracking;


--
-- Name: natural_numeric; Type: COLLATION; Schema: public; Owner: -
--

CREATE COLLATION public.natural_numeric (provider = icu, locale = 'en-u-kn-true');


--
-- Name: COLLATION natural_numeric; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLLATION public.natural_numeric IS 'Collation that sorts strings that contain numbers in numeric order, e.g., `a2` comes before `a10`.';


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: column_exists(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.column_exists(ptable text, pcolumn text) RETURNS boolean
    LANGUAGE sql STABLE STRICT
    AS $$
    -- does the requested table.column exist in schema?
SELECT EXISTS
           (SELECT NULL
            FROM information_schema.columns
            WHERE table_name = ptable
              AND column_name = pcolumn
           );
$$;


--
-- Name: rename_column_if_exists(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rename_column_if_exists(ptable text, pcolumn text, new_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Rename the column if it exists.
    IF column_exists(ptable, pcolumn) THEN
        EXECUTE FORMAT('ALTER TABLE %I RENAME COLUMN %I TO %I;',
                       ptable, pcolumn, new_name);
    END IF;
END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cohort_modules; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.cohort_modules (
    cohort_id bigint NOT NULL,
    module_id bigint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    title text NOT NULL,
    CONSTRAINT dates_start_before_end CHECK ((start_date < end_date))
);


--
-- Name: TABLE cohort_modules; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.cohort_modules IS 'Which modules are assigned to which cohorts.';


--
-- Name: COLUMN cohort_modules.title; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.cohort_modules.title IS 'The title for the module for the cohort. For example "Module 3A" for Module 3A: Title';


--
-- Name: cohort_phases; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.cohort_phases (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE cohort_phases; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.cohort_phases IS '(Enum) Available cohort phases';


--
-- Name: cohorts; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.cohorts (
    id bigint NOT NULL,
    name text NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    phase_id integer NOT NULL
);


--
-- Name: TABLE cohorts; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.cohorts IS 'Accelerator cohort details.';


--
-- Name: cohorts_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.cohorts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.cohorts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: deal_stages; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deal_stages (
    id integer NOT NULL,
    name text NOT NULL,
    pipeline_id integer NOT NULL
);


--
-- Name: TABLE deal_stages; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deal_stages IS '(Enum) Stages in the deal workflow that a project progresses through.';


--
-- Name: default_voters; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.default_voters (
    user_id bigint NOT NULL
);


--
-- Name: TABLE default_voters; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.default_voters IS 'Users to automatically be assigned as voters on accelerator projects.';


--
-- Name: deliverable_categories; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deliverable_categories (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE deliverable_categories; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deliverable_categories IS '(Enum) High-level groups for organizing deliverables.';


--
-- Name: deliverable_cohort_due_dates; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deliverable_cohort_due_dates (
    deliverable_id bigint NOT NULL,
    cohort_id bigint NOT NULL,
    due_date date NOT NULL
);


--
-- Name: TABLE deliverable_cohort_due_dates; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deliverable_cohort_due_dates IS 'Deliverable due dates overrides for cohorts. Can be overridden at the project level.';


--
-- Name: deliverable_documents; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deliverable_documents (
    deliverable_id bigint NOT NULL,
    deliverable_type_id integer NOT NULL,
    template_url text,
    CONSTRAINT deliverable_is_document CHECK ((deliverable_type_id = 1))
);


--
-- Name: TABLE deliverable_documents; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deliverable_documents IS 'Information about expected deliverables of type Document that isn''t relevant for other deliverable types.';


--
-- Name: deliverable_project_due_dates; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deliverable_project_due_dates (
    deliverable_id bigint NOT NULL,
    project_id bigint NOT NULL,
    due_date date NOT NULL
);


--
-- Name: TABLE deliverable_project_due_dates; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deliverable_project_due_dates IS 'Deliverable due dates overrides for projects.';


--
-- Name: deliverable_types; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deliverable_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE deliverable_types; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deliverable_types IS '(Enum) Types of deliverables for an accelerator module.';


--
-- Name: deliverables; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.deliverables (
    id bigint NOT NULL,
    deliverable_category_id integer NOT NULL,
    deliverable_type_id integer NOT NULL,
    module_id bigint NOT NULL,
    "position" integer NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    name text NOT NULL,
    description_html text,
    is_sensitive boolean NOT NULL,
    is_required boolean NOT NULL
);


--
-- Name: TABLE deliverables; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.deliverables IS 'Information about expected deliverables. This describes what we request from users; the data we get back from users in response is recorded in `project_deliverables` and its child tables.';


--
-- Name: COLUMN deliverables."position"; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.deliverables."position" IS 'Which position this deliverable appears in the module''s list of deliverables, starting with 1.';


--
-- Name: COLUMN deliverables.is_sensitive; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.deliverables.is_sensitive IS 'If true, the data users provide in response to this deliverable will be visible to a smaller subset of accelerator admins. Secure documents are saved to a different document store than non-secure ones.';


--
-- Name: deliverables_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.deliverables ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.deliverables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: document_stores; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.document_stores (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE document_stores; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.document_stores IS '(Enum) Locations where uploaded documents are stored.';


--
-- Name: event_projects; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.event_projects (
    event_id bigint NOT NULL,
    project_id bigint NOT NULL
);


--
-- Name: TABLE event_projects; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.event_projects IS 'Projects that are participants of an event.';


--
-- Name: event_statuses; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.event_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE event_statuses; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.event_statuses IS '(Enum) Statuses of events for an accelerator module';


--
-- Name: event_types; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.event_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE event_types; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.event_types IS '(Enum) Types of events for an accelerator module';


--
-- Name: events; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.events (
    id bigint NOT NULL,
    module_id bigint NOT NULL,
    event_type_id integer NOT NULL,
    meeting_url text,
    slides_url text,
    recording_url text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    revision integer DEFAULT 1 NOT NULL,
    event_status_id integer NOT NULL,
    CONSTRAINT times_start_before_end CHECK ((start_time < end_time))
);


--
-- Name: TABLE events; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.events IS 'Events with meeting links and time within an acclerator module.';


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.events ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modules; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.modules (
    id bigint NOT NULL,
    name text NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    overview text,
    preparation_materials text,
    live_session_description text,
    workshop_description text,
    one_on_one_session_description text,
    additional_resources text,
    phase_id integer NOT NULL
);


--
-- Name: TABLE modules; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.modules IS 'Possible steps in the workflow of a cohort phase.';


--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.modules ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participant_project_species; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.participant_project_species (
    id bigint NOT NULL,
    project_id bigint,
    species_id bigint,
    submission_status_id integer NOT NULL,
    feedback text,
    rationale text,
    created_by bigint,
    modified_by bigint,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    internal_comment text,
    species_native_category_id integer
);


--
-- Name: TABLE participant_project_species; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.participant_project_species IS 'Species that are associated to a participant project';


--
-- Name: participant_project_species_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.participant_project_species ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.participant_project_species_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.participants (
    id bigint NOT NULL,
    name text NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    cohort_id bigint
);


--
-- Name: TABLE participants; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.participants IS 'Accelerator participant details.';


--
-- Name: participants_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.participants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pipelines; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.pipelines (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE pipelines; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.pipelines IS '(Enum) Deal pipelines for accelerator projects.';


--
-- Name: project_accelerator_details; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.project_accelerator_details (
    project_id bigint NOT NULL,
    pipeline_id integer,
    deal_stage_id integer,
    application_reforestable_land numeric,
    confirmed_reforestable_land numeric,
    total_expansion_potential numeric,
    num_native_species integer,
    min_carbon_accumulation numeric,
    max_carbon_accumulation numeric,
    per_hectare_budget numeric,
    num_communities integer,
    investment_thesis text,
    failure_risk text,
    what_needs_to_be_true text,
    deal_description text,
    project_lead text,
    file_naming text,
    dropbox_folder_path text,
    google_folder_url text
);


--
-- Name: TABLE project_accelerator_details; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.project_accelerator_details IS 'Details about projects that are only relevant for accelerator applicants. The values here are for internal use, not exposed to end users.';


--
-- Name: COLUMN project_accelerator_details.file_naming; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.project_accelerator_details.file_naming IS 'Identifier that is included in generated filenames. This is often, but not necessarily, the same as the project name.';


--
-- Name: submissions; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.submissions (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    deliverable_id bigint NOT NULL,
    submission_status_id integer NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    internal_comment text,
    feedback text
);


--
-- Name: TABLE submissions; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.submissions IS 'Information about the current states of the information supplied by specific projects in response to deliverables.';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id bigint NOT NULL,
    created_by bigint DEFAULT '-1'::integer NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint DEFAULT '-1'::integer NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    organization_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    participant_id bigint,
    country_code text
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'Distinguishes among an organization''s projects.';


--
-- Name: project_deliverables; Type: VIEW; Schema: accelerator; Owner: -
--

CREATE VIEW accelerator.project_deliverables AS
 SELECT deliverables.id AS deliverable_id,
    deliverables.deliverable_category_id,
    deliverables.deliverable_type_id,
    deliverables."position",
    deliverables.name,
    deliverables.description_html,
    deliverables.is_required,
    deliverables.is_sensitive,
    deliverables.module_id,
    COALESCE(project_due_dates.due_date, cohort_due_dates.due_date, cohort_modules.end_date) AS due_date,
    projects.id AS project_id,
    submissions.id AS submission_id,
    submissions.submission_status_id,
    submissions.feedback AS submission_feedback
   FROM ((((((((accelerator.deliverables deliverables
     JOIN accelerator.modules modules ON ((deliverables.module_id = modules.id)))
     JOIN accelerator.cohort_modules cohort_modules ON ((modules.id = cohort_modules.module_id)))
     JOIN accelerator.cohorts cohorts ON ((cohorts.id = cohort_modules.cohort_id)))
     JOIN accelerator.participants participants ON ((participants.cohort_id = cohorts.id)))
     JOIN public.projects ON ((projects.participant_id = participants.id)))
     LEFT JOIN accelerator.submissions submissions ON (((submissions.project_id = projects.id) AND (submissions.deliverable_id = deliverables.id))))
     LEFT JOIN accelerator.deliverable_project_due_dates project_due_dates ON (((project_due_dates.project_id = projects.id) AND (project_due_dates.deliverable_id = deliverables.id))))
     LEFT JOIN accelerator.deliverable_cohort_due_dates cohort_due_dates ON (((cohort_due_dates.cohort_id = cohorts.id) AND (cohort_due_dates.deliverable_id = deliverables.id))));


--
-- Name: VIEW project_deliverables; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON VIEW accelerator.project_deliverables IS 'Deliverable information for projects including submission status and due dates.';


--
-- Name: project_scores; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.project_scores (
    project_id bigint NOT NULL,
    phase_id integer NOT NULL,
    score_category_id integer NOT NULL,
    score integer,
    qualitative text,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    CONSTRAINT project_scores_score_check CHECK (((score >= '-2'::integer) AND (score <= 2)))
);


--
-- Name: TABLE project_scores; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.project_scores IS 'Scores assigned to project by scorers.';


--
-- Name: COLUMN project_scores.score; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.project_scores.score IS 'Integer score between -2 to 2. The score can be null to represent not yet scored. ';


--
-- Name: project_vote_decisions; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.project_vote_decisions (
    project_id bigint NOT NULL,
    phase_id integer NOT NULL,
    vote_option_id integer,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE project_vote_decisions; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.project_vote_decisions IS 'Calculated vote decisions for project.';


--
-- Name: project_votes; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.project_votes (
    user_id bigint NOT NULL,
    project_id bigint NOT NULL,
    phase_id integer NOT NULL,
    vote_option_id integer,
    conditional_info text,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE project_votes; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.project_votes IS 'Vote selected by voters.';


--
-- Name: COLUMN project_votes.vote_option_id; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.project_votes.vote_option_id IS 'Vote option can be Yes/No/Conditional. The vote can be null to represent not yet voted. ';


--
-- Name: score_categories; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.score_categories (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE score_categories; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.score_categories IS '(Enum) Project score categories.';


--
-- Name: submission_documents; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.submission_documents (
    id bigint NOT NULL,
    submission_id bigint NOT NULL,
    document_store_id integer NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    name text NOT NULL,
    description text,
    location text NOT NULL,
    original_name text,
    project_id bigint NOT NULL
);


--
-- Name: TABLE submission_documents; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.submission_documents IS 'Information about documents uploaded by users to satisfy deliverables. A deliverable can have multiple documents.';


--
-- Name: COLUMN submission_documents.name; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.submission_documents.name IS 'System-generated filename. The file is stored using this name in the document store. This includes several elements such as the date and description.';


--
-- Name: COLUMN submission_documents.location; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.submission_documents.location IS 'Location of file in the document store identified by `document_store_id`. This is used by the system to generate download links and includes whatever information is needed to generate a link for a given document store; if the document store supports permalinks then this may be a simple URL.';


--
-- Name: COLUMN submission_documents.original_name; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON COLUMN accelerator.submission_documents.original_name IS 'Original filename as supplied by the client when the document was uploaded. Not required to be unique since the user can upload revised versions of documents.';


--
-- Name: submission_documents_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.submission_documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.submission_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: submission_snapshots; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.submission_snapshots (
    id bigint NOT NULL,
    file_id bigint,
    submission_id bigint NOT NULL
);


--
-- Name: TABLE submission_snapshots; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.submission_snapshots IS 'Snapshot files associated to submissions';


--
-- Name: submission_snapshots_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.submission_snapshots ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.submission_snapshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: submission_statuses; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.submission_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE submission_statuses; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.submission_statuses IS '(Enum) Statuses of submissions of deliverables by specific projects.';


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: -
--

ALTER TABLE accelerator.submissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vote_options; Type: TABLE; Schema: accelerator; Owner: -
--

CREATE TABLE accelerator.vote_options (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE vote_options; Type: COMMENT; Schema: accelerator; Owner: -
--

COMMENT ON TABLE accelerator.vote_options IS '(Enum) Available vote options.';


--
-- Name: batch_details_history; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_details_history (
    id bigint NOT NULL,
    batch_id bigint NOT NULL,
    version integer NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    notes text,
    ready_by_date date,
    project_id bigint,
    project_name text,
    substrate_id integer,
    substrate_notes text,
    treatment_id integer,
    treatment_notes text
);


--
-- Name: TABLE batch_details_history; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_details_history IS 'Record of changes of user-editable attributes of each nursery batch.';


--
-- Name: COLUMN batch_details_history.project_name; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_details_history.project_name IS 'Name of project as of the time the batch was edited. Not updated if project is later renamed.';


--
-- Name: batch_details_history_id_seq; Type: SEQUENCE; Schema: nursery; Owner: -
--

ALTER TABLE nursery.batch_details_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME nursery.batch_details_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: batch_details_history_sub_locations; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_details_history_sub_locations (
    batch_details_history_id bigint NOT NULL,
    sub_location_id bigint NOT NULL,
    sub_location_name text NOT NULL
);


--
-- Name: TABLE batch_details_history_sub_locations; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_details_history_sub_locations IS 'Record of changes to sub-locations of each nursery batch.';


--
-- Name: COLUMN batch_details_history_sub_locations.sub_location_name; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_details_history_sub_locations.sub_location_name IS 'Name of sub-location as of the time the batch was edited. Not updated if sub-location is later renamed.';


--
-- Name: batch_photos; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_photos (
    id bigint NOT NULL,
    batch_id bigint NOT NULL,
    file_id bigint,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    deleted_by bigint,
    deleted_time timestamp with time zone
);


--
-- Name: TABLE batch_photos; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_photos IS 'Information about photos of batches.';


--
-- Name: COLUMN batch_photos.file_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_photos.file_id IS 'File ID if the photo exists. Null if the photo has been deleted.';


--
-- Name: batch_photos_id_seq; Type: SEQUENCE; Schema: nursery; Owner: -
--

ALTER TABLE nursery.batch_photos ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME nursery.batch_photos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: batch_quantity_history; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_quantity_history (
    id bigint NOT NULL,
    batch_id bigint NOT NULL,
    history_type_id integer NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    germinating_quantity integer NOT NULL,
    not_ready_quantity integer NOT NULL,
    ready_quantity integer NOT NULL,
    withdrawal_id bigint,
    version integer NOT NULL,
    CONSTRAINT batch_quantity_history_germinating_quantity_check CHECK ((germinating_quantity >= 0)),
    CONSTRAINT batch_quantity_history_not_ready_quantity_check CHECK ((not_ready_quantity >= 0)),
    CONSTRAINT batch_quantity_history_ready_quantity_check CHECK ((ready_quantity >= 0))
);


--
-- Name: TABLE batch_quantity_history; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_quantity_history IS 'Record of changes of seedling quantities in each nursery batch.';


--
-- Name: COLUMN batch_quantity_history.batch_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.batch_id IS 'Which batch''s quantities were changed.';


--
-- Name: COLUMN batch_quantity_history.history_type_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.history_type_id IS 'Type of operation that resulted in the change in quantities.';


--
-- Name: COLUMN batch_quantity_history.created_by; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.created_by IS 'Which user triggered the change in quantities. "Created" here refers to the history row, not the batch.';


--
-- Name: COLUMN batch_quantity_history.created_time; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.created_time IS 'When the change in quantities happened. "Created" here refers to the history row, not the batch.';


--
-- Name: COLUMN batch_quantity_history.germinating_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.germinating_quantity IS 'New number of germinating seedlings in the batch.';


--
-- Name: COLUMN batch_quantity_history.not_ready_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.not_ready_quantity IS 'New number of not-ready-for-planting seedlings in the batch.';


--
-- Name: COLUMN batch_quantity_history.ready_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.ready_quantity IS 'New number of ready-for-planting seedlings in the batch.';


--
-- Name: COLUMN batch_quantity_history.withdrawal_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_quantity_history.withdrawal_id IS 'If this change in quantity was due to a withdrawal from the batch, the withdrawal''s ID.';


--
-- Name: batch_quantity_history_id_seq; Type: SEQUENCE; Schema: nursery; Owner: -
--

ALTER TABLE nursery.batch_quantity_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME nursery.batch_quantity_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: batch_quantity_history_types; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_quantity_history_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE batch_quantity_history_types; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_quantity_history_types IS '(Enum) Types of operations that can result in changes to remaining quantities of seedling batches.';


--
-- Name: batch_sub_locations; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_sub_locations (
    batch_id bigint NOT NULL,
    sub_location_id bigint NOT NULL,
    facility_id bigint NOT NULL
);


--
-- Name: TABLE batch_sub_locations; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_sub_locations IS 'Which batches are stored in which sub-locations.';


--
-- Name: batch_substrates; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_substrates (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE batch_substrates; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_substrates IS '(Enum) Substrates in which seedlings can be planted in a nursery.';


--
-- Name: batch_withdrawals; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batch_withdrawals (
    batch_id bigint NOT NULL,
    withdrawal_id bigint NOT NULL,
    germinating_quantity_withdrawn integer NOT NULL,
    not_ready_quantity_withdrawn integer NOT NULL,
    ready_quantity_withdrawn integer NOT NULL,
    destination_batch_id bigint,
    CONSTRAINT quantity_signs_consistent CHECK ((((germinating_quantity_withdrawn <= 0) AND (not_ready_quantity_withdrawn <= 0) AND (ready_quantity_withdrawn <= 0)) OR ((germinating_quantity_withdrawn >= 0) AND (not_ready_quantity_withdrawn >= 0) AND (ready_quantity_withdrawn >= 0))))
);


--
-- Name: TABLE batch_withdrawals; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batch_withdrawals IS 'Number of seedlings withdrawn from each originating batch as part of a withdrawal.';


--
-- Name: COLUMN batch_withdrawals.batch_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_withdrawals.batch_id IS 'The batch from which the seedlings were withdrawn, also referred to as the originating batch.';


--
-- Name: COLUMN batch_withdrawals.withdrawal_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_withdrawals.withdrawal_id IS 'The withdrawal that removed seedlings from this batch. A withdrawal can come from multiple batches, in which case there will be more than one `batch_withdrawals` row with the same withdrawal ID.';


--
-- Name: COLUMN batch_withdrawals.germinating_quantity_withdrawn; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_withdrawals.germinating_quantity_withdrawn IS 'Number of germinating seedlings that were withdrawn from this batch. This is not necessarily the total number of seedlings in the withdrawal as a whole since a withdrawal can come from multiple batches.';


--
-- Name: COLUMN batch_withdrawals.not_ready_quantity_withdrawn; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_withdrawals.not_ready_quantity_withdrawn IS 'Number of not-ready-for-planting seedlings that were withdrawn from this batch. This is not necessarily the total number of seedlings in the withdrawal as a whole since a withdrawal can come from multiple batches.';


--
-- Name: COLUMN batch_withdrawals.ready_quantity_withdrawn; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_withdrawals.ready_quantity_withdrawn IS 'Number of ready-for-planting seedlings that were withdrawn from this batch. This is not necessarily the total number of seedlings in the withdrawal as a whole since a withdrawal can come from multiple batches.';


--
-- Name: COLUMN batch_withdrawals.destination_batch_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batch_withdrawals.destination_batch_id IS 'If the withdrawal was a nursery transfer, the batch that was created as a result. A withdrawal can have more than one originating batch; if they are of the same species, only one destination batch will be created and there will be multiple rows with the same `destination_batch_id`. May be null if the batch was subsequently deleted.';


--
-- Name: batches; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.batches (
    id bigint NOT NULL,
    version integer NOT NULL,
    organization_id bigint NOT NULL,
    facility_id bigint NOT NULL,
    species_id bigint NOT NULL,
    batch_number text NOT NULL,
    added_date date NOT NULL,
    germinating_quantity integer NOT NULL,
    not_ready_quantity integer NOT NULL,
    ready_quantity integer NOT NULL,
    latest_observed_germinating_quantity integer NOT NULL,
    latest_observed_not_ready_quantity integer NOT NULL,
    latest_observed_ready_quantity integer NOT NULL,
    latest_observed_time timestamp with time zone NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    notes text,
    ready_by_date date,
    accession_id bigint,
    project_id bigint,
    substrate_id integer,
    substrate_notes text,
    treatment_id integer,
    treatment_notes text,
    germination_rate integer,
    loss_rate integer,
    initial_batch_id bigint,
    total_germinated integer,
    total_germination_candidates integer,
    total_lost integer,
    total_loss_candidates integer,
    CONSTRAINT batches_germinating_quantity_check CHECK ((germinating_quantity >= 0)),
    CONSTRAINT batches_latest_observed_germinating_quantity_check CHECK ((latest_observed_germinating_quantity >= 0)),
    CONSTRAINT batches_latest_observed_not_ready_quantity_check CHECK ((latest_observed_not_ready_quantity >= 0)),
    CONSTRAINT batches_latest_observed_ready_quantity_check CHECK ((latest_observed_ready_quantity >= 0)),
    CONSTRAINT batches_not_ready_quantity_check CHECK ((not_ready_quantity >= 0)),
    CONSTRAINT batches_notes_check CHECK ((notes !~ similar_to_escape(' *'::text))),
    CONSTRAINT batches_ready_quantity_check CHECK ((ready_quantity >= 0)),
    CONSTRAINT batches_version_check CHECK ((version > 0))
);


--
-- Name: TABLE batches; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.batches IS 'Information about batches of seedlings at nurseries.';


--
-- Name: COLUMN batches.id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.id IS 'Globally-unique internal identifier for the batch. Not typically presented to end users; "batch_number" is the user-facing identifier.';


--
-- Name: COLUMN batches.version; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.version IS 'Increases by 1 each time the batch is modified. Used to detect when clients have stale data about batches.';


--
-- Name: COLUMN batches.organization_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.organization_id IS 'Which organization owns the nursery where this batch is located.';


--
-- Name: COLUMN batches.facility_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.facility_id IS 'Which nursery contains the batch. Facility must be of type "Nursery" and under the same organization as the species ID (enforced in application code).';


--
-- Name: COLUMN batches.species_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.species_id IS 'Species of the batch''s plants. Must be under the same organization as the facility ID (enforced in application code).';


--
-- Name: COLUMN batches.batch_number; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.batch_number IS 'User-friendly unique (per organization) identifier for the batch. Not used internally or in API; "id" is the internal identifier.';


--
-- Name: COLUMN batches.added_date; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.added_date IS 'User-supplied date the batch was added to the nursery''s inventory.';


--
-- Name: COLUMN batches.germinating_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.germinating_quantity IS 'Number of germinating seedlings currently available in inventory. Withdrawals cause this to decrease.';


--
-- Name: COLUMN batches.not_ready_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.not_ready_quantity IS 'Number of not-ready-for-planting seedlings currently available in inventory. Withdrawals cause this to decrease.';


--
-- Name: COLUMN batches.ready_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.ready_quantity IS 'Number of ready-for-planting seedlings currently available in inventory. Withdrawals cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_germinating_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.latest_observed_germinating_quantity IS 'Latest user-observed number of germinating seedlings currently available in inventory. Withdrawals do not cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_not_ready_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.latest_observed_not_ready_quantity IS 'Latest user-observed number of not-ready-for-planting seedlings currently available in inventory. Withdrawals do not cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_ready_quantity; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.latest_observed_ready_quantity IS 'Latest user-observed number of ready-for-planting seedlings currently available in inventory. Withdrawals do not cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_time; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.latest_observed_time IS 'When the latest user observation of seedling quantities took place.';


--
-- Name: COLUMN batches.created_by; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.created_by IS 'Which user initially created the batch.';


--
-- Name: COLUMN batches.created_time; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.created_time IS 'When the batch was initially created.';


--
-- Name: COLUMN batches.modified_by; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.modified_by IS 'Which user most recently modified the batch, either directly or by creating a withdrawal.';


--
-- Name: COLUMN batches.modified_time; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.modified_time IS 'When the batch was most recently modified, either directly or by creating a withdrawal.';


--
-- Name: COLUMN batches.notes; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.notes IS 'User-supplied freeform notes about batch.';


--
-- Name: COLUMN batches.ready_by_date; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.ready_by_date IS 'User-supplied estimate of when the batch will be ready for planting.';


--
-- Name: COLUMN batches.accession_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.accession_id IS 'If the batch was created by a nursery transfer from a seed bank, the originating accession ID.';


--
-- Name: COLUMN batches.total_germinated; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.total_germinated IS 'Total number of seedlings that have moved from Germinating to Not Ready status over the lifetime of the batch. This is the numerator for the germination rate calculation.';


--
-- Name: COLUMN batches.total_germination_candidates; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.total_germination_candidates IS 'Total number of seedlings that have been candidates for moving from Germinating to Not Ready status. This includes seedlings that are already germinated and germinating seedlings that were withdrawn as Dead, but does not include germinating seedlings that were withdrawn for other reasons. This is the denominator for the germination rate calculation.';


--
-- Name: COLUMN batches.total_lost; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.total_lost IS 'Total number of non-germinating (Not Ready and Ready) seedlings that have been withdrawn as Dead. This is the numerator for the loss rate calculation.';


--
-- Name: COLUMN batches.total_loss_candidates; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.batches.total_loss_candidates IS 'Total number of non-germinating (Not Ready and Ready) seedlings that have been candidates for being withdrawn as dead. This includes seedlings that are still in the batch, seedlings that were withdrawn for outplanting, and seedlings that were already withdrawn as dead, but does not include germinating seedlings or seedlings that were withdrawn for other reasons. This is the denominator for the loss rate calculation.';


--
-- Name: batch_summaries; Type: VIEW; Schema: nursery; Owner: -
--

CREATE VIEW nursery.batch_summaries AS
 SELECT b.id,
    b.organization_id,
    b.facility_id,
    b.species_id,
    b.batch_number,
    b.added_date,
    b.ready_quantity,
    b.not_ready_quantity,
    b.germinating_quantity,
    (b.ready_quantity + b.not_ready_quantity) AS total_quantity,
    b.ready_by_date,
    b.notes,
    b.accession_id,
    COALESCE(( SELECT sum((bw.ready_quantity_withdrawn + bw.not_ready_quantity_withdrawn)) AS sum
           FROM nursery.batch_withdrawals bw
          WHERE (b.id = bw.batch_id)), (0)::bigint) AS total_quantity_withdrawn,
    b.version,
    b.project_id,
    b.substrate_id,
    b.substrate_notes,
    b.treatment_id,
    b.treatment_notes,
    b.germination_rate,
    b.loss_rate,
    b.initial_batch_id
   FROM nursery.batches b;


--
-- Name: batches_id_seq; Type: SEQUENCE; Schema: nursery; Owner: -
--

ALTER TABLE nursery.batches ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME nursery.batches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: facility_inventories; Type: VIEW; Schema: nursery; Owner: -
--

CREATE VIEW nursery.facility_inventories AS
 SELECT batches.organization_id,
    batches.species_id,
    batches.facility_id,
    sum(batches.ready_quantity) AS ready_quantity,
    sum(batches.not_ready_quantity) AS not_ready_quantity,
    sum(batches.germinating_quantity) AS germinating_quantity,
    sum((batches.ready_quantity + batches.not_ready_quantity)) AS total_quantity
   FROM nursery.batches
  GROUP BY batches.organization_id, batches.species_id, batches.facility_id
 HAVING (sum(((batches.ready_quantity + batches.not_ready_quantity) + batches.germinating_quantity)) > 0);


--
-- Name: facility_inventory_totals; Type: VIEW; Schema: nursery; Owner: -
--

CREATE VIEW nursery.facility_inventory_totals AS
 SELECT batches.organization_id,
    batches.facility_id,
    sum(batches.ready_quantity) AS ready_quantity,
    sum(batches.not_ready_quantity) AS not_ready_quantity,
    sum(batches.germinating_quantity) AS germinating_quantity,
    sum((batches.ready_quantity + batches.not_ready_quantity)) AS total_quantity,
    count(DISTINCT batches.species_id) AS total_species
   FROM nursery.batches
  WHERE ((batches.ready_quantity > 0) OR (batches.not_ready_quantity > 0) OR (batches.germinating_quantity > 0))
  GROUP BY batches.organization_id, batches.facility_id;


--
-- Name: inventories; Type: VIEW; Schema: nursery; Owner: -
--

CREATE VIEW nursery.inventories AS
 SELECT batches.organization_id,
    batches.species_id,
    sum(batches.ready_quantity) AS ready_quantity,
    sum(batches.not_ready_quantity) AS not_ready_quantity,
    sum(batches.germinating_quantity) AS germinating_quantity,
    sum((batches.ready_quantity + batches.not_ready_quantity)) AS total_quantity
   FROM nursery.batches
  GROUP BY batches.organization_id, batches.species_id
 HAVING (sum(((batches.ready_quantity + batches.not_ready_quantity) + batches.germinating_quantity)) > 0);


--
-- Name: species_projects; Type: VIEW; Schema: nursery; Owner: -
--

CREATE VIEW nursery.species_projects AS
 SELECT DISTINCT batches.organization_id,
    batches.species_id,
    batches.project_id
   FROM nursery.batches
  WHERE ((batches.project_id IS NOT NULL) AND ((batches.germinating_quantity > 0) OR (batches.not_ready_quantity > 0) OR (batches.ready_quantity > 0)));


--
-- Name: VIEW species_projects; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON VIEW nursery.species_projects IS 'Which species have active batches associated with which projects.';


--
-- Name: withdrawal_photos; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.withdrawal_photos (
    file_id bigint NOT NULL,
    withdrawal_id bigint NOT NULL
);


--
-- Name: TABLE withdrawal_photos; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.withdrawal_photos IS 'Linking table between `withdrawals` and `files`.';


--
-- Name: withdrawal_purposes; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.withdrawal_purposes (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE withdrawal_purposes; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.withdrawal_purposes IS '(Enum) Reasons that someone can withdraw seedlings from a nursery.';


--
-- Name: withdrawals; Type: TABLE; Schema: nursery; Owner: -
--

CREATE TABLE nursery.withdrawals (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    purpose_id integer NOT NULL,
    withdrawn_date date NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    destination_facility_id bigint,
    notes text,
    undoes_withdrawal_id bigint,
    CONSTRAINT undo_requires_withdrawal_id CHECK ((((purpose_id = 5) AND (undoes_withdrawal_id IS NOT NULL)) OR ((purpose_id <> 5) AND (undoes_withdrawal_id IS NULL)))),
    CONSTRAINT withdrawals_destination_only_for_transfers CHECK (((destination_facility_id IS NULL) OR (purpose_id = 1))),
    CONSTRAINT withdrawals_notes_check CHECK ((notes !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE withdrawals; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON TABLE nursery.withdrawals IS 'Top-level information about a withdrawal from a nursery. Does not contain withdrawal quantities; those are in the `batch_withdrawals` table.';


--
-- Name: COLUMN withdrawals.facility_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.facility_id IS 'Nursery from which the seedlings were withdrawn.';


--
-- Name: COLUMN withdrawals.purpose_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.purpose_id IS 'Purpose of the withdrawal (nursery transfer, dead seedlings, etc.)';


--
-- Name: COLUMN withdrawals.withdrawn_date; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.withdrawn_date IS 'User-supplied date when the seedlings were withdrawn.';


--
-- Name: COLUMN withdrawals.created_by; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.created_by IS 'Which user created the withdrawal.';


--
-- Name: COLUMN withdrawals.created_time; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.created_time IS 'When the withdrawal was created.';


--
-- Name: COLUMN withdrawals.modified_by; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.modified_by IS 'Which user most recently modified the withdrawal.';


--
-- Name: COLUMN withdrawals.modified_time; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.modified_time IS 'When the withdrawal was most recently modified.';


--
-- Name: COLUMN withdrawals.destination_facility_id; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.destination_facility_id IS 'If the withdrawal was a nursery transfer, the facility where the seedlings were sent. May be null if the facility was subsequently deleted.';


--
-- Name: COLUMN withdrawals.notes; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON COLUMN nursery.withdrawals.notes IS 'User-supplied freeform text describing the withdrawal.';


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facilities (
    id bigint NOT NULL,
    type_id integer NOT NULL,
    name text NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
    max_idle_minutes integer DEFAULT 30 NOT NULL,
    last_timeseries_time timestamp with time zone,
    idle_after_time timestamp with time zone,
    idle_since_time timestamp with time zone,
    description text,
    connection_state_id integer DEFAULT 1 NOT NULL,
    organization_id bigint NOT NULL,
    time_zone text,
    last_notification_date date,
    next_notification_time timestamp with time zone DEFAULT '1970-01-01 00:00:00+00'::timestamp with time zone NOT NULL,
    build_started_date date,
    build_completed_date date,
    operation_started_date date,
    capacity integer,
    facility_number integer NOT NULL,
    CONSTRAINT facilities_description_check CHECK ((description !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE facilities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facilities IS 'Physical locations at a site. For example, each seed bank and each nursery is a facility.';


--
-- Name: COLUMN facilities.max_idle_minutes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.facilities.max_idle_minutes IS 'Send an alert if this many minutes pass without new timeseries data from a facility''s device manager.';


--
-- Name: COLUMN facilities.last_timeseries_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.facilities.last_timeseries_time IS 'When the most recent timeseries data was received from the facility.';


--
-- Name: COLUMN facilities.idle_after_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.facilities.idle_after_time IS 'Time at which the facility will be considered idle if no timeseries data is received. Null if the timeseries has already been marked as idle or if no timeseries data has ever been received from the facility.';


--
-- Name: COLUMN facilities.idle_since_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.facilities.idle_since_time IS 'Time at which the facility became idle. Null if the facility is not currently considered idle.';


--
-- Name: COLUMN facilities.last_notification_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.facilities.last_notification_date IS 'Local date on which facility-related notifications were last generated.';


--
-- Name: COLUMN facilities.next_notification_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.facilities.next_notification_time IS 'Time at which the server should next generate notifications for the facility if any are needed.';


--
-- Name: deliveries; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.deliveries (
    id bigint NOT NULL,
    withdrawal_id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    reassigned_by bigint,
    reassigned_time timestamp with time zone
);


--
-- Name: TABLE deliveries; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.deliveries IS 'Incoming deliveries of new seedlings to a planting site. Mostly exists to link plantings and nursery withdrawals.';


--
-- Name: COLUMN deliveries.withdrawal_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.withdrawal_id IS 'Which nursery withdrawal the plants came from.';


--
-- Name: COLUMN deliveries.planting_site_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.planting_site_id IS 'Which planting site received the delivery.';


--
-- Name: COLUMN deliveries.created_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.created_by IS 'Which user created the delivery.';


--
-- Name: COLUMN deliveries.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.created_time IS 'When the delivery was created.';


--
-- Name: COLUMN deliveries.modified_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.modified_by IS 'Which user most recently modified the delivery.';


--
-- Name: COLUMN deliveries.modified_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.modified_time IS 'When the delivery was most recently modified.';


--
-- Name: COLUMN deliveries.reassigned_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.reassigned_by IS 'Which user recorded the reassignment of plants in this delivery. Null if this delivery has no reassignment.';


--
-- Name: COLUMN deliveries.reassigned_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.deliveries.reassigned_time IS 'When the reassignment was recorded. Null if this delivery has no reassignment.';


--
-- Name: planting_sites; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_sites (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    boundary public.geometry(MultiPolygon),
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    time_zone text,
    area_ha numeric,
    project_id bigint,
    exclusion public.geometry(MultiPolygon),
    grid_origin public.geometry(Point),
    CONSTRAINT area_positive CHECK ((area_ha > (0)::numeric)),
    CONSTRAINT planting_sites_description_check CHECK ((description !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE planting_sites; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_sites IS 'Top-level information about entire planting sites. Every planting site has at least one planting zone.';


--
-- Name: COLUMN planting_sites.organization_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.organization_id IS 'Which organization owns this planting site.';


--
-- Name: COLUMN planting_sites.name; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.name IS 'Short name of this planting site. Must be unique within the organization.';


--
-- Name: COLUMN planting_sites.description; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.description IS 'Optional user-supplied description of the planting site.';


--
-- Name: COLUMN planting_sites.boundary; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.boundary IS 'Boundary of the entire planting site. Planting zones will generally fall inside this boundary. This will typically be a single polygon but may be multiple polygons if a planting site has several disjoint areas. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN planting_sites.created_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.created_by IS 'Which user created the planting site.';


--
-- Name: COLUMN planting_sites.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.created_time IS 'When the planting site was originally created.';


--
-- Name: COLUMN planting_sites.modified_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.modified_by IS 'Which user most recently modified the planting site.';


--
-- Name: COLUMN planting_sites.modified_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.modified_time IS 'When the planting site was most recently modified.';


--
-- Name: COLUMN planting_sites.exclusion; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.exclusion IS 'Optional area to exclude from a site. No monitoring plots will be located in this area.';


--
-- Name: COLUMN planting_sites.grid_origin; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_sites.grid_origin IS 'Coordinates of the origin point of the grid of monitoring plots. Monitoring plot corners have X and Y coordinates that are multiples of 25 meters from the origin point.';


--
-- Name: planting_subzones; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_subzones (
    id bigint NOT NULL,
    planting_zone_id bigint NOT NULL,
    name text NOT NULL COLLATE public.natural_numeric,
    full_name text NOT NULL COLLATE public.natural_numeric,
    boundary public.geometry(MultiPolygon) NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    planting_site_id bigint NOT NULL,
    area_ha numeric NOT NULL,
    planting_completed_time timestamp with time zone,
    CONSTRAINT area_positive CHECK ((area_ha > (0)::numeric))
);


--
-- Name: TABLE planting_subzones; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_subzones IS 'Regions within planting zones that are a convenient size for a planting operation. Typically <10Ha.';


--
-- Name: COLUMN planting_subzones.planting_zone_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.planting_zone_id IS 'Which planting zone this subzone is part of.';


--
-- Name: COLUMN planting_subzones.name; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.name IS 'Short name of this planting subzone. This is often just a single letter and number. Must be unique within a planting zone.';


--
-- Name: COLUMN planting_subzones.boundary; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.boundary IS 'Boundary of the subzone. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN planting_subzones.created_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.created_by IS 'Which user created the subzone.';


--
-- Name: COLUMN planting_subzones.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.created_time IS 'When the subzone was originally created.';


--
-- Name: COLUMN planting_subzones.modified_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.modified_by IS 'Which user most recently modified the subzone.';


--
-- Name: COLUMN planting_subzones.modified_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.modified_time IS 'When the subzone was most recently modified.';


--
-- Name: COLUMN planting_subzones.planting_site_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_subzones.planting_site_id IS 'Which planting site this subzone is part of. This is the same as the planting site ID of this subzone''s planting zone, but is duplicated here so it can be used as the target of a foreign key constraint.';


--
-- Name: plantings; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.plantings (
    id bigint NOT NULL,
    delivery_id bigint NOT NULL,
    planting_type_id integer NOT NULL,
    planting_site_id bigint NOT NULL,
    planting_subzone_id bigint,
    species_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    num_plants integer NOT NULL,
    notes text,
    CONSTRAINT num_plants_sign_consistent_with_type CHECK ((((planting_type_id = ANY (ARRAY[2, 4])) AND (num_plants < 0)) OR ((planting_type_id <> ALL (ARRAY[2, 4])) AND (num_plants > 0)))),
    CONSTRAINT plantings_notes_check CHECK ((notes !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE plantings; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.plantings IS 'Details about plants that were planted or reassigned as part of a delivery. There is one plantings row per species in a delivery.';


--
-- Name: COLUMN plantings.delivery_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.delivery_id IS 'Which delivery this planting is part of.';


--
-- Name: COLUMN plantings.planting_type_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.planting_type_id IS 'Whether this is the plant assignment from the initial delivery or an adjustment from a reassignment.';


--
-- Name: COLUMN plantings.planting_site_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.planting_site_id IS 'Which planting site has the planting. Must be the same as the planting site ID of the delivery. This identifies the site as a whole; in addition, there may be a plot ID.';


--
-- Name: COLUMN plantings.planting_subzone_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.planting_subzone_id IS 'Which plot this planting affected, if any. Must be a plot at the planting site referenced by `planting_site_id`. Null if the planting site does not have plot information. For reassignments, this is the original plot if `num_plants` is negative, or the new plot if `num_plants` is positive.';


--
-- Name: COLUMN plantings.species_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.species_id IS 'Which species was planted.';


--
-- Name: COLUMN plantings.created_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.created_by IS 'Which user created the planting.';


--
-- Name: COLUMN plantings.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.created_time IS 'When the planting was created. Note that plantings are never updated, so there is no modified time.';


--
-- Name: COLUMN plantings.num_plants; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.num_plants IS 'Number of plants that were planted (if the number is positive) or reassigned (if the number is negative).';


--
-- Name: COLUMN plantings.notes; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.plantings.notes IS 'Notes about this specific planting. In the initial version of the web app, the user can only enter per-planting notes for reassignments, not for initial deliveries.';


--
-- Name: CONSTRAINT num_plants_sign_consistent_with_type ON plantings; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON CONSTRAINT num_plants_sign_consistent_with_type ON tracking.plantings IS 'If the planting represents the "from" side of a reassignment or an undo of a withdrawal, the number of plants must be negative. Otherwise it must be positive.';


--
-- Name: withdrawal_summaries; Type: VIEW; Schema: nursery; Owner: -
--

CREATE VIEW nursery.withdrawal_summaries AS
 SELECT withdrawals.id,
    withdrawals.facility_id,
    withdrawals.purpose_id,
    withdrawals.withdrawn_date,
    withdrawals.created_by,
    withdrawals.created_time,
    withdrawals.modified_by,
    withdrawals.modified_time,
    withdrawals.destination_facility_id,
    withdrawals.notes,
    withdrawals.undoes_withdrawal_id,
    undoes_withdrawals.withdrawn_date AS undoes_withdrawal_date,
    undone_by_withdrawals.id AS undone_by_withdrawal_id,
    undone_by_withdrawals.withdrawn_date AS undone_by_withdrawal_date,
    facilities.organization_id,
    deliveries.id AS delivery_id,
    totals.total_withdrawn,
    COALESCE(dest_nurseries.name, dest_sites.name) AS destination_name,
    COALESCE(reassignment_subzones.plot_names, delivery_subzones.plot_names) AS planting_subzone_names,
    (EXISTS ( SELECT 1
           FROM tracking.plantings p
          WHERE ((p.delivery_id = deliveries.id) AND (p.planting_type_id = 2)))) AS has_reassignments
   FROM (((((((((nursery.withdrawals withdrawals
     JOIN public.facilities ON ((withdrawals.facility_id = facilities.id)))
     LEFT JOIN tracking.deliveries deliveries ON (((withdrawals.id = deliveries.withdrawal_id) AND (withdrawals.purpose_id = 3))))
     LEFT JOIN nursery.withdrawals undone_by_withdrawals ON ((withdrawals.id = undone_by_withdrawals.undoes_withdrawal_id)))
     LEFT JOIN nursery.withdrawals undoes_withdrawals ON ((withdrawals.undoes_withdrawal_id = undoes_withdrawals.id)))
     LEFT JOIN LATERAL ( SELECT COALESCE(sum(((bw.germinating_quantity_withdrawn + bw.not_ready_quantity_withdrawn) + bw.ready_quantity_withdrawn)), (0)::bigint) AS total_withdrawn
           FROM nursery.batch_withdrawals bw
          WHERE (withdrawals.id = bw.withdrawal_id)) totals ON (true))
     LEFT JOIN LATERAL ( SELECT string_agg(DISTINCT p.full_name, ', '::text ORDER BY p.full_name) AS plot_names
           FROM (tracking.planting_subzones p
             JOIN tracking.plantings pl ON ((p.id = pl.planting_subzone_id)))
          WHERE ((pl.planting_type_id = 1) AND (pl.delivery_id = deliveries.id))) delivery_subzones ON (true))
     LEFT JOIN LATERAL ( SELECT (((delivery_subzones.plot_names || ' ('::text) || string_agg(p.full_name, ', '::text ORDER BY p.full_name)) || ')'::text) AS plot_names
           FROM (tracking.planting_subzones p
             JOIN tracking.plantings pl ON ((p.id = pl.planting_subzone_id)))
          WHERE ((pl.planting_type_id = 3) AND (pl.delivery_id = deliveries.id))) reassignment_subzones ON (true))
     LEFT JOIN LATERAL ( SELECT f.name
           FROM public.facilities f
          WHERE ((f.id = withdrawals.destination_facility_id) AND (withdrawals.purpose_id = 1))) dest_nurseries ON (true))
     LEFT JOIN LATERAL ( SELECT ps.name
           FROM tracking.planting_sites ps
          WHERE ((ps.id = deliveries.planting_site_id) AND (withdrawals.purpose_id = 3))) dest_sites ON (true));


--
-- Name: VIEW withdrawal_summaries; Type: COMMENT; Schema: nursery; Owner: -
--

COMMENT ON VIEW nursery.withdrawal_summaries IS 'Withdrawal information including aggregated and calculated values that need to be made available as filter and sort keys.';


--
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: nursery; Owner: -
--

ALTER TABLE nursery.withdrawals ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME nursery.withdrawals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: app_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_versions (
    app_name text NOT NULL,
    platform text NOT NULL,
    minimum_version text NOT NULL,
    recommended_version text NOT NULL
);


--
-- Name: TABLE app_versions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.app_versions IS 'Minimum and recommended versions for Terraware mobile apps.';


--
-- Name: automations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automations (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    settings jsonb,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
    type text NOT NULL,
    device_id bigint,
    timeseries_name text,
    verbosity integer DEFAULT 0 NOT NULL,
    lower_threshold double precision,
    upper_threshold double precision,
    CONSTRAINT automations_description_check CHECK ((description !~ similar_to_escape(' *'::text))),
    CONSTRAINT automations_timeseries_name_check CHECK ((timeseries_name !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE automations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.automations IS 'Configuration of automatic processes run by the device manager.';


--
-- Name: automations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.automations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.automations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conservation_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conservation_categories (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE conservation_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conservation_categories IS '(Enum) IUCN conservation category codes.';


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    code text NOT NULL,
    name text NOT NULL,
    region_id integer NOT NULL,
    CONSTRAINT countries_code_caps CHECK ((code = upper(code))),
    CONSTRAINT countries_code_length CHECK ((length(code) = 2))
);


--
-- Name: TABLE countries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.countries IS 'Country information per ISO-3166.';


--
-- Name: COLUMN countries.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.countries.code IS 'ISO-3166 alpha-2 country code.';


--
-- Name: COLUMN countries.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.countries.name IS 'Name of country in US English.';


--
-- Name: country_subdivisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.country_subdivisions (
    code text NOT NULL,
    country_code text NOT NULL,
    name text NOT NULL,
    CONSTRAINT country_subdivisions_code_length CHECK (((length(code) >= 4) AND (length(code) <= 6))),
    CONSTRAINT country_subdivisions_code_matches_country CHECK ((substr(code, 1, 2) = country_code))
);


--
-- Name: TABLE country_subdivisions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.country_subdivisions IS 'Country subdivision (state, province, region, etc.) information per ISO-3166-2.';


--
-- Name: COLUMN country_subdivisions.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.country_subdivisions.code IS 'Full ISO-3166-2 subdivision code including country code prefix.';


--
-- Name: COLUMN country_subdivisions.country_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.country_subdivisions.country_code IS 'ISO-3166 alpha-2 country code.';


--
-- Name: COLUMN country_subdivisions.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.country_subdivisions.name IS 'Name of subdivision in US English.';


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devices (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    name text NOT NULL,
    device_type text NOT NULL,
    make text NOT NULL,
    model text NOT NULL,
    protocol text,
    address text,
    port integer,
    enabled boolean DEFAULT true NOT NULL,
    settings jsonb,
    parent_id bigint,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
    verbosity integer,
    CONSTRAINT devices_address_check CHECK ((address !~ similar_to_escape(' *'::text))),
    CONSTRAINT devices_protocol_check CHECK ((protocol !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE devices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.devices IS 'Hardware devices managed by the device manager at a facility.';


--
-- Name: device_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.devices ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.device_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: device_managers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_managers (
    id bigint NOT NULL,
    balena_id bigint NOT NULL,
    balena_modified_time timestamp with time zone NOT NULL,
    device_name text NOT NULL,
    is_online boolean NOT NULL,
    last_connectivity_event timestamp with time zone,
    update_progress integer,
    sensor_kit_id text NOT NULL,
    user_id bigint,
    facility_id bigint,
    created_time timestamp with time zone NOT NULL,
    refreshed_time timestamp with time zone NOT NULL,
    balena_uuid text NOT NULL,
    CONSTRAINT device_managers_user_iff_facility CHECK ((((user_id IS NOT NULL) AND (facility_id IS NOT NULL)) OR ((user_id IS NULL) AND (facility_id IS NULL))))
);


--
-- Name: TABLE device_managers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.device_managers IS 'Information about device managers. This is a combination of information from the Balena API and locally-generated values.';


--
-- Name: COLUMN device_managers.balena_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.device_managers.balena_id IS 'Balena-assigned device identifier.';


--
-- Name: COLUMN device_managers.balena_modified_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.device_managers.balena_modified_time IS 'Last modification timestamp from Balena. This is distinct from `refreshed_time`, which is updated locally.';


--
-- Name: COLUMN device_managers.update_progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.device_managers.update_progress IS 'Percent complete of software download and installation (0-100). Null if no software update is in progress.';


--
-- Name: COLUMN device_managers.sensor_kit_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.device_managers.sensor_kit_id IS 'ID code that is physically printed on the sensor kit and set as a tag value in the Balena device configuration.';


--
-- Name: COLUMN device_managers.created_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.device_managers.created_time IS 'When this device manager was added to the local database. The Balena device may have been created earlier.';


--
-- Name: device_managers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.device_managers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.device_managers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: device_template_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_template_categories (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE device_template_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.device_template_categories IS '(Enum) User-facing categories of device templates; used to show templates for a particular class of devices where the physical device type may differ from one entry to the next.';


--
-- Name: device_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_templates (
    id bigint NOT NULL,
    category_id integer NOT NULL,
    device_type text NOT NULL,
    name text NOT NULL,
    description text,
    make text NOT NULL,
    model text NOT NULL,
    protocol text,
    address text,
    port integer,
    settings jsonb,
    verbosity integer,
    CONSTRAINT device_templates_address_check CHECK ((address !~ similar_to_escape(' *'::text))),
    CONSTRAINT device_templates_description_check CHECK ((description !~ similar_to_escape(' *'::text))),
    CONSTRAINT device_templates_protocol_check CHECK ((protocol !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE device_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.device_templates IS 'Canned device configurations for use in cases where we want to show a list of possible devices to the user and create the selected device with the correct settings so that the device manager can talk to it.';


--
-- Name: device_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.device_templates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.device_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ecosystem_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecosystem_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE ecosystem_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ecosystem_types IS '(Enum) Types of ecosystems in which plants can be found. Based on the World Wildlife Federation''s "Terrestrial Ecoregions of the World" report.';


--
-- Name: facility_connection_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facility_connection_states (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE facility_connection_states; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facility_connection_states IS '(Enum) Progress of the configuration of a device manager for a facility.';


--
-- Name: facility_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facility_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE facility_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facility_types IS '(Enum) Types of facilities that can be represented in the data model.';


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id bigint NOT NULL,
    file_name text NOT NULL,
    content_type text NOT NULL,
    size bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    created_by bigint,
    storage_url text NOT NULL,
    modified_by bigint NOT NULL,
    CONSTRAINT content_type_cannot_be_empty_string CHECK ((length(content_type) > 0)),
    CONSTRAINT file_name_cannot_be_empty_string CHECK ((length(file_name) > 0))
);


--
-- Name: TABLE files; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.files IS 'Generic information about individual files. Files are associated with application entities using linking tables such as `accession_photos`.';


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: TABLE flyway_schema_history; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.flyway_schema_history IS 'Tracks which database migrations have already been applied. Used by the Flyway library, not by application.';


--
-- Name: gbif_distributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gbif_distributions (
    taxon_id bigint NOT NULL,
    country_code text,
    establishment_means text,
    occurrence_status text,
    threat_status text,
    CONSTRAINT gbif_distributions_country_code_check CHECK ((country_code !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_distributions_establishment_means_check CHECK ((establishment_means !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_distributions_occurrence_status_check CHECK ((occurrence_status !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_distributions_threat_status_check CHECK ((threat_status !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE gbif_distributions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gbif_distributions IS 'Information about geographic distribution of species and their conservation statuses.';


--
-- Name: gbif_name_words; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gbif_name_words (
    gbif_name_id bigint NOT NULL,
    word text NOT NULL COLLATE pg_catalog."C"
);


--
-- Name: TABLE gbif_name_words; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gbif_name_words IS 'Inverted index of lower-cased words from species and family names in the GBIF backbone dataset. Used to support fast per-word prefix searches.';


--
-- Name: gbif_names; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gbif_names (
    id bigint NOT NULL,
    taxon_id bigint NOT NULL,
    name text NOT NULL,
    language text,
    is_scientific boolean NOT NULL,
    CONSTRAINT gbif_names_language_check CHECK ((language !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE gbif_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gbif_names IS 'Scientific and vernacular names from the GBIF backbone dataset. Names are not required to be unique.';


--
-- Name: gbif_names_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.gbif_names ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.gbif_names_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gbif_taxa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gbif_taxa (
    taxon_id bigint NOT NULL,
    dataset_id text,
    parent_name_usage_id bigint,
    accepted_name_usage_id bigint,
    original_name_usage_id bigint,
    scientific_name text NOT NULL,
    canonical_name text,
    generic_name text,
    specific_epithet text,
    infraspecific_epithet text,
    taxon_rank text NOT NULL,
    taxonomic_status text NOT NULL,
    nomenclatural_status text,
    phylum text,
    class text,
    "order" text,
    family text,
    genus text,
    CONSTRAINT gbif_taxa_canonical_name_check CHECK ((canonical_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_class_check CHECK ((class !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_dataset_id_check CHECK ((dataset_id !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_family_check CHECK ((family !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_generic_name_check CHECK ((generic_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_genus_check CHECK ((genus !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_infraspecific_epithet_check CHECK ((infraspecific_epithet !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_nomenclatural_status_check CHECK ((nomenclatural_status !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_order_check CHECK (("order" !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_phylum_check CHECK ((phylum !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_taxa_specific_epithet_check CHECK ((specific_epithet !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE gbif_taxa; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gbif_taxa IS 'Taxonomic data about species and families. A subset of the GBIF backbone dataset.';


--
-- Name: gbif_vernacular_names; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gbif_vernacular_names (
    taxon_id bigint NOT NULL,
    vernacular_name text NOT NULL,
    language text,
    country_code text,
    CONSTRAINT gbif_vernacular_names_country_code_check CHECK ((country_code !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_vernacular_names_language_check CHECK ((language !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE gbif_vernacular_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gbif_vernacular_names IS 'Vernacular names for species and families. Part of the GBIF backbone dataset.';


--
-- Name: seed_treatments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seed_treatments (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE seed_treatments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.seed_treatments IS '(Enum) Techniques that can be used to treat seeds before testing them for viability.';


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.seed_treatments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.germination_treatment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: global_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_roles (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE global_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.global_roles IS '(Enum) System-wide roles that can be assigned to users. Global roles are not tied to organizations. These are generally for system or business administration; most users have no global roles.';


--
-- Name: growth_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.growth_forms (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE growth_forms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.growth_forms IS '(Enum) What physical form a particular species takes. For example, "Tree" or "Shrub."';


--
-- Name: identifier_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identifier_sequences (
    organization_id bigint NOT NULL,
    prefix text NOT NULL,
    next_value bigint NOT NULL
);


--
-- Name: TABLE identifier_sequences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.identifier_sequences IS 'Current state for generating user-facing identifiers (accession number, etc.) for each organization.';


--
-- Name: internal_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internal_tags (
    id bigint NOT NULL,
    name text NOT NULL,
    description text,
    is_system boolean NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE internal_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.internal_tags IS 'Internal (non-user-facing) tags. Low-numbered tags are defined by the system; the rest may be edited by super admins.';


--
-- Name: internal_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.internal_tags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.internal_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jobrunr_backgroundjobservers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobrunr_backgroundjobservers (
    id character(36) NOT NULL,
    workerpoolsize integer NOT NULL,
    pollintervalinseconds integer NOT NULL,
    firstheartbeat timestamp(6) without time zone NOT NULL,
    lastheartbeat timestamp(6) without time zone NOT NULL,
    running integer NOT NULL,
    systemtotalmemory bigint NOT NULL,
    systemfreememory bigint NOT NULL,
    systemcpuload numeric(3,2) NOT NULL,
    processmaxmemory bigint NOT NULL,
    processfreememory bigint NOT NULL,
    processallocatedmemory bigint NOT NULL,
    processcpuload numeric(3,2) NOT NULL,
    deletesucceededjobsafter character varying(32),
    permanentlydeletejobsafter character varying(32),
    name character varying(128)
);


--
-- Name: jobrunr_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobrunr_jobs (
    id character(36) NOT NULL,
    version integer NOT NULL,
    jobasjson text NOT NULL,
    jobsignature character varying(512) NOT NULL,
    state character varying(36) NOT NULL,
    createdat timestamp without time zone NOT NULL,
    updatedat timestamp without time zone NOT NULL,
    scheduledat timestamp without time zone,
    recurringjobid character varying(128)
);


--
-- Name: jobrunr_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobrunr_metadata (
    id character varying(156) NOT NULL,
    name character varying(92) NOT NULL,
    owner character varying(64) NOT NULL,
    value text NOT NULL,
    createdat timestamp without time zone NOT NULL,
    updatedat timestamp without time zone NOT NULL
);


--
-- Name: jobrunr_recurring_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobrunr_recurring_jobs (
    id character(128) NOT NULL,
    version integer NOT NULL,
    jobasjson text NOT NULL,
    createdat bigint DEFAULT '0'::bigint NOT NULL
);


--
-- Name: jobrunr_jobs_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.jobrunr_jobs_stats AS
 WITH job_stat_results AS (
         SELECT jobrunr_jobs.state,
            count(*) AS count
           FROM public.jobrunr_jobs
          GROUP BY ROLLUP(jobrunr_jobs.state)
        )
 SELECT COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE (job_stat_results.state IS NULL)), (0)::bigint) AS total,
    COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE ((job_stat_results.state)::text = 'SCHEDULED'::text)), (0)::bigint) AS scheduled,
    COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE ((job_stat_results.state)::text = 'ENQUEUED'::text)), (0)::bigint) AS enqueued,
    COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE ((job_stat_results.state)::text = 'PROCESSING'::text)), (0)::bigint) AS processing,
    COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE ((job_stat_results.state)::text = 'FAILED'::text)), (0)::bigint) AS failed,
    COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE ((job_stat_results.state)::text = 'SUCCEEDED'::text)), (0)::bigint) AS succeeded,
    COALESCE(( SELECT ((jm.value)::character(10))::numeric(10,0) AS value
           FROM public.jobrunr_metadata jm
          WHERE ((jm.id)::text = 'succeeded-jobs-counter-cluster'::text)), (0)::numeric) AS alltimesucceeded,
    COALESCE(( SELECT job_stat_results.count
           FROM job_stat_results
          WHERE ((job_stat_results.state)::text = 'DELETED'::text)), (0)::bigint) AS deleted,
    ( SELECT count(*) AS count
           FROM public.jobrunr_backgroundjobservers) AS nbrofbackgroundjobservers,
    ( SELECT count(*) AS count
           FROM public.jobrunr_recurring_jobs) AS nbrofrecurringjobs;


--
-- Name: jobrunr_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobrunr_migrations (
    id character(36) NOT NULL,
    script character varying(64) NOT NULL,
    installedon character varying(29) NOT NULL
);


--
-- Name: land_use_model_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.land_use_model_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE land_use_model_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.land_use_model_types IS '(Enum) Types of ways a project''s land can be used.';


--
-- Name: timeseries_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeseries_values (
    timeseries_id bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    value text NOT NULL
);


--
-- Name: TABLE timeseries_values; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.timeseries_values IS 'Individual data points on a timeseries. For example, each time the temperature is read from a thermometer, the reading is inserted here.';


--
-- Name: latest_timeseries_values; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.latest_timeseries_values AS
 SELECT ordered.timeseries_id,
    ordered.created_time,
    ordered.value
   FROM ( SELECT timeseries_values.timeseries_id,
            timeseries_values.created_time,
            timeseries_values.value,
            row_number() OVER (PARTITION BY timeseries_values.timeseries_id ORDER BY timeseries_values.created_time DESC) AS row_num
           FROM public.timeseries_values) ordered
  WHERE (ordered.row_num = 1);


--
-- Name: managed_location_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.managed_location_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE managed_location_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.managed_location_types IS '(Enum) Type of managed location for business analytics purposes.';


--
-- Name: notification_criticalities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_criticalities (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE notification_criticalities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_criticalities IS '(Enum) Criticality information of notifications in the application.';


--
-- Name: notification_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_types (
    id integer NOT NULL,
    name text NOT NULL,
    notification_criticality_id integer NOT NULL
);


--
-- Name: TABLE notification_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_types IS '(Enum) Types of notifications in the application.';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    notification_type_id integer NOT NULL,
    user_id bigint NOT NULL,
    organization_id bigint,
    title text NOT NULL,
    body text NOT NULL,
    local_url text NOT NULL,
    created_time timestamp with time zone NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'Notifications for application users.';


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: organization_internal_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_internal_tags (
    organization_id bigint NOT NULL,
    internal_tag_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE organization_internal_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_internal_tags IS 'Which internal (non-user-facing) tags apply to which organizations.';


--
-- Name: organization_managed_location_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_managed_location_types (
    organization_id bigint NOT NULL,
    managed_location_type_id integer NOT NULL
);


--
-- Name: TABLE organization_managed_location_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_managed_location_types IS 'Per-organization information about managed location types for business analytics purposes.';


--
-- Name: organization_report_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_report_settings (
    organization_id bigint NOT NULL,
    is_enabled boolean NOT NULL
);


--
-- Name: TABLE organization_report_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_report_settings IS 'Organization-level settings for quarterly reports. Project-level settings are in `project_report_settings`.';


--
-- Name: organization_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE organization_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_types IS '(Enum) Type of forestry organization for business analytics purposes.';


--
-- Name: organization_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_users (
    user_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    role_id integer NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL
);


--
-- Name: TABLE organization_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organization_users IS 'Organization membership and role information.';


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id bigint NOT NULL,
    name text NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    disabled_time timestamp with time zone,
    country_code text,
    country_subdivision_code text,
    description text,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
    time_zone text,
    organization_type_id integer,
    organization_type_details character varying(100),
    website text,
    CONSTRAINT country_code_matches_subdivision CHECK (((country_subdivision_code IS NULL) OR (substr(country_subdivision_code, 1, 2) = country_code))),
    CONSTRAINT organizations_country_code_check CHECK ((country_code !~ similar_to_escape(' *'::text))),
    CONSTRAINT organizations_country_subdivision_code_check CHECK ((country_subdivision_code !~ similar_to_escape(' *'::text))),
    CONSTRAINT organizations_description_check CHECK ((description !~ similar_to_escape(' *'::text))),
    CONSTRAINT other_type_details_null_or_not_empty CHECK (((organization_type_details IS NULL) OR ((organization_type_details)::text <> ''::text))),
    CONSTRAINT other_type_details_only_for_other CHECK ((((organization_type_details IS NULL) AND (organization_type_id <> 6)) OR ((organization_type_details IS NOT NULL) AND (organization_type_id = 6))))
);


--
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organizations IS 'Top-level information about organizations.';


--
-- Name: COLUMN organizations.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.organizations.id IS 'Unique numeric identifier of the organization.';


--
-- Name: COLUMN organizations.organization_type_details; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.organizations.organization_type_details IS 'User provided information on the organization when type is Other, limited to 100 characters.';


--
-- Name: COLUMN organizations.website; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.organizations.website IS 'Website information for the organization with no formatting restrictions.';


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.organizations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.files ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.photos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plant_material_sourcing_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plant_material_sourcing_methods (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE plant_material_sourcing_methods; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.plant_material_sourcing_methods IS '(Enum) Sourcing methods for acquiring plant material.';


--
-- Name: project_land_use_model_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_land_use_model_types (
    project_id bigint NOT NULL,
    land_use_model_type_id integer NOT NULL
);


--
-- Name: TABLE project_land_use_model_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_land_use_model_types IS 'Which projects have which types of land use models.';


--
-- Name: project_report_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_report_settings (
    project_id bigint NOT NULL,
    is_enabled boolean NOT NULL
);


--
-- Name: TABLE project_report_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_report_settings IS 'Which projects require reports to be submitted each quarter. Organization-level settings are in `organization_report_settings`.';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.projects ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE regions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.regions IS '(Enum) Parts of the world where countries are located.';


--
-- Name: report_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_files (
    file_id bigint NOT NULL,
    report_id bigint NOT NULL
);


--
-- Name: TABLE report_files; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.report_files IS 'Linking table between `reports` and `files` for non-photo files.';


--
-- Name: report_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_photos (
    report_id bigint NOT NULL,
    file_id bigint NOT NULL,
    caption text
);


--
-- Name: TABLE report_photos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.report_photos IS 'Linking table between `reports` and `files` for photos.';


--
-- Name: report_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE report_statuses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.report_statuses IS '(Enum) Describes where in the workflow each partner report is.';


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    year integer NOT NULL,
    quarter integer NOT NULL,
    locked_by bigint,
    locked_time timestamp with time zone,
    modified_by bigint,
    modified_time timestamp with time zone,
    submitted_by bigint,
    submitted_time timestamp with time zone,
    status_id integer NOT NULL,
    body jsonb NOT NULL,
    project_id bigint,
    project_name text,
    CONSTRAINT cannot_submit_while_locked CHECK (((locked_time IS NULL) OR (submitted_time IS NULL))),
    CONSTRAINT locked_by_and_time_both_set CHECK ((((locked_by IS NULL) AND (locked_time IS NULL)) OR ((locked_by IS NOT NULL) AND (locked_time IS NOT NULL)))),
    CONSTRAINT quarter_in_range CHECK (((quarter >= 1) AND (quarter <= 4))),
    CONSTRAINT status_reflects_locked CHECK ((((locked_by IS NULL) AND (status_id <> 3)) OR ((locked_by IS NOT NULL) AND (status_id = 3)))),
    CONSTRAINT status_reflects_submitted CHECK ((((submitted_by IS NULL) AND (status_id <> 4)) OR ((submitted_by IS NOT NULL) AND (status_id = 4)))),
    CONSTRAINT submitted_by_and_time_both_set CHECK ((((submitted_by IS NULL) AND (submitted_time IS NULL)) OR ((submitted_by IS NOT NULL) AND (submitted_time IS NOT NULL))))
);


--
-- Name: TABLE reports; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reports IS 'Partner-submitted reports about their organizations and projects.';


--
-- Name: COLUMN reports.project_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reports.project_id IS 'If this report is for a specific project and the project still exists, the project ID. If the project has been deleted, this will be null but `project_name` will still be populated.';


--
-- Name: COLUMN reports.project_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reports.project_name IS 'If this report is for a specific project, the name of the project as of the time the report was submitted.';


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reports ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.roles IS '(Enum) Roles a user is allowed to have in an organization.';


--
-- Name: seed_storage_behaviors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seed_storage_behaviors (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE seed_storage_behaviors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.seed_storage_behaviors IS '(Enum) How seeds of a particular species behave in storage.';


--
-- Name: site_module_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.facilities ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.site_module_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: species; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    scientific_name text NOT NULL,
    common_name text,
    family_name text,
    rare boolean,
    seed_storage_behavior_id integer,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    deleted_by bigint,
    deleted_time timestamp with time zone,
    checked_time timestamp with time zone,
    initial_scientific_name text NOT NULL,
    conservation_category_id text,
    ecological_role_known text,
    dbh_source text,
    height_at_maturity_source text,
    local_uses_known text,
    native_ecosystem text,
    other_facts text,
    average_wood_density numeric,
    height_at_maturity_value numeric,
    dbh_value numeric,
    wood_density_level_id integer,
    CONSTRAINT species_common_name_check CHECK ((common_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT species_family_name_check CHECK ((family_name !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE species; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species IS 'Per-organization information about species.';


--
-- Name: COLUMN species.checked_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.species.checked_time IS 'If non-null, when the species was checked for possible suggested edits. If null, the species has not been checked yet.';


--
-- Name: species_ecosystem_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_ecosystem_types (
    species_id bigint NOT NULL,
    ecosystem_type_id integer NOT NULL
);


--
-- Name: TABLE species_ecosystem_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_ecosystem_types IS 'Ecosystems where each species can be found.';


--
-- Name: species_growth_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_growth_forms (
    species_id bigint NOT NULL,
    growth_form_id integer NOT NULL
);


--
-- Name: TABLE species_growth_forms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_growth_forms IS 'Growth forms of each species';


--
-- Name: species_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.species ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.species_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: species_native_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_native_categories (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE species_native_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_native_categories IS '(Enum) Categories related to native-ness of a species.';


--
-- Name: species_plant_material_sourcing_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_plant_material_sourcing_methods (
    species_id bigint NOT NULL,
    plant_material_sourcing_method_id integer NOT NULL
);


--
-- Name: TABLE species_plant_material_sourcing_methods; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_plant_material_sourcing_methods IS 'Sourcing methods for the plant material used to grow a particular species.';


--
-- Name: species_problem_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_problem_fields (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE species_problem_fields; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_problem_fields IS '(Enum) Species fields that can be scanned for problems.';


--
-- Name: species_problem_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_problem_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE species_problem_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_problem_types IS '(Enum) Specific types of problems that can be detected in species data.';


--
-- Name: species_problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_problems (
    id bigint NOT NULL,
    species_id bigint NOT NULL,
    field_id integer NOT NULL,
    type_id integer NOT NULL,
    created_time timestamp with time zone NOT NULL,
    suggested_value text,
    CONSTRAINT species_problems_suggested_value_check CHECK ((suggested_value !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE species_problems; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_problems IS 'Problems found in species data. Rows are deleted from this table when the problem is marked as ignored by the user or the user accepts the suggested fix.';


--
-- Name: species_problems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.species_problems ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.species_problems_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: species_successional_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_successional_groups (
    species_id bigint NOT NULL,
    successional_group_id integer NOT NULL
);


--
-- Name: TABLE species_successional_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_successional_groups IS 'The successional groupings that the species is planted in.';


--
-- Name: spring_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spring_session (
    primary_id character(36) NOT NULL,
    session_id character(36) NOT NULL,
    creation_time bigint NOT NULL,
    last_access_time bigint NOT NULL,
    max_inactive_interval integer NOT NULL,
    expiry_time bigint NOT NULL,
    principal_name character varying(100)
);


--
-- Name: TABLE spring_session; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.spring_session IS 'Active login sessions. Used by Spring Session, not the application.';


--
-- Name: spring_session_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spring_session_attributes (
    session_primary_id character(36) NOT NULL,
    attribute_name character varying(200) NOT NULL,
    attribute_bytes bytea NOT NULL
);


--
-- Name: TABLE spring_session_attributes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.spring_session_attributes IS 'Data associated with a login session. Used by Spring Session, not the application.';


--
-- Name: sub_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_locations (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    name text NOT NULL,
    created_time timestamp with time zone DEFAULT now() NOT NULL,
    modified_time timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL
);


--
-- Name: TABLE sub_locations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sub_locations IS 'The available locations where seeds can be stored at a seed bank facility or seedlings can be stored at a nursery facility.';


--
-- Name: COLUMN sub_locations.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sub_locations.name IS 'E.g., Freezer 1, Freezer 2';


--
-- Name: storage_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sub_locations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.storage_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: successional_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.successional_groups (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE successional_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.successional_groups IS '(Enum) Successional Groups that a plant may be planted in.';


--
-- Name: test_clock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_clock (
    fake_time timestamp with time zone NOT NULL,
    real_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE test_clock; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.test_clock IS 'User-adjustable clock for test environments. Not used in production.';


--
-- Name: COLUMN test_clock.fake_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_clock.fake_time IS 'What time the server should believe it was at the time the row was written.';


--
-- Name: COLUMN test_clock.real_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.test_clock.real_time IS 'What time it was in the real world when the row was written.';


--
-- Name: thumbnails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thumbnails (
    id bigint NOT NULL,
    file_id bigint NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    content_type text NOT NULL,
    created_time timestamp with time zone NOT NULL,
    size integer NOT NULL,
    storage_url text NOT NULL
);


--
-- Name: TABLE thumbnails; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.thumbnails IS 'Information about scaled-down versions of photos.';


--
-- Name: thumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.thumbnails ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.thumbnail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: time_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_zones (
    time_zone text NOT NULL
);


--
-- Name: TABLE time_zones; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.time_zones IS '(Enum) Valid time zone names. This is populated with the list of names from the IANA time zone database.';


--
-- Name: timeseries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeseries (
    id bigint NOT NULL,
    type_id integer NOT NULL,
    device_id bigint,
    name text NOT NULL,
    units text,
    decimal_places integer,
    created_time timestamp with time zone DEFAULT now() NOT NULL,
    modified_time timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
    CONSTRAINT timeseries_decimal_places_check CHECK ((decimal_places >= 0)),
    CONSTRAINT timeseries_units_check CHECK ((units !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE timeseries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.timeseries IS 'Properties of a series of values collected from a device. Each device metric is represented as a timeseries.';


--
-- Name: COLUMN timeseries.units; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.timeseries.units IS 'For numeric timeseries, the units represented by the values; unit names should be short (possibly abbreviations) and in the default language of the site.';


--
-- Name: COLUMN timeseries.decimal_places; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.timeseries.decimal_places IS 'For numeric timeseries, the number of digits after the decimal point to display.';


--
-- Name: timeseries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.timeseries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.timeseries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: timeseries_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeseries_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE timeseries_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.timeseries_types IS '(Enum) Data formats of the values of a timeseries.';


--
-- Name: upload_problem_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upload_problem_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE upload_problem_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.upload_problem_types IS '(Enum) Specific types of problems encountered while processing a user-uploaded file.';


--
-- Name: upload_problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upload_problems (
    id bigint NOT NULL,
    upload_id bigint NOT NULL,
    type_id integer NOT NULL,
    is_error boolean NOT NULL,
    "position" integer,
    field text,
    message text,
    value text,
    CONSTRAINT upload_problems_field_check CHECK ((field !~ similar_to_escape(' *'::text))),
    CONSTRAINT upload_problems_message_check CHECK ((message !~ similar_to_escape(' *'::text))),
    CONSTRAINT upload_problems_value_check CHECK ((value !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE upload_problems; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.upload_problems IS 'Details about problems (validation failures, etc.) in user-uploaded files.';


--
-- Name: COLUMN upload_problems."position"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.upload_problems."position" IS 'Where in the uploaded file the problem appears, or null if it is a problem with the file as a whole. This may be a byte offset, a line number, or a record number depending on the type of file.';


--
-- Name: COLUMN upload_problems.field; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.upload_problems.field IS 'If the problem pertains to a specific field, its name. Null if the problem affects an entire record or the entire file.';


--
-- Name: upload_problems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.upload_problems ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.upload_problems_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: upload_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upload_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    finished boolean NOT NULL
);


--
-- Name: TABLE upload_statuses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.upload_statuses IS '(Enum) Available statuses of user-uploaded files. Uploads progress through these statuses as the system processes the files.';


--
-- Name: COLUMN upload_statuses.finished; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.upload_statuses.finished IS 'If true, this status means that the system is finished processing the file.';


--
-- Name: upload_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upload_types (
    id integer NOT NULL,
    name text NOT NULL,
    expire_files boolean NOT NULL
);


--
-- Name: TABLE upload_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.upload_types IS '(Enum) Types of user-uploaded files whose progress can be tracked in the uploads table.';


--
-- Name: COLUMN upload_types.expire_files; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.upload_types.expire_files IS 'Old rows are automatically deleted from the uploads table. If this value is true, files will also be removed from the file store for old uploads of this type.';


--
-- Name: uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploads (
    id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    filename text NOT NULL,
    storage_url text NOT NULL,
    content_type text NOT NULL,
    type_id integer NOT NULL,
    status_id integer NOT NULL,
    organization_id bigint,
    facility_id bigint,
    locale text NOT NULL
);


--
-- Name: TABLE uploads; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.uploads IS 'Information about the status of files uploaded by users. This is used to track the progress of file processing such as importing datafiles; contents of this table may expire and be deleted after a certain amount of time.';


--
-- Name: uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.uploads ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.uploads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_global_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_global_roles (
    user_id bigint NOT NULL,
    global_role_id integer NOT NULL
);


--
-- Name: TABLE user_global_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_global_roles IS 'Which users have which global roles.';


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    user_id bigint NOT NULL,
    organization_id bigint,
    preferences jsonb NOT NULL
);


--
-- Name: TABLE user_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_preferences IS 'Client-defined preferences that should persist across browser sessions.';


--
-- Name: COLUMN user_preferences.organization_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_preferences.organization_id IS 'If null, preferences are global to the user. Otherwise, they are specific to the user and the organization.';


--
-- Name: user_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE user_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_types IS '(Enum) Types of users. Most users are of type 1, "Individual."';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    auth_id text,
    email text NOT NULL,
    first_name text,
    last_name text,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    user_type_id integer NOT NULL,
    last_activity_time timestamp with time zone,
    email_notifications_enabled boolean DEFAULT false NOT NULL,
    deleted_time timestamp with time zone,
    time_zone text,
    locale text,
    country_code text,
    cookies_consented boolean,
    cookies_consented_time timestamp with time zone,
    CONSTRAINT users_auth_id_check CHECK ((auth_id !~ similar_to_escape(' *'::text))),
    CONSTRAINT users_first_name_check CHECK ((first_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT users_last_name_check CHECK ((last_name !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'User identities. A user can be associated with organizations via `organization_users`.';


--
-- Name: COLUMN users.auth_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.auth_id IS 'Unique identifier of the user in the authentication system. Currently, this is a Keycloak user ID.';


--
-- Name: COLUMN users.last_activity_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.last_activity_time IS 'When the user most recently interacted with the system.';


--
-- Name: COLUMN users.email_notifications_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.email_notifications_enabled IS 'If true, the user wants to receive notifications via email.';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wood_density_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wood_density_levels (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE wood_density_levels; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.wood_density_levels IS 'The taxonomic level in the at which a wood density measurement is known';


--
-- Name: accession_collectors; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_collectors (
    accession_id bigint NOT NULL,
    "position" integer NOT NULL,
    name text NOT NULL,
    CONSTRAINT accession_collectors_name_check CHECK ((name !~ similar_to_escape('\s*'::text))),
    CONSTRAINT accession_collectors_position_check CHECK (("position" >= 0))
);


--
-- Name: TABLE accession_collectors; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_collectors IS 'Names of people who collected each accession.';


--
-- Name: accessions; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accessions (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    number text,
    collected_date date,
    received_date date,
    state_id integer NOT NULL,
    founder_id text,
    trees_collected_from integer,
    subset_weight numeric,
    subset_count integer,
    est_seed_count integer,
    drying_end_date date,
    processing_notes text,
    sub_location_id bigint,
    created_time timestamp with time zone NOT NULL,
    collection_site_name text,
    collection_site_landowner text,
    total_viability_percent integer,
    remaining_grams numeric,
    remaining_quantity numeric,
    remaining_units_id integer,
    subset_weight_grams numeric,
    subset_weight_quantity numeric,
    subset_weight_units_id integer,
    modified_time timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
    species_id bigint,
    collection_site_city text,
    collection_site_country_code text,
    collection_site_country_subdivision text,
    collection_site_notes text,
    collection_source_id integer,
    data_source_id integer NOT NULL,
    latest_observed_quantity numeric,
    latest_observed_units_id integer,
    latest_observed_time timestamp with time zone,
    est_weight_grams numeric,
    est_weight_quantity numeric,
    est_weight_units_id integer,
    total_withdrawn_count integer,
    total_withdrawn_weight_grams numeric,
    total_withdrawn_weight_quantity numeric,
    total_withdrawn_weight_units_id integer,
    project_id bigint,
    CONSTRAINT accessions_collection_site_city_check CHECK ((collection_site_city !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_collection_site_country_code_check CHECK ((collection_site_country_code !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_collection_site_country_subdivision_check CHECK ((collection_site_country_subdivision !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_collection_site_landowner_check CHECK ((collection_site_landowner !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_collection_site_name_check CHECK ((collection_site_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_collection_site_notes_check CHECK ((collection_site_notes !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_founder_id_check CHECK ((founder_id !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_number_check CHECK ((number !~ similar_to_escape(' *'::text))),
    CONSTRAINT accessions_processing_notes_check CHECK ((processing_notes !~ similar_to_escape(' *'::text))),
    CONSTRAINT observed_quantity_must_have_time CHECK ((((latest_observed_quantity IS NOT NULL) AND (latest_observed_time IS NOT NULL)) OR ((latest_observed_quantity IS NULL) AND (latest_observed_time IS NULL)))),
    CONSTRAINT observed_quantity_must_have_units CHECK ((((latest_observed_quantity IS NOT NULL) AND (latest_observed_units_id IS NOT NULL)) OR ((latest_observed_quantity IS NULL) AND (latest_observed_units_id IS NULL)))),
    CONSTRAINT remaining_quantity_must_have_units CHECK ((((remaining_quantity IS NOT NULL) AND (remaining_units_id IS NOT NULL)) OR ((remaining_quantity IS NULL) AND (remaining_units_id IS NULL)))),
    CONSTRAINT subset_weight_quantity_must_have_units CHECK ((((subset_weight_quantity IS NOT NULL) AND (subset_weight_units_id IS NOT NULL)) OR ((subset_weight_quantity IS NULL) AND (subset_weight_units_id IS NULL)))),
    CONSTRAINT subset_weight_units_must_not_be_seeds CHECK (((subset_weight_units_id <> 1) OR (subset_weight_units_id IS NULL)))
);


--
-- Name: TABLE accessions; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accessions IS 'Information about batches of seeds. An accession is a batch of seeds of the same species collected in the same time and place by the same people.';


--
-- Name: COLUMN accessions.number; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.number IS 'Displayed as the accession number to the user.';


--
-- Name: COLUMN accessions.total_viability_percent; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.total_viability_percent IS 'Percentage of viable seeds across all tests.';


--
-- Name: COLUMN accessions.latest_observed_quantity; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.latest_observed_quantity IS 'Most recent remaining quantity as observed by the user.';


--
-- Name: COLUMN accessions.latest_observed_units_id; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.latest_observed_units_id IS 'Measurement units of `observed_quantity`.';


--
-- Name: COLUMN accessions.latest_observed_time; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.latest_observed_time IS 'Time of most recent change to observed quantity.';


--
-- Name: COLUMN accessions.total_withdrawn_count; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.total_withdrawn_count IS 'Total number of seeds withdrawn. May be an estimate if withdrawals were measured by weight.';


--
-- Name: COLUMN accessions.total_withdrawn_weight_quantity; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.total_withdrawn_weight_quantity IS 'Total weight of seeds withdrawn. May be an estimate if withdrawals were measured by seed count.';


--
-- Name: COLUMN accessions.total_withdrawn_weight_units_id; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.total_withdrawn_weight_units_id IS 'Measurement units of `total_withdrawn_weight_quantity`.';


--
-- Name: accession_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.accessions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.accession_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: accession_photos; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_photos (
    accession_id bigint NOT NULL,
    file_id bigint NOT NULL
);


--
-- Name: TABLE accession_photos; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_photos IS 'Linking table between `accessions` and `files`.';


--
-- Name: accession_quantity_history; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_quantity_history (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    history_type_id integer NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    remaining_quantity numeric NOT NULL,
    remaining_units_id integer NOT NULL,
    notes text
);


--
-- Name: TABLE accession_quantity_history; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_quantity_history IS 'Historical record of changes to remaining quantities of accessions.';


--
-- Name: accession_quantity_history_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.accession_quantity_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.accession_quantity_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: accession_quantity_history_types; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_quantity_history_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE accession_quantity_history_types; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_quantity_history_types IS '(Enum) Types of operations that can result in changes to remaining quantities of accessions.';


--
-- Name: accession_state_history; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_state_history (
    accession_id bigint NOT NULL,
    updated_time timestamp with time zone NOT NULL,
    old_state_id integer,
    new_state_id integer NOT NULL,
    reason text NOT NULL,
    updated_by bigint NOT NULL
);


--
-- Name: TABLE accession_state_history; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_state_history IS 'Historical record of when accessions moved to different states. A row is inserted here for every state transition.';


--
-- Name: COLUMN accession_state_history.old_state_id; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accession_state_history.old_state_id IS 'Null if this is the initial state for a new accession.';


--
-- Name: accession_states; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_states (
    id integer NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: TABLE accession_states; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_states IS '(Enum) Available states an accession can be in. Each state represents a step in the seed management workflow.';


--
-- Name: bags; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.bags (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    bag_number text,
    CONSTRAINT bags_bag_number_check CHECK ((bag_number !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE bags; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.bags IS 'Individual bags of seeds that are part of an accession. An accession can consist of multiple bags.';


--
-- Name: bag_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.bags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.bag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: geolocations; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.geolocations (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    created_time timestamp with time zone,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    gps_accuracy double precision
);


--
-- Name: TABLE geolocations; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.geolocations IS 'Locations where seeds were collected.';


--
-- Name: collection_event_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.geolocations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.collection_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: collection_sources; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.collection_sources (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE collection_sources; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.collection_sources IS '(Enum) Types of source plants that seeds can be collected from.';


--
-- Name: data_sources; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.data_sources (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE data_sources; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.data_sources IS '(Enum) Original sources of data, e.g., manual entry via web app.';


--
-- Name: viability_test_results; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.viability_test_results (
    id bigint NOT NULL,
    test_id bigint NOT NULL,
    recording_date date NOT NULL,
    seeds_germinated integer NOT NULL
);


--
-- Name: TABLE viability_test_results; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.viability_test_results IS 'Result from a viability test of a batch of seeds. Viability tests can have multiple germinations, e.g., if different seeds germinate on different days.';


--
-- Name: germination_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.viability_test_results ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.germination_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: viability_test_seed_types; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.viability_test_seed_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE viability_test_seed_types; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.viability_test_seed_types IS '(Enum) Types of seeds that can be tested for viability. This refers to how the seeds were stored, not the physical characteristics of the seeds themselves.';


--
-- Name: germination_seed_type_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.viability_test_seed_types ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.germination_seed_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: viability_test_substrates; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.viability_test_substrates (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE viability_test_substrates; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.viability_test_substrates IS '(Enum) Types of substrate that can be used to test seeds for viability.';


--
-- Name: germination_substrate_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.viability_test_substrates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.germination_substrate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: viability_tests; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.viability_tests (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    test_type integer NOT NULL,
    start_date date,
    seed_type_id integer,
    substrate_id integer,
    treatment_id integer,
    seeds_sown integer,
    notes text,
    staff_responsible text,
    total_seeds_germinated integer,
    total_percent_germinated integer,
    end_date date,
    seeds_compromised integer,
    seeds_empty integer,
    seeds_filled integer,
    CONSTRAINT viability_tests_notes_check CHECK ((notes !~ similar_to_escape(' *'::text))),
    CONSTRAINT viability_tests_staff_responsible_check CHECK ((staff_responsible !~ similar_to_escape(' *'::text)))
);


--
-- Name: TABLE viability_tests; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.viability_tests IS 'Information about a single batch of seeds being tested for viability. This is the information about the test itself; the results are represented in the `viability_test_results` table.';


--
-- Name: germination_test_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.viability_tests ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.germination_test_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: seed_quantity_units; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.seed_quantity_units (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE seed_quantity_units; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.seed_quantity_units IS '(Enum) Available units in which seeds can be measured. For weight-based units, includes unit conversion information.';


--
-- Name: viability_test_types; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.viability_test_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE viability_test_types; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.viability_test_types IS '(Enum) Types of tests that can be performed on seeds to check for viability.';


--
-- Name: withdrawals; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.withdrawals (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    date date NOT NULL,
    purpose_id integer,
    destination text,
    staff_responsible text,
    created_time timestamp with time zone NOT NULL,
    updated_time timestamp with time zone NOT NULL,
    notes text,
    viability_test_id bigint,
    withdrawn_grams numeric,
    withdrawn_quantity numeric,
    withdrawn_units_id integer,
    estimated_count integer,
    estimated_weight_quantity numeric,
    estimated_weight_units_id integer,
    created_by bigint,
    withdrawn_by bigint,
    batch_id bigint,
    CONSTRAINT estimated_weight_must_have_units CHECK ((((estimated_weight_quantity IS NOT NULL) AND (estimated_weight_units_id IS NOT NULL)) OR ((estimated_weight_quantity IS NULL) AND (estimated_weight_units_id IS NULL)))),
    CONSTRAINT withdrawals_destination_check CHECK ((destination !~ similar_to_escape(' *'::text))),
    CONSTRAINT withdrawals_notes_check CHECK ((notes !~ similar_to_escape(' *'::text))),
    CONSTRAINT withdrawals_staff_responsible_check CHECK ((staff_responsible !~ similar_to_escape(' *'::text))),
    CONSTRAINT withdrawals_test_id_requires_purpose CHECK ((((viability_test_id IS NULL) AND ((purpose_id IS NULL) OR (purpose_id <> 7))) OR ((viability_test_id IS NOT NULL) AND (purpose_id IS NOT NULL) AND (purpose_id = 7)))),
    CONSTRAINT withdrawals_viability_testing_has_test_id CHECK ((((purpose_id <> 7) AND (viability_test_id IS NULL)) OR ((purpose_id = 7) AND (viability_test_id IS NOT NULL))))
);


--
-- Name: TABLE withdrawals; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.withdrawals IS 'Information about seeds that have been withdrawn from a seed bank. Each time someone withdraws seeds, a new row is inserted here.';


--
-- Name: withdrawal_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.withdrawals ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.withdrawal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: withdrawal_purposes; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.withdrawal_purposes (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE withdrawal_purposes; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.withdrawal_purposes IS '(Enum) Reasons that someone can withdraw seeds from a seed bank.';


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.withdrawal_purposes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.withdrawal_purpose_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: deliveries_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.deliveries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.deliveries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: draft_planting_sites; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.draft_planting_sites (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    project_id bigint,
    name text NOT NULL,
    description text,
    time_zone text,
    num_planting_zones integer,
    num_planting_subzones integer,
    data jsonb NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE draft_planting_sites; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.draft_planting_sites IS 'Details of planting sites that are in the process of being defined.';


--
-- Name: COLUMN draft_planting_sites.num_planting_zones; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.draft_planting_sites.num_planting_zones IS 'Number of planting zones defined so far.';


--
-- Name: COLUMN draft_planting_sites.num_planting_subzones; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.draft_planting_sites.num_planting_subzones IS 'Number of planting subzones defined so far.';


--
-- Name: COLUMN draft_planting_sites.data; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.draft_planting_sites.data IS 'Client-defined state of the definition of the planting site. This may include a mix of map data and application state and is treated as opaque by the server.';


--
-- Name: draft_planting_sites_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.draft_planting_sites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.draft_planting_sites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: monitoring_plots; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.monitoring_plots (
    id bigint NOT NULL,
    planting_subzone_id bigint NOT NULL,
    name text NOT NULL COLLATE public.natural_numeric,
    full_name text NOT NULL COLLATE public.natural_numeric,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    boundary public.geometry(Polygon) NOT NULL,
    permanent_cluster integer,
    permanent_cluster_subplot integer,
    is_available boolean DEFAULT true NOT NULL,
    CONSTRAINT cluster_has_subplot CHECK ((((permanent_cluster IS NOT NULL) AND (permanent_cluster_subplot IS NOT NULL)) OR ((permanent_cluster IS NULL) AND (permanent_cluster_subplot IS NULL)))),
    CONSTRAINT subplot_is_valid CHECK (((permanent_cluster_subplot >= 1) AND (permanent_cluster_subplot <= 4)))
);


--
-- Name: TABLE monitoring_plots; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.monitoring_plots IS 'Regions within planting subzones that can be comprehensively surveyed in order to extrapolate results for the entire zone. Any monitoring plot in a subzone is expected to have roughly the same number of plants of the same species as any other monitoring plot in the same subzone.';


--
-- Name: COLUMN monitoring_plots.planting_subzone_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.planting_subzone_id IS 'Which planting subzone this monitoring plot is part of.';


--
-- Name: COLUMN monitoring_plots.created_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.created_by IS 'Which user created the monitoring plot.';


--
-- Name: COLUMN monitoring_plots.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.created_time IS 'When the monitoring plot was originally created.';


--
-- Name: COLUMN monitoring_plots.modified_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.modified_by IS 'Which user most recently modified the monitoring plot.';


--
-- Name: COLUMN monitoring_plots.modified_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.modified_time IS 'When the monitoring plot was most recently modified.';


--
-- Name: COLUMN monitoring_plots.boundary; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.boundary IS 'Boundary of the monitoring plot. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN monitoring_plots.permanent_cluster; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.permanent_cluster IS 'If this plot is a candidate to be a permanent monitoring plot, its position in the randomized list of plots for the planting zone. Starts at 1 for each planting zone. There are always 4 plots with a given sequence number in a given zone. If null, this plot is not part of a 4-plot cluster but may still be chosen as a temporary monitoring plot.';


--
-- Name: COLUMN monitoring_plots.permanent_cluster_subplot; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.monitoring_plots.permanent_cluster_subplot IS 'If this plot is a candidate to be a permanent monitoring plot, its ordinal position from 1 to 4 in the 4-plot cluster. 1=southwest, 2=southeast, 3=northeast, 4=northwest.';


--
-- Name: monitoring_plots_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.monitoring_plots ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.monitoring_plots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: observable_conditions; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observable_conditions (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE observable_conditions; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observable_conditions IS '(Enum) Conditions that can be observed in a monitoring plot.';


--
-- Name: observation_photos; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observation_photos (
    file_id bigint NOT NULL,
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    position_id integer NOT NULL,
    gps_coordinates public.geometry(Point)
);


--
-- Name: TABLE observation_photos; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observation_photos IS 'Observation-specific details about a photo of a monitoring plot. Generic metadata is in the `files` table.';


--
-- Name: observation_plot_conditions; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observation_plot_conditions (
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    condition_id integer NOT NULL
);


--
-- Name: TABLE observation_plot_conditions; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observation_plot_conditions IS 'List of conditions observed in each monitoring plot.';


--
-- Name: observation_plot_positions; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observation_plot_positions (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE observation_plot_positions; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observation_plot_positions IS '(Enum) Positions in a monitoring plot where users can take photos or record coordinates.';


--
-- Name: observation_plots; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observation_plots (
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    claimed_by bigint,
    claimed_time timestamp with time zone,
    completed_by bigint,
    completed_time timestamp with time zone,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    is_permanent boolean NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone,
    observed_time timestamp with time zone,
    notes text,
    CONSTRAINT cannot_unclaim_completed_plot CHECK (((completed_by IS NULL) OR ((completed_by IS NOT NULL) AND (claimed_by IS NOT NULL))))
);


--
-- Name: TABLE observation_plots; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observation_plots IS 'Information about monitoring plots that are required to be surveyed as part of observations. This is not populated until the scheduled start time of the observation.';


--
-- Name: COLUMN observation_plots.completed_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observation_plots.completed_time IS 'Server-generated completion date and time. This is the time the observation was submitted to the server, not the time it was performed in the field.';


--
-- Name: COLUMN observation_plots.is_permanent; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observation_plots.is_permanent IS 'If true, this plot was selected for observation as part of a permanent monitoring plot cluster. If false, this plot was selected as a temporary monitoring plot.';


--
-- Name: COLUMN observation_plots.observed_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observation_plots.observed_time IS 'Client-supplied observation date and time. This is the time the observation was performed in the field, not the time it was submitted to the server.';


--
-- Name: observation_states; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observation_states (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE observation_states; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observation_states IS '(Enum) Where in the observation lifecycle a particular observation is.';


--
-- Name: observations; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observations (
    id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    completed_time timestamp with time zone,
    state_id integer NOT NULL,
    upcoming_notification_sent_time timestamp with time zone,
    CONSTRAINT completed_time_and_state CHECK ((((completed_time IS NULL) AND (state_id <> 3)) OR ((completed_time IS NOT NULL) AND (state_id = 3)))),
    CONSTRAINT end_after_start CHECK ((start_date <= end_date))
);


--
-- Name: TABLE observations; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observations IS 'Scheduled observations of planting sites. This table may contain rows describing future observations as well as current and past ones.';


--
-- Name: COLUMN observations.start_date; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observations.start_date IS 'First day of the observation. This is either the first day of the month following the end of the planting season, or 6 months after that day.';


--
-- Name: COLUMN observations.end_date; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observations.end_date IS 'Last day of the observation. This is typically the last day of the same month as `start_date`.';


--
-- Name: COLUMN observations.completed_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observations.completed_time IS 'Server-generated date and time the final piece of data for the observation was received.';


--
-- Name: COLUMN observations.upcoming_notification_sent_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observations.upcoming_notification_sent_time IS 'When the notification that the observation is starting in 1 month was sent. Null if the notification has not been sent yet.';


--
-- Name: observations_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.observations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.observations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: observed_plot_coordinates; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observed_plot_coordinates (
    id bigint NOT NULL,
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    position_id integer NOT NULL,
    gps_coordinates public.geometry(Point) NOT NULL
);


--
-- Name: TABLE observed_plot_coordinates; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observed_plot_coordinates IS 'Observed GPS coordinates in monitoring plots. Does not include photo coordinates or coordinates of recorded plants.';


--
-- Name: observed_plot_coordinates_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.observed_plot_coordinates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.observed_plot_coordinates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: observed_plot_species_totals; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observed_plot_species_totals (
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    species_id bigint,
    species_name text,
    certainty_id integer NOT NULL,
    total_live integer DEFAULT 0 NOT NULL,
    total_dead integer DEFAULT 0 NOT NULL,
    total_existing integer DEFAULT 0 NOT NULL,
    mortality_rate integer DEFAULT 0,
    cumulative_dead integer DEFAULT 0 NOT NULL,
    permanent_live integer DEFAULT 0 NOT NULL,
    CONSTRAINT species_identifier_for_certainty CHECK ((((certainty_id = 1) AND (species_id IS NOT NULL) AND (species_name IS NULL)) OR ((certainty_id = 2) AND (species_id IS NULL) AND (species_name IS NOT NULL)) OR ((certainty_id = 3) AND (species_id IS NULL) AND (species_name IS NULL))))
);


--
-- Name: TABLE observed_plot_species_totals; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observed_plot_species_totals IS 'Aggregated per-monitoring-plot, per-species totals of plants recorded during observations.';


--
-- Name: COLUMN observed_plot_species_totals.mortality_rate; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_plot_species_totals.mortality_rate IS 'If this is a permanent monitoring plot, percentage of plants of the species observed in this plot, in either this observation or in previous ones, that were dead. Null if this is not a permanent monitoring plot in the current observation.';


--
-- Name: COLUMN observed_plot_species_totals.cumulative_dead; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_plot_species_totals.cumulative_dead IS 'If this is a permanent monitoring plot, total number of dead plants observed in all observations including the current one.';


--
-- Name: COLUMN observed_plot_species_totals.permanent_live; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_plot_species_totals.permanent_live IS 'If this is a permanent monitoring plot, the number of live and existing plants observed. 0 otherwise.';


--
-- Name: observed_site_species_totals; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observed_site_species_totals (
    observation_id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    species_id bigint,
    species_name text,
    certainty_id integer NOT NULL,
    total_live integer DEFAULT 0 NOT NULL,
    total_dead integer DEFAULT 0 NOT NULL,
    total_existing integer DEFAULT 0 NOT NULL,
    mortality_rate integer DEFAULT 0,
    cumulative_dead integer DEFAULT 0 NOT NULL,
    permanent_live integer DEFAULT 0 NOT NULL,
    CONSTRAINT species_identifier_for_certainty CHECK ((((certainty_id = 1) AND (species_id IS NOT NULL) AND (species_name IS NULL)) OR ((certainty_id = 2) AND (species_id IS NULL) AND (species_name IS NOT NULL)) OR ((certainty_id = 3) AND (species_id IS NULL) AND (species_name IS NULL))))
);


--
-- Name: TABLE observed_site_species_totals; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observed_site_species_totals IS 'Aggregated per-planting-site, per-species totals of plants recorded during observations.';


--
-- Name: COLUMN observed_site_species_totals.mortality_rate; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_site_species_totals.mortality_rate IS 'Percentage of plants of the species observed in permanent monitoring plots in the planting site, in either this observation or in previous ones, that were dead.';


--
-- Name: COLUMN observed_site_species_totals.cumulative_dead; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_site_species_totals.cumulative_dead IS 'Total number of dead plants of the species observed, both in this observation and in all previous ones, in plots that are included as permanent plots in this observation.';


--
-- Name: COLUMN observed_site_species_totals.permanent_live; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_site_species_totals.permanent_live IS 'The number of live and existing plants observed in permanent monitoring plots.';


--
-- Name: observed_zone_species_totals; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.observed_zone_species_totals (
    observation_id bigint NOT NULL,
    planting_zone_id bigint NOT NULL,
    species_id bigint,
    species_name text,
    certainty_id integer NOT NULL,
    total_live integer DEFAULT 0 NOT NULL,
    total_dead integer DEFAULT 0 NOT NULL,
    total_existing integer DEFAULT 0 NOT NULL,
    mortality_rate integer DEFAULT 0,
    cumulative_dead integer DEFAULT 0 NOT NULL,
    permanent_live integer DEFAULT 0 NOT NULL,
    CONSTRAINT species_identifier_for_certainty CHECK ((((certainty_id = 1) AND (species_id IS NOT NULL) AND (species_name IS NULL)) OR ((certainty_id = 2) AND (species_id IS NULL) AND (species_name IS NOT NULL)) OR ((certainty_id = 3) AND (species_id IS NULL) AND (species_name IS NULL))))
);


--
-- Name: TABLE observed_zone_species_totals; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.observed_zone_species_totals IS 'Aggregated per-planting-zone, per-species totals of plants recorded during observations.';


--
-- Name: COLUMN observed_zone_species_totals.mortality_rate; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_zone_species_totals.mortality_rate IS 'Percentage of plants of the species observed in permanent monitoring plots in the planting zone, in either the current observation or in previous ones, that were dead.';


--
-- Name: COLUMN observed_zone_species_totals.cumulative_dead; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_zone_species_totals.cumulative_dead IS 'Total number of dead plants of the species observed, both in this observation and in all previous ones, in plots in this zone that are included as permanent plots in this observation.';


--
-- Name: COLUMN observed_zone_species_totals.permanent_live; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.observed_zone_species_totals.permanent_live IS 'The number of live and existing plants observed in permanent monitoring plots.';


--
-- Name: planting_seasons; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_seasons (
    id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    start_date date NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_date date NOT NULL,
    end_time timestamp with time zone NOT NULL,
    is_active boolean NOT NULL,
    CONSTRAINT planting_seasons_check CHECK ((start_date < end_date)),
    CONSTRAINT planting_seasons_check1 CHECK ((start_time < end_time))
);


--
-- Name: TABLE planting_seasons; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_seasons IS 'Start and end dates of planting seasons for planting sites.';


--
-- Name: COLUMN planting_seasons.start_date; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_seasons.start_date IS 'What day the planting season starts.';


--
-- Name: COLUMN planting_seasons.start_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_seasons.start_time IS 'When the planting season will start. This is midnight on `start_date` in the planting site''s time zone.';


--
-- Name: COLUMN planting_seasons.end_date; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_seasons.end_date IS 'What day the planting season ends. This is the last day of the season, not the day after the season, that is, if the planting season is the month of January, this will be January 31, not February 1.';


--
-- Name: COLUMN planting_seasons.end_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_seasons.end_time IS 'When the planting season will be finished. This is midnight on the day after `end_date` in the planting site''s time zone.';


--
-- Name: COLUMN planting_seasons.is_active; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_seasons.is_active IS 'True if the planting season is currently in progress. Only one planting season can be active at a time for a planting site.';


--
-- Name: planting_seasons_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_seasons ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_seasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: planting_site_histories; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_site_histories (
    id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    boundary public.geometry(MultiPolygon) NOT NULL,
    grid_origin public.geometry(Point),
    exclusion public.geometry(MultiPolygon)
);


--
-- Name: TABLE planting_site_histories; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_site_histories IS 'Versions of planting site maps over time. Each time a planting site map changes, the new map is inserted into this table and its child tables.';


--
-- Name: COLUMN planting_site_histories.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_site_histories.created_time IS 'When the site map was created or updated. You can determine which map was active for a site at a particular time by looking for the maximum `created_time` less than or equal to the time in question.';


--
-- Name: planting_site_histories_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_site_histories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_site_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: planting_site_notifications; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_site_notifications (
    id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    notification_type_id integer NOT NULL,
    notification_number integer NOT NULL,
    sent_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE planting_site_notifications; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_site_notifications IS 'Tracks which notifications have already been sent regarding planting sites.';


--
-- Name: COLUMN planting_site_notifications.notification_number; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_site_notifications.notification_number IS 'Number of notifications of this type that have been sent, including this one. 1 for initial notification, 2 for reminder, 3 for second reminder, etc.';


--
-- Name: planting_site_notifications_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_site_notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_site_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: planting_site_populations; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_site_populations (
    planting_site_id bigint NOT NULL,
    species_id bigint NOT NULL,
    total_plants integer NOT NULL,
    plants_since_last_observation integer
);


--
-- Name: TABLE planting_site_populations; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_site_populations IS 'Total number of plants of each species in each planting site.';


--
-- Name: planting_zones; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_zones (
    id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    name text NOT NULL,
    boundary public.geometry(MultiPolygon) NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    variance numeric NOT NULL,
    students_t numeric NOT NULL,
    error_margin numeric NOT NULL,
    num_permanent_clusters integer NOT NULL,
    num_temporary_plots integer NOT NULL,
    area_ha numeric NOT NULL,
    target_planting_density numeric DEFAULT 1500 NOT NULL,
    extra_permanent_clusters integer DEFAULT 0 NOT NULL,
    CONSTRAINT area_positive CHECK ((area_ha > (0)::numeric)),
    CONSTRAINT must_have_permanent_clusters CHECK ((num_permanent_clusters > 0)),
    CONSTRAINT must_have_temporary_plots CHECK ((num_temporary_plots > 0)),
    CONSTRAINT positive_target_density CHECK ((target_planting_density > (0)::numeric))
);


--
-- Name: TABLE planting_zones; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_zones IS 'Regions within planting sites that have a consistent set of conditions such that survey results from any part of the zone can be extrapolated to the entire zone. Planting zones are subdivided into plots. Every planting zone has at least one plot.';


--
-- Name: COLUMN planting_zones.planting_site_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.planting_site_id IS 'Which planting site this zone is part of.';


--
-- Name: COLUMN planting_zones.name; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.name IS 'Short name of this planting zone. This is often just a single letter. Must be unique within a planting site.';


--
-- Name: COLUMN planting_zones.boundary; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.boundary IS 'Boundary of the planting zone. This area is further subdivided into plots. This will typically be a single polygon but may be multiple polygons if a planting zone has several disjoint areas. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN planting_zones.created_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.created_by IS 'Which user created the planting zone.';


--
-- Name: COLUMN planting_zones.created_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.created_time IS 'When the planting zone was originally created.';


--
-- Name: COLUMN planting_zones.modified_by; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.modified_by IS 'Which user most recently modified the planting zone.';


--
-- Name: COLUMN planting_zones.modified_time; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.modified_time IS 'When the planting zone was most recently modified.';


--
-- Name: COLUMN planting_zones.num_permanent_clusters; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.num_permanent_clusters IS 'Number of permanent clusters to assign to the next observation. This is typically derived from a statistical formula and from `extra_permanent_clusters`.';


--
-- Name: COLUMN planting_zones.extra_permanent_clusters; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.planting_zones.extra_permanent_clusters IS 'Number of clusters to add to observation in addition to the number that is derived from the statistical formula. Typically this is due to additional area being added to a zone after initial creation. This is included in the value of `num_permanent_clusters`, that is, it is an input to the calculation of that column''s value.';


--
-- Name: planting_site_summaries; Type: VIEW; Schema: tracking; Owner: -
--

CREATE VIEW tracking.planting_site_summaries AS
 SELECT ps.id,
    ps.organization_id,
    ps.name,
    ps.description,
    ps.boundary,
    ps.created_by,
    ps.created_time,
    ps.modified_by,
    ps.modified_time,
    ( SELECT count(*) AS count
           FROM tracking.planting_zones pz
          WHERE (ps.id = pz.planting_site_id)) AS num_planting_zones,
    ( SELECT count(*) AS count
           FROM (tracking.planting_zones pz
             JOIN tracking.planting_subzones sz ON ((pz.id = sz.planting_zone_id)))
          WHERE (ps.id = pz.planting_site_id)) AS num_planting_subzones,
    ps.time_zone,
    ps.project_id,
    ps.exclusion
   FROM tracking.planting_sites ps;


--
-- Name: planting_sites_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_sites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_sites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: planting_subzone_histories; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_subzone_histories (
    id bigint NOT NULL,
    planting_zone_history_id bigint NOT NULL,
    planting_subzone_id bigint,
    name text NOT NULL,
    full_name text NOT NULL,
    boundary public.geometry(MultiPolygon) NOT NULL
);


--
-- Name: TABLE planting_subzone_histories; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_subzone_histories IS 'Versions of planting subzone maps over time. Each time a planting site map changes, its subzones'' maps are inserted into this table.';


--
-- Name: planting_subzone_histories_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_subzone_histories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_subzone_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: planting_subzone_populations; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_subzone_populations (
    planting_subzone_id bigint NOT NULL,
    species_id bigint NOT NULL,
    total_plants integer NOT NULL,
    plants_since_last_observation integer
);


--
-- Name: TABLE planting_subzone_populations; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_subzone_populations IS 'Total number of plants of each species in each subzone.';


--
-- Name: planting_types; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE planting_types; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_types IS '(Enum) Type of planting associated with a delivery. Different planting types distinguish reassignments from initial plantings.';


--
-- Name: planting_zone_histories; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_zone_histories (
    id bigint NOT NULL,
    planting_site_history_id bigint NOT NULL,
    planting_zone_id bigint,
    name text NOT NULL,
    boundary public.geometry(MultiPolygon) NOT NULL
);


--
-- Name: TABLE planting_zone_histories; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_zone_histories IS 'Versions of planting zone maps over time. Each time a planting site map changes, its zones'' maps are inserted into this table.';


--
-- Name: planting_zone_histories_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_zone_histories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_zone_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: planting_zone_populations; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.planting_zone_populations (
    planting_zone_id bigint NOT NULL,
    species_id bigint NOT NULL,
    total_plants integer NOT NULL,
    plants_since_last_observation integer
);


--
-- Name: TABLE planting_zone_populations; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.planting_zone_populations IS 'Total number of plants of each species in each zone.';


--
-- Name: planting_zones_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_zones ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.planting_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plantings_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.plantings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.plantings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plots_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.planting_subzones ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.plots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recorded_plant_statuses; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.recorded_plant_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE recorded_plant_statuses; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.recorded_plant_statuses IS '(Enum) Possible statuses of a plant recorded during observation of a monitoring plot.';


--
-- Name: recorded_plants; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.recorded_plants (
    id bigint NOT NULL,
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    certainty_id integer NOT NULL,
    gps_coordinates public.geometry(Point) NOT NULL,
    species_id bigint,
    species_name text,
    status_id integer NOT NULL,
    CONSTRAINT species_info_matches_certainty CHECK ((((certainty_id = 1) AND (species_id IS NOT NULL) AND (species_name IS NULL)) OR ((certainty_id = 2) AND (species_id IS NULL)) OR ((certainty_id = 3) AND (species_id IS NULL) AND (species_name IS NULL))))
);


--
-- Name: TABLE recorded_plants; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.recorded_plants IS 'Information about individual plants observed in monitoring plots.';


--
-- Name: COLUMN recorded_plants.species_id; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.recorded_plants.species_id IS 'If certainty is "Known," the ID of the plant''s species. Null for other certainty values.';


--
-- Name: COLUMN recorded_plants.species_name; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON COLUMN tracking.recorded_plants.species_name IS 'If certainty is "Other," the user-supplied name of the plant''s species. Null for other certainty values.';


--
-- Name: recorded_plants_id_seq; Type: SEQUENCE; Schema: tracking; Owner: -
--

ALTER TABLE tracking.recorded_plants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME tracking.recorded_plants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recorded_species_certainties; Type: TABLE; Schema: tracking; Owner: -
--

CREATE TABLE tracking.recorded_species_certainties (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE recorded_species_certainties; Type: COMMENT; Schema: tracking; Owner: -
--

COMMENT ON TABLE tracking.recorded_species_certainties IS '(Enum) Levels of certainty about the identity of a species recorded in a monitoring plot observation.';


--
-- Data for Name: cohort_modules; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.cohort_modules (cohort_id, module_id, start_date, end_date, title) FROM stdin;
\.


--
-- Data for Name: cohort_phases; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.cohort_phases (id, name) FROM stdin;
0	Phase 0 - Due Diligence
1	Phase 1 - Feasibility Study
2	Phase 2 - Plan and Scale
3	Phase 3 - Implement and Monitor
\.


--
-- Data for Name: cohorts; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.cohorts (id, name, created_by, created_time, modified_by, modified_time, phase_id) FROM stdin;
\.


--
-- Data for Name: deal_stages; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deal_stages (id, name, pipeline_id) FROM stdin;
101	Phase 0 (Doc Review)	1
102	Phase 1	1
103	Phase 2	1
104	Phase 3	1
105	Graduated, Finished Planting	1
106	Non Graduate	1
201	Application Submitted	2
202	Project Lead Screening Review	2
203	Screening Questions Ready for Review	2
204	Carbon Pre-Check	2
205	Submission Requires Follow Up	2
206	Carbon Eligible	2
207	Closed Lost	2
301	Issue Active	3
302	Issue Pending	3
303	Issue Reesolved	3
\.


--
-- Data for Name: default_voters; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.default_voters (user_id) FROM stdin;
\.


--
-- Data for Name: deliverable_categories; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deliverable_categories (id, name) FROM stdin;
1	Compliance
2	Financial Viability
3	GIS
4	Carbon Eligibility
5	Stakeholders and Community Impact
6	Proposed Restoration Activities
7	Verra Non-Permanence Risk Tool (NPRT)
8	Supplemental Files
\.


--
-- Data for Name: deliverable_cohort_due_dates; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deliverable_cohort_due_dates (deliverable_id, cohort_id, due_date) FROM stdin;
\.


--
-- Data for Name: deliverable_documents; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deliverable_documents (deliverable_id, deliverable_type_id, template_url) FROM stdin;
\.


--
-- Data for Name: deliverable_project_due_dates; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deliverable_project_due_dates (deliverable_id, project_id, due_date) FROM stdin;
\.


--
-- Data for Name: deliverable_types; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deliverable_types (id, name) FROM stdin;
1	Document
2	Species
\.


--
-- Data for Name: deliverables; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.deliverables (id, deliverable_category_id, deliverable_type_id, module_id, "position", created_by, created_time, modified_by, modified_time, name, description_html, is_sensitive, is_required) FROM stdin;
\.


--
-- Data for Name: document_stores; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.document_stores (id, name) FROM stdin;
1	Dropbox
2	Google
\.


--
-- Data for Name: event_projects; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.event_projects (event_id, project_id) FROM stdin;
\.


--
-- Data for Name: event_statuses; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.event_statuses (id, name) FROM stdin;
1	Not Started
2	Starting Soon
3	In Progress
4	Ended
\.


--
-- Data for Name: event_types; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.event_types (id, name) FROM stdin;
1	One-on-One Session
2	Workshop
3	Live Session
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.events (id, module_id, event_type_id, meeting_url, slides_url, recording_url, start_time, end_time, created_by, created_time, modified_by, modified_time, revision, event_status_id) FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.modules (id, name, created_by, created_time, modified_by, modified_time, overview, preparation_materials, live_session_description, workshop_description, one_on_one_session_description, additional_resources, phase_id) FROM stdin;
\.


--
-- Data for Name: participant_project_species; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.participant_project_species (id, project_id, species_id, submission_status_id, feedback, rationale, created_by, modified_by, created_time, modified_time, internal_comment, species_native_category_id) FROM stdin;
\.


--
-- Data for Name: participants; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.participants (id, name, created_by, created_time, modified_by, modified_time, cohort_id) FROM stdin;
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.pipelines (id, name) FROM stdin;
1	Accelerator Projects
2	Carbon Supply
3	Carbon Waitlist
\.


--
-- Data for Name: project_accelerator_details; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.project_accelerator_details (project_id, pipeline_id, deal_stage_id, application_reforestable_land, confirmed_reforestable_land, total_expansion_potential, num_native_species, min_carbon_accumulation, max_carbon_accumulation, per_hectare_budget, num_communities, investment_thesis, failure_risk, what_needs_to_be_true, deal_description, project_lead, file_naming, dropbox_folder_path, google_folder_url) FROM stdin;
\.


--
-- Data for Name: project_scores; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.project_scores (project_id, phase_id, score_category_id, score, qualitative, created_by, created_time, modified_by, modified_time) FROM stdin;
\.


--
-- Data for Name: project_vote_decisions; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.project_vote_decisions (project_id, phase_id, vote_option_id, modified_time) FROM stdin;
\.


--
-- Data for Name: project_votes; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.project_votes (user_id, project_id, phase_id, vote_option_id, conditional_info, created_by, created_time, modified_by, modified_time) FROM stdin;
\.


--
-- Data for Name: score_categories; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.score_categories (id, name) FROM stdin;
1	Carbon
2	Finance
3	Forestry
4	Legal
5	Community
6	GIS
7	Climate Impact
8	Expansion Potential
9	Experience and Understanding
10	Operational Capacity
11	Responsiveness and Attention to Detail
12	Values Alignment
\.


--
-- Data for Name: submission_documents; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.submission_documents (id, submission_id, document_store_id, created_by, created_time, name, description, location, original_name, project_id) FROM stdin;
\.


--
-- Data for Name: submission_snapshots; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.submission_snapshots (id, file_id, submission_id) FROM stdin;
\.


--
-- Data for Name: submission_statuses; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.submission_statuses (id, name) FROM stdin;
1	Not Submitted
2	In Review
3	Needs Translation
4	Approved
5	Rejected
6	Not Needed
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.submissions (id, project_id, deliverable_id, submission_status_id, created_by, created_time, modified_by, modified_time, internal_comment, feedback) FROM stdin;
\.


--
-- Data for Name: vote_options; Type: TABLE DATA; Schema: accelerator; Owner: -
--

COPY accelerator.vote_options (id, name) FROM stdin;
1	No
2	Conditional
3	Yes
\.


--
-- Data for Name: batch_details_history; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_details_history (id, batch_id, version, created_by, created_time, notes, ready_by_date, project_id, project_name, substrate_id, substrate_notes, treatment_id, treatment_notes) FROM stdin;
\.


--
-- Data for Name: batch_details_history_sub_locations; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_details_history_sub_locations (batch_details_history_id, sub_location_id, sub_location_name) FROM stdin;
\.


--
-- Data for Name: batch_photos; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_photos (id, batch_id, file_id, created_by, created_time, deleted_by, deleted_time) FROM stdin;
\.


--
-- Data for Name: batch_quantity_history; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_quantity_history (id, batch_id, history_type_id, created_by, created_time, germinating_quantity, not_ready_quantity, ready_quantity, withdrawal_id, version) FROM stdin;
\.


--
-- Data for Name: batch_quantity_history_types; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_quantity_history_types (id, name) FROM stdin;
1	Observed
2	Computed
3	StatusChanged
\.


--
-- Data for Name: batch_sub_locations; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_sub_locations (batch_id, sub_location_id, facility_id) FROM stdin;
\.


--
-- Data for Name: batch_substrates; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_substrates (id, name) FROM stdin;
1	MediaMix
2	Soil
3	Sand
4	Moss
5	PerliteVermiculite
6	Other
\.


--
-- Data for Name: batch_withdrawals; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_withdrawals (batch_id, withdrawal_id, germinating_quantity_withdrawn, not_ready_quantity_withdrawn, ready_quantity_withdrawn, destination_batch_id) FROM stdin;
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batches (id, version, organization_id, facility_id, species_id, batch_number, added_date, germinating_quantity, not_ready_quantity, ready_quantity, latest_observed_germinating_quantity, latest_observed_not_ready_quantity, latest_observed_ready_quantity, latest_observed_time, created_by, created_time, modified_by, modified_time, notes, ready_by_date, accession_id, project_id, substrate_id, substrate_notes, treatment_id, treatment_notes, germination_rate, loss_rate, initial_batch_id, total_germinated, total_germination_candidates, total_lost, total_loss_candidates) FROM stdin;
\.


--
-- Data for Name: withdrawal_photos; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.withdrawal_photos (file_id, withdrawal_id) FROM stdin;
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.withdrawal_purposes (id, name) FROM stdin;
1	Nursery Transfer
2	Dead
3	Out Plant
4	Other
5	Undo
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.withdrawals (id, facility_id, purpose_id, withdrawn_date, created_by, created_time, modified_by, modified_time, destination_facility_id, notes, undoes_withdrawal_id) FROM stdin;
\.


--
-- Data for Name: app_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_versions (app_name, platform, minimum_version, recommended_version) FROM stdin;
SeedCollector	Android	0.0.1	0.0.1
SeedCollector	iOS	0.0.1	0.0.1
\.


--
-- Data for Name: automations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automations (id, facility_id, name, description, created_time, modified_time, settings, created_by, modified_by, type, device_id, timeseries_name, verbosity, lower_threshold, upper_threshold) FROM stdin;
\.


--
-- Data for Name: conservation_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conservation_categories (id, name) FROM stdin;
CR	Critically Endangered
DD	Data Deficient
EN	Endangered
EW	Extinct in the Wild
EX	Extinct
LC	Least Concern
NE	Not Evaluated
NT	Near Threatened
VU	Vulnerable
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.countries (code, name, region_id) FROM stdin;
AD	Andorra	3
AE	United Arab Emirates	5
AF	Afghanistan	8
AG	Antigua and Barbuda	4
AI	Anguilla	4
AL	Albania	3
AM	Armenia	3
AO	Angola	9
AQ	Antarctica	1
AR	Argentina	4
AS	American Samoa	7
AT	Austria	3
AU	Australia	7
AW	Aruba	4
AX	Åland Islands	3
AZ	Azerbaijan	3
BA	Bosnia and Herzegovina	3
BB	Barbados	4
BD	Bangladesh	8
BE	Belgium	3
BF	Burkina Faso	9
BG	Bulgaria	3
BH	Bahrain	5
BI	Burundi	9
BJ	Benin	9
BL	St. Barthélemy	4
BM	Bermuda	6
BN	Brunei	2
BO	Bolivia	4
BQ	Caribbean Netherlands	4
BR	Brazil	4
BS	Bahamas	4
BT	Bhutan	8
BV	Bouvet Island	1
BW	Botswana	9
BY	Belarus	3
BZ	Belize	4
CA	Canada	6
CC	Cocos (Keeling) Islands	7
CD	Congo - Kinshasa	9
CF	Central African Republic	9
CG	Congo - Brazzaville	9
CH	Switzerland	3
CI	Côte d’Ivoire	9
CK	Cook Islands	7
CL	Chile	4
CM	Cameroon	9
CN	China	2
CO	Colombia	4
CR	Costa Rica	4
CU	Cuba	4
CV	Cape Verde	9
CW	Curaçao	4
CX	Christmas Island	7
CY	Cyprus	3
CZ	Czech Republic	3
DE	Germany	3
DJ	Djibouti	9
DK	Denmark	3
DM	Dominica	4
DO	Dominican Republic	4
DZ	Algeria	5
EC	Ecuador	4
EE	Estonia	3
EG	Egypt	5
EH	Western Sahara	5
ER	Eritrea	9
ES	Spain	3
ET	Ethiopia	9
FI	Finland	3
FJ	Fiji	7
FK	Falkland Islands	4
FM	Micronesia	7
FO	Faroe Islands	3
FR	France	3
GA	Gabon	9
GB	United Kingdom	3
GD	Grenada	4
GE	Georgia	3
GF	French Guiana	4
GG	Guernsey	3
GH	Ghana	9
GI	Gibraltar	3
GL	Greenland	6
GM	Gambia	9
GN	Guinea	9
GP	Guadeloupe	4
GQ	Equatorial Guinea	9
GR	Greece	3
GS	South Georgia & South Sandwich Islands	1
GT	Guatemala	4
GU	Guam	7
GW	Guinea-Bissau	9
GY	Guyana	4
HK	Hong Kong SAR China	2
HM	Heard & McDonald Islands	1
HN	Honduras	4
HR	Croatia	3
HT	Haiti	4
HU	Hungary	3
ID	Indonesia	2
IE	Ireland	3
IL	Israel	5
IM	Isle of Man	3
IN	India	8
IO	British Indian Ocean Territory	8
IQ	Iraq	5
IR	Iran	5
IS	Iceland	3
IT	Italy	3
JE	Jersey	3
JM	Jamaica	4
JO	Jordan	5
JP	Japan	2
KE	Kenya	9
KG	Kyrgyzstan	3
KH	Cambodia	2
KI	Kiribati	7
KM	Comoros	9
KN	Saint Kitts and Nevis	4
KP	North Korea	2
KR	South Korea	2
KW	Kuwait	5
KY	Cayman Islands	4
KZ	Kazakhstan	3
LA	Laos	2
LB	Lebanon	5
LC	Saint Lucia	4
LI	Liechtenstein	3
LK	Sri Lanka	8
LR	Liberia	9
LS	Lesotho	9
LT	Lithuania	3
LU	Luxembourg	3
LV	Latvia	3
LY	Libya	5
MA	Morocco	5
MC	Monaco	3
MD	Moldova	3
ME	Montenegro	3
MF	St. Martin	4
MG	Madagascar	9
MH	Marshall Islands	7
MK	North Macedonia	3
ML	Mali	9
MM	Myanmar	2
MN	Mongolia	2
MO	Macao SAR China	2
MP	Northern Mariana Islands	7
MQ	Martinique	4
MR	Mauritania	9
MS	Montserrat	4
MT	Malta	3
MU	Mauritius	9
MV	Maldives	8
MW	Malawi	9
MX	Mexico	4
MY	Malaysia	2
MZ	Mozambique	9
NA	Namibia	9
NC	New Caledonia	7
NE	Niger	9
NF	Norfolk Island	7
NG	Nigeria	9
NI	Nicaragua	4
NL	Netherlands	3
NO	Norway	3
NP	Nepal	8
NR	Nauru	7
NU	Niue	7
NZ	New Zealand	7
OM	Oman	5
PA	Panama	4
PE	Peru	4
PF	French Polynesia	7
PG	Papua New Guinea	7
PH	Philippines	2
PK	Pakistan	8
PL	Poland	3
PM	St. Pierre & Miquelon	6
PN	Pitcairn Islands	7
PR	Puerto Rico	4
PS	Palestinian Territories	5
PT	Portugal	3
PW	Palau	7
PY	Paraguay	4
QA	Qatar	5
RE	Réunion	9
RO	Romania	3
RS	Serbia	3
RU	Russia	3
RW	Rwanda	9
SA	Saudi Arabia	5
SB	Solomon Islands	7
SC	Seychelles	9
SD	Sudan	9
SE	Sweden	3
SG	Singapore	2
SH	St. Helena	9
SI	Slovenia	3
SJ	Svalbard & Jan Mayen	3
SK	Slovakia	3
SL	Sierra Leone	9
SM	San Marino	3
SN	Senegal	9
SO	Somalia	9
SR	Suriname	4
SS	South Sudan	9
ST	Sao Tome and Principe	9
SV	El Salvador	4
SX	Sint Maarten	4
SY	Syria	5
SZ	Eswatini	9
TC	Turks & Caicos Islands	4
TD	Chad	9
TF	French Southern Territories	1
TG	Togo	9
TH	Thailand	2
TJ	Tajikistan	3
TK	Tokelau	7
TL	East Timor	2
TM	Turkmenistan	3
TN	Tunisia	5
TO	Tonga	7
TR	Turkey	3
TT	Trinidad and Tobago	4
TV	Tuvalu	7
TW	Taiwan	2
TZ	Tanzania	9
UA	Ukraine	3
UG	Uganda	9
UM	U.S. Outlying Islands	7
US	United States	6
UY	Uruguay	4
UZ	Uzbekistan	3
VA	Vatican City (Holy See)	3
VC	Saint Vincent and the Grenadines	4
VE	Venezuela	4
VG	British Virgin Islands	4
VI	U.S. Virgin Islands	4
VN	Vietnam	2
VU	Vanuatu	7
WF	Wallis & Futuna	7
WS	Samoa	7
YE	Yemen	5
YT	Mayotte	9
ZA	South Africa	9
ZM	Zambia	9
ZW	Zimbabwe	9
\.


--
-- Data for Name: country_subdivisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.country_subdivisions (code, country_code, name) FROM stdin;
US-AL	US	Alabama
US-AK	US	Alaska
US-AR	US	Arkansas
US-AS	US	American Samoa
US-AZ	US	Arizona
US-CA	US	California
US-CO	US	Colorado
US-CT	US	Connecticut
US-DC	US	District of Columbia
US-DE	US	Delaware
US-FL	US	Florida
US-GA	US	Georgia
US-GU	US	Guam
US-HI	US	Hawaii
US-IA	US	Iowa
US-ID	US	Idaho
US-IL	US	Illinois
US-IN	US	Indiana
US-KS	US	Kansas
US-KY	US	Kentucky
US-LA	US	Louisiana
US-MA	US	Massachusetts
US-MD	US	Maryland
US-ME	US	Maine
US-MI	US	Michigan
US-MN	US	Minnesota
US-MO	US	Missouri
US-MP	US	Northern Mariana Islands
US-MS	US	Mississippi
US-MT	US	Montana
US-NC	US	North Carolina
US-ND	US	North Dakota
US-NE	US	Nebraska
US-NH	US	New Hampshire
US-NJ	US	New Jersey
US-NM	US	New Mexico
US-NV	US	Nevada
US-NY	US	New York
US-OH	US	Ohio
US-OK	US	Oklahoma
US-OR	US	Oregon
US-PA	US	Pennsylvania
US-PR	US	Puerto Rico
US-RI	US	Rhode Island
US-SC	US	South Carolina
US-SD	US	South Dakota
US-TN	US	Tennessee
US-TX	US	Texas
US-UM	US	U.S. Minor Outlying Islands
US-UT	US	Utah
US-VA	US	Virginia
US-VI	US	U.S. Virgin Islands
US-VT	US	Vermont
US-WA	US	Washington
US-WI	US	Wisconsin
US-WV	US	West Virginia
US-WY	US	Wyoming
\.


--
-- Data for Name: device_managers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_managers (id, balena_id, balena_modified_time, device_name, is_online, last_connectivity_event, update_progress, sensor_kit_id, user_id, facility_id, created_time, refreshed_time, balena_uuid) FROM stdin;
\.


--
-- Data for Name: device_template_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_template_categories (id, name) FROM stdin;
1	PV
2	Seed Bank Default
\.


--
-- Data for Name: device_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_templates (id, category_id, device_type, name, description, make, model, protocol, address, port, settings, verbosity) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.devices (id, facility_id, name, device_type, make, model, protocol, address, port, enabled, settings, parent_id, created_by, modified_by, verbosity) FROM stdin;
\.


--
-- Data for Name: ecosystem_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ecosystem_types (id, name) FROM stdin;
1	Boreal forests/Taiga
2	Deserts and xeric shrublands
3	Flooded grasslands and savannas
4	Mangroves
5	Mediterranean forests, woodlands and scrubs
6	Montane grasslands and shrublands
7	Temperate broad leaf and mixed forests
8	Temperate coniferous forest
9	Temperate grasslands, savannas and shrublands
10	Tropical and subtropical coniferous forests
11	Tropical and subtropical dry broad leaf forests
12	Tropical and subtropical grasslands, savannas and shrublands
13	Tropical and subtropical moist broad leaf forests
14	Tundra
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facilities (id, type_id, name, created_time, modified_time, created_by, modified_by, max_idle_minutes, last_timeseries_time, idle_after_time, idle_since_time, description, connection_state_id, organization_id, time_zone, last_notification_date, next_notification_time, build_started_date, build_completed_date, operation_started_date, capacity, facility_number) FROM stdin;
100	1	Seed Bank	2022-02-04 17:48:28.616331+00	2022-02-04 17:48:28.616331+00	1	1	30	\N	\N	2022-01-01 00:00:00+00	\N	1	1	\N	2024-06-11	2024-06-12 00:01:00+00	\N	\N	\N	\N	1
101	1	garage	2022-02-04 17:48:28.616331+00	2022-02-04 17:48:28.616331+00	1	1	30	\N	\N	2022-01-01 00:00:00+00	\N	1	1	\N	2024-06-11	2024-06-12 00:01:00+00	\N	\N	\N	\N	2
102	1	Test facility	2022-02-04 17:48:28.616331+00	2022-02-04 17:48:28.616331+00	1	1	30	\N	\N	2022-01-01 00:00:00+00	\N	1	1	\N	2024-06-11	2024-06-12 00:01:00+00	\N	\N	\N	\N	3
103	4	Nursery	2024-03-05 04:06:31.354789+00	2024-03-05 04:06:31.354802+00	1	1	30	\N	\N	\N	My First Nursery!	1	1	\N	2024-06-11	2024-06-12 00:01:00+00	\N	\N	\N	\N	1
\.


--
-- Data for Name: facility_connection_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facility_connection_states (id, name) FROM stdin;
1	Not Connected
2	Connected
3	Configured
\.


--
-- Data for Name: facility_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facility_types (id, name) FROM stdin;
1	Seed Bank
2	Desalination
3	Reverse Osmosis
4	Nursery
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.files (id, file_name, content_type, size, created_time, modified_time, created_by, storage_url, modified_by) FROM stdin;
1001	accession1.jpg	image/jpeg	6441	2021-02-12 18:36:15.842405+00	2021-02-12 18:36:15.842405+00	1	file:///100/A/A/F/AAF4D49R3E/accession1.jpg	1
1002	accession2.jpg	image/jpeg	6539	2021-02-12 18:36:15.903768+00	2021-02-12 18:36:15.903768+00	1	file:///100/A/A/F/AAF4D49R3E/accession2.jpg	1
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	InitialSchema	SQL	V1__InitialSchema.sql	-1034755654	koreth	2021-12-15 09:59:41.084807	84	t
2	2	JsonColumns	SQL	V2__JsonColumns.sql	2037320227	koreth	2021-12-15 09:59:41.181771	1	t
3	3	Views	SQL	V3__Views.sql	-1376932692	koreth	2021-12-15 09:59:41.18758	3	t
4	4	UniqueTimeseriesName	SQL	V4__UniqueTimeseriesName.sql	728909451	koreth	2021-12-15 09:59:41.194472	2	t
5	5	SeedBankAppChanges	SQL	V5__SeedBankAppChanges.sql	1124675213	koreth	2021-12-15 09:59:41.2029	36	t
6	6	NotificationState	SQL	V6__NotificationState.sql	730795355	koreth	2021-12-15 09:59:41.278513	2	t
7	7	RefineAccessionModel	SQL	V7__RefineAccessionModel.sql	-1350346796	koreth	2021-12-15 09:59:41.28472	9	t
8	8	UniqueAccessionNumber	SQL	V8__UniqueAccessionNumber.sql	-960878745	koreth	2021-12-15 09:59:41.297376	1	t
9	9	IntegerReferenceIds	SQL	V9__IntegerReferenceIds.sql	803072805	koreth	2021-12-15 09:59:41.301832	25	t
10	10	NullableStartDate	SQL	V10__NullableStartDate.sql	-1429931340	koreth	2021-12-15 09:59:41.334736	0	t
11	11	AccessionGerminationTestType	SQL	V11__AccessionGerminationTestType.sql	-1263666901	koreth	2021-12-15 09:59:41.337954	2	t
12	12	StaffResponsible	SQL	V12__StaffResponsible.sql	554207183	koreth	2021-12-15 09:59:41.343338	1	t
13	13	WithdrawalSeeds	SQL	V13__WithdrawalSeeds.sql	1956624966	koreth	2021-12-15 09:59:41.34705	2	t
14	14	MissingFields	SQL	V14__MissingFields.sql	953759292	koreth	2021-12-15 09:59:41.351999	1	t
15	15	Viability	SQL	V15__Viability.sql	1068877736	koreth	2021-12-15 09:59:41.3552	1	t
16	16	AccessionPhoto	SQL	V16__AccessionPhoto.sql	-1900700002	koreth	2021-12-15 09:59:41.358	3	t
17	17	AppDevice	SQL	V17__AppDevice.sql	-1383209958	koreth	2021-12-15 09:59:41.363131	2	t
18	18	TestClock	SQL	V18__TestClock.sql	836156172	koreth	2021-12-15 09:59:41.367555	1	t
19	19	StateHistoryReason	SQL	V19__StateHistoryReason.sql	-1854244141	koreth	2021-12-15 09:59:41.370473	1	t
20	20	EffectiveSeedCount	SQL	V20__EffectiveSeedCount.sql	1291933651	koreth	2021-12-15 09:59:41.373625	0	t
21	21	DeviceConfig	SQL	V21__DeviceConfig.sql	1731824624	koreth	2021-12-15 09:59:41.376286	4	t
22	22	TaskProcessedTime	SQL	V22__TaskProcessedTime.sql	232740031	koreth	2021-12-15 09:59:41.384391	2	t
23	23	TotalSeedsGerminated	SQL	V23__TotalSeedsGerminated.sql	216665086	koreth	2021-12-15 09:59:41.388107	0	t
24	24	PerSiteConfigEnabled	SQL	V24__PerSiteConfigEnabled.sql	1526859524	koreth	2021-12-15 09:59:41.39062	1	t
25	25	DropScheduledJob	SQL	V25__DropScheduledJob.sql	-988663186	koreth	2021-12-15 09:59:41.394062	2	t
26	26	CleanUpForV0	SQL	V26__CleanUpForV0.sql	-1995914171	koreth	2021-12-15 09:59:41.398925	2	t
27	27	EndangeredRare	SQL	V27__EndangeredRare.sql	717188934	koreth	2021-12-15 09:59:41.403761	5	t
28	28	GerminationTestEndDate	SQL	V28__GerminationTestEndDate.sql	1656257066	koreth	2021-12-15 09:59:41.411512	0	t
29	29	AccessionNumber	SQL	V29__AccessionNumber.sql	1856554227	koreth	2021-12-15 09:59:41.413982	0	t
30	30	SpeciesUniqueName	SQL	V30__SpeciesUniqueName.sql	-367505524	koreth	2021-12-15 09:59:41.416465	1	t
31	31	SourcePlantOrigin	SQL	V31__SourcePlantOrigin.sql	-1290884519	koreth	2021-12-15 09:59:41.419056	2	t
32	32	NurseryStartDate	SQL	V32__NurseryStartDate.sql	328987724	koreth	2021-12-15 09:59:41.423359	0	t
33	33	WithdrawalGerminationTesting	SQL	V33__WithdrawalGerminationTesting.sql	-203241959	koreth	2021-12-15 09:59:41.425881	2	t
34	34	Weight	SQL	V34__Weight.sql	811889753	koreth	2021-12-15 09:59:41.432159	9	t
35	35	PluralTableNames	SQL	V35__PluralTableNames.sql	1475994894	koreth	2021-12-15 09:59:41.443774	4	t
36	36	RenameSiteModuleToFacility	SQL	V36__RenameSiteModuleToFacility.sql	-1317594747	koreth	2021-12-15 09:59:41.450345	1	t
37	37	Projects	SQL	V37__Projects.sql	1058370323	koreth	2021-12-15 09:59:41.453082	7	t
38	38	MajorityOfGIS	SQL	V38__MajorityOfGIS.sql	-644291923	koreth	2021-12-15 09:59:41.463933	21	t
39	39	AddGeomToFeatures	SQL	V39__AddGeomToFeatures.sql	2000177569	koreth	2021-12-15 09:59:41.490426	558	t
40	40	Users	SQL	V40__Users.sql	-680048697	koreth	2021-12-15 09:59:42.058131	13	t
41	41	UserTypes	SQL	V41__UserTypes.sql	-1195309145	koreth	2021-12-15 09:59:42.07493	4	t
42	42	GISNonEmptyStringConstraints	SQL	V42__GISNonEmptyStringConstraints.sql	-988900187	koreth	2021-12-15 09:59:42.082125	2	t
43	43	DropApiKeys	SQL	V43__DropApiKeys.sql	311197409	koreth	2021-12-15 09:59:42.087318	1	t
44	44	ConstrainSrid	SQL	V44__ConstrainSrid.sql	-604226396	koreth	2021-12-15 09:59:42.091221	3	t
45	45	UpdatePlantObservations	SQL	V45__UpdatePlantObservations.sql	879432357	koreth	2021-12-15 09:59:42.09696	0	t
46	46	PhotoAssociations	SQL	V46__PhotoAssociations.sql	737750322	koreth	2021-12-15 09:59:42.100352	8	t
47	47	PhotosLocation	SQL	V47__PhotosLocation.sql	-234034290	koreth	2021-12-15 09:59:42.111005	1	t
48	48	DropShapeTypes	SQL	V48__DropShapeTypes.sql	1900828145	koreth	2021-12-15 09:59:42.114127	1	t
49	49	Species	SQL	V49__Species.sql	1677601575	koreth	2021-12-15 09:59:42.117807	13	t
50	50	SpeciesNames	SQL	V50__SpeciesNames.sql	-164346692	koreth	2021-12-15 09:59:42.134908	4	t
51	51	TaskStarted	SQL	V51__TaskStarted.sql	1409019612	koreth	2021-12-15 09:59:42.142098	1	t
52	52	Thumbnails	SQL	V52__Thumbnails.sql	-1019560514	koreth	2021-12-15 09:59:42.145321	3	t
53	53	SpringSession	SQL	V53__SpringSession.sql	-1607350702	koreth	2021-12-15 09:59:42.151578	4	t
54	54	DeviceConfig	SQL	V54__DeviceConfig.sql	1805936957	koreth	2021-12-15 09:59:42.157547	1	t
55	55	SiteLocation	SQL	V55__SiteLocation.sql	539969339	koreth	2021-12-15 09:59:42.160367	1	t
56	56	AccessionAwaitingCheckIn	SQL	V56__AccessionAwaitingCheckIn.sql	97499865	koreth	2021-12-15 09:59:42.163225	0	t
57	57	Automations	SQL	V57__Automations.sql	336793054	koreth	2021-12-15 09:59:42.165581	2	t
58	58	FacilityAlertRecipients	SQL	V58__FacilityAlertRecipients.sql	1183614395	koreth	2021-12-15 09:59:42.169773	2	t
59	59	DropPlantsTimestamps	SQL	V59__DropPlantsTimestamps.sql	-580292684	koreth	2021-12-15 09:59:42.173904	0	t
60	\N	00 DevUtils	SQL	R__00_DevUtils.sql	-2035948695	koreth	2021-12-15 09:59:42.176142	2	t
61	\N	Comments	SQL	R__Comments.sql	437036648	koreth	2021-12-15 09:59:42.185655	7	t
62	\N	Indexes	SQL	R__Indexes.sql	1520281820	koreth	2021-12-15 09:59:42.194999	14	t
63	\N	TypeCodes	SQL	R__TypeCodes.sql	608477902	koreth	2021-12-15 09:59:42.213184	6	t
64	60	DropFamilies	SQL	V60__DropFamilies.sql	-606974405	koreth	2022-02-04 09:48:28.563144	9	t
65	61	Countries	SQL	V61__Countries.sql	1994435382	koreth	2022-02-04 09:48:28.584086	7	t
66	62	NullAuthId	SQL	V62__NullAuthId.sql	763639513	koreth	2022-02-04 09:48:28.59577	1	t
67	63	UserInvitedTime	SQL	V63__UserInvitedTime.sql	-227238976	koreth	2022-02-04 09:48:28.600734	1	t
68	64	ProjectTypeSelections	SQL	V64__ProjectTypeSelections.sql	65765331	koreth	2022-02-04 09:48:28.605382	3	t
69	65	SitesDescription	SQL	V65__SitesDescription.sql	-608925414	koreth	2022-02-04 09:48:28.611698	1	t
70	66	FacilitiesCreatedTime	SQL	V66__FacilitiesCreatedTime.sql	-1835036512	koreth	2022-02-04 09:48:28.616331	2	t
71	67	DropPendingInvitationTime	SQL	V67__DropPendingInvitationTime.sql	1813262799	koreth	2022-02-04 09:48:28.621505	1	t
72	68	ProjectsOrganizationWide	SQL	V68__ProjectsOrganizationWide.sql	-1660349942	koreth	2022-02-04 09:48:28.626677	2	t
73	69	ProjectsHidden	SQL	V69__ProjectsHidden.sql	940694545	koreth	2022-02-04 09:48:28.631393	1	t
74	70	SitesLocationNull	SQL	V70__SitesLocationNull.sql	-122358601	koreth	2022-02-04 09:48:28.63547	1	t
75	71	UsersLastActivityTime	SQL	V71__UsersLastActivityTime.sql	-602587972	koreth	2022-02-04 09:48:28.639317	0	t
76	\N	Comments	SQL	R__Comments.sql	185211625	koreth	2022-02-04 09:48:28.645555	14	t
77	\N	Countries	SQL	R__Countries.sql	1469177629	koreth	2022-02-04 09:48:28.665642	3	t
78	\N	TypeCodes	SQL	R__TypeCodes.sql	-2136975351	koreth	2022-02-04 09:48:28.672714	6	t
79	72	PerOrgSpecies	SQL	V72__PerOrgSpecies.sql	-1522153405	koreth	2022-10-25 10:51:42.213244	21	t
80	73	SystemUser	SQL	V73__SystemUser.sql	-2061883179	koreth	2022-10-25 10:51:42.244537	2	t
81	74	CreatedAndModifiedBy	SQL	V74__CreatedAndModifiedBy.sql	-993973072	koreth	2022-10-25 10:51:42.250179	24	t
82	75	AccessionNotifications	SQL	V75__AccessionNotifications.sql	-1779468870	koreth	2022-10-25 10:51:42.281508	1	t
83	76	FacilitiesIdle	SQL	V76__FacilitiesIdle.sql	642706920	koreth	2022-10-25 10:51:42.286081	2	t
84	77	OrganizationUsersIndex	SQL	V77__OrganizationUsersIndex.sql	983804815	koreth	2022-10-25 10:51:42.291423	1	t
85	78	DropGISTables	SQL	V78__DropGISTables.sql	-496536734	koreth	2022-10-25 10:51:42.295329	4	t
86	79	DeleteManagerRole	SQL	V79__DeleteManagerRole.sql	22265365	koreth	2022-10-25 10:51:42.304882	1	t
87	80	UserEmailNotifications	SQL	V80__UserEmailNotifications.sql	1918529188	koreth	2022-10-25 10:51:42.309017	0	t
88	81	GbifSpecies	SQL	V81__GbifSpecies.sql	1623900992	koreth	2022-10-25 10:51:42.312301	7	t
89	82	EnableFacilityAlerts	SQL	V82__EnableFacilityAlerts.sql	-1223251347	koreth	2022-10-25 10:51:42.322742	1	t
90	83	NotificationTypes	SQL	V83__NotificationTypes.sql	-184028827	koreth	2022-10-25 10:51:42.327834	4	t
91	84	Species	SQL	V84__Species.sql	-602261382	koreth	2022-10-25 10:51:42.335389	11	t
92	85	GbifNameWordsIndex	SQL	V85__GbifNameWordsIndex.sql	-2056544952	koreth	2022-10-25 10:51:42.351318	2	t
93	86	Uploads	SQL	V86__Uploads.sql	22906988	koreth	2022-10-25 10:51:42.356073	8	t
94	87	FacilitiesDescription	SQL	V87__FacilitiesDescription.sql	723237584	koreth	2022-10-25 10:51:42.366735	1	t
95	88	DeviceTemplates	SQL	V88__DeviceTemplates.sql	-855086529	koreth	2022-10-25 10:51:42.370201	2	t
96	89	SecondaryCollectorsPrimaryKey	SQL	V89__SecondaryCollectorsPrimaryKey.sql	-1513531409	koreth	2022-10-25 10:51:42.375208	0	t
97	90	Collectors	SQL	V90__Collectors.sql	1510321638	koreth	2022-10-25 10:51:42.378369	3	t
98	91	DeviceManagers	SQL	V91__DeviceManagers.sql	1073930490	koreth	2022-10-25 10:51:42.385093	4	t
99	92	DeviceManagersUuid	SQL	V92__DeviceManagersUuid.sql	-2008020196	koreth	2022-10-25 10:51:42.392334	2	t
100	93	SpringSecurityUpgrade	SQL	V93__SpringSecurityUpgrade.sql	-2073740604	koreth	2022-10-25 10:51:42.396874	0	t
101	94	SpeciesProblems	SQL	V94__SpeciesProblems.sql	-1545974043	koreth	2022-10-25 10:51:42.399749	4	t
102	95	SpeciesInitialScientificName	SQL	V95__SpeciesInitialScientificName.sql	2097401976	koreth	2022-10-25 10:51:42.405891	1	t
103	96	SensorKitId	SQL	V96__SensorKitId.sql	1892738649	koreth	2022-10-25 10:51:42.409725	0	t
104	97	GbifNameWordsCollate	SQL	V97__GbifNameWordsCollate.sql	408472750	koreth	2022-10-25 10:51:42.412429	1	t
105	98	Automations	SQL	V98__Automations.sql	607049713	koreth	2022-10-25 10:51:42.416059	2	t
106	99	DevicesSettings	SQL	V99__DevicesSettings.sql	1740536141	koreth	2022-10-25 10:51:42.421201	1	t
107	100	GbifNamesName	SQL	V100__GbifNamesName.sql	-1780665553	koreth	2022-10-25 10:51:42.425002	0	t
108	101	DropAccessionNotifications	SQL	V101__DropAccessionNotifications.sql	1692637803	koreth	2022-10-25 10:51:42.427862	1	t
109	102	FacilityOrganization	SQL	V102__FacilityOrganization.sql	167838426	koreth	2022-10-25 10:51:42.43247	1	t
110	103	FacilityDropSiteId	SQL	V103__FacilityDropSiteId.sql	-890140307	koreth	2022-10-25 10:51:42.43644	0	t
111	104	DropProjectsSites	SQL	V104__DropProjectsSites.sql	-1400213821	koreth	2022-10-25 10:51:42.439151	3	t
112	105	ViabilityTests	SQL	V105__ViabilityTests.sql	-2069302574	koreth	2022-10-25 10:51:42.446019	4	t
113	106	DeleteAccessionNotifications	SQL	V106__DeleteAccessionNotifications.sql	685183150	koreth	2022-10-25 10:51:42.453344	1	t
114	107	Preferences	SQL	V107__Preferences.sql	-606191196	koreth	2022-10-25 10:51:42.456964	2	t
115	108	DropAccessionTestTypes	SQL	V108__DropAccessionTestTypes.sql	-1805241878	koreth	2022-10-25 10:51:42.461668	0	t
116	109	ViabilityTestSelections	SQL	V109__ViabilityTestSelections.sql	888028993	koreth	2022-10-25 10:51:42.464557	2	t
117	110	AccessionCollectors	SQL	V110__AccessionCollectors.sql	-1761147032	koreth	2022-10-25 10:51:42.468605	2	t
118	111	AccessionCollectorsBackfill	SQL	V111__AccessionCollectorsBackfill.sql	376372308	koreth	2022-10-25 10:51:42.472925	0	t
119	112	DropPrimarySecondaryCollectors	SQL	V112__DropPrimarySecondaryCollectors.sql	88268794	koreth	2022-10-25 10:51:42.475657	0	t
120	113	WithdrawalsPurposeNullable	SQL	V113__WithdrawalsPurposeNullable.sql	1148067332	koreth	2022-10-25 10:51:42.478708	0	t
121	114	AccessionStateHistoryUser	SQL	V114__AccessionStateHistoryUser.sql	-2062421326	koreth	2022-10-25 10:51:42.48123	0	t
122	115	AccessionStateHistoryBackfill	SQL	V115__AccessionStateHistoryBackfill.sql	-1120551655	koreth	2022-10-25 10:51:42.484219	1	t
123	116	AccessionsCascadeDeletes	SQL	V116__AccessionsCascadeDeletes.sql	-74242371	koreth	2022-10-25 10:51:42.487204	4	t
124	117	CollectionSite	SQL	V117__CollectionSite.sql	1522637551	koreth	2022-10-25 10:51:42.494072	1	t
125	118	CollectionSiteNotesBackfill	SQL	V118__CollectionSiteNotesBackfill.sql	-1863808066	koreth	2022-10-25 10:51:42.497435	0	t
126	119	AccessionsDropEnvironmentalNotes	SQL	V119__AccessionsDropEnvironmentalNotes.sql	-1219359449	koreth	2022-10-25 10:51:42.499966	0	t
127	120	CollectionSources	SQL	V120__CollectionSources.sql	-1274014434	koreth	2022-10-25 10:51:42.502465	1	t
128	121	DataSources	SQL	V121__DataSources.sql	444954382	koreth	2022-10-25 10:51:42.505957	1	t
129	122	DropAppDevices	SQL	V122__DropAppDevices.sql	32425996	koreth	2022-10-25 10:51:42.510092	2	t
130	123	AccessionsManualState	SQL	V123__AccessionsManualState.sql	-2081873608	koreth	2022-10-25 10:51:42.515979	1	t
131	124	DropViabilityTestSelections	SQL	V124__DropViabilityTestSelections.sql	110882304	koreth	2022-10-25 10:51:42.519669	1	t
132	125	AccessionQuantity	SQL	V125__AccessionQuantity.sql	1379426363	koreth	2022-10-25 10:51:42.524015	6	t
133	126	PhotosMetadataNullable	SQL	V126__PhotosMetadataNullable.sql	1878243261	koreth	2022-10-25 10:51:42.533541	1	t
134	127	DropPhotosMetadata	SQL	V127__DropPhotosMetadata.sql	-938619496	koreth	2022-10-25 10:51:42.537536	1	t
135	128	AccessionsEstimatedWeight	SQL	V128__AccessionsEstimatedWeight.sql	-1479052502	koreth	2022-10-25 10:51:42.542309	1	t
136	129	AppVersions	SQL	V129__AppVersions.sql	-774788054	koreth	2022-10-25 10:51:42.546702	2	t
137	130	WIthdrawalsCreatedBy	SQL	V130__WIthdrawalsCreatedBy.sql	1999339822	koreth	2022-10-25 10:51:42.551637	1	t
138	131	UsersDeletedTime	SQL	V131__UsersDeletedTime.sql	2089678073	koreth	2022-10-25 10:51:42.555975	1	t
139	132	OrganizationsCascadeDeletes	SQL	V132__OrganizationsCascadeDeletes.sql	-923301449	koreth	2022-10-25 10:51:42.559694	9	t
140	133	ValidateTimeseriesValues	SQL	V133__ValidateTimeseriesValues.sql	-1948613537	koreth	2022-10-25 10:51:42.57221	1	t
141	134	ViabilityTestsCut	SQL	V134__ViabilityTestsCut.sql	1403559516	koreth	2022-10-25 10:51:42.576172	2	t
142	135	DropAccessionSpeciesDetails	SQL	V135__DropAccessionSpeciesDetails.sql	685714510	koreth	2022-10-25 10:51:42.581345	2	t
143	136	DeleteCleaningState	SQL	V136__DeleteCleaningState.sql	1067859440	koreth	2022-10-25 10:51:42.586739	1	t
144	137	UploadsFacilityId	SQL	V137__UploadsFacilityId.sql	-1581707590	koreth	2022-10-25 10:51:42.591227	1	t
145	138	SeedbankSchema	SQL	V138__SeedbankSchema.sql	777075743	koreth	2022-10-25 10:51:42.595629	7	t
146	139	Nursery	SQL	V139__Nursery.sql	417989478	koreth	2022-10-25 10:51:42.605807	10	t
147	140	NurseryInventories	SQL	V140__NurseryInventories.sql	1511791578	koreth	2022-10-25 10:51:42.620148	1	t
148	141	NurseryBatchSummaries	SQL	V141__NurseryBatchSummaries.sql	-2045806909	koreth	2022-10-25 10:51:42.624475	1	t
149	142	NurseryBatchDeletion	SQL	V142__NurseryBatchDeletion.sql	-1369262807	koreth	2022-10-25 10:51:42.627365	3	t
150	143	NurseryWithdrawalNotes	SQL	V143__NurseryWithdrawalNotes.sql	-330775971	koreth	2022-10-25 10:51:42.633057	0	t
151	144	IdentifierSequences	SQL	V144__IdentifierSequences.sql	1074237902	koreth	2022-10-25 10:51:42.635726	1	t
152	145	IdentifierSequencesPerPrefix	SQL	V145__IdentifierSequencesPerPrefix.sql	-474647399	koreth	2022-10-25 10:51:42.639989	1	t
153	146	BackfillEstimatedWeight	SQL	V146__BackfillEstimatedWeight.sql	-188694572	koreth	2022-10-25 10:51:42.643982	0	t
154	147	BackfillEstimatedQuantity	SQL	V147__BackfillEstimatedQuantity.sql	-403788102	koreth	2022-10-25 10:51:42.646499	0	t
155	148	PrepareForV2Migration	SQL	V148__PrepareForV2Migration.sql	1855885543	koreth	2022-10-25 10:51:42.649207	1	t
156	\N	AppVersions	SQL	R__AppVersions.sql	485436501	koreth	2022-10-25 10:51:42.652463	0	t
157	\N	Comments	SQL	R__Comments.sql	2008764398	koreth	2022-10-25 10:51:42.655497	16	t
158	\N	Indexes	SQL	R__Indexes.sql	-959610943	koreth	2022-10-25 10:51:42.678093	6	t
159	\N	TypeCodes	SQL	R__TypeCodes.sql	-1576131079	koreth	2022-10-25 10:51:42.68708	7	t
160	149	NurseryBatchSummariesVersion	SQL	0100/V149__NurseryBatchSummariesVersion.sql	2114969874	postgres	2024-03-05 04:04:57.011712	68	t
161	150	DropViabilityTestsRemaining	SQL	0150/V150__DropViabilityTestsRemaining.sql	1998768259	postgres	2024-03-05 04:04:57.12824	20	t
162	151	DropWithdrawalsRemaining	SQL	0150/V151__DropWithdrawalsRemaining.sql	-1818435616	postgres	2024-03-05 04:04:57.165796	11	t
163	152	DropUnusedColumns	SQL	0150/V152__DropUnusedColumns.sql	1970588205	postgres	2024-03-05 04:04:57.192876	65	t
164	153	PlantingSites	SQL	0150/V153__PlantingSites.sql	1533933111	postgres	2024-03-05 04:04:57.346285	292	t
165	154	PlantingSiteSummaries	SQL	0150/V154__PlantingSiteSummaries.sql	1062750391	postgres	2024-03-05 04:04:57.655054	23	t
166	155	NurseryWithdrawalPhotos	SQL	0150/V155__NurseryWithdrawalPhotos.sql	-1577167834	postgres	2024-03-05 04:04:57.692905	45	t
167	156	SeedbankWithdrawalPurposes	SQL	0150/V156__SeedbankWithdrawalPurposes.sql	-1692740770	postgres	2024-03-05 04:04:57.749076	46	t
168	157	PlantingSitesSrid	SQL	0150/V157__PlantingSitesSrid.sql	856178320	postgres	2024-03-05 04:04:57.805575	176	t
169	158	WithdrawalPurposeFix	SQL	0150/V158__WithdrawalPurposeFix.sql	538955178	postgres	2024-03-05 04:04:58.083198	10	t
170	159	Deliveries	SQL	0150/V159__Deliveries.sql	-395729289	postgres	2024-03-05 04:04:58.10368	264	t
171	160	Populations	SQL	0150/V160__Populations.sql	1829667259	postgres	2024-03-05 04:04:58.380429	14	t
172	161	Reassignments	SQL	0150/V161__Reassignments.sql	924192665	postgres	2024-03-05 04:04:58.40466	15	t
173	162	NurseryWithdrawalSummaries	SQL	0150/V162__NurseryWithdrawalSummaries.sql	111966756	postgres	2024-03-05 04:04:58.42857	35	t
174	163	RemoveBlankStrings	SQL	0150/V163__RemoveBlankStrings.sql	1246904535	postgres	2024-03-05 04:04:58.474696	392	t
175	164	RemoveBlankCollectors	SQL	0150/V164__RemoveBlankCollectors.sql	-126389008	postgres	2024-03-05 04:04:58.887091	11	t
176	165	TimeZones	SQL	0150/V165__TimeZones.sql	-192211023	postgres	2024-03-05 04:04:58.908502	60	t
177	166	PlantingSiteSummariesTimeZone	SQL	0150/V166__PlantingSiteSummariesTimeZone.sql	925441484	postgres	2024-03-05 04:04:58.97931	8	t
178	167	FacilitiesNotificationDate	SQL	0150/V167__FacilitiesNotificationDate.sql	745320468	postgres	2024-03-05 04:04:58.997674	26	t
179	168	UsersLocale	SQL	0150/V168__UsersLocale.sql	-805749659	postgres	2024-03-05 04:04:59.06111	3	t
180	169	UploadsLocale	SQL	0150/V169__UploadsLocale.sql	-1658633924	postgres	2024-03-05 04:04:59.073667	9	t
181	170	EcosystemTypes	SQL	0150/V170__EcosystemTypes.sql	163502732	postgres	2024-03-05 04:04:59.091412	80	t
182	171	AccessionsTotalWithdrawn	SQL	0150/V171__AccessionsTotalWithdrawn.sql	1445228831	postgres	2024-03-05 04:04:59.180767	9	t
183	172	Unaccent	SQL	0150/V172__Unaccent.sql	-240536801	postgres	2024-03-05 04:04:59.199303	56	t
184	173	StorageLocationNames	SQL	0150/V173__StorageLocationNames.sql	559001583	postgres	2024-03-05 04:04:59.264568	20	t
185	174	DropStorageConditions	SQL	0150/V174__DropStorageConditions.sql	-1385444591	postgres	2024-03-05 04:04:59.294023	6	t
186	175	FacilityDates	SQL	0150/V175__FacilityDates.sql	-1459075891	postgres	2024-03-05 04:04:59.337248	6	t
187	176	Reports	SQL	0150/V176__Reports.sql	1653352554	postgres	2024-03-05 04:04:59.352516	172	t
188	177	Files	SQL	0150/V177__Files.sql	1050676096	postgres	2024-03-05 04:04:59.53664	8	t
189	178	ReportFiles	SQL	0150/V178__ReportFiles.sql	-940309893	postgres	2024-03-05 04:04:59.554769	45	t
190	179	InternalTags	SQL	0150/V179__InternalTags.sql	1705975617	postgres	2024-03-05 04:04:59.610243	93	t
191	180	SubzonesAndMonitoringPlots	SQL	0150/V180__SubzonesAndMonitoringPlots.sql	-1957162460	postgres	2024-03-05 04:04:59.718484	73	t
192	181	ReportStatusConstraint	SQL	0150/V181__ReportStatusConstraint.sql	2110847551	postgres	2024-03-05 04:04:59.802681	11	t
193	182	Wgs84Geometry	SQL	0150/V182__Wgs84Geometry.sql	1037582015	postgres	2024-03-05 04:04:59.822363	20	t
194	183	MonitoringPlotBoundary	SQL	0150/V183__MonitoringPlotBoundary.sql	1495930303	postgres	2024-03-05 04:04:59.849697	162	t
195	184	MonitoringPlotPolygon	SQL	0150/V184__MonitoringPlotPolygon.sql	1805330573	postgres	2024-03-05 04:05:00.035888	16	t
196	185	MonitoringPlotPermanentCluster	SQL	0150/V185__MonitoringPlotPermanentCluster.sql	-1307275145	postgres	2024-03-05 04:05:00.061223	9	t
197	186	PlantingZonePlots	SQL	0150/V186__PlantingZonePlots.sql	945181213	postgres	2024-03-05 04:05:00.079139	4	t
198	187	PlantingSiteDates	SQL	0150/V187__PlantingSiteDates.sql	-1681382150	postgres	2024-03-05 04:05:00.092058	9	t
199	188	PlantingSiteAreas	SQL	0150/V188__PlantingSiteAreas.sql	-1584118440	postgres	2024-03-05 04:05:00.109643	33	t
200	189	Observations	SQL	0150/V189__Observations.sql	595481355	postgres	2024-03-05 04:05:00.152918	533	t
201	190	DefaultVarianceAndError	SQL	0150/V190__DefaultVarianceAndError.sql	1972227032	postgres	2024-03-05 04:05:00.699347	31	t
202	191	ObservationState	SQL	0150/V191__ObservationState.sql	1079299299	postgres	2024-03-05 04:05:00.740661	74	t
203	192	PlantingZoneDensity	SQL	0150/V192__PlantingZoneDensity.sql	-2140510337	postgres	2024-03-05 04:05:00.824712	6	t
204	193	ObservedSpeciesTotals	SQL	0150/V193__ObservedSpeciesTotals.sql	-1007174154	postgres	2024-03-05 04:05:00.840213	204	t
205	194	FinishedPlanting	SQL	0150/V194__FinishedPlanting.sql	754887094	postgres	2024-03-05 04:05:01.053938	3	t
206	195	UnknownSpeciesTotals	SQL	0150/V195__UnknownSpeciesTotals.sql	1596665190	postgres	2024-03-05 04:05:01.065253	390	t
207	196	DropTotalObservedPlants	SQL	0150/V196__DropTotalObservedPlants.sql	1537654667	postgres	2024-03-05 04:05:01.567933	10	t
208	197	SubzoneFinishedTime	SQL	0150/V197__SubzoneFinishedTime.sql	-1459599549	postgres	2024-03-05 04:05:01.590261	7	t
209	199	Populations	SQL	0150/V199__Populations.sql	-385569924	postgres	2024-03-05 04:05:01.606667	91	t
210	200	BackfillPopulations	SQL	0200/V200__BackfillPopulations.sql	1775148370	postgres	2024-03-05 04:05:01.707571	30	t
211	201	PlantingCompletedTime	SQL	0200/V201__PlantingCompletedTime.sql	985549422	postgres	2024-03-05 04:05:01.745252	2	t
212	202	ObservationNotifications	SQL	0200/V202__ObservationNotifications.sql	918204601	postgres	2024-03-05 04:05:01.756677	3	t
213	203	ObservationCumulativeDead	SQL	0200/V203__ObservationCumulativeDead.sql	-1273403474	postgres	2024-03-05 04:05:01.767398	14	t
214	204	ConservationCategory	SQL	0200/V204__ConservationCategory.sql	1491259132	postgres	2024-03-05 04:05:01.790202	53	t
215	205	BackfillConservationCategory	SQL	0200/V205__BackfillConservationCategory.sql	-147518582	postgres	2024-03-05 04:05:01.852516	4	t
216	206	DropEndangered	SQL	0200/V206__DropEndangered.sql	1594449609	postgres	2024-03-05 04:05:01.864872	3	t
217	207	UserCountry	SQL	0200/V207__UserCountry.sql	863810441	postgres	2024-03-05 04:05:01.876688	11	t
218	208	Projects	SQL	0200/V208__Projects.sql	2132532652	postgres	2024-03-05 04:05:01.895999	148	t
219	209	TerraformationContact	SQL	0200/V209__TerraformationContact.sql	-1274921487	postgres	2024-03-05 04:05:02.054197	14	t
220	210	ScheduleObservationNotifications	SQL	0200/V210__ScheduleObservationNotifications.sql	-813804586	postgres	2024-03-05 04:05:02.077461	3	t
221	211	ObservationNotScheduledNotifications	SQL	0200/V211__ObservationNotScheduledNotifications.sql	-455594768	postgres	2024-03-05 04:05:02.089962	6	t
222	212	MonitoringPlotAvailable	SQL	0200/V212__MonitoringPlotAvailable.sql	282120586	postgres	2024-03-05 04:05:02.10394	3	t
223	213	FacilityNumber	SQL	0200/V213__FacilityNumber.sql	1103573464	postgres	2024-03-05 04:05:02.116208	39	t
224	214	SubLocations	SQL	0200/V214__SubLocations.sql	-2093746125	postgres	2024-03-05 04:05:02.164232	7	t
225	215	ObservedPlotCoordinates	SQL	0200/V215__ObservedPlotCoordinates.sql	-1041839280	postgres	2024-03-05 04:05:02.180318	71	t
226	216	FacilityNumberInIdentifiers	SQL	0200/V216__FacilityNumberInIdentifiers.sql	-1530268773	postgres	2024-03-05 04:05:02.261869	20	t
227	217	BatchSubLocations	SQL	0200/V217__BatchSubLocations.sql	40389429	postgres	2024-03-05 04:05:02.288969	79	t
228	218	SeedTreatments	SQL	0200/V218__SeedTreatments.sql	497376700	postgres	2024-03-05 04:05:02.377671	4	t
229	219	BatchesAttributes	SQL	0200/V219__BatchesAttributes.sql	840604186	postgres	2024-03-05 04:05:02.390511	73	t
230	220	InitialBatchId	SQL	0200/V220__InitialBatchId.sql	1466064176	postgres	2024-03-05 04:05:02.473123	29	t
231	221	BatchDetailsHistory	SQL	0200/V221__BatchDetailsHistory.sql	-649795445	postgres	2024-03-05 04:05:02.513024	256	t
232	222	FacilityInventoryTotals	SQL	0200/V222__FacilityInventoryTotals.sql	1607760113	postgres	2024-03-05 04:05:02.780801	21	t
233	223	BatchPhotos	SQL	0200/V223__BatchPhotos.sql	-229207314	postgres	2024-03-05 04:05:02.813713	81	t
234	224	BatchRateTotals	SQL	0200/V224__BatchRateTotals.sql	-2034501861	postgres	2024-03-05 04:05:02.918916	7	t
235	225	PlantingSiteNotifications	SQL	0200/V225__PlantingSiteNotifications.sql	1765909900	postgres	2024-03-05 04:05:02.941216	84	t
236	226	OrganizationTypes	SQL	0200/V226__OrganizationTypes.sql	87531126	postgres	2024-03-05 04:05:03.048509	180	t
237	227	PlantingSeasons	SQL	0200/V227__PlantingSeasons.sql	-72514797	postgres	2024-03-05 04:05:03.243025	128	t
238	228	DropPlantingSeasonMonths	SQL	0200/V228__DropPlantingSeasonMonths.sql	-1082616742	postgres	2024-03-05 04:05:03.388793	9	t
239	229	AccessionRemainingQuantityNotes	SQL	0200/V229__AccessionRemainingQuantityNotes.sql	972797729	postgres	2024-03-05 04:05:03.409473	4	t
240	230	ReportSettings	SQL	0200/V230__ReportSettings.sql	-2089235104	postgres	2024-03-05 04:05:03.425202	74	t
241	231	ReportProjects	SQL	0200/V231__ReportProjects.sql	107620146	postgres	2024-03-05 04:05:03.514744	66	t
242	232	GlobalRoles	SQL	0200/V232__GlobalRoles.sql	1694826585	postgres	2024-03-05 04:05:03.612248	125	t
243	233	DropSuperAdminType	SQL	0200/V233__DropSuperAdminType.sql	-2033074591	postgres	2024-03-05 04:05:03.755959	39	t
244	234	NurserySpeciesProjects	SQL	0200/V234__NurserySpeciesProjects.sql	414474146	postgres	2024-03-05 04:05:03.813044	13	t
245	235	Participants	SQL	0200/V235__Participants.sql	1735301922	postgres	2024-03-05 04:05:03.84159	162	t
246	236	PlantingSiteExclusion	SQL	0200/V236__PlantingSiteExclusion.sql	-877320823	postgres	2024-03-05 04:05:04.022217	27	t
247	237	PlantingZoneClusterCount	SQL	0200/V237__PlantingZoneClusterCount.sql	909487789	postgres	2024-03-05 04:05:04.063139	5	t
248	238	PlantingSiteGridOrigin	SQL	0200/V238__PlantingSiteGridOrigin.sql	-982661371	postgres	2024-03-05 04:05:04.081064	22	t
249	239	SeedbankWithdrawalsBatchId	SQL	0200/V239__SeedbankWithdrawalsBatchId.sql	1404410841	postgres	2024-03-05 04:05:04.114803	7	t
250	240	BackfillSeedbankWithdrawalsBatchId	SQL	0200/V240__BackfillSeedbankWithdrawalsBatchId.sql	859769854	postgres	2024-03-05 04:05:04.136382	23	t
251	241	WithdrawalsBatchIdIndex	SQL	0200/V241__WithdrawalsBatchIdIndex.sql	-1740150254	postgres	2024-03-05 04:05:04.172147	39	t
252	242	PlantingSiteDrafts	SQL	0200/V242__PlantingSiteDrafts.sql	1145039505	postgres	2024-03-05 04:05:04.229345	173	t
253	243	Cohorts	SQL	0200/V243__Cohorts.sql	-517551038	postgres	2024-03-05 04:05:04.417195	246	t
254	244	BackfillSeedbankWithdrawalsBatchId	SQL	0200/V244__BackfillSeedbankWithdrawalsBatchId.sql	859769854	postgres	2024-03-05 04:05:04.679638	13	t
255	245	AcceleratorSchema	SQL	0200/V245__AcceleratorSchema.sql	1476926350	postgres	2024-03-05 04:05:04.704316	18	t
256	246	ModulesDeliverables	SQL	0200/V246__ModulesDeliverables.sql	-1528776609	postgres	2024-03-05 04:05:04.744128	849	t
257	247	DeliverableTweaks	SQL	0200/V247__DeliverableTweaks.sql	1209654370	postgres	2024-03-05 04:05:05.628792	26	t
258	\N	Comments	SQL	R__Comments.sql	109299174	postgres	2024-03-05 04:05:05.670462	246	t
259	\N	Indexes	SQL	R__Indexes.sql	-1152892924	postgres	2024-03-05 04:05:05.945343	55	t
260	\N	TypeCodes	SQL	R__TypeCodes.sql	-280885638	postgres	2024-03-05 04:05:06.018624	526	t
261	\N	TypeCodes	SQL	R__TypeCodes.sql	-154030235	postgres	2024-03-06 18:50:30.666306	209	t
262	248	ProjectDocumentSettings	SQL	0200/V248__ProjectDocumentSettings.sql	2056927721	postgres	2024-06-11 21:50:38.308303	56	t
263	249	SubmissionDocumentNames	SQL	0200/V249__SubmissionDocumentNames.sql	-432466393	postgres	2024-06-11 21:50:38.397728	32	t
264	250	ProjectVoting	SQL	0250/V250__ProjectVoting.sql	1332034600	postgres	2024-06-11 21:50:38.440623	26	t
265	251	ProjectScores	SQL	0250/V251__ProjectScores.sql	-44963244	postgres	2024-06-11 21:50:38.477485	24	t
266	252	ProjectVotesDecisions	SQL	0250/V252__ProjectVotesDecisions.sql	1032602255	postgres	2024-06-11 21:50:38.516755	9	t
267	253	DefaultVoters	SQL	0250/V253__DefaultVoters.sql	449634749	postgres	2024-06-11 21:50:38.536299	10	t
268	254	Regions	SQL	0250/V254__Regions.sql	981926831	postgres	2024-06-11 21:50:38.553938	34	t
269	255	ProjectAcceleratorDetails	SQL	0250/V255__ProjectAcceleratorDetails.sql	870557545	postgres	2024-06-11 21:50:38.597527	53	t
270	256	NewAcceleratorFields	SQL	0250/V256__NewAcceleratorFields.sql	-451417368	postgres	2024-06-11 21:50:38.658365	1	t
271	257	ProjectAbbreviatedName	SQL	0250/V257__ProjectAbbreviatedName.sql	-598785324	postgres	2024-06-11 21:50:38.66541	1	t
272	258	DropProjectDocumentSettings	SQL	0250/V258__DropProjectDocumentSettings.sql	-455223794	postgres	2024-06-11 21:50:38.673139	45	t
273	259	UndoWithdrawals	SQL	0250/V259__UndoWithdrawals.sql	982858632	postgres	2024-06-11 21:50:38.739034	82	t
274	260	Modules	SQL	0250/V260__Modules.sql	1495720607	postgres	2024-06-11 21:50:38.837227	114	t
275	261	WithdrawalUndoDates	SQL	0250/V261__WithdrawalUndoDates.sql	1758024122	postgres	2024-06-11 21:50:38.973718	12	t
276	262	ModuleDatesConstraints	SQL	0250/V262__ModuleDatesConstraints.sql	-545973410	postgres	2024-06-11 21:50:39.003253	90	t
277	263	DeleteUnusedPlots	SQL	0250/V263__DeleteUnusedPlots.sql	1725673071	postgres	2024-06-11 21:50:39.112129	226	t
278	264	EventRevision	SQL	0250/V264__EventRevision.sql	-1718307224	postgres	2024-06-11 21:50:39.350052	3	t
279	265	SpeciesGrowthForm	SQL	0250/V265__SpeciesGrowthForm.sql	-683031217	postgres	2024-06-11 21:50:39.359245	14	t
280	266	NewSpeciesEnumSetFields	SQL	0250/V266__NewSpeciesEnumSetFields.sql	-1831168171	postgres	2024-06-11 21:50:39.378703	25	t
281	267	CohortModulePrimaryKey	SQL	0250/V267__CohortModulePrimaryKey.sql	-68293831	postgres	2024-06-11 21:50:39.410266	12	t
282	268	CohortModuleTitle	SQL	0250/V268__CohortModuleTitle.sql	-1702487287	postgres	2024-06-11 21:50:39.43218	9	t
283	269	EventStatus	SQL	0250/V269__EventStatus.sql	-1771092897	postgres	2024-06-11 21:50:39.447439	10	t
284	270	NewSpeciesFields	SQL	0250/V270__NewSpeciesFields.sql	721937189	postgres	2024-06-11 21:50:39.463981	11	t
285	271	EventStatusColumn	SQL	0250/V271__EventStatusColumn.sql	-1628758470	postgres	2024-06-11 21:50:39.483078	4	t
286	272	PlantingSiteHistory	SQL	0250/V272__PlantingSiteHistory.sql	1943122553	postgres	2024-06-11 21:50:39.498878	61	t
287	273	ParticipantProjectSpecies	SQL	0250/V273__ParticipantProjectSpecies.sql	1735461738	postgres	2024-06-11 21:50:39.566409	10	t
288	274	BackfillPlantingSiteHistories	SQL	0250/V274__BackfillPlantingSiteHistories.sql	-2132470303	postgres	2024-06-11 21:50:39.582957	16	t
289	275	ProjectDeliverablesView	SQL	0250/V275__ProjectDeliverablesView.sql	1112331889	postgres	2024-06-11 21:50:39.60457	4	t
290	276	NewParticipantProjectSpeciesFields	SQL	0250/V276__NewParticipantProjectSpeciesFields.sql	1085785283	postgres	2024-06-11 21:50:39.614163	7	t
291	277	DeliverableDueDates	SQL	0250/V277__DeliverableDueDates.sql	1944635305	postgres	2024-06-11 21:50:39.635641	14	t
292	278	NewParticipantProjectSpeciesFields	SQL	0250/V278__NewParticipantProjectSpeciesFields.sql	-1296732562	postgres	2024-06-11 21:50:39.656097	8	t
293	279	SubmissionSnapshots	SQL	0250/V279__SubmissionSnapshots.sql	967790365	postgres	2024-06-11 21:50:39.669048	8	t
294	280	TimeZones	SQL	0250/V280__TimeZones.sql	-982610229	postgres	2024-06-11 21:50:39.681432	5	t
295	281	UsersCookiesConsented	SQL	0250/V281__UsersCookiesConsented.sql	757433398	postgres	2024-06-11 21:50:39.69478	1	t
296	\N	Comments	SQL	R__Comments.sql	114638363	postgres	2024-06-11 21:50:39.700078	54	t
297	\N	Countries	SQL	R__Countries.sql	-778652569	postgres	2024-06-11 21:50:39.79532	10	t
298	\N	TypeCodes	SQL	R__TypeCodes.sql	578191174	postgres	2024-06-11 21:50:39.820851	59	t
\.


--
-- Data for Name: gbif_distributions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gbif_distributions (taxon_id, country_code, establishment_means, occurrence_status, threat_status) FROM stdin;
\.


--
-- Data for Name: gbif_name_words; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gbif_name_words (gbif_name_id, word) FROM stdin;
\.


--
-- Data for Name: gbif_names; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gbif_names (id, taxon_id, name, language, is_scientific) FROM stdin;
\.


--
-- Data for Name: gbif_taxa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gbif_taxa (taxon_id, dataset_id, parent_name_usage_id, accepted_name_usage_id, original_name_usage_id, scientific_name, canonical_name, generic_name, specific_epithet, infraspecific_epithet, taxon_rank, taxonomic_status, nomenclatural_status, phylum, class, "order", family, genus) FROM stdin;
\.


--
-- Data for Name: gbif_vernacular_names; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gbif_vernacular_names (taxon_id, vernacular_name, language, country_code) FROM stdin;
\.


--
-- Data for Name: global_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.global_roles (id, name) FROM stdin;
1	Super-Admin
2	Accelerator Admin
3	TF Expert
4	Read Only
\.


--
-- Data for Name: growth_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.growth_forms (id, name) FROM stdin;
1	Tree
2	Shrub
3	Forb
4	Graminoid
5	Fern
6	Fungus
7	Lichen
8	Moss
9	Vine
10	Liana
11	Shrub/Tree
12	Subshrub
13	Multiple Forms
14	Mangrove
15	Herb
\.


--
-- Data for Name: identifier_sequences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.identifier_sequences (organization_id, prefix, next_value) FROM stdin;
\.


--
-- Data for Name: internal_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.internal_tags (id, name, description, is_system, created_by, created_time, modified_by, modified_time) FROM stdin;
1	Reporter	Organization must submit reports to Terraformation.	t	2	2024-03-05 04:05:06.02364+00	2	2024-03-05 04:05:06.02364+00
2	Internal	Terraformation-managed internal organization, not a customer.	t	2	2024-03-05 04:05:06.02364+00	2	2024-03-05 04:05:06.02364+00
3	Testing	Used for internal testing; may contain invalid data.	t	2	2024-03-05 04:05:06.02364+00	2	2024-03-05 04:05:06.02364+00
4	Accelerator	Organization is an accelerator participant.	t	2	2024-03-05 04:05:06.02364+00	2	2024-03-05 04:05:06.02364+00
\.


--
-- Data for Name: jobrunr_backgroundjobservers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_backgroundjobservers (id, workerpoolsize, pollintervalinseconds, firstheartbeat, lastheartbeat, running, systemtotalmemory, systemfreememory, systemcpuload, processmaxmemory, processfreememory, processallocatedmemory, processcpuload, deletesucceededjobsafter, permanentlydeletejobsafter, name) FROM stdin;
ae600158-5ec5-4cb8-9284-62479154888f	160	15	2024-06-11 21:50:43.472363	2024-06-11 22:50:03.652626	1	8221683712	5272993792	0.01	2057306112	1859678216	197627896	0.01	PT36H	PT72H	c839ed6df710
\.


--
-- Data for Name: jobrunr_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_jobs (id, version, jobasjson, jobsignature, state, createdat, updatedat, scheduledat, recurringjobid) FROM stdin;
01900953-3102-785f-99eb-e5e122fbf098	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900953-3102-785f-99eb-e5e122fbf098","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:02:45.377645588Z","scheduledAt":"2024-06-11T22:03:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:02:45.396805588Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:03:00.203435636Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:03:00.203435636Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:03:00.219951678Z","latencyDuration":14.806630048,"processDuration":0.016498417}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:02:45.377646	2024-06-11 22:03:00.219952	\N	FacilityService.scanForIdleFacilities
01900954-1b9d-781c-b8a9-c5e257aae26a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900954-1b9d-781c-b8a9-c5e257aae26a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:03:45.436940879Z","scheduledAt":"2024-06-11T22:04:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:03:45.479988921Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:04:00.247394220Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:04:00.247394220Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:04:00.260413636Z","latencyDuration":14.767405299,"processDuration":0.013010041}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:03:45.436941	2024-06-11 22:04:00.260414	\N	FacilityService.scanForIdleFacilities
01900955-0662-7ec9-818c-d54c390484af	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900955-0662-7ec9-818c-d54c390484af","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:04:45.538283129Z","scheduledAt":"2024-06-11T22:05:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:04:45.558313171Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:05:00.290553345Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:05:00.290553345Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:05:00.311695636Z","latencyDuration":14.732240174,"processDuration":0.021123958}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:04:45.538283	2024-06-11 22:05:00.311696	\N	FacilityService.scanForIdleFacilities
01900956-db94-7c8b-aa84-63aa939ac4bf	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900956-db94-7c8b-aa84-63aa939ac4bf","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:06:45.652133088Z","scheduledAt":"2024-06-11T22:07:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:06:45.666407463Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:07:00.392659553Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:07:00.392659553Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:07:00.433743470Z","latencyDuration":14.726252090,"processDuration":0.041063167}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:06:45.652133	2024-06-11 22:07:00.433743	\N	FacilityService.scanForIdleFacilities
01900955-f103-767e-a491-aa569b54a8cd	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900955-f103-767e-a491-aa569b54a8cd","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:05:45.602991129Z","scheduledAt":"2024-06-11T22:06:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:05:45.620260504Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:06:00.344118261Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:06:00.344118261Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:06:00.364761845Z","latencyDuration":14.723857757,"processDuration":0.020620750}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:05:45.602991	2024-06-11 22:06:00.364762	\N	FacilityService.scanForIdleFacilities
0190095e-30e3-7e9e-b2d3-337ecd04b262	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"0190095e-30e3-7e9e-b2d3-337ecd04b262","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:14:46.243924755Z","scheduledAt":"2024-06-11T22:15:00Z","recurringJobId":"ObservationScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.ObservationScheduler.transitionObservations()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:14:46.278670671Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:15:00.873507887Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:15:00.873507887Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:15:01.008071262Z","latencyDuration":14.594837216,"processDuration":0.134562083}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"ObservationScheduler"}	com.terraformation.backend.daily.ObservationScheduler.transitionObservations()	SUCCEEDED	2024-06-11 22:14:46.243925	2024-06-11 22:15:01.008071	\N	ObservationScheduler
01900950-7131-78ac-a8d6-bfa4b5752782	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900950-7131-78ac-a8d6-bfa4b5752782","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:59:45.201327796Z","scheduledAt":"2024-06-11T22:00:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:59:45.221435379Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:00:00.022705970Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:00:00.022705970Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:00:00.040394761Z","latencyDuration":14.801270591,"processDuration":0.017674416}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:59:45.201328	2024-06-11 22:00:00.040395	\N	FacilityService.scanForIdleFacilities
01900950-7134-72e7-9efc-a385ae7ad959	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"01900950-7134-72e7-9efc-a385ae7ad959","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:59:45.204427587Z","scheduledAt":"2024-06-11T22:00:00Z","recurringJobId":"NotificationScanner","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.NotificationScanner.sendNotifications()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:59:45.221452754Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:00:00.022720470Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:00:00.022720470Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:00:00.226108386Z","latencyDuration":14.801267716,"processDuration":0.203386500}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"NotificationScanner"}	com.terraformation.backend.daily.NotificationScanner.sendNotifications()	SUCCEEDED	2024-06-11 21:59:45.204428	2024-06-11 22:00:00.226108	\N	NotificationScanner
01900957-c636-74bc-8c2a-f45a31b981f5	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900957-c636-74bc-8c2a-f45a31b981f5","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:07:45.717630004Z","scheduledAt":"2024-06-11T22:08:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:07:45.767563296Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:08:00.449582928Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:08:00.449582928Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:08:00.483092428Z","latencyDuration":14.682019632,"processDuration":0.033484000}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:07:45.71763	2024-06-11 22:08:00.483092	\N	FacilityService.scanForIdleFacilities
01900958-b104-7cdd-a833-bb100ed5d678	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900958-b104-7cdd-a833-bb100ed5d678","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:08:45.828159338Z","scheduledAt":"2024-06-11T22:09:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:08:45.849757504Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:09:00.490274886Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:09:00.490274886Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:09:00.500107178Z","latencyDuration":14.640517382,"processDuration":0.009819959}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:08:45.828159	2024-06-11 22:09:00.500107	\N	FacilityService.scanForIdleFacilities
01900959-9bb4-7480-8b19-d8891a2c0c51	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900959-9bb4-7480-8b19-d8891a2c0c51","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:09:45.908288254Z","scheduledAt":"2024-06-11T22:10:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:09:45.923821296Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:10:00.519956720Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:10:00.519956720Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:10:00.532776845Z","latencyDuration":14.596135424,"processDuration":0.012808875}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:09:45.908288	2024-06-11 22:10:00.532777	\N	FacilityService.scanForIdleFacilities
01900961-db5b-7e1a-b0a1-669a07156b6b	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900961-db5b-7e1a-b0a1-669a07156b6b","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:18:46.490686046Z","scheduledAt":"2024-06-11T22:19:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:18:46.517951546Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:19:01.119434012Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:19:01.119434012Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:19:01.131894470Z","latencyDuration":14.601482466,"processDuration":0.012448708}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:18:46.490686	2024-06-11 22:19:01.131894	\N	FacilityService.scanForIdleFacilities
0190095a-8650-7cfd-b953-f94202235b2b	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190095a-8650-7cfd-b953-f94202235b2b","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:10:45.968199046Z","scheduledAt":"2024-06-11T22:11:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:10:45.990842671Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:11:00.622610845Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:11:00.622610845Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:11:00.639456678Z","latencyDuration":14.631768174,"processDuration":0.016822041}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:10:45.968199	2024-06-11 22:11:00.639457	\N	FacilityService.scanForIdleFacilities
01900972-5af5-7f61-b999-374f7498a38a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900972-5af5-7f61-b999-374f7498a38a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:36:47.732212922Z","scheduledAt":"2024-06-11T22:37:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:36:47.755383797Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:37:02.294549179Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:37:02.294549179Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:37:02.347921679Z","latencyDuration":14.539165382,"processDuration":0.053358291}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:36:47.732213	2024-06-11 22:37:02.347922	\N	FacilityService.scanForIdleFacilities
0190095f-1b86-75fb-82f6-c7084af5a743	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190095f-1b86-75fb-82f6-c7084af5a743","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:15:46.309907005Z","scheduledAt":"2024-06-11T22:16:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:15:46.349879755Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:16:00.946161845Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:16:00.946161845Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:16:00.983999387Z","latencyDuration":14.596282090,"processDuration":0.037812333}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:15:46.309907	2024-06-11 22:16:00.983999	\N	FacilityService.scanForIdleFacilities
b19bd79f-7259-49d2-b556-43cf3059a567	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"b19bd79f-7259-49d2-b556-43cf3059a567","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:51:49.543495628Z","scheduledAt":"2024-03-06T18:52:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:51:49.590519920Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:51:49.609688545Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:51:49.609688545Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:51:49.658282962Z","latencyDuration":0.019168625,"processDuration":0.048591250},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.756793546Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:51:49.543496	2024-06-11 21:51:44.756794	\N	FacilityService.scanForIdleFacilities
e49ae8e1-5ea0-44df-8752-5eb763d59bf1	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"e49ae8e1-5ea0-44df-8752-5eb763d59bf1","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:52:49.732717045Z","scheduledAt":"2024-03-06T18:53:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:52:49.751239170Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:52:49.765612379Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:52:49.765612379Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:52:49.773783254Z","latencyDuration":0.014373209,"processDuration":0.008169166},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757248754Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:52:49.732717	2024-06-11 21:51:44.757249	\N	FacilityService.scanForIdleFacilities
5ed2847c-c294-4e1e-8b09-0c418bc87965	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"5ed2847c-c294-4e1e-8b09-0c418bc87965","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:53:49.899381420Z","scheduledAt":"2024-03-06T18:54:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:53:49.942237045Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:53:49.953472337Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:53:49.953472337Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:53:49.966461254Z","latencyDuration":0.011235292,"processDuration":0.012987333},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757255879Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:53:49.899381	2024-06-11 21:51:44.757256	\N	FacilityService.scanForIdleFacilities
2a43d872-a46d-43fd-a7c6-6b8287b182d8	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"2a43d872-a46d-43fd-a7c6-6b8287b182d8","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:54:50.050499129Z","scheduledAt":"2024-03-06T18:55:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:54:50.082617754Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:54:50.096893170Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:54:50.096893170Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:54:50.107034629Z","latencyDuration":0.014275416,"processDuration":0.010139834},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757258337Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:54:50.050499	2024-06-11 21:51:44.757258	\N	FacilityService.scanForIdleFacilities
eff88685-fcd0-4f97-aba8-bc7ca7f1a186	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"eff88685-fcd0-4f97-aba8-bc7ca7f1a186","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:55:50.271214462Z","scheduledAt":"2024-03-06T18:56:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:55:50.296840087Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:55:50.309711920Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:55:50.309711920Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:55:50.323264212Z","latencyDuration":0.012871833,"processDuration":0.013550875},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757260546Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:55:50.271214	2024-06-11 21:51:44.757261	\N	FacilityService.scanForIdleFacilities
1ea2cf9d-2c00-4352-bb70-ff5ad2d994bb	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"1ea2cf9d-2c00-4352-bb70-ff5ad2d994bb","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:56:50.405684295Z","scheduledAt":"2024-03-06T18:57:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:56:50.443357670Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:56:50.461559920Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:56:50.461559920Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:56:50.482509004Z","latencyDuration":0.018202250,"processDuration":0.020946709},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757262712Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:56:50.405684	2024-06-11 21:51:44.757263	\N	FacilityService.scanForIdleFacilities
96f8c575-7829-43ba-8c87-137ec81e6567	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"96f8c575-7829-43ba-8c87-137ec81e6567","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:57:50.602268421Z","scheduledAt":"2024-03-06T18:58:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:57:50.654586796Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:57:50.671300671Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:57:50.671300671Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:57:50.683234296Z","latencyDuration":0.016713875,"processDuration":0.011932416},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757264921Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:57:50.602268	2024-06-11 21:51:44.757265	\N	FacilityService.scanForIdleFacilities
88108e87-30e5-4b00-a8eb-929d24ce3341	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"88108e87-30e5-4b00-a8eb-929d24ce3341","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:58:50.789459671Z","scheduledAt":"2024-03-06T18:59:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:58:50.826320462Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:58:50.842222254Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:58:50.842222254Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:58:50.851963879Z","latencyDuration":0.015901792,"processDuration":0.009740625},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757267046Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:58:50.78946	2024-06-11 21:51:44.757267	\N	FacilityService.scanForIdleFacilities
ac8d4149-e1e3-4122-bc5c-a5543534b262	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"ac8d4149-e1e3-4122-bc5c-a5543534b262","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:59:50.951820129Z","scheduledAt":"2024-03-06T19:00:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:59:51.002509921Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:59:51.030502587Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:59:51.030502587Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:59:51.046889379Z","latencyDuration":0.027992666,"processDuration":0.016385459},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757269212Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 18:59:50.95182	2024-06-11 21:51:44.757269	\N	FacilityService.scanForIdleFacilities
844e3f70-7367-4c47-9ecb-2a1cf0b0dfef	5	{"version":5,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"844e3f70-7367-4c47-9ecb-2a1cf0b0dfef","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:59:50.971714337Z","scheduledAt":"2024-03-06T19:00:00Z","recurringJobId":"ObservationScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.ObservationScheduler.transitionObservations()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:59:51.002515837Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:59:51.056286879Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:59:51.056286879Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:59:51.309117129Z","latencyDuration":0.053771042,"processDuration":0.252828542},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757271337Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"ObservationScheduler"}	com.terraformation.backend.daily.ObservationScheduler.transitionObservations()	DELETED	2024-03-06 18:59:50.971714	2024-06-11 21:51:44.757271	\N	ObservationScheduler
7732764b-f467-4a75-8ee8-01f2e4190f5e	5	{"version":5,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"7732764b-f467-4a75-8ee8-01f2e4190f5e","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:59:50.968565129Z","scheduledAt":"2024-03-06T19:00:00Z","recurringJobId":"NotificationScanner","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.NotificationScanner.sendNotifications()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:59:51.002515046Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:59:51.030491671Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:59:51.030491671Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:59:51.334244963Z","latencyDuration":0.027976625,"processDuration":0.303751750},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757273379Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"NotificationScanner"}	com.terraformation.backend.daily.NotificationScanner.sendNotifications()	DELETED	2024-03-06 18:59:50.968565	2024-06-11 21:51:44.757273	\N	NotificationScanner
aad30fad-a744-4953-b38b-714be8d5b8c5	5	{"version":5,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"aad30fad-a744-4953-b38b-714be8d5b8c5","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T18:59:50.974134129Z","scheduledAt":"2024-03-06T19:00:00Z","recurringJobId":"PlantingSeasonScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T18:59:51.002516462Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T18:59:51.056407087Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T18:59:51.056407087Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T18:59:51.488864254Z","latencyDuration":0.053890625,"processDuration":0.432455792},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757275587Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"PlantingSeasonScheduler"}	com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()	DELETED	2024-03-06 18:59:50.974134	2024-06-11 21:51:44.757276	\N	PlantingSeasonScheduler
60b18ae8-afa0-464f-b834-b370c1552fae	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"60b18ae8-afa0-464f-b834-b370c1552fae","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T19:00:51.137570254Z","scheduledAt":"2024-03-06T19:01:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T19:00:51.176764296Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T19:00:51.190480462Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T19:00:51.190480462Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T19:00:51.219711879Z","latencyDuration":0.013716166,"processDuration":0.029230000},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757277754Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 19:00:51.13757	2024-06-11 21:51:44.757278	\N	FacilityService.scanForIdleFacilities
99eb660a-b1a5-4092-8c37-43ff40890b6b	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"99eb660a-b1a5-4092-8c37-43ff40890b6b","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T19:01:51.294560629Z","scheduledAt":"2024-03-06T19:02:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T19:01:51.336546962Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T19:01:51.348529754Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T19:01:51.348529754Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T19:01:51.380443088Z","latencyDuration":0.011982792,"processDuration":0.031912250},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757279879Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 19:01:51.294561	2024-06-11 21:51:44.75728	\N	FacilityService.scanForIdleFacilities
94f1199a-235d-43ec-81d6-9ec09030d964	5	{"version":5,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"94f1199a-235d-43ec-81d6-9ec09030d964","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-06T19:02:51.474623838Z","scheduledAt":"2024-03-06T19:03:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-06T19:02:51.521167838Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-06T19:02:51.533145046Z","serverId":"ec489033-b434-4f14-8f08-eefe8f2dac34","serverName":"a832224d98d0","updatedAt":"2024-03-06T19:02:51.533145046Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-06T19:02:51.552681129Z","latencyDuration":0.011977208,"processDuration":0.019534250},{"@class":"org.jobrunr.jobs.states.DeletedState","state":"DELETED","createdAt":"2024-06-11T21:51:44.757282004Z","reason":"JobRunr maintenance - deleting succeeded job"}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	DELETED	2024-03-06 19:02:51.474624	2024-06-11 21:51:44.757282	\N	FacilityService.scanForIdleFacilities
0190095b-7102-75b9-9039-867218cef837	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190095b-7102-75b9-9039-867218cef837","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:11:46.049404796Z","scheduledAt":"2024-06-11T22:12:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:11:46.073638046Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:12:00.681834511Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:12:00.681834511Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:12:00.696822011Z","latencyDuration":14.608196465,"processDuration":0.014971084}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:11:46.049405	2024-06-11 22:12:00.696822	\N	FacilityService.scanForIdleFacilities
01900949-56ef-728d-b7cb-951c8c9e3bc0	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900949-56ef-728d-b7cb-951c8c9e3bc0","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:51:59.726788428Z","scheduledAt":"2024-06-11T21:52:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:51:59.752237094Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:52:14.593651087Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:52:14.593651087Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:52:14.712644004Z","latencyDuration":14.841413993,"processDuration":0.118989709}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:51:59.726788	2024-06-11 21:52:14.712644	\N	FacilityService.scanForIdleFacilities
01900962-c60b-7d07-9abb-887e9a5c1992	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900962-c60b-7d07-9abb-887e9a5c1992","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:19:46.571352546Z","scheduledAt":"2024-06-11T22:20:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:19:46.591366546Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:20:01.180400887Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:20:01.180400887Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:20:01.196447595Z","latencyDuration":14.589034341,"processDuration":0.016025208}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:19:46.571353	2024-06-11 22:20:01.196448	\N	FacilityService.scanForIdleFacilities
0190094a-4187-780d-8c29-c800e8643c7a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094a-4187-780d-8c29-c800e8643c7a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:52:59.783236053Z","scheduledAt":"2024-06-11T21:53:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:52:59.803251261Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:53:14.671941254Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:53:14.671941254Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:53:14.694106212Z","latencyDuration":14.868689993,"processDuration":0.022145667}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:52:59.783236	2024-06-11 21:53:14.694106	\N	FacilityService.scanForIdleFacilities
0190096b-f068-7ec6-9a4b-f86a5fa1fef6	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"0190096b-f068-7ec6-9a4b-f86a5fa1fef6","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:29:47.240794880Z","scheduledAt":"2024-06-11T22:30:00Z","recurringJobId":"NotificationScanner","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.NotificationScanner.sendNotifications()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:29:47.276686047Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:30:01.926849429Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:30:01.926849429Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:30:01.979087387Z","latencyDuration":14.650163382,"processDuration":0.052236041}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"NotificationScanner"}	com.terraformation.backend.daily.NotificationScanner.sendNotifications()	SUCCEEDED	2024-06-11 22:29:47.240795	2024-06-11 22:30:01.979087	\N	NotificationScanner
0190094b-2bfd-7783-9971-fbda7822d23b	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094b-2bfd-7783-9971-fbda7822d23b","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:53:59.805226928Z","scheduledAt":"2024-06-11T21:54:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:53:59.824443969Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:54:14.696080837Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:54:14.696080837Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:54:14.714283629Z","latencyDuration":14.871636868,"processDuration":0.018200792}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:53:59.805227	2024-06-11 21:54:14.714284	\N	FacilityService.scanForIdleFacilities
0190095c-5bab-78ab-9855-723b1c95c04f	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190095c-5bab-78ab-9855-723b1c95c04f","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:12:46.123303421Z","scheduledAt":"2024-06-11T22:13:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:12:46.137563755Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:13:00.741558053Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:13:00.741558053Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:13:00.756218512Z","latencyDuration":14.603994298,"processDuration":0.014641167}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:12:46.123303	2024-06-11 22:13:00.756219	\N	FacilityService.scanForIdleFacilities
0190094c-1685-78d7-9368-4ba47761adef	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094c-1685-78d7-9368-4ba47761adef","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:54:59.845475803Z","scheduledAt":"2024-06-11T21:55:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:54:59.861175094Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:55:14.743975462Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:55:14.743975462Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:55:14.796730004Z","latencyDuration":14.882800368,"processDuration":0.052747000}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:54:59.845476	2024-06-11 21:55:14.79673	\N	FacilityService.scanForIdleFacilities
01900963-b0ed-7aef-acfa-e942e6a3689a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900963-b0ed-7aef-acfa-e942e6a3689a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:20:46.701236713Z","scheduledAt":"2024-06-11T22:21:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:20:46.737751505Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:21:01.345170595Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:21:01.345170595Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:21:01.375738095Z","latencyDuration":14.607419090,"processDuration":0.030555583}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:20:46.701237	2024-06-11 22:21:01.375738	\N	FacilityService.scanForIdleFacilities
0190094d-0113-73b2-a4fc-50b7905248dc	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094d-0113-73b2-a4fc-50b7905248dc","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:55:59.891125178Z","scheduledAt":"2024-06-11T21:56:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:55:59.908876011Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:56:14.803593837Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:56:14.803593837Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:56:14.819873379Z","latencyDuration":14.894717826,"processDuration":0.016277834}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:55:59.891125	2024-06-11 21:56:14.819873	\N	FacilityService.scanForIdleFacilities
0190095d-4647-7b1c-bb9d-131cbda7e05d	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190095d-4647-7b1c-bb9d-131cbda7e05d","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:13:46.182962546Z","scheduledAt":"2024-06-11T22:14:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:13:46.198452088Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:14:00.801491887Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:14:00.801491887Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:14:00.827939137Z","latencyDuration":14.603039799,"processDuration":0.026410041}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:13:46.182963	2024-06-11 22:14:00.827939	\N	FacilityService.scanForIdleFacilities
0190096b-05d4-7617-9c18-389d9fd0ec9b	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096b-05d4-7617-9c18-389d9fd0ec9b","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:28:47.187494838Z","scheduledAt":"2024-06-11T22:29:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:28:47.199544797Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:29:01.873823595Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:29:01.873823595Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:29:01.892782637Z","latencyDuration":14.674278798,"processDuration":0.018948125}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:28:47.187495	2024-06-11 22:29:01.892783	\N	FacilityService.scanForIdleFacilities
0190094d-eba7-733f-a953-e53beb08e807	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094d-eba7-733f-a953-e53beb08e807","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:56:59.942818636Z","scheduledAt":"2024-06-11T21:57:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:56:59.966598720Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:57:14.864379462Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:57:14.864379462Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:57:14.881957462Z","latencyDuration":14.897780742,"processDuration":0.017560167}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:56:59.942819	2024-06-11 21:57:14.881957	\N	FacilityService.scanForIdleFacilities
0190094e-d663-7234-8b9b-19dd69b7f1d7	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094e-d663-7234-8b9b-19dd69b7f1d7","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:58:00.035163428Z","scheduledAt":"2024-06-11T21:58:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:58:00.085165761Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:58:14.918263462Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:58:14.918263462Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:58:14.936731504Z","latencyDuration":14.833097701,"processDuration":0.018460792}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:58:00.035163	2024-06-11 21:58:14.936732	\N	FacilityService.scanForIdleFacilities
0190094f-868a-7313-b6f1-52baa19879f8	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190094f-868a-7313-b6f1-52baa19879f8","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:58:45.129919796Z","scheduledAt":"2024-06-11T21:59:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:58:45.148531962Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T21:58:59.974253136Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T21:58:59.974253136Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T21:59:00.032103136Z","latencyDuration":14.825721174,"processDuration":0.057837417}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 21:58:45.12992	2024-06-11 21:59:00.032103	\N	FacilityService.scanForIdleFacilities
01900964-9ba6-7b80-b09f-880ba10f1e75	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900964-9ba6-7b80-b09f-880ba10f1e75","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:21:46.789852255Z","scheduledAt":"2024-06-11T22:22:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:21:46.811806463Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:22:01.399902012Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:22:01.399902012Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:22:01.422707553Z","latencyDuration":14.588095549,"processDuration":0.022789708}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:21:46.789852	2024-06-11 22:22:01.422708	\N	FacilityService.scanForIdleFacilities
0190095e-30e3-7e9e-b2d3-337ecd04b261	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"0190095e-30e3-7e9e-b2d3-337ecd04b261","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:14:46.243015588Z","scheduledAt":"2024-06-11T22:15:00Z","recurringJobId":"NotificationScanner","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.NotificationScanner.sendNotifications()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:14:46.278669880Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:15:00.873477303Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:15:00.873477303Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:15:00.928075678Z","latencyDuration":14.594807423,"processDuration":0.054597584}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"NotificationScanner"}	com.terraformation.backend.daily.NotificationScanner.sendNotifications()	SUCCEEDED	2024-06-11 22:14:46.243016	2024-06-11 22:15:00.928076	\N	NotificationScanner
01900950-7136-73c0-a08e-1f1d8c44acd6	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"01900950-7136-73c0-a08e-1f1d8c44acd6","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:59:45.206178004Z","scheduledAt":"2024-06-11T22:00:00Z","recurringJobId":"ObservationScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.ObservationScheduler.transitionObservations()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:59:45.221453504Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:00:00.022721720Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:00:00.022721720Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:00:00.222400678Z","latencyDuration":14.801268216,"processDuration":0.199675166}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"ObservationScheduler"}	com.terraformation.backend.daily.ObservationScheduler.transitionObservations()	SUCCEEDED	2024-06-11 21:59:45.206178	2024-06-11 22:00:00.222401	\N	ObservationScheduler
01900950-7137-7091-a22e-72f42c4f4aa6	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"01900950-7137-7091-a22e-72f42c4f4aa6","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T21:59:45.207124379Z","scheduledAt":"2024-06-11T22:00:00Z","recurringJobId":"PlantingSeasonScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T21:59:45.221454087Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:00:00.022723095Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:00:00.022723095Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:00:00.377666803Z","latencyDuration":14.801269008,"processDuration":0.354942333}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"PlantingSeasonScheduler"}	com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()	SUCCEEDED	2024-06-11 21:59:45.207124	2024-06-11 22:00:00.377667	\N	PlantingSeasonScheduler
0190095e-30e0-76ad-9e74-c2a9917c1ffe	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190095e-30e0-76ad-9e74-c2a9917c1ffe","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:14:46.239264630Z","scheduledAt":"2024-06-11T22:15:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:14:46.278643213Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:15:00.873253345Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:15:00.873253345Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:15:00.921034720Z","latencyDuration":14.594610132,"processDuration":0.047692417}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:14:46.239265	2024-06-11 22:15:00.921035	\N	FacilityService.scanForIdleFacilities
01900978-c58b-74f8-9b0e-bea8a566bde6	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900978-c58b-74f8-9b0e-bea8a566bde6","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:43:48.234649089Z","scheduledAt":"2024-06-11T22:44:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:43:48.261695505Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:44:02.668842804Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:44:02.668842804Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:44:02.678468012Z","latencyDuration":14.407147299,"processDuration":0.009610625}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:43:48.234649	2024-06-11 22:44:02.678468	\N	FacilityService.scanForIdleFacilities
01900951-5bc7-7397-8644-ec89a5599df2	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900951-5bc7-7397-8644-ec89a5599df2","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:00:45.255253254Z","scheduledAt":"2024-06-11T22:01:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:00:45.284333171Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:01:00.075897636Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:01:00.075897636Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:01:00.106005678Z","latencyDuration":14.791564465,"processDuration":0.029956750}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:00:45.255253	2024-06-11 22:01:00.106006	\N	FacilityService.scanForIdleFacilities
01900965-8642-76ad-865d-fcd7c85c11f2	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900965-8642-76ad-865d-fcd7c85c11f2","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:22:46.849862630Z","scheduledAt":"2024-06-11T22:23:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:22:46.868590130Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:23:01.453419470Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:23:01.453419470Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:23:01.504480178Z","latencyDuration":14.584829340,"processDuration":0.051048917}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:22:46.849863	2024-06-11 22:23:01.50448	\N	FacilityService.scanForIdleFacilities
0190095e-30e4-754c-8c6f-b2721ee5b175	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"0190095e-30e4-754c-8c6f-b2721ee5b175","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:14:46.244442838Z","scheduledAt":"2024-06-11T22:15:00Z","recurringJobId":"PlantingSeasonScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:14:46.278671296Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:15:00.873510928Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:15:00.873510928Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:15:00.954580637Z","latencyDuration":14.594839632,"processDuration":0.081068167}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"PlantingSeasonScheduler"}	com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()	SUCCEEDED	2024-06-11 22:14:46.244443	2024-06-11 22:15:00.954581	\N	PlantingSeasonScheduler
01900952-466b-71ae-bffd-f2d272f759c0	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900952-466b-71ae-bffd-f2d272f759c0","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:01:45.323453421Z","scheduledAt":"2024-06-11T22:02:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:01:45.342915713Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:02:00.157100553Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:02:00.157100553Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:02:00.173268636Z","latencyDuration":14.814184840,"processDuration":0.016145292}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:01:45.323453	2024-06-11 22:02:00.173269	\N	FacilityService.scanForIdleFacilities
01900960-062b-76d6-bf03-e72949f2c997	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900960-062b-76d6-bf03-e72949f2c997","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:16:46.378099213Z","scheduledAt":"2024-06-11T22:17:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:16:46.391410130Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:17:00.994479428Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:17:00.994479428Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:17:01.007465928Z","latencyDuration":14.603069298,"processDuration":0.012979667}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:16:46.378099	2024-06-11 22:17:01.007466	\N	FacilityService.scanForIdleFacilities
01900966-70d1-7469-92d1-62f824f5361d	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900966-70d1-7469-92d1-62f824f5361d","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:23:46.896623172Z","scheduledAt":"2024-06-11T22:24:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:23:46.911092088Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:24:01.528583678Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:24:01.528583678Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:24:01.539609887Z","latencyDuration":14.617491590,"processDuration":0.011011125}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:23:46.896623	2024-06-11 22:24:01.53961	\N	FacilityService.scanForIdleFacilities
01900967-5b61-70b1-affc-f6be0ac377e5	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900967-5b61-70b1-affc-f6be0ac377e5","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:24:46.944941797Z","scheduledAt":"2024-06-11T22:25:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:24:46.956948255Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:25:01.574359137Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:25:01.574359137Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:25:01.600971595Z","latencyDuration":14.617410882,"processDuration":0.026598417}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:24:46.944942	2024-06-11 22:25:01.600972	\N	FacilityService.scanForIdleFacilities
0190096a-1b2f-7c89-91bc-2926b50c51f4	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096a-1b2f-7c89-91bc-2926b50c51f4","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:27:47.117526922Z","scheduledAt":"2024-06-11T22:28:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:27:47.141726672Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:28:01.806991929Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:28:01.806991929Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:28:01.878090554Z","latencyDuration":14.665265257,"processDuration":0.071086875}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:27:47.117527	2024-06-11 22:28:01.878091	\N	FacilityService.scanForIdleFacilities
01900960-f0c1-7733-8f56-321621ddcbe6	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900960-f0c1-7733-8f56-321621ddcbe6","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:17:46.432530505Z","scheduledAt":"2024-06-11T22:18:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:17:46.447403463Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:18:01.054490220Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:18:01.054490220Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:18:01.072869095Z","latencyDuration":14.607086757,"processDuration":0.018377500}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:17:46.432531	2024-06-11 22:18:01.072869	\N	FacilityService.scanForIdleFacilities
01900973-459b-753a-81d1-79ca94c251ab	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900973-459b-753a-81d1-79ca94c251ab","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:37:47.802762464Z","scheduledAt":"2024-06-11T22:38:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:37:47.818178422Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:38:02.355022970Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:38:02.355022970Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:38:02.381236679Z","latencyDuration":14.536844548,"processDuration":0.026191917}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:37:47.802762	2024-06-11 22:38:02.381237	\N	FacilityService.scanForIdleFacilities
01900968-45f7-7bd0-975d-5a74af6b51ff	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900968-45f7-7bd0-975d-5a74af6b51ff","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:25:46.996808380Z","scheduledAt":"2024-06-11T22:26:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:25:47.021532130Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:26:01.631022429Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:26:01.631022429Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:26:01.661494012Z","latencyDuration":14.609490299,"processDuration":0.030459333}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:25:46.996808	2024-06-11 22:26:01.661494	\N	FacilityService.scanForIdleFacilities
01900969-3093-7ade-9b94-b69125753b0a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900969-3093-7ade-9b94-b69125753b0a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:26:47.058571880Z","scheduledAt":"2024-06-11T22:27:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:26:47.072638422Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:27:01.698489595Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:27:01.698489595Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:27:01.787477512Z","latencyDuration":14.625851173,"processDuration":0.088972292}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:26:47.058572	2024-06-11 22:27:01.787478	\N	FacilityService.scanForIdleFacilities
0190096b-f069-7210-809d-c5012a202869	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"0190096b-f069-7210-809d-c5012a202869","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:29:47.241320547Z","scheduledAt":"2024-06-11T22:30:00Z","recurringJobId":"PlantingSeasonScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:29:47.276687338Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:30:01.926850595Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:30:01.926850595Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:30:02.059961262Z","latencyDuration":14.650163257,"processDuration":0.133108542}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"PlantingSeasonScheduler"}	com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()	SUCCEEDED	2024-06-11 22:29:47.241321	2024-06-11 22:30:02.059961	\N	PlantingSeasonScheduler
0190096b-f069-7210-809d-c5012a202868	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"0190096b-f069-7210-809d-c5012a202868","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:29:47.241084255Z","scheduledAt":"2024-06-11T22:30:00Z","recurringJobId":"ObservationScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.ObservationScheduler.transitionObservations()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:29:47.276686797Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:30:01.926850095Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:30:01.926850095Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:30:02.074593595Z","latencyDuration":14.650163298,"processDuration":0.147742250}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"ObservationScheduler"}	com.terraformation.backend.daily.ObservationScheduler.transitionObservations()	SUCCEEDED	2024-06-11 22:29:47.241084	2024-06-11 22:30:02.074594	\N	ObservationScheduler
01900974-3035-7392-b25f-1b91d880b846	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900974-3035-7392-b25f-1b91d880b846","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:38:47.861566505Z","scheduledAt":"2024-06-11T22:39:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:38:47.889911297Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:39:02.418807596Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:39:02.418807596Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:39:02.460665304Z","latencyDuration":14.528896299,"processDuration":0.041804333}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:38:47.861567	2024-06-11 22:39:02.460665	\N	FacilityService.scanForIdleFacilities
0190096b-f066-7cab-b995-3da704f2ecb7	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096b-f066-7cab-b995-3da704f2ecb7","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:29:47.237602463Z","scheduledAt":"2024-06-11T22:30:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:29:47.276680213Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:30:01.926816179Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:30:01.926816179Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:30:01.965095429Z","latencyDuration":14.650135966,"processDuration":0.038252375}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:29:47.237602	2024-06-11 22:30:01.965095	\N	FacilityService.scanForIdleFacilities
01900975-1af7-7f97-ad25-2c025584bb92	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900975-1af7-7f97-ad25-2c025584bb92","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:39:47.958479130Z","scheduledAt":"2024-06-11T22:40:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:39:47.981057380Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:40:02.484658137Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:40:02.484658137Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:40:02.511417179Z","latencyDuration":14.503600757,"processDuration":0.026737709}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:39:47.958479	2024-06-11 22:40:02.511417	\N	FacilityService.scanForIdleFacilities
0190096c-db07-7958-9b7b-23295da5461d	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096c-db07-7958-9b7b-23295da5461d","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:30:47.302391338Z","scheduledAt":"2024-06-11T22:31:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:30:47.347746505Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:31:02.009400262Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:31:02.009400262Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:31:02.029947262Z","latencyDuration":14.661653757,"processDuration":0.020518750}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:30:47.302391	2024-06-11 22:31:02.029947	\N	FacilityService.scanForIdleFacilities
0190096d-c5b4-76d9-b05e-85358908630b	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096d-c5b4-76d9-b05e-85358908630b","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:31:47.378678755Z","scheduledAt":"2024-06-11T22:32:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:31:47.423079172Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:32:02.102219054Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:32:02.102219054Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:32:02.112492887Z","latencyDuration":14.679139882,"processDuration":0.010263833}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:31:47.378679	2024-06-11 22:32:02.112493	\N	FacilityService.scanForIdleFacilities
01900976-05aa-7d85-817d-7de61901cff4	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900976-05aa-7d85-817d-7de61901cff4","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:40:48.041569214Z","scheduledAt":"2024-06-11T22:41:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:40:48.064794255Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:41:02.528351887Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:41:02.528351887Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:41:02.553713637Z","latencyDuration":14.463557632,"processDuration":0.025342792}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:40:48.041569	2024-06-11 22:41:02.553714	\N	FacilityService.scanForIdleFacilities
0190096e-b068-7ebf-b5b0-9a46e80e0835	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096e-b068-7ebf-b5b0-9a46e80e0835","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:32:47.463133463Z","scheduledAt":"2024-06-11T22:33:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:32:47.484613505Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:33:02.133925262Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:33:02.133925262Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:33:02.147435845Z","latencyDuration":14.649311757,"processDuration":0.013497792}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:32:47.463133	2024-06-11 22:33:02.147436	\N	FacilityService.scanForIdleFacilities
0190096f-9b04-7de9-b7ea-87ba8188eb0a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190096f-9b04-7de9-b7ea-87ba8188eb0a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:33:47.524215588Z","scheduledAt":"2024-06-11T22:34:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:33:47.561472088Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:34:02.167346345Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:34:02.167346345Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:34:02.176957679Z","latencyDuration":14.605874257,"processDuration":0.009601292}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:33:47.524216	2024-06-11 22:34:02.176958	\N	FacilityService.scanForIdleFacilities
01900976-f057-796e-8758-aae43e59aa5d	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900976-f057-796e-8758-aae43e59aa5d","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:41:48.118944422Z","scheduledAt":"2024-06-11T22:42:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:41:48.133305630Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:42:02.567831304Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:42:02.567831304Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:42:02.591150596Z","latencyDuration":14.434525674,"processDuration":0.023297792}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:41:48.118944	2024-06-11 22:42:02.591151	\N	FacilityService.scanForIdleFacilities
01900970-85a9-78ef-901d-c5e2bd6c9e0a	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900970-85a9-78ef-901d-c5e2bd6c9e0a","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:34:47.592561630Z","scheduledAt":"2024-06-11T22:35:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:34:47.609730380Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:35:02.200919012Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:35:02.200919012Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:35:02.223344387Z","latencyDuration":14.591188632,"processDuration":0.022402583}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:34:47.592562	2024-06-11 22:35:02.223344	\N	FacilityService.scanForIdleFacilities
01900971-7056-7765-88d0-93f7e3c827af	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900971-7056-7765-88d0-93f7e3c827af","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:35:47.669752755Z","scheduledAt":"2024-06-11T22:36:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:35:47.697565964Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:36:02.240279304Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:36:02.240279304Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:36:02.266122429Z","latencyDuration":14.542713340,"processDuration":0.025826125}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:35:47.669753	2024-06-11 22:36:02.266122	\N	FacilityService.scanForIdleFacilities
01900977-daf1-783d-9196-5a39f42812ef	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900977-daf1-783d-9196-5a39f42812ef","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:42:48.176602797Z","scheduledAt":"2024-06-11T22:43:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:42:48.199665172Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:43:02.613212137Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:43:02.613212137Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:43:02.653283762Z","latencyDuration":14.413546965,"processDuration":0.040030917}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:42:48.176603	2024-06-11 22:43:02.653284	\N	FacilityService.scanForIdleFacilities
01900979-b034-7628-9b98-431fbb38f668	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"01900979-b034-7628-9b98-431fbb38f668","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:44:48.308034880Z","scheduledAt":"2024-06-11T22:45:00Z","recurringJobId":"ObservationScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.ObservationScheduler.transitionObservations()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:44:48.336981464Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:45:02.711312554Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:45:02.711312554Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:45:02.780882387Z","latencyDuration":14.374331090,"processDuration":0.069568583}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"ObservationScheduler"}	com.terraformation.backend.daily.ObservationScheduler.transitionObservations()	SUCCEEDED	2024-06-11 22:44:48.308035	2024-06-11 22:45:02.780882	\N	ObservationScheduler
01900979-b033-782e-bd2d-81fcd67fe96f	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"01900979-b033-782e-bd2d-81fcd67fe96f","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:44:48.307109380Z","scheduledAt":"2024-06-11T22:45:00Z","recurringJobId":"NotificationScanner","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.NotificationScanner.sendNotifications()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:44:48.336980714Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:45:02.711311387Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:45:02.711311387Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:45:02.737193971Z","latencyDuration":14.374330673,"processDuration":0.025881750}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"NotificationScanner"}	com.terraformation.backend.daily.NotificationScanner.sendNotifications()	SUCCEEDED	2024-06-11 22:44:48.307109	2024-06-11 22:45:02.737194	\N	NotificationScanner
01900979-b02f-7e44-9be1-7fb0457b4eb5	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"01900979-b02f-7e44-9be1-7fb0457b4eb5","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:44:48.302234672Z","scheduledAt":"2024-06-11T22:45:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:44:48.336972172Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:45:02.711303596Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:45:02.711303596Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:45:02.735590262Z","latencyDuration":14.374331424,"processDuration":0.024254708}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:44:48.302235	2024-06-11 22:45:02.73559	\N	FacilityService.scanForIdleFacilities
01900979-b034-7628-9b98-431fbb38f669	4	{"version":4,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"01900979-b034-7628-9b98-431fbb38f669","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:44:48.308561172Z","scheduledAt":"2024-06-11T22:45:00Z","recurringJobId":"PlantingSeasonScheduler","reason":"Scheduled by recurring job 'com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:44:48.336982130Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:45:02.711313637Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:45:02.711313637Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:45:02.820501512Z","latencyDuration":14.374331507,"processDuration":0.109186459}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"PlantingSeasonScheduler"}	com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()	SUCCEEDED	2024-06-11 22:44:48.308561	2024-06-11 22:45:02.820502	\N	PlantingSeasonScheduler
0190097a-9adb-7150-9c42-bc813830fc1c	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190097a-9adb-7150-9c42-bc813830fc1c","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:45:48.378170047Z","scheduledAt":"2024-06-11T22:46:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:45:48.406121214Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:46:02.808488887Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:46:02.808488887Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:46:02.830049679Z","latencyDuration":14.402367673,"processDuration":0.021548625}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:45:48.37817	2024-06-11 22:46:02.83005	\N	FacilityService.scanForIdleFacilities
0190097b-857f-7ef8-9f35-0193cb9db34e	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190097b-857f-7ef8-9f35-0193cb9db34e","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:46:48.446619880Z","scheduledAt":"2024-06-11T22:47:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:46:48.478711630Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:47:02.852196179Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:47:02.852196179Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:47:02.870636137Z","latencyDuration":14.373484549,"processDuration":0.018421792}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:46:48.44662	2024-06-11 22:47:02.870636	\N	FacilityService.scanForIdleFacilities
0190097c-701b-7b62-a529-0d4a383fb974	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190097c-701b-7b62-a529-0d4a383fb974","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:47:48.506574172Z","scheduledAt":"2024-06-11T22:48:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:47:48.522229256Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:48:02.893880637Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:48:02.893880637Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:48:02.913790637Z","latencyDuration":14.371651381,"processDuration":0.019882750}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:47:48.506574	2024-06-11 22:48:02.913791	\N	FacilityService.scanForIdleFacilities
0190097d-5ab1-7ccb-9030-72ca66a08552	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190097d-5ab1-7ccb-9030-72ca66a08552","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:48:48.560325589Z","scheduledAt":"2024-06-11T22:49:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:48:48.586774464Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:49:02.940344721Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:49:02.940344721Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:49:02.961849012Z","latencyDuration":14.353570257,"processDuration":0.021476541}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:48:48.560326	2024-06-11 22:49:02.961849	\N	FacilityService.scanForIdleFacilities
0190097e-4555-72aa-b637-e55fa02881e4	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"0190097e-4555-72aa-b637-e55fa02881e4","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-06-11T22:49:48.628804089Z","scheduledAt":"2024-06-11T22:50:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-06-11T22:49:48.656519047Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-06-11T22:50:02.989492762Z","serverId":"ae600158-5ec5-4cb8-9284-62479154888f","serverName":"c839ed6df710","updatedAt":"2024-06-11T22:50:02.989492762Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-06-11T22:50:03.009650471Z","latencyDuration":14.332973715,"processDuration":0.020126542}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-06-11 22:49:48.628804	2024-06-11 22:50:03.00965	\N	FacilityService.scanForIdleFacilities
\.


--
-- Data for Name: jobrunr_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_metadata (id, name, owner, value, createdat, updatedat) FROM stdin;
id-cluster	id	cluster	6a4d1e63-09b1-49f1-943d-0a87c5894c67	2024-03-05 04:05:09.498536	2024-03-05 04:05:09.499759
database_version-cluster	database_version	cluster	6.0.0	2024-03-05 04:05:09.561464	2024-03-05 04:05:09.569053
\.


--
-- Data for Name: jobrunr_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_migrations (id, script, installedon) FROM stdin;
f2396d05-aac2-4a97-8ac3-2813fb31c114	v000__create_migrations_table.sql	2022-10-25T10:51:43.520637
9abaaaa2-523c-4e40-8615-4c819f256feb	v001__create_job_table.sql	2022-10-25T10:51:43.533360
30993cfb-cf6b-44f5-8467-1a7ff55416f7	v002__create_recurring_job_table.sql	2022-10-25T10:51:43.537874
92356133-72ba-4647-b16d-203e10f006f0	v003__create_background_job_server_table.sql	2022-10-25T10:51:43.541225
6db988d7-5a0a-4e6c-ac6e-24b3b2de1208	v004__create_job_stats_view.sql	2022-10-25T10:51:43.543729
70b32f5a-d035-427c-9fe7-a2a01b6cce1e	v005__update_job_stats_view.sql	2022-10-25T10:51:43.545293
36673ab0-7e7a-4803-a714-47e3ebbcffad	v006__alter_table_jobs_add_recurringjob.sql	2022-10-25T10:51:43.546281
f95ebb34-e464-4f10-b507-d0176c16ee0b	v007__alter_table_backgroundjobserver_add_delete_config.sql	2022-10-25T10:51:43.547008
f21e4bd8-01a9-4107-b9bd-8af479fde8c7	v008__alter_table_jobs_increase_jobAsJson_size.sql	2022-10-25T10:51:43.547684
79b136b3-656b-4b57-a5a9-5f2d835cfe94	v009__change_jobrunr_job_counters_to_jobrunr_metadata.sql	2022-10-25T10:51:43.550559
6abcbc9f-dca0-4556-b72c-51cc9cddae36	v010__change_job_stats.sql	2022-10-25T10:51:43.552327
25d8e4f7-df4e-4edd-92ef-501845ac7688	v011__change_sqlserver_text_to_varchar.sql	2022-10-25T10:51:43.552838
e20f2436-f03f-481e-a3c1-30324e6bc254	v012__change_oracle_alter_jobrunr_metadata_column_size.sql	2022-10-25T10:51:43.553359
be0a869d-fc18-4120-8d21-2507b0c4a7ef	v013__alter_table_recurring_job_add_createdAt.sql	2022-10-25T10:51:43.554364
49ceecd4-0f7e-477d-9900-55fb75df4a20	v014__improve_job_stats.sql	2022-10-25T10:51:43.556190
dae3e0a8-65c9-450a-9575-402c2f06775a	v015__alter_table_backgroundjobserver_add_name.sql	2024-03-05T04:05:09.190781884
\.


--
-- Data for Name: jobrunr_recurring_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_recurring_jobs (id, version, jobasjson, createdat) FROM stdin;
FacilityService.scanForIdleFacilities                                                                                           	1	{"version":0,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"FacilityService.scanForIdleFacilities","scheduleExpression":"* * * * *","zoneId":"UTC","createdAt":"2024-06-11T21:50:43.314970587Z"}	1718142643314
DailyTaskRunner                                                                                                                 	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.DailyTaskRunner.runDailyTasks()","jobName":"com.terraformation.backend.daily.DailyTaskRunner.runDailyTasks()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.DailyTaskRunner","methodName":"runDailyTasks","jobParameters":[],"cacheable":true},"id":"DailyTaskRunner","scheduleExpression":"1 0 * * *","zoneId":"Z","createdAt":"2024-06-11T21:50:43.389675503Z"}	1718142643389
NotificationScanner                                                                                                             	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"NotificationScanner","scheduleExpression":"*/15 * * * *","zoneId":"UTC","createdAt":"2024-06-11T21:50:43.482550337Z"}	1718142643482
ObservationScheduler                                                                                                            	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"ObservationScheduler","scheduleExpression":"*/15 * * * *","zoneId":"UTC","createdAt":"2024-06-11T21:50:43.489750045Z"}	1718142643489
PlantingSeasonScheduler                                                                                                         	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"PlantingSeasonScheduler","scheduleExpression":"*/15 * * * *","zoneId":"UTC","createdAt":"2024-06-11T21:50:43.494472795Z"}	1718142643494
\.


--
-- Data for Name: land_use_model_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.land_use_model_types (id, name) FROM stdin;
1	Native Forest
2	Monoculture
3	Sustainable Timber
4	Other Timber
5	Mangroves
6	Agroforestry
7	Silvopasture
8	Other Land-Use Model
\.


--
-- Data for Name: managed_location_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.managed_location_types (id, name) FROM stdin;
1	SeedBank
2	Nursery
3	PlantingSite
\.


--
-- Data for Name: notification_criticalities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_criticalities (id, name) FROM stdin;
1	Info
2	Warning
3	Error
4	Success
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_types (id, name, notification_criticality_id) FROM stdin;
1	User Added to Organization	1
2	Facility Idle	2
3	Facility Alert Requested	3
6	Accession Scheduled to End Drying	1
12	Sensor Out Of Bounds	3
13	Unknown Automation Triggered	3
14	Device Unresponsive	3
15	Nursery Seedling Batch Ready	1
16	Report Created	1
17	Observation Upcoming	1
18	Observation Started	1
19	Schedule Observation	1
20	Schedule Observation Reminder	1
21	Observation Not Scheduled (Support)	1
22	Planting Season Started	1
23	Schedule Planting Season	2
24	Planting Season Not Scheduled (Support)	2
25	Deliverable Ready For Review	1
26	Deliverable Status Updated	1
27	Event Reminder	1
28	Participant Project Species Added To Project	1
29	Participant Project Species Approved Species Edited	1
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, notification_type_id, user_id, organization_id, title, body, local_url, created_time, is_read) FROM stdin;
1	23	1	1	Add your next planting season	It's time to schedule your next planting season	/planting-sites/1	2024-03-06 18:59:51.429206+00	f
2	23	1	1	Reminder: Add your next planting season	Remember to schedule your next planting season	/planting-sites/1	2024-06-11 22:00:00.332064+00	f
\.


--
-- Data for Name: organization_internal_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_internal_tags (organization_id, internal_tag_id, created_by, created_time) FROM stdin;
\.


--
-- Data for Name: organization_managed_location_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_managed_location_types (organization_id, managed_location_type_id) FROM stdin;
\.


--
-- Data for Name: organization_report_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_report_settings (organization_id, is_enabled) FROM stdin;
\.


--
-- Data for Name: organization_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_types (id, name) FROM stdin;
1	Government
2	NGO
3	Arboreta
4	Academia
5	ForProfit
6	Other
\.


--
-- Data for Name: organization_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_users (user_id, organization_id, role_id, created_time, modified_time, created_by, modified_by) FROM stdin;
1	1	4	2021-12-15 17:59:59.072725+00	2021-12-15 17:59:59.072725+00	1	1
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, created_time, modified_time, disabled_time, country_code, country_subdivision_code, description, created_by, modified_by, time_zone, organization_type_id, organization_type_details, website) FROM stdin;
1	Terraformation (staging)	2021-12-15 17:59:59.072094+00	2024-03-05 04:06:31.931678+00	\N	\N	\N	\N	1	1	Etc/UTC	\N	\N	\N
\.


--
-- Data for Name: plant_material_sourcing_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plant_material_sourcing_methods (id, name) FROM stdin;
1	Seed collection & germination
2	Seed purchase & germination
3	Mangrove propagules
4	Vegetative propagation
5	Wildling harvest
6	Seedling purchase
7	Other
\.


--
-- Data for Name: project_land_use_model_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_land_use_model_types (project_id, land_use_model_type_id) FROM stdin;
\.


--
-- Data for Name: project_report_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_report_settings (project_id, is_enabled) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, created_by, created_time, modified_by, modified_time, organization_id, name, description, participant_id, country_code) FROM stdin;
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.regions (id, name) FROM stdin;
1	Antarctica
2	East Asia & Pacific
3	Europe & Central Asia
4	Latin America & Caribbean
5	Middle East & North Africa
6	North America
7	Oceania
8	South Asia
9	Sub-Saharan Africa
\.


--
-- Data for Name: report_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_files (file_id, report_id) FROM stdin;
\.


--
-- Data for Name: report_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_photos (report_id, file_id, caption) FROM stdin;
\.


--
-- Data for Name: report_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_statuses (id, name) FROM stdin;
1	New
2	In Progress
3	Locked
4	Submitted
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, organization_id, year, quarter, locked_by, locked_time, modified_by, modified_time, submitted_by, submitted_time, status_id, body, project_id, project_name) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
1	Contributor
2	Manager
3	Admin
4	Owner
5	Terraformation Contact
\.


--
-- Data for Name: seed_storage_behaviors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seed_storage_behaviors (id, name) FROM stdin;
1	Orthodox
2	Recalcitrant
3	Intermediate
4	Unknown
5	Likely Orthodox
6	Likely Recalcitrant
7	Likely Intermediate
8	Intermediate - Cool Temperature Sensitive
9	Intermediate - Partial Desiccation Tolerant
10	Intermediate - Short Lived
\.


--
-- Data for Name: seed_treatments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seed_treatments (id, name) FROM stdin;
1	Soak
2	Scarify
3	Chemical
4	Stratification
5	Other
6	Light
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species (id, organization_id, scientific_name, common_name, family_name, rare, seed_storage_behavior_id, created_by, created_time, modified_by, modified_time, deleted_by, deleted_time, checked_time, initial_scientific_name, conservation_category_id, ecological_role_known, dbh_source, height_at_maturity_source, local_uses_known, native_ecosystem, other_facts, average_wood_density, height_at_maturity_value, dbh_value, wood_density_level_id) FROM stdin;
1	1	Kousa Dogwood	Kousa Dogwood	\N	\N	\N	1	2021-12-15 17:59:59.135505+00	1	2021-12-15 17:59:59.135505+00	\N	\N	\N	Kousa Dogwood	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	1	Other Dogwood	Other Dogwood	\N	\N	\N	1	2021-12-15 17:59:59.135505+00	1	2021-12-15 17:59:59.135505+00	\N	\N	\N	Other Dogwood	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	1	Banana	\N	\N	\N	\N	1	2024-03-05 04:05:13.747334+00	1	2024-03-05 04:05:13.747346+00	\N	\N	2024-03-05 04:05:13.927163+00	Banana	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	1	Coconut	\N	\N	\N	\N	1	2024-03-05 04:05:13.990217+00	1	2024-03-05 04:05:13.990226+00	\N	\N	2024-03-05 04:05:14.016589+00	Coconut	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: species_ecosystem_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_ecosystem_types (species_id, ecosystem_type_id) FROM stdin;
\.


--
-- Data for Name: species_growth_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_growth_forms (species_id, growth_form_id) FROM stdin;
\.


--
-- Data for Name: species_native_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_native_categories (id, name) FROM stdin;
1	Native
2	Non-native
\.


--
-- Data for Name: species_plant_material_sourcing_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_plant_material_sourcing_methods (species_id, plant_material_sourcing_method_id) FROM stdin;
\.


--
-- Data for Name: species_problem_fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_problem_fields (id, name) FROM stdin;
1	Scientific Name
\.


--
-- Data for Name: species_problem_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_problem_types (id, name) FROM stdin;
1	Name Misspelled
2	Name Not Found
3	Name Is Synonym
\.


--
-- Data for Name: species_problems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_problems (id, species_id, field_id, type_id, created_time, suggested_value) FROM stdin;
1	3	1	2	2024-03-05 04:05:13.890832+00	\N
2	4	1	2	2024-03-05 04:05:14.00616+00	\N
\.


--
-- Data for Name: species_successional_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_successional_groups (species_id, successional_group_id) FROM stdin;
\.


--
-- Data for Name: spring_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spring_session (primary_id, session_id, creation_time, last_access_time, max_inactive_interval, expiry_time, principal_name) FROM stdin;
b84131c0-7bee-4363-827e-291becc06698	276714ad-ab0a-48aa-8ef8-db65ec2e950a	1632267607787	1718142647102	315360000	2033502647102	0d04525c-7933-4cec-9647-7b6ac2642838
\.


--
-- Data for Name: spring_session_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spring_session_attributes (session_primary_id, attribute_name, attribute_bytes) FROM stdin;
b84131c0-7bee-4363-827e-291becc06698	SPRING_SECURITY_CONTEXT	\\xaced00057372003d6f72672e737072696e676672616d65776f726b2e73656375726974792e636f72652e636f6e746578742e5365637572697479436f6e74657874496d706c000000000000026c0200014c000e61757468656e7469636174696f6e7400324c6f72672f737072696e676672616d65776f726b2f73656375726974792f636f72652f41757468656e7469636174696f6e3b7870737200466f72672e737072696e676672616d65776f726b2e73656375726974792e61757468656e7469636174696f6e2e54657374696e6741757468656e7469636174696f6e546f6b656e00000000000000010200024c000b63726564656e7469616c737400124c6a6176612f6c616e672f4f626a6563743b4c00097072696e636970616c71007e0004787200476f72672e737072696e676672616d65776f726b2e73656375726974792e61757468656e7469636174696f6e2e416273747261637441757468656e7469636174696f6e546f6b656ed3aa287e6e47640e0200035a000d61757468656e746963617465644c000b617574686f7269746965737400164c6a6176612f7574696c2f436f6c6c656374696f6e3b4c000764657461696c7371007e00047870017372001f6a6176612e7574696c2e436f6c6c656374696f6e7324456d7074794c6973747ab817b43ca79ede020000787070740004746573747372002f636f6d2e7465727261666f726d6174696f6e2e6261636b656e642e617574682e53696d706c655072696e636970616ca43481deb93569620200014c00046e616d657400124c6a6176612f6c616e672f537472696e673b787074002430643034353235632d373933332d346365632d393634372d376236616332363432383338
\.


--
-- Data for Name: sub_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sub_locations (id, facility_id, name, created_time, modified_time, created_by, modified_by) FROM stdin;
1000	100	Refrigerator 1	2022-10-25 17:51:42.255377+00	2022-10-25 17:51:42.255377+00	1	1
1001	100	Freezer 1	2022-10-25 17:51:42.255377+00	2022-10-25 17:51:42.255377+00	1	1
1002	100	Freezer 2	2022-10-25 17:51:42.255377+00	2022-10-25 17:51:42.255377+00	1	1
\.


--
-- Data for Name: successional_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.successional_groups (id, name) FROM stdin;
1	Pioneer
2	Early secondary
3	Late secondary
4	Mature
\.


--
-- Data for Name: test_clock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_clock (fake_time, real_time) FROM stdin;
2021-12-15 17:59:42.568389+00	2021-12-15 17:59:42.568389+00
\.


--
-- Data for Name: thumbnails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.thumbnails (id, file_id, width, height, content_type, created_time, size, storage_url) FROM stdin;
\.


--
-- Data for Name: time_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_zones (time_zone) FROM stdin;
Asia/Aden
America/Cuiaba
Etc/GMT+9
Etc/GMT+8
Africa/Nairobi
America/Marigot
Asia/Aqtau
Pacific/Kwajalein
America/El_Salvador
Asia/Pontianak
Africa/Cairo
Pacific/Pago_Pago
Africa/Mbabane
Asia/Kuching
Pacific/Honolulu
Pacific/Rarotonga
America/Guatemala
Australia/Hobart
Europe/London
America/Belize
America/Panama
Asia/Chungking
America/Managua
America/Indiana/Petersburg
Asia/Yerevan
Europe/Brussels
GMT
Europe/Warsaw
America/Chicago
Asia/Kashgar
Chile/Continental
Pacific/Yap
CET
Etc/GMT-1
Etc/GMT-0
Europe/Jersey
America/Tegucigalpa
Etc/GMT-5
Europe/Istanbul
America/Eirunepe
Etc/GMT-4
America/Miquelon
Etc/GMT-3
Europe/Luxembourg
Etc/GMT-2
Etc/GMT-9
America/Argentina/Catamarca
Etc/GMT-8
Etc/GMT-7
Etc/GMT-6
Europe/Zaporozhye
Canada/Yukon
Canada/Atlantic
Atlantic/St_Helena
Australia/Tasmania
Libya
Europe/Guernsey
America/Grand_Turk
Asia/Samarkand
America/Argentina/Cordoba
Asia/Phnom_Penh
Africa/Kigali
Asia/Almaty
US/Alaska
Asia/Dubai
Europe/Isle_of_Man
America/Araguaina
Cuba
Asia/Novosibirsk
America/Argentina/Salta
Etc/GMT+3
Africa/Tunis
Etc/GMT+2
Etc/GMT+1
Pacific/Fakaofo
Africa/Tripoli
Etc/GMT+0
Israel
Africa/Banjul
Etc/GMT+7
Indian/Comoro
Etc/GMT+6
Etc/GMT+5
Etc/GMT+4
Pacific/Port_Moresby
US/Arizona
Antarctica/Syowa
Indian/Reunion
Pacific/Palau
Europe/Kaliningrad
America/Montevideo
Africa/Windhoek
Asia/Karachi
Africa/Mogadishu
Australia/Perth
Brazil/East
Etc/GMT
Asia/Chita
Pacific/Easter
Antarctica/Davis
Antarctica/McMurdo
Asia/Macao
America/Manaus
Africa/Freetown
Europe/Bucharest
Asia/Tomsk
America/Argentina/Mendoza
Asia/Macau
Europe/Malta
Mexico/BajaSur
Pacific/Tahiti
Africa/Asmera
Europe/Busingen
America/Argentina/Rio_Gallegos
Africa/Malabo
Europe/Skopje
America/Catamarca
America/Godthab
Europe/Sarajevo
Australia/ACT
GB-Eire
Africa/Lagos
America/Cordoba
Europe/Rome
Asia/Dacca
Indian/Mauritius
Pacific/Samoa
America/Regina
America/Fort_Wayne
America/Dawson_Creek
Africa/Algiers
Europe/Mariehamn
America/St_Johns
America/St_Thomas
Europe/Zurich
America/Anguilla
Asia/Dili
America/Denver
Africa/Bamako
Europe/Saratov
GB
Mexico/General
Pacific/Wallis
Europe/Gibraltar
Africa/Conakry
Africa/Lubumbashi
Asia/Istanbul
America/Havana
NZ-CHAT
Asia/Choibalsan
America/Porto_Acre
Asia/Omsk
Europe/Vaduz
US/Michigan
Asia/Dhaka
America/Barbados
Europe/Tiraspol
Atlantic/Cape_Verde
Asia/Yekaterinburg
America/Louisville
Pacific/Johnston
Pacific/Chatham
Europe/Ljubljana
America/Sao_Paulo
Asia/Jayapura
America/Curacao
Asia/Dushanbe
America/Guyana
America/Guayaquil
America/Martinique
Portugal
Europe/Berlin
Europe/Moscow
Europe/Chisinau
America/Puerto_Rico
America/Rankin_Inlet
Pacific/Ponape
Europe/Stockholm
Europe/Budapest
America/Argentina/Jujuy
Australia/Eucla
Asia/Shanghai
Universal
Europe/Zagreb
America/Port_of_Spain
Europe/Helsinki
Asia/Beirut
Asia/Tel_Aviv
Pacific/Bougainville
US/Central
Africa/Sao_Tome
Indian/Chagos
America/Cayenne
Asia/Yakutsk
Pacific/Galapagos
Australia/North
Europe/Paris
Africa/Ndjamena
Pacific/Fiji
America/Rainy_River
Indian/Maldives
Australia/Yancowinna
SystemV/AST4
Asia/Oral
America/Yellowknife
Pacific/Enderbury
America/Juneau
Australia/Victoria
America/Indiana/Vevay
Asia/Tashkent
Asia/Jakarta
Africa/Ceuta
Asia/Barnaul
America/Recife
America/Buenos_Aires
America/Noronha
America/Swift_Current
Australia/Adelaide
America/Metlakatla
Africa/Djibouti
America/Paramaribo
Asia/Qostanay
Europe/Simferopol
Europe/Sofia
Africa/Nouakchott
Europe/Prague
America/Indiana/Vincennes
Antarctica/Mawson
America/Kralendijk
Antarctica/Troll
Europe/Samara
Indian/Christmas
America/Antigua
Pacific/Gambier
America/Indianapolis
America/Inuvik
America/Iqaluit
Pacific/Funafuti
UTC
Antarctica/Macquarie
Canada/Pacific
America/Moncton
Africa/Gaborone
Pacific/Chuuk
Asia/Pyongyang
America/St_Vincent
Asia/Gaza
Etc/Universal
PST8PDT
Atlantic/Faeroe
Asia/Qyzylorda
Canada/Newfoundland
America/Kentucky/Louisville
America/Yakutat
America/Ciudad_Juarez
Asia/Ho_Chi_Minh
Antarctica/Casey
Europe/Copenhagen
Africa/Asmara
Atlantic/Azores
Europe/Vienna
ROK
Pacific/Pitcairn
America/Mazatlan
Australia/Queensland
Pacific/Nauru
Europe/Tirane
Asia/Kolkata
SystemV/MST7
Australia/Canberra
MET
Australia/Broken_Hill
Europe/Riga
America/Dominica
Africa/Abidjan
America/Mendoza
America/Santarem
Kwajalein
America/Asuncion
Asia/Ulan_Bator
NZ
America/Boise
Australia/Currie
EST5EDT
Pacific/Guam
Pacific/Wake
Atlantic/Bermuda
America/Costa_Rica
America/Dawson
Asia/Chongqing
Eire
Europe/Amsterdam
America/Indiana/Knox
America/North_Dakota/Beulah
Africa/Accra
Atlantic/Faroe
Mexico/BajaNorte
America/Maceio
Etc/UCT
Pacific/Apia
GMT0
America/Atka
Pacific/Niue
Australia/Lord_Howe
Europe/Dublin
Pacific/Truk
MST7MDT
America/Monterrey
America/Nassau
America/Jamaica
Asia/Bishkek
America/Atikokan
Atlantic/Stanley
Australia/NSW
US/Hawaii
SystemV/CST6
Indian/Mahe
Asia/Aqtobe
America/Sitka
Asia/Vladivostok
Africa/Libreville
Africa/Maputo
Zulu
America/Kentucky/Monticello
Africa/El_Aaiun
Africa/Ouagadougou
America/Coral_Harbour
Pacific/Marquesas
Brazil/West
America/Aruba
America/North_Dakota/Center
America/Cayman
Asia/Ulaanbaatar
Asia/Baghdad
Europe/San_Marino
America/Indiana/Tell_City
America/Tijuana
Pacific/Saipan
SystemV/YST9
Africa/Douala
America/Chihuahua
America/Ojinaga
Asia/Hovd
America/Anchorage
Chile/EasterIsland
America/Halifax
Antarctica/Rothera
America/Indiana/Indianapolis
US/Mountain
Asia/Damascus
America/Argentina/San_Luis
America/Santiago
Asia/Baku
America/Argentina/Ushuaia
Atlantic/Reykjavik
Africa/Brazzaville
Africa/Porto-Novo
America/La_Paz
Antarctica/DumontDUrville
Asia/Taipei
Antarctica/South_Pole
Asia/Manila
Asia/Bangkok
Africa/Dar_es_Salaam
Poland
Atlantic/Madeira
Antarctica/Palmer
America/Thunder_Bay
Africa/Addis_Ababa
Asia/Yangon
Europe/Uzhgorod
Brazil/DeNoronha
Asia/Ashkhabad
Etc/Zulu
America/Indiana/Marengo
America/Creston
America/Punta_Arenas
America/Mexico_City
Antarctica/Vostok
Asia/Jerusalem
Europe/Andorra
US/Samoa
PRC
Asia/Vientiane
Pacific/Kiritimati
America/Matamoros
America/Blanc-Sablon
Asia/Riyadh
Iceland
Pacific/Pohnpei
Asia/Ujung_Pandang
Atlantic/South_Georgia
Europe/Lisbon
Asia/Harbin
Europe/Oslo
Asia/Novokuznetsk
CST6CDT
Atlantic/Canary
America/Knox_IN
Asia/Kuwait
SystemV/HST10
Pacific/Efate
Africa/Lome
America/Bogota
America/Menominee
America/Adak
Pacific/Norfolk
Europe/Kirov
America/Resolute
Pacific/Kanton
Pacific/Tarawa
Africa/Kampala
Asia/Krasnoyarsk
Greenwich
SystemV/EST5
America/Edmonton
Europe/Podgorica
Australia/South
Canada/Central
Africa/Bujumbura
America/Santo_Domingo
US/Eastern
Europe/Minsk
Pacific/Auckland
Africa/Casablanca
America/Glace_Bay
Canada/Eastern
Asia/Qatar
Europe/Kiev
Singapore
Asia/Magadan
SystemV/PST8
America/Port-au-Prince
Europe/Belfast
America/St_Barthelemy
Asia/Ashgabat
Africa/Luanda
America/Nipigon
Atlantic/Jan_Mayen
Brazil/Acre
Asia/Muscat
Asia/Bahrain
Europe/Vilnius
America/Fortaleza
Etc/GMT0
US/East-Indiana
America/Hermosillo
America/Cancun
Africa/Maseru
Pacific/Kosrae
Africa/Kinshasa
Asia/Kathmandu
Asia/Seoul
Australia/Sydney
America/Lima
Australia/LHI
America/St_Lucia
Europe/Madrid
America/Bahia_Banderas
America/Montserrat
Asia/Brunei
America/Santa_Isabel
Canada/Mountain
America/Cambridge_Bay
Asia/Colombo
Australia/West
Indian/Antananarivo
Australia/Brisbane
Indian/Mayotte
US/Indiana-Starke
Asia/Urumqi
US/Aleutian
Europe/Volgograd
America/Lower_Princes
America/Vancouver
Africa/Blantyre
America/Rio_Branco
America/Danmarkshavn
America/Detroit
America/Thule
Africa/Lusaka
Asia/Hong_Kong
Iran
America/Argentina/La_Rioja
Africa/Dakar
SystemV/CST6CDT
America/Tortola
America/Porto_Velho
Asia/Sakhalin
Etc/GMT+10
America/Scoresbysund
Asia/Kamchatka
Asia/Thimbu
Africa/Harare
Etc/GMT+12
Etc/GMT+11
Navajo
America/Nome
Europe/Tallinn
Turkey
Africa/Khartoum
Africa/Johannesburg
Africa/Bangui
Europe/Belgrade
Jamaica
Africa/Bissau
Asia/Tehran
WET
Europe/Astrakhan
Africa/Juba
America/Campo_Grande
America/Belem
Etc/Greenwich
Asia/Saigon
America/Ensenada
Pacific/Midway
America/Jujuy
Africa/Timbuktu
America/Bahia
America/Goose_Bay
America/Virgin
America/Pangnirtung
Asia/Katmandu
America/Phoenix
Africa/Niamey
America/Whitehorse
Pacific/Noumea
Asia/Tbilisi
Europe/Kyiv
America/Montreal
Asia/Makassar
America/Argentina/San_Juan
Hongkong
UCT
Asia/Nicosia
America/Indiana/Winamac
SystemV/MST7MDT
America/Argentina/ComodRivadavia
America/Boa_Vista
America/Grenada
Asia/Atyrau
Australia/Darwin
Asia/Khandyga
Asia/Kuala_Lumpur
Asia/Famagusta
Asia/Thimphu
Asia/Rangoon
Europe/Bratislava
Asia/Calcutta
America/Argentina/Tucuman
Asia/Kabul
Indian/Cocos
Japan
Pacific/Tongatapu
America/New_York
Etc/GMT-12
Etc/GMT-11
America/Nuuk
Etc/GMT-10
SystemV/YST9YDT
Europe/Ulyanovsk
Etc/GMT-14
Etc/GMT-13
W-SU
America/Merida
EET
America/Rosario
Canada/Saskatchewan
America/St_Kitts
Arctic/Longyearbyen
America/Fort_Nelson
America/Caracas
America/Guadeloupe
Asia/Hebron
Indian/Kerguelen
SystemV/PST8PDT
Africa/Monrovia
Asia/Ust-Nera
Egypt
Asia/Srednekolymsk
America/North_Dakota/New_Salem
Asia/Anadyr
Australia/Melbourne
Asia/Irkutsk
America/Shiprock
America/Winnipeg
Europe/Vatican
Asia/Amman
Etc/UTC
SystemV/AST4ADT
Asia/Tokyo
America/Toronto
Asia/Singapore
Australia/Lindeman
America/Los_Angeles
SystemV/EST5EDT
Pacific/Majuro
America/Argentina/Buenos_Aires
Europe/Nicosia
Pacific/Guadalcanal
Europe/Athens
US/Pacific
Europe/Monaco
Z
\.


--
-- Data for Name: timeseries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timeseries (id, type_id, device_id, name, units, decimal_places, created_time, modified_time, created_by, modified_by) FROM stdin;
\.


--
-- Data for Name: timeseries_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timeseries_types (id, name) FROM stdin;
1	Numeric
2	Text
\.


--
-- Data for Name: timeseries_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timeseries_values (timeseries_id, created_time, value) FROM stdin;
\.


--
-- Data for Name: upload_problem_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.upload_problem_types (id, name) FROM stdin;
1	Unrecognized Value
2	Missing Required Value
3	Duplicate Value
4	Malformed Value
\.


--
-- Data for Name: upload_problems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.upload_problems (id, upload_id, type_id, is_error, "position", field, message, value) FROM stdin;
\.


--
-- Data for Name: upload_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.upload_statuses (id, name, finished) FROM stdin;
1	Receiving	f
2	Validating	f
3	Processing	f
4	Completed	t
5	Processing Failed	t
6	Invalid	t
7	Receiving Failed	t
8	Awaiting Validation	f
9	Awaiting User Action	f
10	Awaiting Processing	f
\.


--
-- Data for Name: upload_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.upload_types (id, name, expire_files) FROM stdin;
1	Species CSV	t
2	Accession CSV	t
3	Seedling Batch CSV	t
\.


--
-- Data for Name: uploads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploads (id, created_by, created_time, filename, storage_url, content_type, type_id, status_id, organization_id, facility_id, locale) FROM stdin;
\.


--
-- Data for Name: user_global_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_global_roles (user_id, global_role_id) FROM stdin;
1	1
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (user_id, organization_id, preferences) FROM stdin;
1	\N	{"lastVisitedOrg": 1, "preferredWeightSystem": "metric"}
\.


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_types (id, name) FROM stdin;
1	Individual
3	Device Manager
4	System
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, auth_id, email, first_name, last_name, created_time, modified_time, user_type_id, last_activity_time, email_notifications_enabled, deleted_time, time_zone, locale, country_code, cookies_consented, cookies_consented_time) FROM stdin;
2	DISABLED	system	Terraware	System	2022-10-25 17:51:42.24661+00	2022-10-25 17:51:42.24661+00	4	\N	f	\N	\N	\N	\N	\N	\N
1	0d04525c-7933-4cec-9647-7b6ac2642838	nobody@terraformation.com	Test	User	2021-12-15 17:59:59.069723+00	2021-12-15 17:59:59.069723+00	1	2024-06-11 21:50:47.113+00	f	\N	Etc/UTC	\N	\N	t	2024-06-11 21:53:16.594086+00
\.


--
-- Data for Name: wood_density_levels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wood_density_levels (id, name) FROM stdin;
1	Species
2	Genus
3	Family
\.


--
-- Data for Name: accession_collectors; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_collectors (accession_id, "position", name) FROM stdin;
\.


--
-- Data for Name: accession_photos; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_photos (accession_id, file_id) FROM stdin;
1002	1001
1002	1002
\.


--
-- Data for Name: accession_quantity_history; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_quantity_history (id, accession_id, history_type_id, created_by, created_time, remaining_quantity, remaining_units_id, notes) FROM stdin;
\.


--
-- Data for Name: accession_quantity_history_types; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_quantity_history_types (id, name) FROM stdin;
1	Observed
2	Computed
\.


--
-- Data for Name: accession_state_history; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_state_history (accession_id, updated_time, old_state_id, new_state_id, reason, updated_by) FROM stdin;
1000	2022-10-25 17:51:45.051912+00	30	40	Accession has been edited	2
1002	2022-10-25 17:51:45.114536+00	30	40	Accession has been edited	2
\.


--
-- Data for Name: accession_states; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_states (id, name, active) FROM stdin;
5	Awaiting Check-In	t
10	Pending	t
15	Awaiting Processing	t
20	Processing	t
30	Processed	t
40	Drying	t
50	Dried	t
60	In Storage	t
70	Withdrawn	f
75	Used Up	f
80	Nursery	f
\.


--
-- Data for Name: accessions; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accessions (id, facility_id, number, collected_date, received_date, state_id, founder_id, trees_collected_from, subset_weight, subset_count, est_seed_count, drying_end_date, processing_notes, sub_location_id, created_time, collection_site_name, collection_site_landowner, total_viability_percent, remaining_grams, remaining_quantity, remaining_units_id, subset_weight_grams, subset_weight_quantity, subset_weight_units_id, modified_time, created_by, modified_by, species_id, collection_site_city, collection_site_country_code, collection_site_country_subdivision, collection_site_notes, collection_source_id, data_source_id, latest_observed_quantity, latest_observed_units_id, latest_observed_time, est_weight_grams, est_weight_quantity, est_weight_units_id, total_withdrawn_count, total_withdrawn_weight_grams, total_withdrawn_weight_quantity, total_withdrawn_weight_units_id, project_id) FROM stdin;
1000	100	XYZ	\N	\N	40	\N	1	\N	\N	\N	\N	\N	\N	2021-01-03 15:31:20+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 17:51:45.063084+00	1	2	1	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1001	100	ABCDEFG	\N	\N	20	\N	2	\N	\N	\N	\N	\N	\N	2021-01-10 13:08:11+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 17:51:45.090985+00	1	2	2	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1002	100	AAF4D49R3E	\N	\N	40	\N	1	\N	\N	\N	\N	\N	\N	2021-01-03 15:31:20+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 17:51:45.115307+00	1	2	1	\N	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: bags; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.bags (id, accession_id, bag_number) FROM stdin;
1001	1002	ABCD001237
1002	1002	ABCD001238
\.


--
-- Data for Name: collection_sources; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.collection_sources (id, name) FROM stdin;
1	Wild
2	Reintroduced
3	Cultivated
4	Other
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.data_sources (id, name) FROM stdin;
1	Web
2	Seed Collector App
3	File Import
\.


--
-- Data for Name: geolocations; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.geolocations (id, accession_id, created_time, latitude, longitude, gps_accuracy) FROM stdin;
1001	1002	2021-02-12 17:21:33.62729+00	9.0300000	-79.5300000	\N
\.


--
-- Data for Name: seed_quantity_units; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.seed_quantity_units (id, name) FROM stdin;
1	Seeds
2	Grams
3	Milligrams
4	Kilograms
5	Ounces
6	Pounds
\.


--
-- Data for Name: viability_test_results; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.viability_test_results (id, test_id, recording_date, seeds_germinated) FROM stdin;
\.


--
-- Data for Name: viability_test_seed_types; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.viability_test_seed_types (id, name) FROM stdin;
1	Fresh
2	Stored
\.


--
-- Data for Name: viability_test_substrates; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.viability_test_substrates (id, name) FROM stdin;
1	Nursery Media
2	Agar
3	Paper
4	Other
5	Sand
6	Media Mix
7	Soil
8	Moss
9	Perlite/Vermiculite
10	None
\.


--
-- Data for Name: viability_test_types; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.viability_test_types (id, name) FROM stdin;
1	Lab
2	Nursery
3	Cut
\.


--
-- Data for Name: viability_tests; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.viability_tests (id, accession_id, test_type, start_date, seed_type_id, substrate_id, treatment_id, seeds_sown, notes, staff_responsible, total_seeds_germinated, total_percent_germinated, end_date, seeds_compromised, seeds_empty, seeds_filled) FROM stdin;
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.withdrawal_purposes (id, name) FROM stdin;
6	Other
7	Viability Testing
8	Out-planting
9	Nursery
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.withdrawals (id, accession_id, date, purpose_id, destination, staff_responsible, created_time, updated_time, notes, viability_test_id, withdrawn_grams, withdrawn_quantity, withdrawn_units_id, estimated_count, estimated_weight_quantity, estimated_weight_units_id, created_by, withdrawn_by, batch_id) FROM stdin;
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: -
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: -
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: -
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.deliveries (id, withdrawal_id, planting_site_id, created_by, created_time, modified_by, modified_time, reassigned_by, reassigned_time) FROM stdin;
\.


--
-- Data for Name: draft_planting_sites; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.draft_planting_sites (id, organization_id, project_id, name, description, time_zone, num_planting_zones, num_planting_subzones, data, created_by, created_time, modified_by, modified_time) FROM stdin;
\.


--
-- Data for Name: monitoring_plots; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.monitoring_plots (id, planting_subzone_id, name, full_name, created_by, created_time, modified_by, modified_time, boundary, permanent_cluster, permanent_cluster_subplot, is_available) FROM stdin;
\.


--
-- Data for Name: observable_conditions; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observable_conditions (id, name) FROM stdin;
1	AnimalDamage
2	FastGrowth
3	FavorableWeather
4	Fungus
5	Pests
6	SeedProduction
7	UnfavorableWeather
\.


--
-- Data for Name: observation_photos; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observation_photos (file_id, observation_id, monitoring_plot_id, position_id, gps_coordinates) FROM stdin;
\.


--
-- Data for Name: observation_plot_conditions; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observation_plot_conditions (observation_id, monitoring_plot_id, condition_id) FROM stdin;
\.


--
-- Data for Name: observation_plot_positions; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observation_plot_positions (id, name) FROM stdin;
1	SouthwestCorner
2	SoutheastCorner
3	NortheastCorner
4	NorthwestCorner
\.


--
-- Data for Name: observation_plots; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observation_plots (observation_id, monitoring_plot_id, claimed_by, claimed_time, completed_by, completed_time, created_by, created_time, is_permanent, modified_by, modified_time, observed_time, notes) FROM stdin;
\.


--
-- Data for Name: observation_states; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observation_states (id, name) FROM stdin;
1	Upcoming
2	InProgress
3	Completed
4	Overdue
\.


--
-- Data for Name: observations; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observations (id, planting_site_id, created_time, start_date, end_date, completed_time, state_id, upcoming_notification_sent_time) FROM stdin;
\.


--
-- Data for Name: observed_plot_coordinates; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observed_plot_coordinates (id, observation_id, monitoring_plot_id, position_id, gps_coordinates) FROM stdin;
\.


--
-- Data for Name: observed_plot_species_totals; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observed_plot_species_totals (observation_id, monitoring_plot_id, species_id, species_name, certainty_id, total_live, total_dead, total_existing, mortality_rate, cumulative_dead, permanent_live) FROM stdin;
\.


--
-- Data for Name: observed_site_species_totals; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observed_site_species_totals (observation_id, planting_site_id, species_id, species_name, certainty_id, total_live, total_dead, total_existing, mortality_rate, cumulative_dead, permanent_live) FROM stdin;
\.


--
-- Data for Name: observed_zone_species_totals; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.observed_zone_species_totals (observation_id, planting_zone_id, species_id, species_name, certainty_id, total_live, total_dead, total_existing, mortality_rate, cumulative_dead, permanent_live) FROM stdin;
\.


--
-- Data for Name: planting_seasons; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_seasons (id, planting_site_id, start_date, start_time, end_date, end_time, is_active) FROM stdin;
\.


--
-- Data for Name: planting_site_histories; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_site_histories (id, planting_site_id, created_by, created_time, boundary, grid_origin, exclusion) FROM stdin;
1	1	1	2024-03-06 18:56:18.746285+00	0106000020E6100000010000000103000000010000000A0000009AA10A279D5E52C02623D2801A2E3540B0A2E4BF7E5E52C01720C558172F35400D257257055E52C0E83555C52230354051849A399B5D52C03437BAEA1E303540ADEFC023285D52C000AB47E68B2F35405D68E789F35C52C075DDE42FF62D3540893021FA325D52C01631D195552C3540525064146B5E52C025E929772C2C354069731F55925E52C0C5C49FB6642C35409AA10A279D5E52C02623D2801A2E3540	0101000020E61000009AA10A279D5E52C025E929772C2C3540	0106000020E6100000140000000103000000010000004F000000883021FA325D52C01E31D195552C354013982916395D52C0CF5E68C46A2C354079FC35FF3F5D52C0A5A3E28A842C354039BBDD50445D52C0A1D2268AA12C3540969AB179465D52C07E526589BE2C354040401611495D52C0523638FAE12C3540E6E57AA84B5D52C023D334400A2D3540B7382DF44C5D52C011DBC0E9302D3540A6A422FA4F5D52C0394F72685C2D35400384F622525D52C0292C8C67792D35407A7C0D06565D52C0C68C5FADA12D35402422729D585D52C0CEA2A373BB2D3540FDF95CA95E5D52C0276D72ABDB2D35401A98D823655D52C04167E538F22D35403736549E6B5D52C0E8AD7E9B0D2E354083811DCD705D52C088014DC5252E35401793776A765D52C0326217EF3D2E35401B18B02A7B5D52C0B264678A5C2E35404D4A369F7E5D52C082ECDB096B2E35408901F5D3865D52C0A14CE6DD8C2E3540AA9F704E8D5D52C0336401A4A62E3540F2EA397D925D52C0B70AD0BFB62E3540057AE3BDA05D52C004D50E3EE22E35401184543EAA5D52C0680A1B04FC2E3540A195AEDBAF5D52C0D9D340BC0D2F3540F565B0CAB95D52C0C410E6C8322F3540B7A990DCC25D52C09B7A84F24A2F35404BBBEA79C85D52C0ABA1E171592F3540B5A42F23D45D52C0D3AB9770762F354033227FC6DC5D52C01DDF0DC5892F354058453301E85D52C03567E0B59E2F354097812AF6F45D52C08E502A18BA2F3540BCA4DE30005E52C09E9CB241D22F3540F25B9D65085E52C02FB8BEF9E32F3540FAE0D5250D5E52C0BEF99407EC2F3540A1D09BCD145E52C03AF7D5B600303540ED679216105E52C0D3A388190B3035406D54B4480C5E52C09A54E286FA2F3540EED664A5035E52C0BEF99407EC2F3540FCE536DFFB5D52C055D5894FDA2F3540230E4CD3F55D52C021AB976CCD2F3540A590FC2FED5D52C0252D6DDFB62F35409A868BAFE35D52C089A95B27A52F35405ECFCC7ADB5D52C035EF05A8962F354028180E46D35D52C0FD8EF0EF842F3540F2604F11CB5D52C0180FD937732F35404436B2B9C35D52C0756FBF7F612F3540F8EAE88ABE5D52C099126300532F354006FABAC4B65D52C096E725733C2F3540E95B3F4AB05D52C07DFA25902F2F3540F76A1184A85D52C0A3FBA33B1C2F35404A40742CA15D52C03EEFFD11042F35402DA2F8B19A5D52C04B21F34BEA2E354054CA0DA6945D52C0FC1368F7D62E35404B45D5E58F5D52C06721FE77C82E354000FA0BB78A5D52C0C1D4ABEAB12E354070E8B119855D52C021403E6BA32E3540DBD6577C7F5D52C089EEA916902E35404AC5FDDE795D52C061084F89792E3540B7B3A341745D52C02C142CC35F2E35403EBB8C5E705D52C0D65E2CD24A2E3540C3C2757B6C5D52C00646010C312E354033B11BDE665D52C040CA34E2182E35401613A063605D52C05434B8620A2E3540820146C65A5D52C05B582CF2E62D354036B67C97555D52C0A6C053C8CE2D354090101800535D52C0CEA2A373BB2D354000FFBD624D5D52C0B0A37B83892D35408406A77F495D52C04BF39A4B692D35401193C85C4A5D52C06ADF4D77472D3540969AB179465D52C0964296F81B2D354039BBDD50445D52C0DB7E3724FA2C3540DBDB0928425D52C08AAE0425DD2C354079FC35FF3F5D52C027A230B4B92C354047CAAF8A3C5D52C09FF089189B2C354013982916395D52C0579BB1C3872C35403BC03E0A335D52C0835075E07A2C35400E8333D02E5D52C0A687F1ED702C3540883021FA325D52C01E31D195552C35400103000000010000000B000000F0FA48EC595E52C0073835051C2E3540B4215CCF585E52C0AD090C8A1C2E35402AF3343A595E52C0F25092C5192E354059F8ECB0595E52C01E61EF85172E3540B0025D9E5A5E52C0CA059472152E3540F145640E5C5E52C02867A906132E354098F029965D5E52C02843A0E90F2E3540D3C916B35E5E52C0115D06C7102E35402FF385D15D5E52C0CF2DBDED142E3540AAE35D6D5C5E52C0B5FD36B2172E3540F0FA48EC595E52C0073835051C2E35400103000000010000000A00000053DCA3DA4C5E52C0336B9498692E35406A6423944D5E52C03191A1916C2E35403525B0A64D5E52C0AD741FBB6E2E3540D4A6C9CB4D5E52C013F58B3E722E354004E63CB94D5E52C0B7182807762E3540229D30ED4C5E52C0C741B7D6762E3540CF117EE94B5E52C052C30968742E354060CFD7B14B5E52C058802CB4712E3540A1D20AFC4B5E52C01C4ED1D66C2E354053DCA3DA4C5E52C0336B9498692E3540010300000001000000090000002AEB5951335E52C0FC0E3450CB2D354083BB1361345E52C056066413C22D3540B0A3F0E8345E52C056066413C22D3540922E179E355E52C0F0544EBCC22D3540325C8780365E52C0EAA23865C32D3540ECFED0AD365E52C075845FFEC92D3540BF16F425365E52C0599CB145CF2D3540B0A3F0E8345E52C0599CB145CF2D35402AEB5951335E52C0FC0E3450CB2D35400103000000010000001700000071F933B2255E52C0751B816A222F354018297AA2245E52C065953AE1152F3540C7C9EDC1265E52C0F263973D132F3540D93CF1FE275E52C05E3180E6132F35404280AE4B2A5E52C0B1C6C5EB112F3540E2AD1E2E2B5E52C0CFDC50F60D2F354051F3B1882B5E52C072250AAF082F35404BF1DB7A2D5E52C091B4062BFA2E354095BFBF7C305E52C037BDA54AEE2E3540A732C3B9315E52C0B5E6A208E72E354083BB1361345E52C04CDB15BCE32E35405F446408375E52C0E2E5B95FE62E35405F446408375E52C004A26045F02E3540BF16F425365E52C06D57D63AF42E3540C1A79C04315E52C01888D87CFB2E3540B33499C72F5E52C0F73DC367032F35403FEF056D2F5E52C01C8322480F2F3540130729E52E5E52C005D480281B2F3540C33845E32B5E52C0A4D223502C2F354067F75DA4275E52C01BEB0B3B342F3540D1CBC3CF245E52C03F993AE9322F354009B67665235E52C06C3FAF9C2F2F354071F933B2255E52C0751B816A222F35400103000000010000000F0000005C7F3F1A225E52C011E1B27E3F2D3540AB0AF21D235E52C0B16A8C8C392D3540A5DB7DA3245E52C02F9C4DA13A2D3540F66630A7255E52C07337CB77382D35403999D76B245E52C0DFA4F669342D354069D84A59245E52C073BCCF772E2D3540A0AC0929265E52C0332A4D4E2C2D35402B3BEF76275E52C08A6A9F322E2D3540BCC9D4C4285E52C0A5187993362D3540D151547E295E52C0F74F1D5C3A2D3540551C7A6F2A5E52C0772B35A8412D3540F5CC070F295E52C050651CAF482D354092B9D551275E52C0CF1FEC69482D3540F66630A7255E52C04B4E5B9A472D35405C7F3F1A225E52C011E1B27E3F2D35400103000000010000000A0000001F43DEE92D5E52C016F07C39492D3540EF036BFC2D5E52C0A64DF6BC422D3540B1D1C3372F5E52C0D0BC9532422D354062DB5C16305E52C0BB4300103D2D354017E5F5F4305E52C0F74F1D5C3A2D3540AB379B9F325E52C049626F403C2D35407AF827B2325E52C0A64DF6BC422D354050E8283F315E52C05935AD7E492D354073CE90ED2E5E52C0DCD1CE1D4B2D35401F43DEE92D5E52C016F07C39492D35400103000000010000000A0000008EC966303D5E52C01A9D6F1A182D3540D5B6624D3D5E52C010497F80102D3540E36B52C13D5E52C0C72E346F0B2D3540926519573F5E52C0C04ACDF1052D35407497EC95405E52C0FB908EE6082D3540814CDC09415E52C094862C3C0F2D354034AAF078405E52C0C80C54AE172D3540144011913F5E52C00F8D5FB41F2D35408EC966303D5E52C0B22E83531C2D35408EC966303D5E52C01A9D6F1A182D354001030000000100000009000000AC6E3481675E52C0162B1DDC152D35400C41C49E665E52C04F781206062D35400C41C49E665E52C04FD8E26CFF2C35405B0FA8A0695E52C0A3AAF7C3FE2C35407DF5AE1A6C5E52C0BC878F10022D3540440BFC846D5E52C0F3CC419F0C2D3540500DD2926B5E52C001949FD1192D3540BBE137BE685E52C0DDCA4B751C2D3540AC6E3481675E52C0162B1DDC152D354001030000000100000007000000419ACE556A5E52C026AFA003C82D35408EF95A36685E52C0793C0DB7C42D3540BBE137BE685E52C0C0668FC1C02D3540FB3C18836A5E52C07B202723BC2D3540C25265ED6B5E52C0DC7511CCBC2D35405F80D5CF6C5E52C025C4BA6FBF2D3540419ACE556A5E52C026AFA003C82D3540010300000001000000080000002AB69DE9655E52C0D6D24492D22D3540958A0315635E52C0AFD313CFDB2D35402D4746C8605E52C060F6D7DED52D35402D4746C8605E52C0EE587040D12D3540C874B6AA615E52C021531EF9CB2D3540214570BA625E52C026CA49A7CA2D3540B7700A8F655E52C0EE587040D12D35402AB69DE9655E52C0D6D24492D22D354001030000000100000008000000BE72E09C635E52C08D1B6828BA2D3540552F2350615E52C037CA3C7ABB2D354073A4FC9A605E52C037CA3C7ABB2D35407AA6D2A85E5E52C0DA4215E1B42D35407AA6D2A85E5E52C055C46B3DB22D35400ED26C7D615E52C0AF3B2E4DAC2D354007D0966F635E52C07C9DAC42B02D3540BE72E09C635E52C08D1B6828BA2D354001030000000100000008000000E358E716665E52C005435C10A32D35404E2D4D42635E52C04EE89C15A12D3540214570BA625E52C0A386DD1A9F2D3540214570BA625E52C05733747C9A2D3540DCE7B9E7625E52C0DFAE603A932D3540A3FD0652645E52C002334BE3932D3540E358E716665E52C05733747C9A2D3540E358E716665E52C005435C10A32D3540010300000001000000090000006B33CF6B5D5E52C07FB6358C942D3540F8ED3B115D5E52C05A1E1E209D2D3540CB055F895C5E52C0955C87BEA12D3540D60735975A5E52C06F263162A42D35409AAC54D2585E52C04EE89C15A12D3540534F9EFF585E52C03B3CCAD8972D35408FAA7EC45A5E52C0DFAE603A932D3540F8ED3B115D5E52C0022A7691922D35406B33CF6B5D5E52C07FB6358C942D3540010300000001000000590000001CE51A5EEA5D52C0DAA0646C3D2C35400E92C21CEA5D52C0040E7627502C35408D753C8FE95D52C096898F9E5F2C35408D753C8FE95D52C0DB184A45752C35401D04DB52EC5D52C0BD0B7FAC822C35407B2FDB20F25D52C00578832B932C35401A699E35F85D52C055B5B592A02C3540B669552FFD5D52C073C8C609B02C3540546A0C29025E52C0A93DD680BF2C3540A423F4C0055E52C0843BA317D32C3540FADCDB58095E52C083D7871DF52C35403AEB9E9F095E52C0C7BB4DB4082D35405CDC245F045E52C08F41BD72212D3540BEA2614AFE5D52C01B5204CA2C2D3540FA125593F15D52C0781B7A92252D35400E92C21CEA5D52C01D0AB8FB112D354085D76C91DC5D52C09160F364FE2C35409E56DA1AD55D52C0504ED274002D35400A2A6C59C55D52C0EA9F6423172D354026E2E5FDBE5D52C09FF8AFF1312D354087A822E9B85D52C01B7F5C07562D3540297D221BB35D52C0791D8BDD712D3540830A53EBAB5D52C06F04C6AB8C2D35409050B459A35D52C0867416FB962D354019DCBF3C8D5D52C03C4E8654812D3540E1A1452E825D52C0F5137D6E632D3540FD59BFD27B5D52C0BD943929392D3540544CB385805D52C06352751B162D3540F985769A865D52C07E6B1455FC2C3540E1A1452E825D52C0739B0067DD2C3540268451AD775D52C031BB5641B72C3540BBE638A96F5D52C04EA7245B992C3540AA3B14586C5D52C0FAA6BD8C7E2C354021E681AF6A5D52C0C01C80A6602C35403DFA3090695D52C06B4BBA644E2C3540376A989E6C5D52C04143A5FD4D2C3540F9BBEFD46E5D52C0B372C6056D2C3540C11F45C4705D52C0ED5240CC862C3540CE915DFA725D52C070E4633B952C3540E6758E66775D52C0376946CAA72C35407E7645607C5D52C0FCB14649B82C3540544CB385805D52C0A32345C8C82C3540B13EA738855D52C0334EF06EDE2C3540B877B353865D52C060FD7DA6E52C354001F88ED0885D52C061C2C17C012D354079A2FC27875D52C051460BD40C2D354022B00875825D52C06E06CE6A202D354086AF517B7D5D52C060715B19372D3540DA683913815D52C03DBE4B98472D3540EA135E64845D52C08F5A4B0F572D3540C822D8A4895D52C05E8D159E692D35405EEA82838D5D52C0791D8BDD712D3540F3B12D62915D52C0ED9A1115792D354054163A4B985D52C03C4E8654812D3540733377D29D5D52C0A97B4074852D3540D45E77A0A35D52C0CA8BFA93892D3540A5FBD8AAA65D52C0CA8BFA93892D3540F6B4C042AA5D52C038BE974C802D3540CA51224DAD5D52C03515BFC56E2D3540A2609C8DB25D52C022FFA0E7512D3540806F16CEB75D52C0BDB017393B2D3540D528FE65BB5D52C01B5204CA2C2D35402D1BF218C05D52C06CC321431B2D354003F15F3EC45D52C068A4FADB0D2D3540611C600CCA5D52C04FD8E26CFF2C35408DABB5C9D15D52C04AC1A80DF32C3540237360A8D55D52C04AC1A80DF32C35405874CE9BDF5D52C04AC1A80DF32C3540B79FCE69E55D52C0D9ED453DF92C3540DCF5170CEC5D52C0B3139094042D3540F3D94878F05D52C0EC5AD9EB0F2D35400ABE79E4F45D52C0A2EB532B182D354021A2AA50F95D52C099C9DE621F2D35407D949E03FE5D52C06E06CE6A202D3540CE4D869B015E52C059354333192D354097B1DB8A035E52C0BA842CC40A2D35405CDC245F045E52C0E46E3545FA2C3540DCBF9ED1035E52C0BD1E2CCEEA2C35408706B739005E52C069BE4147D92C3540364DCFA1FC5D52C0B0D024D8CA2C35401A699E35F85D52C0E9992659BA2C3540BC3D9E67F25D52C028CCB611B12C354016CBCE37EB5D52C00E3F66BAA52C3540F1748595E45D52C0F2175443962C35408B1079ACDD5D52C0F25C9E9C802C3540B201FF6BD85D52C09DF5D5FD6B2C35409E56DA1AD55D52C04DF0EB6E592C354065BF3287D25D52C0C5A27490402C35401CE51A5EEA5D52C0DAA0646C3D2C35400103000000010000000C0000007F1978A7435D52C0866C0B347E2E3540F83E806D435D52C0EA17D41C712E3540C30674C4435D52C0DAC5696C6F2E3540C30674C4435D52C0FFB12A5B6A2E35406183B033495D52C00E1910EF692E354008C887554A5D52C0B6ABEE88712E3540E9F95A944B5D52C0CD2E7DDE772E3540FAAE4A084C5D52C05BC4146D822E3540C0DA8B384A5D52C03A19918F8C2E3540A9384703455D52C06F1727DF8A2E35407F1978A7435D52C06EF4E8CD852E35407F1978A7435D52C0866C0B347E2E35400103000000010000000D00000078B8E398855D52C037BB655D472F3540FD01230F825D52C03A4D4E06482F3540E38C49C4825D52C08F0D96C93E2F3540D88A73B6845D52C039E0C535362F354054413440885D52C000E3DD4A2E2F3540859A3EF78B5D52C00D9352BC232F35400051FF808F5D52C0FF48AFD6192F354008C22CB0925D52C0F263973D132F3540E04A7D57955D52C018CA5138152F35403F1D0D75945D52C0E2A0AF18212F35402D39DC08905D52C01D213BA72B2F3540859A3EF78B5D52C0F639DD8C352F354078B8E398855D52C037BB655D472F35400103000000010000000E0000001306CF2A7E5D52C09D191BDC572F3540427F5491795D52C080075C65642F354093DEE071775D52C096ED11A26D2F3540538300AD755D52C00C1ECB9C6F2F3540DDCC3F23725D52C0DEC9253B742F3540AFE4629B715D52C03DA96C40722F35404F12D37D725D52C0AF8629F96C2F354071F8D9F7745D52C098B0A26A622F3540C6C89307765D52C06983767A5C2F3540BCC6BDF9775D52C02B194A8A562F354051F257CE7A5D52C0BC4C7BF64D2F35402C7BA8757D5D52C059DE36AF482F354095BE65C27F5D52C07C8DF0A94A2F35401306CF2A7E5D52C09D191BDC572F35400103000000010000000D000000B2750B7A6C5D52C037AA6882792F3540CBEAE4C46B5D52C09B3E1DBF822F354062A72778695D52C045E247AF882F35408C1ED7D0665D52C0F848729F8E2F3540F7F23CFC635D52C080729C8F942F35404E549FEA5F5D52C04B2667239D2F35400486BBE85C5D52C05E0EF06FA02F35409140288E5C5D52C04B2667239D2F3540A82459FA605D52C06E461343912F3540AC958629645D52C045E247AF882F35405F36FA48665D52C08D26D6B9842F354062A72778695D52C0D4B2DA777D2F3540B2750B7A6C5D52C037AA6882792F35400103000000010000000D0000005B0F4B404F5D52C0914600DDBD2F35400F474B124C5D52C044D424CDB92F3540C5DBFEB14D5D52C0857672FEAA2F35400137DF764F5D52C0B6801960A62F35404092BF3B515D52C0FD65C0C1A12F3540B84880C5545D52C0698537759E2F3540071764C7575D52C04B2667239D2F3540168A6704595D52C029564FCC9D2F3540CF2CB131595D52C0C1CAE9B1A72F354094D1D06C575D52C0B2965AA7AB2F3540E5305D4D555D52C08847CB9CAF2F3540EB32335B535D52C017DD3B92B32F35405B0F4B404F5D52C0914600DDBD2F3540
\.


--
-- Data for Name: planting_site_notifications; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_site_notifications (id, planting_site_id, notification_type_id, notification_number, sent_time) FROM stdin;
1	1	23	1	2024-03-06 18:59:51.272857+00
2	1	23	2	2024-06-11 22:00:00.182883+00
\.


--
-- Data for Name: planting_site_populations; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_site_populations (planting_site_id, species_id, total_plants, plants_since_last_observation) FROM stdin;
\.


--
-- Data for Name: planting_sites; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_sites (id, organization_id, name, description, boundary, created_by, created_time, modified_by, modified_time, time_zone, area_ha, project_id, exclusion, grid_origin) FROM stdin;
1	1	Planting Site	\N	0106000020E6100000010000000103000000010000000A0000009AA10A279D5E52C02623D2801A2E3540B0A2E4BF7E5E52C01720C558172F35400D257257055E52C0E83555C52230354051849A399B5D52C03437BAEA1E303540ADEFC023285D52C000AB47E68B2F35405D68E789F35C52C075DDE42FF62D3540893021FA325D52C01631D195552C3540525064146B5E52C025E929772C2C354069731F55925E52C0C5C49FB6642C35409AA10A279D5E52C02623D2801A2E3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	\N	374.1	\N	0106000020E6100000140000000103000000010000004F000000883021FA325D52C01E31D195552C354013982916395D52C0CF5E68C46A2C354079FC35FF3F5D52C0A5A3E28A842C354039BBDD50445D52C0A1D2268AA12C3540969AB179465D52C07E526589BE2C354040401611495D52C0523638FAE12C3540E6E57AA84B5D52C023D334400A2D3540B7382DF44C5D52C011DBC0E9302D3540A6A422FA4F5D52C0394F72685C2D35400384F622525D52C0292C8C67792D35407A7C0D06565D52C0C68C5FADA12D35402422729D585D52C0CEA2A373BB2D3540FDF95CA95E5D52C0276D72ABDB2D35401A98D823655D52C04167E538F22D35403736549E6B5D52C0E8AD7E9B0D2E354083811DCD705D52C088014DC5252E35401793776A765D52C0326217EF3D2E35401B18B02A7B5D52C0B264678A5C2E35404D4A369F7E5D52C082ECDB096B2E35408901F5D3865D52C0A14CE6DD8C2E3540AA9F704E8D5D52C0336401A4A62E3540F2EA397D925D52C0B70AD0BFB62E3540057AE3BDA05D52C004D50E3EE22E35401184543EAA5D52C0680A1B04FC2E3540A195AEDBAF5D52C0D9D340BC0D2F3540F565B0CAB95D52C0C410E6C8322F3540B7A990DCC25D52C09B7A84F24A2F35404BBBEA79C85D52C0ABA1E171592F3540B5A42F23D45D52C0D3AB9770762F354033227FC6DC5D52C01DDF0DC5892F354058453301E85D52C03567E0B59E2F354097812AF6F45D52C08E502A18BA2F3540BCA4DE30005E52C09E9CB241D22F3540F25B9D65085E52C02FB8BEF9E32F3540FAE0D5250D5E52C0BEF99407EC2F3540A1D09BCD145E52C03AF7D5B600303540ED679216105E52C0D3A388190B3035406D54B4480C5E52C09A54E286FA2F3540EED664A5035E52C0BEF99407EC2F3540FCE536DFFB5D52C055D5894FDA2F3540230E4CD3F55D52C021AB976CCD2F3540A590FC2FED5D52C0252D6DDFB62F35409A868BAFE35D52C089A95B27A52F35405ECFCC7ADB5D52C035EF05A8962F354028180E46D35D52C0FD8EF0EF842F3540F2604F11CB5D52C0180FD937732F35404436B2B9C35D52C0756FBF7F612F3540F8EAE88ABE5D52C099126300532F354006FABAC4B65D52C096E725733C2F3540E95B3F4AB05D52C07DFA25902F2F3540F76A1184A85D52C0A3FBA33B1C2F35404A40742CA15D52C03EEFFD11042F35402DA2F8B19A5D52C04B21F34BEA2E354054CA0DA6945D52C0FC1368F7D62E35404B45D5E58F5D52C06721FE77C82E354000FA0BB78A5D52C0C1D4ABEAB12E354070E8B119855D52C021403E6BA32E3540DBD6577C7F5D52C089EEA916902E35404AC5FDDE795D52C061084F89792E3540B7B3A341745D52C02C142CC35F2E35403EBB8C5E705D52C0D65E2CD24A2E3540C3C2757B6C5D52C00646010C312E354033B11BDE665D52C040CA34E2182E35401613A063605D52C05434B8620A2E3540820146C65A5D52C05B582CF2E62D354036B67C97555D52C0A6C053C8CE2D354090101800535D52C0CEA2A373BB2D354000FFBD624D5D52C0B0A37B83892D35408406A77F495D52C04BF39A4B692D35401193C85C4A5D52C06ADF4D77472D3540969AB179465D52C0964296F81B2D354039BBDD50445D52C0DB7E3724FA2C3540DBDB0928425D52C08AAE0425DD2C354079FC35FF3F5D52C027A230B4B92C354047CAAF8A3C5D52C09FF089189B2C354013982916395D52C0579BB1C3872C35403BC03E0A335D52C0835075E07A2C35400E8333D02E5D52C0A687F1ED702C3540883021FA325D52C01E31D195552C35400103000000010000000B000000F0FA48EC595E52C0073835051C2E3540B4215CCF585E52C0AD090C8A1C2E35402AF3343A595E52C0F25092C5192E354059F8ECB0595E52C01E61EF85172E3540B0025D9E5A5E52C0CA059472152E3540F145640E5C5E52C02867A906132E354098F029965D5E52C02843A0E90F2E3540D3C916B35E5E52C0115D06C7102E35402FF385D15D5E52C0CF2DBDED142E3540AAE35D6D5C5E52C0B5FD36B2172E3540F0FA48EC595E52C0073835051C2E35400103000000010000000A00000053DCA3DA4C5E52C0336B9498692E35406A6423944D5E52C03191A1916C2E35403525B0A64D5E52C0AD741FBB6E2E3540D4A6C9CB4D5E52C013F58B3E722E354004E63CB94D5E52C0B7182807762E3540229D30ED4C5E52C0C741B7D6762E3540CF117EE94B5E52C052C30968742E354060CFD7B14B5E52C058802CB4712E3540A1D20AFC4B5E52C01C4ED1D66C2E354053DCA3DA4C5E52C0336B9498692E3540010300000001000000090000002AEB5951335E52C0FC0E3450CB2D354083BB1361345E52C056066413C22D3540B0A3F0E8345E52C056066413C22D3540922E179E355E52C0F0544EBCC22D3540325C8780365E52C0EAA23865C32D3540ECFED0AD365E52C075845FFEC92D3540BF16F425365E52C0599CB145CF2D3540B0A3F0E8345E52C0599CB145CF2D35402AEB5951335E52C0FC0E3450CB2D35400103000000010000001700000071F933B2255E52C0751B816A222F354018297AA2245E52C065953AE1152F3540C7C9EDC1265E52C0F263973D132F3540D93CF1FE275E52C05E3180E6132F35404280AE4B2A5E52C0B1C6C5EB112F3540E2AD1E2E2B5E52C0CFDC50F60D2F354051F3B1882B5E52C072250AAF082F35404BF1DB7A2D5E52C091B4062BFA2E354095BFBF7C305E52C037BDA54AEE2E3540A732C3B9315E52C0B5E6A208E72E354083BB1361345E52C04CDB15BCE32E35405F446408375E52C0E2E5B95FE62E35405F446408375E52C004A26045F02E3540BF16F425365E52C06D57D63AF42E3540C1A79C04315E52C01888D87CFB2E3540B33499C72F5E52C0F73DC367032F35403FEF056D2F5E52C01C8322480F2F3540130729E52E5E52C005D480281B2F3540C33845E32B5E52C0A4D223502C2F354067F75DA4275E52C01BEB0B3B342F3540D1CBC3CF245E52C03F993AE9322F354009B67665235E52C06C3FAF9C2F2F354071F933B2255E52C0751B816A222F35400103000000010000000F0000005C7F3F1A225E52C011E1B27E3F2D3540AB0AF21D235E52C0B16A8C8C392D3540A5DB7DA3245E52C02F9C4DA13A2D3540F66630A7255E52C07337CB77382D35403999D76B245E52C0DFA4F669342D354069D84A59245E52C073BCCF772E2D3540A0AC0929265E52C0332A4D4E2C2D35402B3BEF76275E52C08A6A9F322E2D3540BCC9D4C4285E52C0A5187993362D3540D151547E295E52C0F74F1D5C3A2D3540551C7A6F2A5E52C0772B35A8412D3540F5CC070F295E52C050651CAF482D354092B9D551275E52C0CF1FEC69482D3540F66630A7255E52C04B4E5B9A472D35405C7F3F1A225E52C011E1B27E3F2D35400103000000010000000A0000001F43DEE92D5E52C016F07C39492D3540EF036BFC2D5E52C0A64DF6BC422D3540B1D1C3372F5E52C0D0BC9532422D354062DB5C16305E52C0BB4300103D2D354017E5F5F4305E52C0F74F1D5C3A2D3540AB379B9F325E52C049626F403C2D35407AF827B2325E52C0A64DF6BC422D354050E8283F315E52C05935AD7E492D354073CE90ED2E5E52C0DCD1CE1D4B2D35401F43DEE92D5E52C016F07C39492D35400103000000010000000A0000008EC966303D5E52C01A9D6F1A182D3540D5B6624D3D5E52C010497F80102D3540E36B52C13D5E52C0C72E346F0B2D3540926519573F5E52C0C04ACDF1052D35407497EC95405E52C0FB908EE6082D3540814CDC09415E52C094862C3C0F2D354034AAF078405E52C0C80C54AE172D3540144011913F5E52C00F8D5FB41F2D35408EC966303D5E52C0B22E83531C2D35408EC966303D5E52C01A9D6F1A182D354001030000000100000009000000AC6E3481675E52C0162B1DDC152D35400C41C49E665E52C04F781206062D35400C41C49E665E52C04FD8E26CFF2C35405B0FA8A0695E52C0A3AAF7C3FE2C35407DF5AE1A6C5E52C0BC878F10022D3540440BFC846D5E52C0F3CC419F0C2D3540500DD2926B5E52C001949FD1192D3540BBE137BE685E52C0DDCA4B751C2D3540AC6E3481675E52C0162B1DDC152D354001030000000100000007000000419ACE556A5E52C026AFA003C82D35408EF95A36685E52C0793C0DB7C42D3540BBE137BE685E52C0C0668FC1C02D3540FB3C18836A5E52C07B202723BC2D3540C25265ED6B5E52C0DC7511CCBC2D35405F80D5CF6C5E52C025C4BA6FBF2D3540419ACE556A5E52C026AFA003C82D3540010300000001000000080000002AB69DE9655E52C0D6D24492D22D3540958A0315635E52C0AFD313CFDB2D35402D4746C8605E52C060F6D7DED52D35402D4746C8605E52C0EE587040D12D3540C874B6AA615E52C021531EF9CB2D3540214570BA625E52C026CA49A7CA2D3540B7700A8F655E52C0EE587040D12D35402AB69DE9655E52C0D6D24492D22D354001030000000100000008000000BE72E09C635E52C08D1B6828BA2D3540552F2350615E52C037CA3C7ABB2D354073A4FC9A605E52C037CA3C7ABB2D35407AA6D2A85E5E52C0DA4215E1B42D35407AA6D2A85E5E52C055C46B3DB22D35400ED26C7D615E52C0AF3B2E4DAC2D354007D0966F635E52C07C9DAC42B02D3540BE72E09C635E52C08D1B6828BA2D354001030000000100000008000000E358E716665E52C005435C10A32D35404E2D4D42635E52C04EE89C15A12D3540214570BA625E52C0A386DD1A9F2D3540214570BA625E52C05733747C9A2D3540DCE7B9E7625E52C0DFAE603A932D3540A3FD0652645E52C002334BE3932D3540E358E716665E52C05733747C9A2D3540E358E716665E52C005435C10A32D3540010300000001000000090000006B33CF6B5D5E52C07FB6358C942D3540F8ED3B115D5E52C05A1E1E209D2D3540CB055F895C5E52C0955C87BEA12D3540D60735975A5E52C06F263162A42D35409AAC54D2585E52C04EE89C15A12D3540534F9EFF585E52C03B3CCAD8972D35408FAA7EC45A5E52C0DFAE603A932D3540F8ED3B115D5E52C0022A7691922D35406B33CF6B5D5E52C07FB6358C942D3540010300000001000000590000001CE51A5EEA5D52C0DAA0646C3D2C35400E92C21CEA5D52C0040E7627502C35408D753C8FE95D52C096898F9E5F2C35408D753C8FE95D52C0DB184A45752C35401D04DB52EC5D52C0BD0B7FAC822C35407B2FDB20F25D52C00578832B932C35401A699E35F85D52C055B5B592A02C3540B669552FFD5D52C073C8C609B02C3540546A0C29025E52C0A93DD680BF2C3540A423F4C0055E52C0843BA317D32C3540FADCDB58095E52C083D7871DF52C35403AEB9E9F095E52C0C7BB4DB4082D35405CDC245F045E52C08F41BD72212D3540BEA2614AFE5D52C01B5204CA2C2D3540FA125593F15D52C0781B7A92252D35400E92C21CEA5D52C01D0AB8FB112D354085D76C91DC5D52C09160F364FE2C35409E56DA1AD55D52C0504ED274002D35400A2A6C59C55D52C0EA9F6423172D354026E2E5FDBE5D52C09FF8AFF1312D354087A822E9B85D52C01B7F5C07562D3540297D221BB35D52C0791D8BDD712D3540830A53EBAB5D52C06F04C6AB8C2D35409050B459A35D52C0867416FB962D354019DCBF3C8D5D52C03C4E8654812D3540E1A1452E825D52C0F5137D6E632D3540FD59BFD27B5D52C0BD943929392D3540544CB385805D52C06352751B162D3540F985769A865D52C07E6B1455FC2C3540E1A1452E825D52C0739B0067DD2C3540268451AD775D52C031BB5641B72C3540BBE638A96F5D52C04EA7245B992C3540AA3B14586C5D52C0FAA6BD8C7E2C354021E681AF6A5D52C0C01C80A6602C35403DFA3090695D52C06B4BBA644E2C3540376A989E6C5D52C04143A5FD4D2C3540F9BBEFD46E5D52C0B372C6056D2C3540C11F45C4705D52C0ED5240CC862C3540CE915DFA725D52C070E4633B952C3540E6758E66775D52C0376946CAA72C35407E7645607C5D52C0FCB14649B82C3540544CB385805D52C0A32345C8C82C3540B13EA738855D52C0334EF06EDE2C3540B877B353865D52C060FD7DA6E52C354001F88ED0885D52C061C2C17C012D354079A2FC27875D52C051460BD40C2D354022B00875825D52C06E06CE6A202D354086AF517B7D5D52C060715B19372D3540DA683913815D52C03DBE4B98472D3540EA135E64845D52C08F5A4B0F572D3540C822D8A4895D52C05E8D159E692D35405EEA82838D5D52C0791D8BDD712D3540F3B12D62915D52C0ED9A1115792D354054163A4B985D52C03C4E8654812D3540733377D29D5D52C0A97B4074852D3540D45E77A0A35D52C0CA8BFA93892D3540A5FBD8AAA65D52C0CA8BFA93892D3540F6B4C042AA5D52C038BE974C802D3540CA51224DAD5D52C03515BFC56E2D3540A2609C8DB25D52C022FFA0E7512D3540806F16CEB75D52C0BDB017393B2D3540D528FE65BB5D52C01B5204CA2C2D35402D1BF218C05D52C06CC321431B2D354003F15F3EC45D52C068A4FADB0D2D3540611C600CCA5D52C04FD8E26CFF2C35408DABB5C9D15D52C04AC1A80DF32C3540237360A8D55D52C04AC1A80DF32C35405874CE9BDF5D52C04AC1A80DF32C3540B79FCE69E55D52C0D9ED453DF92C3540DCF5170CEC5D52C0B3139094042D3540F3D94878F05D52C0EC5AD9EB0F2D35400ABE79E4F45D52C0A2EB532B182D354021A2AA50F95D52C099C9DE621F2D35407D949E03FE5D52C06E06CE6A202D3540CE4D869B015E52C059354333192D354097B1DB8A035E52C0BA842CC40A2D35405CDC245F045E52C0E46E3545FA2C3540DCBF9ED1035E52C0BD1E2CCEEA2C35408706B739005E52C069BE4147D92C3540364DCFA1FC5D52C0B0D024D8CA2C35401A699E35F85D52C0E9992659BA2C3540BC3D9E67F25D52C028CCB611B12C354016CBCE37EB5D52C00E3F66BAA52C3540F1748595E45D52C0F2175443962C35408B1079ACDD5D52C0F25C9E9C802C3540B201FF6BD85D52C09DF5D5FD6B2C35409E56DA1AD55D52C04DF0EB6E592C354065BF3287D25D52C0C5A27490402C35401CE51A5EEA5D52C0DAA0646C3D2C35400103000000010000000C0000007F1978A7435D52C0866C0B347E2E3540F83E806D435D52C0EA17D41C712E3540C30674C4435D52C0DAC5696C6F2E3540C30674C4435D52C0FFB12A5B6A2E35406183B033495D52C00E1910EF692E354008C887554A5D52C0B6ABEE88712E3540E9F95A944B5D52C0CD2E7DDE772E3540FAAE4A084C5D52C05BC4146D822E3540C0DA8B384A5D52C03A19918F8C2E3540A9384703455D52C06F1727DF8A2E35407F1978A7435D52C06EF4E8CD852E35407F1978A7435D52C0866C0B347E2E35400103000000010000000D00000078B8E398855D52C037BB655D472F3540FD01230F825D52C03A4D4E06482F3540E38C49C4825D52C08F0D96C93E2F3540D88A73B6845D52C039E0C535362F354054413440885D52C000E3DD4A2E2F3540859A3EF78B5D52C00D9352BC232F35400051FF808F5D52C0FF48AFD6192F354008C22CB0925D52C0F263973D132F3540E04A7D57955D52C018CA5138152F35403F1D0D75945D52C0E2A0AF18212F35402D39DC08905D52C01D213BA72B2F3540859A3EF78B5D52C0F639DD8C352F354078B8E398855D52C037BB655D472F35400103000000010000000E0000001306CF2A7E5D52C09D191BDC572F3540427F5491795D52C080075C65642F354093DEE071775D52C096ED11A26D2F3540538300AD755D52C00C1ECB9C6F2F3540DDCC3F23725D52C0DEC9253B742F3540AFE4629B715D52C03DA96C40722F35404F12D37D725D52C0AF8629F96C2F354071F8D9F7745D52C098B0A26A622F3540C6C89307765D52C06983767A5C2F3540BCC6BDF9775D52C02B194A8A562F354051F257CE7A5D52C0BC4C7BF64D2F35402C7BA8757D5D52C059DE36AF482F354095BE65C27F5D52C07C8DF0A94A2F35401306CF2A7E5D52C09D191BDC572F35400103000000010000000D000000B2750B7A6C5D52C037AA6882792F3540CBEAE4C46B5D52C09B3E1DBF822F354062A72778695D52C045E247AF882F35408C1ED7D0665D52C0F848729F8E2F3540F7F23CFC635D52C080729C8F942F35404E549FEA5F5D52C04B2667239D2F35400486BBE85C5D52C05E0EF06FA02F35409140288E5C5D52C04B2667239D2F3540A82459FA605D52C06E461343912F3540AC958629645D52C045E247AF882F35405F36FA48665D52C08D26D6B9842F354062A72778695D52C0D4B2DA777D2F3540B2750B7A6C5D52C037AA6882792F35400103000000010000000D0000005B0F4B404F5D52C0914600DDBD2F35400F474B124C5D52C044D424CDB92F3540C5DBFEB14D5D52C0857672FEAA2F35400137DF764F5D52C0B6801960A62F35404092BF3B515D52C0FD65C0C1A12F3540B84880C5545D52C0698537759E2F3540071764C7575D52C04B2667239D2F3540168A6704595D52C029564FCC9D2F3540CF2CB131595D52C0C1CAE9B1A72F354094D1D06C575D52C0B2965AA7AB2F3540E5305D4D555D52C08847CB9CAF2F3540EB32335B535D52C017DD3B92B32F35405B0F4B404F5D52C0914600DDBD2F3540	0101000020E61000009AA10A279D5E52C025E929772C2C3540
\.


--
-- Data for Name: planting_subzone_histories; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_subzone_histories (id, planting_zone_history_id, planting_subzone_id, name, full_name, boundary) FROM stdin;
1	1	4	South	East-South	0106000020E61000000100000001030000000100000008000000BED4DFD7E85D52C0AC8CAD7D102E354057DE2981115D52C06ADA6966312D35409AADF8F9325D52C015105E95552C354013A1B490515E52C051229CD42F2C3540F3FBB312245E52C064E2F13FE62C354013340B1CF95D52C0D2BAB7457D2D3540753C0BD8E85D52C061160B7E102E3540BED4DFD7E85D52C0AC8CAD7D102E3540
2	1	3	North	East-North	0106000020E610000001000000010300000001000000090000009B4E09D8E85D52C04CAC207E102E35405B6A720CE55D52C0213F4670222E35406E9F5852C95D52C053F0E58AA52E35400BD2B9B7815D52C0C84340344C2F354048061CC34E5D52C0FE94113DBD2F35402CA39223285D52C02E2FA2E58B2F354081EEBD89F35C52C0B8BD712FF62D354014392081115D52C0999CAA66312D35409B4E09D8E85D52C04CAC207E102E3540
3	2	2	South	West-South	0106000020E6100000010000000103000000010000000B00000069E81991515E52C00D0417D42F2C3540724A13146B5E52C0EAA643762C2C354029B23E146B5E52C0BFFF99762C2C35408A6DCE54925E52C0E382B9B5642C3540CDA4B8269D5E52C0EEE3EB7F1A2E35402CD1098D855E52C08B057CC5DE2E35403FAD35D8E85D52C015396C7E102E354003B7331CF95D52C0E3DA2A467D2D3540E27EDC12245E52C0EC026540E62C3540AD01FC90515E52C0345791D42F2C354069E81991515E52C00D0417D42F2C3540
4	2	1	North	West-North	0106000020E6100000010000000103000000010000000A0000008AD131D8E85D52C0F5CB937E102E35401B54328D855E52C09424EFC5DE2E3540C11FBCBF7E5E52C03B015258172F35401EA24957055E52C0E417E2C422303540610172399B5D52C02D1947EA1E303540006E47C34E5D52C0C6EB673DBD2F3540F954E2B7815D52C07962B3344C2F35404B198252C95D52C07F0F598BA52E35404AED9A0CE55D52C0BC5EB970222E35408AD131D8E85D52C0F5CB937E102E3540
\.


--
-- Data for Name: planting_subzone_populations; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_subzone_populations (planting_subzone_id, species_id, total_plants, plants_since_last_observation) FROM stdin;
\.


--
-- Data for Name: planting_subzones; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_subzones (id, planting_zone_id, name, full_name, boundary, created_by, created_time, modified_by, modified_time, planting_site_id, area_ha, planting_completed_time) FROM stdin;
1	1	North	West-North	0106000020E6100000010000000103000000010000000A0000008AD131D8E85D52C0F5CB937E102E35401B54328D855E52C09424EFC5DE2E3540C11FBCBF7E5E52C03B015258172F35401EA24957055E52C0E417E2C422303540610172399B5D52C02D1947EA1E303540006E47C34E5D52C0C6EB673DBD2F3540F954E2B7815D52C07962B3344C2F35404B198252C95D52C07F0F598BA52E35404AED9A0CE55D52C0BC5EB970222E35408AD131D8E85D52C0F5CB937E102E3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	1	94.4	\N
2	1	South	West-South	0106000020E6100000010000000103000000010000000B00000069E81991515E52C00D0417D42F2C3540724A13146B5E52C0EAA643762C2C354029B23E146B5E52C0BFFF99762C2C35408A6DCE54925E52C0E382B9B5642C3540CDA4B8269D5E52C0EEE3EB7F1A2E35402CD1098D855E52C08B057CC5DE2E35403FAD35D8E85D52C015396C7E102E354003B7331CF95D52C0E3DA2A467D2D3540E27EDC12245E52C0EC026540E62C3540AD01FC90515E52C0345791D42F2C354069E81991515E52C00D0417D42F2C3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	1	85.3	\N
3	2	North	East-North	0106000020E610000001000000010300000001000000090000009B4E09D8E85D52C04CAC207E102E35405B6A720CE55D52C0213F4670222E35406E9F5852C95D52C053F0E58AA52E35400BD2B9B7815D52C0C84340344C2F354048061CC34E5D52C0FE94113DBD2F35402CA39223285D52C02E2FA2E58B2F354081EEBD89F35C52C0B8BD712FF62D354014392081115D52C0999CAA66312D35409B4E09D8E85D52C04CAC207E102E3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	1	97.0	\N
4	2	South	East-South	0106000020E61000000100000001030000000100000008000000BED4DFD7E85D52C0AC8CAD7D102E354057DE2981115D52C06ADA6966312D35409AADF8F9325D52C015105E95552C354013A1B490515E52C051229CD42F2C3540F3FBB312245E52C064E2F13FE62C354013340B1CF95D52C0D2BAB7457D2D3540753C0BD8E85D52C061160B7E102E3540BED4DFD7E85D52C0AC8CAD7D102E3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	1	97.4	\N
\.


--
-- Data for Name: planting_types; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_types (id, name) FROM stdin;
1	Delivery
2	Reassignment From
3	Reassignment To
4	Undo
\.


--
-- Data for Name: planting_zone_histories; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_zone_histories (id, planting_site_history_id, planting_zone_id, name, boundary) FROM stdin;
1	1	2	East	0106000020E6100000010000000103000000010000000B000000388944C34E5D52C058B3843DBD2F3540BD6C9823285D52C07E8CD4E58B2F354081EEBD89F35C52C0B8BD712FF62D35409AADF8F9325D52C015105E95552C3540AD01FC90515E52C0345791D42F2C3540E27EDC12245E52C0EC026540E62C354003B7331CF95D52C0E3DA2A467D2D35409DDA30D8E85D52C0F5CB937E102E35404B198252C95D52C07F0F598BA52E3540F954E2B7815D52C07962B3344C2F3540388944C34E5D52C058B3843DBD2F3540
2	1	1	West	0106000020E6100000010000000103000000010000000E000000EFF06FC34E5D52C0180ADB3DBD2F3540E9D70AB8815D52C0248126354C2F35403A9CAA52C95D52C0B42ECC8BA52E354079545AD8E85D52C094EB067F102E3540DE305D1CF95D52C0F6FA9D467D2D3540BFF80513245E52C07423D840E62C3540576B4291515E52C023258AD42F2C354061CD3B146B5E52C003C8B6762C2C354079F0F654925E52C0D0A32CB6642C3540BD27E1269D5E52C08F035F801A2E3540C11FBCBF7E5E52C03B015258172F35401EA24957055E52C0E417E2C422303540610172399B5D52C02D1947EA1E303540EFF06FC34E5D52C0180ADB3DBD2F3540
\.


--
-- Data for Name: planting_zone_populations; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_zone_populations (planting_zone_id, species_id, total_plants, plants_since_last_observation) FROM stdin;
\.


--
-- Data for Name: planting_zones; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.planting_zones (id, planting_site_id, name, boundary, created_by, created_time, modified_by, modified_time, variance, students_t, error_margin, num_permanent_clusters, num_temporary_plots, area_ha, target_planting_density, extra_permanent_clusters) FROM stdin;
1	1	West	0106000020E6100000010000000103000000010000000E000000EFF06FC34E5D52C0180ADB3DBD2F3540E9D70AB8815D52C0248126354C2F35403A9CAA52C95D52C0B42ECC8BA52E354079545AD8E85D52C094EB067F102E3540DE305D1CF95D52C0F6FA9D467D2D3540BFF80513245E52C07423D840E62C3540576B4291515E52C023258AD42F2C354061CD3B146B5E52C003C8B6762C2C354079F0F654925E52C0D0A32CB6642C3540BD27E1269D5E52C08F035F801A2E3540C11FBCBF7E5E52C03B015258172F35401EA24957055E52C0E417E2C422303540610172399B5D52C02D1947EA1E303540EFF06FC34E5D52C0180ADB3DBD2F3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	40000	1.282	100	7	9	179.7	1500	0
2	1	East	0106000020E6100000010000000103000000010000000B000000388944C34E5D52C058B3843DBD2F3540BD6C9823285D52C07E8CD4E58B2F354081EEBD89F35C52C0B8BD712FF62D35409AADF8F9325D52C015105E95552C3540AD01FC90515E52C0345791D42F2C3540E27EDC12245E52C0EC026540E62C354003B7331CF95D52C0E3DA2A467D2D35409DDA30D8E85D52C0F5CB937E102E35404B198252C95D52C07F0F598BA52E3540F954E2B7815D52C07962B3344C2F3540388944C34E5D52C058B3843DBD2F3540	1	2024-03-06 18:56:18.746285+00	1	2024-03-06 18:56:18.746285+00	40000	1.282	100	7	9	194.4	1500	0
\.


--
-- Data for Name: plantings; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.plantings (id, delivery_id, planting_type_id, planting_site_id, planting_subzone_id, species_id, created_by, created_time, num_plants, notes) FROM stdin;
\.


--
-- Data for Name: recorded_plant_statuses; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.recorded_plant_statuses (id, name) FROM stdin;
1	Live
2	Dead
3	Existing
\.


--
-- Data for Name: recorded_plants; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.recorded_plants (id, observation_id, monitoring_plot_id, certainty_id, gps_coordinates, species_id, species_name, status_id) FROM stdin;
\.


--
-- Data for Name: recorded_species_certainties; Type: TABLE DATA; Schema: tracking; Owner: -
--

COPY tracking.recorded_species_certainties (id, name) FROM stdin;
1	Known
2	Other
3	Unknown
\.


--
-- Name: cohorts_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.cohorts_id_seq', 1, false);


--
-- Name: deliverables_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.deliverables_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.events_id_seq', 1, false);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.modules_id_seq', 1, false);


--
-- Name: participant_project_species_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.participant_project_species_id_seq', 1, false);


--
-- Name: participants_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.participants_id_seq', 1, false);


--
-- Name: submission_documents_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.submission_documents_id_seq', 1, false);


--
-- Name: submission_snapshots_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.submission_snapshots_id_seq', 1, false);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: -
--

SELECT pg_catalog.setval('accelerator.submissions_id_seq', 1, false);


--
-- Name: batch_details_history_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: -
--

SELECT pg_catalog.setval('nursery.batch_details_history_id_seq', 1, false);


--
-- Name: batch_photos_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: -
--

SELECT pg_catalog.setval('nursery.batch_photos_id_seq', 1, false);


--
-- Name: batch_quantity_history_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: -
--

SELECT pg_catalog.setval('nursery.batch_quantity_history_id_seq', 1, false);


--
-- Name: batches_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: -
--

SELECT pg_catalog.setval('nursery.batches_id_seq', 1, false);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: -
--

SELECT pg_catalog.setval('nursery.withdrawals_id_seq', 1, false);


--
-- Name: automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.automations_id_seq', 1, false);


--
-- Name: device_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.device_id_seq', 1, false);


--
-- Name: device_managers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.device_managers_id_seq', 1, false);


--
-- Name: device_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.device_templates_id_seq', 1, false);


--
-- Name: gbif_names_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gbif_names_id_seq', 1, false);


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.germination_treatment_id_seq', 1, false);


--
-- Name: internal_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.internal_tags_id_seq', 10000, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 2, false);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.photos_id_seq', 1003, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reports_id_seq', 1, false);


--
-- Name: site_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_module_id_seq', 103, true);


--
-- Name: species_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_id_seq1', 8, true);


--
-- Name: species_problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_problems_id_seq', 2, true);


--
-- Name: storage_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.storage_location_id_seq', 1003, false);


--
-- Name: thumbnail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.thumbnail_id_seq', 1, false);


--
-- Name: timeseries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.timeseries_id_seq', 1, false);


--
-- Name: upload_problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.upload_problems_id_seq', 1, false);


--
-- Name: uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.uploads_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: accession_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.accession_id_seq', 1, false);


--
-- Name: accession_quantity_history_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.accession_quantity_history_id_seq', 1, false);


--
-- Name: bag_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.bag_id_seq', 1003, false);


--
-- Name: collection_event_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.collection_event_id_seq', 1002, false);


--
-- Name: germination_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.germination_id_seq', 1, false);


--
-- Name: germination_seed_type_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.germination_seed_type_id_seq', 1, false);


--
-- Name: germination_substrate_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.germination_substrate_id_seq', 1, false);


--
-- Name: germination_test_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.germination_test_id_seq', 1, false);


--
-- Name: withdrawal_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.withdrawal_id_seq', 1, false);


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.withdrawal_purpose_id_seq', 1, false);


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: -
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: deliveries_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.deliveries_id_seq', 1, false);


--
-- Name: draft_planting_sites_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.draft_planting_sites_id_seq', 1, false);


--
-- Name: monitoring_plots_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.monitoring_plots_id_seq', 5161, true);


--
-- Name: observations_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.observations_id_seq', 1, false);


--
-- Name: observed_plot_coordinates_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.observed_plot_coordinates_id_seq', 1, false);


--
-- Name: planting_seasons_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_seasons_id_seq', 1, false);


--
-- Name: planting_site_histories_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_site_histories_id_seq', 1, true);


--
-- Name: planting_site_notifications_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_site_notifications_id_seq', 2, true);


--
-- Name: planting_sites_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_sites_id_seq', 1, true);


--
-- Name: planting_subzone_histories_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_subzone_histories_id_seq', 4, true);


--
-- Name: planting_zone_histories_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_zone_histories_id_seq', 2, true);


--
-- Name: planting_zones_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.planting_zones_id_seq', 2, true);


--
-- Name: plantings_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.plantings_id_seq', 1, false);


--
-- Name: plots_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.plots_id_seq', 4, true);


--
-- Name: recorded_plants_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: -
--

SELECT pg_catalog.setval('tracking.recorded_plants_id_seq', 1, false);


--
-- Name: cohort_modules cohort_modules_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT cohort_modules_pkey PRIMARY KEY (cohort_id, module_id);


--
-- Name: cohort_phases cohort_phases_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohort_phases
    ADD CONSTRAINT cohort_phases_name_key UNIQUE (name);


--
-- Name: cohort_phases cohort_phases_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohort_phases
    ADD CONSTRAINT cohort_phases_pkey PRIMARY KEY (id);


--
-- Name: cohorts cohorts_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_name_key UNIQUE (name);


--
-- Name: cohorts cohorts_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);


--
-- Name: cohort_modules dates_no_overlap; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT dates_no_overlap EXCLUDE USING gist (cohort_id WITH =, daterange(start_date, end_date, '[]'::text) WITH &&);


--
-- Name: deal_stages deal_stages_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deal_stages
    ADD CONSTRAINT deal_stages_name_key UNIQUE (name);


--
-- Name: deal_stages deal_stages_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deal_stages
    ADD CONSTRAINT deal_stages_pkey PRIMARY KEY (id);


--
-- Name: default_voters default_voters_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.default_voters
    ADD CONSTRAINT default_voters_pkey PRIMARY KEY (user_id);


--
-- Name: deliverable_categories deliverable_categories_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_categories
    ADD CONSTRAINT deliverable_categories_name_key UNIQUE (name);


--
-- Name: deliverable_categories deliverable_categories_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_categories
    ADD CONSTRAINT deliverable_categories_pkey PRIMARY KEY (id);


--
-- Name: deliverable_cohort_due_dates deliverable_cohort_due_dates_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_cohort_due_dates
    ADD CONSTRAINT deliverable_cohort_due_dates_pkey PRIMARY KEY (deliverable_id, cohort_id);


--
-- Name: deliverable_documents deliverable_documents_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_pkey PRIMARY KEY (deliverable_id);


--
-- Name: deliverable_project_due_dates deliverable_project_due_dates_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_project_due_dates
    ADD CONSTRAINT deliverable_project_due_dates_pkey PRIMARY KEY (deliverable_id, project_id);


--
-- Name: deliverable_types deliverable_types_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_types
    ADD CONSTRAINT deliverable_types_name_key UNIQUE (name);


--
-- Name: deliverable_types deliverable_types_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_types
    ADD CONSTRAINT deliverable_types_pkey PRIMARY KEY (id);


--
-- Name: deliverables deliverables_id_deliverable_type_id_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_id_deliverable_type_id_key UNIQUE (id, deliverable_type_id);


--
-- Name: deliverables deliverables_module_id_position_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_module_id_position_key UNIQUE (module_id, "position");


--
-- Name: deliverables deliverables_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_pkey PRIMARY KEY (id);


--
-- Name: document_stores document_stores_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.document_stores
    ADD CONSTRAINT document_stores_name_key UNIQUE (name);


--
-- Name: document_stores document_stores_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.document_stores
    ADD CONSTRAINT document_stores_pkey PRIMARY KEY (id);


--
-- Name: event_projects event_projects_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_projects
    ADD CONSTRAINT event_projects_pkey PRIMARY KEY (event_id, project_id);


--
-- Name: event_statuses event_statuses_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_statuses
    ADD CONSTRAINT event_statuses_name_key UNIQUE (name);


--
-- Name: event_statuses event_statuses_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_statuses
    ADD CONSTRAINT event_statuses_pkey PRIMARY KEY (id);


--
-- Name: event_types event_types_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_types
    ADD CONSTRAINT event_types_name_key UNIQUE (name);


--
-- Name: event_types event_types_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_types
    ADD CONSTRAINT event_types_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: submission_documents no_duplicate_names_for_project; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT no_duplicate_names_for_project UNIQUE (project_id, name);


--
-- Name: participant_project_species participant_project_species_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_pkey PRIMARY KEY (id);


--
-- Name: participant_project_species participant_project_species_project_id_species_id_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_project_id_species_id_key UNIQUE (project_id, species_id);


--
-- Name: participants participants_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_name_key UNIQUE (name);


--
-- Name: participants participants_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);


--
-- Name: pipelines pipelines_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.pipelines
    ADD CONSTRAINT pipelines_name_key UNIQUE (name);


--
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- Name: project_accelerator_details project_accelerator_details_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_accelerator_details
    ADD CONSTRAINT project_accelerator_details_pkey PRIMARY KEY (project_id);


--
-- Name: project_scores project_scores_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_scores
    ADD CONSTRAINT project_scores_pkey PRIMARY KEY (project_id, phase_id, score_category_id);


--
-- Name: project_vote_decisions project_vote_decisions_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_vote_decisions
    ADD CONSTRAINT project_vote_decisions_pkey PRIMARY KEY (project_id, phase_id);


--
-- Name: project_votes project_votes_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_pkey PRIMARY KEY (user_id, project_id, phase_id);


--
-- Name: score_categories score_categories_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.score_categories
    ADD CONSTRAINT score_categories_name_key UNIQUE (name);


--
-- Name: score_categories score_categories_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.score_categories
    ADD CONSTRAINT score_categories_pkey PRIMARY KEY (id);


--
-- Name: submission_documents submission_documents_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_pkey PRIMARY KEY (id);


--
-- Name: submission_snapshots submission_snapshots_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_snapshots
    ADD CONSTRAINT submission_snapshots_pkey PRIMARY KEY (id);


--
-- Name: submission_statuses submission_statuses_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_statuses
    ADD CONSTRAINT submission_statuses_name_key UNIQUE (name);


--
-- Name: submission_statuses submission_statuses_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_statuses
    ADD CONSTRAINT submission_statuses_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_project_id_deliverable_id_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_project_id_deliverable_id_key UNIQUE (project_id, deliverable_id);


--
-- Name: vote_options vote_options_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.vote_options
    ADD CONSTRAINT vote_options_name_key UNIQUE (name);


--
-- Name: vote_options vote_options_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.vote_options
    ADD CONSTRAINT vote_options_pkey PRIMARY KEY (id);


--
-- Name: batch_details_history batch_details_history_batch_id_version_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_batch_id_version_key UNIQUE (batch_id, version);


--
-- Name: batch_details_history batch_details_history_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_pkey PRIMARY KEY (id);


--
-- Name: batch_details_history_sub_locations batch_details_history_sub_locations_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history_sub_locations
    ADD CONSTRAINT batch_details_history_sub_locations_pkey PRIMARY KEY (batch_details_history_id, sub_location_id);


--
-- Name: batch_photos batch_photos_file_id_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_file_id_key UNIQUE (file_id);


--
-- Name: batch_photos batch_photos_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_pkey PRIMARY KEY (id);


--
-- Name: batch_quantity_history batch_quantity_history_batch_id_version_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_batch_id_version_key UNIQUE (batch_id, version);


--
-- Name: batch_quantity_history batch_quantity_history_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_pkey PRIMARY KEY (id);


--
-- Name: batch_quantity_history_types batch_quantity_history_types_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history_types
    ADD CONSTRAINT batch_quantity_history_types_pkey PRIMARY KEY (id);


--
-- Name: batch_sub_locations batch_sub_locations_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_pkey PRIMARY KEY (batch_id, sub_location_id);


--
-- Name: batch_substrates batch_substrates_name_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_substrates
    ADD CONSTRAINT batch_substrates_name_key UNIQUE (name);


--
-- Name: batch_substrates batch_substrates_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_substrates
    ADD CONSTRAINT batch_substrates_pkey PRIMARY KEY (id);


--
-- Name: batch_withdrawals batch_withdrawals_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_pkey PRIMARY KEY (batch_id, withdrawal_id);


--
-- Name: batches batches_facility_id_id_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_facility_id_id_key UNIQUE (facility_id, id);


--
-- Name: batches batches_organization_id_batch_number_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_organization_id_batch_number_key UNIQUE (organization_id, batch_number);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_photos withdrawal_photos_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawal_photos
    ADD CONSTRAINT withdrawal_photos_pkey PRIMARY KEY (file_id);


--
-- Name: withdrawal_purposes withdrawal_purposes_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawal_purposes
    ADD CONSTRAINT withdrawal_purposes_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_undoes_withdrawal_id_key; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_undoes_withdrawal_id_key UNIQUE (undoes_withdrawal_id);


--
-- Name: app_versions app_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_versions
    ADD CONSTRAINT app_versions_pkey PRIMARY KEY (app_name, platform);


--
-- Name: automations automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_pkey PRIMARY KEY (id);


--
-- Name: conservation_categories conservation_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conservation_categories
    ADD CONSTRAINT conservation_categories_name_key UNIQUE (name);


--
-- Name: conservation_categories conservation_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conservation_categories
    ADD CONSTRAINT conservation_categories_pkey PRIMARY KEY (id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (code);


--
-- Name: country_subdivisions country_subdivisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_subdivisions
    ADD CONSTRAINT country_subdivisions_pkey PRIMARY KEY (code);


--
-- Name: device_managers device_managers_balena_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_balena_id_unique UNIQUE (balena_id);


--
-- Name: device_managers device_managers_balena_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_balena_uuid_unique UNIQUE (balena_uuid);


--
-- Name: device_managers device_managers_facility_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_facility_id_key UNIQUE (facility_id);


--
-- Name: device_managers device_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_pkey PRIMARY KEY (id);


--
-- Name: device_managers device_managers_short_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_short_code_key UNIQUE (sensor_kit_id);


--
-- Name: devices device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- Name: device_template_categories device_template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_template_categories
    ADD CONSTRAINT device_template_categories_pkey PRIMARY KEY (id);


--
-- Name: device_templates device_templates_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_templates
    ADD CONSTRAINT device_templates_category_id_name_key UNIQUE (category_id, name);


--
-- Name: device_templates device_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_templates
    ADD CONSTRAINT device_templates_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_types ecosystem_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_types
    ADD CONSTRAINT ecosystem_types_name_key UNIQUE (name);


--
-- Name: ecosystem_types ecosystem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_types
    ADD CONSTRAINT ecosystem_types_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_organization_id_type_id_facility_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_organization_id_type_id_facility_number_key UNIQUE (organization_id, type_id, facility_number);


--
-- Name: facility_connection_states facility_connection_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facility_connection_states
    ADD CONSTRAINT facility_connection_states_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: gbif_names gbif_names_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gbif_names
    ADD CONSTRAINT gbif_names_pkey PRIMARY KEY (id);


--
-- Name: gbif_taxa gbif_taxa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gbif_taxa
    ADD CONSTRAINT gbif_taxa_pkey PRIMARY KEY (taxon_id);


--
-- Name: seed_treatments germination_treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_treatments
    ADD CONSTRAINT germination_treatment_pkey PRIMARY KEY (id);


--
-- Name: global_roles global_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_roles
    ADD CONSTRAINT global_roles_name_key UNIQUE (name);


--
-- Name: global_roles global_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_roles
    ADD CONSTRAINT global_roles_pkey PRIMARY KEY (id);


--
-- Name: growth_forms growth_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.growth_forms
    ADD CONSTRAINT growth_forms_pkey PRIMARY KEY (id);


--
-- Name: identifier_sequences identifier_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identifier_sequences
    ADD CONSTRAINT identifier_sequences_pkey PRIMARY KEY (organization_id, prefix);


--
-- Name: internal_tags internal_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_name_key UNIQUE (name);


--
-- Name: internal_tags internal_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_backgroundjobservers jobrunr_backgroundjobservers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobrunr_backgroundjobservers
    ADD CONSTRAINT jobrunr_backgroundjobservers_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_jobs jobrunr_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobrunr_jobs
    ADD CONSTRAINT jobrunr_jobs_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_metadata jobrunr_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobrunr_metadata
    ADD CONSTRAINT jobrunr_metadata_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_migrations jobrunr_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobrunr_migrations
    ADD CONSTRAINT jobrunr_migrations_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_recurring_jobs jobrunr_recurring_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobrunr_recurring_jobs
    ADD CONSTRAINT jobrunr_recurring_jobs_pkey PRIMARY KEY (id);


--
-- Name: land_use_model_types land_use_model_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.land_use_model_types
    ADD CONSTRAINT land_use_model_types_name_key UNIQUE (name);


--
-- Name: land_use_model_types land_use_model_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.land_use_model_types
    ADD CONSTRAINT land_use_model_types_pkey PRIMARY KEY (id);


--
-- Name: managed_location_types managed_location_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managed_location_types
    ADD CONSTRAINT managed_location_types_pkey PRIMARY KEY (id);


--
-- Name: notification_criticalities notification_criticalities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_criticalities
    ADD CONSTRAINT notification_criticalities_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: reports one_org_report_per_quarter; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT one_org_report_per_quarter EXCLUDE USING btree (organization_id WITH =, year WITH =, quarter WITH =) WHERE ((project_id IS NULL));


--
-- Name: reports one_project_report_per_quarter; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT one_project_report_per_quarter UNIQUE (organization_id, project_id, year, quarter);


--
-- Name: organization_internal_tags organization_internal_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_pkey PRIMARY KEY (organization_id, internal_tag_id);


--
-- Name: organization_managed_location_types organization_managed_location_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managed_location_types
    ADD CONSTRAINT organization_managed_location_types_pkey PRIMARY KEY (organization_id, managed_location_type_id);


--
-- Name: organizations organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization_report_settings organization_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_report_settings
    ADD CONSTRAINT organization_report_settings_pkey PRIMARY KEY (organization_id);


--
-- Name: organization_types organization_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_types
    ADD CONSTRAINT organization_types_pkey PRIMARY KEY (id);


--
-- Name: organization_users organization_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (user_id, organization_id);


--
-- Name: report_photos photo_not_shared_between_reports; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT photo_not_shared_between_reports UNIQUE (file_id);


--
-- Name: files photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: files photos_storage_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_storage_url_key UNIQUE (storage_url);


--
-- Name: plant_material_sourcing_methods plant_material_sourcing_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_material_sourcing_methods
    ADD CONSTRAINT plant_material_sourcing_methods_pkey PRIMARY KEY (id);


--
-- Name: project_land_use_model_types project_land_use_model_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_land_use_model_types
    ADD CONSTRAINT project_land_use_model_types_pkey PRIMARY KEY (project_id, land_use_model_type_id);


--
-- Name: project_report_settings project_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_report_settings
    ADD CONSTRAINT project_report_settings_pkey PRIMARY KEY (project_id);


--
-- Name: projects projects_organization_id_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_id_key UNIQUE (organization_id, id);


--
-- Name: projects projects_organization_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_name_key UNIQUE (organization_id, name);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: regions regions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_name_key UNIQUE (name);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: report_files report_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_pkey PRIMARY KEY (file_id);


--
-- Name: report_photos report_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT report_photos_pkey PRIMARY KEY (report_id, file_id);


--
-- Name: report_statuses report_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_statuses
    ADD CONSTRAINT report_statuses_name_key UNIQUE (name);


--
-- Name: report_statuses report_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_statuses
    ADD CONSTRAINT report_statuses_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: seed_storage_behaviors seed_storage_behaviors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_storage_behaviors
    ADD CONSTRAINT seed_storage_behaviors_pkey PRIMARY KEY (id);


--
-- Name: facilities site_module_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_pkey PRIMARY KEY (id);


--
-- Name: facility_types site_module_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facility_types
    ADD CONSTRAINT site_module_type_pkey PRIMARY KEY (id);


--
-- Name: species_ecosystem_types species_ecosystem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_ecosystem_types
    ADD CONSTRAINT species_ecosystem_types_pkey PRIMARY KEY (species_id, ecosystem_type_id);


--
-- Name: species_growth_forms species_growth_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_growth_forms
    ADD CONSTRAINT species_growth_forms_pkey PRIMARY KEY (species_id, growth_form_id);


--
-- Name: species_native_categories species_native_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_native_categories
    ADD CONSTRAINT species_native_categories_pkey PRIMARY KEY (id);


--
-- Name: species species_organization_id_scientific_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_organization_id_scientific_name_key UNIQUE (organization_id, scientific_name);


--
-- Name: species species_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey1 PRIMARY KEY (id);


--
-- Name: species_plant_material_sourcing_methods species_plant_material_sourcing_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_plant_material_sourcing_methods
    ADD CONSTRAINT species_plant_material_sourcing_methods_pkey PRIMARY KEY (species_id, plant_material_sourcing_method_id);


--
-- Name: species_problem_fields species_problem_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_problem_fields
    ADD CONSTRAINT species_problem_fields_pkey PRIMARY KEY (id);


--
-- Name: species_problem_types species_problem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_problem_types
    ADD CONSTRAINT species_problem_types_pkey PRIMARY KEY (id);


--
-- Name: species_problems species_problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_pkey PRIMARY KEY (id);


--
-- Name: species_successional_groups species_successional_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_successional_groups
    ADD CONSTRAINT species_successional_groups_pkey PRIMARY KEY (species_id, successional_group_id);


--
-- Name: spring_session_attributes spring_session_attributes_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name);


--
-- Name: spring_session spring_session_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spring_session
    ADD CONSTRAINT spring_session_pk PRIMARY KEY (primary_id);


--
-- Name: sub_locations storage_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_location_pkey PRIMARY KEY (id);


--
-- Name: sub_locations storage_locations_facility_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_facility_id_name_key UNIQUE (facility_id, name);


--
-- Name: sub_locations sub_locations_facility_id_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT sub_locations_facility_id_id_key UNIQUE (facility_id, id);


--
-- Name: successional_groups successional_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.successional_groups
    ADD CONSTRAINT successional_groups_pkey PRIMARY KEY (id);


--
-- Name: thumbnails thumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_pkey PRIMARY KEY (id);


--
-- Name: thumbnails thumbnails_unique_height; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_height UNIQUE (file_id, height);


--
-- Name: thumbnails thumbnails_unique_storage_url; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_storage_url UNIQUE (storage_url);


--
-- Name: thumbnails thumbnails_unique_width; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_width UNIQUE (file_id, width);


--
-- Name: time_zones time_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_zones
    ADD CONSTRAINT time_zones_pkey PRIMARY KEY (time_zone);


--
-- Name: timeseries timeseries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_pkey PRIMARY KEY (id);


--
-- Name: timeseries_types timeseries_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries_types
    ADD CONSTRAINT timeseries_type_pkey PRIMARY KEY (id);


--
-- Name: timeseries timeseries_unique_name_per_device; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_unique_name_per_device UNIQUE (device_id, name);


--
-- Name: upload_problem_types upload_problem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upload_problem_types
    ADD CONSTRAINT upload_problem_types_pkey PRIMARY KEY (id);


--
-- Name: upload_problems upload_problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upload_problems
    ADD CONSTRAINT upload_problems_pkey PRIMARY KEY (id);


--
-- Name: upload_statuses upload_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upload_statuses
    ADD CONSTRAINT upload_statuses_pkey PRIMARY KEY (id);


--
-- Name: upload_types upload_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upload_types
    ADD CONSTRAINT upload_types_pkey PRIMARY KEY (id);


--
-- Name: uploads uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_pkey PRIMARY KEY (id);


--
-- Name: user_global_roles user_global_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_global_roles
    ADD CONSTRAINT user_global_roles_pkey PRIMARY KEY (user_id, global_role_id);


--
-- Name: user_types user_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_name_key UNIQUE (name);


--
-- Name: user_types user_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_pkey PRIMARY KEY (id);


--
-- Name: users users_auth_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wood_density_levels wood_density_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wood_density_levels
    ADD CONSTRAINT wood_density_levels_pkey PRIMARY KEY (id);


--
-- Name: accession_collectors accession_collectors_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_collectors
    ADD CONSTRAINT accession_collectors_pkey PRIMARY KEY (accession_id, "position");


--
-- Name: accessions accession_number_facility_unique; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_number_facility_unique UNIQUE (number, facility_id);


--
-- Name: accession_photos accession_photos_pk; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_photos
    ADD CONSTRAINT accession_photos_pk PRIMARY KEY (file_id);


--
-- Name: accessions accession_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_pkey PRIMARY KEY (id);


--
-- Name: accession_quantity_history accession_quantity_history_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_pkey PRIMARY KEY (id);


--
-- Name: accession_quantity_history_types accession_quantity_history_types_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_quantity_history_types
    ADD CONSTRAINT accession_quantity_history_types_pkey PRIMARY KEY (id);


--
-- Name: accession_states accession_state_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_states
    ADD CONSTRAINT accession_state_pkey PRIMARY KEY (id);


--
-- Name: bags bag_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.bags
    ADD CONSTRAINT bag_pkey PRIMARY KEY (id);


--
-- Name: geolocations collection_event_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.geolocations
    ADD CONSTRAINT collection_event_pkey PRIMARY KEY (id);


--
-- Name: collection_sources collection_sources_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.collection_sources
    ADD CONSTRAINT collection_sources_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: viability_test_seed_types germination_seed_type_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_seed_types
    ADD CONSTRAINT germination_seed_type_pkey PRIMARY KEY (id);


--
-- Name: viability_test_substrates germination_substrate_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_substrates
    ADD CONSTRAINT germination_substrate_pkey PRIMARY KEY (id);


--
-- Name: viability_test_types germination_test_type_name_key; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_types
    ADD CONSTRAINT germination_test_type_name_key UNIQUE (name);


--
-- Name: viability_test_types germination_test_type_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_types
    ADD CONSTRAINT germination_test_type_pkey PRIMARY KEY (id);


--
-- Name: seed_quantity_units seed_quantity_units_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.seed_quantity_units
    ADD CONSTRAINT seed_quantity_units_pkey PRIMARY KEY (id);


--
-- Name: viability_test_results viability_test_results_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_results
    ADD CONSTRAINT viability_test_results_pkey PRIMARY KEY (id);


--
-- Name: viability_tests viability_tests_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT viability_tests_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawal_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_purposes withdrawal_purpose_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawal_purposes
    ADD CONSTRAINT withdrawal_purpose_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_viability_test_id_unique; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_viability_test_id_unique UNIQUE (viability_test_id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_planting_site_id_id_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_planting_site_id_id_key UNIQUE (planting_site_id, id);


--
-- Name: deliveries deliveries_withdrawal_id_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_withdrawal_id_key UNIQUE (withdrawal_id);


--
-- Name: draft_planting_sites draft_planting_sites_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_pkey PRIMARY KEY (id);


--
-- Name: monitoring_plots monitoring_plots_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_pkey PRIMARY KEY (id);


--
-- Name: monitoring_plots monitoring_plots_planting_subzone_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_planting_subzone_id_name_key UNIQUE (planting_subzone_id, name);


--
-- Name: observable_conditions observable_conditions_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observable_conditions
    ADD CONSTRAINT observable_conditions_name_key UNIQUE (name);


--
-- Name: observable_conditions observable_conditions_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observable_conditions
    ADD CONSTRAINT observable_conditions_pkey PRIMARY KEY (id);


--
-- Name: observation_plot_positions observation_photo_positions_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plot_positions
    ADD CONSTRAINT observation_photo_positions_name_key UNIQUE (name);


--
-- Name: observation_plot_positions observation_photo_positions_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plot_positions
    ADD CONSTRAINT observation_photo_positions_pkey PRIMARY KEY (id);


--
-- Name: observation_photos observation_photos_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_pkey PRIMARY KEY (file_id);


--
-- Name: observation_plot_conditions observation_plot_conditions_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_pkey PRIMARY KEY (observation_id, monitoring_plot_id, condition_id);


--
-- Name: observation_plots observation_plots_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_pkey PRIMARY KEY (observation_id, monitoring_plot_id);


--
-- Name: observation_states observation_states_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_states
    ADD CONSTRAINT observation_states_name_key UNIQUE (name);


--
-- Name: observation_states observation_states_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_states
    ADD CONSTRAINT observation_states_pkey PRIMARY KEY (id);


--
-- Name: observations observations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observations
    ADD CONSTRAINT observations_pkey PRIMARY KEY (id);


--
-- Name: observed_plot_coordinates observed_plot_coordinates_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_pkey PRIMARY KEY (id);


--
-- Name: planting_seasons one_active_per_site; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_seasons
    ADD CONSTRAINT one_active_per_site EXCLUDE USING btree (planting_site_id WITH =) WHERE ((is_active = true));


--
-- Name: observed_plot_coordinates one_point_per_position; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT one_point_per_position UNIQUE (observation_id, monitoring_plot_id, position_id);


--
-- Name: planting_seasons planting_seasons_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_seasons
    ADD CONSTRAINT planting_seasons_pkey PRIMARY KEY (id);


--
-- Name: planting_site_histories planting_site_histories_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_histories
    ADD CONSTRAINT planting_site_histories_pkey PRIMARY KEY (id);


--
-- Name: planting_site_notifications planting_site_notifications_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_pkey PRIMARY KEY (id);


--
-- Name: planting_site_notifications planting_site_notifications_planting_site_id_notification_t_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_planting_site_id_notification_t_key UNIQUE (planting_site_id, notification_type_id, notification_number);


--
-- Name: planting_site_populations planting_site_populations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_populations
    ADD CONSTRAINT planting_site_populations_pkey PRIMARY KEY (planting_site_id, species_id);


--
-- Name: planting_sites planting_sites_organization_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_organization_id_name_key UNIQUE (organization_id, name);


--
-- Name: planting_sites planting_sites_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_pkey PRIMARY KEY (id);


--
-- Name: planting_subzone_histories planting_subzone_histories_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzone_histories
    ADD CONSTRAINT planting_subzone_histories_pkey PRIMARY KEY (id);


--
-- Name: planting_subzone_populations planting_subzone_populations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzone_populations
    ADD CONSTRAINT planting_subzone_populations_pkey PRIMARY KEY (planting_subzone_id, species_id);


--
-- Name: planting_types planting_types_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_types
    ADD CONSTRAINT planting_types_pkey PRIMARY KEY (id);


--
-- Name: planting_zone_histories planting_zone_histories_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zone_histories
    ADD CONSTRAINT planting_zone_histories_pkey PRIMARY KEY (id);


--
-- Name: planting_zone_populations planting_zone_populations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zone_populations
    ADD CONSTRAINT planting_zone_populations_pkey PRIMARY KEY (planting_zone_id, species_id);


--
-- Name: planting_zones planting_zones_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_pkey PRIMARY KEY (id);


--
-- Name: planting_zones planting_zones_planting_site_id_id_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_planting_site_id_id_key UNIQUE (planting_site_id, id);


--
-- Name: planting_zones planting_zones_planting_site_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_planting_site_id_name_key UNIQUE (planting_site_id, name);


--
-- Name: plantings plantings_delivery_id_species_id_planting_type_id_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_delivery_id_species_id_planting_type_id_key UNIQUE (delivery_id, species_id, planting_type_id);


--
-- Name: plantings plantings_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_pkey PRIMARY KEY (id);


--
-- Name: planting_subzones plots_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_pkey PRIMARY KEY (id);


--
-- Name: planting_subzones plots_planting_site_id_id_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_site_id_id_key UNIQUE (planting_site_id, id);


--
-- Name: planting_subzones plots_planting_zone_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_zone_id_name_key UNIQUE (planting_zone_id, name);


--
-- Name: recorded_plant_statuses recorded_plant_statuses_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plant_statuses
    ADD CONSTRAINT recorded_plant_statuses_name_key UNIQUE (name);


--
-- Name: recorded_plant_statuses recorded_plant_statuses_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plant_statuses
    ADD CONSTRAINT recorded_plant_statuses_pkey PRIMARY KEY (id);


--
-- Name: recorded_plants recorded_plants_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_pkey PRIMARY KEY (id);


--
-- Name: recorded_species_certainties recorded_species_certainties_name_key; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_species_certainties
    ADD CONSTRAINT recorded_species_certainties_name_key UNIQUE (name);


--
-- Name: recorded_species_certainties recorded_species_certainties_pkey; Type: CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_species_certainties
    ADD CONSTRAINT recorded_species_certainties_pkey PRIMARY KEY (id);


--
-- Name: cohort_modules_cohort_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX cohort_modules_cohort_id_idx ON accelerator.cohort_modules USING btree (cohort_id);


--
-- Name: cohort_modules_cohort_id_start_date_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX cohort_modules_cohort_id_start_date_idx ON accelerator.cohort_modules USING btree (cohort_id, start_date);


--
-- Name: cohort_modules_module_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX cohort_modules_module_id_idx ON accelerator.cohort_modules USING btree (module_id);


--
-- Name: cohorts_created_by_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX cohorts_created_by_idx ON accelerator.cohorts USING btree (created_by);


--
-- Name: cohorts_modified_by_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX cohorts_modified_by_idx ON accelerator.cohorts USING btree (modified_by);


--
-- Name: participant_project_species_species_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX participant_project_species_species_id_idx ON accelerator.participant_project_species USING btree (species_id);


--
-- Name: participants_cohort_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX participants_cohort_id_idx ON accelerator.participants USING btree (cohort_id);


--
-- Name: participants_created_by_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX participants_created_by_idx ON accelerator.participants USING btree (created_by);


--
-- Name: participants_modified_by_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX participants_modified_by_idx ON accelerator.participants USING btree (modified_by);


--
-- Name: project_scores_project_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX project_scores_project_id_idx ON accelerator.project_scores USING btree (project_id);


--
-- Name: project_vote_decisions_project_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX project_vote_decisions_project_id_idx ON accelerator.project_vote_decisions USING btree (project_id);


--
-- Name: project_votes_project_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX project_votes_project_id_idx ON accelerator.project_votes USING btree (project_id);


--
-- Name: submission_documents_submission_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX submission_documents_submission_id_idx ON accelerator.submission_documents USING btree (submission_id);


--
-- Name: submission_snapshots_file_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX submission_snapshots_file_id_idx ON accelerator.submission_snapshots USING btree (file_id);


--
-- Name: submission_snapshots_submission_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX submission_snapshots_submission_id_idx ON accelerator.submission_snapshots USING btree (submission_id);


--
-- Name: submissions_deliverable_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX submissions_deliverable_id_idx ON accelerator.submissions USING btree (deliverable_id);


--
-- Name: submissions_project_id_idx; Type: INDEX; Schema: accelerator; Owner: -
--

CREATE INDEX submissions_project_id_idx ON accelerator.submissions USING btree (project_id);


--
-- Name: batch_details_history_created_by_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_details_history_created_by_idx ON nursery.batch_details_history USING btree (created_by);


--
-- Name: batch_details_history_project_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_details_history_project_id_idx ON nursery.batch_details_history USING btree (project_id);


--
-- Name: batch_details_history_sub_locations_sub_location_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_details_history_sub_locations_sub_location_id_idx ON nursery.batch_details_history_sub_locations USING btree (sub_location_id);


--
-- Name: batch_photos_batch_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_photos_batch_id_idx ON nursery.batch_photos USING btree (batch_id);


--
-- Name: batch_quantity_history_batch_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_quantity_history_batch_id_idx ON nursery.batch_quantity_history USING btree (batch_id);


--
-- Name: batch_sub_locations_sub_location_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_sub_locations_sub_location_id_idx ON nursery.batch_sub_locations USING btree (sub_location_id);


--
-- Name: batch_withdrawals_destination_batch_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_withdrawals_destination_batch_id_idx ON nursery.batch_withdrawals USING btree (destination_batch_id);


--
-- Name: batch_withdrawals_withdrawal_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_withdrawals_withdrawal_id_idx ON nursery.batch_withdrawals USING btree (withdrawal_id);


--
-- Name: batches__species_id_ix; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batches__species_id_ix ON nursery.batches USING btree (species_id);


--
-- Name: batches_initial_batch_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batches_initial_batch_id_idx ON nursery.batches USING btree (initial_batch_id);


--
-- Name: batches_organization_id_species_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batches_organization_id_species_id_idx ON nursery.batches USING btree (organization_id, species_id);


--
-- Name: batches_project_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batches_project_id_idx ON nursery.batches USING btree (project_id);


--
-- Name: withdrawal_photos_withdrawal_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX withdrawal_photos_withdrawal_id_idx ON nursery.withdrawal_photos USING btree (withdrawal_id);


--
-- Name: withdrawals_destination_facility_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX withdrawals_destination_facility_id_idx ON nursery.withdrawals USING btree (destination_facility_id);


--
-- Name: withdrawals_facility_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX withdrawals_facility_id_idx ON nursery.withdrawals USING btree (facility_id);


--
-- Name: automations_device_id_timeseries_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automations_device_id_timeseries_name_idx ON public.automations USING btree (device_id, timeseries_name);


--
-- Name: automations_facility_id_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automations_facility_id_name_idx ON public.automations USING btree (facility_id, name);


--
-- Name: country_subdivisions_country_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX country_subdivisions_country_code_idx ON public.country_subdivisions USING btree (country_code);


--
-- Name: device_managers_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX device_managers_user_id_idx ON public.device_managers USING btree (user_id);


--
-- Name: facilities_idle_after_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facilities_idle_after_time_idx ON public.facilities USING btree (idle_after_time);


--
-- Name: facilities_next_notification_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facilities_next_notification_time_idx ON public.facilities USING btree (next_notification_time);


--
-- Name: facilities_organization_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facilities_organization_id_idx ON public.facilities USING btree (organization_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: gbif_distributions_taxon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_distributions_taxon_id_idx ON public.gbif_distributions USING btree (taxon_id);


--
-- Name: gbif_name_words_gbif_name_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_name_words_gbif_name_id_idx ON public.gbif_name_words USING btree (gbif_name_id);


--
-- Name: gbif_name_words_word_gbif_name_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_name_words_word_gbif_name_id_idx ON public.gbif_name_words USING btree (word, gbif_name_id);


--
-- Name: gbif_names__name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_names__name_trgm ON public.gbif_names USING gin (name public.gin_trgm_ops);


--
-- Name: gbif_names_name_is_scientific_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_names_name_is_scientific_idx ON public.gbif_names USING btree (name, is_scientific);


--
-- Name: gbif_names_taxon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_names_taxon_id_idx ON public.gbif_names USING btree (taxon_id);


--
-- Name: gbif_vernacular_names_taxon_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gbif_vernacular_names_taxon_id_idx ON public.gbif_vernacular_names USING btree (taxon_id);


--
-- Name: jobrunr_bgjobsrvrs_fsthb_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_bgjobsrvrs_fsthb_idx ON public.jobrunr_backgroundjobservers USING btree (firstheartbeat);


--
-- Name: jobrunr_bgjobsrvrs_lsthb_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_bgjobsrvrs_lsthb_idx ON public.jobrunr_backgroundjobservers USING btree (lastheartbeat);


--
-- Name: jobrunr_job_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_job_created_at_idx ON public.jobrunr_jobs USING btree (createdat);


--
-- Name: jobrunr_job_rci_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_job_rci_idx ON public.jobrunr_jobs USING btree (recurringjobid);


--
-- Name: jobrunr_job_scheduled_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_job_scheduled_at_idx ON public.jobrunr_jobs USING btree (scheduledat);


--
-- Name: jobrunr_job_signature_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_job_signature_idx ON public.jobrunr_jobs USING btree (jobsignature);


--
-- Name: jobrunr_jobs_state_updated_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_jobs_state_updated_idx ON public.jobrunr_jobs USING btree (state, updatedat);


--
-- Name: jobrunr_recurring_job_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_recurring_job_created_at_idx ON public.jobrunr_recurring_jobs USING btree (createdat);


--
-- Name: jobrunr_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobrunr_state_idx ON public.jobrunr_jobs USING btree (state);


--
-- Name: organization_users_contact_uk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX organization_users_contact_uk ON public.organization_users USING btree (organization_id) WHERE (role_id = 5);


--
-- Name: organization_users_organization_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organization_users_organization_id_idx ON public.organization_users USING btree (organization_id);


--
-- Name: projects_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_created_by_idx ON public.projects USING btree (created_by);


--
-- Name: projects_modified_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_modified_by_idx ON public.projects USING btree (modified_by);


--
-- Name: projects_participant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_participant_id_idx ON public.projects USING btree (participant_id);


--
-- Name: report_files_report_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_files_report_id_idx ON public.report_files USING btree (report_id);


--
-- Name: reports_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_project_id_idx ON public.reports USING btree (project_id);


--
-- Name: species__not_checked_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species__not_checked_ix ON public.species USING btree (id) WHERE (checked_time IS NULL);


--
-- Name: species_growth_forms_species_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_growth_forms_species_id_idx ON public.species_growth_forms USING btree (species_id);


--
-- Name: species_organization_id_initial_scientific_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_organization_id_initial_scientific_name_idx ON public.species USING btree (organization_id, initial_scientific_name);


--
-- Name: species_plant_material_sourcing_methods_species_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_plant_material_sourcing_methods_species_id_idx ON public.species_plant_material_sourcing_methods USING btree (species_id);


--
-- Name: species_problems_species_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_problems_species_id_idx ON public.species_problems USING btree (species_id);


--
-- Name: species_successional_groups_species_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_successional_groups_species_id_idx ON public.species_successional_groups USING btree (species_id);


--
-- Name: spring_session_ix1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX spring_session_ix1 ON public.spring_session USING btree (session_id);


--
-- Name: spring_session_ix2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spring_session_ix2 ON public.spring_session USING btree (expiry_time);


--
-- Name: spring_session_ix3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spring_session_ix3 ON public.spring_session USING btree (principal_name);


--
-- Name: timeseries_value_timeseries_id_created_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX timeseries_value_timeseries_id_created_time_idx ON public.timeseries_values USING btree (timeseries_id, created_time DESC);


--
-- Name: upload_problems_upload_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX upload_problems_upload_id_idx ON public.upload_problems USING btree (upload_id);


--
-- Name: uploads_facility_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX uploads_facility_id_idx ON public.uploads USING btree (facility_id);


--
-- Name: user_global_roles_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_global_roles_user_id_idx ON public.user_global_roles USING btree (user_id);


--
-- Name: user_preferences_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_preferences_user_id_idx ON public.user_preferences USING btree (user_id) WHERE (organization_id IS NULL);


--
-- Name: user_preferences_user_id_organization_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_preferences_user_id_organization_id_idx ON public.user_preferences USING btree (user_id, organization_id) WHERE (organization_id IS NOT NULL);


--
-- Name: accession__number_trgm; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accession__number_trgm ON seedbank.accessions USING gin (number public.gin_trgm_ops);


--
-- Name: accession__received_date_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accession__received_date_ix ON seedbank.accessions USING btree (received_date);


--
-- Name: accession_created_time_idx; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accession_created_time_idx ON seedbank.accessions USING btree (created_time);


--
-- Name: accession_quantity_history_accession_id_idx; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accession_quantity_history_accession_id_idx ON seedbank.accession_quantity_history USING btree (accession_id);


--
-- Name: accession_state_history_accession_id_idx; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accession_state_history_accession_id_idx ON seedbank.accession_state_history USING btree (accession_id);


--
-- Name: accession_state_history_new_state_id_updated_time_idx; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accession_state_history_new_state_id_updated_time_idx ON seedbank.accession_state_history USING btree (new_state_id, updated_time);


--
-- Name: accessions__facility_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accessions__facility_id_ix ON seedbank.accessions USING btree (facility_id);


--
-- Name: accessions__species_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accessions__species_id_ix ON seedbank.accessions USING btree (species_id);


--
-- Name: accessions_project_id_idx; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX accessions_project_id_idx ON seedbank.accessions USING btree (project_id);


--
-- Name: geolocation__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX geolocation__accession_id_ix ON seedbank.geolocations USING btree (accession_id);


--
-- Name: viability_test__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX viability_test__accession_id_ix ON seedbank.viability_tests USING btree (accession_id);


--
-- Name: viability_test_results__test_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX viability_test_results__test_id_ix ON seedbank.viability_test_results USING btree (test_id);


--
-- Name: viability_tests__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX viability_tests__accession_id_ix ON seedbank.viability_tests USING btree (accession_id);


--
-- Name: withdrawal__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX withdrawal__accession_id_ix ON seedbank.withdrawals USING btree (accession_id);


--
-- Name: withdrawal__date_ix; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX withdrawal__date_ix ON seedbank.withdrawals USING btree (date);


--
-- Name: withdrawals_batch_id_idx; Type: INDEX; Schema: seedbank; Owner: -
--

CREATE INDEX withdrawals_batch_id_idx ON seedbank.withdrawals USING btree (batch_id);


--
-- Name: draft_planting_sites_organization_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX draft_planting_sites_organization_id_idx ON tracking.draft_planting_sites USING btree (organization_id);


--
-- Name: draft_planting_sites_project_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX draft_planting_sites_project_id_idx ON tracking.draft_planting_sites USING btree (project_id);


--
-- Name: observation_photos_file_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observation_photos_file_id_idx ON tracking.observation_photos USING btree (file_id);


--
-- Name: observation_photos_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observation_photos_monitoring_plot_id_idx ON tracking.observation_photos USING btree (monitoring_plot_id);


--
-- Name: observation_plot_conditions_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observation_plot_conditions_monitoring_plot_id_idx ON tracking.observation_plot_conditions USING btree (monitoring_plot_id);


--
-- Name: observation_plots_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observation_plots_monitoring_plot_id_idx ON tracking.observation_plots USING btree (monitoring_plot_id);


--
-- Name: observations_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observations_planting_site_id_idx ON tracking.observations USING btree (planting_site_id);


--
-- Name: observed_plot_species_totals_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_plot_species_totals_monitoring_plot_id_idx ON tracking.observed_plot_species_totals USING btree (monitoring_plot_id);


--
-- Name: observed_plot_species_totals_observation_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_plot_species_totals_observation_id_idx ON tracking.observed_plot_species_totals USING btree (observation_id);


--
-- Name: observed_plot_species_totals_observation_id_monitoring_plo_idx1; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_plot_species_totals_observation_id_monitoring_plo_idx1 ON tracking.observed_plot_species_totals USING btree (observation_id, monitoring_plot_id, species_name) WHERE (species_name IS NOT NULL);


--
-- Name: observed_plot_species_totals_observation_id_monitoring_plo_idx2; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_plot_species_totals_observation_id_monitoring_plo_idx2 ON tracking.observed_plot_species_totals USING btree (observation_id, monitoring_plot_id) WHERE ((species_id IS NULL) AND (species_name IS NULL));


--
-- Name: observed_plot_species_totals_observation_id_monitoring_plot_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_plot_species_totals_observation_id_monitoring_plot_idx ON tracking.observed_plot_species_totals USING btree (observation_id, monitoring_plot_id, species_id) WHERE (species_id IS NOT NULL);


--
-- Name: observed_plot_species_totals_species_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_plot_species_totals_species_id_idx ON tracking.observed_plot_species_totals USING btree (species_id);


--
-- Name: observed_site_species_totals_observation_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_site_species_totals_observation_id_idx ON tracking.observed_site_species_totals USING btree (observation_id);


--
-- Name: observed_site_species_totals_observation_id_planting_site__idx1; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_site_species_totals_observation_id_planting_site__idx1 ON tracking.observed_site_species_totals USING btree (observation_id, planting_site_id, species_name) WHERE (species_name IS NOT NULL);


--
-- Name: observed_site_species_totals_observation_id_planting_site__idx2; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_site_species_totals_observation_id_planting_site__idx2 ON tracking.observed_site_species_totals USING btree (observation_id, planting_site_id) WHERE ((species_id IS NULL) AND (species_name IS NULL));


--
-- Name: observed_site_species_totals_observation_id_planting_site_i_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_site_species_totals_observation_id_planting_site_i_idx ON tracking.observed_site_species_totals USING btree (observation_id, planting_site_id, species_id) WHERE (species_id IS NOT NULL);


--
-- Name: observed_site_species_totals_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_site_species_totals_planting_site_id_idx ON tracking.observed_site_species_totals USING btree (planting_site_id);


--
-- Name: observed_site_species_totals_species_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_site_species_totals_species_id_idx ON tracking.observed_site_species_totals USING btree (species_id);


--
-- Name: observed_zone_species_totals_observation_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_zone_species_totals_observation_id_idx ON tracking.observed_zone_species_totals USING btree (observation_id);


--
-- Name: observed_zone_species_totals_observation_id_planting_zone__idx1; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_zone_species_totals_observation_id_planting_zone__idx1 ON tracking.observed_zone_species_totals USING btree (observation_id, planting_zone_id, species_name) WHERE (species_name IS NOT NULL);


--
-- Name: observed_zone_species_totals_observation_id_planting_zone__idx2; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_zone_species_totals_observation_id_planting_zone__idx2 ON tracking.observed_zone_species_totals USING btree (observation_id, planting_zone_id) WHERE ((species_id IS NULL) AND (species_name IS NULL));


--
-- Name: observed_zone_species_totals_observation_id_planting_zone_i_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE UNIQUE INDEX observed_zone_species_totals_observation_id_planting_zone_i_idx ON tracking.observed_zone_species_totals USING btree (observation_id, planting_zone_id, species_id) WHERE (species_id IS NOT NULL);


--
-- Name: observed_zone_species_totals_planting_zone_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_zone_species_totals_planting_zone_id_idx ON tracking.observed_zone_species_totals USING btree (planting_zone_id);


--
-- Name: observed_zone_species_totals_species_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX observed_zone_species_totals_species_id_idx ON tracking.observed_zone_species_totals USING btree (species_id);


--
-- Name: planting_seasons_is_active_end_time_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_seasons_is_active_end_time_idx ON tracking.planting_seasons USING btree (is_active, end_time);


--
-- Name: planting_seasons_is_active_start_time_end_time_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_seasons_is_active_start_time_end_time_idx ON tracking.planting_seasons USING btree (is_active, start_time, end_time);


--
-- Name: planting_seasons_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_seasons_planting_site_id_idx ON tracking.planting_seasons USING btree (planting_site_id);


--
-- Name: planting_site_histories_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_site_histories_planting_site_id_idx ON tracking.planting_site_histories USING btree (planting_site_id);


--
-- Name: planting_sites_project_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_sites_project_id_idx ON tracking.planting_sites USING btree (project_id);


--
-- Name: planting_subzone_histories_planting_subzone_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_subzone_histories_planting_subzone_id_idx ON tracking.planting_subzone_histories USING btree (planting_subzone_id);


--
-- Name: planting_subzone_histories_planting_zone_history_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_subzone_histories_planting_zone_history_id_idx ON tracking.planting_subzone_histories USING btree (planting_zone_history_id);


--
-- Name: planting_zone_histories_planting_site_history_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_zone_histories_planting_site_history_id_idx ON tracking.planting_zone_histories USING btree (planting_site_history_id);


--
-- Name: planting_zone_histories_planting_zone_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX planting_zone_histories_planting_zone_id_idx ON tracking.planting_zone_histories USING btree (planting_zone_id);


--
-- Name: plantings_delivery_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX plantings_delivery_id_idx ON tracking.plantings USING btree (delivery_id);


--
-- Name: plantings_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX plantings_plot_id_idx ON tracking.plantings USING btree (planting_subzone_id);


--
-- Name: plantings_species_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX plantings_species_id_idx ON tracking.plantings USING btree (species_id);


--
-- Name: recorded_plants_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX recorded_plants_monitoring_plot_id_idx ON tracking.recorded_plants USING btree (monitoring_plot_id);


--
-- Name: recorded_plants_observation_id_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX recorded_plants_observation_id_monitoring_plot_id_idx ON tracking.recorded_plants USING btree (observation_id, monitoring_plot_id);


--
-- Name: recorded_plants_species_id_idx; Type: INDEX; Schema: tracking; Owner: -
--

CREATE INDEX recorded_plants_species_id_idx ON tracking.recorded_plants USING btree (species_id);


--
-- Name: cohort_modules cohort_modules_cohort_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT cohort_modules_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES accelerator.cohorts(id);


--
-- Name: cohort_modules cohort_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT cohort_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES accelerator.modules(id);


--
-- Name: cohorts cohorts_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cohorts cohorts_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: cohorts cohorts_phase_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES accelerator.cohort_phases(id);


--
-- Name: deal_stages deal_stages_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deal_stages
    ADD CONSTRAINT deal_stages_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES accelerator.pipelines(id);


--
-- Name: default_voters default_voters_user_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.default_voters
    ADD CONSTRAINT default_voters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: deliverable_cohort_due_dates deliverable_cohort_due_dates_cohort_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_cohort_due_dates
    ADD CONSTRAINT deliverable_cohort_due_dates_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES accelerator.cohorts(id) ON DELETE CASCADE;


--
-- Name: deliverable_cohort_due_dates deliverable_cohort_due_dates_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_cohort_due_dates
    ADD CONSTRAINT deliverable_cohort_due_dates_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES accelerator.deliverables(id) ON DELETE CASCADE;


--
-- Name: deliverable_documents deliverable_documents_deliverable_id_deliverable_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_deliverable_id_deliverable_type_id_fkey FOREIGN KEY (deliverable_id, deliverable_type_id) REFERENCES accelerator.deliverables(id, deliverable_type_id);


--
-- Name: deliverable_documents deliverable_documents_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES accelerator.deliverables(id);


--
-- Name: deliverable_documents deliverable_documents_deliverable_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_deliverable_type_id_fkey FOREIGN KEY (deliverable_type_id) REFERENCES accelerator.deliverable_types(id);


--
-- Name: deliverable_project_due_dates deliverable_project_due_dates_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_project_due_dates
    ADD CONSTRAINT deliverable_project_due_dates_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES accelerator.deliverables(id) ON DELETE CASCADE;


--
-- Name: deliverable_project_due_dates deliverable_project_due_dates_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverable_project_due_dates
    ADD CONSTRAINT deliverable_project_due_dates_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: deliverables deliverables_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: deliverables deliverables_deliverable_category_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_deliverable_category_id_fkey FOREIGN KEY (deliverable_category_id) REFERENCES accelerator.deliverable_categories(id);


--
-- Name: deliverables deliverables_deliverable_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_deliverable_type_id_fkey FOREIGN KEY (deliverable_type_id) REFERENCES accelerator.deliverable_types(id);


--
-- Name: deliverables deliverables_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: deliverables deliverables_module_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_module_id_fkey FOREIGN KEY (module_id) REFERENCES accelerator.modules(id);


--
-- Name: event_projects event_projects_event_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_projects
    ADD CONSTRAINT event_projects_event_id_fkey FOREIGN KEY (event_id) REFERENCES accelerator.events(id) ON DELETE CASCADE;


--
-- Name: event_projects event_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.event_projects
    ADD CONSTRAINT event_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: events events_event_status_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.events
    ADD CONSTRAINT events_event_status_id_fkey FOREIGN KEY (event_status_id) REFERENCES accelerator.event_statuses(id);


--
-- Name: events events_event_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.events
    ADD CONSTRAINT events_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES accelerator.event_types(id);


--
-- Name: events events_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.events
    ADD CONSTRAINT events_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: events events_module_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.events
    ADD CONSTRAINT events_module_id_fkey FOREIGN KEY (module_id) REFERENCES accelerator.modules(id) ON DELETE CASCADE;


--
-- Name: modules modules_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: modules modules_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: modules modules_phase_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES accelerator.cohort_phases(id);


--
-- Name: participant_project_species participant_project_species_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: participant_project_species participant_project_species_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: participant_project_species participant_project_species_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: participant_project_species participant_project_species_species_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: participant_project_species participant_project_species_species_native_category_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_species_native_category_id_fkey FOREIGN KEY (species_native_category_id) REFERENCES public.species_native_categories(id);


--
-- Name: participant_project_species participant_project_species_submission_status_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participant_project_species
    ADD CONSTRAINT participant_project_species_submission_status_id_fkey FOREIGN KEY (submission_status_id) REFERENCES accelerator.submission_statuses(id);


--
-- Name: participants participants_cohort_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES accelerator.cohorts(id);


--
-- Name: participants participants_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: participants participants_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: project_accelerator_details project_accelerator_details_deal_stage_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_accelerator_details
    ADD CONSTRAINT project_accelerator_details_deal_stage_id_fkey FOREIGN KEY (deal_stage_id) REFERENCES accelerator.deal_stages(id);


--
-- Name: project_accelerator_details project_accelerator_details_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_accelerator_details
    ADD CONSTRAINT project_accelerator_details_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES accelerator.pipelines(id);


--
-- Name: project_accelerator_details project_accelerator_details_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_accelerator_details
    ADD CONSTRAINT project_accelerator_details_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_scores project_scores_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_scores
    ADD CONSTRAINT project_scores_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_scores project_scores_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_scores
    ADD CONSTRAINT project_scores_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: project_scores project_scores_phase_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_scores
    ADD CONSTRAINT project_scores_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES accelerator.cohort_phases(id);


--
-- Name: project_scores project_scores_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_scores
    ADD CONSTRAINT project_scores_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_scores project_scores_score_category_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_scores
    ADD CONSTRAINT project_scores_score_category_id_fkey FOREIGN KEY (score_category_id) REFERENCES accelerator.score_categories(id);


--
-- Name: project_vote_decisions project_vote_decisions_phase_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_vote_decisions
    ADD CONSTRAINT project_vote_decisions_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES accelerator.cohort_phases(id);


--
-- Name: project_vote_decisions project_vote_decisions_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_vote_decisions
    ADD CONSTRAINT project_vote_decisions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_vote_decisions project_vote_decisions_vote_option_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_vote_decisions
    ADD CONSTRAINT project_vote_decisions_vote_option_id_fkey FOREIGN KEY (vote_option_id) REFERENCES accelerator.vote_options(id);


--
-- Name: project_votes project_votes_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_votes project_votes_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: project_votes project_votes_phase_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES accelerator.cohort_phases(id);


--
-- Name: project_votes project_votes_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_votes project_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_votes project_votes_vote_option_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.project_votes
    ADD CONSTRAINT project_votes_vote_option_id_fkey FOREIGN KEY (vote_option_id) REFERENCES accelerator.vote_options(id);


--
-- Name: submission_documents submission_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: submission_documents submission_documents_document_store_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_document_store_id_fkey FOREIGN KEY (document_store_id) REFERENCES accelerator.document_stores(id);


--
-- Name: submission_documents submission_documents_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: submission_documents submission_documents_submission_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES accelerator.submissions(id);


--
-- Name: submission_snapshots submission_snapshots_file_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_snapshots
    ADD CONSTRAINT submission_snapshots_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: submission_snapshots submission_snapshots_submission_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submission_snapshots
    ADD CONSTRAINT submission_snapshots_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES accelerator.submissions(id);


--
-- Name: submissions submissions_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: submissions submissions_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES accelerator.deliverables(id);


--
-- Name: submissions submissions_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: submissions submissions_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_submission_status_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: -
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_submission_status_id_fkey FOREIGN KEY (submission_status_id) REFERENCES accelerator.submission_statuses(id);


--
-- Name: batch_details_history batch_details_history_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_details_history batch_details_history_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batch_details_history batch_details_history_project_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: batch_details_history_sub_locations batch_details_history_sub_locatio_batch_details_history_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history_sub_locations
    ADD CONSTRAINT batch_details_history_sub_locatio_batch_details_history_id_fkey FOREIGN KEY (batch_details_history_id) REFERENCES nursery.batch_details_history(id) ON DELETE CASCADE;


--
-- Name: batch_details_history_sub_locations batch_details_history_sub_locations_sub_location_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history_sub_locations
    ADD CONSTRAINT batch_details_history_sub_locations_sub_location_id_fkey FOREIGN KEY (sub_location_id) REFERENCES public.sub_locations(id) ON DELETE SET NULL;


--
-- Name: batch_details_history batch_details_history_substrate_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES nursery.batch_substrates(id);


--
-- Name: batch_details_history batch_details_history_treatment_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.seed_treatments(id);


--
-- Name: batch_photos batch_photos_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id);


--
-- Name: batch_photos batch_photos_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batch_photos batch_photos_deleted_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: batch_photos batch_photos_file_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE SET NULL;


--
-- Name: batch_quantity_history batch_quantity_history_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_quantity_history batch_quantity_history_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batch_quantity_history batch_quantity_history_history_type_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_history_type_id_fkey FOREIGN KEY (history_type_id) REFERENCES nursery.batch_quantity_history_types(id);


--
-- Name: batch_quantity_history batch_quantity_history_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: batch_sub_locations batch_sub_locations_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_sub_locations batch_sub_locations_facility_id_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_facility_id_batch_id_fkey FOREIGN KEY (facility_id, batch_id) REFERENCES nursery.batches(facility_id, id);


--
-- Name: batch_sub_locations batch_sub_locations_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: batch_sub_locations batch_sub_locations_facility_id_sub_location_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_facility_id_sub_location_id_fkey FOREIGN KEY (facility_id, sub_location_id) REFERENCES public.sub_locations(facility_id, id);


--
-- Name: batch_sub_locations batch_sub_locations_sub_location_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_sub_location_id_fkey FOREIGN KEY (sub_location_id) REFERENCES public.sub_locations(id) ON DELETE CASCADE;


--
-- Name: batch_withdrawals batch_withdrawals_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_withdrawals batch_withdrawals_destination_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_destination_batch_id_fkey FOREIGN KEY (destination_batch_id) REFERENCES nursery.batches(id) ON DELETE SET NULL;


--
-- Name: batch_withdrawals batch_withdrawals_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: batches batches_accession_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE SET NULL;


--
-- Name: batches batches_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batches batches_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: batches batches_initial_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_initial_batch_id_fkey FOREIGN KEY (initial_batch_id) REFERENCES nursery.batches(id) ON DELETE SET NULL;


--
-- Name: batches batches_modified_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: batches batches_organization_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: batches batches_project_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: batches batches_species_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: batches batches_substrate_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES nursery.batch_substrates(id);


--
-- Name: batches batches_treatment_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.seed_treatments(id);


--
-- Name: withdrawal_photos withdrawal_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawal_photos
    ADD CONSTRAINT withdrawal_photos_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: withdrawal_photos withdrawal_photos_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawal_photos
    ADD CONSTRAINT withdrawal_photos_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id);


--
-- Name: withdrawals withdrawals_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_destination_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_destination_facility_id_fkey FOREIGN KEY (destination_facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_modified_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_purpose_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_purpose_id_fkey FOREIGN KEY (purpose_id) REFERENCES nursery.withdrawal_purposes(id);


--
-- Name: withdrawals withdrawals_undoes_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_undoes_withdrawal_id_fkey FOREIGN KEY (undoes_withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: automations automations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: automations automations_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: automations automations_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: automations automations_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: countries countries_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: country_subdivisions country_subdivisions_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country_subdivisions
    ADD CONSTRAINT country_subdivisions_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: device_managers device_managers_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: device_managers device_managers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: device_templates device_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_templates
    ADD CONSTRAINT device_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.device_template_categories(id);


--
-- Name: devices devices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: devices devices_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: devices devices_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: devices devices_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.devices(id);


--
-- Name: facilities facilities_connection_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_connection_state_id_fkey FOREIGN KEY (connection_state_id) REFERENCES public.facility_connection_states(id);


--
-- Name: facilities facilities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: facilities facilities_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: facilities facilities_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_time_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: gbif_name_words gbif_name_words_gbif_name_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gbif_name_words
    ADD CONSTRAINT gbif_name_words_gbif_name_id_fkey FOREIGN KEY (gbif_name_id) REFERENCES public.gbif_names(id);


--
-- Name: gbif_names gbif_names_taxon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gbif_names
    ADD CONSTRAINT gbif_names_taxon_id_fkey FOREIGN KEY (taxon_id) REFERENCES public.gbif_taxa(taxon_id);


--
-- Name: identifier_sequences identifier_sequences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identifier_sequences
    ADD CONSTRAINT identifier_sequences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: internal_tags internal_tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: internal_tags internal_tags_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: notification_types notification_types_notification_criticality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_notification_criticality_id_fkey FOREIGN KEY (notification_criticality_id) REFERENCES public.notification_criticalities(id);


--
-- Name: notifications notifications_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id);


--
-- Name: notifications notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organization_internal_tags organization_internal_tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organization_internal_tags organization_internal_tags_internal_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_internal_tag_id_fkey FOREIGN KEY (internal_tag_id) REFERENCES public.internal_tags(id) ON DELETE CASCADE;


--
-- Name: organization_internal_tags organization_internal_tags_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_managed_location_types organization_managed_location_typ_managed_location_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managed_location_types
    ADD CONSTRAINT organization_managed_location_typ_managed_location_type_id_fkey FOREIGN KEY (managed_location_type_id) REFERENCES public.managed_location_types(id);


--
-- Name: organization_managed_location_types organization_managed_location_types_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managed_location_types
    ADD CONSTRAINT organization_managed_location_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_report_settings organization_report_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_report_settings
    ADD CONSTRAINT organization_report_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_users organization_users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_users organization_users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: organization_users organization_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organizations organizations_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: organizations organizations_country_subdivision_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_country_subdivision_code_fkey FOREIGN KEY (country_subdivision_code) REFERENCES public.country_subdivisions(code);


--
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organizations organizations_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: organizations organizations_organization_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_organization_type_id_fkey FOREIGN KEY (organization_type_id) REFERENCES public.organization_types(id);


--
-- Name: organizations organizations_time_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: files photos_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: files photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_user_id_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_land_use_model_types project_land_use_model_types_land_use_model_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_land_use_model_types
    ADD CONSTRAINT project_land_use_model_types_land_use_model_type_id_fkey FOREIGN KEY (land_use_model_type_id) REFERENCES public.land_use_model_types(id);


--
-- Name: project_land_use_model_types project_land_use_model_types_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_land_use_model_types
    ADD CONSTRAINT project_land_use_model_types_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_report_settings project_report_settings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_report_settings
    ADD CONSTRAINT project_report_settings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET DEFAULT;


--
-- Name: projects projects_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id) ON DELETE SET DEFAULT;


--
-- Name: projects projects_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: projects projects_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES accelerator.participants(id);


--
-- Name: report_files report_files_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: report_files report_files_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: report_photos report_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT report_photos_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: report_photos report_photos_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT report_photos_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: reports reports_locked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.users(id);


--
-- Name: reports reports_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: reports reports_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: reports reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: reports reports_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.report_statuses(id);


--
-- Name: reports reports_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: facilities site_module_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.facility_types(id);


--
-- Name: species species_conservation_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_conservation_category_id_fkey FOREIGN KEY (conservation_category_id) REFERENCES public.conservation_categories(id);


--
-- Name: species species_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: species species_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: species_ecosystem_types species_ecosystem_types_ecosystem_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_ecosystem_types
    ADD CONSTRAINT species_ecosystem_types_ecosystem_type_id_fkey FOREIGN KEY (ecosystem_type_id) REFERENCES public.ecosystem_types(id);


--
-- Name: species_ecosystem_types species_ecosystem_types_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_ecosystem_types
    ADD CONSTRAINT species_ecosystem_types_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species_growth_forms species_growth_forms_growth_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_growth_forms
    ADD CONSTRAINT species_growth_forms_growth_form_id_fkey FOREIGN KEY (growth_form_id) REFERENCES public.growth_forms(id);


--
-- Name: species_growth_forms species_growth_forms_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_growth_forms
    ADD CONSTRAINT species_growth_forms_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species species_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: species species_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: species_plant_material_sourcing_methods species_plant_material_sourci_plant_material_sourcing_meth_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_plant_material_sourcing_methods
    ADD CONSTRAINT species_plant_material_sourci_plant_material_sourcing_meth_fkey FOREIGN KEY (plant_material_sourcing_method_id) REFERENCES public.plant_material_sourcing_methods(id);


--
-- Name: species_plant_material_sourcing_methods species_plant_material_sourcing_methods_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_plant_material_sourcing_methods
    ADD CONSTRAINT species_plant_material_sourcing_methods_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species_problems species_problems_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.species_problem_fields(id);


--
-- Name: species_problems species_problems_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species_problems species_problems_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.species_problem_types(id);


--
-- Name: species species_seed_storage_behavior_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_seed_storage_behavior_id_fkey FOREIGN KEY (seed_storage_behavior_id) REFERENCES public.seed_storage_behaviors(id);


--
-- Name: species_successional_groups species_successional_groups_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_successional_groups
    ADD CONSTRAINT species_successional_groups_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species_successional_groups species_successional_groups_successional_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_successional_groups
    ADD CONSTRAINT species_successional_groups_successional_group_id_fkey FOREIGN KEY (successional_group_id) REFERENCES public.successional_groups(id);


--
-- Name: species species_wood_density_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_wood_density_level_id_fkey FOREIGN KEY (wood_density_level_id) REFERENCES public.wood_density_levels(id);


--
-- Name: spring_session_attributes spring_session_attributes_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES public.spring_session(primary_id) ON DELETE CASCADE;


--
-- Name: sub_locations storage_locations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sub_locations storage_locations_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: sub_locations storage_locations_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: thumbnails thumbnail_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: timeseries timeseries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: timeseries timeseries_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: timeseries timeseries_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: timeseries timeseries_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.timeseries_types(id);


--
-- Name: timeseries_values timeseries_values_timeseries_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries_values
    ADD CONSTRAINT timeseries_values_timeseries_id_fkey FOREIGN KEY (timeseries_id) REFERENCES public.timeseries(id) ON DELETE CASCADE;


--
-- Name: upload_problems upload_problems_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upload_problems
    ADD CONSTRAINT upload_problems_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.upload_problem_types(id);


--
-- Name: upload_problems upload_problems_upload_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upload_problems
    ADD CONSTRAINT upload_problems_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES public.uploads(id) ON DELETE CASCADE;


--
-- Name: uploads uploads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: uploads uploads_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: uploads uploads_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: uploads uploads_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.upload_statuses(id);


--
-- Name: uploads uploads_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.upload_types(id);


--
-- Name: user_global_roles user_global_roles_global_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_global_roles
    ADD CONSTRAINT user_global_roles_global_role_id_fkey FOREIGN KEY (global_role_id) REFERENCES public.global_roles(id) ON DELETE CASCADE;


--
-- Name: user_global_roles user_global_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_global_roles
    ADD CONSTRAINT user_global_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: users users_time_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: users users_user_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_type_id_fkey FOREIGN KEY (user_type_id) REFERENCES public.user_types(id);


--
-- Name: accession_collectors accession_collectors_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_collectors
    ADD CONSTRAINT accession_collectors_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: accession_photos accession_photo_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_photos
    ADD CONSTRAINT accession_photo_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id);


--
-- Name: accession_photos accession_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_photos
    ADD CONSTRAINT accession_photos_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: accession_quantity_history accession_quantity_history_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: accession_quantity_history accession_quantity_history_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: accession_quantity_history accession_quantity_history_history_type_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_history_type_id_fkey FOREIGN KEY (history_type_id) REFERENCES seedbank.accession_quantity_history_types(id);


--
-- Name: accession_quantity_history accession_quantity_history_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accession_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accession_state_history accession_state_history_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: accession_state_history accession_state_history_new_state_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_new_state_id_fkey FOREIGN KEY (new_state_id) REFERENCES seedbank.accession_states(id);


--
-- Name: accession_state_history accession_state_history_old_state_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_old_state_id_fkey FOREIGN KEY (old_state_id) REFERENCES seedbank.accession_states(id);


--
-- Name: accession_state_history accession_state_history_updated_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: accessions accession_state_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_state_id_fkey FOREIGN KEY (state_id) REFERENCES seedbank.accession_states(id);


--
-- Name: accessions accession_storage_location_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_storage_location_id_fkey FOREIGN KEY (sub_location_id) REFERENCES public.sub_locations(id);


--
-- Name: accessions accession_subset_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_subset_weight_units_id_fkey FOREIGN KEY (subset_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accessions_collection_site_country_code_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_collection_site_country_code_fkey FOREIGN KEY (collection_site_country_code) REFERENCES public.countries(code);


--
-- Name: accessions accessions_collection_source_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_collection_source_id_fkey FOREIGN KEY (collection_source_id) REFERENCES seedbank.collection_sources(id);


--
-- Name: accessions accessions_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: accessions accessions_data_source_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_data_source_id_fkey FOREIGN KEY (data_source_id) REFERENCES seedbank.data_sources(id);


--
-- Name: accessions accessions_est_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_est_weight_units_id_fkey FOREIGN KEY (est_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accessions_facility_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: accessions accessions_latest_observed_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_latest_observed_units_id_fkey FOREIGN KEY (latest_observed_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accessions_modified_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: accessions accessions_project_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: accessions accessions_species_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: accessions accessions_total_withdrawn_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_total_withdrawn_weight_units_id_fkey FOREIGN KEY (total_withdrawn_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: bags bags_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.bags
    ADD CONSTRAINT bags_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: geolocations geolocations_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.geolocations
    ADD CONSTRAINT geolocations_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: viability_tests germination_test_seed_type_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_seed_type_id_fkey FOREIGN KEY (seed_type_id) REFERENCES seedbank.viability_test_seed_types(id);


--
-- Name: viability_tests germination_test_substrate_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES seedbank.viability_test_substrates(id);


--
-- Name: viability_tests germination_test_test_type_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_test_type_fkey FOREIGN KEY (test_type) REFERENCES seedbank.viability_test_types(id);


--
-- Name: viability_tests germination_test_treatment_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.seed_treatments(id);


--
-- Name: viability_test_results viability_test_results_test_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_results
    ADD CONSTRAINT viability_test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES seedbank.viability_tests(id) ON DELETE CASCADE;


--
-- Name: viability_tests viability_tests_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT viability_tests_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawal_purpose_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_purpose_id_fkey FOREIGN KEY (purpose_id) REFERENCES seedbank.withdrawal_purposes(id);


--
-- Name: withdrawals withdrawal_withdrawn_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_withdrawn_units_id_fkey FOREIGN KEY (withdrawn_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: withdrawals withdrawals_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_batch_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_estimated_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_estimated_weight_units_id_fkey FOREIGN KEY (estimated_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: withdrawals withdrawals_viability_test_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_viability_test_id_fkey FOREIGN KEY (viability_test_id) REFERENCES seedbank.viability_tests(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_withdrawn_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_withdrawn_by_fkey FOREIGN KEY (withdrawn_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: deliveries deliveries_reassigned_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_reassigned_by_fkey FOREIGN KEY (reassigned_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: draft_planting_sites draft_planting_sites_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: draft_planting_sites draft_planting_sites_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: draft_planting_sites draft_planting_sites_organization_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: draft_planting_sites draft_planting_sites_organization_id_project_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_organization_id_project_id_fkey FOREIGN KEY (organization_id, project_id) REFERENCES public.projects(organization_id, id);


--
-- Name: draft_planting_sites draft_planting_sites_project_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: draft_planting_sites draft_planting_sites_time_zone_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone);


--
-- Name: monitoring_plots monitoring_plots_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: monitoring_plots monitoring_plots_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: monitoring_plots monitoring_plots_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE CASCADE;


--
-- Name: observation_photos observation_photos_file_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: observation_photos observation_photos_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id);


--
-- Name: observation_photos observation_photos_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id);


--
-- Name: observation_photos observation_photos_observation_id_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_observation_id_monitoring_plot_id_fkey FOREIGN KEY (observation_id, monitoring_plot_id) REFERENCES tracking.observation_plots(observation_id, monitoring_plot_id);


--
-- Name: observation_photos observation_photos_position_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_position_id_fkey FOREIGN KEY (position_id) REFERENCES tracking.observation_plot_positions(id);


--
-- Name: observation_plot_conditions observation_plot_conditions_condition_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES tracking.observable_conditions(id);


--
-- Name: observation_plot_conditions observation_plot_conditions_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observation_plot_conditions observation_plot_conditions_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observation_plots observation_plots_claimed_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_completed_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observation_plots observation_plots_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observations observations_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observations
    ADD CONSTRAINT observations_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: observations observations_state_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observations
    ADD CONSTRAINT observations_state_id_fkey FOREIGN KEY (state_id) REFERENCES tracking.observation_states(id);


--
-- Name: observed_plot_coordinates observed_plot_coordinates_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observed_plot_coordinates observed_plot_coordinates_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_plot_coordinates observed_plot_coordinates_observation_id_monitoring_plot_i_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_observation_id_monitoring_plot_i_fkey FOREIGN KEY (observation_id, monitoring_plot_id) REFERENCES tracking.observation_plots(observation_id, monitoring_plot_id);


--
-- Name: observed_plot_coordinates observed_plot_coordinates_position_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_position_id_fkey FOREIGN KEY (position_id) REFERENCES tracking.observation_plot_positions(id);


--
-- Name: observed_plot_species_totals observed_plot_species_totals_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: observed_plot_species_totals observed_plot_species_totals_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observed_plot_species_totals observed_plot_species_totals_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_plot_species_totals observed_plot_species_totals_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: observed_site_species_totals observed_site_species_totals_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: observed_site_species_totals observed_site_species_totals_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_site_species_totals observed_site_species_totals_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: observed_site_species_totals observed_site_species_totals_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: observed_zone_species_totals observed_zone_species_totals_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: observed_zone_species_totals observed_zone_species_totals_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_zone_species_totals observed_zone_species_totals_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE CASCADE;


--
-- Name: observed_zone_species_totals observed_zone_species_totals_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: planting_seasons planting_seasons_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_seasons
    ADD CONSTRAINT planting_seasons_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_histories planting_site_histories_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_histories
    ADD CONSTRAINT planting_site_histories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_site_histories planting_site_histories_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_histories
    ADD CONSTRAINT planting_site_histories_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_notifications planting_site_notifications_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id);


--
-- Name: planting_site_notifications planting_site_notifications_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_populations planting_site_populations_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_populations
    ADD CONSTRAINT planting_site_populations_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_populations planting_site_populations_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_site_populations
    ADD CONSTRAINT planting_site_populations_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: planting_sites planting_sites_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_sites planting_sites_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: planting_sites planting_sites_organization_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: planting_sites planting_sites_project_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: planting_sites planting_sites_time_zone_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: planting_subzone_histories planting_subzone_histories_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzone_histories
    ADD CONSTRAINT planting_subzone_histories_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE SET NULL;


--
-- Name: planting_subzone_histories planting_subzone_histories_planting_zone_history_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzone_histories
    ADD CONSTRAINT planting_subzone_histories_planting_zone_history_id_fkey FOREIGN KEY (planting_zone_history_id) REFERENCES tracking.planting_zone_histories(id) ON DELETE CASCADE;


--
-- Name: planting_subzone_populations planting_subzone_populations_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzone_populations
    ADD CONSTRAINT planting_subzone_populations_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE CASCADE;


--
-- Name: planting_subzone_populations planting_subzone_populations_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzone_populations
    ADD CONSTRAINT planting_subzone_populations_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: planting_zone_histories planting_zone_histories_planting_site_history_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zone_histories
    ADD CONSTRAINT planting_zone_histories_planting_site_history_id_fkey FOREIGN KEY (planting_site_history_id) REFERENCES tracking.planting_site_histories(id) ON DELETE CASCADE;


--
-- Name: planting_zone_histories planting_zone_histories_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zone_histories
    ADD CONSTRAINT planting_zone_histories_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE SET NULL;


--
-- Name: planting_zone_populations planting_zone_populations_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zone_populations
    ADD CONSTRAINT planting_zone_populations_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE CASCADE;


--
-- Name: planting_zone_populations planting_zone_populations_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zone_populations
    ADD CONSTRAINT planting_zone_populations_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: planting_zones planting_zones_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_zones planting_zones_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: planting_zones planting_zones_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: plantings plantings_delivery_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES tracking.deliveries(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_planting_site_id_delivery_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_site_id_delivery_id_fkey FOREIGN KEY (planting_site_id, delivery_id) REFERENCES tracking.deliveries(planting_site_id, id);


--
-- Name: plantings plantings_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_planting_site_id_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_site_id_plot_id_fkey FOREIGN KEY (planting_site_id, planting_subzone_id) REFERENCES tracking.planting_subzones(planting_site_id, id);


--
-- Name: plantings plantings_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_planting_type_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_type_id_fkey FOREIGN KEY (planting_type_id) REFERENCES tracking.planting_types(id);


--
-- Name: plantings plantings_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: planting_subzones plots_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_subzones plots_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: planting_subzones plots_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_subzones plots_planting_site_id_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_site_id_planting_zone_id_fkey FOREIGN KEY (planting_site_id, planting_zone_id) REFERENCES tracking.planting_zones(planting_site_id, id);


--
-- Name: planting_subzones plots_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: recorded_plants recorded_plants_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_observation_id_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_observation_id_monitoring_plot_id_fkey FOREIGN KEY (observation_id, monitoring_plot_id) REFERENCES tracking.observation_plots(observation_id, monitoring_plot_id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: recorded_plants recorded_plants_status_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: -
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_status_id_fkey FOREIGN KEY (status_id) REFERENCES tracking.recorded_plant_statuses(id);


--
-- PostgreSQL database dump complete
--

