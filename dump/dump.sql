--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5 (Homebrew)
-- Dumped by pg_dump version 14.5 (Homebrew)

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
-- Name: nursery; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA nursery;


--
-- Name: seedbank; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA seedbank;


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
-- Name: batch_withdrawals; Type: TABLE; Schema: nursery; Owner: -
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
    CONSTRAINT batches_germinating_quantity_check CHECK ((germinating_quantity >= 0)),
    CONSTRAINT batches_latest_observed_germinating_quantity_check CHECK ((latest_observed_germinating_quantity >= 0)),
    CONSTRAINT batches_latest_observed_not_ready_quantity_check CHECK ((latest_observed_not_ready_quantity >= 0)),
    CONSTRAINT batches_latest_observed_ready_quantity_check CHECK ((latest_observed_ready_quantity >= 0)),
    CONSTRAINT batches_not_ready_quantity_check CHECK ((not_ready_quantity >= 0)),
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
          WHERE (b.id = bw.batch_id)), (0)::bigint) AS total_quantity_withdrawn
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
    CONSTRAINT withdrawals_destination_only_for_transfers CHECK (((destination_facility_id IS NULL) OR (purpose_id = 1)))
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
    upper_threshold double precision
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
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    code text NOT NULL,
    name text NOT NULL,
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
    verbosity integer
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
    verbosity integer
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
    organization_id bigint NOT NULL
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
    threat_status text
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
    is_scientific boolean NOT NULL
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
    genus text
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
    country_code text
);


--
-- Name: TABLE gbif_vernacular_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gbif_vernacular_names IS 'Vernacular names for species and families. Part of the GBIF backbone dataset.';


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
    permanentlydeletejobsafter character varying(32)
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
    CONSTRAINT country_code_matches_subdivision CHECK (((country_subdivision_code IS NULL) OR (substr(country_subdivision_code, 1, 2) = country_code)))
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
-- Name: TABLE photos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.photos IS 'Generic information about individual photos. Photos are associated with application entities using linking tables such as `accession_photos`.';


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
    endangered boolean,
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
    initial_scientific_name text NOT NULL
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
    suggested_value text
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
    created_time timestamp with time zone DEFAULT now() NOT NULL,
    modified_time timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL,
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
    value text
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
    facility_id bigint
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
    deleted_time timestamp with time zone
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
-- Name: accession_collectors; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.accession_collectors (
    accession_id bigint NOT NULL,
    "position" integer NOT NULL,
    name text NOT NULL,
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
    is_manual_state boolean,
    latest_observed_quantity numeric,
    latest_observed_units_id integer,
    latest_observed_time timestamp with time zone,
    est_weight_grams numeric,
    est_weight_quantity numeric,
    est_weight_units_id integer,
    CONSTRAINT observed_quantity_must_have_time CHECK ((((latest_observed_quantity IS NOT NULL) AND (latest_observed_time IS NOT NULL)) OR ((latest_observed_quantity IS NULL) AND (latest_observed_time IS NULL)))),
    CONSTRAINT observed_quantity_must_have_units CHECK ((((latest_observed_quantity IS NOT NULL) AND (latest_observed_units_id IS NOT NULL)) OR ((latest_observed_quantity IS NULL) AND (latest_observed_units_id IS NULL)))),
    CONSTRAINT remaining_quantity_must_have_units CHECK ((((remaining_quantity IS NOT NULL) AND (remaining_units_id IS NOT NULL)) OR ((remaining_quantity IS NULL) AND (remaining_units_id IS NULL)))),
    CONSTRAINT subset_weight_quantity_must_have_units CHECK ((((subset_weight_quantity IS NOT NULL) AND (subset_weight_units_id IS NOT NULL)) OR ((subset_weight_quantity IS NULL) AND (subset_weight_units_id IS NULL)))),
    CONSTRAINT subset_weight_units_must_not_be_seeds CHECK (((subset_weight_units_id <> 1) OR (subset_weight_units_id IS NULL))),
    CONSTRAINT total_quantity_must_have_units CHECK ((((total_quantity IS NOT NULL) AND (total_units_id IS NOT NULL)) OR ((total_quantity IS NULL) AND (total_units_id IS NULL))))
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
-- Name: COLUMN accessions.target_storage_condition; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.target_storage_condition IS 'The intended storage condition of the accession as determined during initial processing.';


--
-- Name: COLUMN accessions.latest_viability_percent; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.latest_viability_percent IS 'Percent of seeds germinated in most recent viability test, or in cut test if no germinations exist yet';


--
-- Name: COLUMN accessions.total_viability_percent; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.total_viability_percent IS 'Percentage of viable seeds across all tests.';


--
-- Name: COLUMN accessions.nursery_start_date; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.accessions.nursery_start_date IS 'When the accession was moved to a nursery, or null if it is not in a nursery.';


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
    photo_id bigint NOT NULL
);


