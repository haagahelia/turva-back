import { Injectable } from "@nestjs/common";
import { CrisisTeamRepository } from "../database/repositories/crisis-team.repository";

@Injectable()
export class CrisisTeamService {
  constructor(private readonly crisisTeam: CrisisTeamRepository) {}

  async findAll() {
    return this.crisisTeam.findAll();
  }

  async findById(id: number) {
    return this.crisisTeam.findById(id);
  }

  async softDelete(id: number) {
    return this.crisisTeam.softDelete(id);
  }

  async create(
    organization_id: number,
    name_fi: string,
    name_en: string,
    role_fi: string,
    role_en: string,
    phone: string
  ) {
    return this.crisisTeam.create(
      organization_id,
      name_fi,
      name_en,
      role_fi,
      role_en,
      phone
    );
  }

  async update(
    id: number,
    name_fi: string,
    name_en: string,
    role_fi: string,
    role_en: string,
    phone: string
  ) {
    return this.crisisTeam.update(
      id,
      name_fi,
      name_en,
      role_fi,
      role_en,
      phone
    );
  }
}
