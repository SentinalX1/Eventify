import { formatDateTime } from '@/lib/utils'
import { Event } from '@prisma/client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Event as PrismaEvent } from '@prisma/client';
import Image from 'next/image';
import { DeleteConfirmation } from './DeleteConfirmation';
import { useAuth } from '@clerk/nextjs';


 export type EventWithDetails = PrismaEvent & {
    category: { name: string };
    organizer: { id: string; firstName: string; lastName: string };
};

type CardProps = {
    event: EventWithDetails;
    hasOrderLink?: boolean;
    hidePrice: boolean;
};

const Card = ({ event, hasOrderLink, hidePrice }: CardProps) => {
    const {userId} = useAuth()

    const creatorId = '680d7baf-01ae-440d-af2a-0356256d99e6';
    const isEventCreator = creatorId === event.organizer.id;

  console.log("User ID:", creatorId)
  console.log("Organizer ID:", event.organizer.id)
  console.log("is creator:", isEventCreator)
  console.log("useAuth:", userId )

    return (
        <div className='group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md 
    transition-all hover:shadow-lg md:min-h-[438px]'>
            <Link href={`/events/${event.id}`} 
            className='flex-center flex-grow bg-grey-50 bg-cover bg-center text-grey-500' 
            style={{backgroundImage: `url(${event.imageUrl})`}}/>

            {isEventCreator && !hidePrice && (
                <div className='absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all'>
                    <Link href={`/events/${event.id}/update`}>
                        <Image src="/assets/icons/edit.svg" 
                        alt='Edit'
                        width={20} height={20} />
                    </Link>

                    <DeleteConfirmation eventId={event.id}/>
                </div>
            )}

            <Link href={`/events/${event.id}`} className='flex min-h-[230px] flex-col gap-3 p-5 md:gap-4'>
                {!hidePrice && 
            <div className="flex gap-2">
                <span className='p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-60'>
                    {event.isFree ? 'FREE' : `$${event.price}`}
                </span>
                <p className='p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500'>
                    {event.category.name}
                </p>
            </div>}

            <p className='p-medium-16 p-medium-18 text-grey-500'>
                {formatDateTime(event.startDateTime).dateTime}
            </p>

            <p className='p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black'>
                {event.title}
            </p>

            <div className="flex-between w-full">
                <p className="p-medium-14 md:p-medium-16 text-grey-600">
                    {event.organizer.firstName} {event.organizer.lastName}
                </p>

                {hasOrderLink && (
                    <link href={`/orders?eventId=${event.id}`} className='flex gap-2'>
                    <p className='text-primary-500'>Order Details</p>
                    <Image src='/assets/icons/arrow.svg'
                    alt='search'
                    width={10} height={10} />
                     </link>
                )}
            </div>
             </Link>
            
        </div>
    )
}

export default Card