import { Injectable } from "@nestjs/common";
import { InfoRepository } from "../database/repositories/info.repository";

@Injectable()
export class InfoService {
  constructor(private readonly info: InfoRepository) {}

  async findAll() {
    return this.info.findAll();
  }

  async findById(id: number) {
    return this.info.findById(id);
  }

  async deleteById(id: number) {
    return this.info.deleteById(id);
  }

  async create(title: string, content: string) {
    return this.info.create(title, content);
  }

  async update(id: number, title: string, content: string) {
    return this.info.update(id, title, content);
  }
}
