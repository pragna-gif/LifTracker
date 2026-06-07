-- Custom Module Builder — Dynamic user-defined tracking modules

CREATE TABLE custom_modules (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10)  NOT NULL DEFAULT '📋',
    description VARCHAR(255),
    fields      TEXT NOT NULL,   -- JSON array of field definitions
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE custom_entries (
    id          BIGSERIAL PRIMARY KEY,
    module_id   BIGINT NOT NULL REFERENCES custom_modules(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    data        TEXT NOT NULL,   -- JSON object of field values
    logged_on   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_entries_module ON custom_entries(module_id, logged_on DESC);
