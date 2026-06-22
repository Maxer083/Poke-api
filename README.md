# Pokedex Virtual

Proyecto web estatico que implementa una Pokedex interactiva usando la API publica de Pokemon. La aplicacion permite buscar Pokemon, ver su sprite, tipos, estadisticas, descripcion, debilidades, fortalezas ofensivas, formas alternativas, cadena evolutiva, version shiny y grito oficial cuando la API lo provee.

## Objetivo del proyecto

La idea principal es recrear una Pokedex con estetica retro de consola, ocupando la pantalla completa y separando la experiencia en dos paneles:

- Panel izquierdo: muestra el Pokemon seleccionado, su sprite, tipos y botones de accion.
- Panel derecho: contiene el buscador y la lista navegable de Pokemon.

El proyecto esta desarrollado solo con tecnologias del navegador: HTML, CSS y JavaScript puro, sin frameworks ni sistema de build.

## Estructura de archivos

```text
Poke-api/
+-- pokeapi.html          # Estructura principal de la interfaz
+-- pokepi.css            # Estilos visuales, responsive y estetica retro
+-- Pokepe.js             # Logica de consumo de API e interactividad
+-- Littlerooot_town.mp3  # Musica ambiental local
+-- descarga.png          # Imagen local del proyecto
+-- .git/                 # Repositorio Git
```

## Como ejecutar el proyecto

No necesita instalacion de dependencias. Al ser una app estatica, se puede abrir directamente el archivo:

```text
pokeapi.html
```

Tambien puede servirse con cualquier servidor local simple. La aplicacion requiere conexion a internet para consultar PokeAPI, cargar sprites externos, iconos y la fuente de Google Fonts.

## Tecnologias usadas

- HTML5: define la estructura de la Pokedex, los paneles, botones, buscador y modales.
- CSS3: construye el aspecto visual retro, la distribucion responsive, animaciones y colores por tipo.
- JavaScript vanilla: maneja estado, eventos, llamadas `fetch`, renderizado dinamico y audio.
- PokeAPI: fuente principal de datos de Pokemon.
- Google Fonts: carga la fuente `Press Start 2P`.

## Funcionamiento general

Cuando el navegador termina de cargar el documento, `Pokepe.js` ejecuta la inicializacion:

1. Llama a `cargarPokemones()`.
2. Descarga un listado amplio desde `https://pokeapi.co/api/v2/pokemon?limit=1400&offset=0`.
3. Separa Pokemon base nacionales de variantes especiales.
4. Renderiza la lista lateral.
5. Carga automaticamente el primer Pokemon disponible.
6. Prepara la musica de fondo local `Littlerooot_town.mp3`.

La app mantiene en memoria tres estructuras importantes:

- `listaBaseGlobal`: Pokemon base con ID hasta 1025.
- `todosLosPokemonRaw`: listado completo recibido desde PokeAPI.
- `diccionarioVariantes`: agrupacion de formas alternativas por nombre raiz.

## Funcionalidades principales

### Busqueda

El input `pokeSearch` filtra la lista en tiempo real usando coincidencias por nombre. Cada cambio vuelve a renderizar el panel derecho con los resultados encontrados.

### Seleccion de Pokemon

Cada item de la lista ejecuta `actualizarDetalles(urlPokemon)`, que descarga la informacion completa del Pokemon seleccionado y actualiza:

- Nombre.
- Sprite normal o shiny.
- Tipos elementales.
- Estado del boton de grito.
- Disponibilidad de formas alternativas.

### Sprites y modo shiny

La app prioriza sprites animados de la generacion V, si existen:

```js
sprites.versions["generation-v"]["black-white"].animated
```

Si no hay sprite animado, usa el sprite estatico por defecto. El boton `Shiny` alterna entre `urlSpriteNormal` y `urlSpriteShiny`.

### Grito del Pokemon

El boton de sonido usa la propiedad `cries.latest` entregada por PokeAPI. Si el Pokemon no tiene audio disponible, el boton queda deshabilitado.

