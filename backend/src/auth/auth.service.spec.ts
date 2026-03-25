import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

const mockUser: User = {
  id: 'user-uuid',
  name: 'Admin',
  email: 'admin@fintech.com',
  password: 'hashed-password',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-token'),
};

const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user and set cookie on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login('admin@fintech.com', 'senha123', mockResponse);

      expect(result).toBe(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('unknown@email.com', 'any-password', mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.login('admin@fintech.com', 'wrong-password', mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and set cookie', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(
        mockUser.name,
        mockUser.email,
        'senha123',
        mockResponse,
      );

      expect(mockUsersService.create).toHaveBeenCalledWith(
        mockUser.name,
        mockUser.email,
        'senha123',
      );
      expect(result).toBe(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the access_token cookie', () => {
      service.logout(mockResponse);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ path: '/', httpOnly: true }),
      );
    });
  });
});
