# WebGPU: The Secret Weapon for Video Processing in the Browser

> **TL;DR:** Video processing on the CPU breaks down at scale. WebGPU changes everything — decode in the browser, hand each frame to the GPU, keep the expensive work on the GPU. The result: a local-first video processing lab with real-time effects, analysis, and GPU-backed optical flow.

Video processing on the CPU is the naive path. It works for small demos, short clips, and a couple of toy filters. It falls apart when the frame size goes up, the frame rate stays high, and every effect wants to touch every pixel.

A single 4K frame has more than 8 million pixels. At 60 frames per second, the system is looking at almost 500 million pixels per second before blur, color correction, transforms, scopes, motion analysis, or export enter the picture. That is too much per-pixel work to treat JavaScript on the CPU as the main processing engine. Video processing is mostly the same operation repeated across millions of pixels. That is GPU work.

## Why CPU-first video processing breaks down

The simplest browser video processing pipeline usually looks something like this: decode → pull to CPU → process in JavaScript → render. That approach is easy to understand. It is also the wrong shape for serious video work.

The CPU is good at control flow, application logic, scheduling, parsing, and all the messy work around the edges. It is not where you want to run millions of identical pixel operations every frame, especially from JavaScript. A GPU is built for that: thousands of small operations running in parallel over images, buffers, and textures.

The copies make the naive design even worse. Every time a full frame is pulled into JavaScript-visible memory, the browser has to move a large chunk of data across a boundary that should stay quiet during playback. Do that once and nobody cares. Do that every frame, then add multiple effects, and the pipeline starts wasting time on traffic instead of image processing.

**The rule is simple: keep the hot path GPU-first. Use the CPU to decide what should happen. Use the GPU to do it.**

## The project pipeline

The demo project uses WebCodecs and WebGPU together. WebCodecs gives the app decoded `VideoFrame` objects. WebGPU turns those frames into GPU input with `GPUDevice.importExternalTexture({ source: videoFrame })`.

From there, the frame is normalized into an internal `rgba8unorm` texture. That internal texture becomes the stable input for transforms, effects, analysis passes, and the final preview.

**The important part is what is missing from that diagram:** there is no `getImageData()`, no `readPixels()`, and no full-frame CPU readback on the main preview path.

That matters because reading data back from the GPU is not a cheap convenience API. It can force synchronization between the CPU and GPU, and it moves data in the wrong direction for a real-time preview. If the architecture needs data on the CPU, it should ask for the smallest result it can use, not the whole frame.

This project follows that rule. Effects stay in textures. Scopes render through GPU pipelines. Optical flow does the expensive motion work in compute shaders and reads back compact statistics, not a video frame.

## WebGPU as the pixel engine

Most modern devices already have a GPU. Even thin laptops and phones usually ship with integrated GPUs that sit close to the rest of the system and are built to process images quickly. WebGPU gives browser applications a direct, modern way to use that hardware.

For video processing, this changes the shape of the application:

- **CPU still runs the app** — handles UI controls, file selection, frame scheduling, uniforms, and small analysis results
- **GPU does the frame work** — sampling textures, transforming pixels, chaining effects, drawing previews, and running compute passes

That split is the difference between "JavaScript edits video" and "JavaScript orchestrates a GPU video pipeline." The second version is the one that scales.

## Importing frames without a CPU bitmap step

The bridge is `importExternalTexture`. Each frame arrives as a `VideoFrame`. The app imports it as a `GPUExternalTexture`, starts a command encoder, then runs the frame through the GPU pipeline.

The first pass copies the external texture into the project-owned work texture. That extra copy is a GPU texture-to-texture step, not a trip through a JavaScript bitmap. It is intentional. External textures are great as an entry point, but downstream passes are easier to compose when every stage samples a regular `texture_2d<f32>`.

Once the frame is in that internal texture, the pipeline can treat it like any other GPU image.

## Effects as shader passes

The project implements effects as WGSL fragment shaders. The registry includes color effects such as hue shift, brightness, contrast, saturation, levels, and invert. It also includes heavier image effects such as pixelate, kaleidoscope, mirror, RGB split, and box blur.

A simplified shader pass:

```wgsl
@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var videoTex: texture_2d<f32>;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(videoTex, samp, in.uv);
  return vec4f(color.rgb, color.a);
}
```

Real effects add uniforms and more math. A blur pass samples neighboring pixels. A levels pass remaps black, white, and gamma. A kaleidoscope pass bends UV coordinates before sampling. The pattern is the same: sample the input texture, compute a new pixel value, and write to a render target.

## Ping-pong textures for heavy chains

GPU render passes cannot safely read from and write to the same texture in the same pass. The project uses a ping-pong pair to chain effects, swapping input and output views after each enabled effect.

That small pattern makes the effect chain flexible. One effect, five effects, no effects: the output is still just a GPU texture view that can be handed to the next stage.

## Analysis belongs on the GPU too

The project is not limited to visual filters. It also computes analysis views:

- **Histogram** — inspects many pixels across the frame
- **Waveform** — maps image intensity into a visual distribution
- **Vectorscope** — color analysis in the broadcast industry standard
- **Optical flow** — compares frames and estimates motion

These are also image-wide operations. None of that wants a full-frame CPU copy in the hot path.

The optical flow pipeline uses compute shaders for grayscale conversion, pyramid downsampling, spatial gradients, temporal gradients, Lucas-Kanade flow, and final statistics. The CPU receives compact data — motion totals, global motion, local motion, and scene-cut hints — not full frames.

## Try it yourself

You can try the demo at [apssouza22.github.io/webgpu-video-processing](https://apssouza22.github.io/webgpu-video-processing) and explore the source code on [GitHub](https://github.com/apssouza22/webgpu-video-processing).

The project demonstrates that serious video processing in the browser is not just possible — it is practical, performant, and opens up possibilities that were previously limited to native applications.

---

*Source: codcompass.com | Original article analyzed and republished with permission*
