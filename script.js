// ============================================
// SCRIPT.JS - CON WEBASSEMBLY
// ============================================

class WASMLoader {
    constructor() {
        this.wasm = null;
        this.ready = false;
    }

    async cargar() {
        try {
            console.log('⚡ Cargando WebAssembly...');
            const response = await fetch('src/optimizer.wasm');
            if (!response.ok) throw new Error('No se pudo cargar el WASM');
            
            const bytes = await response.arrayBuffer();
            const { instance } = await WebAssembly.instantiate(bytes);
            
            this.wasm = instance.exports;
            this.ready = true;
            
            console.log('✅ WASM cargado correctamente');
            console.log('📊 Funciones:', Object.keys(this.wasm));
            return true;
            
        } catch (error) {
            console.error('❌ Error cargando WASM:', error);
            this.ready = false;
            return false;
        }
    }

    // Función para contar caracteres (sin espacios, saltos de línea)
    contarCaracteres(texto) {
        if (!this.ready) return 0;
        
        // Codificar el texto a bytes
        const encoder = new TextEncoder();
        const bytes = encoder.encode(texto + '\0'); // null-terminated
        
        // Copiar a la memoria WASM (en la dirección 0)
        const view = new Uint8Array(this.wasm.memory.buffer);
        view.set(bytes, 0);
        
        // Llamar a la función WASM
        return this.wasm.contar(0);
    }

    getVersion() {
        return this.ready ? `WASM v${this.wasm.version()}` : 'No cargado';
    }
}

const wasmLoader = new WASMLoader();

// ============================================
// FUNCIONES DE ANÁLISIS (MEZCLA JS + WASM)
// ============================================
function analizarTexto() {
    const texto = document.getElementById('textInput').value;
    if (!texto || texto.trim().length === 0) {
        alert('⚠️ Escribe un texto para analizar');
        return;
    }

    try {
        // Usar WASM para contar caracteres (sin espacios, saltos)
        const caracteres = wasmLoader.contarCaracteres(texto);
        
        // Funciones en JavaScript para el resto
        const palabras = (texto.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+/g) || []).length;
        const oraciones = (texto.match(/[.!?]+/g) || []).length;
        const silabas = (texto.match(/[aeiouáéíóú]+/gi) || []).length;
        
        document.getElementById('rPalabras').textContent = palabras;
        document.getElementById('rCaracteres').textContent = caracteres; // ← Usa WASM
        document.getElementById('rOraciones').textContent = oraciones;
        document.getElementById('rSilabas').textContent = silabas;
        
        // Legibilidad (JS)
        const leg = 206.835 - (1.015 * (palabras / oraciones)) - (84.6 * (silabas / palabras));
        document.getElementById('rLegibilidad').textContent = Math.max(0, Math.min(100, leg)).toFixed(1);
        
        // Idioma (JS)
        const lower = texto.toLowerCase();
        const es = ['el','la','los','las','un','una','y','que','es','en','por','para'];
        const en = ['the','and','for','with','from','that','have','this'];
        let esScore = 0, enScore = 0;
        es.forEach(p => { if (lower.includes(p)) esScore++; });
        en.forEach(p => { if (lower.includes(p)) enScore++; });
        const idioma = esScore >= enScore ? 0 : 1;
        const idiomas = ['🇪🇸 Español', '🇬🇧 Inglés'];
        document.getElementById('rIdioma').textContent = idiomas[idioma] || '❓';
        
        // Keywords (JS)
        const keywords = (texto.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{3,}/g) || [])
            .slice(0, 5)
            .join(', ');
        document.getElementById('rKeywords').textContent = keywords || 'No se encontraron keywords';
        
        // Estado
        document.getElementById('wasmStatus').textContent = '✅ Activo (WASM)';
        document.getElementById('wasmStatus').style.color = '#10b981';
        document.getElementById('wasmVersion').textContent = wasmLoader.getVersion();
        document.getElementById('wasmLocation').textContent = 'WebAssembly ⚡';
        
        console.log('✅ Análisis con WASM completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// INICIALIZAR
// ============================================
async function iniciar() {
    document.getElementById('wasmStatus').textContent = '⏳ Cargando...';
    document.getElementById('wasmStatus').style.color = '#f59e0b';
    
    const ok = await wasmLoader.cargar();
    
    if (ok) {
        document.getElementById('wasmStatus').textContent = '✅ Activo (WASM)';
        document.getElementById('wasmStatus').style.color = '#10b981';
        document.getElementById('wasmVersion').textContent = wasmLoader.getVersion();
        document.getElementById('wasmLocation').textContent = 'WebAssembly ⚡';
        setTimeout(analizarTexto, 300);
    } else {
        document.getElementById('wasmStatus').textContent = '⚠️ JS Fallback';
        document.getElementById('wasmStatus').style.color = '#f59e0b';
        document.getElementById('wasmVersion').textContent = 'Fallback JS';
        document.getElementById('wasmLocation').textContent = 'JavaScript ⚡';
    }
}

document.addEventListener('DOMContentLoaded', iniciar);
