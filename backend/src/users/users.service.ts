import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(name: string, email: string, password: string): Promise<User> {
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const hashed = await bcrypt.hash(password, 10);
    return this.repo.save(this.repo.create({ name, email, password: hashed }));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    // Troca de senha: exige senha atual válida
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Informe a senha atual para definir uma nova senha');
      }
      const matches = await bcrypt.compare(dto.currentPassword, user.password);
      if (!matches) {
        throw new UnauthorizedException('Senha atual incorreta');
      }
      user.password = await bcrypt.hash(dto.newPassword, 10);
    }

    if (dto.name !== undefined) user.name = dto.name;

    // null explícito remove o avatar; undefined não altera
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl ?? null;

    return this.repo.save(user);
  }
}
