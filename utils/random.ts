/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Weighted random selection from an array of options
 */
export type WeightedOption<T> = {
  value: T
  weight: number
}

export function weightedRandom<T>(options: WeightedOption<T>[]): T {
  // Calculate the sum of all weights
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)

  // Generate a random number between 0 and totalWeight
  const randomValue = Math.random() * totalWeight

  // Find the option that corresponds to the random value
  let weightSum = 0
  for (const option of options) {
    weightSum += option.weight
    if (randomValue <= weightSum) {
      return option.value
    }
  }

  // Fallback to the last option (should never happen unless weights sum to 0)
  return options[options.length - 1].value
}

