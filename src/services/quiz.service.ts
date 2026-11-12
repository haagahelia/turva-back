import { Injectable } from "@nestjs/common";
import { QuizRepository } from "../database/repositories/quiz.repository";

@Injectable()
export class QuizService {
  constructor(private readonly quizzes: QuizRepository) {}

  async findAll() {
    return this.quizzes.findAll();
  }

  async findById(id: number) {
    return this.quizzes.findById(id);
  }

  async findByWorldId(worldId: number) {
    return this.quizzes.findByWorldId(worldId);
  }

  async create(
    worldId: number,
    nameFi: string,
    nameEn: string,
    content: unknown,
    orderNumber: number
  ) {
    return this.quizzes.create(worldId, nameFi, nameEn, content, orderNumber);
  }

  async updateContent(id: number, content: unknown) {
    return this.quizzes.updateContent(id, content);
  }

  async softDelete(id: number) {
    return this.quizzes.softDelete(id);
  }
}
