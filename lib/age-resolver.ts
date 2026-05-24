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

  return null
}
