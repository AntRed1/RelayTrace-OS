import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
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
  @ApiOperation({
    summary: 'Listar usuarios de la empresa',
    description:
      'SUPER_ADMIN puede pasar ?companyId para filtrar por empresa y ?role para filtrar por rol.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['DRIVER', 'DISPATCHER', 'COMPANY_ADMIN'],
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuarios' })
  findByCompany(
    @Request() req,
    @Query('companyId') filterCompanyId?: string,
    @Query('role') role?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    // SUPER_ADMIN usa el companyId del query param (o null = ver todos)
    // Otros roles solo ven su propia empresa
    const companyId =
      req.user.role === 'SUPER_ADMIN'
        ? (filterCompanyId ?? null)
        : req.user.companyId;

    return this.usersService.findByCompany(companyId, page, limit, role);
  }

  @Get(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Datos del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    const companyId =
      req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    return this.usersService.findById(id, companyId);
  }

  @Patch(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  update(@Param('id') id: string, @Request() req, @Body() updateUserDto: UpdateUserDto) {
    const companyId =
      req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    return this.usersService.update(id, companyId, updateUserDto);
  }

  @Delete(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  delete(@Param('id') id: string, @Request() req) {
    const companyId =
      req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    return this.usersService.delete(id, companyId);
  }
}
