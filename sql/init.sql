CREATE TABLE IF NOT EXISTS info (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_otps (
    otp_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(255) NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz (
    quiz_id SERIAL PRIMARY KEY,
    world_id INT NOT NULL,
    quiz_name VARCHAR(255) NOT NULL,
    quiz_content JSON,
    order_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO info (title, content) VALUES
('Title 1', 'Content 1'),
('Title 2', 'Content 2'),
('Title 3', 'Content 3');

-- Create Organization table
CREATE TABLE IF NOT EXISTS Organization (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    homepage_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Create User table
CREATE TABLE IF NOT EXISTS TurvaUser (
    user_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    profile_name VARCHAR(255) UNIQUE NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES Organization(organization_id)
);

-- Create AppPage table
CREATE TABLE IF NOT EXISTS AppPage (
    page_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    page_name VARCHAR(255) NOT NULL,
    page_content JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES Organization(organization_id)
);

-- Create World table
CREATE TABLE IF NOT EXISTS World (
    world_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    world_name VARCHAR(255) NOT NULL,
    order_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES Organization(organization_id)
);

-- Create Quiz table
CREATE TABLE IF NOT EXISTS Quiz (
    quiz_id SERIAL PRIMARY KEY,
    world_id INT NOT NULL,
    quiz_name VARCHAR(255) NOT NULL,
    quiz_content JSON,
    order_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (world_id) REFERENCES World(world_id)
);

-- Create junction table for User completed quizzes (many-to-many relationship)
CREATE TABLE IF NOT EXISTS User_Completed_Quiz (
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, quiz_id),
    FOREIGN KEY (user_id) REFERENCES TurvaUser(user_id),
    FOREIGN KEY (quiz_id) REFERENCES Quiz(quiz_id)
);



-- SAMPLE INSERT STATEMENTS
-- ============================================

-- Sample Organization
INSERT INTO Organization (organization_name, homepage_url)
VALUES (
    'Haaga-Helia Ammattikorkeakoulu',  
    'https://www.haaga-helia.fi'
    );

-- Sample User
INSERT INTO TurvaUser (organization_id, profile_name, email_address)
VALUES (
    1, 
    'Jane Doe'
    'jane.doe@turva.back.fi'
    );

-- Sample AppPage
INSERT INTO AppPage (organization_id, page_name, page_content)
VALUES (
    1, 
    'Welcome Page', 
    '{"sections": [{"title": "p1", "type": "text", "content": "Welcome to our learning platform!"}]}'
    );

-- Sample World 1
INSERT INTO World (organization_id, world_name, order_number)
VALUES (
    1, 
'World 1 - Security Basics', 
1
);


-- Sample World 2
INSERT INTO World (organization_id, world_name, order_number)
VALUES (
    1, 
'World 2 - Test World 2', 
2
);


-- Sample World 3
INSERT INTO World (organization_id, world_name, order_number)
VALUES (
    1, 
'World 2 - Test World 3', 
3
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1, 
    'Act Responsibly',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Toimi vastuullisessti"
        },
        {
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 Järjestyssäännöt määrittävät oikeutesi ja velvollisuutesi opiskelijana. Jokaisella on vastuu toimia niin, että yhteisö pysyy turvallisena, oikeudenmukaisena ja opiskelulle suotuisana. Järjestyssääntöjen rikkomisesta voi seurata kurinpidollisia seuraamuksia."
			}
        ]
    }
    }',
    1
);