--
-- Name: TABLE accession_photos; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.accession_photos IS 'Linking table between `accessions` and `photos`.';


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
    remaining_units_id integer NOT NULL
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
    bag_number text
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
    remaining_grams numeric,
    remaining_quantity numeric NOT NULL,
    remaining_units_id integer NOT NULL,
    seeds_compromised integer,
    seeds_empty integer,
    seeds_filled integer
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
-- Name: viability_test_treatments; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.viability_test_treatments (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE viability_test_treatments; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.viability_test_treatments IS '(Enum) Techniques that can be used to treat seeds before testing them for viability.';


--
-- Name: germination_treatment_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.viability_test_treatments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.germination_treatment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: processing_methods; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.processing_methods (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE processing_methods; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.processing_methods IS '(Enum) Methods of counting seeds when processing accessions.';


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
-- Name: source_plant_origins; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.source_plant_origins (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE source_plant_origins; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.source_plant_origins IS '(Enum) Types of origins of plants from which seeds were collected. For example, "Outplant" represents a plant that was cultivated, as opposed to one growing in the wild.';


--
-- Name: storage_conditions; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.storage_conditions (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: TABLE storage_conditions; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.storage_conditions IS '(Enum) Refrigeration condition of seeds during storage.';


--
-- Name: storage_locations; Type: TABLE; Schema: seedbank; Owner: -
--

CREATE TABLE seedbank.storage_locations (
    id bigint NOT NULL,
    facility_id bigint NOT NULL,
    name text NOT NULL,
    condition_id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_time timestamp with time zone DEFAULT now() NOT NULL,
    modified_time timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint NOT NULL,
    modified_by bigint NOT NULL
);


--
-- Name: TABLE storage_locations; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON TABLE seedbank.storage_locations IS 'The available locations where seeds can be stored at a seed bank facility.';


--
-- Name: COLUMN storage_locations.name; Type: COMMENT; Schema: seedbank; Owner: -
--

COMMENT ON COLUMN seedbank.storage_locations.name IS 'E.g., Freezer 1, Freezer 2';


--
-- Name: storage_location_id_seq; Type: SEQUENCE; Schema: seedbank; Owner: -
--

ALTER TABLE seedbank.storage_locations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seedbank.storage_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
    remaining_grams numeric,
    remaining_quantity numeric NOT NULL,
    remaining_units_id integer NOT NULL,
    withdrawn_grams numeric,
    withdrawn_quantity numeric,
    withdrawn_units_id integer,
    estimated_count integer,
    estimated_weight_quantity numeric,
    estimated_weight_units_id integer,
    created_by bigint,
    withdrawn_by bigint,
    CONSTRAINT estimated_weight_must_have_units CHECK ((((estimated_weight_quantity IS NOT NULL) AND (estimated_weight_units_id IS NOT NULL)) OR ((estimated_weight_quantity IS NULL) AND (estimated_weight_units_id IS NULL)))),
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
-- Data for Name: batch_quantity_history; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_quantity_history (id, batch_id, history_type_id, created_by, created_time, germinating_quantity, not_ready_quantity, ready_quantity, withdrawal_id) FROM stdin;
\.


--
-- Data for Name: batch_quantity_history_types; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_quantity_history_types (id, name) FROM stdin;
1	Observed
2	Computed
\.


--
-- Data for Name: batch_withdrawals; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batch_withdrawals (batch_id, withdrawal_id, germinating_quantity_withdrawn, not_ready_quantity_withdrawn, ready_quantity_withdrawn, destination_batch_id) FROM stdin;
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.batches (id, version, organization_id, facility_id, species_id, batch_number, added_date, germinating_quantity, not_ready_quantity, ready_quantity, latest_observed_germinating_quantity, latest_observed_not_ready_quantity, latest_observed_ready_quantity, latest_observed_time, created_by, created_time, modified_by, modified_time, notes, ready_by_date, accession_id) FROM stdin;
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.withdrawal_purposes (id, name) FROM stdin;
1	Nursery Transfer
2	Dead
3	Out Plant
4	Other
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: nursery; Owner: -
--

COPY nursery.withdrawals (id, facility_id, purpose_id, withdrawn_date, created_by, created_time, modified_by, modified_time, destination_facility_id, notes) FROM stdin;
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
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.facilities (id, type_id, name, created_time, modified_time, created_by, modified_by, max_idle_minutes, last_timeseries_time, idle_after_time, idle_since_time, description, connection_state_id, organization_id) FROM stdin;
100	1	Seed Bank	2022-02-04 09:48:28.616331-08	2022-02-04 09:48:28.616331-08	1	1	30	\N	\N	2021-12-31 16:00:00-08	\N	1	1
101	1	garage	2022-02-04 09:48:28.616331-08	2022-02-04 09:48:28.616331-08	1	1	30	\N	\N	2021-12-31 16:00:00-08	\N	1	1
102	1	Test facility	2022-02-04 09:48:28.616331-08	2022-02-04 09:48:28.616331-08	1	1	30	\N	\N	2021-12-31 16:00:00-08	\N	1	1
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
-- Data for Name: growth_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.growth_forms (id, name) FROM stdin;
1	Tree
2	Shrub
3	Forb
4	Graminoid
5	Fern
6	Fungi
7	Lichen
8	Moss
\.


--
-- Data for Name: identifier_sequences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.identifier_sequences (organization_id, prefix, next_value) FROM stdin;
\.


--
-- Data for Name: jobrunr_backgroundjobservers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_backgroundjobservers (id, workerpoolsize, pollintervalinseconds, firstheartbeat, lastheartbeat, running, systemtotalmemory, systemfreememory, systemcpuload, processmaxmemory, processfreememory, processallocatedmemory, processcpuload, deletesucceededjobsafter, permanentlydeletejobsafter) FROM stdin;
\.


--
-- Data for Name: jobrunr_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_jobs (id, version, jobasjson, jobsignature, state, createdat, updatedat, scheduledat, recurringjobid) FROM stdin;
\.


--
-- Data for Name: jobrunr_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_metadata (id, name, owner, value, createdat, updatedat) FROM stdin;
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
\.


--
-- Data for Name: jobrunr_recurring_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobrunr_recurring_jobs (id, version, jobasjson, createdat) FROM stdin;
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
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, notification_type_id, user_id, organization_id, title, body, local_url, created_time, is_read) FROM stdin;
\.


--
-- Data for Name: organization_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_users (user_id, organization_id, role_id, created_time, modified_time, created_by, modified_by) FROM stdin;
1	1	4	2021-12-15 09:59:59.072725-08	2021-12-15 09:59:59.072725-08	1	1
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, created_time, modified_time, disabled_time, country_code, country_subdivision_code, description, created_by, modified_by) FROM stdin;
1	Terraformation (staging)	2021-12-15 09:59:59.072094-08	2021-12-15 09:59:59.072094-08	\N	\N	\N	\N	1	1
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.photos (id, file_name, content_type, size, created_time, modified_time, created_by, storage_url, modified_by) FROM stdin;
1001	accession1.jpg	image/jpeg	6441	2021-02-12 10:36:15.842405-08	2021-02-12 10:36:15.842405-08	1	file:///100/A/A/F/AAF4D49R3E/accession1.jpg	1
1002	accession2.jpg	image/jpeg	6539	2021-02-12 10:36:15.903768-08	2021-02-12 10:36:15.903768-08	1	file:///100/A/A/F/AAF4D49R3E/accession2.jpg	1
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
-- Data for Name: seed_storage_behaviors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seed_storage_behaviors (id, name) FROM stdin;
1	Orthodox
2	Recalcitrant
3	Intermediate
4	Unknown
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.species (id, organization_id, scientific_name, common_name, family_name, endangered, rare, growth_form_id, seed_storage_behavior_id, created_by, created_time, modified_by, modified_time, deleted_by, deleted_time, checked_time, initial_scientific_name) FROM stdin;
1	1	Kousa Dogwood	Kousa Dogwood	\N	\N	\N	\N	\N	1	2021-12-15 09:59:59.135505-08	1	2021-12-15 09:59:59.135505-08	\N	\N	\N	Kousa Dogwood
2	1	Other Dogwood	Other Dogwood	\N	\N	\N	\N	\N	1	2021-12-15 09:59:59.135505-08	1	2021-12-15 09:59:59.135505-08	\N	\N	\N	Other Dogwood
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
\.


--
-- Data for Name: spring_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spring_session (primary_id, session_id, creation_time, last_access_time, max_inactive_interval, expiry_time, principal_name) FROM stdin;
\.


--
-- Data for Name: spring_session_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spring_session_attributes (session_primary_id, attribute_name, attribute_bytes) FROM stdin;
\.


--
-- Data for Name: task_processed_times; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_processed_times (name, processed_up_to, started_time) FROM stdin;
AccessionScheduledStateTask	2022-01-14 09:59:43.592828-08	\N
DateNotificationTask	2022-01-14 09:59:43.622319-08	\N
StateSummaryNotificationTask	2022-01-14 09:59:43.627374-08	\N
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
\.


--
-- Data for Name: uploads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploads (id, created_by, created_time, filename, storage_url, content_type, type_id, status_id, organization_id, facility_id) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (user_id, organization_id, preferences) FROM stdin;
\.


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_types (id, name) FROM stdin;
1	Individual
2	Super Admin
3	Device Manager
4	System
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, auth_id, email, first_name, last_name, created_time, modified_time, user_type_id, last_activity_time, email_notifications_enabled, deleted_time) FROM stdin;
1	0d04525c-7933-4cec-9647-7b6ac2642838	nobody@terraformation.com	Test	User	2021-12-15 09:59:59.069723-08	2021-12-15 09:59:59.069723-08	1	\N	f	\N
2	DISABLED	system	Terraware	System	2022-10-25 10:51:42.24661-07	2022-10-25 10:51:42.24661-07	4	\N	f	\N
\.


--
-- Data for Name: accession_collectors; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_collectors (accession_id, "position", name) FROM stdin;
\.


--
-- Data for Name: accession_photos; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_photos (accession_id, photo_id) FROM stdin;
1002	1001
1002	1002
\.


--
-- Data for Name: accession_quantity_history; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.accession_quantity_history (id, accession_id, history_type_id, created_by, created_time, remaining_quantity, remaining_units_id) FROM stdin;
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
1000	2022-10-25 10:51:45.051912-07	30	40	Accession has been edited	2
1002	2022-10-25 10:51:45.114536-07	30	40	Accession has been edited	2
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

COPY seedbank.accessions (id, facility_id, number, collected_date, received_date, state_id, founder_id, trees_collected_from, field_notes, processing_start_date, subset_weight, subset_count, est_seed_count, cut_test_seeds_filled, cut_test_seeds_empty, cut_test_seeds_compromised, drying_start_date, drying_end_date, drying_move_date, processing_notes, storage_start_date, storage_packets, storage_location_id, storage_notes, created_time, processing_method_id, target_storage_condition, processing_staff_responsible, collection_site_name, collection_site_landowner, storage_staff_responsible, latest_germination_recording_date, latest_viability_percent, total_viability_percent, source_plant_origin_id, nursery_start_date, remaining_grams, remaining_quantity, remaining_units_id, subset_weight_grams, subset_weight_quantity, subset_weight_units_id, total_grams, total_quantity, total_units_id, checked_in_time, modified_time, created_by, modified_by, species_id, collection_site_city, collection_site_country_code, collection_site_country_subdivision, collection_site_notes, collection_source_id, data_source_id, is_manual_state, latest_observed_quantity, latest_observed_units_id, latest_observed_time, est_weight_grams, est_weight_quantity, est_weight_units_id) FROM stdin;
1000	100	XYZ	\N	\N	40	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-01-03 07:31:20-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 10:51:45.026499-07	2022-10-25 10:51:45.063084-07	1	2	1	\N	\N	\N	\N	\N	1	t	\N	\N	\N	\N	\N	\N
1001	100	ABCDEFG	\N	\N	20	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-01-10 05:08:11-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 10:51:45.089885-07	2022-10-25 10:51:45.090985-07	1	2	2	\N	\N	\N	\N	\N	1	t	\N	\N	\N	\N	\N	\N
1002	100	AAF4D49R3E	\N	\N	40	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-01-03 07:31:20-08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-25 10:51:45.11361-07	2022-10-25 10:51:45.115307-07	1	2	1	\N	\N	\N	\N	\N	2	t	\N	\N	\N	\N	\N	\N
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
1001	1002	2021-02-12 09:21:33.62729-08	9.0300000	-79.5300000	\N
\.


--
-- Data for Name: processing_methods; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.processing_methods (id, name) FROM stdin;
1	Count
2	Weight
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
-- Data for Name: source_plant_origins; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.source_plant_origins (id, name) FROM stdin;
1	Wild
2	Outplant
\.


--
-- Data for Name: storage_conditions; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.storage_conditions (id, name) FROM stdin;
1	Refrigerator
2	Freezer
\.


--
-- Data for Name: storage_locations; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.storage_locations (id, facility_id, name, condition_id, enabled, created_time, modified_time, created_by, modified_by) FROM stdin;
1000	100	Refrigerator 1	1	t	2022-10-25 10:51:42.255377-07	2022-10-25 10:51:42.255377-07	1	1
1001	100	Freezer 1	2	t	2022-10-25 10:51:42.255377-07	2022-10-25 10:51:42.255377-07	1	1
1002	100	Freezer 2	2	t	2022-10-25 10:51:42.255377-07	2022-10-25 10:51:42.255377-07	1	1
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
\.


--
-- Data for Name: viability_test_treatments; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.viability_test_treatments (id, name) FROM stdin;
1	Soak
2	Scarify
3	Chemical
4	Stratification
5	Other
6	Light
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

COPY seedbank.viability_tests (id, accession_id, test_type, start_date, seed_type_id, substrate_id, treatment_id, seeds_sown, notes, staff_responsible, total_seeds_germinated, total_percent_germinated, end_date, remaining_grams, remaining_quantity, remaining_units_id, seeds_compromised, seeds_empty, seeds_filled) FROM stdin;
\.


--
-- Data for Name: withdrawal_purposes; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.withdrawal_purposes (id, name) FROM stdin;
1	Propagation
2	Outreach or Education
3	Research
4	Broadcast
5	Share with Another Site
6	Other
7	Viability Testing
8	Out-planting
9	Nursery
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: seedbank; Owner: -
--

COPY seedbank.withdrawals (id, accession_id, date, purpose_id, destination, staff_responsible, created_time, updated_time, notes, viability_test_id, remaining_grams, remaining_quantity, remaining_units_id, withdrawn_grams, withdrawn_quantity, withdrawn_units_id, estimated_count, estimated_weight_quantity, estimated_weight_units_id, created_by, withdrawn_by) FROM stdin;
\.


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
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 2, false);


