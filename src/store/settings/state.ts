import { Config } from '@/types/config'

export interface SettingsStateInterface {
  dataVaultUrls: string[]
  ocaRepositoryUrls: string[]
  language: string
  agentUrl: string
}

function state(): SettingsStateInterface {
  /* eslint-disable */
  return {
    // @ts-ignore
    dataVaultUrls: (config as Config)
      .env.DATA_VAULT_URLS.split(','),
    // @ts-ignore
    ocaRepositoryUrls: (config as Config)
      .env.OCA_REPOSITORY_URLS.split(','),
    // @ts-ignore
    language: (config as Config)
      .env.DEFAULT_LANGUAGE,
    // @ts-ignore
    agentUrl: (config as Config)
      .env.DEFAULT_AGENT_URL
  }
  /* eslint-enable */
}

export default state
