#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// -----------------------------
// Config (CLI support)
// -----------------------------
const args = process.argv.slice(2);

const CONFIG = {
    framesDir: args[0] || "./webp",
    output: args[1] || "animation.json",
    width: Number(args[2]) || 512,
    height: Number(args[3]) || 512,
    fps: Number(args[4]) || 30,
    maxFrames: Number(args[5]) || 149,
};

// -----------------------------
// Helpers
// -----------------------------
const getFrameFiles = (dir) => {
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".webp"))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

const sampleFrames = (files, maxFrames) => {
    const total = files.length;
    const target = Math.min(maxFrames, total);

    return Array.from({ length: target }, (_, i) => {
        const index = Math.floor((i / target) * total);
        return files[index];
    });
};

const encodeBase64 = (filePath) => {
    return fs.readFileSync(filePath).toString("base64");
};

// -----------------------------
// Builders
// -----------------------------
const createAsset = (id, base64, width, height) => ({
    id,
    w: width,
    h: height,
    u: "",
    p: `data:image/webp;base64,${base64}`,
    e: 1,
});

const createLayer = (index, fileName, refId, width, height) => ({
    ddd: 0,
    ind: index + 1,
    ty: 2,
    nm: fileName,
    refId,
    sr: 1,
    ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [width / 2, height / 2, 0] },
        a: { a: 0, k: [width / 2, height / 2, 0] },
        s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: index,
    op: index + 1,
    st: index,
});

const buildLottie = (assets, layers, config, totalFrames) => ({
    v: "5.7.4",
    fr: config.fps,
    ip: 0,
    op: totalFrames,
    w: config.width,
    h: config.height,
    nm: "WebP Sequence Animation",
    ddd: 0,
    assets,
    layers,
});

// -----------------------------
// Main
// -----------------------------
const main = () => {
    console.log("🚀 Starting Lottie generation...\n");

    const allFiles = getFrameFiles(CONFIG.framesDir);

    if (!allFiles.length) {
        console.error("❌ No .webp files found");
        process.exit(1);
    }

    console.log(`📦 Found ${allFiles.length} frames`);

    const selectedFiles = sampleFrames(allFiles, CONFIG.maxFrames);

    console.log(`🎯 Using ${selectedFiles.length} frames`);

    const assets = [];
    const layers = [];

    selectedFiles.forEach((file, i) => {
        const filePath = path.join(CONFIG.framesDir, file);

        const base64 = encodeBase64(filePath);
        const id = `img_${i}`;

        assets.push(createAsset(id, base64, CONFIG.width, CONFIG.height));
        layers.push(createLayer(i, file, id, CONFIG.width, CONFIG.height));
    });

    const lottie = buildLottie(
        assets,
        layers,
        CONFIG,
        selectedFiles.length
    );

    fs.writeFileSync(CONFIG.output, JSON.stringify(lottie));

    console.log(`\n✅ Done: ${CONFIG.output}`);
};

main();
