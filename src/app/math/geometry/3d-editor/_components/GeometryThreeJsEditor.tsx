"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import WebGL from "three/addons/capabilities/WebGL.js"
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js"
import { plane, klein, mobius } from "three/addons/geometries/ParametricFunctions.js"
import GUI from "lil-gui"
import { useTranslation } from "../../../../../../node_modules/react-i18next"
import i18n from "@/config/i18n"
import Tooltip from "@mui/material/Tooltip"
import ThreeSceneCtx, { useThreeSceneCtx } from "@/lib/hooks/threeHooks"

class AxisGridHelper {
  private axes: THREE.AxesHelper
  private grid: THREE.GridHelper
  private _visible: boolean

  constructor(scene: THREE.Scene, units = 10) {
    const axes = new THREE.AxesHelper()
    axes.material.depthTest = false
    axes.renderOrder = 2 // after the grid
    scene.add(axes)

    const grid = new THREE.GridHelper(units, units)
    grid.material.depthTest = false
    grid.renderOrder = 1
    scene.add(grid)

    this.grid = grid
    this.axes = axes
    this._visible = false
  }

  get visible() {
    return this._visible
  }

  set visible(isVisible) {
    this._visible = isVisible
    this.grid.visible = isVisible
    this.axes.visible = isVisible
  }
}

class DegRadHelper {
  private readonly obj: Record<string, unknown>
  private readonly prop: string

  constructor(obj: unknown, prop: string) {
    this.obj = obj as Record<string, unknown>
    this.prop = prop
  }

  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop] as number)
  }

  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v)
  }
}

class StringToNumberHelper {
  private readonly obj: Record<string, unknown>
  private readonly prop: string

  constructor(obj: unknown, prop: string) {
    this.obj = obj as Record<string, unknown>
    this.prop = prop
  }

  get value() {
    return this.obj[this.prop]
  }

  set value(num) {
    this.obj[this.prop] = parseFloat(num as string)
  }
}

class ColorGUIHelper {
  private readonly obj: Record<string, unknown>
  private readonly prop: string

  constructor(obj: unknown, prop: string) {
    this.obj = obj as Record<string, unknown>
    this.prop = prop
  }

  get value() {
    // @ts-expect-error-error
    return `#${this.obj[this.prop].getHexString()}`
  }

  set value(hexString) {
    // @ts-expect-error-error
    this.obj[this.prop].set(hexString)
  }
}

function createGuiControls({ texture, light }: { texture: THREE.Texture; light: THREE.DirectionalLight }) {
  const wrapModes = {
    ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
    RepeatWrapping: THREE.RepeatWrapping,
    MirroredRepeatWrapping: THREE.MirroredRepeatWrapping,
  }

  function updateTexture() {
    texture.needsUpdate = true
  }

  const gui = new GUI()
  gui.add(new StringToNumberHelper(texture, "wrapS"), "value", wrapModes).name("texture.wrapS").onChange(updateTexture)
  gui.add(new StringToNumberHelper(texture, "wrapT"), "value", wrapModes).name("texture.wrapT").onChange(updateTexture)
  gui.add(texture.repeat, "x", 0, 5, 0.01).name("texture.repeat.x")
  gui.add(texture.repeat, "y", 0, 5, 0.01).name("texture.repeat.y")
  gui.add(texture.offset, "x", -2, 2, 0.01).name("texture.offset.x")
  gui.add(texture.offset, "y", -2, 2, 0.01).name("texture.offset.y")
  gui.add(texture.center, "x", -0.5, 1.5, 0.01).name("texture.center.x")
  gui.add(texture.center, "y", -0.5, 1.5, 0.01).name("texture.center.y")
  gui.add(new DegRadHelper(texture, "rotation"), "value", -360, 360).name("texture.rotation")

  gui.addColor(new ColorGUIHelper(light, "color"), "value").name("skyColor")
  gui.add(light, "intensity", 0, 5, 0.01)
  gui.add(light.target.position, "x", -10, 10)
  gui.add(light.target.position, "z", -10, 10)
  gui.add(light.target.position, "y", 0, 10)
  return gui
}

function createDirectionalLight() {
  const color = 0xffffff
  const intensity = 1
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(0, 10, 0)
  light.target.position.set(-5, 0, 0)
  return light
}

function makeXYZGUI(
  gui: GUI,
  vector3: THREE.Vector3,
  name: string,
  onChangeFn: (helper: THREE.DirectionalLightHelper) => void,
) {
  const folder = gui.addFolder(name)
  folder.add(vector3, "x", -10, 10).onChange(onChangeFn)
  folder.add(vector3, "y", 0, 10).onChange(onChangeFn)
  folder.add(vector3, "z", -10, 10).onChange(onChangeFn)
  folder.open()
}

interface GeometryThreeJsEditorProps {
  translations: Record<string, string | Record<string, string>>
}

