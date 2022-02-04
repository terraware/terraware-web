--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

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
-- Name: accession_germination_test_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accession_germination_test_types (
    accession_id bigint NOT NULL,
    germination_test_type_id integer NOT NULL
);


--
-- Name: TABLE accession_germination_test_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accession_germination_test_types IS '(Enum) Types of tests that can be performed on seeds to determine whether or not they successfully germinate';


--
-- Name: accessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accessions (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    app_device_id bigint,
    number text,
    species_id bigint,
    collected_date date,
    received_date date,
    state_id integer NOT NULL,
    primary_collector_id bigint,
    founder_id text,
    trees_collected_from integer,
    environmental_notes text,
    field_notes text,
    processing_start_date date,
    subset_weight numeric,
    subset_count integer,
    est_seed_count integer,
    cut_test_seeds_filled integer,
    cut_test_seeds_empty integer,
    cut_test_seeds_compromised integer,
    drying_start_date date,
    drying_end_date date,
    drying_move_date date,
    processing_notes text,
    storage_start_date date,
    storage_packets integer,
    storage_location_id bigint,
    storage_notes text,
    family_id bigint,
    created_time timestamp with time zone NOT NULL,
    processing_method_id integer,
    target_storage_condition integer,
    processing_staff_responsible text,
    collection_site_name text,
    collection_site_landowner text,
    storage_staff_responsible text,
    latest_germination_recording_date date,
    latest_viability_percent integer,
    total_viability_percent integer,
    species_endangered_type_id integer,
    rare_type_id integer,
    source_plant_origin_id integer,
    nursery_start_date date,
    remaining_grams numeric,
    remaining_quantity numeric,
    remaining_units_id integer,
    subset_weight_grams numeric,
    subset_weight_quantity numeric,
    subset_weight_units_id integer,
    total_grams numeric,
    total_quantity numeric,
    total_units_id integer,
    checked_in_time timestamp with time zone,
    CONSTRAINT remaining_quantity_must_have_units CHECK ((((remaining_quantity IS NOT NULL) AND (remaining_units_id IS NOT NULL)) OR ((remaining_quantity IS NULL) AND (remaining_units_id IS NULL)))),
    CONSTRAINT subset_weight_quantity_must_have_units CHECK ((((subset_weight_quantity IS NOT NULL) AND (subset_weight_units_id IS NOT NULL)) OR ((subset_weight_quantity IS NULL) AND (subset_weight_units_id IS NULL)))),
    CONSTRAINT subset_weight_units_must_not_be_seeds CHECK (((subset_weight_units_id <> 1) OR (subset_weight_units_id IS NULL))),
    CONSTRAINT total_quantity_must_have_units CHECK ((((total_quantity IS NOT NULL) AND (total_units_id IS NOT NULL)) OR ((total_quantity IS NULL) AND (total_units_id IS NULL))))
);


--
-- Name: TABLE accessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accessions IS 'Information about batches of seeds. An accession is a batch of seeds of the same species collected in the same time and place by the same people.';


--
-- Name: COLUMN accessions.number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accessions.number IS 'Displayed as the accession number to the user.';


--
-- Name: COLUMN accessions.target_storage_condition; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accessions.target_storage_condition IS 'The intended storage condition of the accession as determined during initial processing.';


--
-- Name: COLUMN accessions.latest_viability_percent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accessions.latest_viability_percent IS 'Percent of seeds germinated in most recent viability test, or in cut test if no germinations exist yet';


--
-- Name: COLUMN accessions.total_viability_percent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accessions.total_viability_percent IS 'Percentage of viable seeds across all tests.';


--
-- Name: COLUMN accessions.nursery_start_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accessions.nursery_start_date IS 'When the accession was moved to a nursery, or null if it is not in a nursery.';


--
-- Name: accession_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.accessions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.accession_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: accession_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accession_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SEQUENCE accession_number_seq; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON SEQUENCE public.accession_number_seq IS 'Next date-based accession number. The value is of the form YYYYMMDDXXXXXXXXXX where XXXXXXXXXX starts at 0000000000 at the start of each day. The application resets the sequence as needed.';


--
-- Name: accession_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accession_photos (
    accession_id bigint NOT NULL,
    photo_id bigint NOT NULL
);


--
-- Name: TABLE accession_photos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accession_photos IS 'Linking table between `accessions` and `photos`.';


--
-- Name: accession_secondary_collectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accession_secondary_collectors (
    accession_id bigint NOT NULL,
    collector_id bigint NOT NULL
);


--
-- Name: TABLE accession_secondary_collectors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accession_secondary_collectors IS 'Associates additional collectors with accessions. The primary collector is not included here, but is instead stored in `accessions.primary_collector_id`.';


--
-- Name: accession_state_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accession_state_history (
    accession_id bigint NOT NULL,
    updated_time timestamp with time zone NOT NULL,
    old_state_id integer,
    new_state_id integer NOT NULL,
    reason text NOT NULL
);


--
-- Name: TABLE accession_state_history; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accession_state_history IS 'Historical record of when accessions moved to different states. A row is inserted here for every state transition.';


--
-- Name: COLUMN accession_state_history.old_state_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accession_state_history.old_state_id IS 'Null if this is the initial state for a new accession.';


