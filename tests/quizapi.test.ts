import createApp from '../src/app';
import request, { Response } from 'supertest';
import { connectDB, pool } from '../src/config/db';
import { Express } from 'express';

const app: Express = createApp();

describe('Quiz api integration tests', () => {
	let testQuizId: number;

	beforeAll(async () => {
		await connectDB();

		await pool.query(`
            INSERT INTO World (organization_id, world_name, order_number)
            VALUES (1, 'TEST_WORLD', 3)
            ON CONFLICT DO NOTHING
            `);
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

	afterAll(async () => {
		await pool.query(`DELETE FROM Quiz WHERE quiz_name = 'TEST_QUIZ'`);
		await pool.query(`DELETE FROM World WHERE world_name = 'TEST_WORLD'`);
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
				.mockRejectedValueOnce(new Error('Database connection failed') as never);

			const res: Response = await request(app).get(`/api/quiz/world/1/quizzes`);

			expect(res.statusCode).toBe(500);
			expect(res.body).toHaveProperty('error');
			expect(res.body.error).toBe('Database query failed');

			mockQuery.mockRestore();
		});
	});
});