--
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.photos_id_seq', 1003, false);


--
-- Name: site_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_module_id_seq', 102, false);


--
-- Name: species_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_id_seq1', 2, true);


--
-- Name: species_problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.species_problems_id_seq', 1, false);


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
-- Name: germination_treatment_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.germination_treatment_id_seq', 1, false);


--
-- Name: storage_location_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.storage_location_id_seq', 1003, false);


--
-- Name: withdrawal_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.withdrawal_id_seq', 1, false);


--
-- Name: withdrawal_purpose_id_seq; Type: SEQUENCE SET; Schema: seedbank; Owner: -
--

SELECT pg_catalog.setval('seedbank.withdrawal_purpose_id_seq', 1, false);


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
-- Name: batch_withdrawals batch_withdrawals_pkey; Type: CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batch_withdrawals
    ADD CONSTRAINT batch_withdrawals_pkey PRIMARY KEY (batch_id, withdrawal_id);


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
    ADD CONSTRAINT accession_photos_pk PRIMARY KEY (photo_id);


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
-- Name: viability_test_treatments germination_treatment_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_test_treatments
    ADD CONSTRAINT germination_treatment_pkey PRIMARY KEY (id);


--
-- Name: processing_methods processing_method_name_key; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.processing_methods
    ADD CONSTRAINT processing_method_name_key UNIQUE (name);


