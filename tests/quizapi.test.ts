import createApp from '../src/app';
import request, { Response } from 'supertest';
import { connectDB, pool } from '../src/config/db';
import { Express } from 'express';

const app: Express = createApp();

describe('Quiz api integration tests', () => {
	let testQuizId: number;
	let testWorldId: number;

	beforeAll(async () => {
		await connectDB();

		const worldResult = await pool.query(`
            INSERT INTO World (organization_id, world_name, order_number)
            VALUES (1, 'TEST_WORLD', 3)
            ON CONFLICT DO NOTHING
			RETURNING world_id;
            `);

		if (worldResult.rows.length > 0) {
			testWorldId = worldResult.rows[0].world_id;
		}

		const quizResult = await pool.query(`
            INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
            VALUES (1, 'TEST_QUIZ', '{"question": "What is 2+2?", "answer": "4"}', 4)
            ON CONFLICT DO NOTHING
            RETURNING quiz_id;
            `);

		if (quizResult.rows.length > 0) {
			testQuizId = quizResult.rows[0].quiz_id;
		}
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(async () => {
		await pool.query(
			`DELETE FROM Quiz WHERE quiz_name IN ('TEST_QUIZ', 'test_name')`,
		);
		await pool.query(`DELETE FROM World WHERE world_id = ${testWorldId}`);
	});

	describe('GET /api/quiz', () => {
		it('Should return a 200 response', async () => {
			const res: Response = await request(app).get('/api/quiz');
			expect(res.statusCode).toBe(200);
		});

		it('Should return a valid JSON array as a response', async () => {
			const res: Response = await request(app).get('/api/quiz');
			expect(Array.isArray(res.body)).toBe(true);
		});

		it('Should return all quizzes from the database', async () => {
			const res: Response = await request(app).get('/api/quiz');
			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body.length).toBeGreaterThan(0);

			const testQuiz = res.body.find(
				(q: { quiz_name: string }) => q.quiz_name === 'TEST_QUIZ',
			);
			expect(testQuiz).toBeDefined();
		});

		it('Should verify that that the quiz has the correct quiz properties', async () => {
			const res: Response = await request(app).get('/api/quiz');
			const firstQuiz = res.body[0];
			expect(firstQuiz).toHaveProperty('quiz_id');
			expect(firstQuiz).toHaveProperty('world_id');
			expect(firstQuiz).toHaveProperty('quiz_name');
			expect(firstQuiz).toHaveProperty('quiz_content');
			expect(firstQuiz).toHaveProperty('order_number');
			expect(firstQuiz).toHaveProperty('created_at');
		});
	});

	describe('GET /api/quiz/:id', () => {
		it('Should return a 200 status code when quiz exists', async () => {
			const res: Response = await request(app).get(`/api/quiz/${testQuizId}`);
			expect(res.statusCode).toBe(200);
		});

		it('Should return a valid JSON object as response', async () => {
			const res: Response = await request(app).get(`/api/quiz/${testQuizId}`);
			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body.length).toBeGreaterThan(0);
		});

		it('Should return correct quiz properties', async () => {
			const res: Response = await request(app).get(`/api/quiz/${testQuizId}`);
			const quiz = res.body[0];
			expect(quiz).toHaveProperty('quiz_id');
			expect(quiz).toHaveProperty('world_id');
			expect(quiz).toHaveProperty('quiz_name');
			expect(quiz).toHaveProperty('quiz_content');
			expect(quiz).toHaveProperty('order_number');
			expect(quiz).toHaveProperty('created_at');
			expect(quiz.quiz_id).toBe(testQuizId);
		});

		it('Should return 404 when quiz ID does not exist', async () => {
			const res: Response = await request(app).get('/api/quiz/99999');
			expect(res.statusCode).toBe(404);
			expect(res.body).toHaveProperty('error');
			expect(res.body.error).toBe('ID not found');
		});

		it('Should return 400 for invalid ID format', async () => {
			const res: Response = await request(app).get('/api/quiz/abc123');
			expect(res.statusCode).toBe(400);
			expect(res.body).toHaveProperty('error');
			expect(res.body.error).toBe('Invalid ID format');
		});

		it('Should return 400 with empty ID', async () => {
			const res: Response = await request(app).get('/api/quiz/ /');
			expect(res.statusCode).toBe(400);
			expect(res.body).toHaveProperty('error');
			expect(res.body.error).toBe('Invalid ID format');
		});

		it('Should handle negative ID', async () => {
			const res: Response = await request(app).get('/api/quiz/-1');
			expect(res.statusCode).toBe(404);
		});
	});

	describe('GET /quiz/world/:world_id/quizzes', () => {
		it('Should return 200 status code', async () => {
			const res: Response = await request(app).get(`/api/quiz/world/1/quizzes`);
			expect(res.statusCode).toBe(200);
		});

		it('Should return a valid JSON response', async () => {
			const res: Response = await request(app).get(`/api/quiz/world/1/quizzes`);
			expect(Array.isArray(res.body)).toBe(true);
			expect(res.body.length).toBeGreaterThan(0);
		});

		it('Should contain a quiz with the correct properties', async () => {
			const res: Response = await request(app).get(`/api/quiz/world/1/quizzes`);
			const quiz = res.body[0];
			expect(res.body.length).toBeGreaterThan(0);
			expect(quiz).toHaveProperty('quiz_id');
			expect(quiz).toHaveProperty('world_id');
			expect(quiz).toHaveProperty('quiz_content');
			expect(quiz).toHaveProperty('quiz_name');
			expect(quiz).toHaveProperty('order_number');
			expect(quiz).toHaveProperty('created_at');
		});

		it('Should return 404 status code with incorrect world ID', async () => {
			const res: Response = await request(app).get(
				`/api/quiz/world/99999/quizzes`,
			);
			expect(res.statusCode).toBe(404);
			expect(res.body.error).toBe('ID not found');
		});

		it('Should return 400 status code with incorrect world ID format', async () => {
			const res: Response = await request(app).get(
				`/api/quiz/world/abc123/quizzes`,
			);
			expect(res.statusCode).toBe(400);
			expect(res.body.error).toBe('Invalid ID format');
		});

		it('Should return 500 status code when a database error occurs', async () => {
			const mockQuery = jest
				.spyOn(pool, 'query')
				.mockRejectedValueOnce(
					new Error('Database connection failed') as never,
				);

			const res: Response = await request(app).get(`/api/quiz/world/1/quizzes`);

			expect(res.statusCode).toBe(500);
			expect(res.body).toHaveProperty('error');
			expect(res.body.error).toBe('Database query failed');

			mockQuery.mockRestore();
		});
	});

	describe('POST /api/quiz/', () => {
		const quizName = 'test_name';
		const quizContent = {
			question: 'What is the capital of Finland?',
			answer: 'Helsinki',
			options: ['Helsinki', 'Tampere', 'Turku', 'Oulu'],
			difficulty: 'easy',
			type: 'multiple-choice',
		};
		const orderNumber = 10;

		const getQuiz = () => ({
			world_id: testWorldId,
			quiz_name: quizName,
			quiz_content: quizContent,
			order_number: orderNumber,
		});

		describe('Successful creation', () => {
			it('Should return 201 status code when quiz is created successfully', async () => {
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(getQuiz());
				expect(res.statusCode).toBe(201);
			});

			it('Should return a response that contains the required fields', async () => {
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(getQuiz());
				expect(res.body).toHaveProperty('quiz_id');
				expect(res.body).toHaveProperty('world_id');
				expect(res.body).toHaveProperty('quiz_name');
				expect(res.body).toHaveProperty('quiz_content');
				expect(res.body).toHaveProperty('order_number');
				expect(res.body).toHaveProperty('created_at');
			});

			it('Should verify the quiz is actually inserted into the database', async () => {
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(getQuiz());
				const quizId = res.body.quiz_id;

				const quizFromDb = await pool.query(
					`
            SELECT * FROM Quiz WHERE quiz_id = $1
            `,
					[quizId],
				);

				expect(quizFromDb.rows.length).toBeGreaterThan(0);
				expect(quizFromDb.rows[0].quiz_id).toBe(quizId);
			});
		});

		describe('Optional fields', () => {
			// Unclear whether these should be even possible
			it('Should successfully create quiz without quiz_content', async () => {
				const quizWithoutContent = {
					world_id: testWorldId,
					quiz_name: quizName,
					order_number: orderNumber,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithoutContent);
				expect(res.statusCode).toBe(201);
			});
			it('Should successfully create quiz with empty quiz_content', async () => {
				const quizWithoutContent = {
					world_id: testWorldId,
					quiz_name: quizName,
					quiz_content: ' ',
					order_number: orderNumber,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithoutContent);

				expect(res.statusCode).toBe(201);
			});
		});

		describe('Required Field Validation', () => {
			it('Should return 400 when world_id is missing', async () => {
				const quizWithoutWorldId = {
					quiz_name: quizName,
					quiz_content: quizContent,
					order_number: orderNumber,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithoutWorldId);
				expect(res.statusCode).toBe(400);
				expect(res.body.error).toBe(
					'World id, quiz name or order number missing',
				);
			});
			it('Should return 400 when quiz_name is missing', async () => {
				const quizWithoutQuizName = {
					world_id: testWorldId,
					quiz_content: quizContent,
					order_number: orderNumber,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithoutQuizName);
				expect(res.statusCode).toBe(400);
				expect(res.body.error).toBe(
					'World id, quiz name or order number missing',
				);
			});
			it('Should return 400 when order_number is missing', async () => {
				const quizWithoutOrderNumber = {
					world_id: testWorldId,
					quiz_name: quizName,
					quiz_content: quizContent,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithoutOrderNumber);
				expect(res.statusCode).toBe(400);
				expect(res.body.error).toBe(
					'World id, quiz name or order number missing',
				);
			});
			it('Should return 400 when all required fields are missing', async () => {
				const quizWithoutFields = {};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithoutFields);
				expect(res.statusCode).toBe(400);
				expect(res.body.error).toBe(
					'World id, quiz name or order number missing',
				);
			});
		});

		describe('Data type validation', () => {
			// Postgres changes string values to integers if the fields are specified as such

			it('Should handle invalid data types for world_id', async () => {
				const quizWithInvalidWorldId = {
					world_id: testWorldId + '',
					quiz_name: quizName,
					quiz_content: quizContent,
					order_number: orderNumber,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithInvalidWorldId);
				expect(res.statusCode).toBe(201);
			});

			it('Should handle invalid data types for order_number', async () => {
				const quizWithInvalidWorldId = {
					world_id: testWorldId,
					quiz_name: quizName,
					quiz_content: quizContent,
					order_number: orderNumber + '',
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithInvalidWorldId);
				expect(res.statusCode).toBe(201);
			});
			it('Should handle negative order_number', async () => {
				const quizWithInvalidWorldId = {
					world_id: testWorldId,
					quiz_name: quizName,
					quiz_content: quizContent,
					order_number: -10,
				};
				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithInvalidWorldId);
				expect(res.statusCode).toBe(400);
			});
			it('Should handle negative world_id', async () => {
				const quizWithInvalidWorldId = {
					world_id: -3,
					quiz_name: quizName,
					quiz_content: quizContent,
					order_number: orderNumber,
				};

				const res: Response = await request(app)
					.post('/api/quiz')
					.send(quizWithInvalidWorldId);
				expect(res.statusCode).toBe(400);
			});
		});
	});
});
