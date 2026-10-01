(function () {
  'use strict';

  var temporizador = 0;
  var observador = null;

  function limpiarTexto(valor) {
    return String(valor || '')
      .replace(/\s+/g, ' ')
      .replace(/^Curso\s*[:\-]\s*/i, '')
      .trim();
  }

  function esNombreUtil(texto) {
    if (!texto || texto.length < 2) return false;
    return !/^(nombre del curso|curso|inicio|área personal|mis cursos|bloques)$/i.test(texto);
  }

  function textoDeElemento(elemento) {
    if (!elemento || elemento.closest('.unemi-portada-auto')) return '';
    var texto = limpiarTexto(elemento.textContent);
    return esNombreUtil(texto) ? texto : '';
  }

  function obtenerNombreCurso() {
    /* Selectores del tema Space utilizado en las aulas UNEMI. */
    var selectores = [
      'h1.rui-main-content-title--h1.page-header-headings',
      'h1.page-header-headings',
      'h1.rui-main-content-title--h1',
      '#page-header .page-header-headings',
      '#page-header h1',
      '[data-region="page-header"] h1',
      '.page-context-header h1',
      '.rui-title-container',
      'main h1',
      '[role="main"] h1'
    ];

    for (var i = 0; i < selectores.length; i++) {
      var elementos = document.querySelectorAll(selectores[i]);
      for (var j = 0; j < elementos.length; j++) {
        var texto = textoDeElemento(elementos[j]);
        if (texto) return texto;
      }
    }

    var metaTitulo = document.querySelector('meta[property="og:title"]');
    if (metaTitulo) {
      var tituloMeta = limpiarTexto(metaTitulo.getAttribute('content'));
      if (esNombreUtil(tituloMeta)) return tituloMeta;
    }

    var tituloDocumento = limpiarTexto(document.title)
      .replace(/\s*[|–—]\s*(Moodle|UNEMI|Capacitación Docente).*$/i, '')
      .trim();

    return esNombreUtil(tituloDocumento) ? tituloDocumento : '';
  }

  function actualizarPortadas() {
    var portadas = document.querySelectorAll('.unemi-portada-auto');
    if (!portadas.length) return false;

    var nombreCurso = obtenerNombreCurso();
    if (!nombreCurso) return false;

    var actualizado = false;
    for (var i = 0; i < portadas.length; i++) {
      var titulo = portadas[i].querySelector('[data-course-title]');
      if (titulo && limpiarTexto(titulo.textContent) !== nombreCurso) {
        titulo.textContent = nombreCurso;
        actualizado = true;
      }
    }
    return actualizado;
  }

  function programarActualizacion() {
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(actualizarPortadas, 80);
  }

  function iniciar() {
    actualizarPortadas();
    window.setTimeout(actualizarPortadas, 250);
    window.setTimeout(actualizarPortadas, 800);
    window.setTimeout(actualizarPortadas, 1800);
    window.setTimeout(actualizarPortadas, 4000);

    if (!observador && document.documentElement) {
      observador = new MutationObserver(programarActualizacion);
      observador.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }

  window.addEventListener('load', actualizarPortadas);
  window.addEventListener('popstate', programarActualizacion);
  window.addEventListener('hashchange', programarActualizacion);

  /* Permite forzar una actualización desde la consola si el tema cambia. */
  window.UNEMIPortada = {
    actualizar: actualizarPortadas,
    obtenerNombreCurso: obtenerNombreCurso
  };
})();
