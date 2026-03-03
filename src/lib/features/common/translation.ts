export default interface I18nTranslation {
  lang?: string
  translations: Record<string, string | Record<string, string>>
}
