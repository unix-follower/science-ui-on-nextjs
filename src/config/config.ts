function failOnUnsetVar(envVariable: string | undefined, varName: string): void {
  if (!envVariable) {
    throw new Error(`env variable ${varName} is not set`)
  }
}

export function getBackendURL() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  failOnUnsetVar(backendUrl, "NEXT_PUBLIC_BACKEND_URL")
  return backendUrl!
}

export function getGpuBackendURL() {
  const backendUrl = process.env.NEXT_PUBLIC_GPU_BACKEND_URL
  failOnUnsetVar(backendUrl, "NEXT_PUBLIC_GPU_BACKEND_URL")
  return backendUrl!
}
