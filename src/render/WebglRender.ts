import { WebGlCtx } from "../views/WeglCtx";
import { State } from "../State";
import * as webglUtils from 'webgl-utils.js';

import vertexShader from "../glsl/vertex.vert";
import fragmentShader from "../glsl/fragment.frag";
import type { Layer } from "../views/Layer";
import { injectable } from "inversify";
import { container } from "../inversify.config";

type IGlTexture = {
    location: WebGLUniformLocation;
    canvas: HTMLCanvasElement | HTMLImageElement;
    texture: WebGLTexture;
}

@injectable()
export class WebglRender {

    private gl = container.get(WebGlCtx).gl!;
    private state = container.get(State);

    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;
    private texcoordBuffer: WebGLBuffer;
    private textures = new Set<IGlTexture>();
    private layers: Layer[] = [];

    add(layer: Layer) {
        this.layers.push(layer);
    }

    prepare() {
        this.program = webglUtils.createProgramFromSources(this.gl, [vertexShader, fragmentShader]);// Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.program);

        // Create a buffer to put three 2d clip space points in
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.bindArrayBuffer("a_position", this.positionBuffer);
        this.setRectangle(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // provide texture coordinates for the rectangle.
        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.bindArrayBuffer("a_texCoord", this.texcoordBuffer);
        this.setRectangle(0, 0, 1, 1);

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.colorMask(true, true, true, true);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        // Create a texture.
        this.layers.forEach(layer => {
            const texture = layer.ctx.canvas;

            this.addTexture(layer.shaderTextureName, texture);
            this.setVecValue(`${layer.shaderTextureName}_resolution`, 2, texture.width, texture.height);
        });

        // set the resolution
        this.setVecValue('u_resolution', 2, this.gl.canvas.width, this.gl.canvas.height);
        // set the size of the image
        [...this.textures].forEach(({ location, texture, canvas }, index) => {
            this.setVecValue('u_textureSize', 2, canvas.width, canvas.height);
            this.gl.uniform1i(location, index);
        });
    }

    draw() {
        if (!this.gl) {
            return;
        }

        this.setVecValue('u_scroll', 2, this.state.scrollLeft, this.state.scrollTop);

        this.setVecValue('u_showBombs', 1, Number(this.state.isLost));
        // this.setVecValue('u_effectsSize', 1, this.state.effects.size);
        this.setVecValue('u_time', 1, performance.now());

        [...this.textures].forEach(({ location, texture, canvas }, index) => {
            this.gl.activeTexture(this.gl[`TEXTURE${index}`]);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        });

        this.drawRectangle();
    }

    private setVecValue(name: string, size: number, ...value: number[]) {
        const method = ['uniform1f', 'uniform2f', 'uniform3f', 'uniform4f'][size - 1];

        const location = this.gl.getUniformLocation(this.program, name);

        this.gl[method](location, ...value);
    }

    private setRectangle(x: number, y: number, width: number, height: number) {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), this.gl.STATIC_DRAW);
    }

    private drawRectangle() {
        // Draw the rectangle.
        const primitiveType = this.gl.TRIANGLES;
        const offset = 0;
        const count = 6;

        this.gl.drawArrays(primitiveType, offset, count);
    }

    private bindArrayBuffer(attribute: string, buffer: WebGLBuffer) {
        const attributeLocation = this.gl.getAttribLocation(this.program, attribute);
        // Turn on the teccord attribute
        this.gl.enableVertexAttribArray(attributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 2;          // 2 components per iteration
        const type = this.gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer

        this.gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset)
    }

    private addTexture(name: string, canvas: HTMLCanvasElement | HTMLImageElement) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        this.textures.add({
            location: this.gl.getUniformLocation(this.program, name),
            canvas,
            texture
        })
    }
}