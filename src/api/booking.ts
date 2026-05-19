import { supabase } from '../lib/supabase';
import type { AvailabilitySlot, MeetingRequest, TeamMember } from '../types';

export interface PublicBookingData {
  ownerName: string;
  teamMembers: TeamMember[];
  slots: AvailabilitySlot[];
  meetings: MeetingRequest[]; // to know which slots are booked
  bookingSlug: string;
}

/** Fetch public availability data by booking slug (no auth required). */
export async function fetchPublicAvailability(slug: string): Promise<PublicBookingData | null> {
  // Read from the settings table - requires a public policy or RPC
  const { data, error } = await supabase
    .from('settings')
    .select('config')
    .eq('booking_slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  const cfg = data.config;
  return {
    ownerName: cfg.name ?? 'Equipo',
    teamMembers: cfg.teamMembers ?? [],
    slots: (cfg.availabilitySlots ?? []).filter((s: AvailabilitySlot) => !s.isBooked),
    meetings: cfg.meetings ?? [],
    bookingSlug: slug,
  };
}

/** Submit a meeting request (public, no auth). Stores in a public bookings table. */
export async function submitMeetingRequest(
  slug: string,
  request: Omit<MeetingRequest, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  const { error } = await supabase
    .from('booking_requests')
    .insert({
      slug,
      data: {
        ...request,
        id: crypto.randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  if (error) throw new Error('No se pudo enviar la solicitud: ' + error.message);
}
