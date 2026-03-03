import { AppProps } from "next/app"
import { I18nextProvider } from "../../../node_modules/react-i18next"
import i18n from "@/config/i18n"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  )
}
