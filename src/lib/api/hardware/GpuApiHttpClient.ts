import { ApiHttpClientSettings, ApiHttpClientType } from "@/lib/api/ApiHttpClient"
import RawGPUResponse from "./gpuModel"
import axios from "axios"

interface GpuApi {
  getData(): Promise<RawGPUResponse>
}

export default class GpuApiHttpClient implements GpuApi {
  private delegate: FetchHttpClient

  constructor(settings: ApiHttpClientSettings) {
    const { apiURL, clientStrategy } = settings
    switch (clientStrategy) {
      case ApiHttpClientType.AXIOS:
        this.delegate = new AxiosHttpClient(apiURL)
        break
      case ApiHttpClientType.FETCH:
      default:
        this.delegate = new FetchHttpClient(apiURL)
    }
  }

  getData(): Promise<RawGPUResponse> {
    return this.delegate.getData()
  }
}

abstract class AbstractHttpClient {
  protected readonly apiURL: string

  constructor(apiURL: string) {
    this.apiURL = apiURL
  }
}

class FetchHttpClient extends AbstractHttpClient implements GpuApi {
  async getData(): Promise<RawGPUResponse> {
    const response = await fetch(this.apiURL)
    return response.json()
  }
}

class AxiosHttpClient extends AbstractHttpClient implements GpuApi {
  async getData(): Promise<RawGPUResponse> {
    const response = await axios.get(this.apiURL)
    return response.data
  }
}
