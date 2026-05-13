-- PANOPTIS OSINT — Saved Views & User Features Schema
-- Run this in your Supabase SQL Editor to extend the existing schema

-- ============================================================
-- 1. Saved Views (Camera positions, layer configs, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    -- Camera position
    longitude   DOUBLE PRECISION,
    latitude    DOUBLE PRECISION,
    height      DOUBLE PRECISION,
    heading     DOUBLE PRECISION,
    pitch       DOUBLE PRECISION,
    roll        DOUBLE PRECISION,
    -- Layer configuration (which plugins are enabled)
    layers      JSONB DEFAULT '[]',
    -- Time settings
    time_window TEXT DEFAULT '24h',
    -- Region filter
    region      TEXT DEFAULT 'global',
    -- Custom data
    metadata    JSONB DEFAULT '{}',
    is_default  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Each user can have multiple views, but only one default
CREATE UNIQUE INDEX idx_saved_views_default
    ON saved_views(user_id)
    WHERE is_default = TRUE;

CREATE INDEX idx_saved_views_user ON saved_views(user_id);

-- ============================================================
-- 2. User Preferences (Theme, settings, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme           TEXT DEFAULT 'black',
    show_labels     BOOLEAN DEFAULT TRUE,
    show_fps        BOOLEAN DEFAULT FALSE,
    time_window     TEXT DEFAULT '24h',
    default_region  TEXT DEFAULT 'global',
    -- Notification settings
    email_alerts    BOOLEAN DEFAULT FALSE,
    push_alerts     BOOLEAN DEFAULT FALSE,
    -- Performance
    resolution_scale DOUBLE PRECISION DEFAULT 1.0,
    anti_aliasing   BOOLEAN DEFAULT TRUE,
    -- Data settings
    auto_refresh    BOOLEAN DEFAULT TRUE,
    refresh_interval INTEGER DEFAULT 30,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Alerts (Notify when entities enter/leave areas)
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    plugin_id   TEXT NOT NULL,  -- e.g. 'aviation', 'maritime'
    -- Geofence: circle or polygon
    alert_type  TEXT NOT NULL CHECK (alert_type IN ('proximity', 'geofence', 'entry', 'exit')),
    center_lat  DOUBLE PRECISION,
    center_lon  DOUBLE PRECISION,
    radius_km   DOUBLE PRECISION,
    polygon     JSONB,  -- GeoJSON polygon for complex shapes
    -- Entity filter
    entity_filter JSONB DEFAULT '{}',  -- e.g. {"callsign": "ABC*"}
    -- Notification
    is_active   BOOLEAN DEFAULT TRUE,
    notify_email BOOLEAN DEFAULT FALSE,
    notify_push  BOOLEAN DEFAULT FALSE,
    last_triggered TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_active ON alerts(is_active) WHERE is_active = TRUE;

-- ============================================================
-- 4. Alert History (Log of triggered alerts)
-- ============================================================
CREATE TABLE IF NOT EXISTS alert_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id    UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id   TEXT NOT NULL,
    entity_name TEXT,
    trigger_type TEXT NOT NULL,  -- 'entry', 'exit', 'proximity'
    entity_data JSONB,  -- Snapshot of entity at trigger time
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_history_alert ON alert_history(alert_id);
CREATE INDEX idx_alert_history_user ON alert_history(user_id);

-- ============================================================
-- 5. Extend Favorites with tags and notes
-- ============================================================
ALTER TABLE favorites
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS is_watching BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS watch_radius_km DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ============================================================
-- 6. Search History
-- ============================================================
CREATE TABLE IF NOT EXISTS search_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query       TEXT NOT NULL,
    plugin_id   TEXT,  -- Which plugin was searched
    results_count INTEGER,
    clicked_entity_id TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);

-- ============================================================
-- 7. Update triggers for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_saved_views_updated_at') THEN
        CREATE TRIGGER update_saved_views_updated_at
            BEFORE UPDATE ON saved_views
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
        CREATE TRIGGER update_user_preferences_updated_at
            BEFORE UPDATE ON user_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_alerts_updated_at') THEN
        CREATE TRIGGER update_alerts_updated_at
            BEFORE UPDATE ON alerts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================
-- 8. Row Level Security (RLS) Policies
-- ============================================================
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can only access their own saved views"
    ON saved_views FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own preferences"
    ON user_preferences FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own alerts"
    ON alerts FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own alert history"
    ON alert_history FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own search history"
    ON search_history FOR ALL
    USING (user_id = auth.uid());

-- ============================================================
-- DONE — Schema extended for PANOPTIS user features
-- ============================================================
