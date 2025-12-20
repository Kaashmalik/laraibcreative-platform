
const path = require('path');
const express = require('express');

console.log('--- Inspecting Router Stack ---');

try {
    // Try to require the routes index file directly
    const routesPath = path.join(__dirname, 'src', 'routes', 'index.js');
    console.log(`Loading routes from: ${routesPath}`);
    const router = require(routesPath);

    if (router.stack) {
        console.log('Routes loaded successfully. Dumping stack:');
        router.stack.forEach(layer => {
            if (layer.route) {
                console.log(`Route: ${layer.route.path} [${Object.keys(layer.route.methods).join(', ')}]`);
            } else if (layer.name === 'router') {
                // This is a mounted router
                // Regex usually looks like /^\/admin\/ai\/?(?=\/|$)/i
                console.log(`Mounted Router Info: name=${layer.name}, regexp=${layer.regexp}`);

                if (layer.handle && layer.handle.stack) {
                    console.log('  Sub-routes:');
                    layer.handle.stack.forEach(subLayer => {
                        if (subLayer.route) {
                            console.log(`    -> ${subLayer.route.path} [${Object.keys(subLayer.route.methods).join(', ')}]`);
                        }
                    });
                }
            } else {
                // console.log(`Layer: ${layer.name}`);
            }
        });
    } else {
        console.log('Router loaded but has no stack property.');
        console.log('Router keys:', Object.keys(router));
    }

} catch (error) {
    console.error('Failed to inspect routes:', error);
}