--
-- Name: processing_methods processing_method_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.processing_methods
    ADD CONSTRAINT processing_method_pkey PRIMARY KEY (id);


--
-- Name: seed_quantity_units seed_quantity_units_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.seed_quantity_units
    ADD CONSTRAINT seed_quantity_units_pkey PRIMARY KEY (id);


--
-- Name: source_plant_origins source_plant_origin_name_key; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.source_plant_origins
    ADD CONSTRAINT source_plant_origin_name_key UNIQUE (name);


--
-- Name: source_plant_origins source_plant_origin_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.source_plant_origins
    ADD CONSTRAINT source_plant_origin_pkey PRIMARY KEY (id);


--
-- Name: storage_conditions storage_condition_name_key; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_conditions
    ADD CONSTRAINT storage_condition_name_key UNIQUE (name);


--
-- Name: storage_conditions storage_condition_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_conditions
    ADD CONSTRAINT storage_condition_pkey PRIMARY KEY (id);


--
-- Name: storage_locations storage_location_pkey; Type: CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_locations
    ADD CONSTRAINT storage_location_pkey PRIMARY KEY (id);


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
-- Name: batch_quantity_history_batch_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batch_quantity_history_batch_id_idx ON nursery.batch_quantity_history USING btree (batch_id);


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
-- Name: batches_organization_id_species_id_idx; Type: INDEX; Schema: nursery; Owner: -
--

