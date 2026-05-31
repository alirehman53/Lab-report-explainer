import { LabMarker, PatientContext, RangeSet } from '@/types/lab'

/**
 * Resolve the correct reference range for a marker given patient age + gender.
 * 
 * Priority:
 * 1. Age-adjusted ranges (if age provided and ageRanges exist)
 * 2. Gender-specific adult ranges
 * 3. Universal adult ranges
 * 4. null if no suitable range found
 */
export function resolveRange(
  marker: LabMarker,
  context: PatientContext
): RangeSet | null {
  // Try age-adjusted ranges first if age is provided
  if (marker.ageRanges && context.age !== undefined) {
    for (const ageRange of marker.ageRanges) {
      if (context.age >= ageRange.ageMin && context.age <= ageRange.ageMax) {
        // Found matching age bracket - now check gender
        if (context.gender === 'male' && ageRange.ranges.male) {
          return ageRange.ranges.male
        }
        if (context.gender === 'female' && ageRange.ranges.female) {
          return ageRange.ranges.female
        }
        if (ageRange.ranges.universal) {
          return ageRange.ranges.universal
        }
      }
    }
  }

  // Fall back to standard adult ranges
  if (!marker.ranges) return null

  if (context.gender === 'male' && marker.ranges.male) {
    return marker.ranges.male
  }
  if (context.gender === 'female' && marker.ranges.female) {
    return marker.ranges.female
  }
  if (marker.ranges.universal) {
    return marker.ranges.universal
  }

  // Gender is unknown (or the requested sex has no specific range) but the
  // marker only defines sex-specific ranges. Rather than DROP the marker
  // entirely (which would hide common results like Hemoglobin for anyone who
  // doesn't specify their sex), synthesize a combined range that spans both
  // sexes. This is intentionally lenient so we never wrongly flag a value when
  // sex is unknown.
  const { male, female } = marker.ranges
  if (male || female) {
    const sets = [male, female].filter((r): r is RangeSet => Boolean(r))
    return {
      low:          Math.min(...sets.map(r => r.low)),
      high:         Math.max(...sets.map(r => r.high)),
      criticalLow:  Math.min(...sets.map(r => r.criticalLow)),
      criticalHigh: Math.max(...sets.map(r => r.criticalHigh)),
    }
  }

  return null
}
