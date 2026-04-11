# VideoToLottie

Convert alpha-channel MOV animations into Lottie JSON files. Frames are extracted as transparent PNGs, compressed to
WebP, and packed into a self-contained Lottie animation with all images embedded as base64.

## How it works

1. **Frame extraction** — ffmpeg splits the MOV into PNG frames, scales them to 512×512 while preserving aspect ratio,
   and pads with a transparent background.
2. **WebP conversion** — each PNG is compressed to WebP using `cwebp`, retaining full alpha quality.
3. **Lottie generation** — `index.js` reads the WebP frames, encodes them as base64, and assembles a valid Lottie JSON
   file where each frame is a timed image layer.

## Requirements

- [ffmpeg](https://ffmpeg.org/) — frame extraction
- [cwebp](https://developers.google.com/speed/webp) — PNG to WebP conversion (`brew install webp`)
- [Node.js](https://nodejs.org/) — Lottie JSON generation

## Usage

```bash
bash converter.sh input.mov [output.json]
```

| Argument      | Description                         | Default       |
|---------------|-------------------------------------|---------------|
| `input.mov`   | Path to your alpha-channel MOV file | required      |
| `output.json` | Path for the output Lottie JSON     | `output.json` |

**Example:**

```bash
bash converter.sh animation.mov my-lottie.json
```

## Output

A single `.json` file — a valid Lottie animation with all WebP frames embedded as base64. The file can be dropped
directly into any Lottie-compatible renderer (iOS, Android, Web via lottie-web, etc.).

## Configuration

You can tweak defaults at the top of `index.js`:

| Parameter   | Default | Description                                        |
|-------------|---------|----------------------------------------------------|
| `width`     | `512`   | Output frame width in px                           |
| `height`    | `512`   | Output frame height in px                          |
| `fps`       | `30`    | Playback frame rate                                |
| `maxFrames` | `149`   | Max frames to include (sampled evenly if exceeded) |

## Cleanup

A temporary working directory `tmp_<filename>/` is created during processing. To remove it automatically after
conversion, uncomment the last line in `converter.sh`:

```bash
# rm -rf "$WORKDIR"
```

## File structure

```
.
├── converter.sh   # Main pipeline script
├── index.js       # Lottie JSON generator
└── README.md
```
