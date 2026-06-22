# Pokedex Virtual

Proyecto web estatico que implementa una Pokedex interactiva con estetica retro. Consume datos de PokeAPI para listar Pokemon, mostrar informacion detallada, reproducir gritos, alternar sprites shiny, consultar formas alternativas y visualizar cadenas evolutivas.

La aplicacion esta hecha con HTML, CSS y JavaScript puro. No usa frameworks, dependencias instalables ni sistema de build.

## Objetivo

El proyecto recrea una Pokedex de pantalla completa dividida en dos zonas principales:

- Panel izquierdo: muestra el Pokemon seleccionado, su sprite, tipos y acciones principales.
- Panel derecho: muestra un buscador y una lista scrolleable de Pokemon.

Ademas, incluye modales para ver detalles avanzados y formas alternativas.

## Estructura del proyecto

```text
Poke-api/
+-- pokeapi.html          # Estructura principal de la interfaz
+-- pokepi.css            # Estilos, responsive y estetica retro
+-- Pokepe.js             # Logica de datos, eventos, audio y renderizado
+-- Littlerooot_town.mp3  # Musica ambiental local
+-- README.md             # Documentacion del proyecto
+-- img/
    +-- volume.png        # Icono de musica activa
    +-- mute.png          # Icono de musica pausada
    +-- Poke_Ball_icon.png # Icono de Pokeball / favicon
```

## Como ejecutarlo

No requiere instalacion. Se puede abrir directamente:

```text
pokeapi.html
```

Tambien puede servirse con un servidor local simple. La app necesita conexion a internet para consultar PokeAPI, obtener sprites remotos y cargar la fuente externa.

## Archivos principales

### `pokeapi.html`

Define la estructura base de la aplicacion:

- Contenedor principal `.pokedex-container`.
- Panel izquierdo `.screen-left`.
- Boton flotante `btnMusicToggle` para activar o pausar la musica.
- Nombre del Pokemon `pokeName`.
- Imagen del sprite `pokeSprite`.
- Contenedor de tipos `pokeTypes`.
- Botones `Info`, `Forms`, `Shiny` y `Cry`.
- Panel derecho con buscador `pokeSearch` y lista `pokemonList`.
- Modal de informacion `infoModal`.
- Modal de formas `shapesModal`.

### `pokepi.css`

Contiene toda la capa visual:

- Layout de pantalla completa en dos columnas.
- Estilo de consola retro con bordes gruesos, sombras duras y fuente pixelada.
- Boton flotante de musica.
- Botones de accion.
- Badges de tipos Pokemon con colores por tipo.
- Lista lateral scrolleable.
- Modales animados.
- Arbol evolutivo.
- Media query para adaptar la Pokedex a pantallas menores a 768px.

### `Pokepe.js`

Centraliza el comportamiento de la app:

- Inicializacion al cargar el DOM.
- Consumo de PokeAPI con `fetch`.
- Renderizado dinamico de la lista.
- Actualizacion del Pokemon seleccionado.
- Control de musica de fondo.
- Reproduccion del grito del Pokemon.
- Alternancia entre sprite normal y shiny.
- Calculo de efectividades de tipos.
- Construccion del modal de informacion.
- Construccion recursiva de cadenas evolutivas.
- Manejo de formas alternativas.

## Flujo de funcionamiento

Al cargar la pagina:

1. Se ejecuta el evento `DOMContentLoaded`.
2. Se llama a `cargarPokemones()`.
3. La app consulta `https://pokeapi.co/api/v2/pokemon?limit=1400&offset=0`.
4. Se separan Pokemon base y variantes especiales.
5. Se renderiza la lista lateral.
6. Se carga automaticamente el primer Pokemon disponible.
7. Se prepara el audio de fondo con `prepararAudio()`.

## Estado en memoria

El JavaScript usa variables globales simples para manejar el estado:

- `pokemonActualData`: datos completos del Pokemon actualmente visible.
- `modoShinyActivo`: indica si el sprite shiny esta activo.
- `urlSpriteNormal`: URL del sprite normal.
- `urlSpriteShiny`: URL del sprite shiny.
- `audioActual`: audio del grito en reproduccion.
- `bgMusic`: musica de fondo.
- `todosLosPokemonRaw`: respuesta completa de PokeAPI.
- `listaBaseGlobal`: Pokemon base de la Pokedex nacional.
- `diccionarioVariantes`: formas alternativas agrupadas por Pokemon base.

