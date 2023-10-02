import React from 'react';
import { useFrame } from '@react-three/fiber'
import { Texture } from 'three';

const canvasSize = 64
const maxAge = 60
let trail = []

const easeInOutSine = (time, startValue, changeInValue, duration) => {
	return changeInValue * (Math.cos(Math.PI * time / duration) - 1) / -2 + startValue;
}

const canvas = document.createElement('canvas')
canvas.width = canvasSize
canvas.height = canvasSize

const ctx = canvas.getContext('2d')
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvasSize, canvasSize)

export const texture = new Texture(canvas)

const Interactivity = ({ width, height}) => {
    const drawTouch = point => {
        const position = {
            x: point.x * canvasSize,
			y: (1 - point.y) * canvasSize
		}
        
        let intensity = 1
		if (point.age < maxAge * 0.3) intensity = easeInOutSine(point.age / (maxAge * 0.3), 0, 1, 1)
		else intensity = easeInOutSine(1 - (point.age - maxAge * 0.3) / (maxAge * 0.7), 0, 1, 1)

		intensity *= point.force

		const radius = canvasSize * 0.15 * intensity
		const gradient = ctx.createRadialGradient(position.x, position.y, radius * 0.25, position.x, position.y, radius)

		gradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`)
		gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)')

		ctx.beginPath()
		ctx.fillStyle = gradient
		ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
		ctx.fill()
	}

    const addTouch = point => {
		let force = 0
		const last = trail[ trail.length - 1 ]

		if (last) {
			const dx = last.x - point.x
			const dy = last.y - point.y
			const dd = dx * dx + dy * dy

			force = Math.min(dd * 10000, 1)
		}

		trail.push({ x: point.x, y: point.y, age: 0, force })
	}

    useFrame( () => {
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvasSize, canvasSize)

        trail.forEach( (point, index, array) => {
            point.age++

            if(point.age > maxAge) array.splice(index, 1)
            else drawTouch(point)
        })

        texture.needsUpdate = true
    })

    return(
		<mesh onPointerMove={ ({uv}) => addTouch(uv) }>
			<planeGeometry attach="geometry" args={[width, height]}/>
			<meshBasicMaterial attach="material" transparent={true} opacity={0.0}/>
		</mesh>
    )
}

export default Interactivity