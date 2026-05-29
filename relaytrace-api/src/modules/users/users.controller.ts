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
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/users.dtos';
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
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() actor) {
    return this.usersService.create(createUserDto, {
      userId:    actor.id,
      companyId: actor.companyId,
    });
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
    return this.usersService.update(id, companyId, updateUserDto, {
      userId:    req.user.id,
      companyId: req.user.companyId,
    });
  }

  @Delete(':id')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  delete(@Param('id') id: string, @Request() req) {
    const companyId =
      req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    return this.usersService.delete(id, companyId, {
      userId:    req.user.id,
      companyId: req.user.companyId,
    });
  }

  // ── PATCH /users/:id/password ─────────────────────────────────────────────
  @Patch(':id/password')
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Cambiar contraseña de un usuario',
    description:
      'SUPER_ADMIN puede cambiar la contraseña de cualquier usuario. ' +
      'COMPANY_ADMIN solo puede cambiar contraseñas dentro de su empresa. ' +
      'Todos los cambios quedan registrados en el audit log.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario objetivo' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  changePassword(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ChangePasswordDto,
  ) {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const companyId    = isSuperAdmin ? null : req.user.companyId;
    return this.usersService.changePassword(id, companyId, {
      userId:    req.user.id ?? req.user.sub,
      companyId: req.user.companyId,
    }, dto);
  }
}
