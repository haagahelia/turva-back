import { Injectable } from "@nestjs/common";
import { UserRepository } from "../database/repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly users: UserRepository) {}

  async findProfile(email: string, username?: string) {
    return this.users.findProfile(email, username);
  }
}
