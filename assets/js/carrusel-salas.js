document.addEventListener("DOMContentLoaded", function () {
    const carrusel = document.getElementById("carrusel-salas");
    if (!carrusel) return;

    const contenedor = carrusel.closest(".carrusel-contenedor");
    const anterior = contenedor.querySelector(".flecha-anterior");
    const siguiente = contenedor.querySelector(".flecha-siguiente");

    const originales = Array.from(carrusel.querySelectorAll(".etapa"));
    const cantidad = originales.length;

    if (cantidad < 2) return;

    // Copias para conseguir un recorrido circular
    originales.forEach(tarjeta => {
        carrusel.appendChild(tarjeta.cloneNode(true));
    });

    const copiasAnteriores = originales.map(tarjeta => tarjeta.cloneNode(true));
    copiasAnteriores.forEach(tarjeta => {
        carrusel.insertBefore(tarjeta, carrusel.firstChild);
    });

    let posicion = cantidad;
    let intervalo = null;
    let ocupado = false;
    let arrastrando = false;
    let inicioX = 0;
    let desplazamientoX = 0;
    let pausaPorCursor = false;
    let pausaPorFoco = false;

    function anchoPaso() {
        const tarjeta = carrusel.querySelector(".etapa");
        const espacio = parseFloat(getComputedStyle(carrusel).gap) || 0;
        return tarjeta.getBoundingClientRect().width + espacio;
    }

    function actualizar(animar = true) {
        carrusel.style.transition = animar ? "transform 0.5s ease" : "none";
        carrusel.style.transform =
            `translateX(${-posicion * anchoPaso() + desplazamientoX}px)`;
    }

    function detener() {
        clearInterval(intervalo);
        intervalo = null;
    }

    function iniciar() {
        detener();

        if (
            arrastrando ||
            pausaPorCursor ||
            pausaPorFoco ||
            document.hidden
        ) {
            return;
        }

        intervalo = setInterval(function () {
            if (!ocupado && !arrastrando) {
                avanzar(1);
            }
        }, 2500);
    }

    function avanzar(direccion) {
        if (ocupado || arrastrando) return;

        ocupado = true;
        desplazamientoX = 0;
        posicion += direccion;
        actualizar(true);
    }

    // Reubicar de forma invisible al terminar el movimiento
    carrusel.addEventListener("transitionend", function (evento) {
        if (evento.propertyName !== "transform") return;

        if (posicion >= cantidad * 2) {
            posicion -= cantidad;
            actualizar(false);
        } else if (posicion < cantidad) {
            posicion += cantidad;
            actualizar(false);
        }

        ocupado = false;
    });

    anterior.addEventListener("click", function () {
        avanzar(-1);
        iniciar();
    });

    siguiente.addEventListener("click", function () {
        avanzar(1);
        iniciar();
    });

    // Pausar cuando el cursor está sobre el carrusel
    contenedor.addEventListener("mouseenter", function () {
        pausaPorCursor = true;
        detener();
    });

    contenedor.addEventListener("mouseleave", function () {
        pausaPorCursor = false;
        iniciar();
    });

    contenedor.addEventListener("focusin", function () {
        pausaPorFoco = true;
        detener();
    });

    contenedor.addEventListener("focusout", function (evento) {
        if (!contenedor.contains(evento.relatedTarget)) {
            pausaPorFoco = false;
            iniciar();
        }
    });

    // Arrastrar con mouse o dedo
    carrusel.addEventListener("pointerdown", function (evento) {
        if (evento.button !== 0 || ocupado) return;

        arrastrando = true;
        inicioX = evento.clientX;
        desplazamientoX = 0;

        detener();
        carrusel.classList.add("arrastrando");
        carrusel.setPointerCapture(evento.pointerId);
        actualizar(false);
    });

    carrusel.addEventListener("pointermove", function (evento) {
        if (!arrastrando) return;

        desplazamientoX = evento.clientX - inicioX;
        actualizar(false);
    });

    function terminarArrastre() {
        if (!arrastrando) return;

        const diferencia = desplazamientoX;
        arrastrando = false;
        desplazamientoX = 0;

        carrusel.classList.remove("arrastrando");

        if (Math.abs(diferencia) > 50) {
            avanzar(diferencia < 0 ? 1 : -1);
        } else {
            actualizar(true);
        }

        iniciar();
    }

    carrusel.addEventListener("pointerup", terminarArrastre);
    carrusel.addEventListener("pointercancel", terminarArrastre);

    // Ajustar posiciones cuando cambia el tamaño de pantalla
    window.addEventListener("resize", function () {
        ocupado = false;
        actualizar(false);
    });

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) detener();
        else iniciar();
    });

    actualizar(false);
    iniciar();
});