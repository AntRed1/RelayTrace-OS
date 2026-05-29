import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';

/**
 * All fields are optional — allows partial updates (PATCH semantics).
 * slug is inherited as optional but changing it is discouraged once
 * companies reference it.
 */
export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
