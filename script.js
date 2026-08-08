// Variable global para guardar el módulo Wasm una vez cargado
let wasmInstance = null;

// 1. Función para cargar y compilar el archivo .wasm (esto se hace UNA sola vez)
async function cargarWasm() {
    try {
        // Busca el archivo en la carpeta src. Asegúrate de que el nombre coincida.
        const response = await fetch('src/contador.wasm');
        const buffer = await response.arrayBuffer();
        
        // Compila e instancia el módulo
        const module = await WebAssembly.compile(buffer);
        wasmInstance = new WebAssembly.Instance(module, {});
        
        console.log("¡Módulo WebAssembly cargado y compilado correctamente!");
        return true;
    } catch (error) {
        console.error("Error al cargar el WebAssembly:", error);
        return false;
    }
}

// 2. Función que usa el Wasm para contar las palabras (desde el HTML)
function contarPalabras(texto) {
    if (!wasmInstance) {
        console.error("El WebAssembly aún no se ha cargado.");
        return 0;
    }

    // Obtenemos las funciones exportadas del Wasm
    const { contar, memory } = wasmInstance.exports;

    // Codificamos el texto a bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(texto);

    // Escribimos el texto en la memoria del Wasm (en la posición 0)
    const view = new Uint8Array(memory.buffer);
    view.set(bytes, 0);
    view[bytes.length] = 0; // Añadimos el 0 final para indicar fin de cadena

    // Llamamos a la función WAT y devolvemos el resultado (+1 para que cuente la última palabra)
    return contar(0, 0) + 1;
}

// 3. Iniciar la carga en cuanto la página se abra
window.onload = function() {
    cargarWasm();
};