### Modal de informacion

El boton `Info` abre un modal generado por `mostrarMenuInfo(data)`. Este modal incluye:

- Altura.
- Peso.
- Estadisticas base.
- Descripcion oficial en espanol, tomada desde `pokemon-species`.
- Analisis defensivo de tipos.
- Analisis ofensivo de tipos.
- Cadena evolutiva.

### Analisis de tipos

El archivo JavaScript incluye una tabla local llamada `TABLA_EFECTIVIDADES`. Con esa matriz calcula:

- Debilidades x2.
- Debilidades x4.
- Tipos a los que el Pokemon golpea super efectivo x2.
- Casos ofensivos x4 cuando sus dos tipos son fuertes contra el mismo objetivo.

### Cadena evolutiva

Para construir evoluciones, la app consulta:

```text
/api/v2/pokemon-species/{id}/
```

Desde esa respuesta obtiene la URL de `evolution_chain` y renderiza un arbol evolutivo dinamico. La construccion es recursiva, por lo que soporta ramas multiples como Eevee.

Tambien incluye un caso especial manual para Rockruff/Lycanroc, porque esa rama puede venir incompleta o dificil de representar desde la API.

### Formas alternativas

Las variantes especiales se detectan por ID mayor o igual a 10001 y se agrupan por nombre base. Por ejemplo, una variante como `raichu-alola` queda asociada a `raichu`.

Si el Pokemon actual tiene variantes, se habilita el boton `Formas`, que abre un modal con opciones para cambiar entre forma original y variantes.

### Musica ambiental

El proyecto incluye musica de fondo local mediante:

```js
const URL_MUSICA_FONDO = "Littlerooot_town.mp3";
```

Por las politicas de autoplay de los navegadores, la reproduccion se intenta activar despues de una interaccion del usuario.

## Diseno visual

La interfaz busca parecer una Pokedex fisica:

- Fondo rojo con borde negro grueso.
- Dos pantallas internas con tonos celestes.
- Fuente pixelada.
- Sprites con `image-rendering: pixelated`.
- Botones con sombras duras para simular relieve.
- Pokeball giratoria como marca de agua en el panel del sprite.
- Colores especificos para cada tipo Pokemon.

El CSS incluye una media query para pantallas de hasta 768px. En mobile, la Pokedex pasa de layout horizontal a vertical: primero el panel del Pokemon y debajo la lista.

## Dependencias externas

La aplicacion depende de estos recursos externos:

- `https://pokeapi.co/api/v2/` para datos.
- Repositorio de sprites de PokeAPI en GitHub para miniaturas evolutivas.
- Icono de Pokeball de Wikimedia.
- Icono de sonido de Flaticon.
- Fuente `Press Start 2P` desde Google Fonts.

Si alguno de estos servicios no esta disponible o no hay conexion a internet, algunas partes de la app pueden no cargar correctamente.

## Puntos tecnicos destacables

- No usa frameworks: toda la UI dinamica se crea con DOM API.
- Usa `fetch` y `async/await` para consumir endpoints externos.
- Maneja estado global simple para el Pokemon actual, modo shiny y audio activo.
- Agrupa variantes de forma mediante un diccionario en memoria.
- Genera la cadena evolutiva con una funcion recursiva.
- Calcula efectividades sin pedirlas a la API, usando una tabla local.
- Incluye soporte responsive para celulares y tablets.

## Posibles mejoras futuras

- Corregir problemas de codificacion de caracteres visibles en algunos textos, como `PokÃ©mon`.
- Agregar manejo visual de estados de carga y errores de red.
- Separar el JavaScript en modulos mas pequenos.
- Mover estilos inline generados por JavaScript hacia clases CSS.
- Agregar cache local para reducir llamadas repetidas a PokeAPI.
- Incluir pruebas manuales documentadas o una pequena suite de tests para funciones puras como efectividades y traduccion de evoluciones.
