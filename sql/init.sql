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
    'Jane Doe',
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
'Campus Safety & Responsibility',
1
);


-- Sample World 2
INSERT INTO World (organization_id, world_name, order_number)
VALUES (
    1,
'Digital Life & Privacy',
2
);


-- Sample World 3
INSERT INTO World (organization_id, world_name, order_number)
VALUES (
    1,
'Wellbeing & Community',
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
            "content": "Toimi vastuullisesti"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🎓 Järjestyssäännöt määrittävät oikeutesi ja velvollisuutesi opiskelijana. Jokaisella on vastuu toimia niin, että yhteisö pysyy turvallisena, oikeudenmukaisena ja opiskelulle suotuisana. Järjestyssääntöjen rikkomisesta voi seurata kurinpidollisia seuraamuksia."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Act Responsibly"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🎓 School rules define your rights and responsibilities as a student. Everyone is responsible for keeping the community safe, fair, and conducive to learning. Violations of school rules may result in disciplinary action."
        }
        ]
    }
    }',
    1
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1,
    'Digital Safety',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Digitaalinen turvallisuus"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🔒 Digitaalinen turvallisuus on jokaisen opiskelijan vastuulla. Käytä vahvoja salasanoja, älä jaa kirjautumistietojasi muille ja ilmoita epäilyttävästä toiminnasta IT-tuelle välittömästi."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Digital Safety"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🔒 Digital safety is every student''s responsibility. Use strong passwords, never share your login credentials, and report any suspicious activity to IT support immediately."
        }
        ]
    }
    }',
    2
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1,
    'Inclusivity and Equality',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Yhdenvertaisuus ja tasa-arvo"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🌍 Yhdenvertaisuus tarkoittaa, että jokainen opiskelija saa tasavertaisen kohtelun taustastaan, sukupuolestaan tai vakaumuksestaan riippumatta. Syrjintä ei ole hyväksyttävää ja siitä voi seurata kurinpidollisia toimenpiteitä."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Inclusivity and Equality"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🌍 Inclusivity means every student is treated equally regardless of their background, gender, or beliefs. Discrimination is not acceptable and may result in disciplinary measures."
        }
        ]
    }
    }',
    3
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    2,
    'Respectful Communication',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Kunnioittava viestintä"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🤝 Kunnioittava viestintä on tärkeä osa turvallista opiskeluympäristöä. Kohtele muita opiskelijoita ja henkilökuntaa asiallisesti sekä kasvokkain että digitaalisissa kanavissa."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Respectful Communication"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🤝 Respectful communication is a key part of a safe learning environment. Treat fellow students and staff with courtesy, both in person and in digital channels."
        }
        ]
    }
    }',
    4
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    2,
    'Emergency Procedures',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Hätätilanteet"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🚨 Hätätilanteessa toimi rauhallisesti. Tunne poistumisreitit, kokoontumispaikka ja hätänumero 112. Noudata henkilökunnan ohjeita evakuointitilanteessa."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Emergency Procedures"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🚨 Stay calm in an emergency. Know the exit routes, the assembly point, and the emergency number 112. Follow staff instructions during any evacuation."
        }
        ]
    }
    }',
    5
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    2,
    'Data Privacy',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Tietosuoja"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🛡️ Tietosuoja koskee jokaista. Älä jaa henkilötietoja ilman lupaa, käsittele opiskelijatietoja luottamuksellisesti ja noudata koulun tietosuojakäytäntöjä kaikessa toiminnassasi."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Data Privacy"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🛡️ Data privacy concerns everyone. Do not share personal information without consent, handle student data confidentially, and follow the school''s data protection policies in everything you do."
        }
        ]
    }
    }',
    6
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    3,
    'Wellbeing at School',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Hyvinvointi koulussa"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "💚 Hyvinvointi on opiskelumenestyksen perusta. Huolehdi unesta, ravinnosta ja liikunnasta. Jos sinulla on haasteita, älä epäröi hakea apua opinto-ohjaajalta tai opiskelijaterveydenhuollosta."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Wellbeing at School"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "💚 Wellbeing is the foundation of academic success. Take care of your sleep, nutrition, and physical activity. If you face challenges, don''t hesitate to seek help from a student counselor or student health services."
        }
        ]
    }
    }',
    7
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    3,
    'Anti-Bullying',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Kiusaamisen vastainen toiminta"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🚫 Kiusaamista ei hyväksytä missään muodossa. Jos koet tai havaitset kiusaamista, ilmoita siitä luotettavalle aikuiselle. Jokaisella on oikeus turvalliseen opiskeluympäristöön."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Anti-Bullying"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🚫 Bullying is not tolerated in any form. If you experience or witness bullying, report it to a trusted adult. Everyone has the right to a safe learning environment."
        }
        ]
    }
    }',
    8
);

INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    3,
    'Sustainable Campus',
    '{
    "fi": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Kestävä kampus"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🌱 Kestävä kehitys alkaa arjen valinnoista. Lajittele jätteet oikein, sammuta valot poistuessasi, käytä julkista liikennettä ja vähennä kertakäyttömuovin käyttöä kampuksella."
        }
        ]
    },
    "en": {
        "quiz_intro": [
        {
            "title": "p0",
            "type": "quiz_header",
            "content": "Sustainable Campus"
        },
        {
            "title": "p1",
            "type": "quiz_info",
            "content": "🌱 Sustainable development starts with everyday choices. Sort your waste correctly, turn off lights when you leave, use public transport, and reduce single-use plastic on campus."
        }
        ]
    }
    }',
    9
);


