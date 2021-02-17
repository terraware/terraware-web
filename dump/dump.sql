INSERT INTO "accession" ("id", "site_module_id", "app_device_id", "number", "species_id", "collected_date", "received_date", "state_id", "germination_testing", "primary_collector_id", "founder_tree", "collection_trees", "environmental_notes", "field_notes", "processing_start_date", "seeds_counted", "subset_weight", "subset_count", "total_weight", "est_seed_count", "cut_test_seeds_filled", "cut_test_seeds_empty", "cut_test_seeds_compromised", "drying_start_date", "drying_end_date", "drying_move_date", "processing_notes", "storage_start_date", "storage_packets", "storage_location_id", "storage_notes", "species_family_id", "species_rare", "species_endangered", "created_time", "processing_method_id", "target_storage_condition", "processing_staff_responsible", "collection_site_name", "collection_site_landowner", "collection_site_notes", "storage_staff_responsible", "seeds_remaining", "latest_germination_recording_date", "latest_viability_percent", "total_viability_percent") VALUES
(1002,	100,	NULL,	'AAF4D49R3E',	10000,	NULL,	NULL,	30,	NULL,	NULL,	NULL,	1,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	20000,	NULL,	NULL,	'2021-01-03 15:31:20+00',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL);

INSERT INTO "bag" ("id", "accession_id", "label") VALUES
(1001,	1002,	'ABCD001237'),
(1002,	1002,	'ABCD001238');

INSERT INTO "collection_event" ("id", "accession_id", "created_time", "latitude", "longitude", "gps_accuracy") VALUES
(1001,	1002,	'2021-02-12 17:21:33.62729+00',	9.0300000,	-79.5300000,	NULL);

INSERT INTO "accession_photo" ("id", "accession_id", "filename", "uploaded_time", "captured_time", "content_type", "size", "latitude", "longitude", "gps_accuracy") VALUES
(1001,	1002,	'accession1.jpg',	'2021-02-12 18:36:15.842405+00',	'2021-02-03 11:33:44+00',	'image/jpeg',	6441,	NULL,	NULL,	NULL),
(1002,	1002,	'accession2.jpg',	'2021-02-12 18:36:15.903768+00',	'2021-02-03 11:33:44+00',	'image/jpeg',	6539,	NULL,	NULL,	NULL);
