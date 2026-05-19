import { create } from 'zustand';
import { SettingsAPI } from '../api/settings';
import type { DevConfig, TeamMember, AvailabilitySlot, MeetingRequest, WorkSchedule, TeamResource, PinnedNote, MeetingNote } from '../types';
import { DEFAULT_WORK_SCHEDULE } from '../types';

export const DEFAULT_SETTINGS: DevConfig = {
  name: 'Tu Nombre',
  email: 'hola@tuweb.com',
  whatsApp: '5491112345678',
  portfolio: 'tuportfolio.dev',
  city: 'Buenos Aires, AR',
  defaultCurrency: 'USD',
  plan: 'free',
  profile: 'developer',
  hasCompletedOnboarding: false,
};

interface SettingsState {
  settings: DevConfig;
  isLoaded: boolean;
  isNewUser: boolean;       // true only when no settings row exists in DB (first ever login)
  error: string | null;
  couponLoading: boolean;
  couponError: string | null;
  couponSuccess: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<DevConfig>) => void;
  clearSettings: () => void;
  redeemCoupon: (code: string) => Promise<void>;

  // Team members
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;

  // Availability slots
  addSlot: (slot: AvailabilitySlot) => void;
  removeSlot: (id: string) => void;
  updateSlot: (slot: AvailabilitySlot) => void;
  clearDaySlots: (memberId: string, date: string) => void;

  // Meetings
  addMeeting: (meeting: MeetingRequest) => void;
  updateMeeting: (meeting: MeetingRequest) => void;
  removeMeeting: (id: string) => void;

  // Work schedule
  setWorkSchedule: (schedule: WorkSchedule) => void;
  generateSlotsFromSchedule: (schedule: WorkSchedule, memberId?: string) => void;

  // Team resources
  addTeamResource: (resource: TeamResource) => void;
  removeTeamResource: (id: string) => void;

  // Pinned notes
  addPinnedNote: (note: PinnedNote) => void;
  removePinnedNote: (id: string) => void;

  // Meeting notes
  addMeetingNote: (note: MeetingNote) => void;
  updateMeetingNote: (note: MeetingNote) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  isNewUser: false,
  error: null,
  couponLoading: false,
  couponError: null,
  couponSuccess: null,

  fetchSettings: async () => {
    try {
      const data = await SettingsAPI.fetch();
      if (data) {
        set({
          settings: { ...DEFAULT_SETTINGS, ...data },
          isLoaded: true,
          isNewUser: false
        });
      } else {
        await SettingsAPI.upsert(DEFAULT_SETTINGS);
        set({ settings: DEFAULT_SETTINGS, isLoaded: true, isNewUser: true });
      }
    } catch (err: any) {
      set({ isLoaded: true, error: err.message });
    }
  },

  updateSettings: (newSettings) => {
    const merged = { ...get().settings, ...newSettings };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  clearSettings: () => set({
    settings: DEFAULT_SETTINGS,
    isLoaded: false,
    isNewUser: false,
    error: null,
    couponError: null,
    couponSuccess: null
  }),

  redeemCoupon: async (code) => {
    set({ couponLoading: true, couponError: null, couponSuccess: null });
    try {
      const result = await SettingsAPI.redeemPromoCode(code.trim().toUpperCase());
      const newSettings: Partial<DevConfig> = {
        plan: result.plan as DevConfig['plan'],
        planExpiresAt: result.expiresAt,
        couponRedeemed: code.trim().toUpperCase(),
      };
      get().updateSettings(newSettings);
      set({ couponLoading: false, couponSuccess: result.message });
    } catch (err: any) {
      set({ couponLoading: false, couponError: err.message });
    }
  },

  addTeamMember: (member) => {
    const current = get().settings;
    const teamMembers = [...(current.teamMembers ?? []), member];
    const merged = { ...current, teamMembers };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  updateTeamMember: (member) => {
    const current = get().settings;
    const teamMembers = (current.teamMembers ?? []).map((m) =>
      m.id === member.id ? member : m
    );
    const merged = { ...current, teamMembers };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  removeTeamMember: (id) => {
    const current = get().settings;
    const teamMembers = (current.teamMembers ?? []).filter((m) => m.id !== id);
    const merged = { ...current, teamMembers };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  addSlot: (slot) => {
    const current = get().settings;
    const availabilitySlots = [...(current.availabilitySlots ?? []), slot];
    const merged = { ...current, availabilitySlots };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  removeSlot: (id) => {
    const current = get().settings;
    const availabilitySlots = (current.availabilitySlots ?? []).filter((s) => s.id !== id);
    const merged = { ...current, availabilitySlots };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  updateSlot: (slot) => {
    const current = get().settings;
    const availabilitySlots = (current.availabilitySlots ?? []).map((s) =>
      s.id === slot.id ? slot : s
    );
    const merged = { ...current, availabilitySlots };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  clearDaySlots: (memberId, date) => {
    const current = get().settings;
    const availabilitySlots = (current.availabilitySlots ?? []).filter(
      (s) => !(s.memberId === memberId && s.date === date)
    );
    const merged = { ...current, availabilitySlots };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  addMeeting: (meeting) => {
    const current = get().settings;
    const meetings = [...(current.meetings ?? []), meeting];
    const merged = { ...current, meetings };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  updateMeeting: (meeting) => {
    const current = get().settings;
    const meetings = (current.meetings ?? []).map((m) =>
      m.id === meeting.id ? meeting : m
    );
    const merged = { ...current, meetings };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  removeMeeting: (id) => {
    const current = get().settings;
    const meetings = (current.meetings ?? []).filter((m) => m.id !== id);
    const merged = { ...current, meetings };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  addTeamResource: (resource) => {
    const current = get().settings;
    const teamResources = [...(current.teamResources ?? []), resource];
    const merged = { ...current, teamResources };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  removeTeamResource: (id) => {
    const current = get().settings;
    const teamResources = (current.teamResources ?? []).filter((r) => r.id !== id);
    const merged = { ...current, teamResources };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  addPinnedNote: (note) => {
    const current = get().settings;
    const pinnedNotes = [...(current.pinnedNotes ?? []), note];
    const merged = { ...current, pinnedNotes };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  removePinnedNote: (id) => {
    const current = get().settings;
    const pinnedNotes = (current.pinnedNotes ?? []).filter((n) => n.id !== id);
    const merged = { ...current, pinnedNotes };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  addMeetingNote: (note) => {
    const current = get().settings;
    const meetingNotes = [...(current.meetingNotes ?? []), note];
    const merged = { ...current, meetingNotes };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  updateMeetingNote: (note) => {
    const current = get().settings;
    const meetingNotes = (current.meetingNotes ?? []).map((n) => n.id === note.id ? note : n);
    const merged = { ...current, meetingNotes };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  setWorkSchedule: (schedule) => {
    const current = get().settings;
    const merged = { ...current, workSchedule: schedule };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },

  generateSlotsFromSchedule: (schedule, memberId = 'owner') => {
    const current = get().settings;
    const { days, startTime, endTime, meetingDuration, bufferBetween, weeksAhead } = {
      ...DEFAULT_WORK_SCHEDULE,
      ...schedule,
    };

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const slotStep = meetingDuration + bufferBetween;

    const existingSlots = current.availabilitySlots ?? [];
    // Only remove future non-booked slots for this member before regenerating
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const keepSlots = existingSlots.filter(
      (s) => s.memberId !== memberId || s.isBooked || new Date(s.date) < today
    );

    const newSlots: AvailabilitySlot[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let w = 0; w < weeksAhead * 7; w++) {
      const date = new Date(now);
      date.setDate(now.getDate() + w);
      if (!days.includes(date.getDay())) continue;

      const dateStr = date.toISOString().split('T')[0];

      // Skip dates that already have booked slots (preserve them)
      let cursor = startMinutes;
      while (cursor + meetingDuration <= endMinutes) {
        const hh = String(Math.floor(cursor / 60)).padStart(2, '0');
        const mm = String(cursor % 60).padStart(2, '0');
        const endCursor = cursor + meetingDuration;
        const eh = String(Math.floor(endCursor / 60)).padStart(2, '0');
        const em = String(endCursor % 60).padStart(2, '0');

        // Don't duplicate if already exists in keepSlots
        const alreadyExists = keepSlots.some(
          (s) => s.memberId === memberId && s.date === dateStr && s.startTime === `${hh}:${mm}`
        );
        if (!alreadyExists) {
          newSlots.push({
            id: `gen-${memberId}-${dateStr}-${hh}${mm}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            memberId,
            date: dateStr,
            startTime: `${hh}:${mm}`,
            endTime: `${eh}:${em}`,
            isBooked: false,
          });
        }
        cursor += slotStep;
      }
    }

    const availabilitySlots = [...keepSlots, ...newSlots];
    const merged = { ...current, availabilitySlots, workSchedule: schedule };
    set({ settings: merged });
    SettingsAPI.upsert(merged).catch(console.error);
  },
}));
