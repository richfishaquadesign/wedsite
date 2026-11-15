CREATE TABLE IF NOT EXISTS rf_workspace_home (
  id integer PRIMARY KEY CHECK (id = 1),
  draft jsonb NOT NULL,
  published jsonb,
  revision integer NOT NULL CHECK (revision > 0)
);
