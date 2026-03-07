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

	describe('PUT /api/quiz/:id', () => {
		const updatedQuizContent = {
			testQuestion: 'New updated test question',
			testAnswer: 'updated test answer',
			testDifficulty: 'test',
			testType: 'update test',
		};
		describe('Success cases', () => {
			it('Should be able to update and return a 201 response', async () => {
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(201);
			});

			it('Should contain "Updated successfully" message', async () => {
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(201);

				expect(res.body.message).toBe('Updated successfully');
				expect(res.body).toHaveProperty('updated');
			});

			it('Verify updated data persists', async () => {
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(201);

				expect(res.body.updated.quiz_content).toHaveProperty('testQuestion');
				expect(res.body.updated.quiz_content).toHaveProperty('testAnswer');
				expect(res.body.updated.quiz_content).toHaveProperty('testDifficulty');
				expect(res.body.updated.quiz_content).toHaveProperty('testType');
			});

			it('Verify that "created_at" property has changed', async () => {
				const result = await pool.query(
					'SELECT created_at FROM Quiz WHERE quiz_id = $1',
					[testQuizId],
				);
				const oldCreatedAt = new Date(result.rows[0].created_at).getTime();

				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(201);

				const createdAt = new Date(res.body.updated.created_at).getTime();
				expect(createdAt).toBeGreaterThan(oldCreatedAt);
				expect(oldCreatedAt).not.toEqual(createApp);
			});
		});

		describe('ID Parameter Validation', () => {
			it('Should return 400 when quiz ID does not exist', async () => {
				const res: Response = await request(app)
					.put('/api/quiz/99999')
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(400);
				expect(res.body).toHaveProperty('error');
				expect(res.body.error).toBe('ID not found');
			});

			it('Should return 400 for invalid ID format (non-numeric)', async () => {
				const res: Response = await request(app)
					.put('/api/quiz/abc123')
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(400);
			});

			it('Should handle negative ID', async () => {
				const res: Response = await request(app)
					.put('/api/quiz/-1')
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(400);
				expect(res.body.error).toBe('ID not found');
			});

			it('Should handle zero as ID', async () => {
				const res: Response = await request(app)
					.put('/api/quiz/0')
					.send(updatedQuizContent);
				expect(res.statusCode).toBe(400);
				expect(res.body.error).toBe('ID not found');
			});

			it('Should handle very large ID number', async () => {
				const res: Response = await request(app)
					.put('/api/quiz/999999999999')
					.send(updatedQuizContent);
				console.log(res.body);

				expect(res.statusCode).toBe(500);
				expect(res.body.error).toBe('Update failed');
			});
		});

		describe('Body validation', () => {
			it('Should accept empty object as body', async () => {
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send({});
				expect(res.statusCode).toBe(201);
				expect(res.body.updated.quiz_content).toEqual({});
			});

			it('Should not accept plain string values', async () => {
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send('plain string content');

				expect(res.statusCode).toBe(400);
				expect(res.body).toHaveProperty('error');
				expect(res.body.error).toBe('Request body must be valid JSON');
			});

			it('Should accept array in request body', async () => {
				const arrayContent = ['item1', 'item2', 'item3'];
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(arrayContent);
				expect(res.statusCode).toBe(201);
				expect(res.body.updated.quiz_content).toEqual(arrayContent);
			});

			it('Should reject request with no body', async () => {
				const res: Response = await request(app).put(`/api/quiz/${testQuizId}`);
				expect(res.statusCode).toBe(400);
				expect(res.body).toHaveProperty('error');
				expect(res.body.error).toBe('Request body must be valid JSON');
			});

			it('Should handle special characters in content', async () => {
				const specialContent = {
					question: 'What\'s "special"?',
					answer: 'Characters: <>&"\'\\/',
					unicode: '你好世界 🌍 émojis',
					backslash: 'path\\to\\file',
				};
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(specialContent);
				expect(res.statusCode).toBe(201);
				expect(res.body.updated.quiz_content).toEqual(specialContent);
			});

			it('Should handle nested objects in content', async () => {
				const nestedContent = {
					question: 'Nested question',
					metadata: {
						author: 'Test Author',
						tags: ['tag1', 'tag2'],
						stats: {
							attempts: 0,
							successRate: 0,
						},
					},
				};
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(nestedContent);
				expect(res.statusCode).toBe(201);
				expect(res.body.updated.quiz_content).toEqual(nestedContent);
			});

			it('Should handle boolean values in content', async () => {
				const booleanContent = {
					isActive: true,
					isArchived: false,
					hasMedia: true,
				};
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(booleanContent);
				expect(res.statusCode).toBe(201);
				expect(res.body.updated.quiz_content).toEqual(booleanContent);
			});

			it('Should handle numeric content', async () => {
				const numericContent = {
					score: 100,
					multiplier: 1.5,
					negative: -10,
					zero: 0,
				};
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(numericContent);
				expect(res.statusCode).toBe(201);
				expect(res.body.updated.quiz_content).toEqual(numericContent);
			});

			it('Should handle large JSON payload', async () => {
				const largeContent = {
					questions: Array(100).fill({
						question: 'Test question with some text',
						answer: 'Test answer',
						options: ['A', 'B', 'C', 'D'],
					}),
				};
				const res: Response = await request(app)
					.put(`/api/quiz/${testQuizId}`)
					.send(largeContent);
				expect(res.statusCode).toBe(201);
			});
		});
	});
});
