import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { useTranslations } from "next-intl"

export default getRequestConfig(async () => {
  const store = await cookies()
  const locale = store.get("locale")?.value || "en"

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})

export type Translator = ReturnType<typeof useTranslations>
