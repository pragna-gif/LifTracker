-- LifeTracker Pro — Initial Schema

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expenses (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    amount      NUMERIC(10,2) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    note        VARCHAR(255),
    spent_on    DATE NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dsa_problems (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    title        VARCHAR(200) NOT NULL,
    platform     VARCHAR(50) NOT NULL,   -- LeetCode, GFG, Codeforces
    difficulty   VARCHAR(20) NOT NULL,   -- Easy, Medium, Hard
    topic        VARCHAR(80) NOT NULL,   -- Arrays, DP, Graphs, etc.
    time_taken   INT,                    -- minutes
    notes        TEXT,
    solved_on    DATE NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_items (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users(id),
    title          VARCHAR(200) NOT NULL,
    platform       VARCHAR(50) NOT NULL,   -- YouTube, Blog, LinkedIn, Twitter
    status         VARCHAR(30) NOT NULL DEFAULT 'IDEA',  -- IDEA, DRAFTING, REVIEW, PUBLISHED
    tags           VARCHAR(200),
    published_date DATE,
    view_count     INT DEFAULT 0,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cafes (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    name             VARCHAR(150) NOT NULL,
    location         VARCHAR(200),
    city             VARCHAR(100),
    wifi_rating      INT CHECK (wifi_rating BETWEEN 1 AND 5),
    coffee_rating    INT CHECK (coffee_rating BETWEEN 1 AND 5),
    ambience_rating  INT CHECK (ambience_rating BETWEEN 1 AND 5),
    work_friendly    BOOLEAN DEFAULT FALSE,
    notes            TEXT,
    wishlist         BOOLEAN DEFAULT FALSE,
    visited_on       DATE,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE food_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    meal         VARCHAR(200) NOT NULL,
    meal_type    VARCHAR(30) NOT NULL,   -- Breakfast, Lunch, Dinner, Snack
    calories     INT,
    restaurant   VARCHAR(150),
    home_cooked  BOOLEAN DEFAULT FALSE,
    cuisine      VARCHAR(80),
    rating       INT CHECK (rating BETWEEN 1 AND 5),
    logged_on    DATE NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gym_sessions (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    exercise     VARCHAR(150) NOT NULL,
    muscle_group VARCHAR(80),
    sets         INT,
    reps         INT,
    weight_kg    NUMERIC(6,2),
    duration_min INT,
    notes        TEXT,
    worked_out_on DATE NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_expenses_user_date   ON expenses(user_id, spent_on);
CREATE INDEX idx_dsa_user_date        ON dsa_problems(user_id, solved_on);
CREATE INDEX idx_content_user_status  ON content_items(user_id, status);
CREATE INDEX idx_gym_user_date        ON gym_sessions(user_id, worked_out_on);
CREATE INDEX idx_food_user_date       ON food_logs(user_id, logged_on);
