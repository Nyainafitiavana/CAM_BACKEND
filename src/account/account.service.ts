import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from '../prisma/prisma.service';
import Helper from '../../utils/helper';
import { Account, Prisma, User } from '@prisma/client';
import { MESSAGE, STATUS } from '../../utils/constant';
import { ExecuteResponse, Paginate } from '../../utils/custom.interface';
import { CustomException } from '../../utils/ExeptionCustom';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
  ) {}
  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    return this.prisma.account.create({
      data: {
        ...createAccountDto,
        statusId: STATUS.OUTSTANDING,
        uuid: await this.helper.generateUuid(),
      },
    });
  }

  async findAll(
    limit: number = null,
    page: number = null,
    keyword: string,
    status: number,
    year: number = null,
  ): Promise<Paginate<Account[]>> {
    const offset: number = await this.helper.calculOffset(limit, page);
    const query: Prisma.AccountFindManyArgs = {
      take: limit,
      skip: offset,
      where: {
        OR: [{ designation: { contains: keyword } }],
        statusId: status,
      },
      include: {
        status: {
          select: {
            uuid: true,
            designation: true,
            code: true,
          },
        },
      },
    };

    if (year) {
      query.where.year = year;
    }

    const [data, count] = await this.prisma.$transaction([
      this.prisma.account.findMany(query),
      this.prisma.account.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOne(uuid: string): Promise<Account> {
    const account: Account = await this.prisma.account.findUnique({
      where: {
        uuid: uuid,
      },
      include: {
        status: {
          select: {
            uuid: true,
            designation: true,
            code: true,
          },
        },
      },
    });

    if (!account) {
      throw new CustomException(MESSAGE.ID_NOT_FOUND, HttpStatus.CONFLICT);
    }

    return account;
  }

  async update(
    uuid: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<ExecuteResponse> {
    const findAccount: Account = await this.findOne(uuid);

    await this.prisma.account.update({
      where: {
        uuid: findAccount.uuid,
      },
      data: {
        ...updateAccountDto,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findAccount: Account = await this.findOne(uuid);

    await this.prisma.account.update({
      where: {
        uuid: findAccount.uuid,
      },
      data: {
        statusId: STATUS.DELETED,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}
