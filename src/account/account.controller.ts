import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Next,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../auth/auth.guards';
import { NextFunction, Request, Response } from 'express';
import { Account } from '@prisma/client';
import { ExecuteResponse, Paginate } from '../../utils/custom.interface';

@Controller('/api/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<void> {
    try {
      const account: Account =
        await this.accountService.create(createAccountDto);

      res.status(HttpStatus.OK).json(account);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const limit: number = Number(req.query.limit);
      const page: number = Number(req.query.page);
      const keyword: string = req.query.value
        ? (req.query.value as string)
        : '';
      const status: number = Number(req.query.status);
      const year: number = Number(req.query.year);

      const accounts: Paginate<Account[]> = await this.accountService.findAll(
        limit,
        page,
        keyword,
        status,
        year,
      );

      res.status(HttpStatus.OK).json(accounts);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:uuid')
  async findOne(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const account: Account = await this.accountService.findOne(uuid);

      res.status(HttpStatus.OK).json(account);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const updated: ExecuteResponse = await this.accountService.update(
        uuid,
        updateAccountDto,
      );

      res.status(HttpStatus.OK).json(updated);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':uuid')
  async remove(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const deleted: ExecuteResponse = await this.accountService.remove(uuid);

      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }
}
