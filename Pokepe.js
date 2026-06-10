// ==========================================
// CONFIGURACIÓN DE AUDIO MANUAL
// ==========================================
const URL_MUSICA_FONDO = "Littlerooot_town.mp3"; 

// Selección de elementos del DOM
const listaPokemon = document.getElementById('pokemonList');
const uiName = document.getElementById('pokeName');
const uiSprite = document.getElementById('pokeSprite');
const uiTypes = document.getElementById('pokeTypes'); 
const pokeSearch = document.getElementById('pokeSearch');

// Botón de inicio para saltear el bloqueo de autoplay del navegador
// (Asegurate de agregar este botón en tu HTML, por ejemplo en una pantalla de bienvenida)
const btnIniciarPokedex = document.getElementById('btnIniciarPokedex'); 

// Botones de acción principales
const btnInfo = document.getElementById('btnInfo');
const btnShiny = document.getElementById('btnShiny');
const btnShapes = document.getElementById('btnShapes');
const btnCry = document.getElementById('btnCry'); 

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
let audioActual = null; 

// Sistema de Música de Fondo (Villa Raíz)
let bgMusic = null;

// Almacenamiento de datos crudos de la API
let todosLosPokemonRaw = [];
let listaBaseGlobal = []; 
let diccionarioVariantes = {}; 

// TABLA DE RELACIÓN DE TIPOS
const TABLA_EFECTIVIDADES = {
    normal: { doubleFrom: ['fighting'], halfFrom: [], noneFrom: ['ghost'] },
    fire: { doubleFrom: ['water', 'ground', 'rock'], halfFrom: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], noneFrom: [] },
    water: { doubleFrom: ['electric', 'grass'], halfFrom: ['fire', 'water', 'ice', 'steel'], noneFrom: [] },
    grass: { doubleFrom: ['fire', 'ice', 'poison', 'flying', 'bug'], halfFrom: ['water', 'electric', 'grass', 'ground'], noneFrom: [] },
    electric: { doubleFrom: ['ground'], halfFrom: ['electric', 'flying', 'steel'], noneFrom: [] },
    ice: { doubleFrom: ['fire', 'fighting', 'rock', 'steel'], halfFrom: ['ice'], noneFrom: [] },
    fighting: { doubleFrom: ['flying', 'psychic', 'fairy'], halfFrom: ['bug', 'rock', 'dark'], noneFrom: [] },
    poison: { doubleFrom: ['ground', 'psychic'], halfFrom: ['fighting', 'poison', 'grass', 'bug', 'fairy'], noneFrom: [] },
    ground: { doubleFrom: ['water', 'grass', 'ice'], halfFrom: ['poison', 'rock'], noneFrom: ['electric'] },
    flying: { doubleFrom: ['electric', 'ice', 'rock'], halfFrom: ['fighting', 'bug', 'grass'], noneFrom: ['ground'] },
    psychic: { doubleFrom: ['bug', 'ghost', 'dark'], halfFrom: ['fighting', 'psychic'], noneFrom: [] },
    bug: { doubleFrom: ['fire', 'flying', 'rock'], halfFrom: ['fighting', 'ground', 'grass'], noneFrom: [] },
    rock: { doubleFrom: ['water', 'grass', 'fighting', 'ground', 'steel'], halfFrom: ['normal', 'fire', 'poison', 'flying'], noneFrom: [] },
    ghost: { doubleFrom: ['ghost', 'dark'], halfFrom: ['poison', 'bug'], noneFrom: ['normal', 'fighting'] },
    dragon: { doubleFrom: ['ice', 'dragon', 'fairy'], halfFrom: ['fire', 'water', 'grass', 'electric'], noneFrom: [] },
    dark: { doubleFrom: ['fighting', 'bug', 'fairy'], halfFrom: ['ghost', 'dark'], noneFrom: ['psychic'] },
    steel: { doubleFrom: ['fire', 'fighting', 'ground'], halfFrom: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], noneFrom: ['poison'] },
    fairy: { doubleFrom: ['poison', 'steel'], halfFrom: ['fighting', 'bug', 'dark'], noneFrom: ['dragon'] }
};

// Inicialización automática al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    cargarPokemones();
    prepararAudio();
});

