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
    world_name_fi VARCHAR(255) NOT NULL,
    world_name_en VARCHAR(255) NOT NULL,
    order_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES Organization(organization_id)
);

-- Create Quiz table
CREATE TABLE IF NOT EXISTS Quiz (
    quiz_id SERIAL PRIMARY KEY,
    world_id INT NOT NULL,
    quiz_name_fi VARCHAR(255) NOT NULL,
    quiz_name_en VARCHAR(255) NOT NULL,
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

-- Create Crisis Team table
CREATE TABLE IF NOT EXISTS CrisisTeam (
    contact_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    name_fi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    role_fi VARCHAR(255) NOT NULL,
    role_en VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    order_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES Organization(organization_id)
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
INSERT INTO World (organization_id, world_name_fi, world_name_en, order_number)
VALUES (
    1,
    'Kampuksen Turvallisuus & Vastuullisuus',
    'Campus Safety & Responsibility',
    1
);


-- Sample World 2
INSERT INTO World (organization_id, world_name_fi, world_name_en, order_number)
VALUES (
    1,
    'Digitaalinen Elämä & Yksityisyyden Suojaus',
    'Digital Life & Privacy',
    2
);


-- Sample World 3
INSERT INTO World (organization_id, world_name_fi, world_name_en, order_number)
VALUES (
    1,
    'Hyvinvointi & Yhteisö',
    'Wellbeing & Community',
    3
);


INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    1, 
    'Toimi Vastuullisesti',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mitä järjestyssäännöt määrittävät?",
                "answers": [
                    {"title": "c1", "content": "Oikeutesi ja velvollisuutesi opiskelijana", "is_correct": true},
                    {"title": "c2", "content": "Vain ruokailu-aikoja kampuksella", "is_correct": false},
                    {"title": "c3", "content": "Opettajien palkkoja", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Mikä seurauksista voi koitua järjestyssääntöjen rikkomisesta?",
                "answers": [
                    {"title": "c1", "content": "Kurinpidollisia seuraamuksia", "is_correct": true},
                    {"title": "c2", "content": "Ei mitään seurauksia", "is_correct": false},
                    {"title": "c3", "content": "Vain suullinen varoitus", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Kuka on vastuussa turvallisen yhteisön säilyttämisestä?",
                "answers": [
                    {"title": "c1", "content": "Jokainen opiskelija", "is_correct": true},
                    {"title": "c2", "content": "Vain rehtori", "is_correct": false},
                    {"title": "c3", "content": "Vain opettajat", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "What do school rules define?",
                "answers": [
                    {"title": "c1", "content": "Your rights and responsibilities as a student", "is_correct": true},
                    {"title": "c2", "content": "Only meal times on campus", "is_correct": false},
                    {"title": "c3", "content": "Teacher salaries", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "What consequence may result from violating school rules?",
                "answers": [
                    {"title": "c1", "content": "Disciplinary action", "is_correct": true},
                    {"title": "c2", "content": "No consequences", "is_correct": false},
                    {"title": "c3", "content": "Only a verbal warning", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Who is responsible for maintaining a safe community?",
                "answers": [
                    {"title": "c1", "content": "Every student", "is_correct": true},
                    {"title": "c2", "content": "Only the principal", "is_correct": false},
                    {"title": "c3", "content": "Only teachers", "is_correct": false}
                ]
            }
        ]
    }
    }',
    1
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    1,
    'Digitaalinen turvallisuus',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mitä sinun ei tulisi koskaan tehdä kirjautumistietojillasi?",
                "answers": [
                    {"title": "c1", "content": "Jakaa niitä muille", "is_correct": true},
                    {"title": "c2", "content": "Käyttää niitä itse", "is_correct": false},
                    {"title": "c3", "content": "Tallentaa ne tietokoneelle", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Mitä sinun tulee tehdä epäilyttävästä toiminnasta IT-verkossa?",
                "answers": [
                    {"title": "c1", "content": "Ilmoittaa IT-tuelle välittömästi", "is_correct": true},
                    {"title": "c2", "content": "Ignoroida se ja jatkaa työskentelyä", "is_correct": false},
                    {"title": "c3", "content": "Kertoa siitä kaverillesi", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "What should you never do with your login credentials?",
                "answers": [
                    {"title": "c1", "content": "Share them with others", "is_correct": true},
                    {"title": "c2", "content": "Use them yourself", "is_correct": false},
                    {"title": "c3", "content": "Save them on your computer", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "What should you do about suspicious activity on the IT network?",
                "answers": [
                    {"title": "c1", "content": "Report it to IT support immediately", "is_correct": true},
                    {"title": "c2", "content": "Ignore it and continue working", "is_correct": false},
                    {"title": "c3", "content": "Tell a friend about it", "is_correct": false}
                ]
            }
        ]
    }
    }',
    2
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    1,
    'Yhdenvertaisuus ja tasa-arvo',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mitä yhdenvertaisuus tarkoittaa?",
                "answers": [
                    {"title": "c1", "content": "Tasavertainen kohtelu taustasta riippumatta", "is_correct": true},
                    {"title": "c2", "content": "Saman näköisten ihmisten suosiminen", "is_correct": false},
                    {"title": "c3", "content": "Rikkaan ja köyhän välinen jako", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Onko syrjintä hyväksyttävää?",
                "answers": [
                    {"title": "c1", "content": "Ei, se ei ole hyväksyttävää", "is_correct": true},
                    {"title": "c2", "content": "Kyllä, se on normaalia", "is_correct": false},
                    {"title": "c3", "content": "Se riippuu olosuhteista", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Mitä seurauksista voi seurata syrjinnästä?",
                "answers": [
                    {"title": "c1", "content": "Kurinpidollisia toimenpiteitä", "is_correct": true},
                    {"title": "c2", "content": "Ei mitään seurauksia", "is_correct": false},
                    {"title": "c3", "content": "Vain nuhtelua", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "What does inclusivity mean?",
                "answers": [
                    {"title": "c1", "content": "Equal treatment regardless of background", "is_correct": true},
                    {"title": "c2", "content": "Favoring people who look the same", "is_correct": false},
                    {"title": "c3", "content": "Dividing rich and poor", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Is discrimination acceptable?",
                "answers": [
                    {"title": "c1", "content": "No, it is not acceptable", "is_correct": true},
                    {"title": "c2", "content": "Yes, it is normal", "is_correct": false},
                    {"title": "c3", "content": "It depends on circumstances", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "What consequence may result from discrimination?",
                "answers": [
                    {"title": "c1", "content": "Disciplinary measures", "is_correct": true},
                    {"title": "c2", "content": "No consequences", "is_correct": false},
                    {"title": "c3", "content": "Only a reprimand", "is_correct": false}
                ]
            }
        ]
    }
    }',
    3
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    2,
    'Kunnioittava viestintä',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Missä kanavissa tulisi käyttää kunnioittavaa viestintää?",
                "answers": [
                    {"title": "c1", "content": "Sekä kasvokkain että digitaalisissa kanavissa", "is_correct": true},
                    {"title": "c2", "content": "Vain kasvokkain", "is_correct": false},
                    {"title": "c3", "content": "Vain digitaalisissa kanavissa", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Miksi kunnioittava viestintä on tärkeää?",
                "answers": [
                    {"title": "c1", "content": "Se on osa turvallista opiskeluympäristöä", "is_correct": true},
                    {"title": "c2", "content": "Se on pakollista lain mukaan", "is_correct": false},
                    {"title": "c3", "content": "Se parantaa arvosanoja", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Ketä tulisi kohdella asiallisesti?",
                "answers": [
                    {"title": "c1", "content": "Muita opiskelijoita ja henkilökuntaa", "is_correct": true},
                    {"title": "c2", "content": "Vain opettajia", "is_correct": false},
                    {"title": "c3", "content": "Vain johtajia", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "In which channels should you use respectful communication?",
                "answers": [
                    {"title": "c1", "content": "Both in person and in digital channels", "is_correct": true},
                    {"title": "c2", "content": "Only in person", "is_correct": false},
                    {"title": "c3", "content": "Only in digital channels", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Why is respectful communication important?",
                "answers": [
                    {"title": "c1", "content": "It is part of a safe learning environment", "is_correct": true},
                    {"title": "c2", "content": "It is mandatory by law", "is_correct": false},
                    {"title": "c3", "content": "It improves grades", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Who should be treated courteously?",
                "answers": [
                    {"title": "c1", "content": "Fellow students and staff", "is_correct": true},
                    {"title": "c2", "content": "Only teachers", "is_correct": false},
                    {"title": "c3", "content": "Only principals", "is_correct": false}
                ]
            }
        ]
    }
    }',
    4
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    2,
    'Hätätilanteet',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mikä on Suomen hätänumero?",
                "answers": [
                    {"title": "c1", "content": "112", "is_correct": true},
                    {"title": "c2", "content": "911", "is_correct": false},
                    {"title": "c3", "content": "123", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Mitä sinun tulisi tehdä evakuointitilanteessa?",
                "answers": [
                    {"title": "c1", "content": "Noudattaa henkilökunnan ohjeita", "is_correct": true},
                    {"title": "c2", "content": "Ottaa kaikki omaisuutesi mukaasi", "is_correct": false},
                    {"title": "c3", "content": "Pysyä kohdallasi", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Kuinka sinun tulisi käyttäytyä hätätilanteessa?",
                "answers": [
                    {"title": "c1", "content": "Rauhallisesti ja hillitysti", "is_correct": true},
                    {"title": "c2", "content": "Paniikissa ja kiireesti", "is_correct": false},
                    {"title": "c3", "content": "Auttaa muita juoksemalla", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "What is the emergency number in Finland?",
                "answers": [
                    {"title": "c1", "content": "112", "is_correct": true},
                    {"title": "c2", "content": "911", "is_correct": false},
                    {"title": "c3", "content": "123", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "What should you do during an evacuation?",
                "answers": [
                    {"title": "c1", "content": "Follow staff instructions", "is_correct": true},
                    {"title": "c2", "content": "Take all your belongings", "is_correct": false},
                    {"title": "c3", "content": "Stay in place", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "How should you behave in an emergency?",
                "answers": [
                    {"title": "c1", "content": "Calmly and composed", "is_correct": true},
                    {"title": "c2", "content": "In panic and hastily", "is_correct": false},
                    {"title": "c3", "content": "Run while helping others", "is_correct": false}
                ]
            }
        ]
    }
    }',
    5
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    2,
    'Tietosuoja',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mitä sinulla ei pitäisi tehdä henkilötiedoille?",
                "answers": [
                    {"title": "c1", "content": "Jakaa niitä ilman lupaa", "is_correct": true},
                    {"title": "c2", "content": "Käyttää niitä oikein", "is_correct": false},
                    {"title": "c3", "content": "Suojata niitä", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Kuinka sinun tulee käsitellä opiskelijatietoja?",
                "answers": [
                    {"title": "c1", "content": "Luottamuksellisesti", "is_correct": true},
                    {"title": "c2", "content": "Julkisesti", "is_correct": false},
                    {"title": "c3", "content": "Vapaasti jakaa kaikille", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "What should you not do with personal information?",
                "answers": [
                    {"title": "c1", "content": "Share it without consent", "is_correct": true},
                    {"title": "c2", "content": "Use it correctly", "is_correct": false},
                    {"title": "c3", "content": "Protect it", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "How should you handle student data?",
                "answers": [
                    {"title": "c1", "content": "Confidentially", "is_correct": true},
                    {"title": "c2", "content": "Publicly", "is_correct": false},
                    {"title": "c3", "content": "Freely share with everyone", "is_correct": false}
                ]
            }
        ]
    }
    }',
    6
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    3,
    'Hyvinvointi koulussa',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mikä on hyvinvoinnin perusta?",
                "answers": [
                    {"title": "c1", "content": "Opiskelumenestys", "is_correct": true},
                    {"title": "c2", "content": "Raha", "is_correct": false},
                    {"title": "c3", "content": "Suosio", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Mitä sinun tulisi huolehtia terveydestäsi?",
                "answers": [
                    {"title": "c1", "content": "Unesta, ravinnosta ja liikunnasta", "is_correct": true},
                    {"title": "c2", "content": "Vain opiskelusta", "is_correct": false},
                    {"title": "c3", "content": "Vain sosiaalisista suhteista", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Kuka voi auttaa sinua kohtaamissasi haasteissa?",
                "answers": [
                    {"title": "c1", "content": "Opinto-ohjaaja tai opiskelijaterveydenhuolto", "is_correct": true},
                    {"title": "c2", "content": "Vain ystävät", "is_correct": false},
                    {"title": "c3", "content": "Kukaan ei voi auttaa", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "What is the foundation of academic success?",
                "answers": [
                    {"title": "c1", "content": "Wellbeing", "is_correct": true},
                    {"title": "c2", "content": "Money", "is_correct": false},
                    {"title": "c3", "content": "Popularity", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "What should you take care of for your health?",
                "answers": [
                    {"title": "c1", "content": "Sleep, nutrition, and physical activity", "is_correct": true},
                    {"title": "c2", "content": "Only studying", "is_correct": false},
                    {"title": "c3", "content": "Only social relationships", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Who can help you with challenges you face?",
                "answers": [
                    {"title": "c1", "content": "A student counselor or student health services", "is_correct": true},
                    {"title": "c2", "content": "Only friends", "is_correct": false},
                    {"title": "c3", "content": "No one can help", "is_correct": false}
                ]
            }
        ]
    }
    }',
    7
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    3,
    'Kiusaamisen vastainen toiminta',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Onko kiusaaminen hyväksyttävää?",
                "answers": [
                    {"title": "c1", "content": "Ei, sitä ei hyväksytä missään muodossa", "is_correct": true},
                    {"title": "c2", "content": "Kyllä, se on normaalia", "is_correct": false},
                    {"title": "c3", "content": "Se riippuu tilanteesta", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Mitä sinun tulisi tehdä jos näet kiusaamista?",
                "answers": [
                    {"title": "c1", "content": "Ilmoittaa siitä luotettavalle aikuiselle", "is_correct": true},
                    {"title": "c2", "content": "Ignoroida sitä", "is_correct": false},
                    {"title": "c3", "content": "Liittyä kiusaamisen tekijöiden joukkoon", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "Millä oikeudella jokainen opiskelija on?",
                "answers": [
                    {"title": "c1", "content": "Oikeudella turvalliseen opiskeluympäristöön", "is_correct": true},
                    {"title": "c2", "content": "Oikeudella tehdä mitä tahansa", "is_correct": false},
                    {"title": "c3", "content": "Oikeudella kiusata muita", "is_correct": false}
                ]
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Is bullying acceptable?",
                "answers": [
                    {"title": "c1", "content": "No, it is not tolerated in any form", "is_correct": true},
                    {"title": "c2", "content": "Yes, it is normal", "is_correct": false},
                    {"title": "c3", "content": "It depends on the situation", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "What should you do if you witness bullying?",
                "answers": [
                    {"title": "c1", "content": "Report it to a trusted adult", "is_correct": true},
                    {"title": "c2", "content": "Ignore it", "is_correct": false},
                    {"title": "c3", "content": "Join the bullies", "is_correct": false}
                ]
            },
            {
                "title": "q3",
                "type": "quiz_question",
                "content": "What right does every student have?",
                "answers": [
                    {"title": "c1", "content": "The right to a safe learning environment", "is_correct": true},
                    {"title": "c2", "content": "The right to do anything", "is_correct": false},
                    {"title": "c3", "content": "The right to bully others", "is_correct": false}
                ]
            }
        ]
    }
    }',
    8
);

INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
VALUES (
    3,
    'Kestävä kampus',
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
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Mistä kestävä kehitys alkaa?",
                "answers": [
                    {"title": "c1", "content": "Arjen valinnoista", "is_correct": true},
                    {"title": "c2", "content": "Hallituksen päätöksistä", "is_correct": false},
                    {"title": "c3", "content": "Teknologiasta", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "Mitä sinun tulisi tehdä lähtiessäsi huoneesta?",
                "answers": [
                    {"title": "c1", "content": "Sammuttaa valot", "is_correct": true},
                    {"title": "c2", "content": "Jättää valot päälle", "is_correct": false},
                    {"title": "c3", "content": "Hämmentää valoja", "is_correct": false}
                ]
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
                "content": "🌱 Sustainability starts with everyday choices. Sort waste correctly, turn off lights when leaving, use public transportation, and reduce single-use plastic on campus."
            }
        ],
        "questions": [
            {
                "title": "q1",
                "type": "quiz_question",
                "content": "Where does sustainability start?",
                "answers": [
                    {"title": "c1", "content": "Everyday choices", "is_correct": true},
                    {"title": "c2", "content": "Government decisions", "is_correct": false},
                    {"title": "c3", "content": "Technology", "is_correct": false}
                ]
            },
            {
                "title": "q2",
                "type": "quiz_question",
                "content": "What should you do when leaving a room?",
                "answers": [
                    {"title": "c1", "content": "Turn off the lights", "is_correct": true},
                    {"title": "c2", "content": "Leave the lights on", "is_correct": false},
                    {"title": "c3", "content": "Dim the lights", "is_correct": false}
                ]
            }
        ]
    }
    }',
    9
);

INSERT INTO CrisisTeam (organization_id, name_fi, name_en, role_fi, role_en, phone, order_number)
VALUES
  (1, 'Teemu Kokko',    'Teemu Kokko',    'Rehtori',                      'Rector',                    '050 555 1131',  1),
  (1, 'Minna Hiillos',  'Minna Hiillos',  'Vararehtori',                  'Vice Rector',               '050 583 9521',  2),
  (1, 'Kari Salmi',     'Kari Salmi',     'Hallintojohtaja',              'Administrative Director',   '0400 675 114',  3),
  (1, 'Ari Nevalainen', 'Ari Nevalainen', 'Viestintäpäällikkö',           'Communications Manager',    '040 488 7008',  4),
  (1, 'Jenni Most',     'Jenni Most',     'Toimitilapäällikkö',           'Facilities Manager',        '040 488 7144',  5),
  (1, 'Virpi Virtanen', 'Virpi Virtanen', 'ICT-infrastruktuuripäällikkö', 'ICT-infrastructure Manager','050 911 1644',  6),
  (1, 'Mia Kivelä',     'Mia Kivelä',     'Turvallisuuspäällikkö',        'Security Manager',          '050 911 1644',  7);