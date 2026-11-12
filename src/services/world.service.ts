import { Injectable } from "@nestjs/common";
import { WorldRepository } from "../database/repositories/world.repository";

@Injectable()
export class WorldService {
  constructor(private readonly worlds: WorldRepository) {}

  async findAll() {
    return this.worlds.findAll();
  }

  async findById(id: number) {
    return this.worlds.findById(id);
  }

  async create(
    organizationId: number,
    nameFi: string,
    nameEn: string,
    orderNumber: number
  ) {
    return this.worlds.create(organizationId, nameFi, nameEn, orderNumber);
  }

  async update(
    id: number,
    nameFi: string,
    nameEn: string,
    orderNumber: number
  ) {
    return this.worlds.update(id, nameFi, nameEn, orderNumber);
  }

  async softDelete(id: number) {
    return this.worlds.softDelete(id);
  }
}
