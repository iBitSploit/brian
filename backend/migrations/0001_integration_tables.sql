-- PostgreSQL migration for Brian integration framework.
-- Apply through the project's migration runner; do not execute manually against prod
-- until the migration workflow and backup policy are established.
CREATE TABLE IF NOT EXISTS integration_instances (
  id VARCHAR(36) PRIMARY KEY,
  plugin_id VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  config_json JSON NOT NULL DEFAULT '{}'::json,
  secret_ciphertext TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_integration_instances_plugin_id ON integration_instances(plugin_id);

CREATE TABLE IF NOT EXISTS integration_jobs (
  id VARCHAR(36) PRIMARY KEY,
  instance_id VARCHAR(36) NOT NULL REFERENCES integration_instances(id) ON DELETE CASCADE,
  status VARCHAR(24) NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  fetched INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  error_code VARCHAR(80) NULL,
  error_message TEXT NULL
);
CREATE INDEX IF NOT EXISTS ix_integration_jobs_instance_id ON integration_jobs(instance_id);

CREATE TABLE IF NOT EXISTS integration_objects (
  id VARCHAR(36) PRIMARY KEY,
  instance_id VARCHAR(36) NOT NULL REFERENCES integration_instances(id) ON DELETE CASCADE,
  object_type VARCHAR(80) NOT NULL,
  external_id VARCHAR(160) NOT NULL,
  external_url TEXT NULL,
  canonical_type VARCHAR(80) NULL,
  canonical_id VARCHAR(36) NULL,
  payload_json JSON NOT NULL DEFAULT '{}'::json,
  stale BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_successful_sync_id VARCHAR(36) NULL,
  CONSTRAINT uq_integration_object_identity UNIQUE(instance_id, object_type, external_id)
);
CREATE INDEX IF NOT EXISTS ix_integration_objects_instance_id ON integration_objects(instance_id);
