"use server"

import { PrismaClient } from '@prisma/client';
import {
    CreateEventParams,
    UpdateEventParams,
    DeleteEventParams,
    GetEventsByUserParams,
    GetRelatedEventsByCategoryParams,
  } from '@/types';
import { handleError } from "../utils";
import { Event as PrismaEvent } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export const createEvent = async ({ event, userId, path }: CreateEventParams) => {
    try {
        // Ensure the organizer exists
        const organizer = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!organizer) {
            throw new Error("Organizer not found");
        }

        // Create a new event
        const newEvent = await prisma.event.create({
            data: {
                ...event,
                categoryId: event.categoryId, // Ensure categoryId is part of event
                organizerId: userId, // Ensure the correct userId is set
            },
        });

        revalidatePath(path);

        return newEvent; // Prisma already returns the new event object, no need to parse JSON
    } catch (error) {
        handleError(error);
    }
};

// Function to include related data for events
const populateEvent = async (event: any) => {
    if (!event) return null;

    const populatedEvent = await prisma.event.findUnique({
        where: { id: event.id },
        include: {
            organizer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return populatedEvent;
};

export const getEventById = async (eventId: string) => {
    try {
        // Find the event by its unique ID
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new Error("Event not found");
        }

        // Populate event with related data
        const populatedEvent = await populateEvent(event);

        return JSON.parse(JSON.stringify(populatedEvent));
    } catch (error) {
        handleError(error);
    }
};

type GetAllEventsParams = {
    query: string;
    limit?: number;
    page: number;
    category: string;
};

type EventWithDetails = {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    createdAt: Date;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    price: string | null;
    isFree: boolean;
    url: string | null;
    categoryId: string | null;
    organizerId: string | null;
    category: { name: string };
    organizer: { id: string; firstName: string; lastName: string };
};

export const getAllEvents = async ({
    query,
    limit = 6,
    page,
    category,
}: GetAllEventsParams) => {
    try {
        const eventsQuery = await prisma.event.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                organizer: true,
                category: true,
            },
        });

        const eventsCount = await prisma.event.count();

        // Ensure eventsQuery is always an array, even if empty
        const formattedEvents: EventWithDetails[] = eventsQuery.map(event => ({
            ...event,
            category: event.category ?? { name: '' }, // Ensure category is always defined
            organizer: event.organizer
                ? { id: event.organizer.id, firstName: event.organizer.firstName, lastName: event.organizer.lastName }
                : { id: '', firstName: '', lastName: '' }, // Ensure organizer is always defined
        }));

        return {
            data: formattedEvents,
            totalPages: Math.ceil(eventsCount / limit),
        };
    } catch (error) {
        console.error('Error fetching events:', error);
        return {
            data: [], // Ensure data is an empty array on error
            totalPages: 0,
        };
    }
};


export const deleteEvent = async ({ eventId, path }: DeleteEventParams) => {
    try {
        // Find and delete the event by its unique ID
        const deletedEvent = await prisma.event.delete({
            where: { id: eventId },
        });

        if (deletedEvent) {
            revalidatePath(path);
        }
    } catch (error) {
        handleError(error);
    }
};

export const getCategoryByName = async (name: string) => {
    try {
        const category = await prisma.category.findFirst({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive', // Case insensitive search
                },
            },
        });

        return category;
    } catch (error) {
        handleError(error);
        return null;
    }
};

export const updateEvent = async ({ userId, event, path }: UpdateEventParams) => {
    try {
        // Ensure the organizer exists and has permissions
        const organizer = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!organizer) {
            throw new Error('Unauthorized');
        }

        // Find the event to update
        const eventToUpdate = await prisma.event.findUnique({
            where: { id: event._id },
        });

        if (!eventToUpdate || eventToUpdate.organizerId !== userId) {
            throw new Error('Unauthorized or event not found');
        }

        // Update the event
        const updatedEvent = await prisma.event.update({
            where: { id: event._id },
            data: {
                ...event,
                categoryId: event.categoryId, // Ensure categoryId is updated
            },
        });

        revalidatePath(path);

        return JSON.parse(JSON.stringify(updatedEvent));
    } catch (error) {
        handleError(error);
    }
};

export const getEventsByUser = async ({ userId, limit = 6, page }: GetEventsByUserParams) => {
    try {
        // Ensure userId is valid and exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Find events organized by the user
        const eventsQuery = await prisma.event.findMany({
            where: {
                organizerId: userId,
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                organizer: true,
                category: true,
            },
        });

        // Count total events organized by the user
        const eventsCount = await prisma.event.count({
            where: {
                organizerId: userId,
            },
        });

        // Map events to ensure data format consistency
        const formattedEvents = eventsQuery.map(event => ({
            ...event,
            category: event.category ?? { name: '' },
            organizer: event.organizer
                ? {
                      id: event.organizer.id,
                      firstName: event.organizer.firstName,
                      lastName: event.organizer.lastName,
                  }
                : { id: '', firstName: '', lastName: '' },
        }));

        return {
            data: formattedEvents,
            totalPages: Math.ceil(eventsCount / limit),
        };
    } catch (error) {
        handleError(error);
        return {
            data: [],
            totalPages: 0,
        };
    }
};

export const getRelatedEventsByCategory = async ({
    categoryId,
    eventId,
    limit = 3,
    page = 1,
}: GetRelatedEventsByCategoryParams) => {
    try {
        // Ensure page is converted to number for arithmetic operations
        const pageNumber = Number(page);
        const skipAmount = (pageNumber - 1) * limit;

        // Fetch related events based on category and excluding the given event ID
        const conditions = {
            AND: [
                { categoryId },
                { id: { not: eventId } },
            ],
        };

        // Query events using Prisma
        const eventsQuery = await prisma.event.findMany({
            where: conditions,
            take: limit,
            skip: skipAmount,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                organizer: true,
                category: true,
            },
        });

        // Count total related events
        const eventsCount = await prisma.event.count({
            where: conditions,
        });

        // Format events to ensure consistency
        const formattedEvents = eventsQuery.map(event => ({
            ...event,
            category: event.category ?? { name: '' },
            organizer: event.organizer
                ? {
                      id: event.organizer.id,
                      firstName: event.organizer.firstName,
                      lastName: event.organizer.lastName,
                  }
                : { id: '', firstName: '', lastName: '' },
        }));

        return {
            data: formattedEvents,
            totalPages: Math.ceil(eventsCount / limit),
        };
    } catch (error) {
        handleError(error);
        return {
            data: [],
            totalPages: 0,
        };
    }
};
