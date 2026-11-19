import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { DatabaseService } from "../database.service";
import { CrisisTeamRepository } from "./crisis-team.repository";
import { createDrizzleMock } from "../../../tests/support/drizzle-mock";

describe("CrisisTeamRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mock = createDrizzleMock();
  let repository: CrisisTeamRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CrisisTeamRepository,
        { provide: DatabaseService, useValue: mock.database },
      ],
    }).compile();
    repository = module.get(CrisisTeamRepository);
  });

  it("lists active contacts", async () => {
    const contacts = [{ contact_id: 1 }];
    mock.enqueueResults(contacts);
    await expect(repository.findAll()).resolves.toEqual(contacts);
    expect(mock.db.select).toHaveBeenCalled();
  });

  it("finds a contact by id", async () => {
    const contact = { contact_id: 2 };
    mock.enqueueResults([contact]);
    await expect(repository.findById(2)).resolves.toEqual(contact);
  });

  it("soft deletes and returns the contact", async () => {
    const contact = { contact_id: 2 };
    mock.enqueueResults([contact]);
    await expect(repository.softDelete(2)).resolves.toEqual(contact);
    expect(mock.db.update).toHaveBeenCalled();
  });

  it("creates a contact after determining the next order number", async () => {
    const contact = { contact_id: 3, order_number: 5 };
    mock.enqueueResults([{ maxOrder: 4 }], [contact]);
    await expect(
      repository.create(1, "Nimi", "Name", "Rooli", "Role", "123")
    ).resolves.toEqual(contact);
    expect(mock.db.select).toHaveBeenCalledTimes(1);
    expect(mock.db.insert).toHaveBeenCalledTimes(1);
  });

  it("updates a contact", async () => {
    const contact = { contact_id: 3 };
    mock.enqueueResults([contact]);
    await expect(
      repository.update(3, "Nimi", "Name", "Rooli", "Role", "123")
    ).resolves.toEqual(contact);
    expect(mock.db.update).toHaveBeenCalled();
  });
});
