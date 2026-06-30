import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GetPronunciationDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsIn(['english', 'russian', 'korean'])
    lang: 'english' | 'russian' | 'korean';
}