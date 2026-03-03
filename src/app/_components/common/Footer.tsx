interface FooterProps {
  className?: string
}

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()
  return <footer className={className}>© {currentYear} Developed by Artsem Nikitsenka. Unlicensed.</footer>
}
