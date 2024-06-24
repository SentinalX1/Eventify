import { PrismaClient } from '@prisma/client';
import { handleError } from '@/lib/utils';
import { CreateUserParams, UpdateUserParams } from '@/types';

const prisma = new PrismaClient();

export async function createUser(user: CreateUserParams) {
  try {
    const newUser = await prisma.user.create({
      data: user,
    });
    return newUser;
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: user,
    });

    if (!updatedUser) throw new Error('User update failed');
    return updatedUser;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const userToDelete = await prisma.user.findUnique({
      where: { clerkId },
      include: { events: true, orders: true },
    });

    if (!userToDelete) {
      throw new Error('User not found');
    }

    await prisma.$transaction([
      prisma.event.updateMany({
        where: { organizerId: userToDelete.id },
        data: { organizerId: null },
      }),
      prisma.order.updateMany({
        where: { buyerId: userToDelete.id },
        data: { buyerId: null },
      }),
    ]);

    const deletedUser = await prisma.user.delete({
      where: { id: userToDelete.id },
    });

    return deletedUser;
  } catch (error) {
    handleError(error);
  }
}