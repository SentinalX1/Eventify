"use server"

import { CreateCategoryParams } from "@/types";
import { PrismaClient } from '@prisma/client';
import { handleError } from "../utils";

const prisma = new PrismaClient();

export const createCategory = async ({ categoryName }: CreateCategoryParams) => {
    try {
        const newCategory = await prisma.category.create({
            data: {
                name: categoryName,
            },
        });

        return newCategory;
    } catch (error) {
        handleError(error);
        return null; // Return null in case of an error
    }
}

export const getAllCategories = async () => {
    try {
        const categories = await prisma.category.findMany();

        return categories;
    } catch (error) {
        handleError(error);
    }
}

{/*1*/}