CREATE INDEX batches_organization_id_species_id_idx ON nursery.batches USING btree (organization_id, species_id);


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
-- Name: organization_users_organization_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organization_users_organization_id_idx ON public.organization_users USING btree (organization_id);


--
-- Name: species__not_checked_ix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species__not_checked_ix ON public.species USING btree (id) WHERE (checked_time IS NULL);


--
-- Name: species_organization_id_initial_scientific_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_organization_id_initial_scientific_name_idx ON public.species USING btree (organization_id, initial_scientific_name);


--
-- Name: species_problems_species_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX species_problems_species_id_idx ON public.species_problems USING btree (species_id);


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
-- Name: batches batches_species_id_fkey; Type: FK CONSTRAINT; Schema: nursery; Owner: -
--

ALTER TABLE ONLY nursery.batches
    ADD CONSTRAINT batches_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


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
-- Name: photos photos_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


--
-- Name: photos photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_user_id_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: facilities site_module_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT site_module_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.facility_types(id);


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
-- Name: species species_growth_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_growth_form_id_fkey FOREIGN KEY (growth_form_id) REFERENCES public.growth_forms(id);


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
-- Name: spring_session_attributes spring_session_attributes_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spring_session_attributes
    ADD CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES public.spring_session(primary_id) ON DELETE CASCADE;


