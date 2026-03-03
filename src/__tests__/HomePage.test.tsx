import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import Page from "@/app/page"

describe("Home page", () => {
  test("renders home page", () => {
    // given
    render(<Page />)

    // then
    const menu = screen.getByTestId("main-menu")
    expect(menu).toBeInTheDocument()
  })
})
