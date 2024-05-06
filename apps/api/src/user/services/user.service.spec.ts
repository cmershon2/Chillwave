import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from '../controllers/user.controller';
import { PersistenceModule } from '../../persistence/persistence.module';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PersistenceModule],
      providers: [UserService],
      controllers: [UserController],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be an instanceof UserService', () => {
    expect(service).toBeInstanceOf(UserService);
  });
});
