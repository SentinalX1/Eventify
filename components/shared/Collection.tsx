import { Event } from '@prisma/client'
import React from 'react'
import Card, { EventWithDetails } from './Card';
import { Event as PrismaEvent } from '@prisma/client';


type CollectionProps = {
    data: EventWithDetails[];
    emptyTitle: string;
    emptyStateSubtext: string;
    page: number | string;
    totalPages?: number;
    collectionType?: 'Event_Organized' | 'My_Tickets' | 'All_Events';
    urlParamName?: string;
    limit: number;
};

const Collection = ({
    data, 
    emptyTitle,
    emptyStateSubtext,
    page,
    totalPages = 0,
    collectionType,
    urlParamName,
}: CollectionProps) => {
  return (
    <>
    {data.length > 0 ? (
        <div className='flex flex-col items-center gap-10'>
            <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10 ">
                {data.map((event)=> {
                    const hasOrderLink = collectionType === 'Event_Organized'
                    const hidePrice = collectionType === 'My_Tickets'

                    return (
                        <li key={event.id} className='flex justify-center'>
                            <Card event={event}
                            hasOrderLink={hasOrderLink} 
                            hidePrice={hidePrice} />
                        </li>
                    )
                })}
            </ul>
        </div>
    ): (
        <div className='flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center'>
            <h3 className='p-bold-20 md:h5-bold'>{emptyTitle}</h3>
            <p className='p-regular-14'>{emptyStateSubtext}</p>
        </div>
    )}
    </>
  )
}

export default Collection