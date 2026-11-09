import * as argon2 from 'argon2';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  await seedRoles(prisma);
  await seedDepartments(prisma);
  await seedUsers(prisma);
}

async function seedRoles(prisma: PrismaClient) {
  const roles = [
    { code: 'EMPLOYEE', name: 'Empleado' },
    { code: 'DEPARTMENT_MANAGER', name: 'Responsable de departamento' },
    { code: 'FINANCE', name: 'Finanzas' },
    { code: 'ADMIN', name: 'Administrador' },
  ];

  await prisma.$transaction(
    roles.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: { code: role.code, name: role.name },
      }),
    ),
  );
}

async function seedDepartments(prisma: PrismaClient) {
  const departments = ['Tecnología', 'Operaciones', 'Finanzas'];

  await prisma.$transaction(
    departments.map((department) =>
      prisma.department.upsert({
        where: { name: department },
        update: {},
        create: { name: department, isActive: true },
      }),
    ),
  );
}

async function seedUsers(prisma: PrismaClient) {
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD is required');
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  await prisma.$transaction(async (tx) => {
    // 1. Crear el usuario si todavía no existe
    const user = await tx.user.upsert({
      where: {
        email: 'admin@businessflow.local',
      },
      update: {},
      create: {
        email: 'admin@businessflow.local',
        firstName: 'Admin',
        lastName: 'BusinessFlow',
        passwordHash,
        isActive: true,
        tokenVersion: 1,
        departmentId: null,
      },
    });

    // 2. Buscar los roles que queremos asignar
    const roles = await tx.role.findMany({
      where: {
        code: {
          in: ['EMPLOYEE', 'ADMIN'],
        },
      },
    });

    if (roles.length !== 2) {
      throw new Error('Required roles EMPLOYEE and ADMIN not found');
    }

    // 3. Crear las asignaciones sin duplicarlas
    for (const role of roles) {
      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }
  });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
