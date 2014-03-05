'use strict';
(function(window) {
  var elemPanel = document.getElementById('panel'),
    elemMenu = document.getElementById('menu'),
    oframes = [];

  function add(evt) {
    var oframe = document.createElement('div'),
      closeBtn = document.createElement('div'),
      iframe = document.createElement('iframe'),
      protocol = window.location.protocol,
      port = window.location.port ? (':' + window.location.port) : '';
    if (evt.target.id === '3D') {
      iframe.src =
        protocol + '//crystalskull.gaiamobile.org' + port + '/index.html';
    } else if (evt.target.id === '2D') {
      iframe.src =
        protocol + '//mobile-html5-gaming-test.gaiamobile.org' +
        port + '/index.html';
    } else if (evt.target.id === 'B3D') {
      iframe.src =
        protocol + '//bunnymark-easel.gaiamobile.org' +
        port + '/index.html';
    } else if (evt.target.id === 'B2D') {
      iframe.src =
        protocol + '//bunnymark-easel.gaiamobile.org' +
        port + '/index.html?c2d=1';
    } else { // click on something else
      return;
    }
    iframe.className = 'browser-tab app-frame';
    iframe.setAttribute('mozbrowser', true);
    iframe.setAttribute('remote', true);
    closeBtn.textContent = '[X]';
    closeBtn.className = 'frame-close-button';
    oframe.className = 'oframe';
    oframe.id = 'id-' + (+new Date());
    oframe.appendChild(iframe);
    oframe.appendChild(closeBtn);
    oframes.push({
      id: oframe.id,
      oframe: oframe
    });
    adjustAllOframeWidth();
    elemPanel.appendChild(oframe);
  }

  function adjustAllOframeWidth() {
    var percentage = (oframes && oframes.length > 1) ? 49 : 99;
    oframes.forEach(function(value) {
      var oframe = value.oframe;
      oframe.style.width = percentage + '%';
    });
  }

  function panelClickHandler(evt) {
    var oframeToRemove;

    if (evt.target.classList.contains('frame-close-button')) {
      oframeToRemove = evt.target.parentElement;
      oframeToRemove.remove();
      try {
        oframes.forEach(function(value, index) {
          if (value.id === oframeToRemove.id) {
            oframes.splice(index, 1);
            throw {};
          }
        });
      } catch (e) {
      }
      adjustAllOframeWidth();
    }
  }

  elemMenu.addEventListener('click', add);
  elemPanel.addEventListener('click', panelClickHandler);
}(window));
