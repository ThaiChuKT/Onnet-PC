/**
 * Database Constants & Mappings (v8_complete_schema_mapping.sql)
 * Centralized source for tier, spec, and plan configurations
 */

// ============================================================
// TIER CONFIGURATIONS
// ============================================================

export const TIER_IDS = {
  BASIC: 1,
  PRO: 2,
  ULTRA: 3,
} as const;

export const TIER_METADATA = {
  [TIER_IDS.BASIC]: {
    id: 1,
    name: "Basic",
    tierLevel: 1,
    queuePriority: 30,
    canAccessExclusiveSpecs: false,
    supportLevel: "standard",
    isActive: true,
  },
  [TIER_IDS.PRO]: {
    id: 2,
    name: "Pro",
    tierLevel: 2,
    queuePriority: 20,
    canAccessExclusiveSpecs: false,
    supportLevel: "priority",
    isActive: true,
  },
  [TIER_IDS.ULTRA]: {
    id: 3,
    name: "Ultra",
    tierLevel: 3,
    queuePriority: 10,
    canAccessExclusiveSpecs: true,
    supportLevel: "vip",
    isActive: true,
  },
} as const;

// ============================================================
// PC SPECS CONFIGURATIONS
// ============================================================

export const SPEC_IDS = {
  BASIC_INTEL: 1,
  BASIC_AMD: 2,
  PRO_INTEL: 3,
  PRO_AMD: 4,
  ULTRA_INTEL: 5,
  ULTRA_AMD: 6,
} as const;

export const SPEC_DETAILS = {
  [SPEC_IDS.BASIC_INTEL]: {
    id: 1,
    specName: "Basic Intel Starter",
    cpu: "Intel Core i5-12400F",
    gpu: "NVIDIA RTX 3060",
    ram: 16,
    storage: 512,
    os: "Windows 11",
    description: "Phù hợp gaming Esports 1080p mượt mà",
    isExclusive: false,
    isAvailable: true,
    tierId: TIER_IDS.BASIC,
  },
  [SPEC_IDS.BASIC_AMD]: {
    id: 2,
    specName: "Basic AMD Ryzen Core",
    cpu: "AMD Ryzen 5 5600X",
    gpu: "AMD Radeon RX 6600",
    ram: 16,
    storage: 512,
    os: "Windows 11",
    description: "Hiệu năng gaming thuần túy tối ưu chi phí",
    isExclusive: false,
    isAvailable: true,
    tierId: TIER_IDS.BASIC,
  },
  [SPEC_IDS.PRO_INTEL]: {
    id: 3,
    specName: "Pro Intel Gaming",
    cpu: "Intel Core i7-13700F",
    gpu: "NVIDIA RTX 4070",
    ram: 32,
    storage: 1024,
    os: "Windows 11",
    description: "Chiến mượt AAA Max Setting và Livestream",
    isExclusive: false,
    isAvailable: true,
    tierId: TIER_IDS.PRO,
  },
  [SPEC_IDS.PRO_AMD]: {
    id: 4,
    specName: "Pro Ryzen Performance",
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA RTX 4070 Super",
    ram: 32,
    storage: 1024,
    os: "Windows 11",
    description: "Đồ họa đỉnh cao, xử lý đa nhiệm mượt mà",
    isExclusive: false,
    isAvailable: true,
    tierId: TIER_IDS.PRO,
  },
  [SPEC_IDS.ULTRA_INTEL]: {
    id: 5,
    specName: "Ultra Intel Ultimate",
    cpu: "Intel Core i9-14900K",
    gpu: "NVIDIA RTX 4090",
    ram: 64,
    storage: 2048,
    os: "Windows 11 Pro",
    description: "Siêu quái vật Workstation chuyên render và 4K Gaming",
    isExclusive: true,
    isAvailable: true,
    tierId: TIER_IDS.ULTRA,
  },
  [SPEC_IDS.ULTRA_AMD]: {
    id: 6,
    specName: "Ultra AMD Beast",
    cpu: "AMD Ryzen 9 7950X",
    gpu: "NVIDIA RTX 4090",
    ram: 64,
    storage: 2048,
    os: "Windows 11 Pro",
    description: "Cực đỉnh xử lý thuật toán AI và đồ họa nặng",
    isExclusive: true,
    isAvailable: true,
    tierId: TIER_IDS.ULTRA,
  },
} as const;

