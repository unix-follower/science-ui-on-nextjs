"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

interface DropdownMenuProps {
  title: string
  href?: string
  links: {
    href: string
    label: string
  }[]
}

function DropdownMenu({ title, links, href }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  let hideTimeout: NodeJS.Timeout

  const handleMouseEnter = () => {
    clearTimeout(hideTimeout)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => setIsOpen(false), 50) // Delay hiding the submenu
  }

  return (
    <div className="group relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
        {href ? <Link href={href}>{title}</Link> : title}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-48 rounded-md bg-gray-800 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AstronomyMenu() {
  return (
    <Link href="/astronomy" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
      Astronomy
    </Link>
  )
}

function ComputerScienceMenu() {
  return (
    <DropdownMenu
      title="Computer Science"
      href="/computer-science"
      links={[
        { href: "/computer-science/ai", label: "AI" },
        { href: "/computer-science/cybersecurity", label: "Cybersecurity" },
        { href: "/computer-science/database", label: "Database" },
        { href: "/computer-science/dsa", label: "DSA" },
        { href: "/computer-science/hardware", label: "Hardware" },
        { href: "/computer-science/net", label: "Network" },
        { href: "/computer-science/programming-lang", label: "Programming Languages" },
      ]}
    />
  )
}

function MathMenu() {
  return (
    <DropdownMenu
      title="Math"
      href="/math"
      links={[
        { href: "/math/algebra", label: "Algebra" },
        { href: "/math/geometry", label: "Geometry" },
        { href: "/math/trigonometry", label: "Trigonometry" },
        { href: "/math/precalculus", label: "Precalculus" },
        { href: "/math/calculus", label: "Calculus" },
        { href: "/math/multivariable-calculus", label: "Multivariable calculus" },
        { href: "/math/linear-algebra", label: "Linear algebra" },
        { href: "/math/differential-equations", label: "Differential equations" },
        { href: "/math/statistics-probability", label: "Statistics & Probability" },
      ]}
    />
  )
}

function ChemistryMenu() {
  return (
    <DropdownMenu
      title="Chemistry"
      href="/chemistry"
      links={[
        { href: "/chemistry/dbs/pub-chem/fda", label: "PubChem FDA" },
        { href: "/chemistry/dbs/pub-chem/graph/compound", label: "PubChem Graph Compound" },
        { href: "/chemistry/biochemistry", label: "Biochemistry" },
        { href: "/chemistry/inorganic", label: "Inorganic" },
        { href: "/chemistry/organic", label: "Organic" },
        { href: "/chemistry/physical", label: "Physical" },
      ]}
    />
  )
}

function PhysicsMenu() {
  return (
    <DropdownMenu
      title="Physics"
      href="/physics"
      links={[
        { href: "/physics/classical-mechanics", label: "Classical mechanics" },
        { href: "/physics/electromagnetism", label: "Electromagnetism" },
        { href: "/physics/quantum-mechanics", label: "Quantum mechanics" },
        { href: "/physics/relativity", label: "Relativity" },
        { href: "/physics/thermodynamics-and-statistical-mechanics", label: "Thermodynamics & statistical mechanics" },
      ]}
    />
  )
}

function BiologyMenu() {
  return (
    <Link
      href="/biology"
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
    >
      Biology
    </Link>
  )
}

function FinanceMenu() {
  return (
    <DropdownMenu title="Finance" href="/finance" links={[{ href: "/finance/stock-market", label: "Stock market" }]} />
  )
}

function LanguageMenu() {
  return (
    <DropdownMenu
      title="Language"
      href="/lang"
      links={[
        { href: "/lang/english", label: "English" },
        { href: "/lang/spanish", label: "Spanish" },
        { href: "/lang/chinese", label: "Chinese" },
      ]}
    />
  )
}

function OtherMenu() {
  return (
    <DropdownMenu
      title="Other"
      links={[
        { href: "/cooking", label: "Cooking" },
        { href: "/earth-science", label: "Earth science" },
        { href: "/economics", label: "Economics" },
        { href: "/electronics", label: "Electronics" },
        { href: "/auto-mechanic", label: "Auto mechanic" },
        { href: "/music", label: "Music" },
        { href: "/vehicles", label: "Vehicles" },
        { href: "/weapons-and-armor", label: "Weapons & armor" },
      ]}
    />
  )
}

function NotificationButton() {
  return (
    <button
      type="button"
      className="relative mr-3 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
    >
      <span className="absolute -inset-1.5"></span>
      <span className="sr-only">View notifications</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        data-slot="icon"
        aria-hidden="true"
        className="size-6"
      >
        <path
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function ProfileMenu() {
  return (
    <div className="group relative">
      <button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800">
        <span className="absolute -inset-1.5"></span>
        <span className="sr-only">Open user menu</span>
        <Image
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt=""
          className="size-8 rounded-full"
          width={40}
          height={40}
        />
      </button>
      <div className="absolute left-0 mt-2 hidden w-48 rounded-md bg-white shadow-lg group-hover:block">
        <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700 hover:text-white">
          Your Profile
        </a>
        <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700 hover:text-white">
          Settings
        </a>
        <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-700 hover:text-white">
          Sign out
        </a>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex shrink-0 items-center">
      <Image
        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
        alt="Your Company"
        className="h-8 w-auto"
        width={40}
        height={40}
      />
    </div>
  )
}

export default function Navbar() {
  return (
    <nav data-testid="main-menu" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Logo />
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <AstronomyMenu />
                <ComputerScienceMenu />
                <MathMenu />
                <ChemistryMenu />
                <PhysicsMenu />
                <BiologyMenu />
                <FinanceMenu />
                <LanguageMenu />
                <OtherMenu />
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <NotificationButton />
            <ProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
