import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class Attributes {
    @ApiProperty({description: 'Reference ID from the partners system'})
    @IsNotEmpty()
    trait: string;

    @ApiProperty({description: 'Reference ID from the partners system'})
    @IsNotEmpty()
    value: string;
}