// ============================================================
// TIER TO SPECS MAPPING
// ============================================================

export const TIER_SPEC_MAP = {
  basic: [SPEC_IDS.BASIC_INTEL, SPEC_IDS.BASIC_AMD] as const,
  pro: [SPEC_IDS.PRO_INTEL, SPEC_IDS.PRO_AMD] as const,
  ultra: [SPEC_IDS.ULTRA_INTEL, SPEC_IDS.ULTRA_AMD] as const,
} as const;

// Reverse mapping: spec ID → tier ID
export const SPEC_TO_TIER_MAP: Record<number, number> = {
  [SPEC_IDS.BASIC_INTEL]: TIER_IDS.BASIC,
  [SPEC_IDS.BASIC_AMD]: TIER_IDS.BASIC,
  [SPEC_IDS.PRO_INTEL]: TIER_IDS.PRO,
  [SPEC_IDS.PRO_AMD]: TIER_IDS.PRO,
  [SPEC_IDS.ULTRA_INTEL]: TIER_IDS.ULTRA,
  [SPEC_IDS.ULTRA_AMD]: TIER_IDS.ULTRA,
};

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================

export const PLAN_IDS = {
  BASIC_INTEL_WEEKLY: 1,
  BASIC_AMD_WEEKLY: 2,
  PRO_INTEL_MONTHLY: 3,
  PRO_AMD_MONTHLY: 4,
  ULTRA_INTEL_MONTHLY: 5,
  ULTRA_AMD_MONTHLY: 6,
} as const;

export const PLAN_DETAILS = {
  [PLAN_IDS.BASIC_INTEL_WEEKLY]: {
    id: 1,
    planName: "Basic Intel - Weekly",
    specId: SPEC_IDS.BASIC_INTEL,
    durationDays: 7,
    maxHoursPerDay: null,
    isActive: true,
  },
  [PLAN_IDS.BASIC_AMD_WEEKLY]: {
    id: 2,
    planName: "Basic AMD - Weekly",
    specId: SPEC_IDS.BASIC_AMD,
    durationDays: 7,
    maxHoursPerDay: null,
    isActive: true,
  },
  [PLAN_IDS.PRO_INTEL_MONTHLY]: {
    id: 3,
    planName: "Pro Intel - Monthly",
    specId: SPEC_IDS.PRO_INTEL,
    durationDays: 30,
    maxHoursPerDay: null,
    isActive: true,
  },
  [PLAN_IDS.PRO_AMD_MONTHLY]: {
    id: 4,
    planName: "Pro AMD - Monthly",
    specId: SPEC_IDS.PRO_AMD,
    durationDays: 30,
    maxHoursPerDay: null,
    isActive: true,
  },
  [PLAN_IDS.ULTRA_INTEL_MONTHLY]: {
    id: 5,
    planName: "Ultra Intel - Monthly",
    specId: SPEC_IDS.ULTRA_INTEL,
    durationDays: 30,
    maxHoursPerDay: null,
    isActive: true,
  },
  [PLAN_IDS.ULTRA_AMD_MONTHLY]: {
    id: 6,
    planName: "Ultra AMD - Monthly",
    specId: SPEC_IDS.ULTRA_AMD,
    durationDays: 30,
    maxHoursPerDay: null,
    isActive: true,
  },
} as const;

