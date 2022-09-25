var GUI = lil.GUI;
const gui = new GUI();
window.addEventListener('load', e => {
    const flowerFolder = gui.addFolder('Flower Config');
    flowerFolder.add(params, 'flowerCount', 1, 30, 1).onFinishChange(reCreateFlowers);
    flowerFolder.add(params, 'lines', 1, 6, 1).onFinishChange(reset);
    flowerFolder.add(params, 'stems', 1, 10, 1).onFinishChange(reset);
    flowerFolder.add(params, 'angleRange', 0.002, 0.018, 0.001).onFinishChange(reset);
    flowerFolder.add(params, 'depth', 0, 10, 0.1).onFinishChange(reset);
    flowerFolder.add(params, 'noiseSpeed', 0.000001, 0.0005, 0.000001).onFinishChange(reset);
    flowerFolder.add(params, 'iterations', 500, 8000, 1).onFinishChange(reset);
    flowerFolder.add(params, 'hue', 0, 360, 1).onFinishChange(reset);
    flowerFolder.add(params, 'hueVariance', 0, 120, 1).onFinishChange(reset);
    flowerFolder.add(params, 'hueRange', 0, 90, 1).onFinishChange(reset);
    //flowerFolder.add(params, 'lightness', 0, 100, 1).onFinishChange(reset);
    flowerFolder.add(params, 'invert').onFinishChange(reset);;
})

function reset() {
    generatorA.reset();
}

function reCreateFlowers() {
    generatorA.resetFlowers();
}

//flowers.close();