--
-- Name: accession_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accession_states (
    id integer NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: TABLE accession_states; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.accession_states IS '(Enum) Available states an accession can be in. Each state represents a step in the seed management workflow.';


--
-- Name: app_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_devices (
    id bigint NOT NULL,
    app_build text,
    app_name text,
    brand text,
    created_time timestamp with time zone NOT NULL,
    model text,
    name text,
    os_type text,
    os_version text,
    unique_id text
);


--
-- Name: TABLE app_devices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.app_devices IS 'Installations of the mobile app that were used to upload seed data.';


--
-- Name: app_device_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.app_devices ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.app_device_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
    configuration jsonb
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
-- Name: bags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bags (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    bag_number text
);


--
-- Name: TABLE bags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.bags IS 'Individual bags of seeds that are part of an accession. An accession can consist of multiple bags.';


--
-- Name: bag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.bags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.bag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: geolocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geolocations (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    created_time timestamp with time zone,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    gps_accuracy double precision
);


--
-- Name: TABLE geolocations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.geolocations IS 'Locations where seeds were collected.';


--
-- Name: collection_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.geolocations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.collection_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: collectors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collectors (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    name text NOT NULL,
    notes text
);


--
-- Name: TABLE collectors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.collectors IS 'People who participated in seed collection. Both primary and secondary collectors are included.';


--
-- Name: collector_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.collectors ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.collector_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conservation_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conservation_statuses (
    id character varying(2) NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE conservation_statuses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.conservation_statuses IS '(Enum) UICN Red List categories defining the conservation status of a given species.';


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
    polling_interval integer,
    enabled boolean DEFAULT true NOT NULL,
    settings jsonb,
    parent_id bigint
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
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facilities (
    id bigint NOT NULL,
    site_id bigint NOT NULL,
    type_id integer NOT NULL,
    name text NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    enabled boolean DEFAULT true NOT NULL
);


--
-- Name: TABLE facilities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facilities IS 'Physical locations at a site. For example, each seed bank and each nursery is a facility.';


--
-- Name: facility_alert_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facility_alert_recipients (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    email text NOT NULL
);


--
-- Name: TABLE facility_alert_recipients; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.facility_alert_recipients IS 'Where to send notifications about issues at a particular facility. The recipients are not necessarily Terraware users.';


--
-- Name: facility_alert_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.facility_alert_recipients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.facility_alert_recipients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
-- Name: families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.families (
    id bigint NOT NULL,
    name text NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    is_scientific boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE families; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.families IS 'Taxonomic family that each species belongs to. For example, Cousa dogwood (Cornus kousa) is in family "Cornaceae."';


--
-- Name: family_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.families ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.family_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: family_names; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_names (
    id bigint NOT NULL,
    family_id bigint NOT NULL,
    name text NOT NULL,
    locale text,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    is_scientific boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE family_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.family_names IS 'Alternate names for families. A family can have multiple names, e.g., a scientific name and several common names. The primary name is stored here as well as in `families`.';


--
-- Name: family_names_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.family_names ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.family_names_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: feature_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feature_photos (
    photo_id bigint NOT NULL,
    feature_id bigint NOT NULL,
    plant_observation_id bigint
);


--
-- Name: TABLE feature_photos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.feature_photos IS 'Linking table between `features` and `photos`. Also optionally links `plant_observations` and `photos`.';


--
-- Name: features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.features (
    id bigint NOT NULL,
    layer_id bigint NOT NULL,
    gps_horiz_accuracy double precision,
    gps_vert_accuracy double precision,
    attrib text,
    notes text,
    entered_time timestamp with time zone,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    geom public.geometry(GeometryZ,3857),
    CONSTRAINT attrib_cannot_be_empty_string CHECK (((attrib IS NULL) OR (length(attrib) > 0))),
    CONSTRAINT notes_cannot_be_empty_string CHECK (((notes IS NULL) OR (length(notes) > 0)))
);


--
-- Name: TABLE features; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.features IS 'Physical features that appear on a map. For example, an individual tree whose location is being tracked is a map feature. This table only has generic information; child tables such as `plants` have more information about particular kinds of features.';


--
-- Name: features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.features ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
-- Name: germinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.germinations (
    id bigint NOT NULL,
    test_id bigint NOT NULL,
    recording_date date NOT NULL,
    seeds_germinated integer NOT NULL
);


--
-- Name: TABLE germinations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.germinations IS 'Result from a germination test of a batch of seeds. Germination tests can have multiple germinations, e.g., if different seeds germinate on different days.';


--
-- Name: germination_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.germinations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.germination_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: germination_seed_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.germination_seed_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE germination_seed_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.germination_seed_types IS '(Enum) Types of seeds that can be tested for germination ability. This refers to how the seeds were stored, not the physical characteristics of the seeds themselves.';


--
-- Name: germination_seed_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.germination_seed_types ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.germination_seed_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: germination_substrates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.germination_substrates (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE germination_substrates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.germination_substrates IS '(Enum) Types of substrate that can be used to test seeds for germination ability.';


--
-- Name: germination_substrate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.germination_substrates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.germination_substrate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: germination_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.germination_tests (
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
    remaining_grams numeric,
    remaining_quantity numeric NOT NULL,
    remaining_units_id integer NOT NULL
);


--
-- Name: TABLE germination_tests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.germination_tests IS 'Information about a single batch of seeds being tested for germination ability. This is the information about the test itself; the results are represented in the `germinations` table.';


--
-- Name: germination_test_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.germination_tests ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.germination_test_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: germination_test_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.germination_test_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE germination_test_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.germination_test_types IS '(Enum) Types of tests that can be performed on seeds to check for germination ability.';


--
-- Name: germination_treatments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.germination_treatments (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE germination_treatments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.germination_treatments IS '(Enum) Techniques that can be used to treat seeds before testing them for germination ability.';


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.germination_treatments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.germination_treatment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: health_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_states (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE health_states; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.health_states IS '(Enum) Possible ratings of how healthy a plant was when it was observed.';


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
-- Name: layer_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.layer_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE layer_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.layer_types IS '(Enum) Types of map features that can be grouped together into a layer.';


--
-- Name: layers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.layers (
    id bigint NOT NULL,
    site_id bigint NOT NULL,
    layer_type_id integer NOT NULL,
    tile_set_name text,
    proposed boolean NOT NULL,
    hidden boolean NOT NULL,
    deleted boolean NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    CONSTRAINT tile_set_name_cannot_be_empty_string CHECK (((tile_set_name IS NULL) OR (length(tile_set_name) > 0)))
);


--
-- Name: TABLE layers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.layers IS 'Map layers. Each layer has features of a particular type, e.g., irrigation infrastructure or existing vegetation at a site.';


--
-- Name: layers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.layers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.layers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    site_id bigint NOT NULL,
    type_id integer NOT NULL,
    accession_id bigint,
    created_time timestamp with time zone NOT NULL,
    read boolean DEFAULT false NOT NULL,
    message text NOT NULL,
    accession_state_id integer
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'Notifications about tasks that need to be performed at a seed bank.';


--
-- Name: COLUMN notifications.accession_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.accession_id IS 'Null if this notification is not specific to a single accession.';


--
-- Name: COLUMN notifications.accession_state_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.accession_state_id IS 'For state notifications, which state is being notified about. Null otherwise.';


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notification_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE notification_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_types IS '(Enum) Types of seed bank notification that can be generated by the application.';


--
-- Name: organization_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_users (
    user_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    role_id integer NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL
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
    location text,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    disabled_time timestamp with time zone
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
-- Name: photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photos (
    id bigint NOT NULL,
    heading double precision,
    orientation double precision,
    captured_time timestamp with time zone NOT NULL,
    file_name text NOT NULL,
    content_type text NOT NULL,
    size bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    user_id bigint,
    gps_horiz_accuracy double precision,
    gps_vert_accuracy double precision,
    storage_url text NOT NULL,
    location public.geometry(PointZ,3857),
    CONSTRAINT content_type_cannot_be_empty_string CHECK ((length(content_type) > 0)),
    CONSTRAINT file_name_cannot_be_empty_string CHECK ((length(file_name) > 0))
);


--
-- Name: TABLE photos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.photos IS 'Generic information about individual photos. Photos are associated with application entities using linking tables such as `feature_photos`.';


--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.photos ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.photos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plant_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plant_forms (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE plant_forms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.plant_forms IS '(Enum) What physical form a particular species takes. For example, "Tree" or "Shrub."';


--
-- Name: plant_observations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plant_observations (
    id bigint NOT NULL,
    feature_id bigint NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    health_state_id integer,
    flowers boolean,
    seeds boolean,
    pests text,
    height double precision,
    dbh double precision,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    CONSTRAINT pests_cannot_be_empty_string CHECK (((pests IS NULL) OR (length(pests) > 0)))
);


--
-- Name: TABLE plant_observations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.plant_observations IS 'Observations of a particular plant. A single plant can be observed repeatedly over time.';


--
-- Name: plant_observations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.plant_observations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.plant_observations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: plants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plants (
    feature_id bigint NOT NULL,
    label text,
    species_id bigint,
    natural_regen boolean,
    date_planted date,
    CONSTRAINT label_cannot_be_empty_string CHECK (((label IS NULL) OR (length(label) > 0)))
);


--
-- Name: TABLE plants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.plants IS 'Plants whose locations are being tracked. Each plant is represented as a map feature in the `features` table; this table has information that only applies to plants and not to other kinds of map features.';


--
-- Name: processing_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.processing_methods (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE processing_methods; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.processing_methods IS '(Enum) Methods of counting seeds when processing accessions.';


--
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_statuses (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE project_statuses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_statuses IS '(Enum) Statuses of projects recognized by the application.';


--
-- Name: project_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE project_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_types IS '(Enum) Types of projects recognized by the application.';


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_users (
    user_id bigint NOT NULL,
    project_id bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE project_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_users IS 'Linking table between `projects` and `users` defining which users are allowed to access which projects.';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    location text,
    type_id integer,
    status_id integer,
    start_date date,
    end_date date,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    disabled_time timestamp with time zone,
    pm_user_id bigint
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'Information about a single restoration project. A project can span multiple sites.';


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
-- Name: rare_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rare_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE rare_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.rare_types IS '(Enum) Possible values of the "Rare" attribute of an accession. This refers to whether the seed is rare at a site, not whether the species as a whole is rare or endangered.';


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
-- Name: seed_quantity_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seed_quantity_units (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE seed_quantity_units; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.seed_quantity_units IS '(Enum) Available units in which seeds can be measured. For weight-based units, includes unit conversion information.';


--
-- Name: sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sites (
    id bigint NOT NULL,
    name text NOT NULL,
    locale text,
    timezone text,
    enabled boolean DEFAULT true NOT NULL,
    project_id bigint NOT NULL,
    location public.geometry(PointZ,3857) NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE sites; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sites IS 'Physical locations where facilities are located or plants are being tracked.';


--
-- Name: COLUMN sites.locale; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sites.locale IS 'Default locale at the site; an IETF BCP 47 language tag such as en-US.';


--
-- Name: COLUMN sites.timezone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sites.timezone IS 'Name of time zone at site; an IANA tz database zone name.';


--
-- Name: site_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.site_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
-- Name: source_plant_origins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.source_plant_origins (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE source_plant_origins; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.source_plant_origins IS '(Enum) Types of origins of plants from which seeds were collected. For example, "Outplant" represents a plant that was cultivated, as opposed to one growing in the wild.';


--
-- Name: species; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species (
    id bigint NOT NULL,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    name text NOT NULL,
    family_id bigint,
    plant_form_id integer,
    conservation_status_id character varying(2),
    rare_type_id integer,
    native_range public.geometry,
    tsn text,
    is_scientific boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE species; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species IS 'Information about plant species.';


--
-- Name: species_endangered_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_endangered_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE species_endangered_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_endangered_types IS '(Enum) Possible values for the "Endangered" attribute of an accession. This is not used for plants whose locations are being tracked; see `conservation_statuses` instead.';


--
-- Name: species_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.species ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.species_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: species_names; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_names (
    id bigint NOT NULL,
    species_id bigint NOT NULL,
    organization_id bigint,
    name text NOT NULL,
    is_scientific boolean DEFAULT false NOT NULL,
    locale text,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE species_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_names IS 'Alternate names for species. A species can have multiple names, e.g., a scientific name and several common names. The primary name is stored here as well as in `species`.';


--
-- Name: species_names_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.species_names ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.species_names_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: species_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.species_options (
    id bigint NOT NULL,
    species_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    project_id bigint,
    site_id bigint,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL
);


--
-- Name: TABLE species_options; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.species_options IS 'Linking table between `species` and `organizations` that represents which species are in use by which organizations. Can also link a species to a project and/or a site.';


--
-- Name: species_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.species_options ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.species_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
-- Name: storage_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storage_conditions (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE storage_conditions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.storage_conditions IS '(Enum) Refrigeration condition of seeds during storage.';


--
-- Name: storage_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storage_locations (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    name text NOT NULL,
    condition_id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL
);


--
-- Name: TABLE storage_locations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.storage_locations IS 'The available locations where seeds can be stored at a seed bank facility.';


--
-- Name: COLUMN storage_locations.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.storage_locations.name IS 'E.g., Freezer 1, Freezer 2';


--
-- Name: storage_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.storage_locations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.storage_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: task_processed_times; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_processed_times (
    name text NOT NULL,
    processed_up_to timestamp with time zone NOT NULL,
    started_time timestamp with time zone
);


--
-- Name: TABLE task_processed_times; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.task_processed_times IS 'Tracks the most recently processed time for recurring tasks that need to cover non-overlapping time periods.';


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
    photo_id bigint NOT NULL,
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
-- Name: timeseries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeseries (
    id bigint NOT NULL,
    type_id integer NOT NULL,
    device_id bigint,
    name text NOT NULL,
    units text,
    decimal_places integer,
    CONSTRAINT timeseries_decimal_places_check CHECK ((decimal_places >= 0))
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
    auth_id text NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    created_time timestamp with time zone NOT NULL,
    modified_time timestamp with time zone NOT NULL,
    user_type_id integer NOT NULL
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
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawals (
    id bigint NOT NULL,
    accession_id bigint NOT NULL,
    date date NOT NULL,
    purpose_id integer NOT NULL,
    destination text,
    staff_responsible text,
    created_time timestamp with time zone NOT NULL,
    updated_time timestamp with time zone NOT NULL,
    notes text,
    germination_test_id bigint,
    remaining_grams numeric,
    remaining_quantity numeric NOT NULL,
    remaining_units_id integer NOT NULL,
    withdrawn_grams numeric,
    withdrawn_quantity numeric,
    withdrawn_units_id integer,
    CONSTRAINT germination_testing_withdrawal_has_test_id CHECK ((((purpose_id <> 7) AND (germination_test_id IS NULL)) OR ((purpose_id = 7) AND (germination_test_id IS NOT NULL))))
);


--
-- Name: TABLE withdrawals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.withdrawals IS 'Information about seeds that have been withdrawn from a seed bank. Each time someone withdraws seeds, a new row is inserted here.';


--
-- Name: withdrawal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.withdrawals ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.withdrawal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: withdrawal_purposes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawal_purposes (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE withdrawal_purposes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.withdrawal_purposes IS '(Enum) Reasons that someone can withdraw seeds from a seed bank.';


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.withdrawal_purposes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.withdrawal_purpose_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: accession_germination_test_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accession_germination_test_types (accession_id, germination_test_type_id) FROM stdin;
\.


--
-- Data for Name: accession_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accession_photos (accession_id, photo_id) FROM stdin;
1002	1001
1002	1002
\.


--
-- Data for Name: accession_secondary_collectors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accession_secondary_collectors (accession_id, collector_id) FROM stdin;
\.


--
-- Data for Name: accession_state_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accession_state_history (accession_id, updated_time, old_state_id, new_state_id, reason) FROM stdin;
\.


--
-- Data for Name: accession_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accession_states (id, name, active) FROM stdin;
5	Awaiting Check-In	t
10	Pending	t
20	Processing	t
30	Processed	t
40	Drying	t
50	Dried	t
60	In Storage	t
70	Withdrawn	f
80	Nursery	f
\.


--
-- Data for Name: accessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accessions (id, facility_id, app_device_id, number, species_id, collected_date, received_date, state_id, primary_collector_id, founder_id, trees_collected_from, environmental_notes, field_notes, processing_start_date, subset_weight, subset_count, est_seed_count, cut_test_seeds_filled, cut_test_seeds_empty, cut_test_seeds_compromised, drying_start_date, drying_end_date, drying_move_date, processing_notes, storage_start_date, storage_packets, storage_location_id, storage_notes, family_id, created_time, processing_method_id, target_storage_condition, processing_staff_responsible, collection_site_name, collection_site_landowner, storage_staff_responsible, latest_germination_recording_date, latest_viability_percent, total_viability_percent, species_endangered_type_id, rare_type_id, source_plant_origin_id, nursery_start_date, remaining_grams, remaining_quantity, remaining_units_id, subset_weight_grams, subset_weight_quantity, subset_weight_units_id, total_grams, total_quantity, total_units_id, checked_in_time) FROM stdin;
1000	100	\N	XYZ	10000	\N	\N	30	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20000	2021-01-03 07:31:20-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1001	100	\N	ABCDEFG	10001	\N	\N	20	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20000	2021-01-10 05:08:11-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1002	100	1	AAF4D49R3E	10000	\N	\N	30	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20000	2021-01-03 07:31:20-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: app_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_devices (id, app_build, app_name, brand, created_time, model, name, os_type, os_version, unique_id) FROM stdin;
1	\N	cel	\N	2021-02-12 09:21:33.62729-08	\N	\N	\N	\N	\N
\.


--
-- Data for Name: automations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automations (id, facility_id, name, description, created_time, modified_time, configuration) FROM stdin;
\.


--
-- Data for Name: bags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bags (id, accession_id, bag_number) FROM stdin;
1001	1002	ABCD001237
1002	1002	ABCD001238
\.


--
-- Data for Name: collectors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.collectors (id, facility_id, name, notes) FROM stdin;
\.


--
-- Data for Name: conservation_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conservation_statuses (id, name) FROM stdin;
CD	Conservation Dependent
CR	Critically endangered
DD	Data deficient
EN	Endangered
EW	Extinct in the wild
EX	Extinct
LC	Least concern
NE	Not evaluated
NT	Near threatened
VU	Vulnerable
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.devices (id, facility_id, name, device_type, make, model, protocol, address, port, polling_interval, enabled, settings, parent_id) FROM stdin;
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facilities (id, site_id, type_id, name, latitude, longitude, enabled) FROM stdin;
100	10	1	Seed Bank	\N	\N	t
101	10	1	garage	\N	\N	t
\.


--
-- Data for Name: facility_alert_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facility_alert_recipients (id, facility_id, email) FROM stdin;
\.


--
-- Data for Name: facility_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facility_types (id, name) FROM stdin;
1	Seed Bank
2	Desalination
3	Reverse Osmosis
\.


--
-- Data for Name: families; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.families (id, name, created_time, modified_time, is_scientific) FROM stdin;
20000	Dogwood	2021-01-03 05:08:11-08	2021-01-03 05:08:11-08	f
\.


--
-- Data for Name: family_names; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_names (id, family_id, name, locale, created_time, modified_time, is_scientific) FROM stdin;
1	20000	Dogwood	\N	2021-01-03 05:08:11-08	2021-01-03 05:08:11-08	f
\.


--
-- Data for Name: feature_photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feature_photos (photo_id, feature_id, plant_observation_id) FROM stdin;
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.features (id, layer_id, gps_horiz_accuracy, gps_vert_accuracy, attrib, notes, entered_time, created_time, modified_time, geom) FROM stdin;
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
\.


--
-- Data for Name: geolocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.geolocations (id, accession_id, created_time, latitude, longitude, gps_accuracy) FROM stdin;
1001	1002	2021-02-12 09:21:33.62729-08	9.0300000	-79.5300000	\N
\.


--
-- Data for Name: germination_seed_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.germination_seed_types (id, name) FROM stdin;
1	Fresh
2	Stored
\.


--
-- Data for Name: germination_substrates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.germination_substrates (id, name) FROM stdin;
1	Nursery Media
2	Agar Petri Dish
3	Paper Petri Dish
4	Other
\.


--
-- Data for Name: germination_test_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.germination_test_types (id, name) FROM stdin;
1	Lab
2	Nursery
\.


--
-- Data for Name: germination_tests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.germination_tests (id, accession_id, test_type, start_date, seed_type_id, substrate_id, treatment_id, seeds_sown, notes, staff_responsible, total_seeds_germinated, total_percent_germinated, end_date, remaining_grams, remaining_quantity, remaining_units_id) FROM stdin;
\.


--
-- Data for Name: germination_treatments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.germination_treatments (id, name) FROM stdin;
1	Soak
2	Scarify
3	GA3
4	Stratification
5	Other
\.


--
-- Data for Name: germinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.germinations (id, test_id, recording_date, seeds_germinated) FROM stdin;
\.


--
-- Data for Name: health_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.health_states (id, name) FROM stdin;
1	Good
2	Moderate
3	Poor
4	Dead
\.


--
-- Data for Name: layer_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.layer_types (id, name) FROM stdin;
10	Aerial Photos
20	Surface Color Map
30	Terrain Color Map
110	Boundaries
120	Plants Planted
130	Plants Existing
140	Irrigation
150	Infrastructure
160	Partner Input
170	Restoration Zones
180	Site Prep
190	Map notes
\.


--
-- Data for Name: layers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.layers (id, site_id, layer_type_id, tile_set_name, proposed, hidden, deleted, created_time, modified_time) FROM stdin;
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_types (id, name) FROM stdin;
1	Alert
2	State
3	Date
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, site_id, type_id, accession_id, created_time, read, message, accession_state_id) FROM stdin;
100000	10	1	\N	2021-01-01 03:22:33-08	f	This is an example alert	\N
100001	10	3	1000	2021-01-15 00:01:00-08	f	Accession XYZ has exploded!	\N
100002	10	2	\N	2021-01-25 00:05:00-08	f	Accessions are pending!	10
100003	10	2	\N	2021-01-25 00:05:01-08	f	Accessions are processing!	20
100004	10	2	\N	2021-01-25 00:05:02-08	f	Accessions are processed!	30
100005	10	2	\N	2021-01-25 00:05:03-08	f	Accessions are drying!	40
100006	10	2	\N	2021-01-25 00:05:04-08	f	Accessions are dried!	50
100007	10	2	\N	2021-01-25 00:05:05-08	f	Accessions are in storage!	60
100008	10	2	\N	2021-01-25 00:05:06-08	f	Accessions are withdrawn!	70
100009	10	3	1001	2021-01-27 00:00:00-08	f	Accession ABCDEFG needs help!	\N
\.


--
-- Data for Name: organization_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_users (user_id, organization_id, role_id, created_time, modified_time) FROM stdin;
1	1	4	2021-12-15 09:59:59.072725-08	2021-12-15 09:59:59.072725-08
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, location, created_time, modified_time, disabled_time) FROM stdin;
1	Terraformation (staging)	\N	2021-12-15 09:59:59.072094-08	2021-12-15 09:59:59.072094-08	\N
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.photos (id, heading, orientation, captured_time, file_name, content_type, size, created_time, modified_time, user_id, gps_horiz_accuracy, gps_vert_accuracy, storage_url, location) FROM stdin;
1001	\N	\N	2021-02-03 03:33:44-08	accession1.jpg	image/jpeg	6441	2021-02-12 10:36:15.842405-08	2021-02-12 10:36:15.842405-08	\N	\N	\N	file:///100/A/A/F/AAF4D49R3E/accession1.jpg	\N
1002	\N	\N	2021-02-03 03:33:44-08	accession2.jpg	image/jpeg	6539	2021-02-12 10:36:15.903768-08	2021-02-12 10:36:15.903768-08	\N	\N	\N	file:///100/A/A/F/AAF4D49R3E/accession2.jpg	\N
\.


--
-- Data for Name: plant_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plant_forms (id, name) FROM stdin;
1	Tree
2	Shrub
3	Vine
4	Liana
5	Herbaceous
\.


--
-- Data for Name: plant_observations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plant_observations (id, feature_id, "timestamp", health_state_id, flowers, seeds, pests, height, dbh, created_time, modified_time) FROM stdin;
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plants (feature_id, label, species_id, natural_regen, date_planted) FROM stdin;
\.


--
-- Data for Name: processing_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.processing_methods (id, name) FROM stdin;
1	Count
2	Weight
\.


--
-- Data for Name: project_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_statuses (id, name) FROM stdin;
\.


--
-- Data for Name: project_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_types (id, name) FROM stdin;
\.


--
-- Data for Name: project_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_users (user_id, project_id, created_time, modified_time) FROM stdin;
1	10	2021-12-15 09:59:59.074709-08	2021-12-15 09:59:59.074709-08
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, organization_id, name, description, location, type_id, status_id, start_date, end_date, created_time, modified_time, disabled_time, pm_user_id) FROM stdin;
10	1	Seed Bank	\N	\N	\N	\N	\N	\N	2021-12-15 09:59:59.073925-08	2021-12-15 09:59:59.073925-08	\N	\N
\.


--
-- Data for Name: rare_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rare_types (id, name) FROM stdin;
0	No
1	Yes
2	Unsure
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
1	Contributor
2	Manager
3	Admin
4	Owner
\.


--
-- Data for Name: seed_quantity_units; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seed_quantity_units (id, name) FROM stdin;
1	Seeds
2	Grams
3	Milligrams
4	Kilograms
5	Ounces
6	Pounds
\.


--
-- Data for Name: sites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sites (id, name, locale, timezone, enabled, project_id, location, created_time, modified_time) FROM stdin;
10	Seed Bank	en-US	US/Pacific	t	10	01010000A0110F00002C2CB81FF074374025581CCEFCB058C00000000000000000	2021-12-15 09:59:59.075471-08	2021-12-15 09:59:59.075471-08
\.


--
-- Data for Name: source_plant_origins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.source_plant_origins (id, name) FROM stdin;
1	Wild
2	Outplant
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species (id, created_time, modified_time, name, family_id, plant_form_id, conservation_status_id, rare_type_id, native_range, tsn, is_scientific) FROM stdin;
10000	2021-12-15 09:59:59.135505-08	2021-12-15 09:59:59.135505-08	Kousa Dogwood	\N	\N	\N	\N	\N	\N	f
10001	2021-12-15 09:59:59.135505-08	2021-12-15 09:59:59.135505-08	Other Dogwood	\N	\N	\N	\N	\N	\N	f
\.


--
-- Data for Name: species_endangered_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_endangered_types (id, name) FROM stdin;
0	No
1	Yes
2	Unsure
\.


--
-- Data for Name: species_names; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_names (id, species_id, organization_id, name, is_scientific, locale, created_time, modified_time) FROM stdin;
1	10000	\N	Kousa Dogwood	f	\N	2021-12-15 09:59:59.135505-08	2021-12-15 09:59:59.135505-08
2	10001	\N	Other Dogwood	f	\N	2021-12-15 09:59:59.135505-08	2021-12-15 09:59:59.135505-08
\.


--
-- Data for Name: species_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species_options (id, species_id, organization_id, project_id, site_id, created_time, modified_time) FROM stdin;
\.


--
-- Data for Name: spring_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spring_session (primary_id, session_id, creation_time, last_access_time, max_inactive_interval, expiry_time, principal_name) FROM stdin;
b84131c0-7bee-4363-827e-291becc06698	276714ad-ab0a-48aa-8ef8-db65ec2e950a	1632267607787	1632267674313	315360000	3000000000000	0d04525c-7933-4cec-9647-7b6ac2642838
\.


--
-- Data for Name: spring_session_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spring_session_attributes (session_primary_id, attribute_name, attribute_bytes) FROM stdin;
b84131c0-7bee-4363-827e-291becc06698	SPRING_SECURITY_CONTEXT	\\xaced00057372003d6f72672e737072696e676672616d65776f726b2e73656375726974792e636f72652e636f6e746578742e5365637572697479436f6e74657874496d706c00000000000002300200014c000e61757468656e7469636174696f6e7400324c6f72672f737072696e676672616d65776f726b2f73656375726974792f636f72652f41757468656e7469636174696f6e3b7870737200466f72672e6b6579636c6f616b2e61646170746572732e737072696e6773656375726974792e746f6b656e2e4b6579636c6f616b41757468656e7469636174696f6e546f6b656eda86957eca6a83df0200025a000b696e7465726163746976654c00097072696e636970616c7400194c6a6176612f73656375726974792f5072696e636970616c3b787200476f72672e737072696e676672616d65776f726b2e73656375726974792e61757468656e7469636174696f6e2e416273747261637441757468656e7469636174696f6e546f6b656ed3aa287e6e47640e0200035a000d61757468656e746963617465644c000b617574686f7269746965737400164c6a6176612f7574696c2f436f6c6c656374696f6e3b4c000764657461696c737400124c6a6176612f6c616e672f4f626a6563743b787001737200266a6176612e7574696c2e436f6c6c656374696f6e7324556e6d6f6469666961626c654c697374fc0f2531b5ec8e100200014c00046c6973747400104c6a6176612f7574696c2f4c6973743b7872002c6a6176612e7574696c2e436f6c6c656374696f6e7324556e6d6f6469666961626c65436f6c6c656374696f6e19420080cb5ef71e0200014c00016371007e00067870737200136a6176612e7574696c2e41727261794c6973747881d21d99c7619d03000149000473697a65787000000002770400000002737200396f72672e6b6579636c6f616b2e61646170746572732e737072696e6773656375726974792e6163636f756e742e4b6579636c6f616b526f6c65e5b7a8aba8a1b6330200014c0004726f6c657400124c6a6176612f6c616e672f537472696e673b787074000e6f66666c696e655f6163636573737371007e000f740011756d615f617574686f72697a6174696f6e7871007e000e737200426f72672e6b6579636c6f616b2e61646170746572732e737072696e6773656375726974792e6163636f756e742e53696d706c654b6579636c6f616b4163636f756e74ea2aacae4326d7000200034c00097072696e636970616c71007e00044c0005726f6c657374000f4c6a6176612f7574696c2f5365743b4c000f7365637572697479436f6e7465787474003a4c6f72672f6b6579636c6f616b2f61646170746572732f5265667265736861626c654b6579636c6f616b5365637572697479436f6e746578743b78707372001e6f72672e6b6579636c6f616b2e4b6579636c6f616b5072696e636970616c87bb732ef1ba8cde0200024c0007636f6e746578747400264c6f72672f6b6579636c6f616b2f4b6579636c6f616b5365637572697479436f6e746578743b4c00046e616d6571007e00107870737200386f72672e6b6579636c6f616b2e61646170746572732e5265667265736861626c654b6579636c6f616b5365637572697479436f6e7465787466f37797d76b64c00200014c000c72656672657368546f6b656e71007e0010787200246f72672e6b6579636c6f616b2e4b6579636c6f616b5365637572697479436f6e74657874f4f6350ff310d0110300024c000d6964546f6b656e537472696e6771007e00104c000b746f6b656e537472696e6771007e00107870707400242e65794a75596d59694f6a4173496d6c68644349364d5459304d44417a4e6a45784d3330787074002430643034353235632d373933332d346365632d393634372d3762366163323634323833387372001b6b6f746c696e2e636f6c6c656374696f6e732e456d7074795365742f46b01576d7e2f4020000787071007e001e0171007e001b
\.


--
-- Data for Name: storage_conditions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.storage_conditions (id, name) FROM stdin;
1	Refrigerator
2	Freezer
\.


--
-- Data for Name: storage_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.storage_locations (id, facility_id, name, condition_id, enabled) FROM stdin;
1000	100	Refrigerator 1	1	t
1001	100	Freezer 1	2	t
1002	100	Freezer 2	2	t
\.


--
-- Data for Name: task_processed_times; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_processed_times (name, processed_up_to, started_time) FROM stdin;
AccessionScheduledStateTask	2021-12-15 09:59:43.592828-08	\N
DateNotificationTask	2021-12-15 09:59:43.622319-08	\N
StateSummaryNotificationTask	2021-12-15 09:59:43.627374-08	\N
\.


--
-- Data for Name: test_clock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_clock (fake_time, real_time) FROM stdin;
2021-12-15 09:59:42.568389-08	2021-12-15 09:59:42.568389-08
\.


--
-- Data for Name: thumbnails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.thumbnails (id, photo_id, width, height, content_type, created_time, size, storage_url) FROM stdin;
\.


--
-- Data for Name: timeseries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timeseries (id, type_id, device_id, name, units, decimal_places) FROM stdin;
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
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_types (id, name) FROM stdin;
1	Individual
2	Super Admin
3	API Client
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, auth_id, email, first_name, last_name, created_time, modified_time, user_type_id) FROM stdin;
1	0d04525c-7933-4cec-9647-7b6ac2642838	nobody@terraformation.com	Test	User	2021-12-15 09:59:59.069723-08	2021-12-15 09:59:59.069723-08	1
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdrawal_purposes (id, name) FROM stdin;
1	Propagation
2	Outreach or Education
3	Research
4	Broadcast
5	Share with Another Site
6	Other
7	Germination Testing
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdrawals (id, accession_id, date, purpose_id, destination, staff_responsible, created_time, updated_time, notes, germination_test_id, remaining_grams, remaining_quantity, remaining_units_id, withdrawn_grams, withdrawn_quantity, withdrawn_units_id) FROM stdin;
\.


--
-- Name: accession_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accession_id_seq', 1, false);


--
-- Name: accession_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accession_number_seq', 1, false);


--
-- Name: app_device_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_device_id_seq', 1, false);


--
-- Name: automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.automations_id_seq', 1, false);


--
-- Name: bag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bag_id_seq', 1003, false);


--
-- Name: collection_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.collection_event_id_seq', 1002, false);


--
-- Name: collector_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.collector_id_seq', 1, false);


--
-- Name: device_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.device_id_seq', 1, false);


--
-- Name: facility_alert_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.facility_alert_recipients_id_seq', 1, false);


--
-- Name: family_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.family_id_seq', 20001, false);


--
-- Name: family_names_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.family_names_id_seq', 2, false);


--
-- Name: features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.features_id_seq', 1, false);


--
-- Name: germination_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.germination_id_seq', 1, false);


--
-- Name: germination_seed_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.germination_seed_type_id_seq', 1, false);


--
-- Name: germination_substrate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.germination_substrate_id_seq', 1, false);


--
-- Name: germination_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.germination_test_id_seq', 1, false);


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.germination_treatment_id_seq', 1, false);


--
-- Name: layers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.layers_id_seq', 1, false);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_id_seq', 100010, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 2, false);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.photos_id_seq', 1003, false);


--
-- Name: plant_observations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.plant_observations_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 11, false);


--
-- Name: site_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_id_seq', 11, false);


--
-- Name: site_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_module_id_seq', 102, false);


--
-- Name: species_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_id_seq', 10002, false);


--
-- Name: species_names_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_names_id_seq', 3, false);


--
-- Name: species_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_options_id_seq', 1, false);


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
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, false);


--
-- Name: withdrawal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.withdrawal_id_seq', 1, false);


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.withdrawal_purpose_id_seq', 1, false);


--
-- Name: accession_germination_test_types accession_germination_test_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_germination_test_types
    ADD CONSTRAINT accession_germination_test_type_pkey PRIMARY KEY (accession_id, germination_test_type_id);


--
-- Name: accessions accession_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_number_unique UNIQUE (number);


--
-- Name: accession_photos accession_photos_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_photos
    ADD CONSTRAINT accession_photos_pk PRIMARY KEY (photo_id);


--
-- Name: accessions accession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_pkey PRIMARY KEY (id);


--
-- Name: accession_secondary_collectors accession_secondary_collector_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_secondary_collectors
    ADD CONSTRAINT accession_secondary_collector_pkey PRIMARY KEY (accession_id, collector_id);


--
-- Name: accession_states accession_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_states
    ADD CONSTRAINT accession_state_pkey PRIMARY KEY (id);


--
-- Name: app_devices app_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_devices
    ADD CONSTRAINT app_device_pkey PRIMARY KEY (id);


--
-- Name: app_devices app_device_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_devices
    ADD CONSTRAINT app_device_unique UNIQUE (app_build, app_name, brand, model, name, os_type, os_version, unique_id);


--
-- Name: automations automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_pkey PRIMARY KEY (id);


--
-- Name: bags bag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bags
    ADD CONSTRAINT bag_pkey PRIMARY KEY (id);


--
-- Name: geolocations collection_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocations
    ADD CONSTRAINT collection_event_pkey PRIMARY KEY (id);


--
-- Name: collectors collector_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collectors
    ADD CONSTRAINT collector_pkey PRIMARY KEY (id);


--
-- Name: conservation_statuses conservation_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conservation_statuses
    ADD CONSTRAINT conservation_statuses_name_key UNIQUE (name);


--
-- Name: conservation_statuses conservation_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conservation_statuses
    ADD CONSTRAINT conservation_statuses_pkey PRIMARY KEY (id);


--
-- Name: devices device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- Name: facility_alert_recipients facility_alert_recipients_facility_id_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facility_alert_recipients
    ADD CONSTRAINT facility_alert_recipients_facility_id_email_key UNIQUE (facility_id, email);


--
-- Name: facility_alert_recipients facility_alert_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facility_alert_recipients
    ADD CONSTRAINT facility_alert_recipients_pkey PRIMARY KEY (id);


--
-- Name: family_names family_names_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_names
    ADD CONSTRAINT family_names_pkey PRIMARY KEY (id);


--
-- Name: family_names family_names_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_names
    ADD CONSTRAINT family_names_unique UNIQUE (family_id, name);


--
-- Name: CONSTRAINT family_names_unique ON family_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT family_names_unique ON public.family_names IS 'Disallow duplicate names for the same family.';


--
-- Name: feature_photos feature_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_photos
    ADD CONSTRAINT feature_photos_pkey PRIMARY KEY (photo_id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: germinations germination_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germinations
    ADD CONSTRAINT germination_pkey PRIMARY KEY (id);


--
-- Name: germination_seed_types germination_seed_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_seed_types
    ADD CONSTRAINT germination_seed_type_pkey PRIMARY KEY (id);


--
-- Name: germination_substrates germination_substrate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_substrates
    ADD CONSTRAINT germination_substrate_pkey PRIMARY KEY (id);


--
-- Name: germination_tests germination_test_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_pkey PRIMARY KEY (id);


--
-- Name: germination_test_types germination_test_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_test_types
    ADD CONSTRAINT germination_test_type_name_key UNIQUE (name);


--
-- Name: germination_test_types germination_test_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_test_types
    ADD CONSTRAINT germination_test_type_pkey PRIMARY KEY (id);


--
-- Name: germination_treatments germination_treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_treatments
    ADD CONSTRAINT germination_treatment_pkey PRIMARY KEY (id);


--
-- Name: health_states health_states_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_states
    ADD CONSTRAINT health_states_name_key UNIQUE (name);


--
-- Name: health_states health_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_states
    ADD CONSTRAINT health_states_pkey PRIMARY KEY (id);


--
-- Name: layer_types layer_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layer_types
    ADD CONSTRAINT layer_types_name_key UNIQUE (name);


--
-- Name: layer_types layer_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layer_types
    ADD CONSTRAINT layer_types_pkey PRIMARY KEY (id);


--
-- Name: layers layers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_pkey PRIMARY KEY (id);


--
-- Name: notifications notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_type_name_key UNIQUE (name);


--
-- Name: notification_types notification_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_type_pkey PRIMARY KEY (id);


--
-- Name: organizations organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization_users organization_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_pkey PRIMARY KEY (user_id, organization_id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: photos photos_storage_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_storage_url_key UNIQUE (storage_url);


--
-- Name: plant_forms plant_forms_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_forms
    ADD CONSTRAINT plant_forms_name_key UNIQUE (name);


--
-- Name: plant_forms plant_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_forms
    ADD CONSTRAINT plant_forms_pkey PRIMARY KEY (id);


--
-- Name: plant_observations plant_observations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_observations
    ADD CONSTRAINT plant_observations_pkey PRIMARY KEY (id);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (feature_id);


--
-- Name: processing_methods processing_method_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_methods
    ADD CONSTRAINT processing_method_name_key UNIQUE (name);


--
-- Name: processing_methods processing_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processing_methods
    ADD CONSTRAINT processing_method_pkey PRIMARY KEY (id);


--
-- Name: project_statuses project_statuses_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_name_key UNIQUE (name);


--
-- Name: project_statuses project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (id);


--
-- Name: project_types project_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_name_key UNIQUE (name);


--
-- Name: project_types project_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (user_id, project_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


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
-- Name: seed_quantity_units seed_quantity_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seed_quantity_units
    ADD CONSTRAINT seed_quantity_units_pkey PRIMARY KEY (id);


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
-- Name: sites site_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT site_pkey PRIMARY KEY (id);


--
-- Name: source_plant_origins source_plant_origin_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_plant_origins
    ADD CONSTRAINT source_plant_origin_name_key UNIQUE (name);


--
-- Name: source_plant_origins source_plant_origin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.source_plant_origins
    ADD CONSTRAINT source_plant_origin_pkey PRIMARY KEY (id);


--
-- Name: species_endangered_types species_endangered_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_endangered_types
    ADD CONSTRAINT species_endangered_type_pkey PRIMARY KEY (id);


--
-- Name: families species_family_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT species_family_name_key UNIQUE (name);


--
-- Name: families species_family_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT species_family_pkey PRIMARY KEY (id);


--
-- Name: species species_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_name_key UNIQUE (name);


--
-- Name: species_names species_names_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_names
    ADD CONSTRAINT species_names_pkey PRIMARY KEY (id);


--
-- Name: species_names species_names_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_names
    ADD CONSTRAINT species_names_unique UNIQUE (species_id, name);


--
-- Name: CONSTRAINT species_names_unique ON species_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT species_names_unique ON public.species_names IS 'Disallow duplicate names for the same species.';


--
-- Name: species_options species_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_options
    ADD CONSTRAINT species_options_pkey PRIMARY KEY (id);


--
-- Name: species species_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (id);


--
-- Name: rare_types species_rare_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rare_types
    ADD CONSTRAINT species_rare_type_pkey PRIMARY KEY (id);


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
-- Name: storage_conditions storage_condition_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_conditions
    ADD CONSTRAINT storage_condition_name_key UNIQUE (name);


--
-- Name: storage_conditions storage_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_conditions
    ADD CONSTRAINT storage_condition_pkey PRIMARY KEY (id);


--
-- Name: storage_locations storage_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_location_pkey PRIMARY KEY (id);


--
-- Name: task_processed_times task_processed_time_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_processed_times
    ADD CONSTRAINT task_processed_time_pkey PRIMARY KEY (name);


--
-- Name: thumbnails thumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_pkey PRIMARY KEY (id);


--
-- Name: thumbnails thumbnails_unique_height; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_height UNIQUE (photo_id, height);


--
-- Name: thumbnails thumbnails_unique_storage_url; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_storage_url UNIQUE (storage_url);


--
-- Name: thumbnails thumbnails_unique_width; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnails_unique_width UNIQUE (photo_id, width);


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
-- Name: withdrawals withdrawal_germination_test_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_germination_test_id_unique UNIQUE (germination_test_id);


--
-- Name: withdrawals withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_purposes withdrawal_purpose_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_purposes
    ADD CONSTRAINT withdrawal_purpose_pkey PRIMARY KEY (id);


--
-- Name: accession__number_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accession__number_trgm ON public.accessions USING gin (number public.gin_trgm_ops);


--
-- Name: accession__received_date_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accession__received_date_ix ON public.accessions USING btree (received_date);


--
-- Name: accession_created_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accession_created_time_idx ON public.accessions USING btree (created_time);


--
-- Name: accession_secondary_collector_collector_id_accession_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX accession_secondary_collector_collector_id_accession_id_idx ON public.accession_secondary_collectors USING btree (collector_id, accession_id);


--
-- Name: accession_state_history_accession_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accession_state_history_accession_id_idx ON public.accession_state_history USING btree (accession_id);


--
-- Name: accession_state_history_new_state_id_updated_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX accession_state_history_new_state_id_updated_time_idx ON public.accession_state_history USING btree (new_state_id, updated_time);


--
-- Name: automations_facility_id_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automations_facility_id_name_idx ON public.automations USING btree (facility_id, name);


--
-- Name: feature_photos_feature_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX feature_photos_feature_id_idx ON public.feature_photos USING btree (feature_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: geolocation__accession_id_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX geolocation__accession_id_ix ON public.geolocations USING btree (accession_id);


--
-- Name: germination__test_id_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX germination__test_id_ix ON public.germinations USING btree (test_id);


--
-- Name: germination_test__accession_id_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX germination_test__accession_id_ix ON public.germination_tests USING btree (accession_id);


--
-- Name: species_created_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_created_time_idx ON public.species USING btree (created_time);


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
-- Name: withdrawal__accession_id_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX withdrawal__accession_id_ix ON public.withdrawals USING btree (accession_id);


--
-- Name: withdrawal__date_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX withdrawal__date_ix ON public.withdrawals USING btree (date);


--
-- Name: accessions accession_app_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_app_device_id_fkey FOREIGN KEY (app_device_id) REFERENCES public.app_devices(id);


--
-- Name: accession_germination_test_types accession_germination_test_type_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_germination_test_types
    ADD CONSTRAINT accession_germination_test_type_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: accession_germination_test_types accession_germination_test_type_germination_test_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_germination_test_types
    ADD CONSTRAINT accession_germination_test_type_germination_test_type_id_fkey FOREIGN KEY (germination_test_type_id) REFERENCES public.germination_test_types(id);


--
-- Name: accession_photos accession_photo_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_photos
    ADD CONSTRAINT accession_photo_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: accession_photos accession_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_photos
    ADD CONSTRAINT accession_photos_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id);


--
-- Name: accessions accession_primary_collector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_primary_collector_id_fkey FOREIGN KEY (primary_collector_id) REFERENCES public.collectors(id);


--
-- Name: accessions accession_processing_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_processing_method_id_fkey FOREIGN KEY (processing_method_id) REFERENCES public.processing_methods(id);


--
-- Name: accessions accession_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES public.seed_quantity_units(id);


--
-- Name: accession_secondary_collectors accession_secondary_collector_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_secondary_collectors
    ADD CONSTRAINT accession_secondary_collector_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: accession_secondary_collectors accession_secondary_collector_collector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_secondary_collectors
    ADD CONSTRAINT accession_secondary_collector_collector_id_fkey FOREIGN KEY (collector_id) REFERENCES public.collectors(id);


--
-- Name: accessions accession_site_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_site_module_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: accessions accession_source_plant_origin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_source_plant_origin_id_fkey FOREIGN KEY (source_plant_origin_id) REFERENCES public.source_plant_origins(id);


--
-- Name: accessions accession_species_endangered_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_species_endangered_type_id_fkey FOREIGN KEY (species_endangered_type_id) REFERENCES public.species_endangered_types(id);


--
-- Name: accessions accession_species_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_species_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id);


--
-- Name: accessions accession_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: accessions accession_species_rare_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_species_rare_type_id_fkey FOREIGN KEY (rare_type_id) REFERENCES public.rare_types(id);


--
-- Name: accession_state_history accession_state_history_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_state_history
    ADD CONSTRAINT accession_state_history_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: accession_state_history accession_state_history_new_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_state_history
    ADD CONSTRAINT accession_state_history_new_state_id_fkey FOREIGN KEY (new_state_id) REFERENCES public.accession_states(id);


--
-- Name: accession_state_history accession_state_history_old_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accession_state_history
    ADD CONSTRAINT accession_state_history_old_state_id_fkey FOREIGN KEY (old_state_id) REFERENCES public.accession_states(id);


--
-- Name: accessions accession_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.accession_states(id);


--
-- Name: accessions accession_storage_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_storage_location_id_fkey FOREIGN KEY (storage_location_id) REFERENCES public.storage_locations(id);


--
-- Name: accessions accession_subset_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_subset_weight_units_id_fkey FOREIGN KEY (subset_weight_units_id) REFERENCES public.seed_quantity_units(id);


--
-- Name: accessions accession_target_storage_condition_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_target_storage_condition_fkey FOREIGN KEY (target_storage_condition) REFERENCES public.storage_conditions(id);


--
-- Name: accessions accession_total_units_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accessions
    ADD CONSTRAINT accession_total_units_id_fkey FOREIGN KEY (total_units_id) REFERENCES public.seed_quantity_units(id);


--
-- Name: automations automations_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automations
    ADD CONSTRAINT automations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: bags bag_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bags
    ADD CONSTRAINT bag_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: geolocations collection_event_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geolocations
    ADD CONSTRAINT collection_event_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: collectors collector_site_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collectors
    ADD CONSTRAINT collector_site_module_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: devices device_site_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT device_site_module_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: devices devices_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.devices(id);


--
-- Name: facility_alert_recipients facility_alert_recipients_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facility_alert_recipients
    ADD CONSTRAINT facility_alert_recipients_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: family_names family_names_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_names
    ADD CONSTRAINT family_names_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id);


--
-- Name: feature_photos feature_photos_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_photos
    ADD CONSTRAINT feature_photos_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id);


--
-- Name: feature_photos feature_photos_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_photos
    ADD CONSTRAINT feature_photos_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id);


--
-- Name: feature_photos feature_photos_plant_observation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feature_photos
    ADD CONSTRAINT feature_photos_plant_observation_id_fkey FOREIGN KEY (plant_observation_id) REFERENCES public.plant_observations(id);


--
-- Name: features features_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_layer_id_fkey FOREIGN KEY (layer_id) REFERENCES public.layers(id);


--
-- Name: germination_tests germination_test_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: germinations germination_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germinations
    ADD CONSTRAINT germination_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.germination_tests(id);


--
-- Name: germination_tests germination_test_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES public.seed_quantity_units(id);


--
-- Name: germination_tests germination_test_seed_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_seed_type_id_fkey FOREIGN KEY (seed_type_id) REFERENCES public.germination_seed_types(id);


--
-- Name: germination_tests germination_test_substrate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_substrate_id_fkey FOREIGN KEY (substrate_id) REFERENCES public.germination_substrates(id);


--
-- Name: germination_tests germination_test_test_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_test_type_fkey FOREIGN KEY (test_type) REFERENCES public.germination_test_types(id);


--
-- Name: germination_tests germination_test_treatment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.germination_tests
    ADD CONSTRAINT germination_test_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.germination_treatments(id);


--
-- Name: layers layers_layer_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_layer_type_id_fkey FOREIGN KEY (layer_type_id) REFERENCES public.layer_types(id);


--
-- Name: layers layers_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: notifications notification_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notification_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: notifications notification_accession_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notification_accession_state_id_fkey FOREIGN KEY (accession_state_id) REFERENCES public.accession_states(id);


--
-- Name: notifications notification_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notification_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: notifications notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notification_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.notification_types(id);


--
-- Name: organization_users organization_users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_users
    ADD CONSTRAINT organization_users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


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
-- Name: photos photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: plant_observations plant_observations_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_observations
    ADD CONSTRAINT plant_observations_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.plants(feature_id);


--
-- Name: plant_observations plant_observations_health_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plant_observations
    ADD CONSTRAINT plant_observations_health_state_id_fkey FOREIGN KEY (health_state_id) REFERENCES public.health_states(id);


--
-- Name: plants plants_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id);


--
-- Name: plants plants_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: project_users project_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_users project_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects projects_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: projects projects_pm_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pm_user_id_fkey FOREIGN KEY (pm_user_id) REFERENCES public.users(id);


--
-- Name: projects projects_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.project_statuses(id);


--
-- Name: projects projects_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.project_types(id);


--
-- Name: facilities site_module_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: facilities site_module_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.facility_types(id);


--
-- Name: sites sites_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: species species_conservation_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_conservation_status_id_fkey FOREIGN KEY (conservation_status_id) REFERENCES public.conservation_statuses(id);


--
-- Name: species species_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id);


--
-- Name: species_names species_names_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_names
    ADD CONSTRAINT species_names_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: species_names species_names_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_names
    ADD CONSTRAINT species_names_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: species_options species_options_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_options
    ADD CONSTRAINT species_options_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: species_options species_options_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_options
    ADD CONSTRAINT species_options_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: species_options species_options_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_options
    ADD CONSTRAINT species_options_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: species_options species_options_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species_options
    ADD CONSTRAINT species_options_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- Name: species species_plant_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_plant_form_id_fkey FOREIGN KEY (plant_form_id) REFERENCES public.plant_forms(id);


--
-- Name: species species_rare_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_rare_type_id_fkey FOREIGN KEY (rare_type_id) REFERENCES public.rare_types(id);


--
-- Name: spring_session_attributes spring_session_attributes_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES public.spring_session(primary_id) ON DELETE CASCADE;


--
-- Name: storage_locations storage_location_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_location_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.storage_conditions(id);


--
-- Name: storage_locations storage_location_site_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_location_site_module_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: thumbnails thumbnail_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id);


--
-- Name: timeseries timeseries_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: timeseries timeseries_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries
    ADD CONSTRAINT timeseries_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.timeseries_types(id);


--
-- Name: timeseries_values timeseries_value_timeseries_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeseries_values
    ADD CONSTRAINT timeseries_value_timeseries_id_fkey FOREIGN KEY (timeseries_id) REFERENCES public.timeseries(id);


--
-- Name: users users_user_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_type_id_fkey FOREIGN KEY (user_type_id) REFERENCES public.user_types(id);


--
-- Name: withdrawals withdrawal_accession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_accession_id_fkey FOREIGN KEY (accession_id) REFERENCES public.accessions(id);


--
-- Name: withdrawals withdrawal_germination_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_germination_test_id_fkey FOREIGN KEY (germination_test_id) REFERENCES public.germination_tests(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawal_purpose_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_purpose_id_fkey FOREIGN KEY (purpose_id) REFERENCES public.withdrawal_purposes(id);


--
-- Name: withdrawals withdrawal_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES public.seed_quantity_units(id);


--
-- Name: withdrawals withdrawal_withdrawn_units_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawal_withdrawn_units_id_fkey FOREIGN KEY (withdrawn_units_id) REFERENCES public.seed_quantity_units(id);


--
-- PostgreSQL database dump complete
--

