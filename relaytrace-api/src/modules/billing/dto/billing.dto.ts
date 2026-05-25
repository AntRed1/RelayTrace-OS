import { IsString, IsUrl } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  priceId: string;

  @IsUrl()
  successUrl: string;

  @IsUrl()
  cancelUrl: string;
}
