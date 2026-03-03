"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { AtomDto, BondDto, CompoundSDFDataResponse } from "@/lib/api/chemistry/compoundModels"

function getAtomColor(symbol: string) {
  const colors: Record<string, string> = {
    C: "black",
    O: "red",
    N: "blue",
    H: "white",
  }
  return colors[symbol] ?? "gray"
}

function Atom3dMesh({ atom }: { atom: AtomDto }) {
  const { x, y, z } = atom.point3d!
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={getAtomColor(atom.symbol)} />
    </mesh>
  )
}

function BondMesh({ bond, atoms }: { bond: BondDto; atoms: AtomDto[] }) {
  if (bond.fromAtomIndex === null || bond.toAtomIndex === null) {
    return null
  }

  const fromAtom = atoms[bond.fromAtomIndex]
  const start = fromAtom.point3d!
  const toAtom = atoms[bond.toAtomIndex]
  const end = toAtom.point3d!

  const points = [new THREE.Vector3(start.x, start.y, start.z), new THREE.Vector3(end.x, end.y, end.z)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <mesh>
      {/*@ts-expect-error: TS2322*/}
      <line geometry={geometry}>
        <lineBasicMaterial attach="material" color="gray" />
      </line>
    </mesh>
  )
}

interface SDFViewerProps {
  compoundData: CompoundSDFDataResponse
}

export default function SDFViewer({ compoundData }: SDFViewerProps) {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

        {compoundData.atoms
          .filter((atom) => atom.point3d != null)
          .map((atom, index) => (
            <Atom3dMesh key={index} atom={atom} />
          ))}

        {compoundData.bonds
          .filter((bond) => bond.bond3DCenter != null)
          .map((bond, index) => (
            <BondMesh key={index} atoms={compoundData.atoms} bond={bond} />
          ))}
      </Canvas>
    </div>
  )
}
