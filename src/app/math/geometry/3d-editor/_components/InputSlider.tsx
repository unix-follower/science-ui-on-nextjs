import React from "react"
import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Slider from "@mui/material/Slider"
import MuiInput from "@mui/material/Input"

const Input = styled(MuiInput)`
  width: 42px;
`
interface InputSliderProps {
  label: string
  value: number
  max?: number
  setValue: (value: number) => void
}

export default function InputSlider({ label, value, setValue, max = 360 }: InputSliderProps) {
  const handleSliderChange = (_event: Event, newValue: number) => {
    setValue(newValue)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === "" ? 0 : Number(event.target.value))
  }

  const handleBlur = () => {
    if (value < 0) {
      setValue(0)
    } else if (value > max) {
      setValue(max)
    }
  }

  return (
    <Box sx={{ width: 250 }}>
      <Typography id="input-slider" gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        <Grid size="grow">
          <Slider max={max} value={value} onChange={handleSliderChange} aria-labelledby="input-slider" />
        </Grid>
        <Grid>
          <Input
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 10,
              min: 0,
              max,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
