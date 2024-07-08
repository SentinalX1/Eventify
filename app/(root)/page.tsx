"use client"

import Collection from '@/components/shared/Collection';
import { Button } from '@/components/ui/button';
import { getAllEvents } from '@/lib/actions/event.actions';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Event as PrismaEvent } from '@prisma/client';
import { EventWithDetails } from '@/components/shared/Card';



const Home: React.FC = () => {
  const [events, setEvents] = useState<{
    data: EventWithDetails[];
    totalPages: number;
}>({
    data: [],
    totalPages: 0,
});

useEffect(() => {
    const fetchEvents = async () => {
        try {
            const fetchedEvents = await getAllEvents({
                query: '',
                category: '',
                page: 1,
                limit: 6,
            });

            if (fetchedEvents && fetchedEvents.data) {
                setEvents(fetchedEvents);
            } else {
                console.error('No events fetched or empty data.');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    fetchEvents();
}, []);

    return (
        <>
            <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
                <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
                    <div className="flex flex-col justify-center gap-8">
                        <h1 className="h1-bold capitalize">
                            host, connect, celebrate: your events, our platform!
                        </h1>
                        <p className="p-regular-20 md:p-regular-24">
                            Book and learn helpful tips from 3,168+ mentors in world-class
                            companies with our global community.
                        </p>
                        <Button size="lg" asChild className="button w-full sm:w-fit">
                            <Link href="#events">Explore Now</Link>
                        </Button>
                    </div>
                    <Image
                        src="/assets/images/hero.png"
                        alt="hero"
                        width={1000}
                        height={1000}
                        className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"
                    />
                </div>
            </section>

            <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
                <h2 className="h2-bold">Trusted by Thousands of Events.</h2>
                <div className="flex w-full flex-col gap-5 md:flex-row">S & C</div>

                <Collection
                    data={events.data}
                    emptyTitle="No Events Found"
                    emptyStateSubtext="Come back later"
                    collectionType="All_Events"
                    limit={6}
                    page={1}
                    totalPages={events.totalPages ?? 0}
                />
            </section>
        </>
    );
};

export default Home;
