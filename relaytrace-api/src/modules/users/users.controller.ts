import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dtos';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Crea un conductor, dispatcher o admin dentro de una empresa.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar usuarios de la empresa' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuarios' })
  findByCompany(
    @CurrentUser('companyId') companyId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.findByCompany(companyId, page, limit);
  }

  @Get(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Datos del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.usersService.findById(id, companyId);
  }

  @Patch(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, companyId, updateUserDto);
  }

  @Delete(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  delete(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.usersService.delete(id, companyId);
  }
}
