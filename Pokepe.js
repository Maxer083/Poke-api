// Selección de elementos del DOM
const listaPokemon = document.getElementById('pokemonList');
const uiName = document.getElementById('pokeName');
const uiSprite = document.getElementById('pokeSprite');
const uiTypes = document.getElementById('pokeTypes'); 
const pokeSearch = document.getElementById('pokeSearch');

// Botones de acción principales
const btnInfo = document.getElementById('btnInfo');
const btnShiny = document.getElementById('btnShiny');
const btnShapes = document.getElementById('btnShapes');

// Modales y sus cuerpos
const infoModal = document.getElementById('infoModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalPokeName = document.getElementById('modalPokeName');
const modalPokeBody = document.getElementById('modalPokeBody');

const shapesModal = document.getElementById('shapesModal');
const btnCloseShapesModal = document.getElementById('btnCloseShapesModal');
const modalShapesBody = document.getElementById('modalShapesBody');

// Estados globales de la aplicación
let pokemonActualData = null; 
let modoShinyActivo = false;
let urlSpriteNormal = "";
let urlSpriteShiny = "";

// Almacenamiento de datos crudos de la API
let todosLosPokemonRaw = [];
let listaBaseGlobal = []; 
let diccionarioVariantes = {}; 

// Inicialización automática
window.addEventListener('DOMContentLoaded', () => {
    cargarPokemones();
});

// Evento para escuchar la barra de búsqueda en tiempo real
pokeSearch.addEventListener('input', (e) => {
    const textoBusqueda = e.target.value.toLowerCase().trim();
    const listaFiltrada = listaBaseGlobal.filter(pokemon => 
        pokemon.name.toLowerCase().includes(textoBusqueda)
    );
    renderizarLista(listaFiltrada);
});

// Eventos de Cierre/Apertura de Modales
btnInfo.addEventListener('click', () => {
    if (pokemonActualData) mostrarMenuInfo(pokemonActualData);
});

btnShapes.addEventListener('click', () => {
    shapesModal.classList.add('open');
});

btnCloseModal.addEventListener('click', () => infoModal.classList.remove('open'));
btnCloseShapesModal.addEventListener('click', () => shapesModal.classList.remove('open'));

// Lógica para alternar el Sprite Shiny / Normal
btnShiny.addEventListener('click', () => {
    if (!pokemonActualData) return;
    modoShinyActivo = !modoShinyActivo;

    if (modoShinyActivo) {
        btnShiny.classList.add('active');
        uiSprite.src = urlSpriteShiny || urlSpriteNormal; 
    } else {
        btnShiny.classList.remove('active');
        uiSprite.src = urlSpriteNormal;
    }
});

// Función central: Descarga y organiza Pokémon base y variantes
async function cargarPokemones() {
    const url = "https://pokeapi.co/api/v2/pokemon?limit=1400&offset=0"; 
    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        todosLosPokemonRaw = datos.results;
        
        listaBaseGlobal = [];
        diccionarioVariantes = {};

        // Clasificación de datos
        todosLosPokemonRaw.forEach((pokemon) => {
            const urlPartes = pokemon.url.split('/');
            const idReal = parseInt(urlPartes[urlPartes.length - 2]);

            if (idReal <= 1025) {
                listaBaseGlobal.push(pokemon);
            } else if (idReal >= 10001) {
                const raizNombre = pokemon.name.split('-')[0]; 
                if (!diccionarioVariantes[raizNombre]) {
                    diccionarioVariantes[raizNombre] = [];
                }
                diccionarioVariantes[raizNombre].push(pokemon);
            }
        });

        renderizarLista(listaBaseGlobal);

        if(listaBaseGlobal.length > 0) {
            actualizarDetalles(listaBaseGlobal[0].url);
        }
    } catch (error) {
        console.error("Error general de carga:", error);
        uiName.innerText = "Error API";
    }
}

