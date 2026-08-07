#include <string.h>
#include <ctype.h>
#include <stdbool.h>
#include <stdlib.h>

int contar_palabras(const char* texto) {
    if (texto == NULL) return 0;
    int count = 0;
    bool in_palabra = false;
    for (int i = 0; texto[i] != '\0'; i++) {
        char c = texto[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= 0xE1 && c <= 0xFA)) {
            if (!in_palabra) { in_palabra = true; count++; }
        } else { in_palabra = false; }
    }
    return count;
}

int contar_caracteres(const char* texto) {
    if (texto == NULL) return 0;
    int count = 0;
    for (int i = 0; texto[i] != '\0'; i++) {
        if (texto[i] != ' ' && texto[i] != '\n' && texto[i] != '\t') count++;
    }
    return count;
}

int contar_silabas(const char* texto) {
    if (texto == NULL) return 0;
    const char* vocales = "aeiouáéíóúAEIOUÁÉÍÓÚ";
    int count = 0;
    for (int i = 0; texto[i] != '\0'; i++) {
        if (strchr(vocales, texto[i])) count++;
    }
    return count;
}

int contar_oraciones(const char* texto) {
    if (texto == NULL) return 0;
    int count = 0;
    const char* puntuacion = ".!?";
    for (int i = 0; texto[i] != '\0'; i++) {
        if (strchr(puntuacion, texto[i])) count++;
    }
    return count;
}

float calcular_legibilidad(const char* texto) {
    if (texto == NULL) return 50.0;
    int palabras = contar_palabras(texto);
    int oraciones = contar_oraciones(texto);
    int silabas = contar_silabas(texto);
    if (oraciones == 0 || palabras == 0) return 50.0;
    float score = 206.835 - (1.015 * (palabras / (float)oraciones)) - (84.6 * (silabas / (float)palabras));
    if (score < 0) return 0;
    if (score > 100) return 100;
    return score;
}

int detectar_idioma(const char* texto) {
    if (texto == NULL) return 0;
    const char* es_palabras[] = {"el", "la", "los", "las", "un", "una", "y", "que", "es"};
    const char* en_palabras[] = {"the", "and", "for", "with", "from", "that", "have", "this"};
    const char* de_palabras[] = {"der", "die", "das", "und", "von", "mit", "auf", "bei"};
    int es_score = 0, en_score = 0, de_score = 0;
    const char* delimitadores = " .,;:!?\n\t";
    char* temp = strdup(texto);
    char* token = strtok(temp, delimitadores);
    while (token != NULL) {
        for (int i = 0; token[i]; i++) token[i] = tolower(token[i]);
        for (int i = 0; i < 9; i++) {
            if (i < 9 && strcmp(token, es_palabras[i]) == 0) es_score++;
            if (i < 8 && strcmp(token, en_palabras[i]) == 0) en_score++;
            if (i < 8 && strcmp(token, de_palabras[i]) == 0) de_score++;
        }
        token = strtok(NULL, delimitadores);
    }
    free(temp);
    if (es_score >= en_score && es_score >= de_score) return 0;
    if (en_score >= es_score && en_score >= de_score) return 1;
    return 2;
}

void extraer_keywords(const char* texto, char* resultado, int max_len) {
    if (texto == NULL || resultado == NULL) return;
    const char* delimitadores = " .,;:!?\n\t";
    char* temp = strdup(texto);
    char* token = strtok(temp, delimitadores);
    int count = 0;
    strcpy(resultado, "");
    while (token != NULL && count < 5) {
        if (strlen(token) > 3) {
            if (count > 0) strcat(resultado, ", ");
            strcat(resultado, token);
            count++;
        }
        token = strtok(NULL, delimitadores);
    }
    free(temp);
}

const char* get_version() {
    return "WASM Optimizer v1.0 - GitHub";
}
