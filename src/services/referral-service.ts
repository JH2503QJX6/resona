import type { Doctor, Referral, ReferralInput } from "@/models/referral";

/**
 * Fictional SatuSehat-style records. Not real facilities and not a real
 * directory — they exist so the referral flow can be demonstrated end to end.
 */
const DOCTORS: readonly Doctor[] = [
  {
    id: "prc-001",
    name: "dr. Sari Wijaya, Sp.P",
    specialty: "Pulmonology",
    facility: "RSUP Persahabatan",
    city: "East Jakarta",
    distanceKm: 3.2,
    availability: "Today · 14:00",
    source: "sandbox",
  },
  {
    id: "prc-002",
    name: "dr. Bagus Nugroho, Sp.P",
    specialty: "Pulmonology",
    facility: "RS Paru dr. M. Goenawan Partowidigdo",
    city: "Bogor",
    distanceKm: 6.8,
    availability: "Tomorrow · 09:30",
    source: "sandbox",
  },
  {
    id: "prc-003",
    name: "dr. Ratih Kusuma",
    specialty: "General practice · TB screening",
    facility: "Puskesmas Kecamatan Matraman",
    city: "East Jakarta",
    distanceKm: 1.4,
    availability: "Today · 16:15",
    source: "sandbox",
  },
  {
    id: "prc-004",
    name: "dr. Andini Prakoso, Sp.P",
    specialty: "Pulmonology",
    facility: "RSUD Tarakan",
    city: "Central Jakarta",
    distanceKm: 5.1,
    availability: "Tomorrow · 13:00",
    source: "sandbox",
  },
] as const;

export function listDoctors(): readonly Doctor[] {
  return DOCTORS;
}

export async function createReferral(input: ReferralInput): Promise<Referral> {
  const doctor = DOCTORS.find((item) => item.id === input.doctorId);
  // Simulated latency so the pending state is actually visible.
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    id: `REF-${Date.now().toString(36).toUpperCase()}`,
    doctorId: input.doctorId,
    doctorName: doctor?.name ?? "Clinician",
    facility: doctor?.facility ?? "Health facility",
    scenario: input.scenario,
    createdAt: new Date().toISOString(),
    status: "sent",
    source: "sandbox",
  };
}
