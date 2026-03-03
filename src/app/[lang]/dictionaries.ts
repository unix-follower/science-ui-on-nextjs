import "server-only"

const dictionaries: { [index: string]: () => Promise<Record<string, string | Record<string, string>>> } = {
  en: () => import("/public/locales/en/translation.json").then((module) => module.default),
}

export const getI18nDictionary = async (locale: string) => dictionaries[locale]()
