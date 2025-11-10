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
    profile_name VARCHAR(255) NOT NULL,
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
INSERT INTO TurvaUser (organization_id, profile_name)
VALUES (
    1, 
    'Jane Doe'
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















-- QUIZ - WORLD 1 - QUIZ 1
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
			},
			{
				"title": "p2",
				"type": "quiz_info",
				"content": "Vastuulista toimintaa on mm. \\n🔍 Noudatat oppilaitoksen sääntöjä ja ohjeita sekä tehtävien tekemisen hyviä käytänteitä \\n🔍 Käyttäydyt asiallisesti kampuksella ja verkossa \\n🔍 Et plagioi tehtävissä \\n🔍 Kunnioitat muiden työrauhaa ja omaisuutta"
			},
			{
				"title": "p3",
				"type": "quiz_info",
				"content": "💡 Säännöt perustuvat ammattikorkeakoululakiin (932/2014) ja – asetukseen (1129/2014), joilla taataan turvallinen ja tasa-arvoisen opiskeluyhteisö."
			},
			{
				"title": "p4",
				"type": "quiz_info",
				"content": "👉 Käy tutustumassa järjestyssääntöihin! Linkin järjestyssääntöihin löydät myös sovelluksen hakemistosta."
			},
			{
				"title": "p5",
				"type": "quiz_header",
				"content": "🧠 Valitse oikea toimintatapa. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],

		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Mikä alla olevista on vastuullista toimintaa kampuksella?",

				"answers": [
					{
						"title": "a1",
						"content": "Jättää laukku ja takki luokan keskelle muiden liikkumisalueelle",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Käyttää toisen opiskelijan tunnuksia, koska omat tunnuksesi eivät toimi",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Ottaa kuulokkeet pois ja kuunnella opettajaa tunnilla",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Tulla päihtyneenä tunnille, jotta ei tule poissaolomerkintää",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mikä seuraavista on vastuullinen tapa tehdä oppimistehtävä?",

				"answers": [
					{
						"title": "a1",
						"content": "Pyytää tekoälyä tuottamaan koko tehtävän ja palauttaa sen sellaisenaan",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Kysyä kaverilta hänen vastauksensa ja muokata sen omaksesi",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Tehdä tehtävän itse ja viitata lähteisiin selkeästi",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Käyttää edellisen kurssin malliratkaisua ilman mainintaa",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mikä on järjestyssääntöjen mukainen toiminta kampuksella?",

				"answers": [
					{
						"title": "a1",
						"content": "Järjestää mielenosoitus kampuksen sisätiloissa",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Pitää kampuksen yhteiset tilat siisteinä ja noudatat käyttäytymissääntöjä",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Tuoda potkulauta luokkaan",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Järjestää bileet luokassa",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä seuraavista on vastuullista digikäyttäytymistä opiskelijana?",

				"answers": [
					{
						"title": "a1",
						"content": "Jakaa opettajan laatimat kurssimateriaalit avoimesti somessa",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Kirjautua ulos koneelta ja pitää omat käyttäjätunnukset salassa",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Antaa käyttäjätunnukset kaverille, jotta hän pääsee kirjaston kautta lukemaan e-kirjoja",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Käyttää koulun sähköpostiosoitetta tekoälypalveluihin kirjautumiseen",
						"is_correct": false
					}
				]
			}
		]
	},

	"en": {
		"quiz_intro": [
			{
				"title": "p0",
				"type": "quiz_header",
				"content": "Act responsibly"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 The rules and regulations define your rights and obligations as a student. Everyone is responsible for acting in a way that keeps the community safe, fair, and conducive to learning. Violations of the rules and regulations may result in disciplinary action."
			},
			{
				"title": "p2",
				"type": "quiz_info",
				"content": "Responsible behavior includes \\n🔍 Following the rules and instructions of the educational institution and good practices for completing assignments \\n🔍 Behaving appropriately on campus and online \\n🔍 Not plagiarizing in assignments \\n🔍 Respecting the working environment and property of others"
			},
			{
				"title": "p3",
				"type": "quiz_info",
				"content": "💡 The rules are based on the Act on Universities of Applied Sciences (932/2014) and the Decree on Universities of Applied Sciences (1129/2014), which guarantee a safe and equal study community."
			},
			{
				"title": "p4",
				"type": "quiz_info",
				"content": "👉 Check out the rules and regulations! You can also find a link to the rules and regulations in the application directory."
			},
			{
				"title": "p5",
				"type": "quiz_header",
				"content": "🧠 Choose the right course of action. Answer the four questions. Only one answer option is correct for each question."
			}
		],

		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "Which of the following is responsible behavior on campus?",
				"answers": [
					{
						"title": "a1",
						"content": "Leaving your bag and coat in the middle of the classroom where others walk",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Using another student\'s login details because your own don\'t work",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Taking off your headphones and listening to the teacher during class",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Coming to class intoxicated so you won\'t be marked absent",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "Which of the following is a responsible way to complete a learning assignment?",
				"answers": [
					{
						"title": "a1",
						"content": "Asking artificial intelligence to produce the entire assignment and submitting it as is",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Ask a friend for their answers and edit them to make them your own",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Do the assignment yourself and clearly cite your sources",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Using a model solution from a previous course without attribution",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "What is acceptable behavior on campus according to the rules and regulations?",
				"answers": [
					{
						"title": "a1",
						"content": "Organizing a protest inside the campus",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Keeping the campus common areas clean and following the rules of conduct",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Bring a scooter to class",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Organizing a party in the classroom",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "Which of the following is responsible digital behavior as a student?",
				"answers": [
					{
						"title": "a1",
						"content": "Share course materials prepared by the teacher openly on social media",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Log out of the computer and keep your user IDs secret",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Giving your username to a friend so they can read e-books through the library",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Using your school email address to log in to artificial intelligence services",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    1
    );








-- QUIZ - WORLD 1 - QUIZ 2
INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1, 
    'Safety Walk', 
    '{
	"fi": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "Mikä on turvallisuuskävely?"
			},
			{
				"title": "p2",
				"type": "quiz_info",
				"content": "🎓 Turvallisuuskävely on kampuksella tehtävä kierros, jonka tarkoituksena on tunnistaa tilojen turvallisuuteen ja käytettävyyteen liittyviä asioita. Fyysinen kävely tehdään orientaatioviikolla."
			},
			{
				"title": "p3",
				"type": "quiz_info",
				"content": "Turvallisuuskävelyn aikana kiinnitetään huomiota mm. seuraaviin asioihin: \n🔍 Poistumisreitit ja -opasteet \n🔍 Ensiapuvälineiden ja sammutuskaluston sijainnit \n🔍 Hätäilmoitusten ohjeistus \n🔍 Turvallisuutta tukevat rakenteet ja esteettömyys \n🔍 Kampuksen tilojen yleinen turvallisuus"
			},
			{
				"title": "p4",
				"type": "quiz_info",
				"content": "💡 Turvallisuuskävely auttaa ennakoimaan mahdollisia vaaratilanteita ja opettaa reagoimaan oikein hätätilanteissa."
			},
			{
				"title": "p5",
				"type": "quiz_info",
				"content": "▶️ Katso Pasilan kampuksen turvallisuuskävelyvideo. Linkit muiden Haaga-Helian kampusten turvallisuuskävelyvideoihin löydät sovelluksen hakemistosta."
			},
			{
				"title": "p6",
				"type": "quiz_header",
				"content": "🧠 Tunnista turvallisuuskävelyn tarkoitus ja sisältö. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],
		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Miksi turvallisuuskävely tehdään?",
				"answers": [
					{
						"title": "a1",
						"content": "Jotta opiskelijat osaavat järjestää tilat itselleen viihtyisiksi",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Jotta kampuksen käyttäjät tietävät, missä tiloissa opetusta järjestetään",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Jotta opiskelijat tunnistavat tilojen turvallisuusjärjestelyt ja osaavat toimia hätätilanteessa",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Jotta voidaan arvioida tilojen sisustuksellista toimivuutta",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mikä alla olevista kuuluu turvallisuuskävelyn tarkkailukohteisiin?",
				"answers": [
					{
						"title": "a1",
						"content": "Luokan opetustekniikka ja laitteiden ominaisuudet",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Poistumisopasteiden sijainti ja näkyvyys",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Kurssin sisällöt ja arviointikriteerit",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Lukujärjestysten selkeys ja luokkatilojen aikataulutus",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mitä turvallisuuskävelyllä tehdään, jos huomaat hätäpoistumistien olevan tukittu?",
				"answers": [
					{
						"title": "a1",
						"content": "Tehdään turvallisuushavaintoilmoitus",
						"is_correct": true
					},
					{
						"title": "a2",
						"content": "Siirrytään seuraavaan kohtaan ja ohitetaan asia",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Yritetään siirtää esteet itse pois",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Kirjoitetaan palaute opettajalle",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä seuraavista on esimerkki turvallisuuskävelyllä havaittavasta asiasta?",
				"answers": [
					{
						"title": "a1",
						"content": "Luokan ergonomiset kalusteet",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Siivouskomeron organisointi",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Sammuttimen sijainti",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Ilmoitustaulun ulkoasu",
						"is_correct": false
					}
				]
			}
		]
	},
	"en": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "What is a safety walk?"
			},
			{
				"title": "p2",
				"type": "quiz_info",
				"content": "🎓 A safety walk is a tour of the campus with the aim of identifying issues related to the safety and usability of the premises. The physical walk takes place during orientation week. "
			},
			{
				"title": "p3",
				"type": "quiz_info",
				"content": "During the safety walk, attention is paid to the following issues, among others: \n🔍 Emergency exits and signs \n🔍 Locations of first aid equipment and fire extinguishers \n🔍 Emergency notification instructions \n🔍 Structures and accessibility that support safety \n🔍 General safety of campus facilities"
			},
			{
				"title": "p4",
				"type": "quiz_info",
				"content": "💡 A safety walk helps you anticipate potential hazards and teaches you how to respond correctly in an emergency."
			},
			{
				"title": "p5",
				"type": "quiz_info",
				"content": "▶️ Watch the Pasila campus safety walk video. Links to safety walk videos for other Haaga-Helia campuses can be found in the application directory."
			},
			{
				"title": "p6",
				"type": "quiz_header",
				"content": "🧠 Understand the purpose and content of the safety walk. Answer the four questions. Only one answer option is correct for each question."
			}
		],
		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "Why is the safety walk conducted?",
				"answers": [
					{
						"title": "a1",
						"content": "So that students know how to organize the facilities to make them comfortable for themselves",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "So that campus users know where teaching takes place",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "So that students recognize the safety arrangements in the premises and know how to act in an emergency",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "So that the functionality of the interior design can be assessed",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "Which of the following are included in the safety walk observation points?",
				"answers": [
					{
						"title": "a1",
						"content": "Classroom teaching technology and equipment features",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Location and visibility of exit signs",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Course content and assessment criteria",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Clarity of timetables and scheduling of classrooms",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "What should you do during a safety walk if you notice that an emergency exit is blocked?",
				"answers": [
					{
						"title": "a1",
						"content": "Make a safety observation report",
						"is_correct": true
					},
					{
						"title": "a2",
						"content": "Move on to the next point and ignore the issue",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Try to remove the obstacles yourself",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Write feedback to the teacher",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "Which of the following is an example of something you might notice during a safety walk?",
				"answers": [
					{
						"title": "a1",
						"content": "Ergonomic furniture in the classroom",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "The organization of the cleaning closet",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Location of a fire extinguisher",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Appearance of the notice board",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    2
    );














-- QUIZ - WORLD 1 - QUIZ 3
INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1, 
    'Recognizing Risks', 
    '{
	"fi": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "Mikä on riski, uhka ja vaara opiskelijan näkökulmasta?"
			},
			{
				"title": "p2",
				"type": "quiz_info",
				"content": "🎓 Opiskelu voi tuntua turvalliselta, mutta siihenkin liittyy riskejä, aivan kuten mihin tahansa työhön. Jotta voit toimia vastuullisesti, sinun on hyvä tunnistaa peruskäsitteet (Kokonaisturvallisuuden sanasto 2017)."
			},
			{
				"title": "p3",
				"type": "quiz_info",
				"content": "🔍 Vaara on tapahtuma tai kehityskulku, joka hyvin todennäköisesti tai parhaillaan aiheuttaa vahinkoa, haittaa tai menetyksiä. Vaaraa voidaan käsitellä riskienhallinnan keinoin. Esimerkiksi märkä lattia on vaara, koska siihen voi helposti liukastua."
			},
			{
				"title": "p4",
				"type": "quiz_info",
				"content": "🔍 Uhka on tapahtuma tai kehityskulku, joka saattaa toteutua tulevaisuudessa. Esimerkiksi jos kukaan ei huomaa märkää lattiaa ja sitä ei siivota, joku saattaa liukastua ja tämä on uhka."
			},
			{
				"title": "p5",
				"type": "quiz_info",
				"content": "🔍 Riski tarkoittaa tapahtuman tai kehityskulun todennäköisyyden ja vaikutusten yhdistelmää. Se voi olla kielteinen (uhka) tai joskus myös myönteinen (mahdollisuus). Esimerkiksi jos lattia on jatkuvasti märkä ja ohikulku on vilkasta, riski liukastumiseen on korkea, ja seurauksena voi olla loukkaantuminen."
			},
			{
				"title": "p6",
				"type": "quiz_info",
				"content": "Riskinä voidaan pitää myös sellaista tapahtumaa, jota ei ole kyetty nimeämään lainkaan. Riskienhallintaa tarvitaan organisaation kaikissa toiminnoissa ja kaikilla tasoilla. "
			},
			{
				"title": "p7",
				"type": "quiz_info",
				"content": "💡 Kun tunnistat vaarat ajoissa, voit vaikuttaa siihen, ettei uhka toteudu ja siten pienennät riskiä."
			},
			{
				"title": "p8",
				"type": "quiz_header",
				"content": "🧠 Tunnista riskit ja vaaratekijät. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],
		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Mikä kuvaa parhaiten, mitä tarkoitetaan sanalla riski?",
				"answers": [
					{
						"title": "a1",
						"content": "Uhkaava tilanne on jo tapahtunut",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Tieto siitä, miten suojautua vaaroilta",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Todennäköisyys, että uhka toteutuu ja aiheuttaa haittaa",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Tilanne, jossa joku tuntee olonsa epävarmaksi",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mikä seuraavista on suurin fyysinen riski tavallisessa kampusympäristössä?",
				"answers": [
					{
						"title": "a1",
						"content": "Luokan penkki ei ole ergonominen",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Kulkureitillä on jatkojohto ilman merkintää",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Opettajan ääni ei kuulu hyvin takariviin",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Luokassa ei ole kahvikonetta",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mikä seuraavista kuvaa digitaalisen opiskelun turvallisuusriskiä?",
				"answers": [
					{
						"title": "a1",
						"content": "Moodlen käyttö mobiililaitteella",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Hidas nettiyhteys kotona",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Salasanojen säilyttäminen post-it-lapulla näppäimistön alla",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Luentotallenteen katseleminen julkisessa tilassa",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä seuraavista voi olla opiskeluyhteisön näkökulmasta riski psykologiselle turvallisuudelle?",
				"answers": [
					{
						"title": "a1",
						"content": "Opiskelijalla on erilainen oppimistyylinsä kuin muilla",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Ryhmätyössä yksi opiskelija ei saa puheenvuoroa ja häntä vähätellään",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Luennolla käsitellään vaikeaa aihetta",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Tentti palautetaan paperilla eikä sähköisesti",
						"is_correct": false
					}
				]
			}
		]
	},

	"en": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "What are risks, threats and hazards from a student’s perspective?"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 Studying may feel safe, but it involves risks, just like any job. In order to act responsibly, you need to understand the basic concepts and terms."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🔍 A hazard is an event or sequence of events that is very likely to cause damage, harm, or loss, or is currently doing so. Hazards can be addressed through risk management measures. For example, a wet floor is a hazard because it is easy to slip on."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🔍 A threat is an event or development that may occur in the future. For example, if no one notices the wet floor and it is not cleaned up, someone may slip, and this is a threat."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🔍 Risk refers to the combination of the probability and impact of an event or development. It can be negative (threat) or sometimes positive (opportunity). For example, if the floor is constantly wet and there is heavy foot traffic, the risk of slipping is high, and the result could be injury."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "An event that cannot be identified at all can also be considered a risk. Risk management is needed in all functions and at all levels of an organization."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "💡 When you identify hazards in time, you can prevent the threat from materializing and thus reduce the risk."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Identify risks and hazards. Answer the four questions. Only one answer option is correct for each question."
			}
		],
		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "Which best describes what is meant by the word risk?",
				"answers": [
					{
						"title": "a1",
						"content": "The threatening situation has already occurred",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Knowledge of how to protect yourself from hazards",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "The probability that the threat will materialize and cause harm",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "A situation in which someone feels insecure",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "Which of the following is the greatest physical risk in a typical campus environment?",
				"answers": [
					{
						"title": "a1",
						"content": "Classroom desks are not ergonomic",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "There is an extension cord without any markings on the walkway",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "The teacher\'s voice cannot be heard well in the back row",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "There is no coffee machine in the classroom",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "Which of the following describes a safety risk in digital learning?",
				"answers": [
					{
						"title": "a1",
						"content": "Using Moodle on a mobile device",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Slow internet connection at home",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Keeping passwords on a Post-it note under the keyboard",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Watching lecture recordings in a public space",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "Which of the following could be a risk to psychological safety from the perspective of the learning community?",
				"answers": [
					{
						"title": "a1",
						"content": "A student has a different learning style than others",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "In group work, one student is not given a chance to speak and is belittled",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "The lecture deals with a difficult topic",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "The exam is returned on paper rather than electronically",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    3
    );



















-- QUIZ - WORLD 1 - QUIZ 4
INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1, 
    'Safety Report', 
    '{
	"fi": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "Mikä on turvallisuushavaintoilmoitus?"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 Turvallisuushavaintoilmoitus on tapa kertoa havaitsemistasi turvallisuuteen liittyvistä asioista, niin riskeistä kuin hyvistä käytännöistä. Havainto voi koskea tilannetta, jossa jokin voi aiheuttaa vaaraa, tai se voi olla esimerkki siitä, miten turvallisuus toteutuu hienosti arjessa. Ilmoitusten avulla voidaan ehkäistä tapaturmia ja kehittää ympäristöä turvallisemmaksi. Jokainen havainto on arvokas ja se kertoo, että opiskelijat oikeasti kiinnittävät huomiota ympäristöönsä."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "Esimerkkejä: \n🔍 Vaarallinen tilanne: Luokassa on jatkojohto lattialla kulkureitillä (kompastumisriski). \n🔍 Puute: ”Hätätilanne, soita 112” -ohjeet puuttuvat luokan ilmoitustaululta. \n🔍 Positiivinen havainto: Ovet merkitty selkeästi hätäpoistumista varten. \n🔍 Hyvä käytäntö: Kierrätysastiat ovat selvästi merkitty ja helposti saavutettavissa."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "💡 Muista, että turvallisuushavainto ei ole valitus, vaan se on kehitysehdotus turvallisuuden näkökulmasta."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Tunnista turvallisuushavaintoilmoitus. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],
		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Mikä alla olevista on turvallisuushavaintoilmoitus?",
				"answers": [
					{
						"title": "a1",
						"content": "Opiskelija ei saanut yhteenvetoa kurssipalautteesta",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Luokan ovea ei saa lukkoon ja huoneessa on henkilökohtaisia tavaroita",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Ehdotus laadukkaammasta kahvista ruokalassa",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Kommentti tentin vaikeustasosta",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mikä seuraavista liittyy turvallisuushavaintoilmoitukseen?",
				"answers": [
					{
						"title": "a1",
						"content": "Jäätä koulun sisäänkäynnin edessä",
						"is_correct": true
					},
					{
						"title": "a2",
						"content": "Ehdotus siitä, että opettaja antaisi ohjeet myös kirjallisena",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Tulostin on hidas eikä toimi kunnolla",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Ruokalassa tarjottu kasvisvaihtoehto",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mikä alla olevista on esimerkki positiivisesta turvallisuushavainnosta?",
				"answers": [
					{
						"title": "a1",
						"content": "Tauolla tarjoiltiin opiskelijoille välipaloja",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Luokassa on selkeät poistumisohjeet näkyvillä",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Opiskelija oli pukeutunut siististi esitystä varten",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Luentokalvoissa on hyvä fonttikoko",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä seuraavista EI ole turvallisuushavaintoilmoitus?",
				"answers": [
					{
						"title": "a1",
						"content": "Ehdotus siitä, että ensiapulaukkuun lisätään käyttöohje",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Ilmoitus siitä, että aula on tukittu siirrettävällä kalustolla",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Palaute kurssin mielenkiintoisuudesta",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Positiivinen palaute siitä, että hätäuloskäynnit ovat hyvin merkityt",
						"is_correct": false
					}
				]
			}
		]
	},
	"en": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "What is a safety observation report?"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 A safety observation report is a way to report things related to safety you have noticed, both risks and good practices. The observation may concern a situation that could cause danger, or it may be an example of how safety is implemented well in everyday life. Reports can help prevent accidents and make the environment safer. Every observation is valuable and shows that students are really paying attention to their environment."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "Examples: \n🔍 Dangerous situation: There is an extension cord on the floor in the classroom, in the way (risk of tripping). \n🔍 Deficiency: The <Emergency, call 112 instructions are missing from the classroom notice board. \n🔍 Positive observation: Doors are clearly marked for emergency exits. \n🔍 Good practice: Recycling bins are clearly marked and easily accessible."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "💡 Remember that a safety observation is not a complaint, but a suggestion for improvement from a safety perspective."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Identify the safety observation report. Answer the four questions. Only one answer option is correct for each question."
			}
		],
		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "Which of the following is a reasonable safety observation report?",
				"answers": [
					{
						"title": "a1",
						"content": "The student did not receive a summary of the course feedback",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "The classroom door cannot be locked and there are personal belongings in the room",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Proposal for higher quality coffee in the cafeteria",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Comment on the difficulty level of the exam",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "Which of the following should be a topic for a safety observation report?",
				"answers": [
					{
						"title": "a1",
						"content": "Ice in front of the school entrance",
						"is_correct": true
					},
					{
						"title": "a2",
						"content": "Suggestion that the teacher also provide instructions in writing",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "The printer is slow and does not work properly",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Vegetarian option offered in the cafeteria",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "Which of the following is an example of a positive safety observation?",
				"answers": [
					{
						"title": "a1",
						"content": "Snacks were served to students during the break",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Clear evacuation instructions are displayed in the classroom",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "The student was dressed neatly for the presentation",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "The font size on the lecture slides is good",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "Which of the following is NOT a safety observation report?",
				"answers": [
					{
						"title": "a1",
						"content": "A suggestion to add instructions for use to the first aid kit",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "A report that the lobby is blocked by movable furniture",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Feedback on the interest of the course",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Positive feedback that emergency exits are clearly marked",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    4
    );









-- QUIZ - WORLD 1 - QUIZ 5
INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    1, 
    'Exiting the Building', 
    '{
	"fi": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "Näin toimit, jos rakennuksessa syttyy tulipalo"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 Tulipalon sattuessa tärkeintä on pysyä rauhallisena ja toimia nopeasti. Noudata oppilaitoksen pelastussuunnitelmaa ja toimintaohjevideon ohjeita."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "▶️ Katso toimintaohjevideo Poistuminen rakennuksesta."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Tunnista oikeat toimenpiteet rakennuksesta poistuttaessa. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],
		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Mitä sinun tulee tehdä ensimmäisenä, jos havaitset tulipalon?",
				"answers": [
					{
						"title": "a1",
						"content": "Hakea laukku ja henkilökohtaiset tavarat",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Soittaa kaverille ja kertoa tilanteesta",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Tehdä alkusammutus ja Ilmoittaa asiasta 112:een",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Kuvata tilanne someen",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mitä sinun tulee tehdä ennen poistumista, jos se on turvallista?",
				"answers": [
					{
						"title": "a1",
						"content": "Ottaa mukaan kaikki koulutarvikkeet",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Sammuttaa valot ja ilmastointi",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Sulkea ikkunat",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Kirjoittaa opettajalle viesti tilanteesta",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mikä seuraavista on oikea tapa poistua rakennuksesta tulipalon aikana?",
				"answers": [
					{
						"title": "a1",
						"content": "Käytä hissiä, jos portaat ovat ruuhkautuneet",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Poistu lähintä merkittyä poistumistietä pitkin",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Odota luokassa, jos et näe liekkejä käytävällä",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Juokse mahdollisimman nopeasti ilman ohjeita",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä on oikea toiminta kokoontumispaikalla?",
				"answers": [
					{
						"title": "a1",
						"content": "Poistua paikalta, kun savua ei enää näy",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Odottaa, että opettaja tuo uudet ohjeet",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Odottaa kokoontumispaikalla, kunnes olet saanut luvan poistua",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Palata sisälle tarkistamaan, jäikö joku luokkaan",
						"is_correct": false
					}
				]
			}
		]
	},
	"en": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "What to do if a fire breaks out in the building"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 In the event of a fire, the most important thing is to remain calm and act quickly. Follow the school\'s emergency plan and the instructions in the video."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "▶️ Watch this video on exiting the building."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Identify the correct procedures for exiting the building. Answer the four questions. Only one answer option is correct for each question."
			}
		],
		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "What should you do first if you notice a fire?",
				"answers": [
					{
						"title": "a1",
						"content": "Grab your bag and personal belongings",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Call a friend and tell them about the situation",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Attempt to extinguish the fire and call 112",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Post about the situation on social media",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "What should you do before leaving, if it is safe to do so?",
				"answers": [
					{
						"title": "a1",
						"content": "Take all your school supplies with you",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Turn off the lights and air conditioning",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Close the windows",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Write a message to the teacher about the situation",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "Which of the following is the correct way to leave a building during a fire?",
				"answers": [
					{
						"title": "a1",
						"content": "Use the elevator if the stairs are crowded",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Exit via the nearest marked exit",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Wait in the classroom if you cannot see flames in the hallway",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Run as fast as possible without instructions",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "What is the correct course of action at the assembly point?",
				"answers": [
					{
						"title": "a1",
						"content": "Leave the area when there is no longer any smoke",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Wait for the teacher to give new instructions",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Wait at the assembly point until you are given permission to leave",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Return inside to check if anyone has been left behind in the classroom",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    5
    );

















-- QUIZ - WORLD 2 - QUIZ 1
-- JUST FOR TESTING
INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    2, 
    'Exiting the Building', 
    '{
	"fi": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "Näin toimit, jos rakennuksessa syttyy tulipalo"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 Tulipalon sattuessa tärkeintä on pysyä rauhallisena ja toimia nopeasti. Noudata oppilaitoksen pelastussuunnitelmaa ja toimintaohjevideon ohjeita."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "▶️ Katso toimintaohjevideo Poistuminen rakennuksesta."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Tunnista oikeat toimenpiteet rakennuksesta poistuttaessa. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],
		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Mitä sinun tulee tehdä ensimmäisenä, jos havaitset tulipalon?",
				"answers": [
					{
						"title": "a1",
						"content": "Hakea laukku ja henkilökohtaiset tavarat",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Soittaa kaverille ja kertoa tilanteesta",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Tehdä alkusammutus ja Ilmoittaa asiasta 112:een",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Kuvata tilanne someen",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mitä sinun tulee tehdä ennen poistumista, jos se on turvallista?",
				"answers": [
					{
						"title": "a1",
						"content": "Ottaa mukaan kaikki koulutarvikkeet",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Sammuttaa valot ja ilmastointi",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Sulkea ikkunat",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Kirjoittaa opettajalle viesti tilanteesta",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mikä seuraavista on oikea tapa poistua rakennuksesta tulipalon aikana?",
				"answers": [
					{
						"title": "a1",
						"content": "Käytä hissiä, jos portaat ovat ruuhkautuneet",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Poistu lähintä merkittyä poistumistietä pitkin",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Odota luokassa, jos et näe liekkejä käytävällä",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Juokse mahdollisimman nopeasti ilman ohjeita",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä on oikea toiminta kokoontumispaikalla?",
				"answers": [
					{
						"title": "a1",
						"content": "Poistua paikalta, kun savua ei enää näy",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Odottaa, että opettaja tuo uudet ohjeet",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Odottaa kokoontumispaikalla, kunnes olet saanut luvan poistua",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Palata sisälle tarkistamaan, jäikö joku luokkaan",
						"is_correct": false
					}
				]
			}
		]
	},
	"en": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "What to do if a fire breaks out in the building"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 In the event of a fire, the most important thing is to remain calm and act quickly. Follow the school\'s emergency plan and the instructions in the video."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "▶️ Watch this video on exiting the building."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Identify the correct procedures for exiting the building. Answer the four questions. Only one answer option is correct for each question."
			}
		],
		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "What should you do first if you notice a fire?",
				"answers": [
					{
						"title": "a1",
						"content": "Grab your bag and personal belongings",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Call a friend and tell them about the situation",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Attempt to extinguish the fire and call 112",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Post about the situation on social media",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "What should you do before leaving, if it is safe to do so?",
				"answers": [
					{
						"title": "a1",
						"content": "Take all your school supplies with you",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Turn off the lights and air conditioning",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Close the windows",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Write a message to the teacher about the situation",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "Which of the following is the correct way to leave a building during a fire?",
				"answers": [
					{
						"title": "a1",
						"content": "Use the elevator if the stairs are crowded",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Exit via the nearest marked exit",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Wait in the classroom if you cannot see flames in the hallway",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Run as fast as possible without instructions",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "What is the correct course of action at the assembly point?",
				"answers": [
					{
						"title": "a1",
						"content": "Leave the area when there is no longer any smoke",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Wait for the teacher to give new instructions",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Wait at the assembly point until you are given permission to leave",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Return inside to check if anyone has been left behind in the classroom",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    1
    );

















-- QUIZ - WORLD 3 - QUIZ 1
-- JUST FOR TESTING
INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
VALUES (
    3, 
    'Recognizing Risks', 
    '{
	"fi": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "Mikä on riski, uhka ja vaara opiskelijan näkökulmasta?"
			},
			{
				"title": "p2",
				"type": "quiz_info",
				"content": "🎓 Opiskelu voi tuntua turvalliselta, mutta siihenkin liittyy riskejä, aivan kuten mihin tahansa työhön. Jotta voit toimia vastuullisesti, sinun on hyvä tunnistaa peruskäsitteet (Kokonaisturvallisuuden sanasto 2017)."
			},
			{
				"title": "p3",
				"type": "quiz_info",
				"content": "🔍 Vaara on tapahtuma tai kehityskulku, joka hyvin todennäköisesti tai parhaillaan aiheuttaa vahinkoa, haittaa tai menetyksiä. Vaaraa voidaan käsitellä riskienhallinnan keinoin. Esimerkiksi märkä lattia on vaara, koska siihen voi helposti liukastua."
			},
			{
				"title": "p4",
				"type": "quiz_info",
				"content": "🔍 Uhka on tapahtuma tai kehityskulku, joka saattaa toteutua tulevaisuudessa. Esimerkiksi jos kukaan ei huomaa märkää lattiaa ja sitä ei siivota, joku saattaa liukastua ja tämä on uhka."
			},
			{
				"title": "p5",
				"type": "quiz_info",
				"content": "🔍 Riski tarkoittaa tapahtuman tai kehityskulun todennäköisyyden ja vaikutusten yhdistelmää. Se voi olla kielteinen (uhka) tai joskus myös myönteinen (mahdollisuus). Esimerkiksi jos lattia on jatkuvasti märkä ja ohikulku on vilkasta, riski liukastumiseen on korkea, ja seurauksena voi olla loukkaantuminen."
			},
			{
				"title": "p6",
				"type": "quiz_info",
				"content": "Riskinä voidaan pitää myös sellaista tapahtumaa, jota ei ole kyetty nimeämään lainkaan. Riskienhallintaa tarvitaan organisaation kaikissa toiminnoissa ja kaikilla tasoilla. "
			},
			{
				"title": "p7",
				"type": "quiz_info",
				"content": "💡 Kun tunnistat vaarat ajoissa, voit vaikuttaa siihen, ettei uhka toteudu ja siten pienennät riskiä."
			},
			{
				"title": "p8",
				"type": "quiz_header",
				"content": "🧠 Tunnista riskit ja vaaratekijät. Vastaa neljään kysymykseen. Jokaisessa kysymyksessä vain yksi vastausvaihtoehto on oikein."
			}
		],
		"questions": [
			{
				"title": "Kysymys 1",
				"type": "quiz_question",
				"content": "Mikä kuvaa parhaiten, mitä tarkoitetaan sanalla riski?",
				"answers": [
					{
						"title": "a1",
						"content": "Uhkaava tilanne on jo tapahtunut",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Tieto siitä, miten suojautua vaaroilta",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Todennäköisyys, että uhka toteutuu ja aiheuttaa haittaa",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Tilanne, jossa joku tuntee olonsa epävarmaksi",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 2",
				"type": "quiz_question",
				"content": "Mikä seuraavista on suurin fyysinen riski tavallisessa kampusympäristössä?",
				"answers": [
					{
						"title": "a1",
						"content": "Luokan penkki ei ole ergonominen",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Kulkureitillä on jatkojohto ilman merkintää",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Opettajan ääni ei kuulu hyvin takariviin",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Luokassa ei ole kahvikonetta",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 3",
				"type": "quiz_question",
				"content": "Mikä seuraavista kuvaa digitaalisen opiskelun turvallisuusriskiä?",
				"answers": [
					{
						"title": "a1",
						"content": "Moodlen käyttö mobiililaitteella",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Hidas nettiyhteys kotona",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Salasanojen säilyttäminen post-it-lapulla näppäimistön alla",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Luentotallenteen katseleminen julkisessa tilassa",
						"is_correct": false
					}
				]
			},
			{
				"title": "Kysymys 4",
				"type": "quiz_question",
				"content": "Mikä seuraavista voi olla opiskeluyhteisön näkökulmasta riski psykologiselle turvallisuudelle?",
				"answers": [
					{
						"title": "a1",
						"content": "Opiskelijalla on erilainen oppimistyylinsä kuin muilla",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Ryhmätyössä yksi opiskelija ei saa puheenvuoroa ja häntä vähätellään",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "Luennolla käsitellään vaikeaa aihetta",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "Tentti palautetaan paperilla eikä sähköisesti",
						"is_correct": false
					}
				]
			}
		]
	},

	"en": {
		"quiz_intro": [
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "What are risks, threats and hazards from a student’s perspective?"
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🎓 Studying may feel safe, but it involves risks, just like any job. In order to act responsibly, you need to understand the basic concepts and terms."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🔍 A hazard is an event or sequence of events that is very likely to cause damage, harm, or loss, or is currently doing so. Hazards can be addressed through risk management measures. For example, a wet floor is a hazard because it is easy to slip on."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🔍 A threat is an event or development that may occur in the future. For example, if no one notices the wet floor and it is not cleaned up, someone may slip, and this is a threat."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "🔍 Risk refers to the combination of the probability and impact of an event or development. It can be negative (threat) or sometimes positive (opportunity). For example, if the floor is constantly wet and there is heavy foot traffic, the risk of slipping is high, and the result could be injury."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "An event that cannot be identified at all can also be considered a risk. Risk management is needed in all functions and at all levels of an organization."
			},
			{
				"title": "p1",
				"type": "quiz_info",
				"content": "💡 When you identify hazards in time, you can prevent the threat from materializing and thus reduce the risk."
			},
			{
				"title": "p1",
				"type": "quiz_header",
				"content": "🧠 Identify risks and hazards. Answer the four questions. Only one answer option is correct for each question."
			}
		],
		"questions": [
			{
				"title": "Question 1",
				"type": "quiz_question",
				"content": "Which best describes what is meant by the word risk?",
				"answers": [
					{
						"title": "a1",
						"content": "The threatening situation has already occurred",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Knowledge of how to protect yourself from hazards",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "The probability that the threat will materialize and cause harm",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "A situation in which someone feels insecure",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 2",
				"type": "quiz_question",
				"content": "Which of the following is the greatest physical risk in a typical campus environment?",
				"answers": [
					{
						"title": "a1",
						"content": "Classroom desks are not ergonomic",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "There is an extension cord without any markings on the walkway",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "The teacher\'s voice cannot be heard well in the back row",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "There is no coffee machine in the classroom",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 3",
				"type": "quiz_question",
				"content": "Which of the following describes a safety risk in digital learning?",
				"answers": [
					{
						"title": "a1",
						"content": "Using Moodle on a mobile device",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "Slow internet connection at home",
						"is_correct": false
					},
					{
						"title": "a3",
						"content": "Keeping passwords on a Post-it note under the keyboard",
						"is_correct": true
					},
					{
						"title": "a4",
						"content": "Watching lecture recordings in a public space",
						"is_correct": false
					}
				]
			},
			{
				"title": "Question 4",
				"type": "quiz_question",
				"content": "Which of the following could be a risk to psychological safety from the perspective of the learning community?",
				"answers": [
					{
						"title": "a1",
						"content": "A student has a different learning style than others",
						"is_correct": false
					},
					{
						"title": "a2",
						"content": "In group work, one student is not given a chance to speak and is belittled",
						"is_correct": true
					},
					{
						"title": "a3",
						"content": "The lecture deals with a difficult topic",
						"is_correct": false
					},
					{
						"title": "a4",
						"content": "The exam is returned on paper rather than electronically",
						"is_correct": false
					}
				]
			}
		]
	}
}
', 
    1
    );



