--
-- Name: thumbnails thumbnail_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thumbnails
    ADD CONSTRAINT thumbnail_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id);


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
    ADD CONSTRAINT accession_photos_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id);


--
-- Name: accessions accession_processing_method_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_processing_method_id_fkey FOREIGN KEY (processing_method_id) REFERENCES seedbank.processing_methods(id);


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
-- Name: accessions accession_source_plant_origin_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_source_plant_origin_id_fkey FOREIGN KEY (source_plant_origin_id) REFERENCES seedbank.source_plant_origins(id);


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
    ADD CONSTRAINT accession_storage_location_id_fkey FOREIGN KEY (storage_location_id) REFERENCES seedbank.storage_locations(id);


--
-- Name: accessions accession_subset_weight_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_subset_weight_units_id_fkey FOREIGN KEY (subset_weight_units_id) REFERENCES seedbank.seed_quantity_units(id);


--
-- Name: accessions accession_target_storage_condition_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_target_storage_condition_fkey FOREIGN KEY (target_storage_condition) REFERENCES seedbank.storage_conditions(id);


--
-- Name: accessions accession_total_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accession_total_units_id_fkey FOREIGN KEY (total_units_id) REFERENCES seedbank.seed_quantity_units(id);


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
-- Name: accessions accessions_species_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.accessions
    ADD CONSTRAINT accessions_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


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
-- Name: viability_tests germination_test_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.viability_tests
    ADD CONSTRAINT germination_test_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES seedbank.seed_quantity_units(id);


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
    ADD CONSTRAINT germination_test_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES seedbank.viability_test_treatments(id);


--
-- Name: storage_locations storage_location_condition_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_locations
    ADD CONSTRAINT storage_location_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES seedbank.storage_conditions(id);


--
-- Name: storage_locations storage_locations_created_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_locations
    ADD CONSTRAINT storage_locations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: storage_locations storage_locations_facility_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_locations
    ADD CONSTRAINT storage_locations_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: storage_locations storage_locations_modified_by_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.storage_locations
    ADD CONSTRAINT storage_locations_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.users(id);


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
-- Name: withdrawals withdrawal_remaining_units_id_fkey; Type: FK CONSTRAINT; Schema: seedbank; Owner: -
--

ALTER TABLE ONLY seedbank.withdrawals
    ADD CONSTRAINT withdrawal_remaining_units_id_fkey FOREIGN KEY (remaining_units_id) REFERENCES seedbank.seed_quantity_units(id);


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
-- PostgreSQL database dump complete
--

