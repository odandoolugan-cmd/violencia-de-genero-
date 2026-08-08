// ============================================
// SCRIPT.JS - Versión SIN WebAssembly
// Funciona perfectamente con JavaScript puro
// ============================================

class AnalizadorTexto {
    constructor() {
        this.ready = true;
        console.log('✅ Analizador listo (JavaScript)');
    }

    // Contar palabras
    contarPalabras(texto) {
        if (!texto) return 0;
        return (texto.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+/g) || []).length;
    }

    // Contar caracteres (sin espacios)
    contarCaracteres(texto) {
        if (!texto) return 0;
        return texto.replace(/\s/g, '').length;
    }

    // Contar sílabas (vocales)
    contarSilabas(texto) {
        if (!texto) return 0;
        return (texto.match(/[aeiouáéíóú]+/gi) || []).length;
    }

    // Contar oraciones
    contarOraciones(texto) {
        if (!texto) return 0;
        return (texto.match(/[.!?]+/g) || []).length;
    }

    // Calcular legibilidad (Flesch-Kincaid)
    calcularLegibilidad(texto) {
        if (!texto) return 50;
        const palabras = this.contarPalabras(texto);
        const oraciones = this.contarOraciones(texto);
        const silabas = this.contarSilabas(texto);
        
        if (oraciones === 0 || palabras === 0) return 50;
        
        const score = 206.835 - (1.015 * (palabras / oraciones)) - (84.6 * (silabas / palabras));
        return Math.max(0, Math.min(100, score));
    }

    // Detectar idioma
    detectarIdioma(texto) {
        if (!texto) return 0;
        const lower = texto.toLowerCase();
        const es = ['el','la','los','las','un','una','y','que','es','en','por','para','con','como','más','pero','sus','sobre','está','tiene','puede'];
        const en = ['the','and','for','with','from','that','have','this','are','was','were','been'];
        
        let esScore = 0, enScore = 0;
        es.forEach(p => { if (lower.includes(p)) esScore++; });
        en.forEach(p => { if (lower.includes(p)) enScore++; });
        
        if (esScore >= enScore) return 0; // Español
        return 1; // Inglés
    }

    // Extraer keywords
    extraerKeywords(texto) {
        if (!texto) return '';
        const palabras = texto.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{3,}/g) || [];
        const frecuencias = {};
        palabras.forEach(p => {
            const palabra = p.toLowerCase();
            frecuencias[palabra] = (frecuencias[palabra] || 0) + 1;
        });
        
        const ordenadas = Object.entries(frecuencias)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([palabra]) => palabra);
        
        return ordenadas.join(', ');
    }

    getVersion() {
        return 'JavaScript v2.0';
    }
}

const analizador = new AnalizadorTexto();

function analizarTexto() {
    const texto = document.getElementById('textInput').value;
    if (!texto || texto.trim().length === 0) {
        alert('⚠️ Escribe un texto para analizar');
        return;
    }

    try {
        document.getElementById('rPalabras').textContent = analizador.contarPalabras(texto);
        document.getElementById('rCaracteres').textContent = analizador.contarCaracteres(texto);
        document.getElementById('rOraciones').textContent = analizador.contarOraciones(texto);
        document.getElementById('rSilabas').textContent = analizador.contarSilabas(texto);
        
        const leg = analizador.calcularLegibilidad(texto);
        document.getElementById('rLegibilidad').textContent = leg.toFixed(1);
        
        const idiomas = ['🇪🇸 Español', '🇬🇧 Inglés', '🇩🇪 Alemán'];
        const idioma = analizador.detectarIdioma(texto);
        document.getElementById('rIdioma').textContent = idiomas[idioma] || '❓';
        
        const keywords = analizador.extraerKeywords(texto);
        document.getElementById('rKeywords').textContent = keywords || 'No se encontraron keywords';
        
        document.getElementById('wasmStatus').textContent = '✅ Activo (JS)';
        document.getElementById('wasmStatus').style.color = '#10b981';
        document.getElementById('wasmVersion').textContent = analizador.getVersion();
        document.getElementById('wasmLocation').textContent = 'JavaScript ⚡';
        
        console.log('✅ Análisis completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error: ' + error.message);
    }
}

function recargar() {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '⏳ Recargando...';
    
    document.getElementById('wasmStatus').textContent = '⏳ Recargando...';
    document.getElementById('wasmStatus').style.color = '#f59e0b';
    
    setTimeout(() => {
        document.getElementById('wasmStatus').textContent = '✅ Activo (JS)';
        document.getElementById('wasmStatus').style.color = '#10b981';
        document.getElementById('wasmVersion').textContent = analizador.getVersion();
        btn.disabled = false;
        btn.textContent = '🔄 Recargar';
        analizarTexto();
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página lista (sin WASM)');
    
    document.getElementById('wasmStatus').textContent = '✅ Activo (JS)';
    document.getElementById('wasmStatus').style.color = '#10b981';
    document.getElementById('wasmVersion').textContent = 'JS v2.0';
    document.getElementById('wasmLocation').textContent = 'JavaScript ⚡';
    
    setTimeout(analizarTexto, 500);
});
