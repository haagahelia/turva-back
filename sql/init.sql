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