export default function GeometryThreeJsEditor({ translations }: GeometryThreeJsEditorProps) {
  useEffect(() => {
    i18n.addResourceBundle("en", "translation", translations, true, true)
  }, [translations])

  const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null)

  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { current: currentDivRef } = divRef
    if (!currentDivRef) {
      return
    }

    if (threeScene !== null) {
      return
    }
    const scene = new THREE.Scene()
    setThreeScene(scene)
    new AxisGridHelper(scene).visible = true

    const fov = 40
    const aspect = 2 // the canvas default
    const near = 0.1
    const far = 90
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 10, 20)
    camera.up.set(0, 0, 1)
    camera.lookAt(0, 0, 0)
    camera.aspect = currentDivRef.clientWidth / currentDivRef.clientHeight
    camera.updateProjectionMatrix()

    const controls = new OrbitControls(camera, currentDivRef)
    controls.target.set(0, 5, 0)
    controls.update()

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const loadManager = new THREE.LoadingManager()
    const loader = new THREE.TextureLoader(loadManager)

    const planeSize = 40
    const texture = loader.load("/images/checker.png")
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    const repeats = planeSize / 2
    texture.repeat.set(repeats, repeats)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ map: texture })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    currentDivRef.appendChild(renderer.domElement)

    function animate() {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

      renderer.render(scene, camera)
    }

    if (WebGL.isWebGL2Available()) {
      renderer.setAnimationLoop(animate)
    } else {
      const warning = WebGL.getWebGL2ErrorMessage()
      currentDivRef.appendChild(warning)
    }

    const light = createDirectionalLight()
    scene.add(light)
    scene.add(light.target)

    function updateLight(helper: THREE.DirectionalLightHelper) {
      light.target.updateMatrixWorld()
      helper.update()
    }

    const helper = new THREE.DirectionalLightHelper(light)
    scene.add(helper)
    updateLight(helper)

    const gui = createGuiControls({ texture, light })
    makeXYZGUI(gui, light.position, "position", updateLight)
    makeXYZGUI(gui, light.target.position, "target", updateLight)

    return () => {
      // setThreeScene(null)
      // const {current} = divRef
      // if (current) {
      //   current.removeChild(renderer.domElement)
      // }
    }
  }, [threeScene])

  return (
    <ThreeSceneCtx value={threeScene}>
      <div id="geometry-threejs-editor" className="grid grid-cols-[12%_88%] grid-rows-1 gap-4">
        <ToolPanel />
        <div ref={divRef} style={{ width: "100vw", height: "100vh" }} />
      </div>
    </ThreeSceneCtx>
  )
}

