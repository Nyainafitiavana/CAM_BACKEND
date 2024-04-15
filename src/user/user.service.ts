import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Prisma, User } from '@prisma/client';
import { ExecuteResponse, Paginate } from '../../utils/custom.interface';
import Helper from '../../utils/helper';
import { MESSAGE, STATUS } from '../../utils/constant';
import { CustomException } from '../../utils/ExeptionCustom';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const findUserEmail: User = await this.findOneByEmail(createUserDto.email);

    if (findUserEmail) {
      throw new CustomException(MESSAGE.EMAIL_FOUND, HttpStatus.CONFLICT);
    }

    const createUser: User = await this.prisma.user.create({
      data: {
        ...createUserDto,
        statusId: STATUS.ACTIVE,
        uuid: await this.helper.generateUuid(),
      },
    });

    delete createUser.id;
    delete createUser.password;
    return createUser;
  }

  async findAll(
    limit: number = null,
    page: number = null,
    keyword: string,
    status: number,
  ): Promise<Paginate<User[]>> {
    const offset: number = await this.helper.calculOffset(limit, page);

    const query: Prisma.UserFindManyArgs = {
      take: limit,
      skip: offset,
      where: {
        OR: [
          { name: { contains: keyword } },
          { email: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
        statusId: status === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.DELETED,
      },
      select: {
        name: true,
        is_admin: true,
        email: true,
        phone: true,
        uuid: true,
        status: {
          select: {
            designation: true,
            code: true,
            uuid: true,
          },
        },
      },
    };

    const [data, count] = await this.prisma.$transaction([
      this.prisma.user.findMany(query),
      this.prisma.user.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOneByEmail(email: string): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        status: {
          select: {
            designation: true,
            code: true,
            uuid: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomException(MESSAGE.EMAIL_NOT_FOUND, HttpStatus.CONFLICT);
    }
    return user;
  }

  async findOne(uuid: string): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: {
        uuid: uuid,
      },
      include: {
        status: {
          select: {
            designation: true,
            code: true,
            uuid: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomException(MESSAGE.ID_NOT_FOUND, HttpStatus.CONFLICT);
    }

    delete user.id;
    delete user.password;
    return user;
  }

  async update(
    uuid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ExecuteResponse> {
    const findUser: User = await this.findOne(uuid);

    await this.prisma.user.update({
      where: {
        uuid: findUser.uuid,
      },
      data: {
        ...updateUserDto,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findUser: User = await this.findOne(uuid);

    await this.prisma.user.update({
      where: {
        uuid: findUser.uuid,
      },
      data: {
        statusId: STATUS.DELETED,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}
