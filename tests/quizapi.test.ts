import createApp from '../src/app';
import request, { Response } from 'supertest';
import { connectDB, pool } from '../src/config/db';
import { Express } from 'express';

const app: Express = createApp();

// TODO POISTA quizapi.test.ts ENNEN PUSKUA package.jsonista

describe('GET /api/quiz', () => {
	beforeAll(async () => {
		await connectDB();
		await pool.query(`
            INSERT INTO World (organization_id, world_name, order_number)
            VALUES (1, 'TEST_WORLD', 3)
            ON CONFLICT DO NOTHING
            `);
		await pool.query(`
            INSERT INTO Quiz (world_id, quiz_name, quiz_content, order_number)
            VALUES (1, 'TEST_QUIZ', '{"question": "What is 2+2?", "answer": "4"}', 4)
            ON CONFLICT DO NOTHING;
            `);
	});

	afterAll(async () => {
		// Clean up test data
		await pool.query(`DELETE FROM Quiz WHERE quiz_name = 'TEST_QUIZ'`);
		await pool.query(`DELETE FROM World WHERE world_name = 'TEST_WORLD'`);
		await pool.end();
	});

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

		const testQuiz = res.body.find((q: { quiz_name: string; }) => q.quiz_name === 'TEST_QUIZ');
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
