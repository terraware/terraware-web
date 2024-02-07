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
-- Name: accelerator; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA accelerator;


ALTER SCHEMA accelerator OWNER TO postgres;

--
-- Name: nursery; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA nursery;


ALTER SCHEMA nursery OWNER TO postgres;

--
-- Name: seedbank; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA seedbank;


ALTER SCHEMA seedbank OWNER TO postgres;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO postgres;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO postgres;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO postgres;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: tracking; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tracking;


ALTER SCHEMA tracking OWNER TO postgres;

--
-- Name: natural_numeric; Type: COLLATION; Schema: public; Owner: postgres
--

CREATE COLLATION public.natural_numeric (provider = icu, locale = 'en-u-kn-true');


ALTER COLLATION public.natural_numeric OWNER TO postgres;

--
-- Name: COLLATION natural_numeric; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLLATION public.natural_numeric IS 'Collation that sorts strings that contain numbers in numeric order, e.g., `a2` comes before `a10`.';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: column_exists(text, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.column_exists(ptable text, pcolumn text) OWNER TO postgres;

--
-- Name: rename_column_if_exists(text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.rename_column_if_exists(ptable text, pcolumn text, new_name text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cohort_modules; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.cohort_modules (
    id bigint NOT NULL,
    cohort_id bigint NOT NULL,
    module_id bigint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);


ALTER TABLE accelerator.cohort_modules OWNER TO postgres;

--
-- Name: TABLE cohort_modules; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.cohort_modules IS 'Which modules are assigned to which cohorts.';


--
-- Name: cohort_modules_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
--

ALTER TABLE accelerator.cohort_modules ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME accelerator.cohort_modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cohort_phases; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.cohort_phases (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE accelerator.cohort_phases OWNER TO postgres;

--
-- Name: TABLE cohort_phases; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.cohort_phases IS '(Enum) Available cohort phases';


--
-- Name: cohorts; Type: TABLE; Schema: accelerator; Owner: postgres
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


ALTER TABLE accelerator.cohorts OWNER TO postgres;

--
-- Name: TABLE cohorts; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.cohorts IS 'Accelerator cohort details.';


--
-- Name: cohorts_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
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
-- Name: deliverable_categories; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.deliverable_categories (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE accelerator.deliverable_categories OWNER TO postgres;

--
-- Name: TABLE deliverable_categories; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.deliverable_categories IS '(Enum) High-level groups for organizing deliverables.';


--
-- Name: deliverable_documents; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.deliverable_documents (
    deliverable_id bigint NOT NULL,
    deliverable_type_id integer NOT NULL,
    template_url text,
    CONSTRAINT deliverable_is_document CHECK ((deliverable_type_id = 1))
);


ALTER TABLE accelerator.deliverable_documents OWNER TO postgres;

--
-- Name: TABLE deliverable_documents; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.deliverable_documents IS 'Information about expected deliverables of type Document that isn''t relevant for other deliverable types.';


--
-- Name: deliverable_types; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.deliverable_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE accelerator.deliverable_types OWNER TO postgres;

--
-- Name: TABLE deliverable_types; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.deliverable_types IS '(Enum) Types of deliverables for an accelerator module.';


--
-- Name: deliverables; Type: TABLE; Schema: accelerator; Owner: postgres
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


ALTER TABLE accelerator.deliverables OWNER TO postgres;

--
-- Name: TABLE deliverables; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.deliverables IS 'Information about expected deliverables. This describes what we request from users; the data we get back from users in response is recorded in `project_deliverables` and its child tables.';


--
-- Name: COLUMN deliverables."position"; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON COLUMN accelerator.deliverables."position" IS 'Which position this deliverable appears in the module''s list of deliverables, starting with 1.';


--
-- Name: COLUMN deliverables.is_sensitive; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON COLUMN accelerator.deliverables.is_sensitive IS 'If true, the data users provide in response to this deliverable will be visible to a smaller subset of accelerator admins. Secure documents are saved to a different document store than non-secure ones.';


--
-- Name: deliverables_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
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
-- Name: document_stores; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.document_stores (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE accelerator.document_stores OWNER TO postgres;

--
-- Name: TABLE document_stores; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.document_stores IS '(Enum) Locations where uploaded documents are stored.';


--
-- Name: modules; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.modules (
    id bigint NOT NULL,
    name text NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_by bigint NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


ALTER TABLE accelerator.modules OWNER TO postgres;

--
-- Name: TABLE modules; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.modules IS 'Possible steps in the workflow of a cohort.';


--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
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
-- Name: participants; Type: TABLE; Schema: accelerator; Owner: postgres
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


ALTER TABLE accelerator.participants OWNER TO postgres;

--
-- Name: TABLE participants; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.participants IS 'Accelerator participant details.';


--
-- Name: participants_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
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
-- Name: submission_documents; Type: TABLE; Schema: accelerator; Owner: postgres
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
    original_name text
);


ALTER TABLE accelerator.submission_documents OWNER TO postgres;

--
-- Name: TABLE submission_documents; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.submission_documents IS 'Information about documents uploaded by users to satisfy deliverables. A deliverable can have multiple documents.';


--
-- Name: COLUMN submission_documents.name; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON COLUMN accelerator.submission_documents.name IS 'System-generated filename. The file is stored using this name in the document store. This includes several elements such as the date and description.';


--
-- Name: COLUMN submission_documents.location; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON COLUMN accelerator.submission_documents.location IS 'Location of file in the document store identified by `document_store_id`. This is used by the system to generate download links and includes whatever information is needed to generate a link for a given document store; if the document store supports permalinks then this may be a simple URL.';


--
-- Name: COLUMN submission_documents.original_name; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON COLUMN accelerator.submission_documents.original_name IS 'Original filename as supplied by the client when the document was uploaded. Not required to be unique since the user can upload revised versions of documents.';


--
-- Name: submission_documents_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
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
-- Name: submission_statuses; Type: TABLE; Schema: accelerator; Owner: postgres
--

CREATE TABLE accelerator.submission_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE accelerator.submission_statuses OWNER TO postgres;

--
-- Name: TABLE submission_statuses; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.submission_statuses IS '(Enum) Statuses of submissions of deliverables by specific projects.';


--
-- Name: submissions; Type: TABLE; Schema: accelerator; Owner: postgres
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


ALTER TABLE accelerator.submissions OWNER TO postgres;

--
-- Name: TABLE submissions; Type: COMMENT; Schema: accelerator; Owner: postgres
--

COMMENT ON TABLE accelerator.submissions IS 'Information about the current states of the information supplied by specific projects in response to deliverables.';


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: accelerator; Owner: postgres
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
-- Name: batch_details_history; Type: TABLE; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.batch_details_history OWNER TO postgres;

--
-- Name: TABLE batch_details_history; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_details_history IS 'Record of changes of user-editable attributes of each nursery batch.';


--
-- Name: COLUMN batch_details_history.project_name; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_details_history.project_name IS 'Name of project as of the time the batch was edited. Not updated if project is later renamed.';


--
-- Name: batch_details_history_id_seq; Type: SEQUENCE; Schema: nursery; Owner: postgres
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
-- Name: batch_details_history_sub_locations; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.batch_details_history_sub_locations (
    batch_details_history_id bigint NOT NULL,
    sub_location_id bigint NOT NULL,
    sub_location_name text NOT NULL
);


ALTER TABLE nursery.batch_details_history_sub_locations OWNER TO postgres;

--
-- Name: TABLE batch_details_history_sub_locations; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_details_history_sub_locations IS 'Record of changes to sub-locations of each nursery batch.';


--
-- Name: COLUMN batch_details_history_sub_locations.sub_location_name; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_details_history_sub_locations.sub_location_name IS 'Name of sub-location as of the time the batch was edited. Not updated if sub-location is later renamed.';


--
-- Name: batch_photos; Type: TABLE; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.batch_photos OWNER TO postgres;

--
-- Name: TABLE batch_photos; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_photos IS 'Information about photos of batches.';


--
-- Name: COLUMN batch_photos.file_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_photos.file_id IS 'File ID if the photo exists. Null if the photo has been deleted.';


--
-- Name: batch_photos_id_seq; Type: SEQUENCE; Schema: nursery; Owner: postgres
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
-- Name: batch_quantity_history; Type: TABLE; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.batch_quantity_history OWNER TO postgres;

--
-- Name: TABLE batch_quantity_history; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_quantity_history IS 'Record of changes of seedling quantities in each nursery batch.';


--
-- Name: COLUMN batch_quantity_history.batch_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.batch_id IS 'Which batch''s quantities were changed.';


--
-- Name: COLUMN batch_quantity_history.history_type_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.history_type_id IS 'Type of operation that resulted in the change in quantities.';


--
-- Name: COLUMN batch_quantity_history.created_by; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.created_by IS 'Which user triggered the change in quantities. "Created" here refers to the history row, not the batch.';


--
-- Name: COLUMN batch_quantity_history.created_time; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.created_time IS 'When the change in quantities happened. "Created" here refers to the history row, not the batch.';


--
-- Name: COLUMN batch_quantity_history.germinating_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.germinating_quantity IS 'New number of germinating seedlings in the batch.';


--
-- Name: COLUMN batch_quantity_history.not_ready_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.not_ready_quantity IS 'New number of not-ready-for-planting seedlings in the batch.';


--
-- Name: COLUMN batch_quantity_history.ready_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.ready_quantity IS 'New number of ready-for-planting seedlings in the batch.';


--
-- Name: COLUMN batch_quantity_history.withdrawal_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_quantity_history.withdrawal_id IS 'If this change in quantity was due to a withdrawal from the batch, the withdrawal''s ID.';


--
-- Name: batch_quantity_history_id_seq; Type: SEQUENCE; Schema: nursery; Owner: postgres
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
-- Name: batch_quantity_history_types; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.batch_quantity_history_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE nursery.batch_quantity_history_types OWNER TO postgres;

--
-- Name: TABLE batch_quantity_history_types; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_quantity_history_types IS '(Enum) Types of operations that can result in changes to remaining quantities of seedling batches.';


--
-- Name: batch_sub_locations; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.batch_sub_locations (
    batch_id bigint NOT NULL,
    sub_location_id bigint NOT NULL,
    facility_id bigint NOT NULL
);


ALTER TABLE nursery.batch_sub_locations OWNER TO postgres;

--
-- Name: TABLE batch_sub_locations; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_sub_locations IS 'Which batches are stored in which sub-locations.';


--
-- Name: batch_substrates; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.batch_substrates (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE nursery.batch_substrates OWNER TO postgres;

--
-- Name: TABLE batch_substrates; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_substrates IS '(Enum) Substrates in which seedlings can be planted in a nursery.';


--
-- Name: batch_withdrawals; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.batch_withdrawals (
    batch_id bigint NOT NULL,
    withdrawal_id bigint NOT NULL,
    germinating_quantity_withdrawn integer NOT NULL,
    not_ready_quantity_withdrawn integer NOT NULL,
    ready_quantity_withdrawn integer NOT NULL,
    destination_batch_id bigint,
    CONSTRAINT batch_withdrawals_germinating_quantity_withdrawn_check CHECK ((germinating_quantity_withdrawn >= 0)),
    CONSTRAINT batch_withdrawals_not_ready_quantity_withdrawn_check CHECK ((not_ready_quantity_withdrawn >= 0)),
    CONSTRAINT batch_withdrawals_ready_quantity_withdrawn_check CHECK ((ready_quantity_withdrawn >= 0))
);


ALTER TABLE nursery.batch_withdrawals OWNER TO postgres;

--
-- Name: TABLE batch_withdrawals; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batch_withdrawals IS 'Number of seedlings withdrawn from each originating batch as part of a withdrawal.';


--
-- Name: COLUMN batch_withdrawals.batch_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_withdrawals.batch_id IS 'The batch from which the seedlings were withdrawn, also referred to as the originating batch.';


--
-- Name: COLUMN batch_withdrawals.withdrawal_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_withdrawals.withdrawal_id IS 'The withdrawal that removed seedlings from this batch. A withdrawal can come from multiple batches, in which case there will be more than one `batch_withdrawals` row with the same withdrawal ID.';


--
-- Name: COLUMN batch_withdrawals.germinating_quantity_withdrawn; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_withdrawals.germinating_quantity_withdrawn IS 'Number of germinating seedlings that were withdrawn from this batch. This is not necessarily the total number of seedlings in the withdrawal as a whole since a withdrawal can come from multiple batches.';


--
-- Name: COLUMN batch_withdrawals.not_ready_quantity_withdrawn; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_withdrawals.not_ready_quantity_withdrawn IS 'Number of not-ready-for-planting seedlings that were withdrawn from this batch. This is not necessarily the total number of seedlings in the withdrawal as a whole since a withdrawal can come from multiple batches.';


--
-- Name: COLUMN batch_withdrawals.ready_quantity_withdrawn; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_withdrawals.ready_quantity_withdrawn IS 'Number of ready-for-planting seedlings that were withdrawn from this batch. This is not necessarily the total number of seedlings in the withdrawal as a whole since a withdrawal can come from multiple batches.';


--
-- Name: COLUMN batch_withdrawals.destination_batch_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batch_withdrawals.destination_batch_id IS 'If the withdrawal was a nursery transfer, the batch that was created as a result. A withdrawal can have more than one originating batch; if they are of the same species, only one destination batch will be created and there will be multiple rows with the same `destination_batch_id`. May be null if the batch was subsequently deleted.';


--
-- Name: batches; Type: TABLE; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.batches OWNER TO postgres;

--
-- Name: TABLE batches; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.batches IS 'Information about batches of seedlings at nurseries.';


--
-- Name: COLUMN batches.id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.id IS 'Globally-unique internal identifier for the batch. Not typically presented to end users; "batch_number" is the user-facing identifier.';


--
-- Name: COLUMN batches.version; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.version IS 'Increases by 1 each time the batch is modified. Used to detect when clients have stale data about batches.';


--
-- Name: COLUMN batches.organization_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.organization_id IS 'Which organization owns the nursery where this batch is located.';


--
-- Name: COLUMN batches.facility_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.facility_id IS 'Which nursery contains the batch. Facility must be of type "Nursery" and under the same organization as the species ID (enforced in application code).';


--
-- Name: COLUMN batches.species_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.species_id IS 'Species of the batch''s plants. Must be under the same organization as the facility ID (enforced in application code).';


--
-- Name: COLUMN batches.batch_number; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.batch_number IS 'User-friendly unique (per organization) identifier for the batch. Not used internally or in API; "id" is the internal identifier.';


--
-- Name: COLUMN batches.added_date; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.added_date IS 'User-supplied date the batch was added to the nursery''s inventory.';


--
-- Name: COLUMN batches.germinating_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.germinating_quantity IS 'Number of germinating seedlings currently available in inventory. Withdrawals cause this to decrease.';


--
-- Name: COLUMN batches.not_ready_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.not_ready_quantity IS 'Number of not-ready-for-planting seedlings currently available in inventory. Withdrawals cause this to decrease.';


--
-- Name: COLUMN batches.ready_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.ready_quantity IS 'Number of ready-for-planting seedlings currently available in inventory. Withdrawals cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_germinating_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.latest_observed_germinating_quantity IS 'Latest user-observed number of germinating seedlings currently available in inventory. Withdrawals do not cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_not_ready_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.latest_observed_not_ready_quantity IS 'Latest user-observed number of not-ready-for-planting seedlings currently available in inventory. Withdrawals do not cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_ready_quantity; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.latest_observed_ready_quantity IS 'Latest user-observed number of ready-for-planting seedlings currently available in inventory. Withdrawals do not cause this to decrease.';


--
-- Name: COLUMN batches.latest_observed_time; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.latest_observed_time IS 'When the latest user observation of seedling quantities took place.';


--
-- Name: COLUMN batches.created_by; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.created_by IS 'Which user initially created the batch.';


--
-- Name: COLUMN batches.created_time; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.created_time IS 'When the batch was initially created.';


--
-- Name: COLUMN batches.modified_by; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.modified_by IS 'Which user most recently modified the batch, either directly or by creating a withdrawal.';


--
-- Name: COLUMN batches.modified_time; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.modified_time IS 'When the batch was most recently modified, either directly or by creating a withdrawal.';


--
-- Name: COLUMN batches.notes; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.notes IS 'User-supplied freeform notes about batch.';


--
-- Name: COLUMN batches.ready_by_date; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.ready_by_date IS 'User-supplied estimate of when the batch will be ready for planting.';


--
-- Name: COLUMN batches.accession_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.accession_id IS 'If the batch was created by a nursery transfer from a seed bank, the originating accession ID.';


--
-- Name: COLUMN batches.total_germinated; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.total_germinated IS 'Total number of seedlings that have moved from Germinating to Not Ready status over the lifetime of the batch. This is the numerator for the germination rate calculation.';


--
-- Name: COLUMN batches.total_germination_candidates; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.total_germination_candidates IS 'Total number of seedlings that have been candidates for moving from Germinating to Not Ready status. This includes seedlings that are already germinated and germinating seedlings that were withdrawn as Dead, but does not include germinating seedlings that were withdrawn for other reasons. This is the denominator for the germination rate calculation.';


--
-- Name: COLUMN batches.total_lost; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.total_lost IS 'Total number of non-germinating (Not Ready and Ready) seedlings that have been withdrawn as Dead. This is the numerator for the loss rate calculation.';


--
-- Name: COLUMN batches.total_loss_candidates; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.batches.total_loss_candidates IS 'Total number of non-germinating (Not Ready and Ready) seedlings that have been candidates for being withdrawn as dead. This includes seedlings that are still in the batch, seedlings that were withdrawn for outplanting, and seedlings that were already withdrawn as dead, but does not include germinating seedlings or seedlings that were withdrawn for other reasons. This is the denominator for the loss rate calculation.';


--
-- Name: batch_summaries; Type: VIEW; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.batch_summaries OWNER TO postgres;

--
-- Name: batches_id_seq; Type: SEQUENCE; Schema: nursery; Owner: postgres
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
-- Name: facility_inventories; Type: VIEW; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.facility_inventories OWNER TO postgres;

--
-- Name: facility_inventory_totals; Type: VIEW; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.facility_inventory_totals OWNER TO postgres;

--
-- Name: inventories; Type: VIEW; Schema: nursery; Owner: postgres
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


ALTER TABLE nursery.inventories OWNER TO postgres;

--
-- Name: species_projects; Type: VIEW; Schema: nursery; Owner: postgres
--

CREATE VIEW nursery.species_projects AS
 SELECT DISTINCT batches.organization_id,
    batches.species_id,
    batches.project_id
   FROM nursery.batches
  WHERE ((batches.project_id IS NOT NULL) AND ((batches.germinating_quantity > 0) OR (batches.not_ready_quantity > 0) OR (batches.ready_quantity > 0)));


ALTER TABLE nursery.species_projects OWNER TO postgres;

--
-- Name: VIEW species_projects; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON VIEW nursery.species_projects IS 'Which species have active batches associated with which projects.';


--
-- Name: withdrawal_photos; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.withdrawal_photos (
    file_id bigint NOT NULL,
    withdrawal_id bigint NOT NULL
);


ALTER TABLE nursery.withdrawal_photos OWNER TO postgres;

--
-- Name: TABLE withdrawal_photos; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.withdrawal_photos IS 'Linking table between `withdrawals` and `files`.';


--
-- Name: withdrawal_purposes; Type: TABLE; Schema: nursery; Owner: postgres
--

CREATE TABLE nursery.withdrawal_purposes (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE nursery.withdrawal_purposes OWNER TO postgres;

--
-- Name: TABLE withdrawal_purposes; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.withdrawal_purposes IS '(Enum) Reasons that someone can withdraw seedlings from a nursery.';


--
-- Name: withdrawals; Type: TABLE; Schema: nursery; Owner: postgres
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
    CONSTRAINT withdrawals_destination_only_for_transfers CHECK (((destination_facility_id IS NULL) OR (purpose_id = 1))),
    CONSTRAINT withdrawals_notes_check CHECK ((notes !~ similar_to_escape(' *'::text)))
);


ALTER TABLE nursery.withdrawals OWNER TO postgres;

--
-- Name: TABLE withdrawals; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON TABLE nursery.withdrawals IS 'Top-level information about a withdrawal from a nursery. Does not contain withdrawal quantities; those are in the `batch_withdrawals` table.';


--
-- Name: COLUMN withdrawals.facility_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.facility_id IS 'Nursery from which the seedlings were withdrawn.';


--
-- Name: COLUMN withdrawals.purpose_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.purpose_id IS 'Purpose of the withdrawal (nursery transfer, dead seedlings, etc.)';


--
-- Name: COLUMN withdrawals.withdrawn_date; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.withdrawn_date IS 'User-supplied date when the seedlings were withdrawn.';


--
-- Name: COLUMN withdrawals.created_by; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.created_by IS 'Which user created the withdrawal.';


--
-- Name: COLUMN withdrawals.created_time; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.created_time IS 'When the withdrawal was created.';


--
-- Name: COLUMN withdrawals.modified_by; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.modified_by IS 'Which user most recently modified the withdrawal.';


--
-- Name: COLUMN withdrawals.modified_time; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.modified_time IS 'When the withdrawal was most recently modified.';


--
-- Name: COLUMN withdrawals.destination_facility_id; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.destination_facility_id IS 'If the withdrawal was a nursery transfer, the facility where the seedlings were sent. May be null if the facility was subsequently deleted.';


--
-- Name: COLUMN withdrawals.notes; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON COLUMN nursery.withdrawals.notes IS 'User-supplied freeform text describing the withdrawal.';


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.facilities OWNER TO postgres;

--
-- Name: TABLE facilities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.facilities IS 'Physical locations at a site. For example, each seed bank and each nursery is a facility.';


--
-- Name: COLUMN facilities.max_idle_minutes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.facilities.max_idle_minutes IS 'Send an alert if this many minutes pass without new timeseries data from a facility''s device manager.';


--
-- Name: COLUMN facilities.last_timeseries_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.facilities.last_timeseries_time IS 'When the most recent timeseries data was received from the facility.';


--
-- Name: COLUMN facilities.idle_after_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.facilities.idle_after_time IS 'Time at which the facility will be considered idle if no timeseries data is received. Null if the timeseries has already been marked as idle or if no timeseries data has ever been received from the facility.';


--
-- Name: COLUMN facilities.idle_since_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.facilities.idle_since_time IS 'Time at which the facility became idle. Null if the facility is not currently considered idle.';


--
-- Name: COLUMN facilities.last_notification_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.facilities.last_notification_date IS 'Local date on which facility-related notifications were last generated.';


--
-- Name: COLUMN facilities.next_notification_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.facilities.next_notification_time IS 'Time at which the server should next generate notifications for the facility if any are needed.';


--
-- Name: deliveries; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.deliveries OWNER TO postgres;

--
-- Name: TABLE deliveries; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.deliveries IS 'Incoming deliveries of new seedlings to a planting site. Mostly exists to link plantings and nursery withdrawals.';


--
-- Name: COLUMN deliveries.withdrawal_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.withdrawal_id IS 'Which nursery withdrawal the plants came from.';


--
-- Name: COLUMN deliveries.planting_site_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.planting_site_id IS 'Which planting site received the delivery.';


--
-- Name: COLUMN deliveries.created_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.created_by IS 'Which user created the delivery.';


--
-- Name: COLUMN deliveries.created_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.created_time IS 'When the delivery was created.';


--
-- Name: COLUMN deliveries.modified_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.modified_by IS 'Which user most recently modified the delivery.';


--
-- Name: COLUMN deliveries.modified_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.modified_time IS 'When the delivery was most recently modified.';


--
-- Name: COLUMN deliveries.reassigned_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.reassigned_by IS 'Which user recorded the reassignment of plants in this delivery. Null if this delivery has no reassignment.';


--
-- Name: COLUMN deliveries.reassigned_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.deliveries.reassigned_time IS 'When the reassignment was recorded. Null if this delivery has no reassignment.';


--
-- Name: planting_sites; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.planting_sites OWNER TO postgres;

--
-- Name: TABLE planting_sites; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_sites IS 'Top-level information about entire planting sites. Every planting site has at least one planting zone.';


--
-- Name: COLUMN planting_sites.organization_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.organization_id IS 'Which organization owns this planting site.';


--
-- Name: COLUMN planting_sites.name; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.name IS 'Short name of this planting site. Must be unique within the organization.';


--
-- Name: COLUMN planting_sites.description; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.description IS 'Optional user-supplied description of the planting site.';


--
-- Name: COLUMN planting_sites.boundary; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.boundary IS 'Boundary of the entire planting site. Planting zones will generally fall inside this boundary. This will typically be a single polygon but may be multiple polygons if a planting site has several disjoint areas. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN planting_sites.created_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.created_by IS 'Which user created the planting site.';


--
-- Name: COLUMN planting_sites.created_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.created_time IS 'When the planting site was originally created.';


--
-- Name: COLUMN planting_sites.modified_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.modified_by IS 'Which user most recently modified the planting site.';


--
-- Name: COLUMN planting_sites.modified_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.modified_time IS 'When the planting site was most recently modified.';


--
-- Name: COLUMN planting_sites.exclusion; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.exclusion IS 'Optional area to exclude from a site. No monitoring plots will be located in this area.';


--
-- Name: COLUMN planting_sites.grid_origin; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_sites.grid_origin IS 'Coordinates of the origin point of the grid of monitoring plots. Monitoring plot corners have X and Y coordinates that are multiples of 25 meters from the origin point.';


--
-- Name: planting_subzones; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.planting_subzones OWNER TO postgres;

--
-- Name: TABLE planting_subzones; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_subzones IS 'Regions within planting zones that are a convenient size for a planting operation. Typically <10Ha.';


--
-- Name: COLUMN planting_subzones.planting_zone_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.planting_zone_id IS 'Which planting zone this subzone is part of.';


--
-- Name: COLUMN planting_subzones.name; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.name IS 'Short name of this planting subzone. This is often just a single letter and number. Must be unique within a planting zone.';


--
-- Name: COLUMN planting_subzones.boundary; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.boundary IS 'Boundary of the subzone. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN planting_subzones.created_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.created_by IS 'Which user created the subzone.';


--
-- Name: COLUMN planting_subzones.created_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.created_time IS 'When the subzone was originally created.';


--
-- Name: COLUMN planting_subzones.modified_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.modified_by IS 'Which user most recently modified the subzone.';


--
-- Name: COLUMN planting_subzones.modified_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.modified_time IS 'When the subzone was most recently modified.';


--
-- Name: COLUMN planting_subzones.planting_site_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_subzones.planting_site_id IS 'Which planting site this subzone is part of. This is the same as the planting site ID of this subzone''s planting zone, but is duplicated here so it can be used as the target of a foreign key constraint.';


--
-- Name: plantings; Type: TABLE; Schema: tracking; Owner: postgres
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
    CONSTRAINT num_plants_positive_unless_reassignment_from CHECK ((((planting_type_id = 2) AND (num_plants < 0)) OR ((planting_type_id <> 2) AND (num_plants > 0)))),
    CONSTRAINT plantings_notes_check CHECK ((notes !~ similar_to_escape(' *'::text)))
);


ALTER TABLE tracking.plantings OWNER TO postgres;

--
-- Name: TABLE plantings; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.plantings IS 'Details about plants that were planted or reassigned as part of a delivery. There is one plantings row per species in a delivery.';


--
-- Name: COLUMN plantings.delivery_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.delivery_id IS 'Which delivery this planting is part of.';


--
-- Name: COLUMN plantings.planting_type_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.planting_type_id IS 'Whether this is the plant assignment from the initial delivery or an adjustment from a reassignment.';


--
-- Name: COLUMN plantings.planting_site_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.planting_site_id IS 'Which planting site has the planting. Must be the same as the planting site ID of the delivery. This identifies the site as a whole; in addition, there may be a plot ID.';


--
-- Name: COLUMN plantings.planting_subzone_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.planting_subzone_id IS 'Which plot this planting affected, if any. Must be a plot at the planting site referenced by `planting_site_id`. Null if the planting site does not have plot information. For reassignments, this is the original plot if `num_plants` is negative, or the new plot if `num_plants` is positive.';


--
-- Name: COLUMN plantings.species_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.species_id IS 'Which species was planted.';


--
-- Name: COLUMN plantings.created_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.created_by IS 'Which user created the planting.';


--
-- Name: COLUMN plantings.created_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.created_time IS 'When the planting was created. Note that plantings are never updated, so there is no modified time.';


--
-- Name: COLUMN plantings.num_plants; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.num_plants IS 'Number of plants that were planted (if the number is positive) or reassigned (if the number is negative).';


--
-- Name: COLUMN plantings.notes; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.plantings.notes IS 'Notes about this specific planting. In the initial version of the web app, the user can only enter per-planting notes for reassignments, not for initial deliveries.';


--
-- Name: CONSTRAINT num_plants_positive_unless_reassignment_from ON plantings; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON CONSTRAINT num_plants_positive_unless_reassignment_from ON tracking.plantings IS 'If the planting represents the "from" side of a reassignment, the number of plants must be negative. Otherwise it must be positive.';


--
-- Name: withdrawal_summaries; Type: VIEW; Schema: nursery; Owner: postgres
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
    facilities.organization_id,
    deliveries.id AS delivery_id,
    totals.total_withdrawn,
    COALESCE(dest_nurseries.name, dest_sites.name) AS destination_name,
    COALESCE(reassignment_subzones.plot_names, delivery_subzones.plot_names) AS planting_subzone_names,
    (EXISTS ( SELECT 1
           FROM tracking.plantings p
          WHERE ((p.delivery_id = deliveries.id) AND (p.planting_type_id = 2)))) AS has_reassignments
   FROM (((((((nursery.withdrawals withdrawals
     JOIN public.facilities ON ((withdrawals.facility_id = facilities.id)))
     LEFT JOIN tracking.deliveries deliveries ON (((withdrawals.id = deliveries.withdrawal_id) AND (withdrawals.purpose_id = 3))))
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


ALTER TABLE nursery.withdrawal_summaries OWNER TO postgres;

--
-- Name: VIEW withdrawal_summaries; Type: COMMENT; Schema: nursery; Owner: postgres
--

COMMENT ON VIEW nursery.withdrawal_summaries IS 'Withdrawal information including aggregated and calculated values that need to be made available as filter and sort keys.';


--
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: nursery; Owner: postgres
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
-- Name: app_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_versions (
    app_name text NOT NULL,
    platform text NOT NULL,
    minimum_version text NOT NULL,
    recommended_version text NOT NULL
);


ALTER TABLE public.app_versions OWNER TO postgres;

--
-- Name: TABLE app_versions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.app_versions IS 'Minimum and recommended versions for Terraware mobile apps.';


--
-- Name: automations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.automations OWNER TO postgres;

--
-- Name: TABLE automations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.automations IS 'Configuration of automatic processes run by the device manager.';


--
-- Name: automations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: conservation_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conservation_categories (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.conservation_categories OWNER TO postgres;

--
-- Name: TABLE conservation_categories; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.conservation_categories IS '(Enum) IUCN conservation category codes.';


--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    code text NOT NULL,
    name text NOT NULL,
    CONSTRAINT countries_code_caps CHECK ((code = upper(code))),
    CONSTRAINT countries_code_length CHECK ((length(code) = 2))
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- Name: TABLE countries; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.countries IS 'Country information per ISO-3166.';


--
-- Name: COLUMN countries.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.countries.code IS 'ISO-3166 alpha-2 country code.';


--
-- Name: COLUMN countries.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.countries.name IS 'Name of country in US English.';


--
-- Name: country_subdivisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.country_subdivisions (
    code text NOT NULL,
    country_code text NOT NULL,
    name text NOT NULL,
    CONSTRAINT country_subdivisions_code_length CHECK (((length(code) >= 4) AND (length(code) <= 6))),
    CONSTRAINT country_subdivisions_code_matches_country CHECK ((substr(code, 1, 2) = country_code))
);


ALTER TABLE public.country_subdivisions OWNER TO postgres;

--
-- Name: TABLE country_subdivisions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.country_subdivisions IS 'Country subdivision (state, province, region, etc.) information per ISO-3166-2.';


--
-- Name: COLUMN country_subdivisions.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.country_subdivisions.code IS 'Full ISO-3166-2 subdivision code including country code prefix.';


--
-- Name: COLUMN country_subdivisions.country_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.country_subdivisions.country_code IS 'ISO-3166 alpha-2 country code.';


--
-- Name: COLUMN country_subdivisions.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.country_subdivisions.name IS 'Name of subdivision in US English.';


--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: TABLE devices; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.devices IS 'Hardware devices managed by the device manager at a facility.';


--
-- Name: device_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: device_managers; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.device_managers OWNER TO postgres;

--
-- Name: TABLE device_managers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.device_managers IS 'Information about device managers. This is a combination of information from the Balena API and locally-generated values.';


--
-- Name: COLUMN device_managers.balena_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_managers.balena_id IS 'Balena-assigned device identifier.';


--
-- Name: COLUMN device_managers.balena_modified_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_managers.balena_modified_time IS 'Last modification timestamp from Balena. This is distinct from `refreshed_time`, which is updated locally.';


--
-- Name: COLUMN device_managers.update_progress; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_managers.update_progress IS 'Percent complete of software download and installation (0-100). Null if no software update is in progress.';


--
-- Name: COLUMN device_managers.sensor_kit_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_managers.sensor_kit_id IS 'ID code that is physically printed on the sensor kit and set as a tag value in the Balena device configuration.';


--
-- Name: COLUMN device_managers.created_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_managers.created_time IS 'When this device manager was added to the local database. The Balena device may have been created earlier.';


--
-- Name: device_managers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: device_template_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_template_categories (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.device_template_categories OWNER TO postgres;

--
-- Name: TABLE device_template_categories; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.device_template_categories IS '(Enum) User-facing categories of device templates; used to show templates for a particular class of devices where the physical device type may differ from one entry to the next.';


--
-- Name: device_templates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.device_templates OWNER TO postgres;

--
-- Name: TABLE device_templates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.device_templates IS 'Canned device configurations for use in cases where we want to show a list of possible devices to the user and create the selected device with the correct settings so that the device manager can talk to it.';


--
-- Name: device_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: ecosystem_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecosystem_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.ecosystem_types OWNER TO postgres;

--
-- Name: TABLE ecosystem_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ecosystem_types IS '(Enum) Types of ecosystems in which plants can be found. Based on the World Wildlife Federation''s "Terrestrial Ecoregions of the World" report.';


--
-- Name: facility_connection_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_connection_states (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.facility_connection_states OWNER TO postgres;

--
-- Name: TABLE facility_connection_states; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.facility_connection_states IS '(Enum) Progress of the configuration of a device manager for a facility.';


--
-- Name: facility_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.facility_types OWNER TO postgres;

--
-- Name: TABLE facility_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.facility_types IS '(Enum) Types of facilities that can be represented in the data model.';


--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: TABLE files; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.files IS 'Generic information about individual files. Files are associated with application entities using linking tables such as `accession_photos`.';


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: TABLE flyway_schema_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.flyway_schema_history IS 'Tracks which database migrations have already been applied. Used by the Flyway library, not by application.';


--
-- Name: gbif_distributions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.gbif_distributions OWNER TO postgres;

--
-- Name: TABLE gbif_distributions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.gbif_distributions IS 'Information about geographic distribution of species and their conservation statuses.';


--
-- Name: gbif_name_words; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gbif_name_words (
    gbif_name_id bigint NOT NULL,
    word text NOT NULL COLLATE pg_catalog."C"
);


ALTER TABLE public.gbif_name_words OWNER TO postgres;

--
-- Name: TABLE gbif_name_words; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.gbif_name_words IS 'Inverted index of lower-cased words from species and family names in the GBIF backbone dataset. Used to support fast per-word prefix searches.';


--
-- Name: gbif_names; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gbif_names (
    id bigint NOT NULL,
    taxon_id bigint NOT NULL,
    name text NOT NULL,
    language text,
    is_scientific boolean NOT NULL,
    CONSTRAINT gbif_names_language_check CHECK ((language !~ similar_to_escape(' *'::text)))
);


ALTER TABLE public.gbif_names OWNER TO postgres;

--
-- Name: TABLE gbif_names; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.gbif_names IS 'Scientific and vernacular names from the GBIF backbone dataset. Names are not required to be unique.';


--
-- Name: gbif_names_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: gbif_taxa; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.gbif_taxa OWNER TO postgres;

--
-- Name: TABLE gbif_taxa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.gbif_taxa IS 'Taxonomic data about species and families. A subset of the GBIF backbone dataset.';


--
-- Name: gbif_vernacular_names; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gbif_vernacular_names (
    taxon_id bigint NOT NULL,
    vernacular_name text NOT NULL,
    language text,
    country_code text,
    CONSTRAINT gbif_vernacular_names_country_code_check CHECK ((country_code !~ similar_to_escape(' *'::text))),
    CONSTRAINT gbif_vernacular_names_language_check CHECK ((language !~ similar_to_escape(' *'::text)))
);


ALTER TABLE public.gbif_vernacular_names OWNER TO postgres;

--
-- Name: TABLE gbif_vernacular_names; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.gbif_vernacular_names IS 'Vernacular names for species and families. Part of the GBIF backbone dataset.';


--
-- Name: seed_treatments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seed_treatments (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.seed_treatments OWNER TO postgres;

--
-- Name: TABLE seed_treatments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.seed_treatments IS '(Enum) Techniques that can be used to treat seeds before testing them for viability.';


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: global_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_roles (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.global_roles OWNER TO postgres;

--
-- Name: TABLE global_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.global_roles IS '(Enum) System-wide roles that can be assigned to users. Global roles are not tied to organizations. These are generally for system or business administration; most users have no global roles.';


--
-- Name: growth_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.growth_forms (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.growth_forms OWNER TO postgres;

--
-- Name: TABLE growth_forms; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.growth_forms IS '(Enum) What physical form a particular species takes. For example, "Tree" or "Shrub."';


--
-- Name: identifier_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identifier_sequences (
    organization_id bigint NOT NULL,
    prefix text NOT NULL,
    next_value bigint NOT NULL
);


ALTER TABLE public.identifier_sequences OWNER TO postgres;

--
-- Name: TABLE identifier_sequences; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.identifier_sequences IS 'Current state for generating user-facing identifiers (accession number, etc.) for each organization.';


--
-- Name: internal_tags; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.internal_tags OWNER TO postgres;

--
-- Name: TABLE internal_tags; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.internal_tags IS 'Internal (non-user-facing) tags. Low-numbered tags are defined by the system; the rest may be edited by super admins.';


--
-- Name: internal_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: jobrunr_backgroundjobservers; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.jobrunr_backgroundjobservers OWNER TO postgres;

--
-- Name: jobrunr_jobs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.jobrunr_jobs OWNER TO postgres;

--
-- Name: jobrunr_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobrunr_metadata (
    id character varying(156) NOT NULL,
    name character varying(92) NOT NULL,
    owner character varying(64) NOT NULL,
    value text NOT NULL,
    createdat timestamp without time zone NOT NULL,
    updatedat timestamp without time zone NOT NULL
);


ALTER TABLE public.jobrunr_metadata OWNER TO postgres;

--
-- Name: jobrunr_recurring_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobrunr_recurring_jobs (
    id character(128) NOT NULL,
    version integer NOT NULL,
    jobasjson text NOT NULL,
    createdat bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE public.jobrunr_recurring_jobs OWNER TO postgres;

--
-- Name: jobrunr_jobs_stats; Type: VIEW; Schema: public; Owner: postgres
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


ALTER TABLE public.jobrunr_jobs_stats OWNER TO postgres;

--
-- Name: jobrunr_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobrunr_migrations (
    id character(36) NOT NULL,
    script character varying(64) NOT NULL,
    installedon character varying(29) NOT NULL
);


ALTER TABLE public.jobrunr_migrations OWNER TO postgres;

--
-- Name: timeseries_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timeseries_values (
    timeseries_id bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.timeseries_values OWNER TO postgres;

--
-- Name: TABLE timeseries_values; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.timeseries_values IS 'Individual data points on a timeseries. For example, each time the temperature is read from a thermometer, the reading is inserted here.';


--
-- Name: latest_timeseries_values; Type: VIEW; Schema: public; Owner: postgres
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


ALTER TABLE public.latest_timeseries_values OWNER TO postgres;

--
-- Name: managed_location_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.managed_location_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.managed_location_types OWNER TO postgres;

--
-- Name: TABLE managed_location_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.managed_location_types IS '(Enum) Type of managed location for business analytics purposes.';


--
-- Name: notification_criticalities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_criticalities (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.notification_criticalities OWNER TO postgres;

--
-- Name: TABLE notification_criticalities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notification_criticalities IS '(Enum) Criticality information of notifications in the application.';


--
-- Name: notification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_types (
    id integer NOT NULL,
    name text NOT NULL,
    notification_criticality_id integer NOT NULL
);


ALTER TABLE public.notification_types OWNER TO postgres;

--
-- Name: TABLE notification_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notification_types IS '(Enum) Types of notifications in the application.';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notifications IS 'Notifications for application users.';


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: organization_internal_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_internal_tags (
    organization_id bigint NOT NULL,
    internal_tag_id bigint NOT NULL,
    created_by bigint NOT NULL,
    created_time timestamp with time zone NOT NULL
);


ALTER TABLE public.organization_internal_tags OWNER TO postgres;

--
-- Name: TABLE organization_internal_tags; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organization_internal_tags IS 'Which internal (non-user-facing) tags apply to which organizations.';


--
-- Name: organization_managed_location_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_managed_location_types (
    organization_id bigint NOT NULL,
    managed_location_type_id integer NOT NULL
);


ALTER TABLE public.organization_managed_location_types OWNER TO postgres;

--
-- Name: TABLE organization_managed_location_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organization_managed_location_types IS 'Per-organization information about managed location types for business analytics purposes.';


--
-- Name: organization_report_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_report_settings (
    organization_id bigint NOT NULL,
    is_enabled boolean NOT NULL
);


ALTER TABLE public.organization_report_settings OWNER TO postgres;

--
-- Name: TABLE organization_report_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organization_report_settings IS 'Organization-level settings for quarterly reports. Project-level settings are in `project_report_settings`.';


--
-- Name: organization_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.organization_types OWNER TO postgres;

--
-- Name: TABLE organization_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organization_types IS '(Enum) Type of forestry organization for business analytics purposes.';


--
-- Name: organization_users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.organization_users OWNER TO postgres;

--
-- Name: TABLE organization_users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organization_users IS 'Organization membership and role information.';


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: TABLE organizations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.organizations IS 'Top-level information about organizations.';


--
-- Name: COLUMN organizations.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.organizations.id IS 'Unique numeric identifier of the organization.';


--
-- Name: COLUMN organizations.organization_type_details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.organizations.organization_type_details IS 'User provided information on the organization when type is Other, limited to 100 characters.';


--
-- Name: COLUMN organizations.website; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.organizations.website IS 'Website information for the organization with no formatting restrictions.';


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: project_report_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_report_settings (
    project_id bigint NOT NULL,
    is_enabled boolean NOT NULL
);


ALTER TABLE public.project_report_settings OWNER TO postgres;

--
-- Name: TABLE project_report_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.project_report_settings IS 'Which projects require reports to be submitted each quarter. Organization-level settings are in `organization_report_settings`.';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
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
    participant_id bigint
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.projects IS 'Distinguishes among an organization''s projects.';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: report_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_files (
    file_id bigint NOT NULL,
    report_id bigint NOT NULL
);


ALTER TABLE public.report_files OWNER TO postgres;

--
-- Name: TABLE report_files; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.report_files IS 'Linking table between `reports` and `files` for non-photo files.';


--
-- Name: report_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_photos (
    report_id bigint NOT NULL,
    file_id bigint NOT NULL,
    caption text
);


ALTER TABLE public.report_photos OWNER TO postgres;

--
-- Name: TABLE report_photos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.report_photos IS 'Linking table between `reports` and `files` for photos.';


--
-- Name: report_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.report_statuses OWNER TO postgres;

--
-- Name: TABLE report_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.report_statuses IS '(Enum) Describes where in the workflow each partner report is.';


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: TABLE reports; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.reports IS 'Partner-submitted reports about their organizations and projects.';


--
-- Name: COLUMN reports.project_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reports.project_id IS 'If this report is for a specific project and the project still exists, the project ID. If the project has been deleted, this will be null but `project_name` will still be populated.';


--
-- Name: COLUMN reports.project_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.reports.project_name IS 'If this report is for a specific project, the name of the project as of the time the report was submitted.';


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.roles IS '(Enum) Roles a user is allowed to have in an organization.';


--
-- Name: seed_storage_behaviors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seed_storage_behaviors (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.seed_storage_behaviors OWNER TO postgres;

--
-- Name: TABLE seed_storage_behaviors; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.seed_storage_behaviors IS '(Enum) How seeds of a particular species behave in storage.';


--
-- Name: site_module_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    scientific_name text NOT NULL,
    common_name text,
    family_name text,
    rare boolean,
    growth_form_id integer,
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
    CONSTRAINT species_common_name_check CHECK ((common_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT species_family_name_check CHECK ((family_name !~ similar_to_escape(' *'::text)))
);


ALTER TABLE public.species OWNER TO postgres;

--
-- Name: TABLE species; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.species IS 'Per-organization information about species.';


--
-- Name: COLUMN species.checked_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.species.checked_time IS 'If non-null, when the species was checked for possible suggested edits. If null, the species has not been checked yet.';


--
-- Name: species_ecosystem_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_ecosystem_types (
    species_id bigint NOT NULL,
    ecosystem_type_id integer NOT NULL
);


ALTER TABLE public.species_ecosystem_types OWNER TO postgres;

--
-- Name: TABLE species_ecosystem_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.species_ecosystem_types IS 'Ecosystems where each species can be found.';


--
-- Name: species_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: species_problem_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_problem_fields (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.species_problem_fields OWNER TO postgres;

--
-- Name: TABLE species_problem_fields; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.species_problem_fields IS '(Enum) Species fields that can be scanned for problems.';


--
-- Name: species_problem_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_problem_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.species_problem_types OWNER TO postgres;

--
-- Name: TABLE species_problem_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.species_problem_types IS '(Enum) Specific types of problems that can be detected in species data.';


--
-- Name: species_problems; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.species_problems OWNER TO postgres;

--
-- Name: TABLE species_problems; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.species_problems IS 'Problems found in species data. Rows are deleted from this table when the problem is marked as ignored by the user or the user accepts the suggested fix.';


--
-- Name: species_problems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: spring_session; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.spring_session OWNER TO postgres;

--
-- Name: TABLE spring_session; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.spring_session IS 'Active login sessions. Used by Spring Session, not the application.';


--
-- Name: spring_session_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spring_session_attributes (
    session_primary_id character(36) NOT NULL,
    attribute_name character varying(200) NOT NULL,
    attribute_bytes bytea NOT NULL
);


ALTER TABLE public.spring_session_attributes OWNER TO postgres;

--
-- Name: TABLE spring_session_attributes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.spring_session_attributes IS 'Data associated with a login session. Used by Spring Session, not the application.';


--
-- Name: sub_locations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.sub_locations OWNER TO postgres;

--
-- Name: TABLE sub_locations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sub_locations IS 'The available locations where seeds can be stored at a seed bank facility or seedlings can be stored at a nursery facility.';


--
-- Name: COLUMN sub_locations.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sub_locations.name IS 'E.g., Freezer 1, Freezer 2';


--
-- Name: storage_location_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: test_clock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_clock (
    fake_time timestamp with time zone NOT NULL,
    real_time timestamp with time zone NOT NULL
);


ALTER TABLE public.test_clock OWNER TO postgres;

--
-- Name: TABLE test_clock; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.test_clock IS 'User-adjustable clock for test environments. Not used in production.';


--
-- Name: COLUMN test_clock.fake_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.test_clock.fake_time IS 'What time the server should believe it was at the time the row was written.';


--
-- Name: COLUMN test_clock.real_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.test_clock.real_time IS 'What time it was in the real world when the row was written.';


--
-- Name: thumbnails; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.thumbnails OWNER TO postgres;

--
-- Name: TABLE thumbnails; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.thumbnails IS 'Information about scaled-down versions of photos.';


--
-- Name: thumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: time_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_zones (
    time_zone text NOT NULL
);


ALTER TABLE public.time_zones OWNER TO postgres;

--
-- Name: TABLE time_zones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.time_zones IS '(Enum) Valid time zone names. This is populated with the list of names from the IANA time zone database.';


--
-- Name: timeseries; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.timeseries OWNER TO postgres;

--
-- Name: TABLE timeseries; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.timeseries IS 'Properties of a series of values collected from a device. Each device metric is represented as a timeseries.';


--
-- Name: COLUMN timeseries.units; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timeseries.units IS 'For numeric timeseries, the units represented by the values; unit names should be short (possibly abbreviations) and in the default language of the site.';


--
-- Name: COLUMN timeseries.decimal_places; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timeseries.decimal_places IS 'For numeric timeseries, the number of digits after the decimal point to display.';


--
-- Name: timeseries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: timeseries_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timeseries_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.timeseries_types OWNER TO postgres;

--
-- Name: TABLE timeseries_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.timeseries_types IS '(Enum) Data formats of the values of a timeseries.';


--
-- Name: upload_problem_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_problem_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.upload_problem_types OWNER TO postgres;

--
-- Name: TABLE upload_problem_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.upload_problem_types IS '(Enum) Specific types of problems encountered while processing a user-uploaded file.';


--
-- Name: upload_problems; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.upload_problems OWNER TO postgres;

--
-- Name: TABLE upload_problems; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.upload_problems IS 'Details about problems (validation failures, etc.) in user-uploaded files.';


--
-- Name: COLUMN upload_problems."position"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.upload_problems."position" IS 'Where in the uploaded file the problem appears, or null if it is a problem with the file as a whole. This may be a byte offset, a line number, or a record number depending on the type of file.';


--
-- Name: COLUMN upload_problems.field; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.upload_problems.field IS 'If the problem pertains to a specific field, its name. Null if the problem affects an entire record or the entire file.';


--
-- Name: upload_problems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: upload_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    finished boolean NOT NULL
);


ALTER TABLE public.upload_statuses OWNER TO postgres;

--
-- Name: TABLE upload_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.upload_statuses IS '(Enum) Available statuses of user-uploaded files. Uploads progress through these statuses as the system processes the files.';


--
-- Name: COLUMN upload_statuses.finished; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.upload_statuses.finished IS 'If true, this status means that the system is finished processing the file.';


--
-- Name: upload_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_types (
    id integer NOT NULL,
    name text NOT NULL,
    expire_files boolean NOT NULL
);


ALTER TABLE public.upload_types OWNER TO postgres;

--
-- Name: TABLE upload_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.upload_types IS '(Enum) Types of user-uploaded files whose progress can be tracked in the uploads table.';


--
-- Name: COLUMN upload_types.expire_files; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.upload_types.expire_files IS 'Old rows are automatically deleted from the uploads table. If this value is true, files will also be removed from the file store for old uploads of this type.';


--
-- Name: uploads; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.uploads OWNER TO postgres;

--
-- Name: TABLE uploads; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.uploads IS 'Information about the status of files uploaded by users. This is used to track the progress of file processing such as importing datafiles; contents of this table may expire and be deleted after a certain amount of time.';


--
-- Name: uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: user_global_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_global_roles (
    user_id bigint NOT NULL,
    global_role_id integer NOT NULL
);


ALTER TABLE public.user_global_roles OWNER TO postgres;

--
-- Name: TABLE user_global_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_global_roles IS 'Which users have which global roles.';


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preferences (
    user_id bigint NOT NULL,
    organization_id bigint,
    preferences jsonb NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO postgres;

--
-- Name: TABLE user_preferences; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_preferences IS 'Client-defined preferences that should persist across browser sessions.';


--
-- Name: COLUMN user_preferences.organization_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_preferences.organization_id IS 'If null, preferences are global to the user. Otherwise, they are specific to the user and the organization.';


--
-- Name: user_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.user_types OWNER TO postgres;

--
-- Name: TABLE user_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_types IS '(Enum) Types of users. Most users are of type 1, "Individual."';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT users_auth_id_check CHECK ((auth_id !~ similar_to_escape(' *'::text))),
    CONSTRAINT users_first_name_check CHECK ((first_name !~ similar_to_escape(' *'::text))),
    CONSTRAINT users_last_name_check CHECK ((last_name !~ similar_to_escape(' *'::text)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'User identities. A user can be associated with organizations via `organization_users`.';


--
-- Name: COLUMN users.auth_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.auth_id IS 'Unique identifier of the user in the authentication system. Currently, this is a Keycloak user ID.';


--
-- Name: COLUMN users.last_activity_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.last_activity_time IS 'When the user most recently interacted with the system.';


--
-- Name: COLUMN users.email_notifications_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.email_notifications_enabled IS 'If true, the user wants to receive notifications via email.';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
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
-- Name: accession_collectors; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.accession_collectors (
    accession_id bigint NOT NULL,
    "position" integer NOT NULL,
    name text NOT NULL,
    CONSTRAINT accession_collectors_name_check CHECK ((name !~ similar_to_escape('\s*'::text))),
    CONSTRAINT accession_collectors_position_check CHECK (("position" >= 0))
);


ALTER TABLE seedbank.accession_collectors OWNER TO postgres;

--
-- Name: TABLE accession_collectors; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accession_collectors IS 'Names of people who collected each accession.';


--
-- Name: accessions; Type: TABLE; Schema: seedbank; Owner: postgres
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


ALTER TABLE seedbank.accessions OWNER TO postgres;

--
-- Name: TABLE accessions; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accessions IS 'Information about batches of seeds. An accession is a batch of seeds of the same species collected in the same time and place by the same people.';


--
-- Name: COLUMN accessions.number; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.number IS 'Displayed as the accession number to the user.';


--
-- Name: COLUMN accessions.total_viability_percent; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.total_viability_percent IS 'Percentage of viable seeds across all tests.';


--
-- Name: COLUMN accessions.latest_observed_quantity; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.latest_observed_quantity IS 'Most recent remaining quantity as observed by the user.';


--
-- Name: COLUMN accessions.latest_observed_units_id; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.latest_observed_units_id IS 'Measurement units of `observed_quantity`.';


--
-- Name: COLUMN accessions.latest_observed_time; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.latest_observed_time IS 'Time of most recent change to observed quantity.';


--
-- Name: COLUMN accessions.total_withdrawn_count; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.total_withdrawn_count IS 'Total number of seeds withdrawn. May be an estimate if withdrawals were measured by weight.';


--
-- Name: COLUMN accessions.total_withdrawn_weight_quantity; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.total_withdrawn_weight_quantity IS 'Total weight of seeds withdrawn. May be an estimate if withdrawals were measured by seed count.';


--
-- Name: COLUMN accessions.total_withdrawn_weight_units_id; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accessions.total_withdrawn_weight_units_id IS 'Measurement units of `total_withdrawn_weight_quantity`.';


--
-- Name: accession_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: accession_photos; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.accession_photos (
    accession_id bigint NOT NULL,
    file_id bigint NOT NULL
);


ALTER TABLE seedbank.accession_photos OWNER TO postgres;

--
-- Name: TABLE accession_photos; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accession_photos IS 'Linking table between `accessions` and `files`.';


--
-- Name: accession_quantity_history; Type: TABLE; Schema: seedbank; Owner: postgres
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


ALTER TABLE seedbank.accession_quantity_history OWNER TO postgres;

--
-- Name: TABLE accession_quantity_history; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accession_quantity_history IS 'Historical record of changes to remaining quantities of accessions.';


--
-- Name: accession_quantity_history_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: accession_quantity_history_types; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.accession_quantity_history_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.accession_quantity_history_types OWNER TO postgres;

--
-- Name: TABLE accession_quantity_history_types; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accession_quantity_history_types IS '(Enum) Types of operations that can result in changes to remaining quantities of accessions.';


--
-- Name: accession_state_history; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.accession_state_history (
    accession_id bigint NOT NULL,
    updated_time timestamp with time zone NOT NULL,
    old_state_id integer,
    new_state_id integer NOT NULL,
    reason text NOT NULL,
    updated_by bigint NOT NULL
);


ALTER TABLE seedbank.accession_state_history OWNER TO postgres;

--
-- Name: TABLE accession_state_history; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accession_state_history IS 'Historical record of when accessions moved to different states. A row is inserted here for every state transition.';


--
-- Name: COLUMN accession_state_history.old_state_id; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON COLUMN seedbank.accession_state_history.old_state_id IS 'Null if this is the initial state for a new accession.';


--
-- Name: accession_states; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.accession_states (
    id integer NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE seedbank.accession_states OWNER TO postgres;

--
-- Name: TABLE accession_states; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.accession_states IS '(Enum) Available states an accession can be in. Each state represents a step in the seed management workflow.';


--
-- Name: bags; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.bags (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    bag_number text,
    CONSTRAINT bags_bag_number_check CHECK ((bag_number !~ similar_to_escape(' *'::text)))
);


ALTER TABLE seedbank.bags OWNER TO postgres;

--
-- Name: TABLE bags; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.bags IS 'Individual bags of seeds that are part of an accession. An accession can consist of multiple bags.';


--
-- Name: bag_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: geolocations; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.geolocations (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    created_time timestamp with time zone,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    gps_accuracy double precision
);


ALTER TABLE seedbank.geolocations OWNER TO postgres;

--
-- Name: TABLE geolocations; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.geolocations IS 'Locations where seeds were collected.';


--
-- Name: collection_event_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: collection_sources; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.collection_sources (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.collection_sources OWNER TO postgres;

--
-- Name: TABLE collection_sources; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.collection_sources IS '(Enum) Types of source plants that seeds can be collected from.';


--
-- Name: data_sources; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.data_sources (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.data_sources OWNER TO postgres;

--
-- Name: TABLE data_sources; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.data_sources IS '(Enum) Original sources of data, e.g., manual entry via web app.';


--
-- Name: viability_test_results; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.viability_test_results (
    id bigint NOT NULL,
    test_id bigint NOT NULL,
    recording_date date NOT NULL,
    seeds_germinated integer NOT NULL
);


ALTER TABLE seedbank.viability_test_results OWNER TO postgres;

--
-- Name: TABLE viability_test_results; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.viability_test_results IS 'Result from a viability test of a batch of seeds. Viability tests can have multiple germinations, e.g., if different seeds germinate on different days.';


--
-- Name: germination_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: viability_test_seed_types; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.viability_test_seed_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.viability_test_seed_types OWNER TO postgres;

--
-- Name: TABLE viability_test_seed_types; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.viability_test_seed_types IS '(Enum) Types of seeds that can be tested for viability. This refers to how the seeds were stored, not the physical characteristics of the seeds themselves.';


--
-- Name: germination_seed_type_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: viability_test_substrates; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.viability_test_substrates (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.viability_test_substrates OWNER TO postgres;

--
-- Name: TABLE viability_test_substrates; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.viability_test_substrates IS '(Enum) Types of substrate that can be used to test seeds for viability.';


--
-- Name: germination_substrate_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: viability_tests; Type: TABLE; Schema: seedbank; Owner: postgres
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


ALTER TABLE seedbank.viability_tests OWNER TO postgres;

--
-- Name: TABLE viability_tests; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.viability_tests IS 'Information about a single batch of seeds being tested for viability. This is the information about the test itself; the results are represented in the `viability_test_results` table.';


--
-- Name: germination_test_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: seed_quantity_units; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.seed_quantity_units (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.seed_quantity_units OWNER TO postgres;

--
-- Name: TABLE seed_quantity_units; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.seed_quantity_units IS '(Enum) Available units in which seeds can be measured. For weight-based units, includes unit conversion information.';


--
-- Name: viability_test_types; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.viability_test_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.viability_test_types OWNER TO postgres;

--
-- Name: TABLE viability_test_types; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.viability_test_types IS '(Enum) Types of tests that can be performed on seeds to check for viability.';


--
-- Name: withdrawals; Type: TABLE; Schema: seedbank; Owner: postgres
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


ALTER TABLE seedbank.withdrawals OWNER TO postgres;

--
-- Name: TABLE withdrawals; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.withdrawals IS 'Information about seeds that have been withdrawn from a seed bank. Each time someone withdraws seeds, a new row is inserted here.';


--
-- Name: withdrawal_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: withdrawal_purposes; Type: TABLE; Schema: seedbank; Owner: postgres
--

CREATE TABLE seedbank.withdrawal_purposes (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE seedbank.withdrawal_purposes OWNER TO postgres;

--
-- Name: TABLE withdrawal_purposes; Type: COMMENT; Schema: seedbank; Owner: postgres
--

COMMENT ON TABLE seedbank.withdrawal_purposes IS '(Enum) Reasons that someone can withdraw seeds from a seed bank.';


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: postgres
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
-- Name: deliveries_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: draft_planting_sites; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.draft_planting_sites OWNER TO postgres;

--
-- Name: TABLE draft_planting_sites; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.draft_planting_sites IS 'Details of planting sites that are in the process of being defined.';


--
-- Name: COLUMN draft_planting_sites.num_planting_zones; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.draft_planting_sites.num_planting_zones IS 'Number of planting zones defined so far.';


--
-- Name: COLUMN draft_planting_sites.num_planting_subzones; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.draft_planting_sites.num_planting_subzones IS 'Number of planting subzones defined so far.';


--
-- Name: COLUMN draft_planting_sites.data; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.draft_planting_sites.data IS 'Client-defined state of the definition of the planting site. This may include a mix of map data and application state and is treated as opaque by the server.';


--
-- Name: draft_planting_sites_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: monitoring_plots; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.monitoring_plots OWNER TO postgres;

--
-- Name: TABLE monitoring_plots; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.monitoring_plots IS 'Regions within planting subzones that can be comprehensively surveyed in order to extrapolate results for the entire zone. Any monitoring plot in a subzone is expected to have roughly the same number of plants of the same species as any other monitoring plot in the same subzone.';


--
-- Name: COLUMN monitoring_plots.planting_subzone_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.planting_subzone_id IS 'Which planting subzone this monitoring plot is part of.';


--
-- Name: COLUMN monitoring_plots.created_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.created_by IS 'Which user created the monitoring plot.';


--
-- Name: COLUMN monitoring_plots.created_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.created_time IS 'When the monitoring plot was originally created.';


--
-- Name: COLUMN monitoring_plots.modified_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.modified_by IS 'Which user most recently modified the monitoring plot.';


--
-- Name: COLUMN monitoring_plots.modified_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.modified_time IS 'When the monitoring plot was most recently modified.';


--
-- Name: COLUMN monitoring_plots.boundary; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.boundary IS 'Boundary of the monitoring plot. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN monitoring_plots.permanent_cluster; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.permanent_cluster IS 'If this plot is a candidate to be a permanent monitoring plot, its position in the randomized list of plots for the planting zone. Starts at 1 for each planting zone. There are always 4 plots with a given sequence number in a given zone. If null, this plot is not part of a 4-plot cluster but may still be chosen as a temporary monitoring plot.';


--
-- Name: COLUMN monitoring_plots.permanent_cluster_subplot; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.monitoring_plots.permanent_cluster_subplot IS 'If this plot is a candidate to be a permanent monitoring plot, its ordinal position from 1 to 4 in the 4-plot cluster. 1=southwest, 2=southeast, 3=northeast, 4=northwest.';


--
-- Name: monitoring_plots_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: observable_conditions; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.observable_conditions (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE tracking.observable_conditions OWNER TO postgres;

--
-- Name: TABLE observable_conditions; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observable_conditions IS '(Enum) Conditions that can be observed in a monitoring plot.';


--
-- Name: observation_photos; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.observation_photos (
    file_id bigint NOT NULL,
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    position_id integer NOT NULL,
    gps_coordinates public.geometry(Point)
);


ALTER TABLE tracking.observation_photos OWNER TO postgres;

--
-- Name: TABLE observation_photos; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observation_photos IS 'Observation-specific details about a photo of a monitoring plot. Generic metadata is in the `files` table.';


--
-- Name: observation_plot_conditions; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.observation_plot_conditions (
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    condition_id integer NOT NULL
);


ALTER TABLE tracking.observation_plot_conditions OWNER TO postgres;

--
-- Name: TABLE observation_plot_conditions; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observation_plot_conditions IS 'List of conditions observed in each monitoring plot.';


--
-- Name: observation_plot_positions; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.observation_plot_positions (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE tracking.observation_plot_positions OWNER TO postgres;

--
-- Name: TABLE observation_plot_positions; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observation_plot_positions IS '(Enum) Positions in a monitoring plot where users can take photos or record coordinates.';


--
-- Name: observation_plots; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.observation_plots OWNER TO postgres;

--
-- Name: TABLE observation_plots; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observation_plots IS 'Information about monitoring plots that are required to be surveyed as part of observations. This is not populated until the scheduled start time of the observation.';


--
-- Name: COLUMN observation_plots.completed_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observation_plots.completed_time IS 'Server-generated completion date and time. This is the time the observation was submitted to the server, not the time it was performed in the field.';


--
-- Name: COLUMN observation_plots.is_permanent; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observation_plots.is_permanent IS 'If true, this plot was selected for observation as part of a permanent monitoring plot cluster. If false, this plot was selected as a temporary monitoring plot.';


--
-- Name: COLUMN observation_plots.observed_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observation_plots.observed_time IS 'Client-supplied observation date and time. This is the time the observation was performed in the field, not the time it was submitted to the server.';


--
-- Name: observation_states; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.observation_states (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE tracking.observation_states OWNER TO postgres;

--
-- Name: TABLE observation_states; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observation_states IS '(Enum) Where in the observation lifecycle a particular observation is.';


--
-- Name: observations; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.observations OWNER TO postgres;

--
-- Name: TABLE observations; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observations IS 'Scheduled observations of planting sites. This table may contain rows describing future observations as well as current and past ones.';


--
-- Name: COLUMN observations.start_date; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observations.start_date IS 'First day of the observation. This is either the first day of the month following the end of the planting season, or 6 months after that day.';


--
-- Name: COLUMN observations.end_date; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observations.end_date IS 'Last day of the observation. This is typically the last day of the same month as `start_date`.';


--
-- Name: COLUMN observations.completed_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observations.completed_time IS 'Server-generated date and time the final piece of data for the observation was received.';


--
-- Name: COLUMN observations.upcoming_notification_sent_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observations.upcoming_notification_sent_time IS 'When the notification that the observation is starting in 1 month was sent. Null if the notification has not been sent yet.';


--
-- Name: observations_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: observed_plot_coordinates; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.observed_plot_coordinates (
    id bigint NOT NULL,
    observation_id bigint NOT NULL,
    monitoring_plot_id bigint NOT NULL,
    position_id integer NOT NULL,
    gps_coordinates public.geometry(Point) NOT NULL
);


ALTER TABLE tracking.observed_plot_coordinates OWNER TO postgres;

--
-- Name: TABLE observed_plot_coordinates; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observed_plot_coordinates IS 'Observed GPS coordinates in monitoring plots. Does not include photo coordinates or coordinates of recorded plants.';


--
-- Name: observed_plot_coordinates_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: observed_plot_species_totals; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.observed_plot_species_totals OWNER TO postgres;

--
-- Name: TABLE observed_plot_species_totals; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observed_plot_species_totals IS 'Aggregated per-monitoring-plot, per-species totals of plants recorded during observations.';


--
-- Name: COLUMN observed_plot_species_totals.mortality_rate; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_plot_species_totals.mortality_rate IS 'If this is a permanent monitoring plot, percentage of plants of the species observed in this plot, in either this observation or in previous ones, that were dead. Null if this is not a permanent monitoring plot in the current observation.';


--
-- Name: COLUMN observed_plot_species_totals.cumulative_dead; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_plot_species_totals.cumulative_dead IS 'If this is a permanent monitoring plot, total number of dead plants observed in all observations including the current one.';


--
-- Name: COLUMN observed_plot_species_totals.permanent_live; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_plot_species_totals.permanent_live IS 'If this is a permanent monitoring plot, the number of live and existing plants observed. 0 otherwise.';


--
-- Name: observed_site_species_totals; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.observed_site_species_totals OWNER TO postgres;

--
-- Name: TABLE observed_site_species_totals; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observed_site_species_totals IS 'Aggregated per-planting-site, per-species totals of plants recorded during observations.';


--
-- Name: COLUMN observed_site_species_totals.mortality_rate; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_site_species_totals.mortality_rate IS 'Percentage of plants of the species observed in permanent monitoring plots in the planting site, in either this observation or in previous ones, that were dead.';


--
-- Name: COLUMN observed_site_species_totals.cumulative_dead; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_site_species_totals.cumulative_dead IS 'Total number of dead plants of the species observed, both in this observation and in all previous ones, in plots that are included as permanent plots in this observation.';


--
-- Name: COLUMN observed_site_species_totals.permanent_live; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_site_species_totals.permanent_live IS 'The number of live and existing plants observed in permanent monitoring plots.';


--
-- Name: observed_zone_species_totals; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.observed_zone_species_totals OWNER TO postgres;

--
-- Name: TABLE observed_zone_species_totals; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.observed_zone_species_totals IS 'Aggregated per-planting-zone, per-species totals of plants recorded during observations.';


--
-- Name: COLUMN observed_zone_species_totals.mortality_rate; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_zone_species_totals.mortality_rate IS 'Percentage of plants of the species observed in permanent monitoring plots in the planting zone, in either the current observation or in previous ones, that were dead.';


--
-- Name: COLUMN observed_zone_species_totals.cumulative_dead; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_zone_species_totals.cumulative_dead IS 'Total number of dead plants of the species observed, both in this observation and in all previous ones, in plots in this zone that are included as permanent plots in this observation.';


--
-- Name: COLUMN observed_zone_species_totals.permanent_live; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.observed_zone_species_totals.permanent_live IS 'The number of live and existing plants observed in permanent monitoring plots.';


--
-- Name: planting_seasons; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.planting_seasons OWNER TO postgres;

--
-- Name: TABLE planting_seasons; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_seasons IS 'Start and end dates of planting seasons for planting sites.';


--
-- Name: COLUMN planting_seasons.start_date; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_seasons.start_date IS 'What day the planting season starts.';


--
-- Name: COLUMN planting_seasons.start_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_seasons.start_time IS 'When the planting season will start. This is midnight on `start_date` in the planting site''s time zone.';


--
-- Name: COLUMN planting_seasons.end_date; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_seasons.end_date IS 'What day the planting season ends. This is the last day of the season, not the day after the season, that is, if the planting season is the month of January, this will be January 31, not February 1.';


--
-- Name: COLUMN planting_seasons.end_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_seasons.end_time IS 'When the planting season will be finished. This is midnight on the day after `end_date` in the planting site''s time zone.';


--
-- Name: COLUMN planting_seasons.is_active; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_seasons.is_active IS 'True if the planting season is currently in progress. Only one planting season can be active at a time for a planting site.';


--
-- Name: planting_seasons_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: planting_site_notifications; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.planting_site_notifications (
    id bigint NOT NULL,
    planting_site_id bigint NOT NULL,
    notification_type_id integer NOT NULL,
    notification_number integer NOT NULL,
    sent_time timestamp with time zone NOT NULL
);


ALTER TABLE tracking.planting_site_notifications OWNER TO postgres;

--
-- Name: TABLE planting_site_notifications; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_site_notifications IS 'Tracks which notifications have already been sent regarding planting sites.';


--
-- Name: COLUMN planting_site_notifications.notification_number; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_site_notifications.notification_number IS 'Number of notifications of this type that have been sent, including this one. 1 for initial notification, 2 for reminder, 3 for second reminder, etc.';


--
-- Name: planting_site_notifications_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: planting_site_populations; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.planting_site_populations (
    planting_site_id bigint NOT NULL,
    species_id bigint NOT NULL,
    total_plants integer NOT NULL,
    plants_since_last_observation integer
);


ALTER TABLE tracking.planting_site_populations OWNER TO postgres;

--
-- Name: TABLE planting_site_populations; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_site_populations IS 'Total number of plants of each species in each planting site.';


--
-- Name: planting_zones; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.planting_zones OWNER TO postgres;

--
-- Name: TABLE planting_zones; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_zones IS 'Regions within planting sites that have a consistent set of conditions such that survey results from any part of the zone can be extrapolated to the entire zone. Planting zones are subdivided into plots. Every planting zone has at least one plot.';


--
-- Name: COLUMN planting_zones.planting_site_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.planting_site_id IS 'Which planting site this zone is part of.';


--
-- Name: COLUMN planting_zones.name; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.name IS 'Short name of this planting zone. This is often just a single letter. Must be unique within a planting site.';


--
-- Name: COLUMN planting_zones.boundary; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.boundary IS 'Boundary of the planting zone. This area is further subdivided into plots. This will typically be a single polygon but may be multiple polygons if a planting zone has several disjoint areas. Coordinates always use SRID 4326 (WGS 84 latitude/longitude).';


--
-- Name: COLUMN planting_zones.created_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.created_by IS 'Which user created the planting zone.';


--
-- Name: COLUMN planting_zones.created_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.created_time IS 'When the planting zone was originally created.';


--
-- Name: COLUMN planting_zones.modified_by; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.modified_by IS 'Which user most recently modified the planting zone.';


--
-- Name: COLUMN planting_zones.modified_time; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.modified_time IS 'When the planting zone was most recently modified.';


--
-- Name: COLUMN planting_zones.num_permanent_clusters; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.num_permanent_clusters IS 'Number of permanent clusters to assign to the next observation. This is typically derived from a statistical formula and from `extra_permanent_clusters`.';


--
-- Name: COLUMN planting_zones.extra_permanent_clusters; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.planting_zones.extra_permanent_clusters IS 'Number of clusters to add to observation in addition to the number that is derived from the statistical formula. Typically this is due to additional area being added to a zone after initial creation. This is included in the value of `num_permanent_clusters`, that is, it is an input to the calculation of that column''s value.';


--
-- Name: planting_site_summaries; Type: VIEW; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.planting_site_summaries OWNER TO postgres;

--
-- Name: planting_sites_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: planting_subzone_populations; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.planting_subzone_populations (
    planting_subzone_id bigint NOT NULL,
    species_id bigint NOT NULL,
    total_plants integer NOT NULL,
    plants_since_last_observation integer
);


ALTER TABLE tracking.planting_subzone_populations OWNER TO postgres;

--
-- Name: TABLE planting_subzone_populations; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_subzone_populations IS 'Total number of plants of each species in each subzone.';


--
-- Name: planting_types; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.planting_types (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE tracking.planting_types OWNER TO postgres;

--
-- Name: TABLE planting_types; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_types IS '(Enum) Type of planting associated with a delivery. Different planting types distinguish reassignments from initial plantings.';


--
-- Name: planting_zone_populations; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.planting_zone_populations (
    planting_zone_id bigint NOT NULL,
    species_id bigint NOT NULL,
    total_plants integer NOT NULL,
    plants_since_last_observation integer
);


ALTER TABLE tracking.planting_zone_populations OWNER TO postgres;

--
-- Name: TABLE planting_zone_populations; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.planting_zone_populations IS 'Total number of plants of each species in each zone.';


--
-- Name: planting_zones_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: plantings_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: plots_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: recorded_plant_statuses; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.recorded_plant_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE tracking.recorded_plant_statuses OWNER TO postgres;

--
-- Name: TABLE recorded_plant_statuses; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.recorded_plant_statuses IS '(Enum) Possible statuses of a plant recorded during observation of a monitoring plot.';


--
-- Name: recorded_plants; Type: TABLE; Schema: tracking; Owner: postgres
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


ALTER TABLE tracking.recorded_plants OWNER TO postgres;

--
-- Name: TABLE recorded_plants; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.recorded_plants IS 'Information about individual plants observed in monitoring plots.';


--
-- Name: COLUMN recorded_plants.species_id; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.recorded_plants.species_id IS 'If certainty is "Known," the ID of the plant''s species. Null for other certainty values.';


--
-- Name: COLUMN recorded_plants.species_name; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON COLUMN tracking.recorded_plants.species_name IS 'If certainty is "Other," the user-supplied name of the plant''s species. Null for other certainty values.';


--
-- Name: recorded_plants_id_seq; Type: SEQUENCE; Schema: tracking; Owner: postgres
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
-- Name: recorded_species_certainties; Type: TABLE; Schema: tracking; Owner: postgres
--

CREATE TABLE tracking.recorded_species_certainties (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE tracking.recorded_species_certainties OWNER TO postgres;

--
-- Name: TABLE recorded_species_certainties; Type: COMMENT; Schema: tracking; Owner: postgres
--

COMMENT ON TABLE tracking.recorded_species_certainties IS '(Enum) Levels of certainty about the identity of a species recorded in a monitoring plot observation.';


--
-- Data for Name: cohort_modules; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.cohort_modules (id, cohort_id, module_id, start_date, end_date) FROM stdin;
\.


--
-- Data for Name: cohort_phases; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.cohort_phases (id, name) FROM stdin;
0	Phase 0 - Due Diligence
1	Phase 1 - Feasibility Study
2	Phase 2 - Plan and Scale
3	Phase 3 - Implement and Monitor
\.


--
-- Data for Name: cohorts; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.cohorts (id, name, created_by, created_time, modified_by, modified_time, phase_id) FROM stdin;
\.


--
-- Data for Name: deliverable_categories; Type: TABLE DATA; Schema: accelerator; Owner: postgres
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
-- Data for Name: deliverable_documents; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.deliverable_documents (deliverable_id, deliverable_type_id, template_url) FROM stdin;
\.


--
-- Data for Name: deliverable_types; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.deliverable_types (id, name) FROM stdin;
1	Document
\.


--
-- Data for Name: deliverables; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.deliverables (id, deliverable_category_id, deliverable_type_id, module_id, "position", created_by, created_time, modified_by, modified_time, name, description_html, is_sensitive, is_required) FROM stdin;
\.


--
-- Data for Name: document_stores; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.document_stores (id, name) FROM stdin;
1	Dropbox
2	Google
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.modules (id, name, created_by, created_time, modified_by, modified_time) FROM stdin;
\.


--
-- Data for Name: participants; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.participants (id, name, created_by, created_time, modified_by, modified_time, cohort_id) FROM stdin;
\.


--
-- Data for Name: submission_documents; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.submission_documents (id, submission_id, document_store_id, created_by, created_time, name, description, location, original_name) FROM stdin;
\.


--
-- Data for Name: submission_statuses; Type: TABLE DATA; Schema: accelerator; Owner: postgres
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
-- Data for Name: submissions; Type: TABLE DATA; Schema: accelerator; Owner: postgres
--

COPY accelerator.submissions (id, project_id, deliverable_id, submission_status_id, created_by, created_time, modified_by, modified_time, internal_comment, feedback) FROM stdin;
\.


--
-- Data for Name: batch_details_history; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_details_history (id, batch_id, version, created_by, created_time, notes, ready_by_date, project_id, project_name, substrate_id, substrate_notes, treatment_id, treatment_notes) FROM stdin;
1	1	1	1	2024-03-04 22:51:05.969834+00	Adding some test notes here!	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: batch_details_history_sub_locations; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_details_history_sub_locations (batch_details_history_id, sub_location_id, sub_location_name) FROM stdin;
\.


--
-- Data for Name: batch_photos; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_photos (id, batch_id, file_id, created_by, created_time, deleted_by, deleted_time) FROM stdin;
\.


--
-- Data for Name: batch_quantity_history; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_quantity_history (id, batch_id, history_type_id, created_by, created_time, germinating_quantity, not_ready_quantity, ready_quantity, withdrawal_id, version) FROM stdin;
1	1	1	1	2024-03-04 22:51:06.035268+00	300	0	0	\N	1
\.


--
-- Data for Name: batch_quantity_history_types; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_quantity_history_types (id, name) FROM stdin;
1	Observed
2	Computed
3	StatusChanged
\.


--
-- Data for Name: batch_sub_locations; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_sub_locations (batch_id, sub_location_id, facility_id) FROM stdin;
\.


--
-- Data for Name: batch_substrates; Type: TABLE DATA; Schema: nursery; Owner: postgres
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
-- Data for Name: batch_withdrawals; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batch_withdrawals (batch_id, withdrawal_id, germinating_quantity_withdrawn, not_ready_quantity_withdrawn, ready_quantity_withdrawn, destination_batch_id) FROM stdin;
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.batches (id, version, organization_id, facility_id, species_id, batch_number, added_date, germinating_quantity, not_ready_quantity, ready_quantity, latest_observed_germinating_quantity, latest_observed_not_ready_quantity, latest_observed_ready_quantity, latest_observed_time, created_by, created_time, modified_by, modified_time, notes, ready_by_date, accession_id, project_id, substrate_id, substrate_notes, treatment_id, treatment_notes, germination_rate, loss_rate, initial_batch_id, total_germinated, total_germination_candidates, total_lost, total_loss_candidates) FROM stdin;
1	1	1	104	4	24-2-1-001	2024-03-04	300	0	0	300	0	0	2024-03-04 22:51:05.969834+00	1	2024-03-04 22:51:05.969834+00	1	2024-03-04 22:51:05.969834+00	Adding some test notes here!	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: withdrawal_photos; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.withdrawal_photos (file_id, withdrawal_id) FROM stdin;
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.withdrawal_purposes (id, name) FROM stdin;
1	Nursery Transfer
2	Dead
3	Out Plant
4	Other
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: nursery; Owner: postgres
--

COPY nursery.withdrawals (id, facility_id, purpose_id, withdrawn_date, created_by, created_time, modified_by, modified_time, destination_facility_id, notes) FROM stdin;
\.


--
-- Data for Name: app_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_versions (app_name, platform, minimum_version, recommended_version) FROM stdin;
SeedCollector	Android	0.0.1	0.0.1
SeedCollector	iOS	0.0.1	0.0.1
\.


--
-- Data for Name: automations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.automations (id, facility_id, name, description, created_time, modified_time, settings, created_by, modified_by, type, device_id, timeseries_name, verbosity, lower_threshold, upper_threshold) FROM stdin;
\.


--
-- Data for Name: conservation_categories; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (code, name) FROM stdin;
AD	Andorra
AE	United Arab Emirates
AF	Afghanistan
AG	Antigua & Barbuda
AI	Anguilla
AL	Albania
AM	Armenia
AO	Angola
AQ	Antarctica
AR	Argentina
AS	American Samoa
AT	Austria
AU	Australia
AW	Aruba
AX	Åland Islands
AZ	Azerbaijan
BA	Bosnia & Herzegovina
BB	Barbados
BD	Bangladesh
BE	Belgium
BF	Burkina Faso
BG	Bulgaria
BH	Bahrain
BI	Burundi
BJ	Benin
BL	St. Barthélemy
BM	Bermuda
BN	Brunei
BO	Bolivia
BQ	Caribbean Netherlands
BR	Brazil
BS	Bahamas
BT	Bhutan
BV	Bouvet Island
BW	Botswana
BY	Belarus
BZ	Belize
CA	Canada
CC	Cocos (Keeling) Islands
CD	Congo - Kinshasa
CF	Central African Republic
CG	Congo - Brazzaville
CH	Switzerland
CI	Côte d’Ivoire
CK	Cook Islands
CL	Chile
CM	Cameroon
CN	China
CO	Colombia
CR	Costa Rica
CU	Cuba
CV	Cape Verde
CW	Curaçao
CX	Christmas Island
CY	Cyprus
CZ	Czechia
DE	Germany
DJ	Djibouti
DK	Denmark
DM	Dominica
DO	Dominican Republic
DZ	Algeria
EC	Ecuador
EE	Estonia
EG	Egypt
EH	Western Sahara
ER	Eritrea
ES	Spain
ET	Ethiopia
FI	Finland
FJ	Fiji
FK	Falkland Islands
FM	Micronesia
FO	Faroe Islands
FR	France
GA	Gabon
GB	United Kingdom
GD	Grenada
GE	Georgia
GF	French Guiana
GG	Guernsey
GH	Ghana
GI	Gibraltar
GL	Greenland
GM	Gambia
GN	Guinea
GP	Guadeloupe
GQ	Equatorial Guinea
GR	Greece
GS	South Georgia & South Sandwich Islands
GT	Guatemala
GU	Guam
GW	Guinea-Bissau
GY	Guyana
HK	Hong Kong SAR China
HM	Heard & McDonald Islands
HN	Honduras
HR	Croatia
HT	Haiti
HU	Hungary
ID	Indonesia
IE	Ireland
IL	Israel
IM	Isle of Man
IN	India
IO	British Indian Ocean Territory
IQ	Iraq
IR	Iran
IS	Iceland
IT	Italy
JE	Jersey
JM	Jamaica
JO	Jordan
JP	Japan
KE	Kenya
KG	Kyrgyzstan
KH	Cambodia
KI	Kiribati
KM	Comoros
KN	St. Kitts & Nevis
KP	North Korea
KR	South Korea
KW	Kuwait
KY	Cayman Islands
KZ	Kazakhstan
LA	Laos
LB	Lebanon
LC	St. Lucia
LI	Liechtenstein
LK	Sri Lanka
LR	Liberia
LS	Lesotho
LT	Lithuania
LU	Luxembourg
LV	Latvia
LY	Libya
MA	Morocco
MC	Monaco
MD	Moldova
ME	Montenegro
MF	St. Martin
MG	Madagascar
MH	Marshall Islands
MK	North Macedonia
ML	Mali
MM	Myanmar (Burma)
MN	Mongolia
MO	Macao SAR China
MP	Northern Mariana Islands
MQ	Martinique
MR	Mauritania
MS	Montserrat
MT	Malta
MU	Mauritius
MV	Maldives
MW	Malawi
MX	Mexico
MY	Malaysia
MZ	Mozambique
NA	Namibia
NC	New Caledonia
NE	Niger
NF	Norfolk Island
NG	Nigeria
NI	Nicaragua
NL	Netherlands
NO	Norway
NP	Nepal
NR	Nauru
NU	Niue
NZ	New Zealand
OM	Oman
PA	Panama
PE	Peru
PF	French Polynesia
PG	Papua New Guinea
PH	Philippines
PK	Pakistan
PL	Poland
PM	St. Pierre & Miquelon
PN	Pitcairn Islands
PR	Puerto Rico
PS	Palestinian Territories
PT	Portugal
PW	Palau
PY	Paraguay
QA	Qatar
RE	Réunion
RO	Romania
RS	Serbia
RU	Russia
RW	Rwanda
SA	Saudi Arabia
SB	Solomon Islands
SC	Seychelles
SD	Sudan
SE	Sweden
SG	Singapore
SH	St. Helena
SI	Slovenia
SJ	Svalbard & Jan Mayen
SK	Slovakia
SL	Sierra Leone
SM	San Marino
SN	Senegal
SO	Somalia
SR	Suriname
SS	South Sudan
ST	São Tomé & Príncipe
SV	El Salvador
SX	Sint Maarten
SY	Syria
SZ	Eswatini
TC	Turks & Caicos Islands
TD	Chad
TF	French Southern Territories
TG	Togo
TH	Thailand
TJ	Tajikistan
TK	Tokelau
TL	Timor-Leste
TM	Turkmenistan
TN	Tunisia
TO	Tonga
TR	Turkey
TT	Trinidad & Tobago
TV	Tuvalu
TW	Taiwan
TZ	Tanzania
UA	Ukraine
UG	Uganda
UM	U.S. Outlying Islands
US	United States
UY	Uruguay
UZ	Uzbekistan
VA	Vatican City
VC	St. Vincent & Grenadines
VE	Venezuela
VG	British Virgin Islands
VI	U.S. Virgin Islands
VN	Vietnam
VU	Vanuatu
WF	Wallis & Futuna
WS	Samoa
YE	Yemen
YT	Mayotte
ZA	South Africa
ZM	Zambia
ZW	Zimbabwe
\.


--
-- Data for Name: country_subdivisions; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: device_managers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_managers (id, balena_id, balena_modified_time, device_name, is_online, last_connectivity_event, update_progress, sensor_kit_id, user_id, facility_id, created_time, refreshed_time, balena_uuid) FROM stdin;
\.


--
-- Data for Name: device_template_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_template_categories (id, name) FROM stdin;
1	PV
2	Seed Bank Default
\.


--
-- Data for Name: device_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_templates (id, category_id, device_type, name, description, make, model, protocol, address, port, settings, verbosity) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, facility_id, name, device_type, make, model, protocol, address, port, enabled, settings, parent_id, created_by, modified_by, verbosity) FROM stdin;
\.


--
-- Data for Name: ecosystem_types; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facilities (id, type_id, name, created_time, modified_time, created_by, modified_by, max_idle_minutes, last_timeseries_time, idle_after_time, idle_since_time, description, connection_state_id, organization_id, time_zone, last_notification_date, next_notification_time, build_started_date, build_completed_date, operation_started_date, capacity, facility_number) FROM stdin;
100	1	Seed Bank	2022-02-04 17:48:28.616331+00	2022-02-04 17:48:28.616331+00	1	1	30	\N	\N	2022-01-01 00:00:00+00	\N	1	1	\N	2024-03-04	2024-03-05 00:01:00+00	\N	\N	\N	\N	1
101	1	garage	2022-02-04 17:48:28.616331+00	2022-02-04 17:48:28.616331+00	1	1	30	\N	\N	2022-01-01 00:00:00+00	\N	1	1	\N	2024-03-04	2024-03-05 00:01:00+00	\N	\N	\N	\N	2
102	1	Test facility	2022-02-04 17:48:28.616331+00	2022-02-04 17:48:28.616331+00	1	1	30	\N	\N	2022-01-01 00:00:00+00	\N	1	1	\N	2024-03-04	2024-03-05 00:01:00+00	\N	\N	\N	\N	3
103	1	My New Seed Bank-1709592631456	2024-03-04 22:50:33.749285+00	2024-03-04 22:50:33.749297+00	1	1	30	\N	\N	\N	My Brand New Seed Bank!	1	1	\N	\N	2024-03-05 00:01:00+00	2023-12-31	2024-01-31	2024-01-31	\N	4
104	4	My New Nursery-1709592636831	2024-03-04 22:50:37.990053+00	2024-03-04 22:50:37.990074+00	1	1	30	\N	\N	\N	My Super Special Test Nursery!!!	1	1	\N	\N	2024-03-05 00:01:00+00	2024-01-31	2024-02-01	2024-02-03	500	1
\.


--
-- Data for Name: facility_connection_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_connection_states (id, name) FROM stdin;
1	Not Connected
2	Connected
3	Configured
\.


--
-- Data for Name: facility_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_types (id, name) FROM stdin;
1	Seed Bank
2	Desalination
3	Reverse Osmosis
4	Nursery
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, file_name, content_type, size, created_time, modified_time, created_by, storage_url, modified_by) FROM stdin;
1001	accession1.jpg	image/jpeg	6441	2021-02-12 18:36:15.842405+00	2021-02-12 18:36:15.842405+00	1	file:///100/A/A/F/AAF4D49R3E/accession1.jpg	1
1002	accession2.jpg	image/jpeg	6539	2021-02-12 18:36:15.903768+00	2021-02-12 18:36:15.903768+00	1	file:///100/A/A/F/AAF4D49R3E/accession2.jpg	1
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
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
160	149	NurseryBatchSummariesVersion	SQL	0100/V149__NurseryBatchSummariesVersion.sql	2114969874	postgres	2024-03-04 22:49:40.305296	64	t
161	150	DropViabilityTestsRemaining	SQL	0150/V150__DropViabilityTestsRemaining.sql	1998768259	postgres	2024-03-04 22:49:40.419839	21	t
162	151	DropWithdrawalsRemaining	SQL	0150/V151__DropWithdrawalsRemaining.sql	-1818435616	postgres	2024-03-04 22:49:40.458557	14	t
163	152	DropUnusedColumns	SQL	0150/V152__DropUnusedColumns.sql	1970588205	postgres	2024-03-04 22:49:40.488497	64	t
164	153	PlantingSites	SQL	0150/V153__PlantingSites.sql	1533933111	postgres	2024-03-04 22:49:40.642246	329	t
165	154	PlantingSiteSummaries	SQL	0150/V154__PlantingSiteSummaries.sql	1062750391	postgres	2024-03-04 22:49:40.98719	28	t
166	155	NurseryWithdrawalPhotos	SQL	0150/V155__NurseryWithdrawalPhotos.sql	-1577167834	postgres	2024-03-04 22:49:41.041509	50	t
167	156	SeedbankWithdrawalPurposes	SQL	0150/V156__SeedbankWithdrawalPurposes.sql	-1692740770	postgres	2024-03-04 22:49:41.102525	51	t
168	157	PlantingSitesSrid	SQL	0150/V157__PlantingSitesSrid.sql	856178320	postgres	2024-03-04 22:49:41.164205	188	t
169	158	WithdrawalPurposeFix	SQL	0150/V158__WithdrawalPurposeFix.sql	538955178	postgres	2024-03-04 22:49:41.490911	13	t
170	159	Deliveries	SQL	0150/V159__Deliveries.sql	-395729289	postgres	2024-03-04 22:49:41.515647	302	t
171	160	Populations	SQL	0150/V160__Populations.sql	1829667259	postgres	2024-03-04 22:49:41.831908	14	t
172	161	Reassignments	SQL	0150/V161__Reassignments.sql	924192665	postgres	2024-03-04 22:49:41.855495	14	t
173	162	NurseryWithdrawalSummaries	SQL	0150/V162__NurseryWithdrawalSummaries.sql	111966756	postgres	2024-03-04 22:49:41.879453	36	t
174	163	RemoveBlankStrings	SQL	0150/V163__RemoveBlankStrings.sql	1246904535	postgres	2024-03-04 22:49:41.925416	412	t
175	164	RemoveBlankCollectors	SQL	0150/V164__RemoveBlankCollectors.sql	-126389008	postgres	2024-03-04 22:49:42.354234	11	t
176	165	TimeZones	SQL	0150/V165__TimeZones.sql	-192211023	postgres	2024-03-04 22:49:42.373942	60	t
177	166	PlantingSiteSummariesTimeZone	SQL	0150/V166__PlantingSiteSummariesTimeZone.sql	925441484	postgres	2024-03-04 22:49:42.44328	8	t
178	167	FacilitiesNotificationDate	SQL	0150/V167__FacilitiesNotificationDate.sql	745320468	postgres	2024-03-04 22:49:42.460509	28	t
179	168	UsersLocale	SQL	0150/V168__UsersLocale.sql	-805749659	postgres	2024-03-04 22:49:42.521424	3	t
180	169	UploadsLocale	SQL	0150/V169__UploadsLocale.sql	-1658633924	postgres	2024-03-04 22:49:42.53272	9	t
181	170	EcosystemTypes	SQL	0150/V170__EcosystemTypes.sql	163502732	postgres	2024-03-04 22:49:42.549145	84	t
182	171	AccessionsTotalWithdrawn	SQL	0150/V171__AccessionsTotalWithdrawn.sql	1445228831	postgres	2024-03-04 22:49:42.643807	9	t
183	172	Unaccent	SQL	0150/V172__Unaccent.sql	-240536801	postgres	2024-03-04 22:49:42.660821	60	t
184	173	StorageLocationNames	SQL	0150/V173__StorageLocationNames.sql	559001583	postgres	2024-03-04 22:49:42.728905	19	t
185	174	DropStorageConditions	SQL	0150/V174__DropStorageConditions.sql	-1385444591	postgres	2024-03-04 22:49:42.757359	7	t
186	175	FacilityDates	SQL	0150/V175__FacilityDates.sql	-1459075891	postgres	2024-03-04 22:49:42.815238	6	t
187	176	Reports	SQL	0150/V176__Reports.sql	1653352554	postgres	2024-03-04 22:49:42.831263	172	t
188	177	Files	SQL	0150/V177__Files.sql	1050676096	postgres	2024-03-04 22:49:43.013436	7	t
189	178	ReportFiles	SQL	0150/V178__ReportFiles.sql	-940309893	postgres	2024-03-04 22:49:43.028768	35	t
190	179	InternalTags	SQL	0150/V179__InternalTags.sql	1705975617	postgres	2024-03-04 22:49:43.072399	96	t
191	180	SubzonesAndMonitoringPlots	SQL	0150/V180__SubzonesAndMonitoringPlots.sql	-1957162460	postgres	2024-03-04 22:49:43.184814	76	t
192	181	ReportStatusConstraint	SQL	0150/V181__ReportStatusConstraint.sql	2110847551	postgres	2024-03-04 22:49:43.271364	12	t
193	182	Wgs84Geometry	SQL	0150/V182__Wgs84Geometry.sql	1037582015	postgres	2024-03-04 22:49:43.291416	19	t
194	183	MonitoringPlotBoundary	SQL	0150/V183__MonitoringPlotBoundary.sql	1495930303	postgres	2024-03-04 22:49:43.316439	167	t
195	184	MonitoringPlotPolygon	SQL	0150/V184__MonitoringPlotPolygon.sql	1805330573	postgres	2024-03-04 22:49:43.507273	16	t
196	185	MonitoringPlotPermanentCluster	SQL	0150/V185__MonitoringPlotPermanentCluster.sql	-1307275145	postgres	2024-03-04 22:49:43.532483	9	t
197	186	PlantingZonePlots	SQL	0150/V186__PlantingZonePlots.sql	945181213	postgres	2024-03-04 22:49:43.548637	4	t
198	187	PlantingSiteDates	SQL	0150/V187__PlantingSiteDates.sql	-1681382150	postgres	2024-03-04 22:49:43.561131	10	t
199	188	PlantingSiteAreas	SQL	0150/V188__PlantingSiteAreas.sql	-1584118440	postgres	2024-03-04 22:49:43.581855	32	t
200	189	Observations	SQL	0150/V189__Observations.sql	595481355	postgres	2024-03-04 22:49:43.622533	516	t
201	190	DefaultVarianceAndError	SQL	0150/V190__DefaultVarianceAndError.sql	1972227032	postgres	2024-03-04 22:49:44.150038	26	t
202	191	ObservationState	SQL	0150/V191__ObservationState.sql	1079299299	postgres	2024-03-04 22:49:44.184803	74	t
203	192	PlantingZoneDensity	SQL	0150/V192__PlantingZoneDensity.sql	-2140510337	postgres	2024-03-04 22:49:44.269501	8	t
204	193	ObservedSpeciesTotals	SQL	0150/V193__ObservedSpeciesTotals.sql	-1007174154	postgres	2024-03-04 22:49:44.289132	211	t
205	194	FinishedPlanting	SQL	0150/V194__FinishedPlanting.sql	754887094	postgres	2024-03-04 22:49:44.5118	3	t
206	195	UnknownSpeciesTotals	SQL	0150/V195__UnknownSpeciesTotals.sql	1596665190	postgres	2024-03-04 22:49:44.52197	368	t
207	196	DropTotalObservedPlants	SQL	0150/V196__DropTotalObservedPlants.sql	1537654667	postgres	2024-03-04 22:49:44.993208	7	t
208	197	SubzoneFinishedTime	SQL	0150/V197__SubzoneFinishedTime.sql	-1459599549	postgres	2024-03-04 22:49:45.011124	7	t
209	199	Populations	SQL	0150/V199__Populations.sql	-385569924	postgres	2024-03-04 22:49:45.026613	83	t
210	200	BackfillPopulations	SQL	0200/V200__BackfillPopulations.sql	1775148370	postgres	2024-03-04 22:49:45.118878	30	t
211	201	PlantingCompletedTime	SQL	0200/V201__PlantingCompletedTime.sql	985549422	postgres	2024-03-04 22:49:45.156303	2	t
212	202	ObservationNotifications	SQL	0200/V202__ObservationNotifications.sql	918204601	postgres	2024-03-04 22:49:45.167378	2	t
213	203	ObservationCumulativeDead	SQL	0200/V203__ObservationCumulativeDead.sql	-1273403474	postgres	2024-03-04 22:49:45.177882	15	t
214	204	ConservationCategory	SQL	0200/V204__ConservationCategory.sql	1491259132	postgres	2024-03-04 22:49:45.200341	50	t
215	205	BackfillConservationCategory	SQL	0200/V205__BackfillConservationCategory.sql	-147518582	postgres	2024-03-04 22:49:45.258747	4	t
216	206	DropEndangered	SQL	0200/V206__DropEndangered.sql	1594449609	postgres	2024-03-04 22:49:45.269448	2	t
217	207	UserCountry	SQL	0200/V207__UserCountry.sql	863810441	postgres	2024-03-04 22:49:45.280184	11	t
218	208	Projects	SQL	0200/V208__Projects.sql	2132532652	postgres	2024-03-04 22:49:45.298574	156	t
219	209	TerraformationContact	SQL	0200/V209__TerraformationContact.sql	-1274921487	postgres	2024-03-04 22:49:45.46382	15	t
220	210	ScheduleObservationNotifications	SQL	0200/V210__ScheduleObservationNotifications.sql	-813804586	postgres	2024-03-04 22:49:45.486587	3	t
221	211	ObservationNotScheduledNotifications	SQL	0200/V211__ObservationNotScheduledNotifications.sql	-455594768	postgres	2024-03-04 22:49:45.4974	7	t
222	212	MonitoringPlotAvailable	SQL	0200/V212__MonitoringPlotAvailable.sql	282120586	postgres	2024-03-04 22:49:45.513652	3	t
223	213	FacilityNumber	SQL	0200/V213__FacilityNumber.sql	1103573464	postgres	2024-03-04 22:49:45.525021	36	t
224	214	SubLocations	SQL	0200/V214__SubLocations.sql	-2093746125	postgres	2024-03-04 22:49:45.569228	6	t
225	215	ObservedPlotCoordinates	SQL	0200/V215__ObservedPlotCoordinates.sql	-1041839280	postgres	2024-03-04 22:49:45.583427	72	t
226	216	FacilityNumberInIdentifiers	SQL	0200/V216__FacilityNumberInIdentifiers.sql	-1530268773	postgres	2024-03-04 22:49:45.66668	24	t
227	217	BatchSubLocations	SQL	0200/V217__BatchSubLocations.sql	40389429	postgres	2024-03-04 22:49:45.701538	103	t
228	218	SeedTreatments	SQL	0200/V218__SeedTreatments.sql	497376700	postgres	2024-03-04 22:49:45.817006	5	t
229	219	BatchesAttributes	SQL	0200/V219__BatchesAttributes.sql	840604186	postgres	2024-03-04 22:49:45.832177	98	t
230	220	InitialBatchId	SQL	0200/V220__InitialBatchId.sql	1466064176	postgres	2024-03-04 22:49:45.945169	35	t
231	221	BatchDetailsHistory	SQL	0200/V221__BatchDetailsHistory.sql	-649795445	postgres	2024-03-04 22:49:45.991575	299	t
232	222	FacilityInventoryTotals	SQL	0200/V222__FacilityInventoryTotals.sql	1607760113	postgres	2024-03-04 22:49:46.306308	20	t
233	223	BatchPhotos	SQL	0200/V223__BatchPhotos.sql	-229207314	postgres	2024-03-04 22:49:46.338387	105	t
234	224	BatchRateTotals	SQL	0200/V224__BatchRateTotals.sql	-2034501861	postgres	2024-03-04 22:49:46.468167	9	t
235	225	PlantingSiteNotifications	SQL	0200/V225__PlantingSiteNotifications.sql	1765909900	postgres	2024-03-04 22:49:46.491351	118	t
236	226	OrganizationTypes	SQL	0200/V226__OrganizationTypes.sql	87531126	postgres	2024-03-04 22:49:46.627099	183	t
237	227	PlantingSeasons	SQL	0200/V227__PlantingSeasons.sql	-72514797	postgres	2024-03-04 22:49:46.834876	113	t
238	228	DropPlantingSeasonMonths	SQL	0200/V228__DropPlantingSeasonMonths.sql	-1082616742	postgres	2024-03-04 22:49:46.966546	7	t
239	229	AccessionRemainingQuantityNotes	SQL	0200/V229__AccessionRemainingQuantityNotes.sql	972797729	postgres	2024-03-04 22:49:46.985211	5	t
240	230	ReportSettings	SQL	0200/V230__ReportSettings.sql	-2089235104	postgres	2024-03-04 22:49:47.002165	67	t
241	231	ReportProjects	SQL	0200/V231__ReportProjects.sql	107620146	postgres	2024-03-04 22:49:47.087842	67	t
242	232	GlobalRoles	SQL	0200/V232__GlobalRoles.sql	1694826585	postgres	2024-03-04 22:49:47.179837	118	t
243	233	DropSuperAdminType	SQL	0200/V233__DropSuperAdminType.sql	-2033074591	postgres	2024-03-04 22:49:47.319334	36	t
244	234	NurserySpeciesProjects	SQL	0200/V234__NurserySpeciesProjects.sql	414474146	postgres	2024-03-04 22:49:47.365961	13	t
245	235	Participants	SQL	0200/V235__Participants.sql	1735301922	postgres	2024-03-04 22:49:47.397226	168	t
246	236	PlantingSiteExclusion	SQL	0200/V236__PlantingSiteExclusion.sql	-877320823	postgres	2024-03-04 22:49:47.586033	18	t
247	237	PlantingZoneClusterCount	SQL	0200/V237__PlantingZoneClusterCount.sql	909487789	postgres	2024-03-04 22:49:47.621345	4	t
248	238	PlantingSiteGridOrigin	SQL	0200/V238__PlantingSiteGridOrigin.sql	-982661371	postgres	2024-03-04 22:49:47.635072	34	t
249	239	SeedbankWithdrawalsBatchId	SQL	0200/V239__SeedbankWithdrawalsBatchId.sql	1404410841	postgres	2024-03-04 22:49:47.68205	9	t
250	240	BackfillSeedbankWithdrawalsBatchId	SQL	0200/V240__BackfillSeedbankWithdrawalsBatchId.sql	859769854	postgres	2024-03-04 22:49:47.707243	48	t
251	241	WithdrawalsBatchIdIndex	SQL	0200/V241__WithdrawalsBatchIdIndex.sql	-1740150254	postgres	2024-03-04 22:49:47.771273	38	t
252	242	PlantingSiteDrafts	SQL	0200/V242__PlantingSiteDrafts.sql	1145039505	postgres	2024-03-04 22:49:47.82882	166	t
253	243	Cohorts	SQL	0200/V243__Cohorts.sql	-517551038	postgres	2024-03-04 22:49:48.009066	242	t
254	244	BackfillSeedbankWithdrawalsBatchId	SQL	0200/V244__BackfillSeedbankWithdrawalsBatchId.sql	859769854	postgres	2024-03-04 22:49:48.266072	20	t
255	245	AcceleratorSchema	SQL	0200/V245__AcceleratorSchema.sql	1476926350	postgres	2024-03-04 22:49:48.301071	24	t
256	246	ModulesDeliverables	SQL	0200/V246__ModulesDeliverables.sql	-1528776609	postgres	2024-03-04 22:49:48.340398	858	t
257	247	DeliverableTweaks	SQL	0200/V247__DeliverableTweaks.sql	1209654370	postgres	2024-03-04 22:49:49.220624	23	t
258	\N	Comments	SQL	R__Comments.sql	109299174	postgres	2024-03-04 22:49:49.261422	272	t
259	\N	Indexes	SQL	R__Indexes.sql	-1152892924	postgres	2024-03-04 22:49:49.561184	47	t
260	\N	TypeCodes	SQL	R__TypeCodes.sql	-280885638	postgres	2024-03-04 22:49:49.619916	472	t
\.


--
-- Data for Name: gbif_distributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gbif_distributions (taxon_id, country_code, establishment_means, occurrence_status, threat_status) FROM stdin;
\.


--
-- Data for Name: gbif_name_words; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gbif_name_words (gbif_name_id, word) FROM stdin;
\.


--
-- Data for Name: gbif_names; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gbif_names (id, taxon_id, name, language, is_scientific) FROM stdin;
\.


--
-- Data for Name: gbif_taxa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gbif_taxa (taxon_id, dataset_id, parent_name_usage_id, accepted_name_usage_id, original_name_usage_id, scientific_name, canonical_name, generic_name, specific_epithet, infraspecific_epithet, taxon_rank, taxonomic_status, nomenclatural_status, phylum, class, "order", family, genus) FROM stdin;
\.


--
-- Data for Name: gbif_vernacular_names; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gbif_vernacular_names (taxon_id, vernacular_name, language, country_code) FROM stdin;
\.


--
-- Data for Name: global_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.global_roles (id, name) FROM stdin;
1	Super-Admin
2	Accelerator Admin
3	TF Expert
4	Read Only
\.


--
-- Data for Name: growth_forms; Type: TABLE DATA; Schema: public; Owner: postgres
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
\.


--
-- Data for Name: identifier_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.identifier_sequences (organization_id, prefix, next_value) FROM stdin;
1	24-1-	1
1	24-2-	1
\.


--
-- Data for Name: internal_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internal_tags (id, name, description, is_system, created_by, created_time, modified_by, modified_time) FROM stdin;
1	Reporter	Organization must submit reports to Terraformation.	t	2	2024-03-04 22:49:49.624789+00	2	2024-03-04 22:49:49.624789+00
2	Internal	Terraformation-managed internal organization, not a customer.	t	2	2024-03-04 22:49:49.624789+00	2	2024-03-04 22:49:49.624789+00
3	Testing	Used for internal testing; may contain invalid data.	t	2	2024-03-04 22:49:49.624789+00	2	2024-03-04 22:49:49.624789+00
4	Accelerator	Organization is an accelerator participant.	t	2	2024-03-04 22:49:49.624789+00	2	2024-03-04 22:49:49.624789+00
\.


--
-- Data for Name: jobrunr_backgroundjobservers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobrunr_backgroundjobservers (id, workerpoolsize, pollintervalinseconds, firstheartbeat, lastheartbeat, running, systemtotalmemory, systemfreememory, systemcpuload, processmaxmemory, processfreememory, processallocatedmemory, processcpuload, deletesucceededjobsafter, permanentlydeletejobsafter, name) FROM stdin;
83c134ac-ab4d-47bf-b4af-fc5b79061d9f	40	15	2024-03-04 22:49:52.938918	2024-03-04 22:54:53.735886	1	16763719680	13458489344	0.02	4192206848	4043597648	148609200	0.02	PT36H	PT72H	c23396861d3c
\.


--
-- Data for Name: jobrunr_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobrunr_jobs (id, version, jobasjson, jobsignature, state, createdat, updatedat, scheduledat, recurringjobid) FROM stdin;
b4572dd3-0166-4d57-b722-78456cf23199	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"b4572dd3-0166-4d57-b722-78456cf23199","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-04T22:49:53.953621668Z","scheduledAt":"2024-03-04T22:50:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-04T22:49:54.132444251Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-04T22:49:54.167496918Z","serverId":"83c134ac-ab4d-47bf-b4af-fc5b79061d9f","serverName":"c23396861d3c","updatedAt":"2024-03-04T22:49:54.167496918Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-04T22:49:54.243833793Z","latencyDuration":0.035052667,"processDuration":0.076198875}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-03-04 22:49:53.953622	2024-03-04 22:49:54.243834	\N	FacilityService.scanForIdleFacilities
4867fc7d-9ffa-48f3-810e-d52dcb1dc404	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"4867fc7d-9ffa-48f3-810e-d52dcb1dc404","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-04T22:50:54.247064251Z","scheduledAt":"2024-03-04T22:51:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-04T22:50:54.271770293Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-04T22:50:54.286576043Z","serverId":"83c134ac-ab4d-47bf-b4af-fc5b79061d9f","serverName":"c23396861d3c","updatedAt":"2024-03-04T22:50:54.286576043Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-04T22:50:54.298588918Z","latencyDuration":0.014805750,"processDuration":0.012011375}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-03-04 22:50:54.247064	2024-03-04 22:50:54.298589	\N	FacilityService.scanForIdleFacilities
9d3d6dd4-807b-4443-a796-9ec2f262e4f3	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"9d3d6dd4-807b-4443-a796-9ec2f262e4f3","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-04T22:51:54.402897834Z","scheduledAt":"2024-03-04T22:52:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-04T22:51:54.449964501Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-04T22:51:54.498001043Z","serverId":"83c134ac-ab4d-47bf-b4af-fc5b79061d9f","serverName":"c23396861d3c","updatedAt":"2024-03-04T22:51:54.498001043Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-04T22:51:54.509110418Z","latencyDuration":0.048036542,"processDuration":0.011108292}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-03-04 22:51:54.402898	2024-03-04 22:51:54.50911	\N	FacilityService.scanForIdleFacilities
ae081433-13d8-4e13-abd9-dd97314b3836	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"ae081433-13d8-4e13-abd9-dd97314b3836","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-04T22:52:54.647901418Z","scheduledAt":"2024-03-04T22:53:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-04T22:52:54.685474251Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-04T22:52:54.703424626Z","serverId":"83c134ac-ab4d-47bf-b4af-fc5b79061d9f","serverName":"c23396861d3c","updatedAt":"2024-03-04T22:52:54.703424626Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-04T22:52:54.715635501Z","latencyDuration":0.017950375,"processDuration":0.012209459}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-03-04 22:52:54.647901	2024-03-04 22:52:54.715636	\N	FacilityService.scanForIdleFacilities
e0cfe45f-a4f3-4652-9acf-c96c27d1aa07	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"e0cfe45f-a4f3-4652-9acf-c96c27d1aa07","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-04T22:53:54.772300710Z","scheduledAt":"2024-03-04T22:54:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-04T22:53:54.805670335Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-04T22:53:54.822589251Z","serverId":"83c134ac-ab4d-47bf-b4af-fc5b79061d9f","serverName":"c23396861d3c","updatedAt":"2024-03-04T22:53:54.822589251Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-04T22:53:54.838521710Z","latencyDuration":0.016918916,"processDuration":0.015931209}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-03-04 22:53:54.772301	2024-03-04 22:53:54.838522	\N	FacilityService.scanForIdleFacilities
31fea93a-3d41-4a90-ab09-0283fbc9e8cf	4	{"version":4,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"31fea93a-3d41-4a90-ab09-0283fbc9e8cf","jobHistory":[{"@class":"org.jobrunr.jobs.states.ScheduledState","state":"SCHEDULED","createdAt":"2024-03-04T22:54:54.956360376Z","scheduledAt":"2024-03-04T22:55:00Z","recurringJobId":"FacilityService.scanForIdleFacilities","reason":"Scheduled by recurring job 'FacilityService.scanForIdleFacilities'"},{"@class":"org.jobrunr.jobs.states.EnqueuedState","state":"ENQUEUED","createdAt":"2024-03-04T22:54:54.996401835Z"},{"@class":"org.jobrunr.jobs.states.ProcessingState","state":"PROCESSING","createdAt":"2024-03-04T22:54:55.011451418Z","serverId":"83c134ac-ab4d-47bf-b4af-fc5b79061d9f","serverName":"c23396861d3c","updatedAt":"2024-03-04T22:54:55.011451418Z"},{"@class":"org.jobrunr.jobs.states.SucceededState","state":"SUCCEEDED","createdAt":"2024-03-04T22:54:55.021341501Z","latencyDuration":0.015049583,"processDuration":0.009889000}],"metadata":{"@class":"java.util.concurrent.ConcurrentHashMap","jobRunrDashboardLog-3":{"@class":"org.jobrunr.jobs.context.JobDashboardLogger$JobDashboardLogLines","logLines":[]}},"recurringJobId":"FacilityService.scanForIdleFacilities"}	com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()	SUCCEEDED	2024-03-04 22:54:54.95636	2024-03-04 22:54:55.021342	\N	FacilityService.scanForIdleFacilities
\.


--
-- Data for Name: jobrunr_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobrunr_metadata (id, name, owner, value, createdat, updatedat) FROM stdin;
id-cluster	id	cluster	a5a5c380-f0e4-4fb7-aff6-b011271a31e4	2024-03-04 22:49:53.10196	2024-03-04 22:49:53.103945
database_version-cluster	database_version	cluster	6.0.0	2024-03-04 22:49:53.162059	2024-03-04 22:49:53.172956
\.


--
-- Data for Name: jobrunr_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
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
931bbc7f-9e98-4923-8a24-f81848b3a770	v015__alter_table_backgroundjobserver_add_name.sql	2024-03-04T22:49:52.739069834
\.


--
-- Data for Name: jobrunr_recurring_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobrunr_recurring_jobs (id, version, jobasjson, createdat) FROM stdin;
FacilityService.scanForIdleFacilities                                                                                           	1	{"version":0,"jobSignature":"com.terraformation.backend.customer.FacilityService.scanForIdleFacilities()","jobName":"FacilityService.scanForIdleFacilities","amountOfRetries":0,"labels":[],"jobDetails":{"className":"com.terraformation.backend.customer.FacilityService","staticFieldName":null,"methodName":"scanForIdleFacilities","jobParameters":[],"cacheable":true},"id":"FacilityService.scanForIdleFacilities","scheduleExpression":"* * * * *","zoneId":"UTC","createdAt":"2024-03-04T22:49:52.756532584Z"}	1709592592756
DailyTaskRunner                                                                                                                 	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.DailyTaskRunner.runDailyTasks()","jobName":"com.terraformation.backend.daily.DailyTaskRunner.runDailyTasks()","amountOfRetries":null,"labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.DailyTaskRunner","staticFieldName":null,"methodName":"runDailyTasks","jobParameters":[],"cacheable":true},"id":"DailyTaskRunner","scheduleExpression":"1 0 * * *","zoneId":"Z","createdAt":"2024-03-04T22:49:52.855529875Z"}	1709592592855
NotificationScanner                                                                                                             	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","jobName":"com.terraformation.backend.daily.NotificationScanner.sendNotifications()","amountOfRetries":null,"labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.NotificationScanner","staticFieldName":null,"methodName":"sendNotifications","jobParameters":[],"cacheable":true},"id":"NotificationScanner","scheduleExpression":"*/15 * * * *","zoneId":"UTC","createdAt":"2024-03-04T22:49:52.997243584Z"}	1709592592997
ObservationScheduler                                                                                                            	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","jobName":"com.terraformation.backend.daily.ObservationScheduler.transitionObservations()","amountOfRetries":null,"labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.ObservationScheduler","staticFieldName":null,"methodName":"transitionObservations","jobParameters":[],"cacheable":true},"id":"ObservationScheduler","scheduleExpression":"*/15 * * * *","zoneId":"UTC","createdAt":"2024-03-04T22:49:53.016062584Z"}	1709592593016
PlantingSeasonScheduler                                                                                                         	1	{"version":0,"jobSignature":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","jobName":"com.terraformation.backend.daily.PlantingSeasonScheduler.transitionPlantingSeasons()","amountOfRetries":null,"labels":[],"jobDetails":{"className":"com.terraformation.backend.daily.PlantingSeasonScheduler","staticFieldName":null,"methodName":"transitionPlantingSeasons","jobParameters":[],"cacheable":true},"id":"PlantingSeasonScheduler","scheduleExpression":"*/15 * * * *","zoneId":"UTC","createdAt":"2024-03-04T22:49:53.024984500Z"}	1709592593024
\.


--
-- Data for Name: managed_location_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.managed_location_types (id, name) FROM stdin;
1	SeedBank
2	Nursery
3	PlantingSite
\.


--
-- Data for Name: notification_criticalities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_criticalities (id, name) FROM stdin;
1	Info
2	Warning
3	Error
4	Success
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: public; Owner: postgres
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
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, notification_type_id, user_id, organization_id, title, body, local_url, created_time, is_read) FROM stdin;
\.


--
-- Data for Name: organization_internal_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_internal_tags (organization_id, internal_tag_id, created_by, created_time) FROM stdin;
\.


--
-- Data for Name: organization_managed_location_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_managed_location_types (organization_id, managed_location_type_id) FROM stdin;
2	2
2	3
\.


--
-- Data for Name: organization_report_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_report_settings (organization_id, is_enabled) FROM stdin;
\.


--
-- Data for Name: organization_types; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: organization_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_users (user_id, organization_id, role_id, created_time, modified_time, created_by, modified_by) FROM stdin;
1	1	4	2021-12-15 17:59:59.072725+00	2021-12-15 17:59:59.072725+00	1	1
1	2	4	2024-03-04 22:50:42.163931+00	2024-03-04 22:50:42.163962+00	1	1
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, created_time, modified_time, disabled_time, country_code, country_subdivision_code, description, created_by, modified_by, time_zone, organization_type_id, organization_type_details, website) FROM stdin;
1	Terraformation (staging)	2021-12-15 17:59:59.072094+00	2024-03-04 22:50:33.614026+00	\N	\N	\N	\N	1	1	Etc/UTC	\N	\N	\N
2	My New Org-1709592640525	2024-03-04 22:50:42.134674+00	2024-03-04 22:50:43.401478+00	\N	US	US-WA	This is my old organization	1	1	America/Los_Angeles	2	\N	fakeuniversity.edu
\.


--
-- Data for Name: project_report_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_report_settings (project_id, is_enabled) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, created_by, created_time, modified_by, modified_time, organization_id, name, description, participant_id) FROM stdin;
\.


--
-- Data for Name: report_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_files (file_id, report_id) FROM stdin;
\.


--
-- Data for Name: report_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_photos (report_id, file_id, caption) FROM stdin;
\.


--
-- Data for Name: report_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_statuses (id, name) FROM stdin;
1	New
2	In Progress
3	Locked
4	Submitted
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, organization_id, year, quarter, locked_by, locked_time, modified_by, modified_time, submitted_by, submitted_time, status_id, body, project_id, project_name) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	Contributor
2	Manager
3	Admin
4	Owner
5	Terraformation Contact
\.


--
-- Data for Name: seed_storage_behaviors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seed_storage_behaviors (id, name) FROM stdin;
1	Orthodox
2	Recalcitrant
3	Intermediate
4	Unknown
5	Likely Orthodox
6	Likely Recalcitrant
7	Likely Intermediate
\.


--
-- Data for Name: seed_treatments; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.species (id, organization_id, scientific_name, common_name, family_name, rare, growth_form_id, seed_storage_behavior_id, created_by, created_time, modified_by, modified_time, deleted_by, deleted_time, checked_time, initial_scientific_name, conservation_category_id) FROM stdin;
1	1	Kousa Dogwood	Kousa Dogwood	\N	\N	\N	\N	1	2021-12-15 17:59:59.135505+00	1	2021-12-15 17:59:59.135505+00	\N	\N	\N	Kousa Dogwood	\N
2	1	Other Dogwood	Other Dogwood	\N	\N	\N	\N	1	2021-12-15 17:59:59.135505+00	1	2021-12-15 17:59:59.135505+00	\N	\N	\N	Other Dogwood	\N
3	1	Banana	\N	\N	\N	\N	\N	1	2024-03-04 22:49:57.381003+00	1	2024-03-04 22:49:57.381014+00	\N	\N	2024-03-04 22:49:57.527855+00	Banana	\N
4	1	Coconut	\N	\N	\N	\N	\N	1	2024-03-04 22:49:57.592461+00	1	2024-03-04 22:49:57.592467+00	\N	\N	2024-03-04 22:49:57.618213+00	Coconut	\N
5	1	Acacia koa-1709592647062	Koa	\N	\N	1	1	1	2024-03-04 22:50:49.071515+00	1	2024-03-04 22:50:49.07153+00	1	2024-03-04 22:50:51.041633+00	2024-03-04 22:50:49.134148+00	Acacia koa-1709592647062	\N
\.


--
-- Data for Name: species_ecosystem_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.species_ecosystem_types (species_id, ecosystem_type_id) FROM stdin;
5	11
\.


--
-- Data for Name: species_problem_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.species_problem_fields (id, name) FROM stdin;
1	Scientific Name
\.


--
-- Data for Name: species_problem_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.species_problem_types (id, name) FROM stdin;
1	Name Misspelled
2	Name Not Found
3	Name Is Synonym
\.


--
-- Data for Name: species_problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.species_problems (id, species_id, field_id, type_id, created_time, suggested_value) FROM stdin;
1	3	1	2	2024-03-04 22:49:57.495518+00	\N
2	4	1	2	2024-03-04 22:49:57.608856+00	\N
3	5	1	2	2024-03-04 22:50:49.122561+00	\N
\.


--
-- Data for Name: spring_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spring_session (primary_id, session_id, creation_time, last_access_time, max_inactive_interval, expiry_time, principal_name) FROM stdin;
b84131c0-7bee-4363-827e-291becc06698	276714ad-ab0a-48aa-8ef8-db65ec2e950a	1632267607787	1709592907913	315360000	2024952907913	0d04525c-7933-4cec-9647-7b6ac2642838
\.


--
-- Data for Name: spring_session_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spring_session_attributes (session_primary_id, attribute_name, attribute_bytes) FROM stdin;
b84131c0-7bee-4363-827e-291becc06698	SPRING_SECURITY_CONTEXT	\\xaced00057372003d6f72672e737072696e676672616d65776f726b2e73656375726974792e636f72652e636f6e746578742e5365637572697479436f6e74657874496d706c000000000000026c0200014c000e61757468656e7469636174696f6e7400324c6f72672f737072696e676672616d65776f726b2f73656375726974792f636f72652f41757468656e7469636174696f6e3b7870737200466f72672e737072696e676672616d65776f726b2e73656375726974792e61757468656e7469636174696f6e2e54657374696e6741757468656e7469636174696f6e546f6b656e00000000000000010200024c000b63726564656e7469616c737400124c6a6176612f6c616e672f4f626a6563743b4c00097072696e636970616c71007e0004787200476f72672e737072696e676672616d65776f726b2e73656375726974792e61757468656e7469636174696f6e2e416273747261637441757468656e7469636174696f6e546f6b656ed3aa287e6e47640e0200035a000d61757468656e746963617465644c000b617574686f7269746965737400164c6a6176612f7574696c2f436f6c6c656374696f6e3b4c000764657461696c7371007e00047870017372001f6a6176612e7574696c2e436f6c6c656374696f6e7324456d7074794c6973747ab817b43ca79ede020000787070740004746573747372002f636f6d2e7465727261666f726d6174696f6e2e6261636b656e642e617574682e53696d706c655072696e636970616ca43481deb93569620200014c00046e616d657400124c6a6176612f6c616e672f537472696e673b787074002430643034353235632d373933332d346365632d393634372d376236616332363432383338
\.


--
-- Data for Name: sub_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_locations (id, facility_id, name, created_time, modified_time, created_by, modified_by) FROM stdin;
1000	100	Refrigerator 1	2022-10-25 17:51:42.255377+00	2022-10-25 17:51:42.255377+00	1	1
1001	100	Freezer 1	2022-10-25 17:51:42.255377+00	2022-10-25 17:51:42.255377+00	1	1
1002	100	Freezer 2	2022-10-25 17:51:42.255377+00	2022-10-25 17:51:42.255377+00	1	1
1003	103	Garage Freezer	2024-03-04 22:50:33.782387+00	2024-03-04 22:50:33.782399+00	1	1
1004	103	Freezer 2	2024-03-04 22:50:33.80118+00	2024-03-04 22:50:33.801195+00	1	1
1005	103	Refrigerator 1	2024-03-04 22:50:33.806839+00	2024-03-04 22:50:33.80685+00	1	1
1006	103	Garage Fridge	2024-03-04 22:50:33.810595+00	2024-03-04 22:50:33.810603+00	1	1
1007	103	Freezer 3	2024-03-04 22:50:33.813811+00	2024-03-04 22:50:33.813818+00	1	1
1008	104	Garage	2024-03-04 22:50:38.03394+00	2024-03-04 22:50:38.033957+00	1	1
1009	104	Shed	2024-03-04 22:50:38.044107+00	2024-03-04 22:50:38.04412+00	1	1
1010	104	Third shelf to the left	2024-03-04 22:50:38.048141+00	2024-03-04 22:50:38.048149+00	1	1
\.


--
-- Data for Name: test_clock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_clock (fake_time, real_time) FROM stdin;
2021-12-15 17:59:42.568389+00	2021-12-15 17:59:42.568389+00
\.


--
-- Data for Name: thumbnails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thumbnails (id, file_id, width, height, content_type, created_time, size, storage_url) FROM stdin;
\.


--
-- Data for Name: time_zones; Type: TABLE DATA; Schema: public; Owner: postgres
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
\.


--
-- Data for Name: timeseries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timeseries (id, type_id, device_id, name, units, decimal_places, created_time, modified_time, created_by, modified_by) FROM stdin;
\.


--
-- Data for Name: timeseries_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timeseries_types (id, name) FROM stdin;
1	Numeric
2	Text
\.


--
-- Data for Name: timeseries_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timeseries_values (timeseries_id, created_time, value) FROM stdin;
\.


--
-- Data for Name: upload_problem_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload_problem_types (id, name) FROM stdin;
1	Unrecognized Value
2	Missing Required Value
3	Duplicate Value
4	Malformed Value
\.


--
-- Data for Name: upload_problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload_problems (id, upload_id, type_id, is_error, "position", field, message, value) FROM stdin;
\.


--
-- Data for Name: upload_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: upload_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload_types (id, name, expire_files) FROM stdin;
1	Species CSV	t
2	Accession CSV	t
3	Seedling Batch CSV	t
\.


--
-- Data for Name: uploads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uploads (id, created_by, created_time, filename, storage_url, content_type, type_id, status_id, organization_id, facility_id, locale) FROM stdin;
\.


--
-- Data for Name: user_global_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_global_roles (user_id, global_role_id) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preferences (user_id, organization_id, preferences) FROM stdin;
1	2	{"timeZoneAcknowledgedOnMs": 1709592643417}
1	\N	{"lastVisitedOrg": 1, "inventoryListType": "batches_by_batch", "preferredWeightSystem": "metric"}
\.


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_types (id, name) FROM stdin;
1	Individual
3	Device Manager
4	System
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, auth_id, email, first_name, last_name, created_time, modified_time, user_type_id, last_activity_time, email_notifications_enabled, deleted_time, time_zone, locale, country_code) FROM stdin;
2	DISABLED	system	Terraware	System	2022-10-25 17:51:42.24661+00	2022-10-25 17:51:42.24661+00	4	\N	f	\N	\N	\N	\N
1	0d04525c-7933-4cec-9647-7b6ac2642838	nobody@terraformation.com	Test	User	2021-12-15 17:59:59.069723+00	2021-12-15 17:59:59.069723+00	1	2024-03-04 22:55:07.92+00	f	\N	Etc/UTC	\N	\N
\.


--
-- Data for Name: accession_collectors; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.accession_collectors (accession_id, "position", name) FROM stdin;
1	0	Alex
\.


--
-- Data for Name: accession_photos; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.accession_photos (accession_id, file_id) FROM stdin;
1002	1001
1002	1002
\.


--
-- Data for Name: accession_quantity_history; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.accession_quantity_history (id, accession_id, history_type_id, created_by, created_time, remaining_quantity, remaining_units_id, notes) FROM stdin;
1	1	1	1	2024-03-04 22:50:59.971535+00	500	2	\N
2	1	2	1	2024-03-04 22:51:00.929072+00	495.00000	2	\N
3	1	2	1	2024-03-04 22:51:06.161057+00	195.00000	2	\N
4	1	2	1	2024-03-04 22:51:11.333381+00	95.00000	2	\N
5	1	2	1	2024-03-04 22:51:15.140892+00	75.00000	2	\N
\.


--
-- Data for Name: accession_quantity_history_types; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.accession_quantity_history_types (id, name) FROM stdin;
1	Observed
2	Computed
\.


--
-- Data for Name: accession_state_history; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.accession_state_history (accession_id, updated_time, old_state_id, new_state_id, reason, updated_by) FROM stdin;
1000	2022-10-25 17:51:45.051912+00	30	40	Accession has been edited	2
1002	2022-10-25 17:51:45.114536+00	30	40	Accession has been edited	2
1	2024-03-04 22:50:55.711851+00	\N	5	Accession created	1
1	2024-03-04 22:50:56.653291+00	5	15	Accession has been checked in	1
1	2024-03-04 22:50:57.043508+00	15	20	Accession has been edited	1
1	2024-03-04 22:50:58.206109+00	20	40	Accession has been edited	1
\.


--
-- Data for Name: accession_states; Type: TABLE DATA; Schema: seedbank; Owner: postgres
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
-- Data for Name: accessions; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.accessions (id, facility_id, number, collected_date, received_date, state_id, founder_id, trees_collected_from, subset_weight, subset_count, est_seed_count, drying_end_date, processing_notes, sub_location_id, created_time, collection_site_name, collection_site_landowner, total_viability_percent, remaining_grams, remaining_quantity, remaining_units_id, subset_weight_grams, subset_weight_quantity, subset_weight_units_id, modified_time, created_by, modified_by, species_id, collection_site_city, collection_site_country_code, collection_site_country_subdivision, collection_site_notes, collection_source_id, data_source_id, latest_observed_quantity, latest_observed_units_id, latest_observed_time, est_weight_grams, est_weight_quantity, est_weight_units_id, total_withdrawn_count, total_withdrawn_weight_grams, total_withdrawn_weight_quantity, total_withdrawn_weight_units_id, project_id) FROM stdin;
1000	100	XYZ	\N	\N	40	\N	1	\N	\N	\N	\N	\N	\N	2021-01-03 15:31:20+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 17:51:45.063084+00	1	2	1	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1001	100	ABCDEFG	\N	\N	20	\N	2	\N	\N	\N	\N	\N	\N	2021-01-10 13:08:11+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 17:51:45.090985+00	1	2	2	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1002	100	AAF4D49R3E	\N	\N	40	\N	1	\N	\N	\N	\N	\N	\N	2021-01-03 15:31:20+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 17:51:45.115307+00	1	2	1	\N	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1	101	24-1-2-001	2023-12-31	2024-03-04	40	\N	\N	\N	10	75	2034-01-31	\N	\N	2024-03-04 22:50:55.689926+00	Alex's Mansion	Ashtyn	90	75	75.00000	2	10	10	2	2024-03-04 22:51:17.699796+00	1	1	4	\N	\N	\N	\N	\N	1	500	2	2024-03-04 22:50:59.969181+00	75	75.00000	2	425	425	425.00000	2	\N
\.


--
-- Data for Name: bags; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.bags (id, accession_id, bag_number) FROM stdin;
1001	1002	ABCD001237
1002	1002	ABCD001238
\.


--
-- Data for Name: collection_sources; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.collection_sources (id, name) FROM stdin;
1	Wild
2	Reintroduced
3	Cultivated
4	Other
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.data_sources (id, name) FROM stdin;
1	Web
2	Seed Collector App
3	File Import
\.


--
-- Data for Name: geolocations; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.geolocations (id, accession_id, created_time, latitude, longitude, gps_accuracy) FROM stdin;
1001	1002	2021-02-12 17:21:33.62729+00	9.0300000	-79.5300000	\N
1002	1	2024-03-04 22:50:55.734451+00	2.0000000	4.0000000	\N
\.


--
-- Data for Name: seed_quantity_units; Type: TABLE DATA; Schema: seedbank; Owner: postgres
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
-- Data for Name: viability_test_results; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.viability_test_results (id, test_id, recording_date, seeds_germinated) FROM stdin;
11	1	2024-03-04	3
12	2	2024-03-04	3
13	2	2024-03-04	15
\.


--
-- Data for Name: viability_test_seed_types; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.viability_test_seed_types (id, name) FROM stdin;
1	Fresh
2	Stored
\.


--
-- Data for Name: viability_test_substrates; Type: TABLE DATA; Schema: seedbank; Owner: postgres
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
-- Data for Name: viability_test_types; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.viability_test_types (id, name) FROM stdin;
1	Lab
2	Nursery
3	Cut
\.


--
-- Data for Name: viability_tests; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.viability_tests (id, accession_id, test_type, start_date, seed_type_id, substrate_id, treatment_id, seeds_sown, notes, staff_responsible, total_seeds_germinated, total_percent_germinated, end_date, seeds_compromised, seeds_empty, seeds_filled) FROM stdin;
1	1	1	2024-03-04	1	1	\N	5	\N	\N	3	60	2024-03-04	\N	\N	\N
2	1	2	2024-03-04	1	7	1	20	\N	\N	18	90	2024-03-04	\N	\N	\N
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.withdrawal_purposes (id, name) FROM stdin;
6	Other
7	Viability Testing
8	Out-planting
9	Nursery
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: seedbank; Owner: postgres
--

COPY seedbank.withdrawals (id, accession_id, date, purpose_id, destination, staff_responsible, created_time, updated_time, notes, viability_test_id, withdrawn_grams, withdrawn_quantity, withdrawn_units_id, estimated_count, estimated_weight_quantity, estimated_weight_units_id, created_by, withdrawn_by, batch_id) FROM stdin;
1	1	2024-03-04	7	\N	\N	2024-03-04 22:51:00.89288+00	2024-03-04 22:51:00.892943+00	\N	1	\N	5	1	5	5.00000	2	1	1	\N
2	1	2024-03-04	9	\N	\N	2024-03-04 22:51:06.145492+00	2024-03-04 22:51:06.145583+00	Adding some test notes here!	\N	\N	300	1	300	300.00000	2	1	1	1
3	1	2024-03-04	8	\N	\N	2024-03-04 22:51:11.31104+00	2024-03-04 22:51:11.311082+00	\N	\N	\N	100	1	100	100.00000	2	1	1	\N
4	1	2024-03-04	7	\N	\N	2024-03-04 22:51:15.136523+00	2024-03-04 22:51:15.136602+00	\N	2	\N	20	1	20	20.00000	2	1	1	\N
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.deliveries (id, withdrawal_id, planting_site_id, created_by, created_time, modified_by, modified_time, reassigned_by, reassigned_time) FROM stdin;
\.


--
-- Data for Name: draft_planting_sites; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.draft_planting_sites (id, organization_id, project_id, name, description, time_zone, num_planting_zones, num_planting_subzones, data, created_by, created_time, modified_by, modified_time) FROM stdin;
\.


--
-- Data for Name: monitoring_plots; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.monitoring_plots (id, planting_subzone_id, name, full_name, created_by, created_time, modified_by, modified_time, boundary, permanent_cluster, permanent_cluster_subplot, is_available) FROM stdin;
\.


--
-- Data for Name: observable_conditions; Type: TABLE DATA; Schema: tracking; Owner: postgres
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
-- Data for Name: observation_photos; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observation_photos (file_id, observation_id, monitoring_plot_id, position_id, gps_coordinates) FROM stdin;
\.


--
-- Data for Name: observation_plot_conditions; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observation_plot_conditions (observation_id, monitoring_plot_id, condition_id) FROM stdin;
\.


--
-- Data for Name: observation_plot_positions; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observation_plot_positions (id, name) FROM stdin;
1	SouthwestCorner
2	SoutheastCorner
3	NortheastCorner
4	NorthwestCorner
\.


--
-- Data for Name: observation_plots; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observation_plots (observation_id, monitoring_plot_id, claimed_by, claimed_time, completed_by, completed_time, created_by, created_time, is_permanent, modified_by, modified_time, observed_time, notes) FROM stdin;
\.


--
-- Data for Name: observation_states; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observation_states (id, name) FROM stdin;
1	Upcoming
2	InProgress
3	Completed
4	Overdue
\.


--
-- Data for Name: observations; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observations (id, planting_site_id, created_time, start_date, end_date, completed_time, state_id, upcoming_notification_sent_time) FROM stdin;
\.


--
-- Data for Name: observed_plot_coordinates; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observed_plot_coordinates (id, observation_id, monitoring_plot_id, position_id, gps_coordinates) FROM stdin;
\.


--
-- Data for Name: observed_plot_species_totals; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observed_plot_species_totals (observation_id, monitoring_plot_id, species_id, species_name, certainty_id, total_live, total_dead, total_existing, mortality_rate, cumulative_dead, permanent_live) FROM stdin;
\.


--
-- Data for Name: observed_site_species_totals; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observed_site_species_totals (observation_id, planting_site_id, species_id, species_name, certainty_id, total_live, total_dead, total_existing, mortality_rate, cumulative_dead, permanent_live) FROM stdin;
\.


--
-- Data for Name: observed_zone_species_totals; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.observed_zone_species_totals (observation_id, planting_zone_id, species_id, species_name, certainty_id, total_live, total_dead, total_existing, mortality_rate, cumulative_dead, permanent_live) FROM stdin;
\.


--
-- Data for Name: planting_seasons; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_seasons (id, planting_site_id, start_date, start_time, end_date, end_time, is_active) FROM stdin;
\.


--
-- Data for Name: planting_site_notifications; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_site_notifications (id, planting_site_id, notification_type_id, notification_number, sent_time) FROM stdin;
\.


--
-- Data for Name: planting_site_populations; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_site_populations (planting_site_id, species_id, total_plants, plants_since_last_observation) FROM stdin;
\.


--
-- Data for Name: planting_sites; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_sites (id, organization_id, name, description, boundary, created_by, created_time, modified_by, modified_time, time_zone, area_ha, project_id, exclusion, grid_origin) FROM stdin;
\.


--
-- Data for Name: planting_subzone_populations; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_subzone_populations (planting_subzone_id, species_id, total_plants, plants_since_last_observation) FROM stdin;
\.


--
-- Data for Name: planting_subzones; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_subzones (id, planting_zone_id, name, full_name, boundary, created_by, created_time, modified_by, modified_time, planting_site_id, area_ha, planting_completed_time) FROM stdin;
\.


--
-- Data for Name: planting_types; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_types (id, name) FROM stdin;
1	Delivery
2	Reassignment From
3	Reassignment To
\.


--
-- Data for Name: planting_zone_populations; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_zone_populations (planting_zone_id, species_id, total_plants, plants_since_last_observation) FROM stdin;
\.


--
-- Data for Name: planting_zones; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.planting_zones (id, planting_site_id, name, boundary, created_by, created_time, modified_by, modified_time, variance, students_t, error_margin, num_permanent_clusters, num_temporary_plots, area_ha, target_planting_density, extra_permanent_clusters) FROM stdin;
\.


--
-- Data for Name: plantings; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.plantings (id, delivery_id, planting_type_id, planting_site_id, planting_subzone_id, species_id, created_by, created_time, num_plants, notes) FROM stdin;
\.


--
-- Data for Name: recorded_plant_statuses; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.recorded_plant_statuses (id, name) FROM stdin;
1	Live
2	Dead
3	Existing
\.


--
-- Data for Name: recorded_plants; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.recorded_plants (id, observation_id, monitoring_plot_id, certainty_id, gps_coordinates, species_id, species_name, status_id) FROM stdin;
\.


--
-- Data for Name: recorded_species_certainties; Type: TABLE DATA; Schema: tracking; Owner: postgres
--

COPY tracking.recorded_species_certainties (id, name) FROM stdin;
1	Known
2	Other
3	Unknown
\.


--
-- Name: cohort_modules_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.cohort_modules_id_seq', 1, false);


--
-- Name: cohorts_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.cohorts_id_seq', 1, false);


--
-- Name: deliverables_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.deliverables_id_seq', 1, false);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.modules_id_seq', 1, false);


--
-- Name: participants_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.participants_id_seq', 1, false);


--
-- Name: submission_documents_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.submission_documents_id_seq', 1, false);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: accelerator; Owner: postgres
--

SELECT pg_catalog.setval('accelerator.submissions_id_seq', 1, false);


--
-- Name: batch_details_history_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: postgres
--

SELECT pg_catalog.setval('nursery.batch_details_history_id_seq', 1, true);


--
-- Name: batch_photos_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: postgres
--

SELECT pg_catalog.setval('nursery.batch_photos_id_seq', 1, false);


--
-- Name: batch_quantity_history_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: postgres
--

SELECT pg_catalog.setval('nursery.batch_quantity_history_id_seq', 1, true);


--
-- Name: batches_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: postgres
--

SELECT pg_catalog.setval('nursery.batches_id_seq', 1, true);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE SET; Schema: nursery; Owner: postgres
--

SELECT pg_catalog.setval('nursery.withdrawals_id_seq', 1, false);


--
-- Name: automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.automations_id_seq', 1, false);


--
-- Name: device_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_id_seq', 1, false);


--
-- Name: device_managers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_managers_id_seq', 1, false);


--
-- Name: device_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_templates_id_seq', 1, false);


--
-- Name: gbif_names_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gbif_names_id_seq', 1, false);


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.germination_treatment_id_seq', 1, false);


--
-- Name: internal_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.internal_tags_id_seq', 10000, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 2, true);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.photos_id_seq', 1003, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 1, false);


--
-- Name: site_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_module_id_seq', 104, true);


--
-- Name: species_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.species_id_seq1', 5, true);


--
-- Name: species_problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.species_problems_id_seq', 3, true);


--
-- Name: storage_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.storage_location_id_seq', 1010, true);


--
-- Name: thumbnail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thumbnail_id_seq', 1, false);


--
-- Name: timeseries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timeseries_id_seq', 1, false);


--
-- Name: upload_problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upload_problems_id_seq', 1, false);


--
-- Name: uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.uploads_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: accession_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.accession_id_seq', 1, true);


--
-- Name: accession_quantity_history_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.accession_quantity_history_id_seq', 5, true);


--
-- Name: bag_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.bag_id_seq', 1003, false);


--
-- Name: collection_event_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.collection_event_id_seq', 1002, true);


--
-- Name: germination_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.germination_id_seq', 13, true);


--
-- Name: germination_seed_type_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.germination_seed_type_id_seq', 1, false);


--
-- Name: germination_substrate_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.germination_substrate_id_seq', 1, false);


--
-- Name: germination_test_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.germination_test_id_seq', 2, true);


--
-- Name: withdrawal_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.withdrawal_id_seq', 4, true);


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: postgres
--

SELECT pg_catalog.setval('seedbank.withdrawal_purpose_id_seq', 1, false);


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: postgres
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: deliveries_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.deliveries_id_seq', 1, false);


--
-- Name: draft_planting_sites_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.draft_planting_sites_id_seq', 1, false);


--
-- Name: monitoring_plots_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.monitoring_plots_id_seq', 1, false);


--
-- Name: observations_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.observations_id_seq', 1, false);


--
-- Name: observed_plot_coordinates_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.observed_plot_coordinates_id_seq', 1, false);


--
-- Name: planting_seasons_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.planting_seasons_id_seq', 1, false);


--
-- Name: planting_site_notifications_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.planting_site_notifications_id_seq', 1, false);


--
-- Name: planting_sites_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.planting_sites_id_seq', 1, false);


--
-- Name: planting_zones_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.planting_zones_id_seq', 1, false);


--
-- Name: plantings_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.plantings_id_seq', 1, false);


--
-- Name: plots_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.plots_id_seq', 1, false);


--
-- Name: recorded_plants_id_seq; Type: SEQUENCE SET; Schema: tracking; Owner: postgres
--

SELECT pg_catalog.setval('tracking.recorded_plants_id_seq', 1, false);


--
-- Name: cohort_modules cohort_modules_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT cohort_modules_pkey PRIMARY KEY (id);


--
-- Name: cohort_phases cohort_phases_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohort_phases
    ADD CONSTRAINT cohort_phases_name_key UNIQUE (name);


--
-- Name: cohort_phases cohort_phases_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohort_phases
    ADD CONSTRAINT cohort_phases_pkey PRIMARY KEY (id);


--
-- Name: cohorts cohorts_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_name_key UNIQUE (name);


--
-- Name: cohorts cohorts_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);


--
-- Name: deliverable_categories deliverable_categories_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_categories
    ADD CONSTRAINT deliverable_categories_name_key UNIQUE (name);


--
-- Name: deliverable_categories deliverable_categories_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_categories
    ADD CONSTRAINT deliverable_categories_pkey PRIMARY KEY (id);


--
-- Name: deliverable_documents deliverable_documents_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_pkey PRIMARY KEY (deliverable_id);


--
-- Name: deliverable_types deliverable_types_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_types
    ADD CONSTRAINT deliverable_types_name_key UNIQUE (name);


--
-- Name: deliverable_types deliverable_types_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_types
    ADD CONSTRAINT deliverable_types_pkey PRIMARY KEY (id);


--
-- Name: deliverables deliverables_id_deliverable_type_id_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_id_deliverable_type_id_key UNIQUE (id, deliverable_type_id);


--
-- Name: deliverables deliverables_module_id_position_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_module_id_position_key UNIQUE (module_id, "position");


--
-- Name: deliverables deliverables_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_pkey PRIMARY KEY (id);


--
-- Name: document_stores document_stores_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.document_stores
    ADD CONSTRAINT document_stores_name_key UNIQUE (name);


--
-- Name: document_stores document_stores_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.document_stores
    ADD CONSTRAINT document_stores_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: participants participants_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_name_key UNIQUE (name);


--
-- Name: participants participants_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);


--
-- Name: submission_documents submission_documents_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_pkey PRIMARY KEY (id);


--
-- Name: submission_statuses submission_statuses_name_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submission_statuses
    ADD CONSTRAINT submission_statuses_name_key UNIQUE (name);


--
-- Name: submission_statuses submission_statuses_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submission_statuses
    ADD CONSTRAINT submission_statuses_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_project_id_deliverable_id_key; Type: CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_project_id_deliverable_id_key UNIQUE (project_id, deliverable_id);


--
-- Name: batch_details_history batch_details_history_batch_id_version_key; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_batch_id_version_key UNIQUE (batch_id, version);


--
-- Name: batch_details_history batch_details_history_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_pkey PRIMARY KEY (id);


--
-- Name: batch_details_history_sub_locations batch_details_history_sub_locations_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history_sub_locations
    ADD CONSTRAINT batch_details_history_sub_locations_pkey PRIMARY KEY (batch_details_history_id, sub_location_id);


--
-- Name: batch_photos batch_photos_file_id_key; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_file_id_key UNIQUE (file_id);


--
-- Name: batch_photos batch_photos_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_pkey PRIMARY KEY (id);


--
-- Name: batch_quantity_history batch_quantity_history_batch_id_version_key; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_batch_id_version_key UNIQUE (batch_id, version);


--
-- Name: batch_quantity_history batch_quantity_history_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_pkey PRIMARY KEY (id);


--
-- Name: batch_quantity_history_types batch_quantity_history_types_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history_types
    ADD CONSTRAINT batch_quantity_history_types_pkey PRIMARY KEY (id);


--
-- Name: batch_sub_locations batch_sub_locations_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_pkey PRIMARY KEY (batch_id, sub_location_id);


--
-- Name: batch_substrates batch_substrates_name_key; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_substrates
    ADD CONSTRAINT batch_substrates_name_key UNIQUE (name);


--
-- Name: batch_substrates batch_substrates_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_substrates
    ADD CONSTRAINT batch_substrates_pkey PRIMARY KEY (id);


--
-- Name: batch_withdrawals batch_withdrawals_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_pkey PRIMARY KEY (batch_id, withdrawal_id);


--
-- Name: batches batches_facility_id_id_key; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_facility_id_id_key UNIQUE (facility_id, id);


--
-- Name: batches batches_organization_id_batch_number_key; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_organization_id_batch_number_key UNIQUE (organization_id, batch_number);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_photos withdrawal_photos_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawal_photos
    ADD CONSTRAINT withdrawal_photos_pkey PRIMARY KEY (file_id);


--
-- Name: withdrawal_purposes withdrawal_purposes_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawal_purposes
    ADD CONSTRAINT withdrawal_purposes_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: app_versions app_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_versions
    ADD CONSTRAINT app_versions_pkey PRIMARY KEY (app_name, platform);


--
-- Name: automations automations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_pkey PRIMARY KEY (id);


--
-- Name: conservation_categories conservation_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conservation_categories
    ADD CONSTRAINT conservation_categories_name_key UNIQUE (name);


--
-- Name: conservation_categories conservation_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conservation_categories
    ADD CONSTRAINT conservation_categories_pkey PRIMARY KEY (id);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (code);


--
-- Name: country_subdivisions country_subdivisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country_subdivisions
    ADD CONSTRAINT country_subdivisions_pkey PRIMARY KEY (code);


--
-- Name: device_managers device_managers_balena_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_balena_id_unique UNIQUE (balena_id);


--
-- Name: device_managers device_managers_balena_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_balena_uuid_unique UNIQUE (balena_uuid);


--
-- Name: device_managers device_managers_facility_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_facility_id_key UNIQUE (facility_id);


--
-- Name: device_managers device_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_pkey PRIMARY KEY (id);


--
-- Name: device_managers device_managers_short_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_short_code_key UNIQUE (sensor_kit_id);


--
-- Name: devices device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- Name: device_template_categories device_template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_template_categories
    ADD CONSTRAINT device_template_categories_pkey PRIMARY KEY (id);


--
-- Name: device_templates device_templates_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_templates
    ADD CONSTRAINT device_templates_category_id_name_key UNIQUE (category_id, name);


--
-- Name: device_templates device_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_templates
    ADD CONSTRAINT device_templates_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_types ecosystem_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecosystem_types
    ADD CONSTRAINT ecosystem_types_name_key UNIQUE (name);


--
-- Name: ecosystem_types ecosystem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecosystem_types
    ADD CONSTRAINT ecosystem_types_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_organization_id_type_id_facility_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_organization_id_type_id_facility_number_key UNIQUE (organization_id, type_id, facility_number);


--
-- Name: facility_connection_states facility_connection_states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_connection_states
    ADD CONSTRAINT facility_connection_states_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: gbif_names gbif_names_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gbif_names
    ADD CONSTRAINT gbif_names_pkey PRIMARY KEY (id);


--
-- Name: gbif_taxa gbif_taxa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gbif_taxa
    ADD CONSTRAINT gbif_taxa_pkey PRIMARY KEY (taxon_id);


--
-- Name: seed_treatments germination_treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_treatments
    ADD CONSTRAINT germination_treatment_pkey PRIMARY KEY (id);


--
-- Name: global_roles global_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_roles
    ADD CONSTRAINT global_roles_name_key UNIQUE (name);


--
-- Name: global_roles global_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_roles
    ADD CONSTRAINT global_roles_pkey PRIMARY KEY (id);


--
-- Name: growth_forms growth_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.growth_forms
    ADD CONSTRAINT growth_forms_pkey PRIMARY KEY (id);


--
-- Name: identifier_sequences identifier_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identifier_sequences
    ADD CONSTRAINT identifier_sequences_pkey PRIMARY KEY (organization_id, prefix);


--
-- Name: internal_tags internal_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_name_key UNIQUE (name);


--
-- Name: internal_tags internal_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_backgroundjobservers jobrunr_backgroundjobservers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobrunr_backgroundjobservers
    ADD CONSTRAINT jobrunr_backgroundjobservers_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_jobs jobrunr_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobrunr_jobs
    ADD CONSTRAINT jobrunr_jobs_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_metadata jobrunr_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobrunr_metadata
    ADD CONSTRAINT jobrunr_metadata_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_migrations jobrunr_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobrunr_migrations
    ADD CONSTRAINT jobrunr_migrations_pkey PRIMARY KEY (id);


--
-- Name: jobrunr_recurring_jobs jobrunr_recurring_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobrunr_recurring_jobs
    ADD CONSTRAINT jobrunr_recurring_jobs_pkey PRIMARY KEY (id);


--
-- Name: managed_location_types managed_location_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.managed_location_types
    ADD CONSTRAINT managed_location_types_pkey PRIMARY KEY (id);


--
-- Name: notification_criticalities notification_criticalities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_criticalities
    ADD CONSTRAINT notification_criticalities_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: reports one_org_report_per_quarter; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT one_org_report_per_quarter EXCLUDE USING btree (organization_id WITH =, year WITH =, quarter WITH =) WHERE ((project_id IS NULL));


--
-- Name: reports one_project_report_per_quarter; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT one_project_report_per_quarter UNIQUE (organization_id, project_id, year, quarter);


--
-- Name: organization_internal_tags organization_internal_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_pkey PRIMARY KEY (organization_id, internal_tag_id);


--
-- Name: organization_managed_location_types organization_managed_location_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_managed_location_types
    ADD CONSTRAINT organization_managed_location_types_pkey PRIMARY KEY (organization_id, managed_location_type_id);


--
-- Name: organizations organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization_report_settings organization_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_report_settings
    ADD CONSTRAINT organization_report_settings_pkey PRIMARY KEY (organization_id);


--
-- Name: organization_types organization_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_types
    ADD CONSTRAINT organization_types_pkey PRIMARY KEY (id);


--
-- Name: organization_users organization_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (user_id, organization_id);


--
-- Name: report_photos photo_not_shared_between_reports; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT photo_not_shared_between_reports UNIQUE (file_id);


--
-- Name: files photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: files photos_storage_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_storage_url_key UNIQUE (storage_url);


--
-- Name: project_report_settings project_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_report_settings
    ADD CONSTRAINT project_report_settings_pkey PRIMARY KEY (project_id);


--
-- Name: projects projects_organization_id_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_id_key UNIQUE (organization_id, id);


--
-- Name: projects projects_organization_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_name_key UNIQUE (organization_id, name);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: report_files report_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_pkey PRIMARY KEY (file_id);


--
-- Name: report_photos report_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT report_photos_pkey PRIMARY KEY (report_id, file_id);


--
-- Name: report_statuses report_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_statuses
    ADD CONSTRAINT report_statuses_name_key UNIQUE (name);


--
-- Name: report_statuses report_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_statuses
    ADD CONSTRAINT report_statuses_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: seed_storage_behaviors seed_storage_behaviors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_storage_behaviors
    ADD CONSTRAINT seed_storage_behaviors_pkey PRIMARY KEY (id);


--
-- Name: facilities site_module_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_pkey PRIMARY KEY (id);


--
-- Name: facility_types site_module_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types
    ADD CONSTRAINT site_module_type_pkey PRIMARY KEY (id);


--
-- Name: species_ecosystem_types species_ecosystem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_ecosystem_types
    ADD CONSTRAINT species_ecosystem_types_pkey PRIMARY KEY (species_id, ecosystem_type_id);


--
-- Name: species species_organization_id_scientific_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_organization_id_scientific_name_key UNIQUE (organization_id, scientific_name);


--
-- Name: species species_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey1 PRIMARY KEY (id);


--
-- Name: species_problem_fields species_problem_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_problem_fields
    ADD CONSTRAINT species_problem_fields_pkey PRIMARY KEY (id);


--
-- Name: species_problem_types species_problem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_problem_types
    ADD CONSTRAINT species_problem_types_pkey PRIMARY KEY (id);


--
-- Name: species_problems species_problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_pkey PRIMARY KEY (id);


--
-- Name: spring_session_attributes spring_session_attributes_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name);


--
-- Name: spring_session spring_session_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spring_session
    ADD CONSTRAINT spring_session_pk PRIMARY KEY (primary_id);


--
-- Name: sub_locations storage_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_location_pkey PRIMARY KEY (id);


--
-- Name: sub_locations storage_locations_facility_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_facility_id_name_key UNIQUE (facility_id, name);


--
-- Name: sub_locations sub_locations_facility_id_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT sub_locations_facility_id_id_key UNIQUE (facility_id, id);


--
-- Name: thumbnails thumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_pkey PRIMARY KEY (id);


--
-- Name: thumbnails thumbnails_unique_height; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_height UNIQUE (file_id, height);


--
-- Name: thumbnails thumbnails_unique_storage_url; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_storage_url UNIQUE (storage_url);


--
-- Name: thumbnails thumbnails_unique_width; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_width UNIQUE (file_id, width);


--
-- Name: time_zones time_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_zones
    ADD CONSTRAINT time_zones_pkey PRIMARY KEY (time_zone);


--
-- Name: timeseries timeseries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_pkey PRIMARY KEY (id);


--
-- Name: timeseries_types timeseries_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries_types
    ADD CONSTRAINT timeseries_type_pkey PRIMARY KEY (id);


--
-- Name: timeseries timeseries_unique_name_per_device; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_unique_name_per_device UNIQUE (device_id, name);


--
-- Name: upload_problem_types upload_problem_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_problem_types
    ADD CONSTRAINT upload_problem_types_pkey PRIMARY KEY (id);


--
-- Name: upload_problems upload_problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_problems
    ADD CONSTRAINT upload_problems_pkey PRIMARY KEY (id);


--
-- Name: upload_statuses upload_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_statuses
    ADD CONSTRAINT upload_statuses_pkey PRIMARY KEY (id);


--
-- Name: upload_types upload_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_types
    ADD CONSTRAINT upload_types_pkey PRIMARY KEY (id);


--
-- Name: uploads uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_pkey PRIMARY KEY (id);


--
-- Name: user_global_roles user_global_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_global_roles
    ADD CONSTRAINT user_global_roles_pkey PRIMARY KEY (user_id, global_role_id);


--
-- Name: user_types user_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_name_key UNIQUE (name);


--
-- Name: user_types user_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_types
    ADD CONSTRAINT user_types_pkey PRIMARY KEY (id);


--
-- Name: users users_auth_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accession_collectors accession_collectors_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_collectors
    ADD CONSTRAINT accession_collectors_pkey PRIMARY KEY (accession_id, "position");


--
-- Name: accessions accession_number_facility_unique; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_number_facility_unique UNIQUE (number, facility_id);


--
-- Name: accession_photos accession_photos_pk; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_photos
    ADD CONSTRAINT accession_photos_pk PRIMARY KEY (file_id);


--
-- Name: accessions accession_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_pkey PRIMARY KEY (id);


--
-- Name: accession_quantity_history accession_quantity_history_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_pkey PRIMARY KEY (id);


--
-- Name: accession_quantity_history_types accession_quantity_history_types_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_quantity_history_types
    ADD CONSTRAINT accession_quantity_history_types_pkey PRIMARY KEY (id);


--
-- Name: accession_states accession_state_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_states
    ADD CONSTRAINT accession_state_pkey PRIMARY KEY (id);


--
-- Name: bags bag_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.bags
    ADD CONSTRAINT bag_pkey PRIMARY KEY (id);


--
-- Name: geolocations collection_event_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.geolocations
    ADD CONSTRAINT collection_event_pkey PRIMARY KEY (id);


--
-- Name: collection_sources collection_sources_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.collection_sources
    ADD CONSTRAINT collection_sources_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: viability_test_seed_types germination_seed_type_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_test_seed_types
    ADD CONSTRAINT germination_seed_type_pkey PRIMARY KEY (id);


--
-- Name: viability_test_substrates germination_substrate_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_test_substrates
    ADD CONSTRAINT germination_substrate_pkey PRIMARY KEY (id);


--
-- Name: viability_test_types germination_test_type_name_key; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_test_types
    ADD CONSTRAINT germination_test_type_name_key UNIQUE (name);


--
-- Name: viability_test_types germination_test_type_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_test_types
    ADD CONSTRAINT germination_test_type_pkey PRIMARY KEY (id);


--
-- Name: seed_quantity_units seed_quantity_units_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.seed_quantity_units
    ADD CONSTRAINT seed_quantity_units_pkey PRIMARY KEY (id);


--
-- Name: viability_test_results viability_test_results_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_test_results
    ADD CONSTRAINT viability_test_results_pkey PRIMARY KEY (id);


--
-- Name: viability_tests viability_tests_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT viability_tests_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawal_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_purposes withdrawal_purpose_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawal_purposes
    ADD CONSTRAINT withdrawal_purpose_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_viability_test_id_unique; Type: CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_viability_test_id_unique UNIQUE (viability_test_id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_planting_site_id_id_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_planting_site_id_id_key UNIQUE (planting_site_id, id);


--
-- Name: deliveries deliveries_withdrawal_id_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_withdrawal_id_key UNIQUE (withdrawal_id);


--
-- Name: draft_planting_sites draft_planting_sites_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_pkey PRIMARY KEY (id);


--
-- Name: monitoring_plots monitoring_plots_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_pkey PRIMARY KEY (id);


--
-- Name: monitoring_plots monitoring_plots_planting_subzone_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_planting_subzone_id_name_key UNIQUE (planting_subzone_id, name);


--
-- Name: observable_conditions observable_conditions_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observable_conditions
    ADD CONSTRAINT observable_conditions_name_key UNIQUE (name);


--
-- Name: observable_conditions observable_conditions_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observable_conditions
    ADD CONSTRAINT observable_conditions_pkey PRIMARY KEY (id);


--
-- Name: observation_plot_positions observation_photo_positions_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plot_positions
    ADD CONSTRAINT observation_photo_positions_name_key UNIQUE (name);


--
-- Name: observation_plot_positions observation_photo_positions_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plot_positions
    ADD CONSTRAINT observation_photo_positions_pkey PRIMARY KEY (id);


--
-- Name: observation_photos observation_photos_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_pkey PRIMARY KEY (file_id);


--
-- Name: observation_plot_conditions observation_plot_conditions_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_pkey PRIMARY KEY (observation_id, monitoring_plot_id, condition_id);


--
-- Name: observation_plots observation_plots_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_pkey PRIMARY KEY (observation_id, monitoring_plot_id);


--
-- Name: observation_states observation_states_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_states
    ADD CONSTRAINT observation_states_name_key UNIQUE (name);


--
-- Name: observation_states observation_states_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_states
    ADD CONSTRAINT observation_states_pkey PRIMARY KEY (id);


--
-- Name: observations observations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observations
    ADD CONSTRAINT observations_pkey PRIMARY KEY (id);


--
-- Name: observed_plot_coordinates observed_plot_coordinates_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_pkey PRIMARY KEY (id);


--
-- Name: planting_seasons one_active_per_site; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_seasons
    ADD CONSTRAINT one_active_per_site EXCLUDE USING btree (planting_site_id WITH =) WHERE ((is_active = true));


--
-- Name: observed_plot_coordinates one_point_per_position; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT one_point_per_position UNIQUE (observation_id, monitoring_plot_id, position_id);


--
-- Name: planting_seasons planting_seasons_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_seasons
    ADD CONSTRAINT planting_seasons_pkey PRIMARY KEY (id);


--
-- Name: planting_site_notifications planting_site_notifications_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_pkey PRIMARY KEY (id);


--
-- Name: planting_site_notifications planting_site_notifications_planting_site_id_notification_t_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_planting_site_id_notification_t_key UNIQUE (planting_site_id, notification_type_id, notification_number);


--
-- Name: planting_site_populations planting_site_populations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_populations
    ADD CONSTRAINT planting_site_populations_pkey PRIMARY KEY (planting_site_id, species_id);


--
-- Name: planting_sites planting_sites_organization_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_organization_id_name_key UNIQUE (organization_id, name);


--
-- Name: planting_sites planting_sites_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_pkey PRIMARY KEY (id);


--
-- Name: planting_subzone_populations planting_subzone_populations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzone_populations
    ADD CONSTRAINT planting_subzone_populations_pkey PRIMARY KEY (planting_subzone_id, species_id);


--
-- Name: planting_types planting_types_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_types
    ADD CONSTRAINT planting_types_pkey PRIMARY KEY (id);


--
-- Name: planting_zone_populations planting_zone_populations_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zone_populations
    ADD CONSTRAINT planting_zone_populations_pkey PRIMARY KEY (planting_zone_id, species_id);


--
-- Name: planting_zones planting_zones_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_pkey PRIMARY KEY (id);


--
-- Name: planting_zones planting_zones_planting_site_id_id_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_planting_site_id_id_key UNIQUE (planting_site_id, id);


--
-- Name: planting_zones planting_zones_planting_site_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_planting_site_id_name_key UNIQUE (planting_site_id, name);


--
-- Name: plantings plantings_delivery_id_species_id_planting_type_id_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_delivery_id_species_id_planting_type_id_key UNIQUE (delivery_id, species_id, planting_type_id);


--
-- Name: plantings plantings_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_pkey PRIMARY KEY (id);


--
-- Name: planting_subzones plots_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_pkey PRIMARY KEY (id);


--
-- Name: planting_subzones plots_planting_site_id_id_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_site_id_id_key UNIQUE (planting_site_id, id);


--
-- Name: planting_subzones plots_planting_zone_id_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_zone_id_name_key UNIQUE (planting_zone_id, name);


--
-- Name: recorded_plant_statuses recorded_plant_statuses_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plant_statuses
    ADD CONSTRAINT recorded_plant_statuses_name_key UNIQUE (name);


--
-- Name: recorded_plant_statuses recorded_plant_statuses_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plant_statuses
    ADD CONSTRAINT recorded_plant_statuses_pkey PRIMARY KEY (id);


--
-- Name: recorded_plants recorded_plants_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_pkey PRIMARY KEY (id);


--
-- Name: recorded_species_certainties recorded_species_certainties_name_key; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_species_certainties
    ADD CONSTRAINT recorded_species_certainties_name_key UNIQUE (name);


--
-- Name: recorded_species_certainties recorded_species_certainties_pkey; Type: CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_species_certainties
    ADD CONSTRAINT recorded_species_certainties_pkey PRIMARY KEY (id);


--
-- Name: cohort_modules_cohort_id_start_date_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX cohort_modules_cohort_id_start_date_idx ON accelerator.cohort_modules USING btree (cohort_id, start_date);


--
-- Name: cohorts_created_by_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX cohorts_created_by_idx ON accelerator.cohorts USING btree (created_by);


--
-- Name: cohorts_modified_by_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX cohorts_modified_by_idx ON accelerator.cohorts USING btree (modified_by);


--
-- Name: participants_cohort_id_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX participants_cohort_id_idx ON accelerator.participants USING btree (cohort_id);


--
-- Name: participants_created_by_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX participants_created_by_idx ON accelerator.participants USING btree (created_by);


--
-- Name: participants_modified_by_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX participants_modified_by_idx ON accelerator.participants USING btree (modified_by);


--
-- Name: submission_documents_submission_id_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX submission_documents_submission_id_idx ON accelerator.submission_documents USING btree (submission_id);


--
-- Name: submissions_deliverable_id_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX submissions_deliverable_id_idx ON accelerator.submissions USING btree (deliverable_id);


--
-- Name: submissions_project_id_idx; Type: INDEX; Schema: accelerator; Owner: postgres
--

CREATE INDEX submissions_project_id_idx ON accelerator.submissions USING btree (project_id);


--
-- Name: batch_details_history_created_by_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_details_history_created_by_idx ON nursery.batch_details_history USING btree (created_by);


--
-- Name: batch_details_history_project_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_details_history_project_id_idx ON nursery.batch_details_history USING btree (project_id);


--
-- Name: batch_details_history_sub_locations_sub_location_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_details_history_sub_locations_sub_location_id_idx ON nursery.batch_details_history_sub_locations USING btree (sub_location_id);


--
-- Name: batch_photos_batch_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_photos_batch_id_idx ON nursery.batch_photos USING btree (batch_id);


--
-- Name: batch_quantity_history_batch_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_quantity_history_batch_id_idx ON nursery.batch_quantity_history USING btree (batch_id);


--
-- Name: batch_sub_locations_sub_location_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_sub_locations_sub_location_id_idx ON nursery.batch_sub_locations USING btree (sub_location_id);


--
-- Name: batch_withdrawals_destination_batch_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_withdrawals_destination_batch_id_idx ON nursery.batch_withdrawals USING btree (destination_batch_id);


--
-- Name: batch_withdrawals_withdrawal_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batch_withdrawals_withdrawal_id_idx ON nursery.batch_withdrawals USING btree (withdrawal_id);


--
-- Name: batches__species_id_ix; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batches__species_id_ix ON nursery.batches USING btree (species_id);


--
-- Name: batches_initial_batch_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batches_initial_batch_id_idx ON nursery.batches USING btree (initial_batch_id);


--
-- Name: batches_organization_id_species_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batches_organization_id_species_id_idx ON nursery.batches USING btree (organization_id, species_id);


--
-- Name: batches_project_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX batches_project_id_idx ON nursery.batches USING btree (project_id);


--
-- Name: withdrawal_photos_withdrawal_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX withdrawal_photos_withdrawal_id_idx ON nursery.withdrawal_photos USING btree (withdrawal_id);


--
-- Name: withdrawals_destination_facility_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX withdrawals_destination_facility_id_idx ON nursery.withdrawals USING btree (destination_facility_id);


--
-- Name: withdrawals_facility_id_idx; Type: INDEX; Schema: nursery; Owner: postgres
--

CREATE INDEX withdrawals_facility_id_idx ON nursery.withdrawals USING btree (facility_id);


--
-- Name: automations_device_id_timeseries_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX automations_device_id_timeseries_name_idx ON public.automations USING btree (device_id, timeseries_name);


--
-- Name: automations_facility_id_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX automations_facility_id_name_idx ON public.automations USING btree (facility_id, name);


--
-- Name: country_subdivisions_country_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX country_subdivisions_country_code_idx ON public.country_subdivisions USING btree (country_code);


--
-- Name: device_managers_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX device_managers_user_id_idx ON public.device_managers USING btree (user_id);


--
-- Name: facilities_idle_after_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX facilities_idle_after_time_idx ON public.facilities USING btree (idle_after_time);


--
-- Name: facilities_next_notification_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX facilities_next_notification_time_idx ON public.facilities USING btree (next_notification_time);


--
-- Name: facilities_organization_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX facilities_organization_id_idx ON public.facilities USING btree (organization_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: gbif_distributions_taxon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_distributions_taxon_id_idx ON public.gbif_distributions USING btree (taxon_id);


--
-- Name: gbif_name_words_gbif_name_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_name_words_gbif_name_id_idx ON public.gbif_name_words USING btree (gbif_name_id);


--
-- Name: gbif_name_words_word_gbif_name_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_name_words_word_gbif_name_id_idx ON public.gbif_name_words USING btree (word, gbif_name_id);


--
-- Name: gbif_names__name_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_names__name_trgm ON public.gbif_names USING gin (name public.gin_trgm_ops);


--
-- Name: gbif_names_name_is_scientific_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_names_name_is_scientific_idx ON public.gbif_names USING btree (name, is_scientific);


--
-- Name: gbif_names_taxon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_names_taxon_id_idx ON public.gbif_names USING btree (taxon_id);


--
-- Name: gbif_vernacular_names_taxon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX gbif_vernacular_names_taxon_id_idx ON public.gbif_vernacular_names USING btree (taxon_id);


--
-- Name: jobrunr_bgjobsrvrs_fsthb_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_bgjobsrvrs_fsthb_idx ON public.jobrunr_backgroundjobservers USING btree (firstheartbeat);


--
-- Name: jobrunr_bgjobsrvrs_lsthb_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_bgjobsrvrs_lsthb_idx ON public.jobrunr_backgroundjobservers USING btree (lastheartbeat);


--
-- Name: jobrunr_job_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_job_created_at_idx ON public.jobrunr_jobs USING btree (createdat);


--
-- Name: jobrunr_job_rci_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_job_rci_idx ON public.jobrunr_jobs USING btree (recurringjobid);


--
-- Name: jobrunr_job_scheduled_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_job_scheduled_at_idx ON public.jobrunr_jobs USING btree (scheduledat);


--
-- Name: jobrunr_job_signature_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_job_signature_idx ON public.jobrunr_jobs USING btree (jobsignature);


--
-- Name: jobrunr_jobs_state_updated_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_jobs_state_updated_idx ON public.jobrunr_jobs USING btree (state, updatedat);


--
-- Name: jobrunr_recurring_job_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_recurring_job_created_at_idx ON public.jobrunr_recurring_jobs USING btree (createdat);


--
-- Name: jobrunr_state_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobrunr_state_idx ON public.jobrunr_jobs USING btree (state);


--
-- Name: organization_users_contact_uk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX organization_users_contact_uk ON public.organization_users USING btree (organization_id) WHERE (role_id = 5);


--
-- Name: organization_users_organization_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organization_users_organization_id_idx ON public.organization_users USING btree (organization_id);


--
-- Name: projects_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX projects_created_by_idx ON public.projects USING btree (created_by);


--
-- Name: projects_modified_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX projects_modified_by_idx ON public.projects USING btree (modified_by);


--
-- Name: projects_participant_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX projects_participant_id_idx ON public.projects USING btree (participant_id);


--
-- Name: report_files_report_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX report_files_report_id_idx ON public.report_files USING btree (report_id);


--
-- Name: reports_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_project_id_idx ON public.reports USING btree (project_id);


--
-- Name: species__not_checked_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX species__not_checked_ix ON public.species USING btree (id) WHERE (checked_time IS NULL);


--
-- Name: species_organization_id_initial_scientific_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX species_organization_id_initial_scientific_name_idx ON public.species USING btree (organization_id, initial_scientific_name);


--
-- Name: species_problems_species_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX species_problems_species_id_idx ON public.species_problems USING btree (species_id);


--
-- Name: spring_session_ix1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX spring_session_ix1 ON public.spring_session USING btree (session_id);


--
-- Name: spring_session_ix2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spring_session_ix2 ON public.spring_session USING btree (expiry_time);


--
-- Name: spring_session_ix3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spring_session_ix3 ON public.spring_session USING btree (principal_name);


--
-- Name: timeseries_value_timeseries_id_created_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX timeseries_value_timeseries_id_created_time_idx ON public.timeseries_values USING btree (timeseries_id, created_time DESC);


--
-- Name: upload_problems_upload_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX upload_problems_upload_id_idx ON public.upload_problems USING btree (upload_id);


--
-- Name: uploads_facility_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX uploads_facility_id_idx ON public.uploads USING btree (facility_id);


--
-- Name: user_global_roles_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_global_roles_user_id_idx ON public.user_global_roles USING btree (user_id);


--
-- Name: user_preferences_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_preferences_user_id_idx ON public.user_preferences USING btree (user_id) WHERE (organization_id IS NULL);


--
-- Name: user_preferences_user_id_organization_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_preferences_user_id_organization_id_idx ON public.user_preferences USING btree (user_id, organization_id) WHERE (organization_id IS NOT NULL);


--
-- Name: accession__number_trgm; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accession__number_trgm ON seedbank.accessions USING gin (number public.gin_trgm_ops);


--
-- Name: accession__received_date_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accession__received_date_ix ON seedbank.accessions USING btree (received_date);


--
-- Name: accession_created_time_idx; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accession_created_time_idx ON seedbank.accessions USING btree (created_time);


--
-- Name: accession_quantity_history_accession_id_idx; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accession_quantity_history_accession_id_idx ON seedbank.accession_quantity_history USING btree (accession_id);


--
-- Name: accession_state_history_accession_id_idx; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accession_state_history_accession_id_idx ON seedbank.accession_state_history USING btree (accession_id);


--
-- Name: accession_state_history_new_state_id_updated_time_idx; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accession_state_history_new_state_id_updated_time_idx ON seedbank.accession_state_history USING btree (new_state_id, updated_time);


--
-- Name: accessions__facility_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accessions__facility_id_ix ON seedbank.accessions USING btree (facility_id);


--
-- Name: accessions__species_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accessions__species_id_ix ON seedbank.accessions USING btree (species_id);


--
-- Name: accessions_project_id_idx; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX accessions_project_id_idx ON seedbank.accessions USING btree (project_id);


--
-- Name: geolocation__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX geolocation__accession_id_ix ON seedbank.geolocations USING btree (accession_id);


--
-- Name: viability_test__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX viability_test__accession_id_ix ON seedbank.viability_tests USING btree (accession_id);


--
-- Name: viability_test_results__test_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX viability_test_results__test_id_ix ON seedbank.viability_test_results USING btree (test_id);


--
-- Name: viability_tests__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX viability_tests__accession_id_ix ON seedbank.viability_tests USING btree (accession_id);


--
-- Name: withdrawal__accession_id_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX withdrawal__accession_id_ix ON seedbank.withdrawals USING btree (accession_id);


--
-- Name: withdrawal__date_ix; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX withdrawal__date_ix ON seedbank.withdrawals USING btree (date);


--
-- Name: withdrawals_batch_id_idx; Type: INDEX; Schema: seedbank; Owner: postgres
--

CREATE INDEX withdrawals_batch_id_idx ON seedbank.withdrawals USING btree (batch_id);


--
-- Name: draft_planting_sites_organization_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX draft_planting_sites_organization_id_idx ON tracking.draft_planting_sites USING btree (organization_id);


--
-- Name: draft_planting_sites_project_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX draft_planting_sites_project_id_idx ON tracking.draft_planting_sites USING btree (project_id);


--
-- Name: observation_photos_file_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observation_photos_file_id_idx ON tracking.observation_photos USING btree (file_id);


--
-- Name: observation_photos_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observation_photos_monitoring_plot_id_idx ON tracking.observation_photos USING btree (monitoring_plot_id);


--
-- Name: observation_plot_conditions_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observation_plot_conditions_monitoring_plot_id_idx ON tracking.observation_plot_conditions USING btree (monitoring_plot_id);


--
-- Name: observation_plots_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observation_plots_monitoring_plot_id_idx ON tracking.observation_plots USING btree (monitoring_plot_id);


--
-- Name: observations_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observations_planting_site_id_idx ON tracking.observations USING btree (planting_site_id);


--
-- Name: observed_plot_species_totals_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_plot_species_totals_monitoring_plot_id_idx ON tracking.observed_plot_species_totals USING btree (monitoring_plot_id);


--
-- Name: observed_plot_species_totals_observation_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_plot_species_totals_observation_id_idx ON tracking.observed_plot_species_totals USING btree (observation_id);


--
-- Name: observed_plot_species_totals_observation_id_monitoring_plo_idx1; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_plot_species_totals_observation_id_monitoring_plo_idx1 ON tracking.observed_plot_species_totals USING btree (observation_id, monitoring_plot_id, species_name) WHERE (species_name IS NOT NULL);


--
-- Name: observed_plot_species_totals_observation_id_monitoring_plo_idx2; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_plot_species_totals_observation_id_monitoring_plo_idx2 ON tracking.observed_plot_species_totals USING btree (observation_id, monitoring_plot_id) WHERE ((species_id IS NULL) AND (species_name IS NULL));


--
-- Name: observed_plot_species_totals_observation_id_monitoring_plot_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_plot_species_totals_observation_id_monitoring_plot_idx ON tracking.observed_plot_species_totals USING btree (observation_id, monitoring_plot_id, species_id) WHERE (species_id IS NOT NULL);


--
-- Name: observed_plot_species_totals_species_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_plot_species_totals_species_id_idx ON tracking.observed_plot_species_totals USING btree (species_id);


--
-- Name: observed_site_species_totals_observation_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_site_species_totals_observation_id_idx ON tracking.observed_site_species_totals USING btree (observation_id);


--
-- Name: observed_site_species_totals_observation_id_planting_site__idx1; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_site_species_totals_observation_id_planting_site__idx1 ON tracking.observed_site_species_totals USING btree (observation_id, planting_site_id, species_name) WHERE (species_name IS NOT NULL);


--
-- Name: observed_site_species_totals_observation_id_planting_site__idx2; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_site_species_totals_observation_id_planting_site__idx2 ON tracking.observed_site_species_totals USING btree (observation_id, planting_site_id) WHERE ((species_id IS NULL) AND (species_name IS NULL));


--
-- Name: observed_site_species_totals_observation_id_planting_site_i_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_site_species_totals_observation_id_planting_site_i_idx ON tracking.observed_site_species_totals USING btree (observation_id, planting_site_id, species_id) WHERE (species_id IS NOT NULL);


--
-- Name: observed_site_species_totals_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_site_species_totals_planting_site_id_idx ON tracking.observed_site_species_totals USING btree (planting_site_id);


--
-- Name: observed_site_species_totals_species_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_site_species_totals_species_id_idx ON tracking.observed_site_species_totals USING btree (species_id);


--
-- Name: observed_zone_species_totals_observation_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_zone_species_totals_observation_id_idx ON tracking.observed_zone_species_totals USING btree (observation_id);


--
-- Name: observed_zone_species_totals_observation_id_planting_zone__idx1; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_zone_species_totals_observation_id_planting_zone__idx1 ON tracking.observed_zone_species_totals USING btree (observation_id, planting_zone_id, species_name) WHERE (species_name IS NOT NULL);


--
-- Name: observed_zone_species_totals_observation_id_planting_zone__idx2; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_zone_species_totals_observation_id_planting_zone__idx2 ON tracking.observed_zone_species_totals USING btree (observation_id, planting_zone_id) WHERE ((species_id IS NULL) AND (species_name IS NULL));


--
-- Name: observed_zone_species_totals_observation_id_planting_zone_i_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE UNIQUE INDEX observed_zone_species_totals_observation_id_planting_zone_i_idx ON tracking.observed_zone_species_totals USING btree (observation_id, planting_zone_id, species_id) WHERE (species_id IS NOT NULL);


--
-- Name: observed_zone_species_totals_planting_zone_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_zone_species_totals_planting_zone_id_idx ON tracking.observed_zone_species_totals USING btree (planting_zone_id);


--
-- Name: observed_zone_species_totals_species_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX observed_zone_species_totals_species_id_idx ON tracking.observed_zone_species_totals USING btree (species_id);


--
-- Name: planting_seasons_is_active_end_time_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX planting_seasons_is_active_end_time_idx ON tracking.planting_seasons USING btree (is_active, end_time);


--
-- Name: planting_seasons_is_active_start_time_end_time_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX planting_seasons_is_active_start_time_end_time_idx ON tracking.planting_seasons USING btree (is_active, start_time, end_time);


--
-- Name: planting_seasons_planting_site_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX planting_seasons_planting_site_id_idx ON tracking.planting_seasons USING btree (planting_site_id);


--
-- Name: planting_sites_project_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX planting_sites_project_id_idx ON tracking.planting_sites USING btree (project_id);


--
-- Name: plantings_delivery_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX plantings_delivery_id_idx ON tracking.plantings USING btree (delivery_id);


--
-- Name: plantings_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX plantings_plot_id_idx ON tracking.plantings USING btree (planting_subzone_id);


--
-- Name: plantings_species_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX plantings_species_id_idx ON tracking.plantings USING btree (species_id);


--
-- Name: recorded_plants_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX recorded_plants_monitoring_plot_id_idx ON tracking.recorded_plants USING btree (monitoring_plot_id);


--
-- Name: recorded_plants_observation_id_monitoring_plot_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX recorded_plants_observation_id_monitoring_plot_id_idx ON tracking.recorded_plants USING btree (observation_id, monitoring_plot_id);


--
-- Name: recorded_plants_species_id_idx; Type: INDEX; Schema: tracking; Owner: postgres
--

CREATE INDEX recorded_plants_species_id_idx ON tracking.recorded_plants USING btree (species_id);


--
-- Name: cohort_modules cohort_modules_cohort_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT cohort_modules_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES accelerator.cohorts(id);


--
-- Name: cohort_modules cohort_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohort_modules
    ADD CONSTRAINT cohort_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES accelerator.modules(id);


--
-- Name: cohorts cohorts_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cohorts cohorts_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: cohorts cohorts_phase_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.cohorts
    ADD CONSTRAINT cohorts_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES accelerator.cohort_phases(id);


--
-- Name: deliverable_documents deliverable_documents_deliverable_id_deliverable_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_deliverable_id_deliverable_type_id_fkey FOREIGN KEY (deliverable_id, deliverable_type_id) REFERENCES accelerator.deliverables(id, deliverable_type_id);


--
-- Name: deliverable_documents deliverable_documents_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES accelerator.deliverables(id);


--
-- Name: deliverable_documents deliverable_documents_deliverable_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverable_documents
    ADD CONSTRAINT deliverable_documents_deliverable_type_id_fkey FOREIGN KEY (deliverable_type_id) REFERENCES accelerator.deliverable_types(id);


--
-- Name: deliverables deliverables_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: deliverables deliverables_deliverable_category_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_deliverable_category_id_fkey FOREIGN KEY (deliverable_category_id) REFERENCES accelerator.deliverable_categories(id);


--
-- Name: deliverables deliverables_deliverable_type_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_deliverable_type_id_fkey FOREIGN KEY (deliverable_type_id) REFERENCES accelerator.deliverable_types(id);


--
-- Name: deliverables deliverables_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: deliverables deliverables_module_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.deliverables
    ADD CONSTRAINT deliverables_module_id_fkey FOREIGN KEY (module_id) REFERENCES accelerator.modules(id);


--
-- Name: modules modules_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: modules modules_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.modules
    ADD CONSTRAINT modules_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: participants participants_cohort_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES accelerator.cohorts(id);


--
-- Name: participants participants_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: participants participants_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.participants
    ADD CONSTRAINT participants_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: submission_documents submission_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: submission_documents submission_documents_document_store_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_document_store_id_fkey FOREIGN KEY (document_store_id) REFERENCES accelerator.document_stores(id);


--
-- Name: submission_documents submission_documents_submission_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submission_documents
    ADD CONSTRAINT submission_documents_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES accelerator.submissions(id);


--
-- Name: submissions submissions_created_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: submissions submissions_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES accelerator.deliverables(id);


--
-- Name: submissions submissions_modified_by_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: submissions submissions_project_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_submission_status_id_fkey; Type: FK CONSTRAINT; Schema: accelerator; Owner: postgres
--

ALTER TABLE ONLY accelerator.submissions
    ADD CONSTRAINT submissions_submission_status_id_fkey FOREIGN KEY (submission_status_id) REFERENCES accelerator.submission_statuses(id);


--
-- Name: batch_details_history batch_details_history_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_details_history batch_details_history_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batch_details_history batch_details_history_project_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: batch_details_history_sub_locations batch_details_history_sub_locatio_batch_details_history_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history_sub_locations
    ADD CONSTRAINT batch_details_history_sub_locatio_batch_details_history_id_fkey FOREIGN KEY (batch_details_history_id) REFERENCES nursery.batch_details_history(id) ON DELETE CASCADE;


--
-- Name: batch_details_history_sub_locations batch_details_history_sub_locations_sub_location_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history_sub_locations
    ADD CONSTRAINT batch_details_history_sub_locations_sub_location_id_fkey FOREIGN KEY (sub_location_id) REFERENCES public.sub_locations(id) ON DELETE SET NULL;


--
-- Name: batch_details_history batch_details_history_substrate_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES nursery.batch_substrates(id);


--
-- Name: batch_details_history batch_details_history_treatment_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_details_history
    ADD CONSTRAINT batch_details_history_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.seed_treatments(id);


--
-- Name: batch_photos batch_photos_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id);


--
-- Name: batch_photos batch_photos_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batch_photos batch_photos_deleted_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: batch_photos batch_photos_file_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_photos
    ADD CONSTRAINT batch_photos_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE SET NULL;


--
-- Name: batch_quantity_history batch_quantity_history_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_quantity_history batch_quantity_history_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batch_quantity_history batch_quantity_history_history_type_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_history_type_id_fkey FOREIGN KEY (history_type_id) REFERENCES nursery.batch_quantity_history_types(id);


--
-- Name: batch_quantity_history batch_quantity_history_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_quantity_history
    ADD CONSTRAINT batch_quantity_history_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: batch_sub_locations batch_sub_locations_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_sub_locations batch_sub_locations_facility_id_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_facility_id_batch_id_fkey FOREIGN KEY (facility_id, batch_id) REFERENCES nursery.batches(facility_id, id);


--
-- Name: batch_sub_locations batch_sub_locations_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: batch_sub_locations batch_sub_locations_facility_id_sub_location_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_facility_id_sub_location_id_fkey FOREIGN KEY (facility_id, sub_location_id) REFERENCES public.sub_locations(facility_id, id);


--
-- Name: batch_sub_locations batch_sub_locations_sub_location_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_sub_locations
    ADD CONSTRAINT batch_sub_locations_sub_location_id_fkey FOREIGN KEY (sub_location_id) REFERENCES public.sub_locations(id) ON DELETE CASCADE;


--
-- Name: batch_withdrawals batch_withdrawals_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE CASCADE;


--
-- Name: batch_withdrawals batch_withdrawals_destination_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_destination_batch_id_fkey FOREIGN KEY (destination_batch_id) REFERENCES nursery.batches(id) ON DELETE SET NULL;


--
-- Name: batch_withdrawals batch_withdrawals_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: batches batches_accession_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE SET NULL;


--
-- Name: batches batches_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batches batches_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: batches batches_initial_batch_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_initial_batch_id_fkey FOREIGN KEY (initial_batch_id) REFERENCES nursery.batches(id) ON DELETE SET NULL;


--
-- Name: batches batches_modified_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: batches batches_organization_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: batches batches_project_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: batches batches_species_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: batches batches_substrate_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES nursery.batch_substrates(id);


--
-- Name: batches batches_treatment_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.seed_treatments(id);


--
-- Name: withdrawal_photos withdrawal_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawal_photos
    ADD CONSTRAINT withdrawal_photos_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: withdrawal_photos withdrawal_photos_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawal_photos
    ADD CONSTRAINT withdrawal_photos_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id);


--
-- Name: withdrawals withdrawals_created_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_destination_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_destination_facility_id_fkey FOREIGN KEY (destination_facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_facility_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_modified_by_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_purpose_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: postgres
--

ALTER TABLE ONLY nursery.withdrawals
    ADD CONSTRAINT withdrawals_purpose_id_fkey FOREIGN KEY (purpose_id) REFERENCES nursery.withdrawal_purposes(id);


--
-- Name: automations automations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: automations automations_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: automations automations_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: automations automations_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: country_subdivisions country_subdivisions_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.country_subdivisions
    ADD CONSTRAINT country_subdivisions_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: device_managers device_managers_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: device_managers device_managers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_managers
    ADD CONSTRAINT device_managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: device_templates device_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_templates
    ADD CONSTRAINT device_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.device_template_categories(id);


--
-- Name: devices devices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: devices devices_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: devices devices_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: devices devices_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.devices(id);


--
-- Name: facilities facilities_connection_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_connection_state_id_fkey FOREIGN KEY (connection_state_id) REFERENCES public.facility_connection_states(id);


--
-- Name: facilities facilities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: facilities facilities_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: facilities facilities_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_time_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: gbif_name_words gbif_name_words_gbif_name_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gbif_name_words
    ADD CONSTRAINT gbif_name_words_gbif_name_id_fkey FOREIGN KEY (gbif_name_id) REFERENCES public.gbif_names(id);


--
-- Name: gbif_names gbif_names_taxon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gbif_names
    ADD CONSTRAINT gbif_names_taxon_id_fkey FOREIGN KEY (taxon_id) REFERENCES public.gbif_taxa(taxon_id);


--
-- Name: identifier_sequences identifier_sequences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identifier_sequences
    ADD CONSTRAINT identifier_sequences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: internal_tags internal_tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: internal_tags internal_tags_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_tags
    ADD CONSTRAINT internal_tags_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: notification_types notification_types_notification_criticality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_notification_criticality_id_fkey FOREIGN KEY (notification_criticality_id) REFERENCES public.notification_criticalities(id);


--
-- Name: notifications notifications_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id);


--
-- Name: notifications notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organization_internal_tags organization_internal_tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organization_internal_tags organization_internal_tags_internal_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_internal_tag_id_fkey FOREIGN KEY (internal_tag_id) REFERENCES public.internal_tags(id) ON DELETE CASCADE;


--
-- Name: organization_internal_tags organization_internal_tags_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_internal_tags
    ADD CONSTRAINT organization_internal_tags_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_managed_location_types organization_managed_location_typ_managed_location_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_managed_location_types
    ADD CONSTRAINT organization_managed_location_typ_managed_location_type_id_fkey FOREIGN KEY (managed_location_type_id) REFERENCES public.managed_location_types(id);


--
-- Name: organization_managed_location_types organization_managed_location_types_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_managed_location_types
    ADD CONSTRAINT organization_managed_location_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_report_settings organization_report_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_report_settings
    ADD CONSTRAINT organization_report_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_users organization_users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: organization_users organization_users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_users organization_users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: organization_users organization_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organizations organizations_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: organizations organizations_country_subdivision_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_country_subdivision_code_fkey FOREIGN KEY (country_subdivision_code) REFERENCES public.country_subdivisions(code);


--
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organizations organizations_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: organizations organizations_organization_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_organization_type_id_fkey FOREIGN KEY (organization_type_id) REFERENCES public.organization_types(id);


--
-- Name: organizations organizations_time_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: files photos_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: files photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT photos_user_id_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_report_settings project_report_settings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_report_settings
    ADD CONSTRAINT project_report_settings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET DEFAULT;


--
-- Name: projects projects_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id) ON DELETE SET DEFAULT;


--
-- Name: projects projects_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: projects projects_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES accelerator.participants(id);


--
-- Name: report_files report_files_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: report_files report_files_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_files
    ADD CONSTRAINT report_files_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: report_photos report_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT report_photos_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: report_photos report_photos_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_photos
    ADD CONSTRAINT report_photos_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: reports reports_locked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.users(id);


--
-- Name: reports reports_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: reports reports_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: reports reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: reports reports_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.report_statuses(id);


--
-- Name: reports reports_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: facilities site_module_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.facility_types(id);


--
-- Name: species species_conservation_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_conservation_category_id_fkey FOREIGN KEY (conservation_category_id) REFERENCES public.conservation_categories(id);


--
-- Name: species species_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: species species_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: species_ecosystem_types species_ecosystem_types_ecosystem_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_ecosystem_types
    ADD CONSTRAINT species_ecosystem_types_ecosystem_type_id_fkey FOREIGN KEY (ecosystem_type_id) REFERENCES public.ecosystem_types(id);


--
-- Name: species_ecosystem_types species_ecosystem_types_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_ecosystem_types
    ADD CONSTRAINT species_ecosystem_types_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species species_growth_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_growth_form_id_fkey FOREIGN KEY (growth_form_id) REFERENCES public.growth_forms(id);


--
-- Name: species species_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: species species_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: species_problems species_problems_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.species_problem_fields(id);


--
-- Name: species_problems species_problems_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: species_problems species_problems_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_problems
    ADD CONSTRAINT species_problems_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.species_problem_types(id);


--
-- Name: species species_seed_storage_behavior_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_seed_storage_behavior_id_fkey FOREIGN KEY (seed_storage_behavior_id) REFERENCES public.seed_storage_behaviors(id);


--
-- Name: spring_session_attributes spring_session_attributes_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES public.spring_session(primary_id) ON DELETE CASCADE;


--
-- Name: sub_locations storage_locations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sub_locations storage_locations_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: sub_locations storage_locations_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_locations
    ADD CONSTRAINT storage_locations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: thumbnails thumbnail_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: timeseries timeseries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: timeseries timeseries_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: timeseries timeseries_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: timeseries timeseries_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.timeseries_types(id);


--
-- Name: timeseries_values timeseries_values_timeseries_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeseries_values
    ADD CONSTRAINT timeseries_values_timeseries_id_fkey FOREIGN KEY (timeseries_id) REFERENCES public.timeseries(id) ON DELETE CASCADE;


--
-- Name: upload_problems upload_problems_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_problems
    ADD CONSTRAINT upload_problems_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.upload_problem_types(id);


--
-- Name: upload_problems upload_problems_upload_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_problems
    ADD CONSTRAINT upload_problems_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES public.uploads(id) ON DELETE CASCADE;


--
-- Name: uploads uploads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: uploads uploads_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: uploads uploads_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: uploads uploads_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.upload_statuses(id);


--
-- Name: uploads uploads_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.upload_types(id);


--
-- Name: user_global_roles user_global_roles_global_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_global_roles
    ADD CONSTRAINT user_global_roles_global_role_id_fkey FOREIGN KEY (global_role_id) REFERENCES public.global_roles(id) ON DELETE CASCADE;


--
-- Name: user_global_roles user_global_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_global_roles
    ADD CONSTRAINT user_global_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code);


--
-- Name: users users_time_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: users users_user_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_type_id_fkey FOREIGN KEY (user_type_id) REFERENCES public.user_types(id);


--
-- Name: accession_collectors accession_collectors_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_collectors
    ADD CONSTRAINT accession_collectors_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: accession_photos accession_photo_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_photos
    ADD CONSTRAINT accession_photo_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id);


--
-- Name: accession_photos accession_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_photos
    ADD CONSTRAINT accession_photos_photo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: accession_quantity_history accession_quantity_history_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: accession_quantity_history accession_quantity_history_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: accession_quantity_history accession_quantity_history_history_type_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_history_type_id_fkey FOREIGN KEY (history_type_id) REFERENCES seedbank.accession_quantity_history_types(id);


--
-- Name: accession_quantity_history accession_quantity_history_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_quantity_history
    ADD CONSTRAINT accession_quantity_history_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accession_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accession_state_history accession_state_history_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: accession_state_history accession_state_history_new_state_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_new_state_id_fkey FOREIGN KEY (new_state_id) REFERENCES seedbank.accession_states(id);


--
-- Name: accession_state_history accession_state_history_old_state_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_old_state_id_fkey FOREIGN KEY (old_state_id) REFERENCES seedbank.accession_states(id);


--
-- Name: accession_state_history accession_state_history_updated_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accession_state_history
    ADD CONSTRAINT accession_state_history_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: accessions accession_state_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_state_id_fkey FOREIGN KEY (state_id) REFERENCES seedbank.accession_states(id);


--
-- Name: accessions accession_storage_location_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_storage_location_id_fkey FOREIGN KEY (sub_location_id) REFERENCES public.sub_locations(id);


--
-- Name: accessions accession_subset_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_subset_weight_units_id_fkey FOREIGN KEY (subset_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accessions_collection_site_country_code_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_collection_site_country_code_fkey FOREIGN KEY (collection_site_country_code) REFERENCES public.countries(code);


--
-- Name: accessions accessions_collection_source_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_collection_source_id_fkey FOREIGN KEY (collection_source_id) REFERENCES seedbank.collection_sources(id);


--
-- Name: accessions accessions_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: accessions accessions_data_source_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_data_source_id_fkey FOREIGN KEY (data_source_id) REFERENCES seedbank.data_sources(id);


--
-- Name: accessions accessions_est_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_est_weight_units_id_fkey FOREIGN KEY (est_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accessions_facility_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: accessions accessions_latest_observed_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_latest_observed_units_id_fkey FOREIGN KEY (latest_observed_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accessions_modified_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: accessions accessions_project_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: accessions accessions_species_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: accessions accessions_total_withdrawn_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_total_withdrawn_weight_units_id_fkey FOREIGN KEY (total_withdrawn_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: bags bags_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.bags
    ADD CONSTRAINT bags_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: geolocations geolocations_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.geolocations
    ADD CONSTRAINT geolocations_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: viability_tests germination_test_seed_type_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_seed_type_id_fkey FOREIGN KEY (seed_type_id) REFERENCES seedbank.viability_test_seed_types(id);


--
-- Name: viability_tests germination_test_substrate_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES seedbank.viability_test_substrates(id);


--
-- Name: viability_tests germination_test_test_type_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_test_type_fkey FOREIGN KEY (test_type) REFERENCES seedbank.viability_test_types(id);


--
-- Name: viability_tests germination_test_treatment_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.seed_treatments(id);


--
-- Name: viability_test_results viability_test_results_test_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_test_results
    ADD CONSTRAINT viability_test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES seedbank.viability_tests(id) ON DELETE CASCADE;


--
-- Name: viability_tests viability_tests_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT viability_tests_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawal_purpose_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_purpose_id_fkey FOREIGN KEY (purpose_id) REFERENCES seedbank.withdrawal_purposes(id);


--
-- Name: withdrawals withdrawal_withdrawn_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_withdrawn_units_id_fkey FOREIGN KEY (withdrawn_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: withdrawals withdrawals_accession_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES seedbank.accessions(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_batch_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES nursery.batches(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_estimated_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_estimated_weight_units_id_fkey FOREIGN KEY (estimated_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: withdrawals withdrawals_viability_test_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_viability_test_id_fkey FOREIGN KEY (viability_test_id) REFERENCES seedbank.viability_tests(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_withdrawn_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: postgres
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawals_withdrawn_by_fkey FOREIGN KEY (withdrawn_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: deliveries deliveries_reassigned_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_reassigned_by_fkey FOREIGN KEY (reassigned_by) REFERENCES public.users(id);


--
-- Name: deliveries deliveries_withdrawal_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.deliveries
    ADD CONSTRAINT deliveries_withdrawal_id_fkey FOREIGN KEY (withdrawal_id) REFERENCES nursery.withdrawals(id) ON DELETE CASCADE;


--
-- Name: draft_planting_sites draft_planting_sites_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: draft_planting_sites draft_planting_sites_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: draft_planting_sites draft_planting_sites_organization_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: draft_planting_sites draft_planting_sites_organization_id_project_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_organization_id_project_id_fkey FOREIGN KEY (organization_id, project_id) REFERENCES public.projects(organization_id, id);


--
-- Name: draft_planting_sites draft_planting_sites_project_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: draft_planting_sites draft_planting_sites_time_zone_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.draft_planting_sites
    ADD CONSTRAINT draft_planting_sites_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone);


--
-- Name: monitoring_plots monitoring_plots_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: monitoring_plots monitoring_plots_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: monitoring_plots monitoring_plots_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.monitoring_plots
    ADD CONSTRAINT monitoring_plots_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE CASCADE;


--
-- Name: observation_photos observation_photos_file_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: observation_photos observation_photos_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id);


--
-- Name: observation_photos observation_photos_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id);


--
-- Name: observation_photos observation_photos_observation_id_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_observation_id_monitoring_plot_id_fkey FOREIGN KEY (observation_id, monitoring_plot_id) REFERENCES tracking.observation_plots(observation_id, monitoring_plot_id);


--
-- Name: observation_photos observation_photos_position_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_photos
    ADD CONSTRAINT observation_photos_position_id_fkey FOREIGN KEY (position_id) REFERENCES tracking.observation_plot_positions(id);


--
-- Name: observation_plot_conditions observation_plot_conditions_condition_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES tracking.observable_conditions(id);


--
-- Name: observation_plot_conditions observation_plot_conditions_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observation_plot_conditions observation_plot_conditions_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plot_conditions
    ADD CONSTRAINT observation_plot_conditions_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observation_plots observation_plots_claimed_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_completed_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: observation_plots observation_plots_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observation_plots observation_plots_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observation_plots
    ADD CONSTRAINT observation_plots_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observations observations_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observations
    ADD CONSTRAINT observations_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: observations observations_state_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observations
    ADD CONSTRAINT observations_state_id_fkey FOREIGN KEY (state_id) REFERENCES tracking.observation_states(id);


--
-- Name: observed_plot_coordinates observed_plot_coordinates_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observed_plot_coordinates observed_plot_coordinates_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_plot_coordinates observed_plot_coordinates_observation_id_monitoring_plot_i_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_observation_id_monitoring_plot_i_fkey FOREIGN KEY (observation_id, monitoring_plot_id) REFERENCES tracking.observation_plots(observation_id, monitoring_plot_id);


--
-- Name: observed_plot_coordinates observed_plot_coordinates_position_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_coordinates
    ADD CONSTRAINT observed_plot_coordinates_position_id_fkey FOREIGN KEY (position_id) REFERENCES tracking.observation_plot_positions(id);


--
-- Name: observed_plot_species_totals observed_plot_species_totals_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: observed_plot_species_totals observed_plot_species_totals_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: observed_plot_species_totals observed_plot_species_totals_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_plot_species_totals observed_plot_species_totals_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_plot_species_totals
    ADD CONSTRAINT observed_plot_species_totals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: observed_site_species_totals observed_site_species_totals_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: observed_site_species_totals observed_site_species_totals_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_site_species_totals observed_site_species_totals_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: observed_site_species_totals observed_site_species_totals_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_site_species_totals
    ADD CONSTRAINT observed_site_species_totals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: observed_zone_species_totals observed_zone_species_totals_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: observed_zone_species_totals observed_zone_species_totals_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: observed_zone_species_totals observed_zone_species_totals_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE CASCADE;


--
-- Name: observed_zone_species_totals observed_zone_species_totals_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.observed_zone_species_totals
    ADD CONSTRAINT observed_zone_species_totals_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: planting_seasons planting_seasons_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_seasons
    ADD CONSTRAINT planting_seasons_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_notifications planting_site_notifications_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id);


--
-- Name: planting_site_notifications planting_site_notifications_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_notifications
    ADD CONSTRAINT planting_site_notifications_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_populations planting_site_populations_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_populations
    ADD CONSTRAINT planting_site_populations_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_site_populations planting_site_populations_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_site_populations
    ADD CONSTRAINT planting_site_populations_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: planting_sites planting_sites_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_sites planting_sites_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: planting_sites planting_sites_organization_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: planting_sites planting_sites_project_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: planting_sites planting_sites_time_zone_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_sites
    ADD CONSTRAINT planting_sites_time_zone_fkey FOREIGN KEY (time_zone) REFERENCES public.time_zones(time_zone) ON DELETE SET NULL;


--
-- Name: planting_subzone_populations planting_subzone_populations_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzone_populations
    ADD CONSTRAINT planting_subzone_populations_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE CASCADE;


--
-- Name: planting_subzone_populations planting_subzone_populations_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzone_populations
    ADD CONSTRAINT planting_subzone_populations_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: planting_zone_populations planting_zone_populations_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zone_populations
    ADD CONSTRAINT planting_zone_populations_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE CASCADE;


--
-- Name: planting_zone_populations planting_zone_populations_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zone_populations
    ADD CONSTRAINT planting_zone_populations_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE CASCADE;


--
-- Name: planting_zones planting_zones_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_zones planting_zones_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: planting_zones planting_zones_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_zones
    ADD CONSTRAINT planting_zones_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: plantings plantings_delivery_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES tracking.deliveries(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_planting_site_id_delivery_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_site_id_delivery_id_fkey FOREIGN KEY (planting_site_id, delivery_id) REFERENCES tracking.deliveries(planting_site_id, id);


--
-- Name: plantings plantings_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_planting_site_id_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_site_id_plot_id_fkey FOREIGN KEY (planting_site_id, planting_subzone_id) REFERENCES tracking.planting_subzones(planting_site_id, id);


--
-- Name: plantings plantings_planting_subzone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_subzone_id_fkey FOREIGN KEY (planting_subzone_id) REFERENCES tracking.planting_subzones(id) ON DELETE CASCADE;


--
-- Name: plantings plantings_planting_type_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_planting_type_id_fkey FOREIGN KEY (planting_type_id) REFERENCES tracking.planting_types(id);


--
-- Name: plantings plantings_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.plantings
    ADD CONSTRAINT plantings_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: planting_subzones plots_created_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: planting_subzones plots_modified_by_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: planting_subzones plots_planting_site_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_site_id_fkey FOREIGN KEY (planting_site_id) REFERENCES tracking.planting_sites(id) ON DELETE CASCADE;


--
-- Name: planting_subzones plots_planting_site_id_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_site_id_planting_zone_id_fkey FOREIGN KEY (planting_site_id, planting_zone_id) REFERENCES tracking.planting_zones(planting_site_id, id);


--
-- Name: planting_subzones plots_planting_zone_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.planting_subzones
    ADD CONSTRAINT plots_planting_zone_id_fkey FOREIGN KEY (planting_zone_id) REFERENCES tracking.planting_zones(id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_certainty_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_certainty_id_fkey FOREIGN KEY (certainty_id) REFERENCES tracking.recorded_species_certainties(id);


--
-- Name: recorded_plants recorded_plants_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_monitoring_plot_id_fkey FOREIGN KEY (monitoring_plot_id) REFERENCES tracking.monitoring_plots(id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_observation_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_observation_id_fkey FOREIGN KEY (observation_id) REFERENCES tracking.observations(id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_observation_id_monitoring_plot_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_observation_id_monitoring_plot_id_fkey FOREIGN KEY (observation_id, monitoring_plot_id) REFERENCES tracking.observation_plots(observation_id, monitoring_plot_id) ON DELETE CASCADE;


--
-- Name: recorded_plants recorded_plants_species_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: recorded_plants recorded_plants_status_id_fkey; Type: FK CONSTRAINT; Schema: tracking; Owner: postgres
--

ALTER TABLE ONLY tracking.recorded_plants
    ADD CONSTRAINT recorded_plants_status_id_fkey FOREIGN KEY (status_id) REFERENCES tracking.recorded_plant_statuses(id);


--
-- PostgreSQL database dump complete
--

