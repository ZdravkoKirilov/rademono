import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminUsersService {
  create(payload: unknown) {
    return 'This action adds a new adminUser';
  }

  findAll() {
    return `This action returns all adminUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminUser`;
  }

  update(id: number, payload: unknown) {
    return `This action updates a #${id} adminUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminUser`;
  }
}
