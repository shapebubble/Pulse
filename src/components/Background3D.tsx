'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Background3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Particle system — neural network feel
    const particleCount = 120
    const positions = new Float32Array(particleCount * 3)
    const velocities: THREE.Vector3[] = []

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.004
      ))
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({ color: 0x6366f1, size: 0.08, transparent: true, opacity: 0.7 })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Connection lines between nearby particles
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.12 })
    const lineGroup = new THREE.Group()
    scene.add(lineGroup)

    camera.position.z = 8

    // Mouse tracking
    const mouse = new THREE.Vector2()
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let frame = 0
    const animate = () => {
      const id = requestAnimationFrame(animate)
      frame++

      const pos = particleGeo.attributes.position.array as Float32Array

      // Move particles
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3]     += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y
        pos[i * 3 + 2] += velocities[i].z
        if (Math.abs(pos[i * 3]) > 10)     velocities[i].x *= -1
        if (Math.abs(pos[i * 3 + 1]) > 10) velocities[i].y *= -1
        if (Math.abs(pos[i * 3 + 2]) > 5)  velocities[i].z *= -1
      }
      particleGeo.attributes.position.needsUpdate = true

      // Rebuild connection lines every 20 frames
      if (frame % 20 === 0) {
        lineGroup.clear()
        const threshold = 4
        for (let i = 0; i < particleCount; i++) {
          for (let j = i + 1; j < particleCount; j++) {
            const dx = pos[i*3] - pos[j*3]
            const dy = pos[i*3+1] - pos[j*3+1]
            const dz = pos[i*3+2] - pos[j*3+2]
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
            if (dist < threshold) {
              const geo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]),
                new THREE.Vector3(pos[j*3], pos[j*3+1], pos[j*3+2]),
              ])
              lineGroup.add(new THREE.Line(geo, lineMat))
            }
          }
        }
      }

      // Subtle camera drift towards mouse
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.03
      camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.03
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
      return id
    }

    const animId = animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="fixed inset-0 -z-10" />
}
