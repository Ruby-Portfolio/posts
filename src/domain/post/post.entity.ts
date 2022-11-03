import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@Entity()
export class Post {
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column()
  author: string;

  @IsString()
  @MinLength(6)
  @Column()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Column({ length: 20 })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Column({ length: 200 })
  content: string;
}