// Crea el objeto de audio pero no lo reproduce todavía
function prepararAudio() {
    if (URL_MUSICA_FONDO) {
        bgMusic = new Audio(URL_MUSICA_FONDO);
        bgMusic.loop = true;
        bgMusic.volume = 0.25;
    }

    // Si pusiste el botón de bienvenida, al hacer click ahí arranca la música inmediatamente
    if (btnIniciarPokedex) {
        btnIniciarPokedex.addEventListener('click', () => {
            if (bgMusic) {
                bgMusic.play().catch(err => console.log("Bloqueo de audio del navegador:", err));
            }
        });
    } else {
        // Opción de respaldo por si no usas botón: reproduce al primer click en CUALQUIER lado de la página
        const reproducirPrimerClick = () => {
            if (bgMusic) {
                bgMusic.play().catch(err => console.log("Esperando interacción:", err));
                document.removeEventListener('click', reproducirPrimerClick);
            }
        };
        document.addEventListener('click', reproducirPrimerClick);
    }
}

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

// Evento para reproducir el grito del Pokémon de forma aislada y segura
btnCry.addEventListener('click', async () => {
    if (pokemonActualData && pokemonActualData.cries && pokemonActualData.cries.latest) {
        try {
            if (audioActual) {
                audioActual.pause();
                audioActual = null;
            }
            audioActual = new Audio(pokemonActualData.cries.latest);
            audioActual.volume = 0.5; 
            await audioActual.play();
        } catch (err) {
            console.warn("No se pudo reproducir el grito del Pokémon:", err);
        }
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
        const idFormateated = String(idReal).padStart(3, '0'); 
        
        const item = document.createElement('div');
        item.className = 'pokemon-item';
        item.setAttribute('data-name', pokemon.name.toLowerCase().trim()); 
        
        if (pokemonActualData && pokemonActualData.name.split('-')[0] === pokemon.name) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <img class="pokeball-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" alt="ball">
            <span>${idFormateated} ${pokemon.name}</span>
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
        
        if (btnCry) {
            if (infoPokemon.cries && infoPokemon.cries.latest) {
                btnCry.disabled = false;
            } else {
                btnCry.disabled = true;
            }
        }

        urlSpriteNormal = infoPokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default 
                          || infoPokemon.sprites.front_default 
                          || "";

        urlSpriteShiny = infoPokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny 
                         || infoPokemon.sprites.front_shiny 
                         || "";

        uiSprite.src = modoShinyActivo ? (urlSpriteShiny || urlSpriteNormal) : urlSpriteNormal;
        uiSprite.alt = infoPokemon.name;

        // Limpiamos los estilos en línea residuales para que el CSS Responsive tome el control total
        uiSprite.style.width = "";
        uiSprite.style.height = "";

        uiTypes.innerHTML = ""; 
        infoPokemon.types.forEach(t => {
            const tipoNombre = t.type.name;
            const badge = document.createElement('span');
            badge.className = `type-badge type-${tipoNombre}`; 
            badge.innerText = tipoNombre;
            uiTypes.appendChild(badge);
        });

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

// Traducir método de evolución
function traducirMetodoEvolucion(details) {
    if (!details || details.length === 0) return "ESPECIAL";

    const detalleItem = details.find(d => d.trigger?.name === "use-item" && d.item?.name);
    if (detalleItem) {
        return detalleItem.item.name.replace(/-/g, " ").toUpperCase();
    }

    const detalleNivel = details.find(d => d.min_level);
    if (detalleNivel) {
        let extra = "";
        if (detalleNivel.time_of_day) {
            const horaTraduccion = detalleNivel.time_of_day === 'day' ? 'DÍA' : detalleNivel.time_of_day === 'night' ? 'NOCHE' : 'ATARDECER';
            extra = ` (${horaTraduccion})`;
        }
        return `LVL ${detalleNivel.min_level}${extra}`;
    }

    const detalleTrade = details.find(d => d.trigger?.name === "trade");
    if (detalleTrade) {
        return detalleTrade.held_item ? `TRAD. + ${detalleTrade.held_item.name.replace(/-/g, " ").toUpperCase()}` : "INTERCAMBIO";
    }

    const detalleFelicidad = details.find(d => d.min_happiness);
    if (detalleFelicidad) {
        let extra = "";
        if (detalleFelicidad.time_of_day) {
            const horaTraduccion = detalleFelicidad.time_of_day === 'day' ? 'DÍA' : detalleFelicidad.time_of_day === 'night' ? 'NOCHE' : 'ATARDECER';
            extra = `AMISTAD${extra}`;
        }
        return `AMISTAD${extra}`;
    }

    const d = details[0];
    if (d.location?.name) return `LUGAR: ${d.location.name.split("-")[0].toUpperCase()}`;
    if (d.known_move?.name) return `MOV: ${d.known_move.name.toUpperCase()}`;
    if (d.known_move_type?.name) return `TIPO MOV: ${d.known_move_type.name.toUpperCase()}`;

    return "ESPECIAL";
}

// Estructurar el panel modal de información
async function mostrarMenuInfo(data) {
    modalPokeName.innerText = `${data.name} (N° ${data.id})`;
    const altura = (data.height / 10).toFixed(1) + " m";
    const peso = (data.weight / 10).toFixed(1) + " kg";
    const tiposPokemon = data.types.map(t => t.type.name);

    // CÁLCULO DE DEFENSA
    let modificadoresDefensa = {};
    Object.keys(TABLA_EFECTIVIDADES).forEach(tipo => { modificadoresDefensa[tipo] = 1; });
    tiposPokemon.forEach(tipoDelPokemon => {
        const relaciones = TABLA_EFECTIVIDADES[tipoDelPokemon];
        if (relaciones) {
            relaciones.doubleFrom.forEach(t => { modificadoresDefensa[t] *= 2; });
            relaciones.halfFrom.forEach(t => { modificadoresDefensa[t] *= 0.5; });
            relaciones.noneFrom.forEach(t => { modificadoresDefensa[t] *= 0; });
        }
    });

    let debilidadesX2 = [];
    let debilidadesX4 = [];
    Object.keys(modificadoresDefensa).forEach(tipo => {
        if (modificadoresDefensa[tipo] === 2) debilidadesX2.push(tipo);
        if (modificadoresDefensa[tipo] === 4) debilidadesX4.push(tipo);
    });

    // CÁLCULO DE OFENSIVA
    let ofensivaX2 = new Set();
    let ofensivaX4 = new Set();
    tiposPokemon.forEach(tipoDelPokemon => {
        Object.keys(TABLA_EFECTIVIDADES).forEach(tipoObjetivo => {
            if (TABLA_EFECTIVIDADES[tipoObjetivo].doubleFrom.includes(tipoDelPokemon)) {
                if (tiposPokemon.length === 1) {
                    ofensivaX2.add(tipoObjetivo);
                } else {
                    const otroTipo = tiposPokemon.find(t => t !== tipoDelPokemon);
                    if (TABLA_EFECTIVIDADES[tipoObjetivo].doubleFrom.includes(otroTipo)) {
                        ofensivaX4.add(tipoObjetivo);
                    } else {
                        ofensivaX2.add(tipoObjetivo);
                    }
                }
            }
        });
    });
    ofensivaX4.forEach(tipo => ofensivaX2.delete(tipo));
    let listaOfensivaX2 = Array.from(ofensivaX2);
    let listaOfensivaX4 = Array.from(ofensivaX4);

    const crearBadges = (lista) => {
        return lista.map(t => `<span class="type-badge type-${t}" style="font-size:8px; padding:6px 0; flex:none; width:72px; display:inline-block; margin:3px 2px; text-align:center;">${t}</span>`).join('') 
                || '<span style="font-size:10px; color:#666; margin-left:6px; font-weight:normal;">- NONE -</span>';
    };

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

    modalPokeBody.innerHTML = `
        <div class="info-row"><span class="info-label">ALTURA:</span><span>${altura}</span></div>
        <div class="info-row"><span class="info-label">PESO:</span><span>${peso}</span></div>
        <div style="font-weight:bold; margin-top:5px; border-bottom: 1px solid #333; color:#111;">STATS BASE:</div>
        ${statsHTML}
        <div style="font-weight:bold; margin-top:8px; border-bottom: 1px solid #333; color:#111;">DESCRIPCIÓN:</div>
        <div class="pokedex-description-box" id="pokedexDesc" style="height: auto !important; min-height: 50px; overflow: visible !important; word-wrap: break-word !important; overflow-wrap: break-word !important; white-space: normal !important; display: block !important; width: 100%; box-sizing: border-box; padding: 10px; margin-top: 5px;">Buscando en la base de datos...</div>
        
        <div style="font-weight:bold; margin-top:12px; border-bottom: 1px solid #333; color:#111; font-size:11px;">ANÁLISIS DE TIPOS:</div>
        
        <div style="margin-top:8px; background: rgba(200,0,0,0.04); padding: 6px; border-radius:6px; border: 1px dashed rgba(200,0,0,0.25);">
            <div style="font-size:10px; font-weight:bold; color:#cc3333; margin-bottom:6px;">❌ DAÑO RECIBIDO (DEFENSA)</div>
            <div style="font-size:9px; color:#444; font-weight:bold; margin-left:2px; margin-top:2px;">DEBILIDAD x2:</div>
            <div style="display:flex; flex-wrap:wrap; margin-bottom:6px;">${crearBadges(debilidadesX2)}</div>
            <div style="font-size:9px; color:#990000; font-weight:bold; margin-left:2px; margin-top:2px;">DEBILIDAD CUÁDRUPLE x4:</div>
            <div style="display:flex; flex-wrap:wrap;">${crearBadges(debilidadesX4)}</div>
        </div>

        <div style="margin-top:10px; background: rgba(0,200,0,0.03); padding: 6px; border-radius:6px; border: 1px dashed rgba(0,200,0,0.25);">
            <div style="font-size:10px; font-weight:bold; color:#2d632d; margin-bottom:6px;">⚔️ DAÑO CAUSADO (ATAQUE)</div>
            <div style="font-size:9px; color:#444; font-weight:bold; margin-left:2px; margin-top:2px;">SÚPER EFECTIVO x2:</div>
            <div style="display:flex; flex-wrap:wrap; margin-bottom:6px;">${crearBadges(listaOfensivaX2)}</div>
            <div style="font-size:9px; color:#1b4d1b; font-weight:bold; margin-left:2px; margin-top:2px;">EFECTIVIDAD MÁXIMA x4:</div>
            <div style="display:flex; flex-wrap:wrap;">${crearBadges(listaOfensivaX4)}</div>
        </div>

        <div id="evolutionTitleBox" style="font-weight:bold; margin-top:16px; border-bottom: 1px solid #333; color:#111; font-size:11px; display:none;">LÍNEA EVOLUTIVA:</div>
        <div id="evolutionChainBox" style="margin-top:8px; display:none; background: #fff; border:3px solid #222; border-radius:8px; padding:20px 15px; box-sizing:border-box; width:100%; height:auto !important; overflow:visible !important; margin-bottom:20px;">
        </div>
    `;
    
    infoModal.classList.add('open');

    try {
        const resEspecie = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`);
        const datosEspecie = await resEspecie.json();
        
        const entradaEspañol = datosEspecie.flavor_text_entries.find(entrada => entrada.language.name === 'es');
        const descElement = document.getElementById('pokedexDesc');
        if (entradaEspañol && descElement) {
            descElement.innerText = entradaEspañol.flavor_text.replace(/[\n\f]/g, " ");
        }

        if (datosEspecie.evolution_chain?.url) {
            const resChain = await fetch(datosEspecie.evolution_chain.url);
            const dataChain = await resChain.json();
            
            let chainDataBase = dataChain.chain;

            if (data.name.includes("rockruff") || data.name.includes("lycanroc")) {
                chainDataBase.evolves_to = [
                    {
                        species: { name: "lycanroc (diurna)", url: "https://pokeapi.co/api/v2/pokemon-species/745/" },
                        evolution_details: [{ min_level: 25, time_of_day: "day" }],
                        evolves_to: []
                    },
                    {
                        species: { name: "lycanroc (nocturna)", url: "https://pokeapi.co/api/v2/pokemon-species/10126/" },
                        evolution_details: [{ min_level: 25, time_of_day: "night" }],
                        evolves_to: []
                    },
                    {
                        species: { name: "lycanroc (crepuscular)", url: "https://pokeapi.co/api/v2/pokemon-species/10152/" },
                        evolution_details: [{ min_level: 25, time_of_day: "dusk" }],
                        evolves_to: []
                    }
                ];
            }

            if (!chainDataBase.evolves_to || chainDataBase.evolves_to.length === 0) {
                document.getElementById('evolutionTitleBox').style.display = 'none';
                document.getElementById('evolutionChainBox').style.display = 'none';
                return; 
            }

            document.getElementById('evolutionTitleBox').style.display = 'block';
            const chainBox = document.getElementById('evolutionChainBox');
            chainBox.style.display = 'block';
            chainBox.innerHTML = "";

            function generarEstructuraArbol(nodo) {
                const urlPartes = nodo.species.url.split('/');
                const idRealEspecie = urlPartes[urlPartes.length - 2];
                const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idRealEspecie}.png`;

                const bloqueEtapa = document.createElement('div');
                bloqueEtapa.style.display = "flex";
                bloqueEtapa.style.alignItems = "center";
                bloqueEtapa.style.justifyContent = "center";
                bloqueEtapa.style.gap = "15px";

                const pkmCard = document.createElement('div');
                pkmCard.style.display = "flex";
                pkmCard.style.flexDirection = "column";
                pkmCard.style.alignItems = "center";
                pkmCard.style.justifyContent = "center";
                pkmCard.style.width = "110px"; 
                pkmCard.style.minHeight = "115px"; 
                pkmCard.style.flexShrink = "0"; 
                pkmCard.style.transition = "transform 0.15s ease, opacity 0.15s ease";

                const nombreNodoLimpio = nodo.species.name.split(" ")[0].toLowerCase().trim();
                const nombreActualLimpio = pokemonActualData ? pokemonActualData.name.split("-")[0].toLowerCase().trim() : "";
                const esElPokemonActual = (nombreNodoLimpio === nombreActualLimpio);

                if (esElPokemonActual) {
                    pkmCard.style.cursor = "default";
                    pkmCard.style.opacity = "0.4"; 
                } else {
                    pkmCard.style.cursor = "pointer";
                    
                    pkmCard.addEventListener('mouseenter', () => { 
                        pkmCard.style.opacity = "0.75"; 
                        pkmCard.style.transform = "scale(1.03)"; 
                    });
                    pkmCard.addEventListener('mouseleave', () => { 
                        pkmCard.style.opacity = "1"; 
                        pkmCard.style.transform = "scale(1)"; 
                    });

                    pkmCard.addEventListener('click', () => {
                        const nombreLimpio = nodo.species.name.split(" ")[0].toLowerCase().trim();
                        let pokemonEncontrado = listaBaseGlobal.find(p => p.name.toLowerCase().trim() === nombreLimpio);
                        
                        if (!pokemonEncontrado) {
                            pokemonEncontrado = todosLosPokemonRaw.find(p => p.name.toLowerCase().trim().startsWith(nombreLimpio));
                        }

                        if (pokemonEncontrado) {
                            const nombreABuscar = pokemonEncontrado.name.toLowerCase().trim();
                            let domItem = document.querySelector(`.pokemon-item[data-name="${nombreABuscar}"]`);
                            if (!domItem) {
                                pokeSearch.value = ""; 
                                renderizarLista(listaBaseGlobal); 
                                domItem = document.querySelector(`.pokemon-item[data-name="${nombreABuscar}"]`);
                            }

                            document.querySelector('.pokemon-item.active')?.classList.remove('active');
                            if (domItem) {
                                domItem.classList.add('active');
                                domItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                            
                            infoModal.classList.remove('open');
                            actualizarDetalles(pokemonEncontrado.url);
                        }
                    });
                }

                pkmCard.innerHTML = `
                    <img src="${spriteUrl}" alt="${nodo.species.name}" style="width:96px; height:96px; image-rendering:pixelated; object-fit:contain;">
                    <span style="font-size:10px; text-transform:uppercase; font-weight:bold; margin-top:2px; text-align:center; color:#111; width:auto; white-space:nowrap; overflow:visible;">${nodo.species.name.split(" ")[0]}</span>
                `;
                bloqueEtapa.appendChild(pkmCard);

                if (nodo.evolves_to && nodo.evolves_to.length > 0) {
                    const columnaRamasHijas = document.createElement('div');
                    columnaRamasHijas.style.display = "flex";
                    columnaRamasHijas.style.flexDirection = "column";
                    columnaRamasHijas.style.gap = "25px"; 
                    columnaRamasHijas.style.justifyContent = "center";

                    nodo.evolves_to.forEach((hijoNodo, index) => {
                        const filaFila = document.createElement('div');
                        filaFila.style.display = "flex";
                        filaFila.style.alignItems = "center";
                        filaFila.style.gap = "15px";

                        const metodoTexto = traducirMetodoEvolucion(hijoNodo.evolution_details);
                        const contenedorFlecha = document.createElement('div');
                        contenedorFlecha.style.display = "flex";
                        contenedorFlecha.style.flexDirection = "column";
                        contenedorFlecha.style.alignItems = "center";
                        contenedorFlecha.style.justifyContent = "center";
                        contenedorFlecha.style.minWidth = "85px";
                        contenedorFlecha.style.flexShrink = "0";

                        let rotacionEstilo = "transform: rotate(0deg);";
                        if (nodo.evolves_to.length > 1) {
                            if (index === 0) {
                                rotacionEstilo = "transform: rotate(-24deg); margin-bottom: 6px;"; 
                            } else if (index === nodo.evolves_to.length - 1) {
                                rotacionEstilo = "transform: rotate(24deg); margin-top: 6px;"; 
                            }
                        }

                        contenedorFlecha.innerHTML = `
                            <span style="font-size:8px; font-weight:bold; background:#e0f0f8; color:#0b415b; padding:3px 6px; border:2px solid #222; border-radius:5px; white-space:nowrap; text-transform:uppercase; text-align:center; box-shadow: 1px 1px 0px #000;">${metodoTexto}</span>
                            <span style="font-size:22px; font-weight:bold; color:#222; display:inline-block; ${rotacionEstilo}">➔</span>
                        `;
                        filaFila.appendChild(contenedorFlecha);

                        const subArbolHijo = generarEstructuraArbol(hijoNodo);
                        filaFila.appendChild(subArbolHijo);
                        columnaRamasHijas.appendChild(filaFila);
                    });

                    bloqueEtapa.appendChild(columnaRamasHijas);
                }

                return bloqueEtapa;
            }

            const arbolCompleto = generarEstructuraArbol(chainDataBase);
            const wrapperCentrado = document.createElement('div');
            wrapperCentrado.style.display = "flex";
            wrapperCentrado.style.flexDirection = "column";
            wrapperCentrado.style.justifyContent = "center";
            wrapperCentrado.style.alignItems = "center";
            wrapperCentrado.style.width = "100%";
            wrapperCentrado.style.height = "auto";
            wrapperCentrado.appendChild(arbolCompleto);
            
            chainBox.appendChild(wrapperCentrado);
        }

    } catch (error) {
        console.error("Error al construir la sección evolutiva:", error);
        const chainBox = document.getElementById('evolutionChainBox');
        if (chainBox) chainBox.innerHTML = `<span style="font-size:9px; color:#cc3333;">ERROR AL MAPEAR MATRIZ EVOLUTIVA</span>`;
    }
    
    function generarEstructuraArbol(nodo) {
    const urlPartes = nodo.species.url.split('/');
    const idRealEspecie = urlPartes[urlPartes.length - 2];
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idRealEspecie}.png`;

    // Contenedor principal de esta etapa
    const bloqueEtapa = document.createElement('div');
    bloqueEtapa.className = "evolution-node";

    // Tarjeta del Pokémon
    const pkmCard = document.createElement('div');
    pkmCard.className = "pkm-evolution-card";
    
    // ... (Aquí iría tu lógica de click / evento, tal como la tenías)

    pkmCard.innerHTML = `
        <img src="${spriteUrl}" alt="${nodo.species.name}" style="width:80px; height:80px; image-rendering:pixelated;">
        <span style="font-size:10px; font-weight:bold; text-transform:uppercase;">${nodo.species.name}</span>
    `;
    bloqueEtapa.appendChild(pkmCard);

    // Si tiene evoluciones, las procesamos recursivamente
    if (nodo.evolves_to && nodo.evolves_to.length > 0) {
        const columnaHijos = document.createElement('div');
        columnaHijos.style.display = "flex";
        columnaHijos.style.flexDirection = "column";
        columnaHijos.style.gap = "10px";

        nodo.evolves_to.forEach(hijoNodo => {
            const subArbol = generarEstructuraArbol(hijoNodo);
            columnaHijos.appendChild(subArbol);
        });

        bloqueEtapa.appendChild(columnaHijos);
    }

    return bloqueEtapa;
}
}