// Spec to plans mapping
export const SPEC_PLANS_MAP: Record<number, number[]> = {
  [SPEC_IDS.BASIC_INTEL]: [PLAN_IDS.BASIC_INTEL_WEEKLY],
  [SPEC_IDS.BASIC_AMD]: [PLAN_IDS.BASIC_AMD_WEEKLY],
  [SPEC_IDS.PRO_INTEL]: [PLAN_IDS.PRO_INTEL_MONTHLY],
  [SPEC_IDS.PRO_AMD]: [PLAN_IDS.PRO_AMD_MONTHLY],
  [SPEC_IDS.ULTRA_INTEL]: [PLAN_IDS.ULTRA_INTEL_MONTHLY],
  [SPEC_IDS.ULTRA_AMD]: [PLAN_IDS.ULTRA_AMD_MONTHLY],
};

// ============================================================
// MACHINE ZONES & DISTRIBUTION
// ============================================================

export const MACHINE_DISTRIBUTION = {
  // Machines 1-10: Basic tier (5 Intel, 5 AMD)
  BASIC: {
    start: 1,
    end: 10,
    total: 10,
    zone: "Zone Basic",
  },
  // Machines 11-20: Pro tier (5 Intel, 5 AMD)
  PRO: {
    start: 11,
    end: 20,
    total: 10,
    zone: "Zone Pro",
  },
  // Machines 21-30: Ultra tier (5 Intel, 5 AMD)
  ULTRA: {
    start: 21,
    end: 30,
    total: 10,
    zone: "Zone Ultra",
  },
} as const;

// ============================================================
// BOOKING STATUS
// ============================================================

export const BOOKING_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  ACTIVE: "active",
  EXPIRED: "expired",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// ============================================================
// BOOKING TYPE
// ============================================================

export const BOOKING_TYPE = {
  SUBSCRIPTION: "subscription",
  HOURLY: "hourly",
} as const;

export type BookingType = typeof BOOKING_TYPE[keyof typeof BOOKING_TYPE];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get all specs for a given tier (by name)
 */
export function getSpecsForTier(tierName: string): typeof SPEC_DETAILS[keyof typeof SPEC_DETAILS][] {
  const tierKey = tierName.toLowerCase() as keyof typeof TIER_SPEC_MAP;
  const specIds = TIER_SPEC_MAP[tierKey] ?? [];
  return specIds.map((id) => SPEC_DETAILS[id as keyof typeof SPEC_DETAILS]);
}

/**
 * Get plan details for a specific spec
 */
export function getPlansForSpec(specId: number) {
  const planIds = SPEC_PLANS_MAP[specId] ?? [];
  return planIds.map((id) => PLAN_DETAILS[id as keyof typeof PLAN_DETAILS]);
}

/**
 * Get tier ID from spec ID
 */
export function getTierIdFromSpec(specId: number): number | undefined {
  return SPEC_TO_TIER_MAP[specId];
}

/**
 * Get tier name from tier ID
 */
export function getTierNameFromId(tierId: number): string | undefined {
  return TIER_METADATA[tierId as keyof typeof TIER_METADATA]?.name;
}

/**
 * Format price with USD currency
 */
export function formatPriceUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get machine zone from PC ID
 */
export function getMachineZone(pcId: number): string {
  if (pcId >= MACHINE_DISTRIBUTION.BASIC.start && pcId <= MACHINE_DISTRIBUTION.BASIC.end) {
    return MACHINE_DISTRIBUTION.BASIC.zone;
  }
  if (pcId >= MACHINE_DISTRIBUTION.PRO.start && pcId <= MACHINE_DISTRIBUTION.PRO.end) {
    return MACHINE_DISTRIBUTION.PRO.zone;
  }
  if (pcId >= MACHINE_DISTRIBUTION.ULTRA.start && pcId <= MACHINE_DISTRIBUTION.ULTRA.end) {
    return MACHINE_DISTRIBUTION.ULTRA.zone;
  }
  return "Unknown";
}

/**
 * Check if a spec is exclusive (Ultra tier only)
 */
export function isSpecExclusive(specId: number): boolean {
  return SPEC_DETAILS[specId as keyof typeof SPEC_DETAILS]?.isExclusive ?? false;
}
