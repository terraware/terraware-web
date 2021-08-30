-- Add a dummy user for CI tests. In tests, we'll bypass the login flow by passing
-- authentication information that would normally be added by OAuth2 Proxy.
INSERT INTO users (id, auth_id, email, first_name, last_name, user_type_id, created_time,
                   modified_time)
VALUES (1, 'dummy-auth-id', 'nobody@terraformation.com', 'Test', 'User', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET auth_id = excluded.auth_id,
                               first_name = excluded.first_name,
                               last_name = excluded.last_name,
                               email = excluded.email;

-- Insert some dummy data into the database for demo purposes
INSERT INTO organizations (id, name, created_time, modified_time)
VALUES (1, 'Terraformation (staging)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = excluded.name;

INSERT INTO organization_users (user_id, organization_id, role_id, created_time, modified_time)
VALUES (1, 1, 4, NOW(), NOW())
ON CONFLICT (user_id, organization_id) DO UPDATE SET role_id = excluded.role_id;

INSERT INTO projects (id, organization_id, name, created_time, modified_time)
VALUES (10, 1, 'Example Project', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = excluded.name;

INSERT INTO project_users (user_id, project_id, created_time, modified_time)
VALUES (1, 10, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO sites (id, project_id, name, latitude, longitude, locale, timezone)
VALUES (10, 10, 'Example Site', 123.456789, -98.76543, 'en-US', 'US/Pacific')
ON CONFLICT (id) DO UPDATE SET name = excluded.name;

INSERT INTO facilities (id, site_id, type_id, name)
VALUES (100, 10, 1, 'ohana'),
       (101, 10, 1, 'garage')
ON CONFLICT (id) DO UPDATE SET site_id = excluded.site_id,
                               name    = excluded.name;

INSERT INTO species (id, name, created_time, modified_time)
VALUES (10000, 'Kousa Dogwood', NOW(), NOW()),
       (10001, 'Other Dogwood', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = excluded.name;

INSERT INTO species_families (id, name, created_time)
VALUES (20000, 'Dogwood', NOW())
ON CONFLICT (id) DO UPDATE SET name = excluded.name;

INSERT INTO storage_locations (id, facility_id, name, condition_id)
VALUES (1000, 100, 'Refrigerator 1', 1),
       (1001, 100, 'Freezer 1', 2),
       (1002, 100, 'Freezer 2', 2)
ON CONFLICT (id) DO UPDATE SET name         = excluded.name,
                               condition_id = excluded.condition_id;

INSERT INTO accessions (id, number, state_id, facility_id, created_time, species_id,
                       species_family_id, trees_collected_from)
VALUES (1000, 'XYZ', 30, 100, '2021-01-03T15:31:20Z', 10000, 20000, 1),
       (1001, 'ABCDEFG', 20, 100, '2021-01-10T13:08:11Z', 10001, 20000, 2)
ON CONFLICT (id) DO UPDATE SET number           = excluded.number,
                               state_id         = excluded.state_id,
                               species_id       = excluded.species_id,
                               trees_collected_from = excluded.trees_collected_from;

INSERT INTO notifications (id, site_id, type_id, accession_id, created_time, read, message,
                          accession_state_id)
VALUES (100000, 10, 1, NULL, '2021-01-01T11:22:33Z', FALSE, 'This is an example alert', NULL),
       (100001, 10, 3, 1000, '2021-01-15T08:01:00Z', FALSE, 'Accession XYZ has exploded!', NULL),
       (100002, 10, 2, NULL, '2021-01-25T08:05:00Z', FALSE, 'Accessions are pending!', 10),
       (100003, 10, 2, NULL, '2021-01-25T08:05:01Z', FALSE, 'Accessions are processing!', 20),
       (100004, 10, 2, NULL, '2021-01-25T08:05:02Z', FALSE, 'Accessions are processed!', 30),
       (100005, 10, 2, NULL, '2021-01-25T08:05:03Z', FALSE, 'Accessions are drying!', 40),
       (100006, 10, 2, NULL, '2021-01-25T08:05:04Z', FALSE, 'Accessions are dried!', 50),
       (100007, 10, 2, NULL, '2021-01-25T08:05:05Z', FALSE, 'Accessions are in storage!', 60),
       (100008, 10, 2, NULL, '2021-01-25T08:05:06Z', FALSE, 'Accessions are withdrawn!', 70),
       (100009, 10, 3, 1001, '2021-01-27T08:00:00Z', FALSE, 'Accession ABCDEFG needs help!', NULL)
ON CONFLICT (id) DO UPDATE SET type_id            = excluded.type_id,
                               accession_id       = excluded.accession_id,
                               created_time       = excluded.created_time,
                               read               = excluded.read,
                               message            = excluded.message,
                               accession_state_id = excluded.accession_state_id;
                               
INSERT INTO "app_devices" ("id", "app_name", "created_time") VALUES (1, 'cel', '2021-02-12 17:21:33.62729+00');

INSERT INTO "accessions" ("id", "facility_id", "app_device_id", "number", "species_id", "state_id", "trees_collected_from", "species_family_id", "created_time") VALUES
(1002,	100,	1,	'AAF4D49R3E',	10000,	30,	1,	20000,	'2021-01-03 15:31:20+00');

INSERT INTO "bags" ("id", "accession_id", "bag_number") VALUES
(1001,	1002,	'ABCD001237'),
(1002,	1002,	'ABCD001238');

INSERT INTO "geolocations" ("id", "accession_id", "created_time", "latitude", "longitude", "gps_accuracy") VALUES
(1001,	1002,	'2021-02-12 17:21:33.62729+00',	9.0300000,	-79.5300000,	NULL);

INSERT INTO "accession_photos" ("id", "accession_id", "filename", "uploaded_time", "captured_time", "content_type", "size", "latitude", "longitude", "gps_accuracy") VALUES
(1001,	1002,	'accession1.jpg',	'2021-02-12 18:36:15.842405+00',	'2021-02-03 11:33:44+00',	'image/jpeg',	6441,	NULL,	NULL,	NULL),
(1002,	1002,	'accession2.jpg',	'2021-02-12 18:36:15.903768+00',	'2021-02-03 11:33:44+00',	'image/jpeg',	6539,	NULL,	NULL,	NULL);
