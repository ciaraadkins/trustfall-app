let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

// Define the function BEFORE calling it
function mergeConfig(nextConfig, _userConfig) {
  if (!_userConfig) {
    return nextConfig;  // Make sure to return nextConfig
  }

  // ESM imports will have a "default" property
  const userConfigObj = _userConfig.default || _userConfig

  for (const key in userConfigObj) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfigObj[key],
      }
    } else {
      nextConfig[key] = userConfigObj[key]
    }
  }
  
  return nextConfig;  // Return the merged config
}

// Now call the function
const mergedConfig = mergeConfig(nextConfig, userConfig)

export default mergedConfig  // Export the merged config