// Renderizar elementos en la lista derecha
function renderizarLista(arregloPokemon) {
    listaPokemon.innerHTML = ""; 

    if (arregloPokemon.length === 0) {
        listaPokemon.innerHTML = `<div style="padding: 15px; font-size: 8px; color: #666; text-align: center;">SIN RESULTADOS</div>`;
        return;
    }

    arregloPokemon.forEach((pokemon) => {
        const urlPartes = pokemon.url.split('/');
        const idReal = urlPartes[urlPartes.length - 2];
        const idFormateado = String(idReal).padStart(3, '0'); 
        
        const item = document.createElement('div');
        item.className = 'pokemon-item';
        
        if (pokemonActualData && pokemonActualData.name.split('-')[0] === pokemon.name) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <img class="pokeball-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" alt="ball">
            <span>${idFormateado} ${pokemon.name}</span>
        `;
        
        item.addEventListener('click', () => {
            document.querySelector('.pokemon-item.active')?.classList.remove('active');
            item.classList.add('active');
            infoModal.classList.remove('open');
            shapesModal.classList.remove('open');
            actualizarDetalles(pokemon.url);
        });

        listaPokemon.appendChild(item);
    });
}

// Cargar información, actualizar UI, inyectar tipos y verificar variantes
async function actualizarDetalles(urlPokemon) {
    try {
        const respuesta = await fetch(urlPokemon);
        const infoPokemon = await respuesta.json();
        
        pokemonActualData = infoPokemon;
        uiName.innerText = infoPokemon.name;
        
        urlSpriteNormal = infoPokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default 
                          || infoPokemon.sprites.front_default 
                          || "";

        urlSpriteShiny = infoPokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny 
                         || infoPokemon.sprites.front_shiny 
                         || "";

        uiSprite.src = modoShinyActivo ? (urlSpriteShiny || urlSpriteNormal) : urlSpriteNormal;
        uiSprite.alt = infoPokemon.name;

        // CÁLCULO DE ESCALA DINÁMICA POR ALTURA REAL
        // La API devuelve la altura en decímetros (ej: Charmander = 6, Charizard = 17)
        const alturaDecimetros = infoPokemon.height;
        
        // Convertimos a un tamaño base en pixeles
        let tamañoPixel = 100 + (alturaDecimetros * 8); 
        
        // Ponemos límites para mantener la armonía visual de la pantalla
        if (tamañoPixel < 110) tamañoPixel = 110; // Tamaño mínimo (para bebés/pequeños)
        if (tamañoPixel > 260) tamañoPixel = 260; // Tamaño máximo (para colosos)

        uiSprite.style.width = `${tamañoPixel}px`;
        uiSprite.style.height = `${tamañoPixel}px`;

        // Inyectar tipos con estilos en pantalla principal
        uiTypes.innerHTML = ""; 
        infoPokemon.types.forEach(t => {
            const tipoNombre = t.type.name;
            const badge = document.createElement('span');
            badge.className = `type-badge type-${tipoNombre}`; 
            badge.innerText = tipoNombre;
            uiTypes.appendChild(badge);
        });

        // Sistema Dinámico de Botón "Formas"
        const nombreRaiz = infoPokemon.name.split('-')[0];
        const variantesEncontradas = diccionarioVariantes[nombreRaiz] || [];

        if (variantesEncontradas.length > 0) {
            btnShapes.disabled = false;
            modalShapesBody.innerHTML = "";
            
            const btnBaseForm = document.createElement('div');
            btnBaseForm.className = 'shape-option-item';
            btnBaseForm.innerText = `${nombreRaiz} (Orig.)`;
            btnBaseForm.addEventListener('click', () => {
                shapesModal.classList.remove('open');
                const objBase = todosLosPokemonRaw.find(p => p.name === nombreRaiz);
                if(objBase) actualizarDetalles(objBase.url);
            });
            modalShapesBody.appendChild(btnBaseForm);

            variantesEncontradas.forEach(variante => {
                const btnVariante = document.createElement('div');
                btnVariante.className = 'shape-option-item';
                btnVariante.innerText = variante.name.replace(`${nombreRaiz}-`, 'F: ');
                
                btnVariante.addEventListener('click', () => {
                    shapesModal.classList.remove('open');
                    actualizarDetalles(variante.url);
                });
                modalShapesBody.appendChild(btnVariante);
            });
        } else {
            btnShapes.disabled = true;
        }

    } catch (error) {
        console.error("Error en procesamiento de detalles:", error);
    }
}

// Estructurar el panel modal con descripción dinámica de la Pokédex
async function mostrarMenuInfo(data) {
    modalPokeName.innerText = `${data.name} (N° ${data.id})`;
    const altura = (data.height / 10).toFixed(1) + " m";
    const peso = (data.weight / 10).toFixed(1) + " kg";

    let statsHTML = '';
    data.stats.forEach(s => {
        let nombreStat = s.stat.name.replace('special-', 'sp. ');
        statsHTML += `
            <div class="info-row">
                <span class="info-label">${nombreStat}:</span>
                <span>${s.base_stat}</span>
            </div>
        `;
    });

    // Renderizado base de stats y esqueleto para la descripción
    modalPokeBody.innerHTML = `
        <div class="info-row"><span class="info-label">ALTURA:</span><span>${altura}</span></div>
        <div class="info-row"><span class="info-label">PESO:</span><span>${peso}</span></div>
        <div style="font-weight:bold; margin-top:5px; border-bottom: 1px solid #333; color:#111;">STATS BASE:</div>
        ${statsHTML}
        <div style="font-weight:bold; margin-top:8px; border-bottom: 1px solid #333; color:#111;">DESCRIPCIÓN:</div>
        <div class="pokedex-description-box" id="pokedexDesc">Buscando en la base de datos...</div>
    `;
    
    infoModal.classList.add('open');

    // Consulta secundaria a la API para traer la descripción en español
    try {
        const resEspecie = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`);
        const datosEspecie = await resEspecie.json();
        
        const entradaEspañol = datosEspecie.flavor_text_entries.find(entrada => entrada.language.name === 'es');
        const descElement = document.getElementById('pokedexDesc');
        
        if (entradaEspañol && descElement) {
            let textoLimpio = entradaEspañol.flavor_text.replace(/[\n\f]/g, " ");
            descElement.innerText = textoLimpio;
        } else if (descElement) {
            descElement.innerText = "No hay registros de texto disponibles para esta región.";
        }
    } catch (error) {
        console.error("Error al traer la descripción:", error);
        const descElement = document.getElementById('pokedexDesc');
        if (descElement) descElement.innerText = "Error al conectar con la base de datos de especies.";
    }
}