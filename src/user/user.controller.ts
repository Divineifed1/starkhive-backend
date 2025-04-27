import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express'; // Import the extended Request type
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { User } from './user.interface'; // Import the User interface

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const user = await this.userService.create(createUserDto);

    const currentUser = req.user as User; // Cast req.user to User

    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.auditService.createLog({
      action: 'user_created',
      resourceType: 'user',
      // resourceId: user.id,
      userId: currentUser.id, // Use the checked userId
      ipAddress: req.ip,
      // details: { email: user.email },
    });

    return user;
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}