function ToolPanel() {
  const { t } = useTranslation()

  const scene = useThreeSceneCtx()

  function handleDrawCubeClick() {
    if (!scene) {
      return
    }

    const cubeSize = 4
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
    const material = new THREE.MeshPhongMaterial({ color: "#8AC" })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0)
    scene.add(mesh)
  }

  function handleDrawSphereClick() {
    if (!scene) {
      return
    }

    const radius = 3
    const width = 32
    const height = 16
    const geometry = new THREE.SphereGeometry(radius, width, height)
    const material = new THREE.MeshPhongMaterial({ color: "#CA8" })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(-radius - 1, radius + 2, 0)
    scene.add(mesh)
  }

  function handleDrawIcosahedronClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(2), material)
    mesh.position.set(0, 10, 10)
    scene.add(mesh)
  }

  function handleDrawOctahedronClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(2), material)
    mesh.position.set(10, 10, 0)
    scene.add(mesh)
  }

  function handleDrawTetrahedronClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(2), material)
    mesh.position.set(11, 11, 0)
    scene.add(mesh)
  }

  function handleDrawPlaneClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6, 4, 4), material)
    mesh.position.set(12, 12, 0)
    scene.add(mesh)
  }

  function handleDrawCircleClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(2, 10, 2, 2), material)
    mesh.position.set(13, 13, 0)
    scene.add(mesh)
  }

  function handleDrawRingClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.RingGeometry(2, 6, 20, 5, 0, Math.PI * 2), material)
    mesh.position.set(14, 14, 0)
    scene.add(mesh)
  }

  function handleDrawCylinderClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 6, 20, 5), material)
    mesh.position.set(15, 15, 0)
    scene.add(mesh)
  }

  function handleDrawLatheClick() {
    if (!scene) {
      return
    }

    const points = []
    for (let i = 0; i < 10; i++) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 5, (i - 5) * 2))
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, 6), material)
    mesh.position.set(16, 16, 0)
    scene.add(mesh)
  }

  function handleDrawTorusClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(2, 5, 4, 4), material)
    mesh.position.set(17, 17, 0)
    scene.add(mesh)
  }

  function handleDrawTorusKnotClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(2, 5, 4, 4), material)
    mesh.position.set(18, 18, 0)
    scene.add(mesh)
  }

  function handleDrawCapsuleClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(2, 6), material)
    mesh.position.set(19, 19, 0)
    scene.add(mesh)
  }

  function handleDrawPlaneParametricGeometryClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const planeParamGeometry = new ParametricGeometry(plane, 10, 10)
    planeParamGeometry.scale(5, 5, 5)
    planeParamGeometry.center()
    const mesh = new THREE.Mesh(planeParamGeometry, material)
    mesh.position.set(10, 0, 0)
    scene.add(mesh)
  }

  function handleDrawKleinParametricGeometryClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const paramGeometry = new ParametricGeometry(klein, 10, 10)
    const mesh = new THREE.Mesh(paramGeometry, material)
    mesh.position.set(11, 0, 0)
    mesh.scale.multiplyScalar(0.5)
    scene.add(mesh)
  }

  function handleDrawMobiusParametricGeometryClick() {
    if (!scene) {
      return
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const paramGeometry = new ParametricGeometry(mobius, 10, 10)
    const mesh = new THREE.Mesh(paramGeometry, material)
    mesh.position.set(12, 0, 0)
    mesh.scale.multiplyScalar(2)
    scene.add(mesh)
  }

  function handleAddAmbientLightClick() {
    if (!scene) {
      return
    }

    const ambientLightColor = 0xffffff
    const ambientLightIntensity = 1
    const light = new THREE.AmbientLight(ambientLightColor, ambientLightIntensity)
    scene.add(light)
  }

  function handleAddHemisphereLightClick() {
    if (!scene) {
      return
    }

    const skyColor = 0xb1e1ff // light blue
    const groundColor = 0xb97a20 // brownish orange
    const intensity = 3
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)
  }

  return (
    <div id="geometry-threejs-editor-tool-panel" className="grid grid-cols-1 grid-rows-3">
      <div>
        <span>{t("geometry3DEditorPage.primitives")}</span>
      </div>
      <Tooltip title="Cube" placement="bottom-end">
        <button onClick={handleDrawCubeClick}>
          <i>Cube</i>
        </button>
      </Tooltip>
      <Tooltip title="Sphere" placement="bottom-end">
        <button onClick={handleDrawSphereClick}>
          <i>Sphere</i>
        </button>
      </Tooltip>
      <Tooltip title="Icosahedron" placement="bottom-end">
        <button onClick={handleDrawIcosahedronClick}>
          <i>Icosahedron</i>
        </button>
      </Tooltip>
      <Tooltip title="Octahedron" placement="bottom-end">
        <button onClick={handleDrawOctahedronClick}>
          <i>Octahedron</i>
        </button>
      </Tooltip>
      <Tooltip title="Tetrahedron" placement="bottom-end">
        <button onClick={handleDrawTetrahedronClick}>
          <i>Tetrahedron</i>
        </button>
      </Tooltip>
      <Tooltip title="Plane" placement="bottom-end">
        <button onClick={handleDrawPlaneClick}>
          <i>Plane</i>
        </button>
      </Tooltip>
      <Tooltip title="Circle" placement="bottom-end">
        <button onClick={handleDrawCircleClick}>
          <i>Circle</i>
        </button>
      </Tooltip>
      <Tooltip title="Ring" placement="bottom-end">
        <button onClick={handleDrawRingClick}>
          <i>Ring</i>
        </button>
      </Tooltip>
      <Tooltip title="Cylinder" placement="bottom-end">
        <button onClick={handleDrawCylinderClick}>
          <i>Cylinder</i>
        </button>
      </Tooltip>
      <Tooltip title="Lathe" placement="bottom-end">
        <button onClick={handleDrawLatheClick}>
          <i>Lathe</i>
        </button>
      </Tooltip>
      <Tooltip title="Torus" placement="bottom-end">
        <button onClick={handleDrawTorusClick}>
          <i>Torus</i>
        </button>
      </Tooltip>
      <Tooltip title="Torus knot" placement="bottom-end">
        <button onClick={handleDrawTorusKnotClick}>
          <i>Torus knot</i>
        </button>
      </Tooltip>
      <Tooltip title="Capsule" placement="bottom-end">
        <button onClick={handleDrawCapsuleClick}>
          <i>Capsule</i>
        </button>
      </Tooltip>
      <Tooltip title="Plane Parametric Geometry" placement="bottom-end">
        <button onClick={handleDrawPlaneParametricGeometryClick}>
          <i>Plane PGeo</i>
        </button>
      </Tooltip>
      <Tooltip title="Klein Parametric Geometry" placement="bottom-end">
        <button onClick={handleDrawKleinParametricGeometryClick}>
          <i>Klein PGeo</i>
        </button>
      </Tooltip>
      <Tooltip title="Mobius Parametric Geometry" placement="bottom-end">
        <button onClick={handleDrawMobiusParametricGeometryClick}>
          <i>Mobius PGeo</i>
        </button>
      </Tooltip>
      <div>
        <span>{t("geometry3DEditorPage.lights")}</span>
      </div>
      <Tooltip title="Ambient" placement="bottom-end">
        <button onClick={handleAddAmbientLightClick}>
          <i>Ambient</i>
        </button>
      </Tooltip>
      <Tooltip title="Hemisphere" placement="bottom-end">
        <button onClick={handleAddHemisphereLightClick}>
          <i>Hemisphere</i>
        </button>
      </Tooltip>
    </div>
  )
}