## Funcionalidades

### Busqueda de Pokemon

El campo `pokeSearch` filtra la lista en tiempo real. El filtro compara el texto ingresado contra el nombre de cada Pokemon.

### Seleccion y detalle

Al hacer click en un Pokemon de la lista, `actualizarDetalles(urlPokemon)` consulta su endpoint individual y actualiza nombre, sprite, tipos, estado del boton de grito y disponibilidad de formas.

### Sprites normales y shiny

La app intenta usar sprites animados de la generacion V:

```js
sprites.versions["generation-v"]["black-white"].animated
```

Si no existen, usa sprites estaticos de PokeAPI. El boton `Shiny` alterna entre la version normal y variocolor.

### Musica de fondo

La musica usa el archivo local:

```js
const URL_MUSICA_FONDO = "Littlerooot_town.mp3";
```

El boton `btnMusicToggle` funciona como interruptor:

- Si la musica esta pausada, llama a `bgMusic.play()`.
- Si la musica esta sonando, llama a `bgMusic.pause()`.
- El icono cambia entre `img/volume.png` e `img/mute.png`.

### Grito del Pokemon

El boton `Cry` reproduce el audio oficial del Pokemon cuando PokeAPI lo provee en `cries.latest`. Si no existe audio, el boton se deshabilita.

### Modal de informacion

El boton `Info` abre una ficha con:

- Altura.
- Peso.
- Estadisticas base.
- Descripcion en espanol desde `pokemon-species`.
- Analisis defensivo de tipos.
- Analisis ofensivo de tipos.
- Cadena evolutiva.

### Efectividades de tipos

El proyecto incluye una matriz local `TABLA_EFECTIVIDADES`. Con esa tabla calcula:

- Debilidades x2.
- Debilidades x4.
- Resistencias e inmunidades aplicadas al calculo defensivo.
- Tipos contra los que el Pokemon es super efectivo.
- Casos ofensivos x4 cuando ambos tipos favorecen el mismo objetivo.

### Cadenas evolutivas

La app consulta `pokemon-species`, toma la URL de `evolution_chain` y genera un arbol evolutivo de forma recursiva. Esto permite representar cadenas lineales y ramificadas.

Tambien incluye un caso manual para Rockruff/Lycanroc, porque esa familia evolutiva requiere un tratamiento especial.

### Formas alternativas

Las formas con ID mayor o igual a 10001 se tratan como variantes especiales. Se agrupan por nombre base y se muestran en el modal `Forms` cuando corresponda.

## Dependencias externas

- PokeAPI: datos principales, especies, evoluciones, sprites y gritos.
- Google Fonts: fuente `Press Start 2P`.
- Sprites remotos de PokeAPI/GitHub para miniaturas evolutivas.

Los iconos de musica y Pokeball se manejan como archivos locales dentro de `img/`.

## Diseno responsive

En escritorio, la Pokedex se muestra como una interfaz horizontal de dos paneles. En pantallas menores a 768px:

- El layout pasa a columna.
- El panel izquierdo ocupa todo el ancho.
- La lista se ubica debajo.
- Los modales pasan a posicion fija para ocupar casi toda la pantalla.
- La cadena evolutiva se adapta a direccion vertical.

## Observaciones tecnicas

- El proyecto no tiene `package.json` ni dependencias instaladas.
- No hay pruebas automatizadas configuradas.
- El codigo esta muy comentado, lo que facilita entender el flujo.
- Hay bastante HTML inline generado desde JavaScript, especialmente dentro del modal de informacion.
- Existen textos con problemas de codificacion visibles como `PokÃ©dex` o `â˜… Shiny`.
- En el estado actual, `pokeapi.html` referencia `img/volume-mute.png`, pero en la carpeta `img/` aparece `mute.png`. Si el icono inicial no se ve, esa ruta es el primer punto a revisar.

## Posibles mejoras futuras

- Corregir codificacion de caracteres a UTF-8 real en todos los archivos.
- Revisar la ruta inicial del icono de musica pausada.
- Separar `Pokepe.js` en modulos mas pequenos.
- Mover estilos inline generados por JS a clases CSS.
- Agregar estados visuales de carga y error.
- Cachear respuestas de PokeAPI para evitar consultas repetidas.
- Documentar pruebas manuales basicas para busqueda, shiny, audio, cry, forms y evoluciones.
